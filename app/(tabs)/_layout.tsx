import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import { useBasket } from "../../context/BasketContext";

// Simple icon component using emoji/text to avoid font loading issues
const TabIcon = ({
  emoji,
  focused,
  color,
  badge,
}: {
  emoji: string;
  focused: boolean;
  color: string;
  badge?: number;
}) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconEmoji, { opacity: focused ? 1 : 0.5 }]}>
      {emoji}
    </Text>
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
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="❤️" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              emoji="🛒"
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
            <TabIcon emoji="👤" focused={focused} color={color} />
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
  iconEmoji: {
    fontSize: 24,
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
