import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

const WATER_WELL_CAMPAIGN_ID = 6;
const AQEEQAH_CAMPAIGN_ID = 22;

type ProjectStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "PENDING"
  | "CANCELED"
  | "CANCELLED";

interface ProjectType {
  id: number;
  donationId?: number;
  campaignId: number;
  campaignName: string;
  type: string;
  amount: number;
  date: string;
  orderId?: string;
  projectStatus: ProjectStatus;
}

const ProjectStatusScreen = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<
    "all" | "water-well" | "aqeeqah"
  >("all");
  const [projectsData, setProjectsData] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Fetch User Projects
  // -----------------------------
  const fetchProjects = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const res = await api.get(`/donation-project/user/${user?.id}`);
      const donationProjects = res.data?.payload || [];

      // Transform projects
      const transformedProjects: ProjectType[] = donationProjects.map(
        (project: any) => {
          const projectData = project.toJSON ? project.toJSON() : project;

          const donation =
            projectData?.donation ||
            projectData?.Donation ||
            project?.donation ||
            project?.Donation;
          const campaign =
            projectData?.campaign ||
            projectData?.Campaign ||
            project?.campaign ||
            project?.Campaign;

          const campaignId =
            projectData?.campaignId ||
            donation?.campaignId ||
            campaign?.id ||
            project?.campaignId ||
            donation?.Campaign?.id;

          let projectType = "Project";
          if (campaignId === WATER_WELL_CAMPAIGN_ID) projectType = "Water Well";
          else if (campaignId === AQEEQAH_CAMPAIGN_ID) projectType = "Aqeeqah";
          else if (project?.type) projectType = project.type.replace(/_/g, " ");

          return {
            id: projectData?.id || project?.id,
            donationId:
              donation?.id || projectData?.donationId || project?.donationId,
            campaignId,
            campaignName:
              campaign?.name ||
              project?.Campaign?.name ||
              donation?.Campaign?.name ||
              "Unknown Campaign",
            type: projectType,
            amount: donation?.total || donation?.amount || projectData?.amount,
            date:
              donation?.createdAt ||
              donation?.donatedAt ||
              projectData?.createdAt ||
              projectData?.date,
            orderId:
              donation?.orderId || projectData?.orderId || project?.orderId,
            projectStatus:
              projectData?.projectStatus || project?.projectStatus || "PENDING",
          };
        }
      );

      setProjectsData(transformedProjects);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // -----------------------------
  // Filter & Transform Projects
  // -----------------------------
  const projects = useMemo(() => {
    if (!projectsData.length) return [];

    return projectsData.filter((project) => {
      const campaignId = project.campaignId;
      if (activeFilter === "water-well")
        return campaignId === WATER_WELL_CAMPAIGN_ID;
      if (activeFilter === "aqeeqah") return campaignId === AQEEQAH_CAMPAIGN_ID;
      return true;
    });
  }, [projectsData, activeFilter]);

  // -----------------------------
  // Status Badge Config
  // -----------------------------
  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: "#E8F9EF",
          color: "#1B8C4B",
          icon: <Feather name="check-circle" size={18} color="#1B8C4B" />,
        };
      case "IN_PROGRESS":
        return {
          bg: "#E8F1FF",
          color: "#2563EB",
          icon: <Feather name="refresh-cw" size={18} color="#2563EB" />,
        };
      case "PENDING":
        return {
          bg: "#FFF7E6",
          color: "#B45309",
          icon: <Feather name="clock" size={18} color="#B45309" />,
        };
      case "CANCELED":
      case "CANCELLED":
        return {
          bg: "#FDECEC",
          color: "#DC2626",
          icon: <Feather name="x-circle" size={18} color="#DC2626" />,
        };
      default:
        return {
          bg: "#F5F5F5",
          color: "#525252",
          icon: <Feather name="clock" size={18} color="#525252" />,
        };
    }
  };

  // -----------------------------
  // Navigate to Project Updates
  // -----------------------------
  const handleViewProject = (id: number) => {
    router.push(`/project-updates?token=${id}`);
  };

  // -----------------------------
  // Loading State
  // -----------------------------
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Project Status</Text>
      <Text style={styles.subtitle}>Track your donation project updates</Text>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {(["all", "water-well", "aqeeqah"] as const).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterBtn,
              activeFilter === key && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter(key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === key && styles.filterTextActive,
              ]}
            >
              {key === "all"
                ? "All Projects"
                : key === "water-well"
                ? "Water Wells"
                : "Aqeeqah"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty */}
      {projects.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Projects Found</Text>
          <Text style={styles.emptySubtitle}>Try switching filters.</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          {projects.map((project) => {
            const status = getStatusConfig(project.projectStatus);
            return (
              <TouchableOpacity
                key={project.id}
                style={styles.card}
                onPress={() => handleViewProject(project.id)}
              >
                {/* Icon */}
                <View style={styles.iconBox}>{status.icon}</View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{project.type}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: status.bg,
                          borderColor: status.color,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: status.color }]}
                      >
                        {project.projectStatus.replace("_", " ")}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.campaignName}>
                    {project.campaignName}
                  </Text>

                  <View style={styles.grid}>
                    <View>
                      <Text style={styles.label}>Order ID</Text>
                      <Text style={styles.value}>
                        #{project.orderId || "N/A"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.label}>Amount</Text>
                      <Text style={[styles.value, { color: "#0F6CBD" }]}>
                        ${Number(project.amount).toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.label}>Date</Text>
                      <Text style={styles.value}>
                        {new Date(project.date).toLocaleDateString("en-US")}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default ProjectStatusScreen;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 20 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  filterBtnActive: { backgroundColor: "#0F6CBD" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#333" },
  filterTextActive: { color: "#fff" },
  errorBox: { backgroundColor: "#FDECEC", padding: 12, borderRadius: 8 },
  errorText: { color: "#DC2626" },
  emptyBox: { padding: 40, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#444" },
  emptySubtitle: { color: "#777", marginTop: 6 },
  card: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 10,
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  campaignName: { fontSize: 12, color: "#666", marginBottom: 10 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 11, color: "#777" },
  value: { fontSize: 14, fontWeight: "600", color: "#111", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
});
