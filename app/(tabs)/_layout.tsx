import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

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

export default function TabsLayout() {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  useEffect(() => {
    if (!isAuthenticated) {
      AsyncStorage.getItem("guestBasket").then((data) => {
        setGuestBasket(data ? JSON.parse(data) : []);
      });
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        AsyncStorage.getItem("guestBasket").then((data) => {
          setGuestBasket(data ? JSON.parse(data) : []);
        });
      }
    }, [isAuthenticated])
  );
  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;
  const itemCount = basketItems.reduce(
    (sum: number, item: any) => sum + (item.quantity || 1),
    0
  );

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
          height: Platform.OS === "ios" ? 80 : 60, // taller for iOS to include safe area
          borderTopWidth: 0,
          elevation: 0, // remove shadow on Android
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
              badge={itemCount}
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
