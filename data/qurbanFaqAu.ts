/**
 * FAQ copy aligned with AU Next.js `src/components/Qurban/qurbanFaqItems.jsx`.
 */
export type QurbanFaqItemAu = {
  question: string;
  paragraphs: string[];
  bullets?: string[];
  /** Show WhatsApp channel button after body (AU FAQ item). */
  showWhatsappCta?: boolean;
};

export const QURBAN_FAQ_AU: QurbanFaqItemAu[] = [
  {
    question: "Who is required to give Qurban?",
    paragraphs: [
      "Qurban is required for eligible Muslims who meet the nisab threshold (minimum level of wealth). This typically includes adults who have savings beyond their basic needs.",
    ],
  },
  {
    question: "When should I give my Qurban?",
    paragraphs: [
      "You should give your Qurban before Eid al-Adha so it can be carried out within the prescribed days of Dhul Hijjah. Donating early helps ensure timely preparation and fulfilment.",
    ],
  },
  {
    question: "When is Eid al-Adha 2026 in Australia?",
    paragraphs: [
      "Eid al-Adha in 2026 is expected to fall on Wednesday, 27 May or Thursday, 28 May 2026, depending on the sighting of the Dhul Hijjah crescent moon.",
      "Islamic dates follow the lunar calendar, so the exact day may vary by location and whether local or global moon sighting is followed.",
    ],
  },
  {
    question: "What is the deadline to donate Qurban for 2026?",
    paragraphs: [
      "Qurban must be carried out after the Eid prayer on the 10th of Dhul Hijjah and before sunset on the 13th.",
      "To ensure your Qurban is completed on time, we recommend donating before Eid begins.",
    ],
  },
  {
    question: "Which countries does Al-Ihsan distribute Qurban to?",
    paragraphs: [
      "Al-Ihsan delivers Qurban across multiple countries, including India, Chad, Uganda, Congo, Pakistan, Kenya, Cameroon, Bangladesh, Sri Lanka, Egypt, Lebanon, and Türkiye.",
      "Each location is carefully selected based on need, and distribution is carried out with care and accountability.",
    ],
  },
  {
    question: "Can I donate more than one share of Qurban?",
    paragraphs: [
      "Yes. The Prophet Muhammad ﷺ offered more than one Qurban:",
      "This is known as the Prophetic Qurban. It is a beautiful Sunnah to revive and an opportunity for extra reward.",
      "You may also give Qurban on behalf of deceased relatives or as voluntary charity, in addition to your personal obligation.",
    ],
    bullets: ["One for himself", "One on behalf of the Ummah"],
  },
  {
    question: "What happens if I donate after the deadline?",
    paragraphs: [
      "If a Qurban donation is received after the valid days of Dhul Hijjah, it cannot be carried out as Qurban.",
      "In this case, your donation may be redirected towards general charity or other programs, depending on your preference.",
    ],
  },
  {
    question: "Is your charity registered and regulated?",
    paragraphs: [
      "Yes. Al-Ihsan Foundation is a registered Australian charity and operates in accordance with relevant regulations and standards.",
      "We are committed to transparency, accountability, and responsible delivery of all charitable programs.",
    ],
  },
  {
    question: "How do I know my Qurban has been completed?",
    paragraphs: [
      "We provide updates via:",
      "Check your group and country pairing on our campaign platform.",
    ],
    bullets: [
      "Social media posts for each group (A, B, C, D, E)",
      "Email/SMS (where applicable)",
    ],
    showWhatsappCta: true,
  },
  {
    question: "Is my Qurban donation tax-deductible in Australia?",
    paragraphs: [
      "Yes. Al-Ihsan Foundation is a registered Australian charity with Deductible Gift Recipient (DGR) status. All donations of $2 or more are tax deductible in Australia.",
    ],
  },
];
