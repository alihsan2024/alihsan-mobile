import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Image as ExpoImage } from "expo-image";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInIcon}>👤</Text>
        <Text style={styles.notLoggedInText}>You are not logged in</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profileImage ? (
            <ExpoImage
              source={{ uri: user.profileImage }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || "U"}
                {user?.lastName?.[0] || ""}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❤️</Text>
          <Text style={styles.menuText}>My Donations</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#264B8B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  notLoggedInContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  notLoggedInIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  notLoggedInText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#264B8B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 24,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
  },
  chevron: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fcc",
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d32f2f",
  },
});

