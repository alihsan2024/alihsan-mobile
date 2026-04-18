import type { StoryPayload } from "@/utils/api";
import type { Story } from "./mockStories";

/**
 * Convert a raw API payload into the mobile Story shape.
 * The only field added here is `duration_ms` for the viewer's progress-bar
 * timing. Images get a fixed 5s; videos get 15s (can be refined once the
 * backend exposes an actual duration column).
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
    duration_ms: s.media_type === "video" ? 15000 : 5000,
  };
}
