import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type ProgressModalProps = {
  visible: boolean;
  onClose: () => void;
  image: any;
  title: string;
  raised: number;
  goal: number;
  onDonate?: () => void;
};

export const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  onClose,
  image,
  title,
  raised,
  goal,
  onDonate,
}) => {
  const progress = Math.min(raised / goal, 1);

  // ===== Animation values =====
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

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
            <Button label="Donate Now" variant="secondary" onPress={onDonate} />
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
