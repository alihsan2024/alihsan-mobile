import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
} from "@/store/reduxSlice/api/basketApi";

const { width, height } = Dimensions.get("window");

const GAZA_CAMPAIGN = {
  id: 188,
  name: "Gaza",
  checkoutType: "COMMON",
  coverImage:
    "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1753249055468-alihsan-coverImage.png",
};

type ProgressModalProps = {
  visible: boolean;
  onClose: () => void;
  image: any;
  title: string;
  raised: number;
  goal: number;
};

export const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  onClose,
  image,
  title,
  raised,
  goal,
}) => {
  const progress = Math.min(raised / goal, 1);

  // ===== Animation values =====
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  // ===== Auth & basket =====
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      AsyncStorage.getItem("guestBasket").then((data) => {
        setGuestBasket(data ? JSON.parse(data) : []);
      });
    }
  }, [isAuthenticated]);

  // ===== Animate modal =====
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ===== Donate handler (SAME AS HOME) =====
  const handleDonate = async () => {
    const donationAmount = 50; // default Gaza amount (same assumption as Home)

    const basketItems = isAuthenticated
      ? basketData?.payload ?? []
      : guestBasket;

    const isInCart = basketItems.some(
      (item: any) => item.campaignId === GAZA_CAMPAIGN.id
    );

    if (isInCart) {
      Alert.alert("Already in cart", "This campaign is already in your cart.", [
        {
          text: "View Cart",
          onPress: () => {
            onClose();
            router.push("/(tabs)/cart");
          },
        },
        { text: "OK", style: "cancel" },
      ]);
      return;
    }

    const basketItem = {
      campaignId: GAZA_CAMPAIGN.id,
      amount: donationAmount,
      quantity: 1,
      name: GAZA_CAMPAIGN.name,
      coverImage: GAZA_CAMPAIGN.coverImage,
      checkoutType: GAZA_CAMPAIGN.checkoutType,
    };

    try {
      setAddingToCart(true);

      if (isAuthenticated) {
        await addToBasket({ body: basketItem });
      } else {
        const updated = [...guestBasket, basketItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }

      Alert.alert(
        "Added to cart",
        "Your donation has been added to the cart.",
        [
          {
            text: "View Cart",
            onPress: () => {
              onClose();
              router.push("/(tabs)/cart");
            },
          },
          { text: "OK", style: "cancel" },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {/* Image Background */}
          <ExpoImage source={image} style={styles.image} contentFit="cover" />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "#246BE1"]}
            end={{ x: 0, y: 0.5 }}
            start={{ x: 1, y: 0.5 }}
            style={styles.gradientOverlay}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Bottom Container */}
          <View style={styles.bottomContainer}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Gaza</Text>
              <Text style={styles.heroSubtitle}>is being Starved</Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.amount}>
                of ${goal.toLocaleString()} goal
              </Text>
              <Text style={styles.amount}>${raised.toLocaleString()}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>

            {/* Donate Button */}
            <Button
              label={addingToCart ? "Adding..." : "Donate Now"}
              variant="secondary"
              onPress={handleDonate}
              disabled={addingToCart}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#246BE1",
  },
  image: {
    width: "100%",
    height: height * 0.55,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: height * 0.55,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 4,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heroTextContainer: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 30,
    fontWeight: "500",
    color: "#fff",
  },
  amount: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 12,
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 5,
  },
});
