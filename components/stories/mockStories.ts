// Dummy story data. Shape mirrors the `stories` table in
// alihsan.org.au-backend/db/migrations/create-stories.sql so swapping
// mock data for a real API response later is a drop-in change.

export type StoryMediaType = "image" | "video";

export type Story = {
  id: string;
  title?: string | null;
  caption?: string | null;
  media_url: string;
  media_type: StoryMediaType;
  thumbnail_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  campaign_tag?: string | null;
  /** ISO timestamp — drives the 24-hour Featured bubble. Null for drafts. */
  published_at: string | null;
  /** Fixed duration for images in ms. Videos use their natural duration capped at 60s. */
  duration_ms?: number;
};

export type StoryCategory = {
  slug: string; // matches Story.campaign_tag
  label: string; // human-readable ring label
  order: number; // display order in the ring row
};

/**
 * Registry of story categories. Keep labels short — they render under a
 * 72px ring bubble. The backend's campaign_tag maps 1:1 to `slug` here.
 */
export const STORY_CATEGORIES: StoryCategory[] = [
  { slug: "emergency-2026", label: "Emergency", order: 1 },
  { slug: "ramadan-2026", label: "Ramadan", order: 2 },
  { slug: "water-2026", label: "Water Wells", order: 3 },
  { slug: "sponsorship", label: "Sponsorship", order: 4 },
  { slug: "eye-project", label: "Gift of Sight", order: 5 },
];

// Helpers used to pick a published_at timestamp so mock data exercises
// the "last 24 hours" Featured bubble logic without hard-coding dates.
const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const MOCK_STORIES: Story[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Sri Lanka Flood",
    caption: "Families are displaced by rising waters. Your help reaches them today.",
    media_url:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/media/1765499530018-alihsan-Sri%20Lanka%20Flood.jpeg",
    media_type: "image",
    thumbnail_url:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/media/1765499530018-alihsan-Sri%20Lanka%20Flood.jpeg",
    cta_label: "Donate Now",
    cta_url: "/campaign/sri-lanka-flood",
    campaign_tag: "emergency-2026",
    published_at: hoursAgo(3),
    duration_ms: 5000,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Ramadan Sadaqah",
    caption: "A single meal. A single blessing. Multiply it this Ramadan.",
    media_url:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/Ramadan+sadaqah+2+16x9.mp4",
    media_type: "video",
    thumbnail_url:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/dac1a675d19a0d43be37299aebb6dd02.jpg",
    cta_label: "Give Sadaqah",
    cta_url: "/campaign/ramadan",
    campaign_tag: "ramadan-2026",
    published_at: hoursAgo(8),
    duration_ms: 15000,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Water Wells",
    caption: "Clean water for communities who've waited too long.",
    media_url:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1080&q=80",
    media_type: "image",
    thumbnail_url:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=300&q=80",
    cta_label: "Build a Well",
    cta_url: "/campaign/water-wells",
    campaign_tag: "water-2026",
    published_at: hoursAgo(36), // older than 24h — not in Featured
    duration_ms: 5000,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Orphan Sponsorship",
    caption: "Consistency changes a life. Become a monthly sponsor.",
    media_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    media_type: "video",
    thumbnail_url:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=80",
    cta_label: "Sponsor an Orphan",
    cta_url: "/orphans-list",
    campaign_tag: "sponsorship",
    published_at: hoursAgo(18),
    duration_ms: 15000,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Gift of Sight",
    caption: "A 10-minute surgery restores a lifetime of vision.",
    media_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080&q=80",
    media_type: "image",
    thumbnail_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&q=80",
    cta_label: "Restore Sight",
    cta_url: "/campaign/eye-project",
    campaign_tag: "eye-project",
    published_at: hoursAgo(50), // older than 24h
    duration_ms: 5000,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Emergency Appeal",
    caption: "Every second counts. Tap to see how your donation moves now.",
    media_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    media_type: "video",
    thumbnail_url:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=80",
    cta_label: "Respond Now",
    cta_url: "/campaign/emergency",
    campaign_tag: "emergency-2026",
    published_at: hoursAgo(1),
    duration_ms: 15000,
  },
];

/**
 * Stories published within the given window (default 24h), newest first.
 * Used by the Featured bubble next to the banner search.
 * `published_at` can be null for stories that haven't been published yet —
 * those are excluded.
 */
export function getRecentStories(
  stories: Story[],
  hours: number = 24
): Story[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return [...stories]
    .filter((s) => {
      if (!s.published_at) return false;
      return new Date(s.published_at).getTime() >= cutoff;
    })
    .sort(
      (a, b) =>
        new Date(b.published_at ?? 0).getTime() -
        new Date(a.published_at ?? 0).getTime()
    );
}

/**
 * Stories grouped by campaign category, ordered per STORY_CATEGORIES.
 * Categories with no stories are omitted. Stories whose campaign_tag
 * doesn't match any registered category are silently skipped.
 */
export function getStoriesGroupedByCategory(
  stories: Story[]
): Array<{
  category: StoryCategory;
  stories: Story[];
}> {
  const groups = new Map<string, Story[]>();
  for (const story of stories) {
    const key = story.campaign_tag ?? "uncategorized";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(story);
  }
  return STORY_CATEGORIES.filter((c) => groups.has(c.slug))
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      stories: (groups.get(category.slug) ?? []).sort(
        (a, b) =>
          new Date(b.published_at ?? 0).getTime() -
          new Date(a.published_at ?? 0).getTime()
      ),
    }));
}
