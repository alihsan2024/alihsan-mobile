import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { getMetalPrices, MetalPrices } from "../services/api";

export interface ZakatAmounts {
  cash: number;
  bank: number;
  unit: "AUD" | "USD";
  silver: Array<{
    key: string;
    karat: string;
    unit: "gram" | "ounce";
    weight: number;
    value: number;
    name?: string;
  }>;
  gold: Array<{
    key: string;
    karat: string;
    unit: "gram" | "ounce";
    weight: number;
    value: number;
    name?: string;
  }>;
  investmentProfit: number;
  shareResale: number;
  merchandise: number;
  loan: number;
  other: number;
}

interface ZakatContextType {
  step: number;
  amounts: ZakatAmounts;
  prices: MetalPrices | null;
  pricesLoading: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateAmount: (name: keyof ZakatAmounts, value: any) => void;
  updateMetal: (type: "gold" | "silver", metal: any) => void;
  removeMetal: (type: "gold" | "silver", key: string) => void;
  reset: () => void;
  loadPrices: () => Promise<void>;
  calculateWealth: () => number;
  calculateZakat: () => number;
  calculateNisab: () => { silver: number; gold: number };
}

const ZakatContext = createContext<ZakatContextType | undefined>(undefined);

export const useZakat = () => {
  const context = useContext(ZakatContext);
  if (!context) {
    throw new Error("useZakat must be used within a ZakatProvider");
  }
  return context;
};

const initialAmounts: ZakatAmounts = {
  cash: 0,
  bank: 0,
  unit: "AUD",
  silver: [],
  gold: [],
  investmentProfit: 0,
  shareResale: 0,
  merchandise: 0,
  loan: 0,
  other: 0,
};

interface ZakatProviderProps {
  children: ReactNode;
}

export const ZakatProvider: React.FC<ZakatProviderProps> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [amounts, setAmounts] = useState<ZakatAmounts>(initialAmounts);
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setPricesLoading(true);
    try {
      const metalPrices = await getMetalPrices();
      console.log("Loaded metal prices:", metalPrices);
      // Only set prices if we have valid data
      if (metalPrices && (metalPrices.goldPriceInUsd > 0 || metalPrices.silverFinePriceInUsd > 0)) {
        setPrices(metalPrices);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          console.warn(`Metal prices are invalid or zero, retrying... (${retryCountRef.current}/${maxRetries})`);
          // Retry after a short delay
          setTimeout(() => {
            loadPrices();
          }, 2000);
        } else {
          console.error("Failed to load metal prices after max retries");
          // Set prices anyway so the UI can show something (even if 0)
          setPrices(metalPrices);
          retryCountRef.current = 0;
        }
      }
    } catch (error) {
      console.error("Error loading metal prices:", error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        // Retry after error
        setTimeout(() => {
          loadPrices();
        }, 3000);
      } else {
        console.error("Failed to load metal prices after max retries");
        retryCountRef.current = 0;
      }
    } finally {
      setPricesLoading(false);
    }
  };

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const updateAmount = (name: keyof ZakatAmounts, value: any) => {
    setAmounts((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateMetal = (type: "gold" | "silver", metal: any) => {
    setAmounts((prev) => {
      const arrayToUpdate = [...prev[type]];
      const existingIndex = arrayToUpdate.findIndex(
        (item) => item.key === metal.key
      );

      if (existingIndex !== -1) {
        arrayToUpdate[existingIndex] = metal;
      } else {
        arrayToUpdate.push(metal);
      }

      return {
        ...prev,
        [type]: arrayToUpdate,
      };
    });
  };

  const removeMetal = (type: "gold" | "silver", key: string) => {
    setAmounts((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.key !== key),
    }));
  };

  const reset = () => {
    setStep(1);
    setAmounts(initialAmounts);
  };

  const calculateWealth = (): number => {
    const totalSilver = amounts.silver.reduce((sum, item) => sum + item.value, 0);
    const totalGold = amounts.gold.reduce((sum, item) => sum + item.value, 0);

    return (
      amounts.cash +
      amounts.bank +
      totalSilver +
      totalGold +
      amounts.investmentProfit +
      amounts.shareResale +
      amounts.merchandise +
      amounts.loan +
      amounts.other
    );
  };

  const calculateNisab = (): { silver: number; gold: number } => {
    if (!prices) return { silver: 0, gold: 0 };

    // Check if prices are valid (not 0 or undefined)
    if (
      !prices.silverFinePriceInUsd ||
      !prices.goldPriceInUsd ||
      !prices.goldPriceInAud ||
      prices.silverFinePriceInUsd === 0 ||
      prices.goldPriceInUsd === 0 ||
      prices.goldPriceInAud === 0
    ) {
      return { silver: 0, gold: 0 };
    }

    const nisabSilver = 612.36 * prices.silverFinePriceInUsd;
    const nisabGold = 87.48 * prices.goldPriceInUsd;

    const usdToUnit = (amount: number) => {
      if (amounts.unit === "AUD") {
        const conversionRate = prices.goldPriceInUsd / prices.goldPriceInAud;
        if (conversionRate === 0 || !isFinite(conversionRate)) {
          return 0;
        }
        return amount / conversionRate;
      }
      return amount;
    };

    const silverNisab = usdToUnit(nisabSilver);
    const goldNisab = usdToUnit(nisabGold);

    return {
      silver: isFinite(silverNisab) && !isNaN(silverNisab) ? silverNisab : 0,
      gold: isFinite(goldNisab) && !isNaN(goldNisab) ? goldNisab : 0,
    };
  };

  const calculateZakat = (): number => {
    if (!prices) return 0;

    // Check if prices are valid
    if (
      !prices.silverFinePriceInUsd ||
      !prices.goldPriceInUsd ||
      !prices.goldPriceInAud ||
      prices.silverFinePriceInUsd === 0 ||
      prices.goldPriceInUsd === 0 ||
      prices.goldPriceInAud === 0
    ) {
      return 0;
    }

    const wealth = calculateWealth();
    const nisab = calculateNisab();

    const usdToUnit = (amount: number) => {
      if (amounts.unit === "AUD") {
        const conversionRate = prices.goldPriceInUsd / prices.goldPriceInAud;
        if (conversionRate === 0 || !isFinite(conversionRate)) {
          return 0;
        }
        return amount / conversionRate;
      }
      return amount;
    };

    const nisabSilver = 612.36 * prices.silverFinePriceInUsd;
    const nisabSilverInUnit = usdToUnit(nisabSilver);

    if (!isFinite(nisabSilverInUnit) || isNaN(nisabSilverInUnit)) {
      return 0;
    }

    const zakatableAmount =
      parseFloat(nisabSilverInUnit.toString()) < parseFloat(wealth.toString())
        ? wealth / 40
        : 0;

    return isFinite(zakatableAmount) && !isNaN(zakatableAmount) ? zakatableAmount : 0;
  };

  const value: ZakatContextType = {
    step,
    amounts,
    prices,
    pricesLoading,
    setStep,
    nextStep,
    prevStep,
    updateAmount,
    updateMetal,
    removeMetal,
    reset,
    loadPrices,
    calculateWealth,
    calculateZakat,
    calculateNisab,
  };

  return (
    <ZakatContext.Provider value={value}>{children}</ZakatContext.Provider>
  );
};

