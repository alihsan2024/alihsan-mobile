import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { initAuth } from "@/store/reduxSlice/authenticationSlice";
import SplashScreen from "@/components/ui/SplashScreen";

/**
 * Dispatches initAuth to load token from SecureStore, then renders children
 * only once auth state is ready. Prevents flash of login screen for authenticated users.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const isReady = useSelector((state: { authentication: { isReady: boolean } }) => state.authentication?.isReady ?? false);

  useEffect(() => {
    dispatch(initAuth() as any);
  }, [dispatch]);

  if (!isReady) {
    return (
      <View style={{ backgroundColor: "#000", flex: 1 }}>
        <SplashScreen />
      </View>
    );
  }

  return <>{children}</>;
}
