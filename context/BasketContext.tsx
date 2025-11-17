import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getBasketItems,
  addToBasket,
  updateBasketItem,
  removeFromBasket,
  bulkAddToBasket,
  BasketItem,
  AddToBasketRequest,
} from "../services/api";
import { useAuth } from "./AuthContext";

interface BasketContextType {
  items: BasketItem[];
  isLoading: boolean;
  itemCount: number;
  totalAmount: number;
  addItem: (item: AddToBasketRequest) => Promise<void>;
  updateItem: (item: AddToBasketRequest) => Promise<void>;
  removeItem: (campaignId: number, donationItem?: string) => Promise<void>;
  clearBasket: () => Promise<void>;
  refreshBasket: () => Promise<void>;
  addItemLocal: (item: BasketItem) => void;
  removeItemLocal: (campaignId: number) => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};

interface BasketProviderProps {
  children: ReactNode;
}

export const BasketProvider: React.FC<BasketProviderProps> = ({ children }) => {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load basket items on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshBasket();
    } else {
      // Load from local storage if not authenticated
      loadLocalBasket();
    }
  }, [isAuthenticated]);

  const loadLocalBasket = async () => {
    try {
      const localBasket = await AsyncStorage.getItem("localBasket");
      if (localBasket) {
        setItems(JSON.parse(localBasket));
      }
    } catch (error) {
      console.error("Error loading local basket:", error);
    }
  };

  const saveLocalBasket = async (basketItems: BasketItem[]) => {
    try {
      await AsyncStorage.setItem("localBasket", JSON.stringify(basketItems));
    } catch (error) {
      console.error("Error saving local basket:", error);
    }
  };

  const refreshBasket = async () => {
    if (!isAuthenticated) {
      loadLocalBasket();
      return;
    }

    setIsLoading(true);
    try {
      const basketItems = await getBasketItems();
      setItems(basketItems);
      await saveLocalBasket(basketItems);
    } catch (error) {
      console.error("Error refreshing basket:", error);
      // Fallback to local storage
      loadLocalBasket();
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: AddToBasketRequest) => {
    if (isAuthenticated) {
      try {
        await addToBasket(item);
        await refreshBasket();
      } catch (error: any) {
        throw error;
      }
    } else {
      // Add to local storage
      const newItem: BasketItem = {
        ...item,
        quantity: item.quantity || 1,
        total: item.amount * (item.quantity || 1),
      };
      addItemLocal(newItem);
    }
  };

  const updateItem = async (item: AddToBasketRequest) => {
    if (isAuthenticated) {
      try {
        await updateBasketItem(item);
        await refreshBasket();
      } catch (error: any) {
        throw error;
      }
    } else {
      // Update local storage
      const updatedItems = items.map((existingItem) =>
        existingItem.campaignId === item.campaignId
          ? {
              ...existingItem,
              ...item,
              total: item.amount * (item.quantity || 1),
            }
          : existingItem
      );
      setItems(updatedItems);
      await saveLocalBasket(updatedItems);
    }
  };

  const removeItem = async (campaignId: number, donationItem?: string) => {
    if (isAuthenticated) {
      try {
        await removeFromBasket(campaignId, donationItem);
        await refreshBasket();
      } catch (error: any) {
        throw error;
      }
    } else {
      // Remove from local storage
      removeItemLocal(campaignId);
    }
  };

  const addItemLocal = (item: BasketItem) => {
    const existingIndex = items.findIndex(
      (i) => i.campaignId === item.campaignId
    );

    let updatedItems: BasketItem[];
    if (existingIndex >= 0) {
      // Update existing item
      updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: (updatedItems[existingIndex].quantity || 1) + 1,
        total:
          updatedItems[existingIndex].amount *
          ((updatedItems[existingIndex].quantity || 1) + 1),
      };
    } else {
      // Add new item
      updatedItems = [...items, item];
    }

    setItems(updatedItems);
    saveLocalBasket(updatedItems);
  };

  const removeItemLocal = (campaignId: number) => {
    const updatedItems = items.filter((item) => item.campaignId !== campaignId);
    setItems(updatedItems);
    saveLocalBasket(updatedItems);
  };

  const clearBasket = async () => {
    if (isAuthenticated) {
      // Remove all items from server
      for (const item of items) {
        try {
          await removeFromBasket(item.campaignId, item.donationItem);
        } catch (error) {
          console.error("Error removing item:", error);
        }
      }
    }
    setItems([]);
    await AsyncStorage.removeItem("localBasket");
  };

  const itemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const value: BasketContextType = {
    items,
    isLoading,
    itemCount,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    clearBasket,
    refreshBasket,
    addItemLocal,
    removeItemLocal,
  };

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
};

