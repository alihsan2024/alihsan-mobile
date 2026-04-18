import * as VideoThumbnails from "expo-video-thumbnails";

// Module-level cache so thumbnails survive re-renders and are shared between
// StoryRing, FeaturedStoryBubble, and StoryViewer.
const cache = new Map<string, string>();
const inFlight = new Set<string>();

// Simple pub-sub so UI components re-render when a new thumbnail lands.
type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * Subscribe to thumbnail cache updates. Returns an unsubscribe function.
 * Use inside a useEffect so the subscription is cleaned up on unmount.
 */
export function subscribeToThumbnails(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Kick off a background thumbnail extraction for a video URL.
 * Safe to call multiple times — deduped by URL.
 * Notifies all subscribers when the thumbnail is ready.
 */
export function prefetchVideoThumbnail(videoUrl: string): void {
  if (cache.has(videoUrl) || inFlight.has(videoUrl)) return;
  inFlight.add(videoUrl);
  VideoThumbnails.getThumbnailAsync(videoUrl, { time: 0 })
    .then(({ uri }) => {
      cache.set(videoUrl, uri);
      listeners.forEach((l) => l());
    })
    .catch(() => {
      // Silently ignore — poster just won't show for this video.
    })
    .finally(() => {
      inFlight.delete(videoUrl);
    });
}

/**
 * Returns the cached first-frame URI for a video, or null if not yet ready.
 */
export function getVideoThumbnail(videoUrl: string): string | null {
  return cache.get(videoUrl) ?? null;
}
