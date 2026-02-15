/**
 * Secure Storage Utility
 * 
 * Uses expo-secure-store for sensitive data (tokens, auth data)
 * Falls back to AsyncStorage for non-sensitive data
 * 
 * IMPORTANT: Install expo-secure-store first:
 * npm install expo-secure-store
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Dynamically import expo-secure-store to handle cases where it might not be installed
let SecureStore: typeof import("expo-secure-store") | null = null;

try {
  SecureStore = require("expo-secure-store");
} catch (error) {
  if (__DEV__) {
    console.warn(
      "expo-secure-store not found. Install it with: npm install expo-secure-store\n" +
      "Falling back to AsyncStorage for sensitive data (NOT SECURE)."
    );
  }
}

// Keys for sensitive data that should use secure storage
const SENSITIVE_KEYS = [
  "authData",
  "loggedIn",
  "checkoutDetails", // Contains clientSecret and paymentIntentId
];

/**
 * Store data securely or in regular storage based on key
 */
export const secureSetItem = async (key: string, value: string): Promise<void> => {
  try {
    if (SENSITIVE_KEYS.includes(key)) {
      if (SecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback to AsyncStorage if expo-secure-store is not available
        // This is NOT secure but prevents app crashes
        if (__DEV__) {
          console.warn(
            `Storing sensitive key "${key}" in AsyncStorage. Install expo-secure-store for secure storage.`
          );
        }
        await AsyncStorage.setItem(key, value);
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`Error storing ${key}:`, error);
    }
    throw error;
  }
};

/**
 * Retrieve data from secure or regular storage
 */
export const secureGetItem = async (key: string): Promise<string | null> => {
  try {
    if (SENSITIVE_KEYS.includes(key)) {
      if (SecureStore) {
        return await SecureStore.getItemAsync(key);
      } else {
        // Fallback to AsyncStorage if expo-secure-store is not available
        return await AsyncStorage.getItem(key);
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`Error retrieving ${key}:`, error);
    }
    return null;
  }
};

/**
 * Remove data from secure or regular storage
 */
export const secureRemoveItem = async (key: string): Promise<void> => {
  try {
    if (SENSITIVE_KEYS.includes(key)) {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        // Fallback to AsyncStorage if expo-secure-store is not available
        await AsyncStorage.removeItem(key);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`Error removing ${key}:`, error);
    }
    throw error;
  }
};

/**
 * Clear all data (both secure and regular storage)
 * Use with caution - this will clear all app data
 */
export const secureClear = async (): Promise<void> => {
  try {
    // Clear secure storage items
    if (SecureStore) {
      for (const key of SENSITIVE_KEYS) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          // Ignore errors for keys that don't exist
        }
      }
    }
    // Clear regular storage
    await AsyncStorage.clear();
  } catch (error) {
    if (__DEV__) {
      console.error("Error clearing storage:", error);
    }
    throw error;
  }
};
