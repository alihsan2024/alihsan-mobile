import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import Constants from "expo-constants";
import Logo from "@/assets/logo.svg";
import { logoutUser } from "@/store/reduxSlice/authenticationSlice";
import LogoutConfirmationModal from "@/components/ui/Modals/LogoutConfirmationModal";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/utils/notificationPreference";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_W;
const OPEN_MS = 260;
const CLOSE_MS = 200;
const SWIPE_CLOSE_THRESHOLD = 120;

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  requiresAuth?: boolean;
};

const ACCOUNT_ITEMS: MenuItem[] = [
  { icon: "heart-outline", label: "My Donations", route: "/user-donations", requiresAuth: true },
  { icon: "flame-outline", label: "Campaigns", route: "/(tabs)/campaigns" },
  { icon: "people-outline", label: "Sponsor an Orphan", route: "/orphans-list" },
  { icon: "cart-outline", label: "Cart", route: "/(tabs)/cart" },
];

const SUPPORT_ITEMS: MenuItem[] = [
  { icon: "help-circle-outline", label: "Help, policies & safety", route: "/help" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenu({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [mounted, setMounted] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // Load the notifications preference on mount
  useEffect(() => {
    getNotificationsEnabled().then(setNotifsEnabled);
  }, []);

  // Open / close animations driven by the `visible` prop
  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Refresh notifications pref every time the drawer opens, in case
      // it was changed from settings elsewhere.
      getNotificationsEnabled().then(setNotifsEnabled);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: OPEN_MS, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: OPEN_MS, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slide, { toValue: -DRAWER_WIDTH, duration: CLOSE_MS, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: CLOSE_MS, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Swipe-left on the drawer closes it.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const next = Math.max(-DRAWER_WIDTH, Math.min(0, g.dx));
        slide.setValue(next);
        backdrop.setValue(1 + next / DRAWER_WIDTH);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_CLOSE_THRESHOLD || g.vx < -0.4) {
          onClose();
        } else {
          Animated.parallel([
            Animated.spring(slide, { toValue: 0, useNativeDriver: true, bounciness: 0 }),
            Animated.spring(backdrop, { toValue: 1, useNativeDriver: true, bounciness: 0 }),
          ]).start();
        }
      },
    })
  ).current;

  const navigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), CLOSE_MS - 20);
  };

  const handleSignOut = () => {
    setLogoutOpen(false);
    onClose();
    setTimeout(() => dispatch(logoutUser()), CLOSE_MS);
  };

  const toggleNotifs = (value: boolean) => {
    setNotifsEnabled(value);
    setNotificationsEnabled(value);
  };

  const displayName = isAuthenticated
    ? [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Welcome back"
    : "";
  const initials = (() => {
    if (!isAuthenticated) return "";
    const first = (user?.firstName ?? "").charAt(0);
    const last = (user?.lastName ?? "").charAt(0);
    return (first + last).toUpperCase() || "A";
  })();

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouch} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slide }] }]}
        {...pan.panHandlers}
      >
        {/* Header: logo left, subtle close button right */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <Logo width={132} height={36} />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={10}
            accessibilityLabel="Close menu"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Identity */}
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={() => navigate("/(tabs)/profile")}
              activeOpacity={0.9}
              style={styles.identityShadowWrap}
            >
              <LinearGradient
                colors={["#2F7CE9", "#1F56B8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.identityCard}
              >
                <View style={styles.identityAvatar}>
                  <Text style={styles.identityAvatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.identityName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <View style={styles.identityMetaRow}>
                    <Text style={styles.identityMeta}>View profile</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={12}
                      color="rgba(255,255,255,0.85)"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.guestCard}>
              <Text style={styles.guestTitle}>Join Al-Ihsan</Text>
              <Text style={styles.guestBody}>
                Sign in to track your donations and manage sponsorships.
              </Text>
              <View style={styles.guestButtons}>
                <TouchableOpacity
                  onPress={() => navigate("/login")}
                  style={[styles.guestBtn, styles.guestBtnPrimary]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestBtnPrimaryText}>Log in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigate("/signup")}
                  style={[styles.guestBtn, styles.guestBtnGhost]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestBtnGhostText}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Account section */}
          <SectionHeading>Menu</SectionHeading>
          <View style={styles.menuGroup}>
            {ACCOUNT_ITEMS.filter(
              (i) => !i.requiresAuth || isAuthenticated
            ).map((item, idx, arr) => (
              <MenuRow
                key={item.route}
                icon={item.icon}
                label={item.label}
                onPress={() => navigate(item.route)}
                isLast={idx === arr.length - 1}
              />
            ))}
          </View>

          {/* Preferences — notifications toggle */}
          <SectionHeading>Preferences</SectionHeading>
          <View style={styles.menuGroup}>
            <View style={styles.toggleRow}>
              <View style={styles.menuIconBox}>
                <Ionicons
                  name={notifsEnabled ? "notifications-outline" : "notifications-off-outline"}
                  size={19}
                  color="#2161CD"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>Notifications</Text>
                <Text style={styles.menuSub}>
                  {notifsEnabled
                    ? "Receive updates on campaigns and stories"
                    : "You won't get push alerts"}
                </Text>
              </View>
              <Switch
                value={notifsEnabled}
                onValueChange={toggleNotifs}
                trackColor={{ false: "#E5E7EB", true: "#2161CD" }}
                thumbColor="#fff"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>

          {/* Support */}
          <SectionHeading>Support</SectionHeading>
          <View style={styles.menuGroup}>
            {SUPPORT_ITEMS.map((item, idx, arr) => (
              <MenuRow
                key={item.route}
                icon={item.icon}
                label={item.label}
                onPress={() => navigate(item.route)}
                isLast={idx === arr.length - 1}
              />
            ))}
          </View>

          {/* Sign out */}
          {isAuthenticated && (
            <TouchableOpacity
              onPress={() => setLogoutOpen(true)}
              style={styles.signOut}
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={17} color="#DC2626" />
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            Al-Ihsan Foundation · v{appVersion}
          </Text>
        </ScrollView>
      </Animated.View>

      <LogoutConfirmationModal
        visible={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleSignOut}
      />
    </Modal>
  );
}

/* ─────────────────────────── Subcomponents ─────────────────────────── */

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

function MenuRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.menuRow, !isLast && styles.menuRowDivider]}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={19} color="#2161CD" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

/* ──────────────────────────────── Styles ───────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 12, 28, 0.5)",
  },
  backdropTouch: { flex: 1 },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FBFCFE",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 22,
  },

  /* Identity — logged in */
  identityShadowWrap: {
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#1F56B8",
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  identityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  identityAvatarText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  identityName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  identityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  identityMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },

  /* Guest card */
  guestCard: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  guestBody: {
    fontSize: 13,
    color: "#5B6478",
    marginTop: 6,
    lineHeight: 19,
  },
  guestButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  guestBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guestBtnPrimary: { backgroundColor: "#2161CD" },
  guestBtnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "AlbertSans_700Bold",
  },
  guestBtnGhost: {
    borderWidth: 1.5,
    borderColor: "#2161CD",
    backgroundColor: "#fff",
  },
  guestBtnGhostText: {
    color: "#2161CD",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "AlbertSans_700Bold",
  },

  /* Section labels */
  sectionHeading: {
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#8A94A6",
    textTransform: "uppercase",
    fontFamily: "AlbertSans_700Bold",
  },

  /* Menu groups */
  menuGroup: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF1F5",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF4FE",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "#101828",
    fontWeight: "600",
    fontFamily: "AlbertSans_500Medium",
  },
  menuSub: {
    fontSize: 11.5,
    color: "#8A94A6",
    marginTop: 2,
  },

  /* Toggle row */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
  },

  /* Sign out */
  signOut: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  signOutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "AlbertSans_700Bold",
  },

  /* Footer */
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "AlbertSans_500Medium",
  },
});
