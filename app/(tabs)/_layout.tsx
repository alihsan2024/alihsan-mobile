import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Home from "../../assets/home.svg";
import Compass from "../../assets/compass.svg";
import HandsHolding from "../../assets/hands-holding.svg";
import User from "../../assets/user.svg";

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

const SvgTabIcon = ({
  Icon,
  focused,
  size = 22,
}: {
  Icon: React.FC<any>;
  focused: boolean;
  size?: number;
}) => {
  const color = focused ? "#4F6EF7" : "#9CA3AF";

  return (
    <View style={[styles.tabItem, { marginTop: 8 }]}>
      <Icon width={size} height={size} color={color} />
    </View>
  );
};

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
          // Shadow for iOS
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          // Shadow for Android
          elevation: 12,
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
            <SvgTabIcon Icon={Home} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={Compass} focused={focused} />
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
                position: "relative",
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
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="zakat-calculator"
        options={{
          title: "Zakat",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={HandsHolding} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarIcon: ({ focused }) => (
            <SvgTabIcon Icon={User} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="signup"
        options={{
          href: null,
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
  badge: {
    position: "absolute",
    top: 18,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
