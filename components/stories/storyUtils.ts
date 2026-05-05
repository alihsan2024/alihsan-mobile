import type { StoryPayload } from "@/utils/api";
import type { Story } from "./mockStories";

/** Each story “section” in the viewer progress row is at most this long (videos are split). */
export const STORY_SEGMENT_MS = 5000;

/**
 * Splits a total duration into segments of {@link STORY_SEGMENT_MS}, with the last segment taking any remainder.
 */
export function getSegmentDurationsMs(totalMs: number): number[] {
  const t = Math.max(0, totalMs);
  if (t === 0) return [STORY_SEGMENT_MS];
  const n = Math.max(1, Math.ceil(t / STORY_SEGMENT_MS));
  const out: number[] = [];
  let remaining = t;
  for (let i = 0; i < n; i++) {
    const seg =
      i === n - 1 ? remaining : Math.min(STORY_SEGMENT_MS, remaining);
    out.push(seg);
    remaining -= seg;
  }
  return out;
}

/**
 * Convert a raw API payload into the mobile Story shape.
 * `duration_ms` is used only as a fallback until video metadata loads in the viewer.
 * Images use a fixed 5s; videos use measured duration at playback time.
 */
export function apiToStory(s: StoryPayload): Story {
  return {
    id: String(s.id),
    title: s.title,
    caption: s.caption,
    media_url: s.media_url,
    media_type: s.media_type,
    thumbnail_url: s.thumbnail_url ?? undefined,
    cta_label: s.cta_label,
    cta_url: s.cta_url,
    campaign_tag: s.campaign_tag,
    published_at: s.published_at,
    duration_ms: s.media_type === "video" ? undefined : STORY_SEGMENT_MS,
  };
}
