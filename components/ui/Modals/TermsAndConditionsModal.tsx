import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TERMS_SECTIONS = [
  {
    header: "Introduction",
    content: [
      "Use of this site is provided by Al-Ihsan Foundation International Limited is subject to the following Terms and Conditions. Your use constitutes acceptance of these Terms and Conditions as at the date of your first use of the site.",
    ],
  },
  {
    header: "What Information Do We Collect?",
    content: [
      "Al-Ihsan Foundation reserves the right to change these Terms and Conditions at any time by posting changes online. Your continued use of this site after changes are posted constitutes your acceptance of this agreement as modified.",
      "You agree to use this site only for lawful purposes, and in a manner that does not infringe the rights, or restrict, or inhibit the use and enjoyment of the site by any third party.",
      "Al-Ihsan Foundation does not warrant that the functions contained in the material in this site will be uninterrupted or error-free, that defects will be corrected, or that this site and the server that makes it available are free of viruses, bugs or represents the full functionality, accuracy and reliability of the materials.",
    ],
  },
  {
    header: "Content",
    content: [
      "Material on this site comes from a variety of sources and authors including staff members, volunteers, and supporters.",
      "This site and information, names, images, pictures, logos regarding or relating to Al-Ihsan Foundation are provided \"as is\", without any representation or endorsement made and without warranty of any kind whether expressed or implied. To the maximum extent permitted by law Al-Ihsan Foundation will not be liable for any damages including, without limitation, indirect or consequential damages, or any damages whatsoever arising from the use or in connection with such use or loss of use of the site, whether in contract or in negligence or otherwise.",
      "Al-Ihsan Foundation strives to keep the information stored on this site up to date, but cannot guarantee that the information provided is completely accurate. Any mistakes that are brought to our attention will be corrected as soon as possible.",
      "Use of the material on this site for educational purposes is encouraged. Al-Ihsan Foundation gives permission for articles, illustrations and other materials to be reproduced for educational use and fundraising purposes or personal use, provided the information is not changed, and that the source is acknowledged appropriately. Use of material on this website for purposes other than educational or personal use must have prior authorization by Al-Ihsan Foundation.",
      "In some cases the copyright for text or images on this site may be held by someone other than Al-Ihsan Foundation. All rights are reserved on such material and permission to use them must be requested from the copyright owner. The source of any such material will be indicated on the relevant sections of the site, along with a more restrictive copyright notice.",
      "Commercial use or publication of all or any item displayed is strictly prohibited without prior authorization from Al-Ihsan Foundation. Nothing contained herein shall be construed as conferring any licensee by Al-Ihsan Foundation to use any item displayed.",
    ],
  },
  {
    header: "Links",
    content: [
      "This site contains links to external web sites. Al-Ihsan Foundation takes no responsibility for the content of external internet sites, nor do links to such sites imply endorsement of the views expressed by the organizations or individuals responsible for them. External links are provided for sponsorship and informational purposes only.",
      "Al-Ihsan Foundation's logo must not be downloaded, copied and/or used for any purpose without the permission of Al-Ihsan Foundation.",
    ],
  },
  {
    header: "Your information",
    content: [
      "Please see the Privacy statement about how the information you provide will be used and stored.",
      "Any communication or material that you transmit to, or post on, any public area of the site including any data, questions, comments, suggestions, or the like, is, and will be treated as, non-confidential and non-proprietary information.",
    ],
  },
  {
    header: "General",
    content: [
      "If there is any conflict between these Terms and Conditions and rules and/or specific terms of use appearing on this site relating to specific material then the latter shall prevail.",
      "These terms and conditions shall be governed and construed in accordance with the laws of New South Wales. Any disputes shall be subject to the exclusive jurisdiction of the Courts of New South Wales.",
      "Excess target funds received for campaigns will be forwarded to similar relief projects.",
      "If these Terms and Conditions are not accepted in full, the use of this site must be terminated immediately.",
    ],
  },
  {
    header: "Refund Policy",
    content: [
      "As all contributions are in form of a donation, we are not usually able to give refunds for donations made through this site.",
      "Should a refund be issued, it is at Al-Ihsan Foundation's discretion, and queries must be raised within 28 days of payment.",
    ],
  },
];

export default function TermsAndConditionsModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Fade in backdrop and slide up content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out backdrop and slide down content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatContent = () => {
    return TERMS_SECTIONS.map((section, sectionIndex) => (
      <View key={`section-${sectionIndex}`} style={styles.section}>
        <Text style={styles.heading}>{section.header}</Text>
        {section.content.map((paragraph, paraIndex) => (
          <Text key={`para-${sectionIndex}-${paraIndex}`} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.container,
            {
              height: SCREEN_HEIGHT * 0.85,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={["#246BE1", "#064DC3"]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Terms and Conditions</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {formatContent()}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "AlbertSans_700Bold",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    maxHeight: "100%",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#010D26",
    marginTop: 24,
    marginBottom: 12,
    fontFamily: "AlbertSans_800ExtraBold",
    letterSpacing: -0.5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 12,
    fontFamily: "AlbertSans_400Regular",
  },
});
