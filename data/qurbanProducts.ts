/**
 * Canonical Qurban 2026 slugs and catalogue rows — aligned with AU Next.js
 * `src/config/qurban2026Slugs.js` and `src/myPages/QurbanPage/index.jsx`.
 *
 * Mobile hub route: `/(tabs)/qurban-2026` (matches web `/qurban` / `/project/qurban-2026`).
 */

export const QURBAN_SLUGS = {
  groupA: "qurban-group-a-2026",
  groupB: "qurban-group-b-2026",
  groupC: "qurban-group-c-2026",
  groupD: "qurban-group-d-2026",
  groupETurkey: "qurban-group-e-turkey-2026",
  groupELebanon: "qurban-group-e-lebanon-2026",
  prophetic: "prophetic-qurban",
  trio: "trio-qurban-2026",
  hotMealsGaza: "hot-meals-gaza-qurban-2026",
  hotMealsGeneral: "hot-meals-general-qurban-2026",
  arafahIftar: "day-of-arafah-iftar-2026",
  eidGift: "eid-gifts-2026",
  eidGiftGaza: "eid-gifts-gaza-2026",
  riceBag: "rice-bag",
  qurbanProject: "qurban",
} as const;

export const QURBAN_HERO_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777975482827-alihsan-group-c.jpeg";

/** Day of Arafah Iftar — 30 meals (standard) vs Gaza 5 meals; matches AU `QurbanPage` options. */
export const ARAFAH_IF_STANDARD_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481186801-alihsan-Arafah_3.jpg";
export const ARAFAH_IF_GAZA_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481187066-alihsan-Arafah_4.jpg";

/** Group D — Most Needed Qurban (web `MOST_NEEDED_QURBAN_IMAGE`). */
export const MOST_NEEDED_QURBAN_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481841629-alihsan-Extended%20Relief%20Qurban_1.jpg";
/** Group E — Extended Relief Qurban (distribution: Türkiye vs Lebanon). */
export const EXTENDED_RELIEF_QURBAN_IMAGE_TURKEY =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481366644-alihsan-Extended%20Relief%20Qurban_4.jpg";
export const EXTENDED_RELIEF_QURBAN_IMAGE_LEBANON =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481366389-alihsan-Extended%20Relief%20Qurban_2.jpg";

export const PROPHETIC_QURBAN_BUNDLE_PRICE = 110;

export type QurbanMainProduct = {
  id: number;
  title: string;
  donationItem: string;
  slug: string;
  price: number;
  description: string;
  image: string;
};

/** AU `QuickAddToCart/productsData` — homepage Support Our Campaigns appeal (Group A). */
export const GROUP_A_HOME_APPEAL_TITLE = "Group A — Affordable Qurban";
export const GROUP_A_HOME_APPEAL_DESCRIPTION =
  "Entry-level Qurban share — fresh meat to families in India, carried out to Islamic standards.";
export const GROUP_A_HOME_POST_TEXT = "per share";

/** Primary tier cards (matches QurbanPage `products`). */
export const MAIN_QURBAN_PRODUCTS: QurbanMainProduct[] = [
  {
    id: 1,
    title: "Affordable Qurban",
    donationItem: "QURBAN A",
    slug: QURBAN_SLUGS.groupA,
    price: 55,
    description: "Group A — India",
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481057874-alihsan-Barokah%20Qurban_1.jpg",
  },
  {
    id: 2,
    title: "Crisis Qurban",
    donationItem: "QURBAN B",
    slug: QURBAN_SLUGS.groupB,
    price: 150,
    description: "Group B — Uganda",
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481495626-alihsan-Relief%20Qurbans_1.jpg",
  },
  {
    id: 3,
    title: "Emergency Qurban",
    donationItem: "QURBAN C",
    slug: QURBAN_SLUGS.groupC,
    price: 210,
    description: "Group C — Sri Lanka",
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481526511-alihsan-Uplift%20Qurban_3.jpg",
  },
  {
    id: 4,
    title: "Most Needed Qurban",
    donationItem: "QURBAN D",
    slug: QURBAN_SLUGS.groupD,
    price: 420,
    description: "Group D — Lebanon, Egypt (Gaza refugees)",
    image: MOST_NEEDED_QURBAN_IMAGE,
  },
  {
    id: 7,
    title: "Extended Relief Qurban",
    donationItem: "QURBAN E",
    slug: QURBAN_SLUGS.groupETurkey,
    price: 750,
    description: "Group E — Türkiye or Lebanon",
    image: EXTENDED_RELIEF_QURBAN_IMAGE_TURKEY,
  },
];

export const GROUP_E_PRODUCT_ID = 7;

export type QurbanImpactTile = {
  id: number;
  title: string;
  donationItem: string;
  slug: string;
  price: number;
  image: string;
  postText?: string;
};

export const QURBAN_IMPACT_TILES: QurbanImpactTile[] = [
  {
    id: 1,
    title: "Food Pack",
    donationItem: "Food Pack",
    slug: QURBAN_SLUGS.qurbanProject,
    price: 70,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777974945276-alihsan-Sri%20Lanka%20Large.jpeg",
  },
  {
    id: 2,
    title: "Eid Gift",
    donationItem: "Eid Gift",
    slug: QURBAN_SLUGS.eidGift,
    price: 40,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777974848222-alihsan-Lebanon%201%20Large.jpeg",
  },
  {
    id: 5,
    title: "Eid Clothes — Gaza",
    donationItem: "Eid Clothes",
    slug: QURBAN_SLUGS.eidGiftGaza,
    price: 75,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777974847674-alihsan-Gaza%20Eid%20clothing%20Large.jpeg",
  },
  {
    id: 3,
    title: "30 Hot Meals",
    donationItem: "30 Hot Meals",
    slug: QURBAN_SLUGS.hotMealsGeneral,
    price: 90,
    image: ARAFAH_IF_STANDARD_IMAGE,
  },
  {
    id: 4,
    title: "25Kg Rice",
    donationItem: "25KG Rice Bag",
    slug: QURBAN_SLUGS.riceBag,
    price: 60,
    postText: "for 25kg",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/images/ricebag_qurban.jpg",
  },
];

export const QURBAN_TRIO = {
  title: "Qurban Trio",
  donationItem: "Qurban Trio",
  slug: QURBAN_SLUGS.trio,
  price: 280,
  description: "Fulfil a Sunnah • Feed the fasting • Gift a child",
  image:
    "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777975482827-alihsan-group-c.jpeg",
};

export const ARAFAH_IF_PRODUCT_ID = 5;

export const ARAFAH_IF_PRODUCT_BASE = {
  id: ARAFAH_IF_PRODUCT_ID,
  title: "Day of Arafah Iftar",
  donationItem: "30 Hot Meals",
  slug: QURBAN_SLUGS.arafahIftar,
  price: 90,
  description: "Feed the fasting — standard or Gaza option",
  image: ARAFAH_IF_STANDARD_IMAGE,
};

export const PROPHETIC_QURBAN_FEATURED = {
  location: "India",
  title: "Prophetic Qurban",
  body:
    "Follow the Sunnah of our beloved Prophet ﷺ — the Prophetic Qurban combines 2 Group A shares.",
  /** Same hero as Group A (Barakah / Affordable Qurban). */
  image:
    "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1778481057874-alihsan-Barokah%20Qurban_1.jpg",
  ctaLabel: "Fulfil Your Prophetic Qurban",
};
