import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { countriesList, getCountryByCode } from "@/utils/countries";

type PhoneInputProps = {
  label?: string;
  value: string;
  countryCode: string;
  onChangeText: (text: string) => void;
  onCountryChange: (code: string) => void;
  error?: string;
  editable?: boolean;
};

const PhoneInput = ({
  label,
  value,
  countryCode,
  onChangeText,
  onCountryChange,
  error,
  editable = true,
}: PhoneInputProps) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const selectedCountry = getCountryByCode(countryCode) || countriesList[0];
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showCountryPicker) {
      // Fade in background and slide up content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [showCountryPicker]);

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.countryButton, !editable && styles.disabled]}
          onPress={() => editable && setShowCountryPicker(true)}
          disabled={!editable}
        >
          <Text style={styles.countryCodeText}>
            {selectedCountry.dialCode}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          editable={editable}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.modalOverlayTouchable}
              activeOpacity={1}
              onPress={() => setShowCountryPicker(false)}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#010D26" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countriesList}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    countryCode === item.code && styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    onCountryChange(item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontFamily: "AlbertSans_400Regular",
    color: "#010D26",
  },
  container: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    minWidth: 90,
  },
  disabled: {
    backgroundColor: "#F3F4F6",
  },
  countryCodeText: {
    fontSize: 14,
    color: "#010D26",
    fontFamily: "AlbertSans_400Regular",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontFamily: "AlbertSans_400Regular",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlayTouchable: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  closeButton: {
    padding: 4,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  countryItemSelected: {
    backgroundColor: "#F0F4FF",
  },
  countryName: {
    fontSize: 14,
    color: "#010D26",
    fontFamily: "AlbertSans_400Regular",
  },
  countryDialCode: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
});

export default PhoneInput;
