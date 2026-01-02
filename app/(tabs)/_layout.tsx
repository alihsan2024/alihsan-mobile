import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

/* ----------------------------------------------------
   Tab Icon
---------------------------------------------------- */

const TabIcon = ({
  name,
  color,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  badge?: number;
}) => (
  <View style={styles.iconContainer}>
    <Ionicons name={name} size={24} color={color} />
    {badge !== undefined && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
      </View>
    )}
  </View>
);

/* ----------------------------------------------------
   Tabs Layout
---------------------------------------------------- */

export default function TabsLayout() {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  /* ---------- Logged-in basket ---------- */
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  /* ---------- Guest basket ---------- */
  const [guestBasket, setGuestBasket] = useState<any[]>([]);

  /* ---------- Safe reader ---------- */
  const readGuestBasket = async () => {
    try {
      const data = await AsyncStorage.getItem("guestBasket");
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  /* ---------- Initial load ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      readGuestBasket().then(setGuestBasket);
    }
  }, [isAuthenticated]);

  /* ----------------------------------------------------
     🔥 CRITICAL FIX
     Poll AsyncStorage while Tabs are mounted
     (Tabs never remount, focus won't fire)
  ---------------------------------------------------- */

  useEffect(() => {
    if (isAuthenticated) return;

    const interval = setInterval(async () => {
      const latest = await readGuestBasket();
      setGuestBasket(latest);
    }, 1000); // 1 second (lightweight & safe)

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /* ---------- Source of truth ---------- */
  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  /* ---------- Badge count ---------- */
  const itemCount = Array.isArray(basketItems) ? basketItems.length : 0;

  /* ----------------------------------------------------
     UI
  ---------------------------------------------------- */

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#264B8B",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 80 : 60,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="cart"
              focused={focused}
              color={color}
              badge={itemCount > 0 ? itemCount : undefined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/* ----------------------------------------------------
   Styles
---------------------------------------------------- */

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -12,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
