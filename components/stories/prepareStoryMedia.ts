import { Image } from "expo-image";
import { createVideoPlayer } from "expo-video";
import { STORY_SEGMENT_MS } from "./storyUtils";

const PREPARE_TIMEOUT_MS = 45_000;

/** Bound in-memory cache so reopening the same story skips video probe / duplicate prefetch. */
const MAX_PREPARED_CACHE = 48;
const preparedByMediaKey = new Map<string, PreparedStoryMedia>();

function mediaCacheKey(story: {
  media_url: string;
  media_type: string;
}): string {
  return `${story.media_type}:${story.media_url}`;
}

function rememberPrepared(key: string, value: PreparedStoryMedia) {
  if (preparedByMediaKey.size >= MAX_PREPARED_CACHE) {
    const oldest = preparedByMediaKey.keys().next().value as string | undefined;
    if (oldest !== undefined) preparedByMediaKey.delete(oldest);
  }
  preparedByMediaKey.set(key, value);
}

/** Cleared when the stories feed is invalidated (pull-to-refresh / version bump). */
export function clearPreparedStoryMediaCache() {
  preparedByMediaKey.clear();
}

export type PreparedStoryMedia = {
  /** Progress tabs / segment timing for the viewer (image = one 5s segment). */
  durationMs: number;
};

/**
 * Preloads the first story’s media and ensures video is **readyToPlay** before opening.
 * Returns duration so segment tabs are correct on first paint.
 * Successful results are cached per media URL so closing and reopening the viewer is instant.
 */
export async function prepareStoryMediaReady(story: {
  media_url: string;
  media_type: "image" | "video";
  thumbnail_url?: string | null;
}): Promise<PreparedStoryMedia> {
  const key = mediaCacheKey(story);
  const cached = preparedByMediaKey.get(key);
  if (cached) return cached;

  const extras = [story.thumbnail_url].filter((u): u is string => !!u?.trim());
  if (extras.length) await Image.prefetch(extras);

  if (story.media_type === "image") {
    await Image.prefetch(story.media_url);
    const out = { durationMs: STORY_SEGMENT_MS };
    rememberPrepared(key, out);
    return out;
  }

  const durationMs = await waitForVideoReadyToPlay(story.media_url);
  const out = { durationMs };
  rememberPrepared(key, out);
  return out;
}

/**
 * Waits until the player reaches `readyToPlay` (buffered enough to start), then returns duration in ms.
 */
function waitForVideoReadyToPlay(uri: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const player = createVideoPlayer(uri);
    let done = false;
    let durationHintSec = 0;

    try {
      player.muted = true;
      player.play();
    } catch {
      /* decoding may still proceed */
    }

    const finish = (ok: boolean, durationSec: number, err?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        subSource.remove();
        subStatus.remove();
      } catch {
        /* noop */
      }
      try {
        player.release();
      } catch {
        /* noop */
      }
      if (ok) {
        const sec = durationSec > 0 ? durationSec : durationHintSec;
        const ms =
          sec > 0 ? Math.round(sec * 1000) : Math.max(STORY_SEGMENT_MS, 3000);
        resolve(ms);
      } else {
        reject(err ?? new Error("Video failed to load"));
      }
    };

    const timer = setTimeout(() => {
      finish(false, 0, new Error("Video load timed out"));
    }, PREPARE_TIMEOUT_MS);

    const subSource = player.addListener("sourceLoad", ({ duration }) => {
      if (duration > 0) durationHintSec = duration;
    });

    const subStatus = player.addListener("statusChange", ({ status, error }) => {
      if (status === "readyToPlay") {
        const sec =
          player.duration > 0 ? player.duration : durationHintSec;
        finish(true, sec);
      }
      if (status === "error") {
        finish(
          false,
          0,
          error?.message ? new Error(error.message) : new Error("Video error")
        );
      }
    });
  });
}
