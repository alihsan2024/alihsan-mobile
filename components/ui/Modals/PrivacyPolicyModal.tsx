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

const PRIVACY_SECTIONS = [
  {
    header: "Introduction",
    content: [
      "Al-Ihsan Foundation International Limited has always been committed to protecting your privacy. All information provided to us will remain confidential and protected in accordance to legislation. Personal information will be used as outlined below.",
    ],
  },
  {
    header: "What Information Do We Collect?",
    content: [
      "Al-Ihsan Foundation International Limited asks for information required for the stated purpose on our website and social medical platforms for the administration of that donation or subscription which you have nominated.",
      "Mandatory general information fields include full name, contact number Email Address and donation amount. Subscriptions would also ask and require the same standard personal information. We collect and store your bank account details strictly for the purpose of direct debit donations or donations via electronic fund transfers (EFT). Any other information you provide is by your discretion. Al-Ihsan Foundation International Limited does not store your card details. Card details are safeguarded by a secure connection with an encryption system and are not revealed for your protection. For the purpose of sponsoring an orphan we will require your information to conduct a National Police Check and a Working with Children Check.",
    ],
  },
  {
    header: "App & Third Party",
    content: [
      "This Privacy Policy explains how we collect, use, and disclose information about you when you use our mobile application (the \"App\").",
    ],
  },
  {
    header: "Information We Collect",
    content: [
      "We collect the information you provide directly to us when you use the App, such as your name, Email Address, and other contact information. In addition, we use Facebook and Google services to collect information about you. This includes:",
      "Facebook Login: If you choose to log in to our App using your Facebook account, we collect your public profile information, such as your name, profile picture, and Email Address.",
      "Facebook Analytics: We use Facebook Analytics to track how users interact with our App. This includes information about how long you use the App, which features you use, and how often you use them.",
      "Google Analytics: We use Google Analytics to track the usage of our App. This includes information about how long you use the App, which features you use, and how often you use them. Our analytics process involves gathering application metrics such as crash reports and performance reports. It's important to note that this information is completely anonymous and not associated with any particular user.",
    ],
  },
  {
    header: "How We Use Your Information",
    content: [
      "We use the information we collect to provide and improve the App, and to communicate with you about the App. We may also use the information we collect to:",
      "Personalize your experience with the App",
      "Send you promotional messages and other marketing communications",
      "Improve our products and services",
      "We may share your information with our partners, including Facebook and Google, for the purposes described in this Privacy Policy.",
    ],
  },
  {
    header: "Your Choices",
    content: [
      "You can choose not to provide us with certain information, but this may limit your ability to use certain features of the App. If you don't want us to collect information from Facebook or Google, you can opt out of these services by adjusting your settings on their respective websites.",
    ],
  },
  {
    header: "Data Deletion",
    content: [
      "You can request your data to be deleted by going to the following link.",
    ],
  },
  {
    header: "Security",
    content: [
      "We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee its absolute security.",
    ],
  },
  {
    header: "Changes To This Policy",
    content: [
      "We may update this Privacy Policy from time to time. If we make significant changes to the policy, we will notify you by email or by posting a notice in the App.",
    ],
  },
  {
    header: "How We Collect Your Information",
    content: [
      "Al-Ihsan Foundation International Limited needs your information in order to keep providing you with services, assistance and communications, and in order to achieve this, we need to collect information from you. Information requested and provided to us will be by means of:",
      "Phone call enquiries or donations",
      "Attending our office",
      "Contacting us through our website or social media",
      "Submitting an online donation form",
      "Fundraising events",
      "Making a pledge",
      "Subscriptions and authorizations",
      "Donation information submitted at an Al-Ihsan Foundation International Limited stall",
    ],
  },
  {
    header: "Why We Ask For Information",
    content: [
      "Al-Ihsan Foundation International Limited prefers to keep regular contact with its donors, build trust and relationships with donors and sponsors. Any information provided by you will also assist Al-Ihsan Foundation International Limited with maintaining and improving our relationship and communications with you, and to further develop our programs and campaigns. If you give us your Email Address, or other personal information by subscribing to one of our mailing lists, or registering for information, it will be used to send you information only on the subject area you have chosen. For your privacy, we will not subscribe you to additional lists, nor give your address to any third party, without your approval. We may note your communications with us for training purposes or dispute resolution or to assist you in the most effective way. Information requested and provided is strictly for the purpose of assisting us with:",
      "Verifying your identity",
      "Updating your details",
      "Processing donations, sponsorships, pledges, subscriptions and fundraising",
      "Ensuring any donations and sponsorships are delivered in accordance to your nominations (if applicable) and our campaign procedures and policies",
      "Communications with sponsored persons",
      "Any enquiries or contacting us",
      "Issuing receipts, statements and certificates",
      "National Police Check and Working with Children Check",
      "Maintaining accurate details of our supporters' history",
      "Keeping our supporters informed and updated of our work",
      "Assist in the development of our marketing and promotional activities",
      "You may at any time request to have your information preferences changed.",
    ],
  },
  {
    header: "Using And Disclosing Your Personal Information Cross-Border",
    content: [
      "Al-Ihsan Foundation International Limited has many programs, campaigns, partners and offices internationally. This correlates with our campaigns, donations and sponsorships. We shall firstly explain the process of service and obtain your written consent prior to any personal information required to be provided to an overseas recipient for the purpose of providing the service you have nominated. We may share part of your information with Al-Ihsan Foundation International Limited's global offices and affiliates. Your name, nominated name of donor, you contact number (in some programs) and possibly your Email Address will be provided to the office managers or service providers in the country where you have donated, paid for a construction of a shallow water well / deep water well, paid for a construction of a Masjid, or where your sponsored orphan lives so that they can write to you.",
      "This information is sent to and accessed only by the manager or service provider of Al-Ihsan Foundation International Limited in the relevant country. This does not alter or affect our commitment to safeguarding your privacy. Al-Ihsan Foundation International Limited has to abide by legislation, policies and procedures, of which are provided to overseas affiliates and external service providers to be adequate in safeguarding your personal information. Our external service providers are required to handle your personal information lawfully, carefully, and in accordance with our policies. The countries and territories in which we use, disclose and/or store supporter data are:",
      "Malaysia",
      "Indonesia",
      "Lebanon",
      "Niger",
      "Ethiopia",
      "Turkey",
      "Sri Lanka",
    ],
  },
  {
    header: "Information Safety",
    content: [
      "In some areas of the website, links to other sites such as sponsors can be found. These sites are not controlled by Al-Ihsan Foundation and therefore we cannot take responsibility for their content, claims of offer or privacy practices. Our website has enabled secure response forms to keep your personal and payment card details safe. Your browser shall advise you whether the information you are sending is encrypted or not secure by notifying you of a safety certificate for the website. Payment options for our online donations include PayPal, Stripe, Google Pay or Apple Pay.",
      "The information you supply will be linked to our website by your third-party payment option. However, no data from your third-party payment site will be stored on our website, and your card Payment Details are not revealed or stored on our website. Staff at Al-Ihsan Foundation International Limited are obliged and expected to keep personal and payment card information confidential and secure. Please note that whilst we endeavour to protect your privacy through legislation and policies, no data provided over the Internet can come with a guarantee to risk free or totally secure and therefore we cannot warrant the security of information you provide online to Al-Ihsan Foundation International Limited.",
    ],
  },
  {
    header: "Protection Of Young People",
    content: [
      "Al-Ihsan Foundation International Limited is very keen and diligent in safeguarding young people. Generally, if you are 18 or over, we will usually assume that you can make your own privacy decisions. However, if you are under 18, or do not have the mental capacity fit for making your own decisions, we shall confirm your decision with a parent or legal guardian. We also expect you be cautious of and be delicate with the images of children from our website and other social media. Please respect and uphold the trust of the consent given by parents, guardians or community leaders by not copying, sharing or misusing these images. Please refer to our online Safeguarding Policy.",
    ],
  },
  {
    header: "Policies & Legal Obligations",
    content: [
      "In viewing our website and social media or in participating in any donations or any programs associated with Al-Ihsan Foundation International Limited you have agreed to our Safeguarding Policy, Privacy Policy and Data Deletion Policy. Any policies which are published on our website are subject to change from time to time without notice. Al-Ihsan Foundation International Limited has, in the clause, provided you with sufficient notice of variation, and that you have accepted these terms. You understand that by giving us consent to disclose your information overseas, you may not be able to apply for reparation in the overseas jurisdiction if the overseas recipient handles information in breach of the Australian Privacy Principles and against our policies. This consent does not reduce our responsibilities and obligation to safeguard your privacy but it may waive our legal liability for any breaches of the Australian Privacy Principles by such overseas recipient. Whilst we have legislation, policies and procedures to safeguard your personal information, we cannot exclude disclosing your information only if and when served with a Court Order.",
    ],
  },
  {
    header: "Data Deletion Policy",
    content: [
      "Al-Ihsan Foundation International Limited believes in respecting your right to remove your information from our online database. You have the option and may remove your information by submitting your details into our Data Deletion Policy request and your acceptance to the policies. You shall receive a confirmation of your identity email from Al-Ihsan Foundation International Limited to confirm your option to delete your online data.",
    ],
  },
  {
    header: "Giving You Control",
    content: [
      "Al-Ihsan Foundation International Limited will provide you with the flexibility of viewing and accessing your partial information through your login on our website or Apple/ Android application. If you would like to know what information we hold about you or if you wish to correct or amend any personal information, please address our Complaints Officer at Al-Ihsan Foundation International Limited who will address your concerns promptly and rectify your concerns. When contacting us, please include the following information:",
      "Full Name, Telephone Number, Address and Email Address",
      "Al-Ihsan Foundation International Limited can be contacted by:",
      "Phone: 1300 998 444",
      "Email: info@alihsan.org.au",
      "Mail us at:",
      "Al-Ihsan Foundation International Limited",
      "PO Box 791",
    ],
  },
];

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
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
    return PRIVACY_SECTIONS.map((section, sectionIndex) => (
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
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
