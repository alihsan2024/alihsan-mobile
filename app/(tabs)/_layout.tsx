import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

const TabIcon = ({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={styles.tabItem}>
    <Ionicons name={name} size={22} color={focused ? "#4F6EF7" : "#9CA3AF"} />
  </View>
);

export default function TabsLayout() {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestBasket, setGuestBasket] = useState<any[]>([]);

  const readGuestBasket = async () => {
    try {
      const data = await AsyncStorage.getItem("guestBasket");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      readGuestBasket().then(setGuestBasket);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    const i = setInterval(async () => {
      const latest = await readGuestBasket();
      setGuestBasket(latest);
    }, 1000);
    return () => clearInterval(i);
  }, [isAuthenticated]);

  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  const itemCount = basketItems.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 68,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="compass" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "",
          tabBarLabel: () => null, // ✅ NO LABEL
          tabBarIcon: () => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 22,
              }}
            >
              <LinearGradient
                colors={["#246BE1", "#064DC3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  transform: [{ rotate: "45deg" }],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ transform: [{ rotate: "-45deg" }] }}>
                  <Ionicons name="cart" size={22} color="#fff" />
                </View>
              </LinearGradient>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="zakat-calculator"
        options={{
          title: "Zakat",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="hand-left" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
