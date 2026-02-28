import React, { use, useEffect, useState } from "react";
import api from "@/utils/api";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { getCountryCoordinates } from "@/utils/countryCoordinates";
import { useDispatch, useSelector } from "react-redux";
import { fetchDonationProjectById } from "@/store/reduxSlice/donationProjectSlice";
import { AppDispatch } from "@/store/store";

export interface MediaType {
  id: number;
  type: string;
  url: string;
  caption: string;
}

export interface StatusLogType {
  id: number;
  status: string;
  note: string;
  createdAt: string;
}

export interface ProjectDetailsType {
  type: string;
  projectStatus: string;
  country: string;
  orderId: string;
  createdAt: string;
  donationItem: string;
  donation?: {
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  behalfOf?: string;
  namePlaque?: string;
  specialRequest?: string;
  notes?: string;
  pageViews?: number;
  media: MediaType[];
  latestStatusLog: StatusLogType[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <Feather name="check-circle" size={18} color="#22c55e" />;
    case "IN_PROGRESS":
      return <Feather name="activity" size={18} color="#3b82f6" />;
    case "PENDING":
      return <Feather name="clock" size={18} color="#fbbf24" />;
    default:
      return <Feather name="circle" size={18} color="#6b7280" />;
  }
};

const formatProjectType = (type: string) =>
  type?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
const formatStatusText = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

// ...types now defined above, remove these

const ProjectUpdatesPage = () => {
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  // const [projectDetails, setProjectDetails] =
  //   useState<ProjectDetailsType | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showShareDropdown, setShowShareDropdown] = useState<boolean>(false);

  const params = useLocalSearchParams();
  const token = typeof params.token === "string" ? params.token : undefined;

  const { projectDetails, loading, error } = useSelector(
    (state: any) => state.donationProjects
  );
  const dispatch = useDispatch<AppDispatch>();

  // console.log({ projectDetails });

  useEffect(() => {
    if (token) dispatch(fetchDonationProjectById(token));
  }, [dispatch, token]);

  // useEffect(() => {
  //   if (!token) return;
  //   setLoading(true);
  //   setError(null);
  //   api
  //     .get(`/donation-project/project-updates/${token}`)
  //     .then((response: any) => {
  //       setProjectDetails(response.data.payload);
  //       setLoading(false);
  //     })
  //     .catch((err: any) => {
  //       setError(err.response?.data?.message || "Something went wrong");
  //       setLoading(false);
  //     });
  // }, [token]);

  const getShareUrl = () => "https://alihsan.org/project-updates";

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(getShareUrl());
    setCopiedLink(true);
    setShowShareDropdown(false);
    Alert.alert("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const message = `Check out this project update: ${url}`;
    Share.share({ message });
    setShowShareDropdown(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2161CD" />
        <Text>Loading your project...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#dc2626" }}>Oops! Something went wrong</Text>
      </View>
    );
  }

  if (!projectDetails) {
    return (
      <View style={styles.centered}>
        <Text>Project Not Found</Text>
      </View>
    );
  }

  const coords = getCountryCoordinates(projectDetails.country);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusIcon}>
          {getStatusIcon(projectDetails.projectStatus)}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {formatProjectType(projectDetails.type)}
          </Text>
          <View style={styles.badgesRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {formatStatusText(projectDetails.projectStatus)}
              </Text>
            </View>
            <View style={styles.countryBadge}>
              <Feather name="globe" size={14} color="#6366f1" />
              <Text style={styles.countryText}>{projectDetails.country}</Text>
            </View>
            <View style={styles.viewsBadge}>
              <Feather name="eye" size={14} color="#6b7280" />
              <Text style={styles.viewsText}>
                {projectDetails.pageViews} views
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.orderIdBtn}
          onPress={async () => {
            await Clipboard.setStringAsync(projectDetails.orderId);
            setCopiedOrderId(true);
            Alert.alert("Order ID copied!");
            setTimeout(() => setCopiedOrderId(false), 1000);
          }}
        >
          <Feather name="copy" size={16} color="#6366f1" />
          <Text style={styles.orderIdText}>{projectDetails.orderId}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => setShowShareDropdown(!showShareDropdown)}
        >
          <Feather name="share-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Share Dropdown */}
      {showShareDropdown && (
        <View style={styles.shareDropdown}>
          <TouchableOpacity
            style={styles.shareDropdownItem}
            onPress={handleShareWhatsApp}
          >
            <FontAwesome name="whatsapp" size={20} color="#22c55e" />
            <Text style={styles.shareDropdownText}>Share on WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareDropdownItem}
            onPress={handleCopyLink}
          >
            <Feather name="copy" size={20} color="#6366f1" />
            <Text style={styles.shareDropdownText}>
              {copiedLink ? "Link Copied!" : "Copy Link"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <Text>Type: {formatProjectType(projectDetails.type)}</Text>
        <Text>
          Created: {new Date(projectDetails.createdAt).toLocaleDateString()}
        </Text>
        <Text>
          Donor: {projectDetails.donation?.firstName}{" "}
          {projectDetails.donation?.lastName}
        </Text>
        <Text>Behalf Of: {projectDetails.behalfOf}</Text>
        <Text>Plaque Name: {projectDetails.namePlaque}</Text>
        <Text>Special Request: {projectDetails.specialRequest}</Text>
        <Text>Notes: {projectDetails.notes}</Text>
      </View>

      {/* Map Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        {projectDetails.country ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapImage}
            initialRegion={{
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }}
          >
            <Marker
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              title={coords.name}
            />
          </MapView>
        ) : (
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            No location available
          </Text>
        )}
      </View>

      {/* Timeline */}
      {projectDetails.latestStatusLog?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>
          {projectDetails.latestStatusLog.map((log: StatusLogType) => (
            <View key={log.id} style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                {getStatusIcon(log.status)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStatus}>
                  {formatStatusText(log.status)}
                </Text>
                <Text style={styles.timelineDate}>
                  {new Date(log.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.timelineNote}>{log.note}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Media Gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Media</Text>
        <View style={styles.mediaGrid}>
          {projectDetails.media.map((item: MediaType) => {
            const imageBaseUrl =
              "https://alihsan.s3.ap-southeast-2.amazonaws.com";
            const imageUri =
              item.type === "IMAGE" && item.url && !item.url.startsWith("http")
                ? `${imageBaseUrl}/${item.url}`
                : item.url;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.mediaItem}
                onPress={() => setSelectedMedia(item)}
              >
                {item.type === "IMAGE" ? (
                  <Image source={{ uri: imageUri }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.mediaVideo}>
                    <Feather name="play" size={32} color="#6366f1" />
                  </View>
                )}
                <Text style={styles.mediaCaption}>{item.caption}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Media Modal */}
      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedMedia(null)}
            >
              <Feather name="x" size={28} color="#6366f1" />
            </TouchableOpacity>
            {selectedMedia?.type === "IMAGE" ? (
              <Image
                source={{ uri: selectedMedia.url }}
                style={styles.modalImage}
              />
            ) : (
              <Text style={{ color: "#6366f1", fontSize: 18 }}>
                Video preview not supported in modal
              </Text>
            )}
            <Text style={styles.modalCaption}>{selectedMedia?.caption}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ...keep your styles as-is
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#222", flex: 1 },
  badgesRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusBadge: {
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  statusBadgeText: { fontSize: 12, color: "#2563eb", fontWeight: "bold" },
  countryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  countryText: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "bold",
    marginLeft: 4,
  },
  viewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  viewsText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "bold",
    marginLeft: 4,
  },
  orderIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  orderIdText: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "bold",
    marginLeft: 4,
  },
  shareBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  shareDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    padding: 8,
    zIndex: 10,
  },
  shareDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shareDropdownText: { marginLeft: 8, fontSize: 14, color: "#222" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
  },
  mapImage: { width: "100%", height: 200, borderRadius: 12, marginTop: 8 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  timelineStatus: { fontSize: 14, fontWeight: "bold", color: "#2563eb" },
  timelineDate: { fontSize: 12, color: "#6b7280" },
  timelineNote: { fontSize: 13, color: "#222", marginTop: 2 },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  mediaItem: {
    width: 120,
    margin: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    padding: 8,
  },
  mediaImage: { width: 100, height: 100, borderRadius: 8 },
  mediaVideo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaCaption: {
    fontSize: 12,
    color: "#6366f1",
    marginTop: 4,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: 320,
  },
  modalClose: { position: "absolute", top: 12, right: 12, zIndex: 2 },
  modalImage: { width: 280, height: 280, borderRadius: 12 },
  modalCaption: {
    fontSize: 14,
    color: "#6366f1",
    marginTop: 8,
    textAlign: "center",
  },
});

export default ProjectUpdatesPage;
