import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Image Background */}
          <ExpoImage source={image} style={styles.image} contentFit="cover" />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "#246BE1"]}
            end={{ x: 0, y: 0.5 }} // left middle
            start={{ x: 1, y: 0.5 }} // right middle
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
        </View>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
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
