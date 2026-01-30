import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Shimmer animation component
const Shimmer = ({ style }: { style: any }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <Animated.View
        style={[
          {
            flex: 1,
            opacity,
            backgroundColor: "#E5E7EB",
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
            backgroundColor: "#FFFFFF",
          },
        ]}
      />
    </View>
  );
};

// Skeleton text component
const SkeletonText = ({
  width: w,
  height = 16,
  style,
}: {
  width: number | string;
  height?: number;
  style?: any;
}) => (
  <Shimmer
    style={[
      {
        width: w,
        height,
        borderRadius: 4,
      },
      style,
    ]}
  />
);

// Skeleton box component
const SkeletonBox = ({
  width: w,
  height: h,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => (
  <Shimmer
    style={[
      {
        width: w,
        height: h,
        borderRadius,
      },
      style,
    ]}
  />
);

export default function CampaignLoadingScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section Skeleton */}
        <View style={[styles.heroContainer, { paddingTop: insets.top }]}>
          {/* Back Button Skeleton */}
          <View style={styles.backButtonSkeleton}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
          </View>

          {/* Hero Image Skeleton */}
          <SkeletonBox
            width="100%"
            height={320}
            borderRadius={0}
            style={styles.heroImageSkeleton}
          />

          {/* Hero Text Skeleton */}
          <View style={styles.heroTextContainer}>
            <SkeletonText width="60%" height={40} style={styles.heroTitleSkeleton} />
            <SkeletonText width="80%" height={28} style={{ marginTop: 8 }} />
            <SkeletonText width="50%" height={16} style={{ marginTop: 12 }} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title Skeleton */}
          <SkeletonText width="85%" height={28} style={styles.titleSkeleton} />
          <SkeletonText width="70%" height={16} style={{ marginTop: 8 }} />

          {/* Progress Section Skeleton */}
          <View style={styles.progressSection}>
            <SkeletonText width="40%" height={24} style={styles.amountSkeleton} />
            <SkeletonText width="50%" height={14} style={{ marginTop: 4 }} />
            
            {/* Progress Bar Skeleton */}
            <View style={styles.progressBarContainer}>
              <SkeletonBox
                width="65%"
                height={6}
                borderRadius={3}
                style={styles.progressBar}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section Header Skeleton */}
          <View style={styles.sectionHeader}>
            <SkeletonText width={120} height={20} />
            <SkeletonBox width={20} height={20} borderRadius={10} />
          </View>

          {/* Content Text Skeletons */}
          <View style={styles.contentTextContainer}>
            <SkeletonText width="100%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonText width="100%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonText width="95%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonText width="90%" height={16} />
          </View>

          <View style={styles.divider} />

          {/* Impact Section Skeleton */}
          <View style={styles.sectionHeader}>
            <SkeletonText width={100} height={20} />
            <SkeletonBox width={20} height={20} borderRadius={10} />
          </View>

          {/* Donation Form Skeleton */}
          <View style={styles.donationFormSkeleton}>
            <SkeletonText width="60%" height={18} style={{ marginBottom: 16 }} />
            
            {/* Amount Buttons Skeleton */}
            <View style={styles.amountButtonsRow}>
              <SkeletonBox width="32%" height={48} borderRadius={10} />
              <SkeletonBox width="32%" height={48} borderRadius={10} />
              <SkeletonBox width="32%" height={48} borderRadius={10} />
            </View>

            {/* Custom Amount Input Skeleton */}
            <SkeletonBox
              width="100%"
              height={48}
              borderRadius={10}
              style={{ marginTop: 14 }}
            />

            {/* Donate Button Skeleton */}
            <SkeletonBox
              width="100%"
              height={48}
              borderRadius={12}
              style={[
                styles.donateButtonSkeleton,
                { marginTop: 16 },
              ]}
            />

            {/* Monthly Checkbox Skeleton */}
            <View style={styles.checkboxRow}>
              <SkeletonBox width={18} height={18} borderRadius={4} />
              <SkeletonText width={180} height={14} style={{ marginLeft: 8 }} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Donations List Skeleton */}
          <SkeletonText width={100} height={18} style={{ marginBottom: 16 }} />
          
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.donationRowSkeleton}>
              <SkeletonBox width={28} height={28} borderRadius={14} />
              <View style={styles.donationInfoSkeleton}>
                <SkeletonText width="40%" height={16} style={{ marginBottom: 4 }} />
                <SkeletonText width="30%" height={12} />
              </View>
              <SkeletonText width="25%" height={16} />
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: "relative",
  },
  backButtonSkeleton: {
    position: "absolute",
    top: 54,
    left: 16,
    zIndex: 10,
  },
  heroImageSkeleton: {
    marginTop: 0,
  },
  heroTextContainer: {
    position: "absolute",
    bottom: 22,
    left: 16,
    right: 16,
  },
  heroTitleSkeleton: {
    marginBottom: 4,
  },
  content: {
    padding: 16,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  amountSkeleton: {
    marginBottom: 4,
  },
  progressBarContainer: {
    marginTop: 14,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
    marginLeft: -16,
    marginRight: -16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  contentTextContainer: {
    marginTop: 8,
  },
  donationFormSkeleton: {
    backgroundColor: "#F2F6FF",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  amountButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  donateButtonSkeleton: {
    backgroundColor: "#FFD602",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  donationRowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  donationInfoSkeleton: {
    flex: 1,
    marginLeft: 10,
  },
});
