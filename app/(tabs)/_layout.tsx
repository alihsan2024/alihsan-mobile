import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { useBasket } from "../../context/BasketContext";
import { Ionicons } from "@expo/vector-icons";

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
  const { itemCount } = useBasket();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#264B8B",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          position: "absolute",
          bottom: 10,
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
