import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

interface NetworkContextType {
  isConnected: boolean;
  isOnline: boolean;
  setNetworkStatus: (connected: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isOnline: true,
  setNetworkStatus: () => {},
});

// Global reference for API interceptor to update network status
let networkStatusSetter: ((connected: boolean) => void) | null = null;

export const setGlobalNetworkStatus = (connected: boolean) => {
  if (networkStatusSetter) {
    networkStatusSetter(connected);
  }
};

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<boolean>(true);
  const consecutiveFailuresRef = useRef<number>(0);

  const checkConnectivity = async () => {
    try {
      // Use a reliable endpoint with proper CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("https://www.google.com/generate_204", {
        method: "GET",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      
      // If we get any response (even 204), we're online
      if (response.status === 204 || response.ok) {
        consecutiveFailuresRef.current = 0;
        updateNetworkStatus(true);
      } else {
        throw new Error("Network check failed");
      }
    } catch (error) {
      consecutiveFailuresRef.current += 1;
      // Only mark as offline after 2 consecutive failures to prevent flickering
      if (consecutiveFailuresRef.current >= 2) {
        updateNetworkStatus(false);
      }
    }
  };

  const updateNetworkStatus = (connected: boolean) => {
    // Only update if status actually changed
    if (lastStatusRef.current === connected) {
      return;
    }

    // Debounce rapid status changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      lastStatusRef.current = connected;
      setIsConnected(connected);
      setIsOnline(connected);
    }, 500); // 500ms debounce
  };

  const setNetworkStatus = (connected: boolean) => {
    // Reset consecutive failures if we get a positive status from API
    if (connected) {
      consecutiveFailuresRef.current = 0;
    }
    updateNetworkStatus(connected);
  };

  // Set global reference for API interceptor
  useEffect(() => {
    networkStatusSetter = setNetworkStatus;
    return () => {
      networkStatusSetter = null;
    };
  }, []);

  useEffect(() => {
    // Initial check after a short delay to avoid false negatives on app start
    const initialTimeout = setTimeout(() => {
      checkConnectivity();
    }, 1000);

    // Check connectivity periodically
    const interval = setInterval(() => {
      checkConnectivity();
    }, 30000); // Check every 30 seconds (less frequent to reduce flickering)

    // Check when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Delay check when app becomes active to avoid false negatives
        setTimeout(() => {
          checkConnectivity();
        }, 500);
      }
    });

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      subscription.remove();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, isOnline, setNetworkStatus }}>
      {children}
    </NetworkContext.Provider>
  );
};
