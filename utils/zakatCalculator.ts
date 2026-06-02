/**
 * Zakat calculator helpers — aligned with AU web MetalModal (karat = price/g, ounce × 28.35).
 */

export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;
/** Troy-ounce factor used on alihsan.org.au Zakat MetalModal. */
export const OUNCE_TO_GRAM_FACTOR = 28.35;

export type GoldCaratPrice = { key: number; label: string; value: number };

export type ZakatAmounts = {
  cash?: number;
  bank?: number;
  gold?: { value?: number; weight?: number; unit?: string; karat?: string | number }[];
  silver?: { value?: number; weight?: number; unit?: string; karat?: string | number }[];
  investmentProfit?: number;
  shareResale?: number;
  merchandise?: number;
  loan?: number;
  other?: number;
};

export function areMetalPricesReady(prices: {
  loading?: boolean;
  price?: { goldPriceInAud?: number | string };
  silverFinePriceInAud?: number;
}): boolean {
  if (prices.loading) return false;
  const gold = Number(prices.price?.goldPriceInAud ?? 0);
  const silver = Number(prices.silverFinePriceInAud ?? 0);
  return gold > 0 && silver > 0;
}

export function computeNisabAud(
  goldPricePerGram24k: number,
  silverFinePricePerGram: number
) {
  const gold = goldPricePerGram24k > 0 ? GOLD_NISAB_GRAMS * goldPricePerGram24k : 0;
  const silver =
    silverFinePricePerGram > 0 ? SILVER_NISAB_GRAMS * silverFinePricePerGram : 0;
  return { goldNisabAud: gold, silverNisabAud: silver };
}

/**
 * Gold: `karat` is carat key (9–24), "1" / unset → 24K, or legacy web value (price per gram).
 */
export function resolveGoldPricePerGram(
  karat: string | number | undefined,
  goldCaratPrices: GoldCaratPrice[],
  fallback24k: number
): number {
  if (!fallback24k && !goldCaratPrices?.length) return 0;

  const raw = karat == null || karat === "" ? "24" : String(karat);
  if (raw === "1") {
    return goldCaratPrices.find((p) => p.key === 24)?.value ?? fallback24k;
  }

  const asNum = Number(raw);
  if (Number.isFinite(asNum) && asNum > 100) return asNum;

  const found = goldCaratPrices.find((p) => p.key === asNum);
  if (found?.value) return found.value;

  if (Number.isFinite(asNum) && asNum >= 9 && asNum <= 24 && fallback24k > 0) {
    return fallback24k * (asNum / 24);
  }

  return goldCaratPrices.find((p) => p.key === 24)?.value ?? fallback24k;
}

/** Silver: `karat` is "fine" | "sterling" (web parity). */
export function resolveSilverPricePerGram(
  karat: string | number | undefined,
  fineAud: number,
  sterlingAud: number
): number {
  if (karat === "sterling" && sterlingAud > 0) return sterlingAud;
  return fineAud;
}

/** value = weight × pricePerGram × (ounce ? 28.35 : 1) — matches AU web. */
export function calculateMetalValueAud(
  weight: number,
  unit: string,
  pricePerGram: number
): number {
  if (!weight || !pricePerGram || isNaN(weight) || isNaN(pricePerGram)) return 0;
  const ounceFactor = unit === "ounce" ? OUNCE_TO_GRAM_FACTOR : 1;
  const result = weight * pricePerGram * ounceFactor;
  return isNaN(result) ? 0 : result;
}

export function sumMetalValues(arr: { value?: number }[] = []): number {
  return arr.reduce((s, i) => {
    const value = i.value || 0;
    return s + (isNaN(value) ? 0 : value);
  }, 0);
}

export function computeTotalWealth(amounts: ZakatAmounts): number {
  const cash = isNaN(amounts.cash as number) ? 0 : amounts.cash || 0;
  const bank = isNaN(amounts.bank as number) ? 0 : amounts.bank || 0;
  const gold = sumMetalValues(amounts.gold);
  const silver = sumMetalValues(amounts.silver);
  const investmentProfit = isNaN(amounts.investmentProfit as number)
    ? 0
    : amounts.investmentProfit || 0;
  const shareResale = isNaN(amounts.shareResale as number) ? 0 : amounts.shareResale || 0;
  const merchandise = isNaN(amounts.merchandise as number) ? 0 : amounts.merchandise || 0;
  const loan = isNaN(amounts.loan as number) ? 0 : amounts.loan || 0;
  const other = isNaN(amounts.other as number) ? 0 : amounts.other || 0;

  const total =
    cash +
    bank +
    gold +
    silver +
    investmentProfit +
    shareResale +
    merchandise +
    loan +
    other;
  return isNaN(total) ? 0 : total;
}

/** Zakat due only when live prices are loaded and wealth exceeds silver nisab (AU web rule). */
export function computeZakatDue(
  totalWealth: number,
  silverNisabAud: number,
  pricesReady: boolean
): number {
  if (!pricesReady || silverNisabAud <= 0) return 0;
  if (totalWealth <= silverNisabAud) return 0;
  const zakat = totalWealth / 40;
  return isNaN(zakat) ? 0 : zakat;
}

export type ZakatFooterStatus = "loading_prices" | "empty" | "below_nisab" | "due";

export function getZakatFooterStatus(
  totalWealth: number,
  zakat: number,
  pricesReady: boolean
): ZakatFooterStatus {
  if (!pricesReady) return "loading_prices";
  if (totalWealth <= 0) return "empty";
  if (zakat <= 0) return "below_nisab";
  return "due";
}
