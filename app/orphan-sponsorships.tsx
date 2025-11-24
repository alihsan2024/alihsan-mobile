import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import api from "@/services/api";
import PaymentHistoryModal from "@/components/ui/Modals/PaymentHistoryModal";
import CancelSponsorshipModal from "@/components/ui/Modals/CancelSponsorshipModal";
import OrphanProfileDetailsModal from "@/components/ui/Modals/OrphanProfileDetailsModal";

interface Orphan {
  id: number;
  name: string;
  cover_image?: string;
}
interface OrphanUserAllocation {
  orphanId: number;
  orphan?: Orphan;
}
interface Sponsorship {
  id: number;
  subscriptionId: string;
  amountInCents: number;
  sponsorshipType: string;
  startDate: string;
  nextDueDate?: string;
  status: string;
  orphanUserAllocations?: OrphanUserAllocation[];
  Orphan?: Orphan;
}

const OrphanSponsorshipsTab: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const [selectedSponsorship, setSelectedSponsorship] =
    useState<Sponsorship | null>(null);
  const [paymentCache, setPaymentCache] = useState<Record<string, any[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [sponsorshipToCancel, setSponsorshipToCancel] =
    useState<Sponsorship | null>(null);
  const [showOrphanDetailsModal, setShowOrphanDetailsModal] = useState(false);
  const [selectedOrphan, setSelectedOrphan] = useState<Orphan | null>(null);

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const fetchSponsorships = async () => {
    try {
      const response = await api.get("/orphan-sponsorship/list/user");
      setSponsorships(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sponsorships");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number, orphanId?: number) => {
    try {
      setCancelling(id);
      await api.post("/orphan-sponsorship/cancel", {
        orphanId,
        orphanSponsorshipId: id,
      });
      await fetchSponsorships();
      setShowCancelModal(false);
      setSponsorshipToCancel(null);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Cancellation failed"
      );
    } finally {
      setCancelling(null);
    }
  };

  const openCancelModal = (sponsorship: Sponsorship) => {
    setSponsorshipToCancel(sponsorship);
    setShowCancelModal(true);
  };
  const openOrphanDetailsModal = (orphan: Orphan) => {
    setSelectedOrphan(orphan);
    setShowOrphanDetailsModal(true);
  };

  const fetchPaymentsForSponsorship = async (subscriptionId: string) => {
    setLoadingPayments(true);
    try {
      const res = await api.get("/orphan-sponsorship/user/payments", {
        params: { subscriptionId },
      });
      setPaymentCache((prev) => ({ ...prev, [subscriptionId]: res.data.data }));
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to load payments"
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleCardClick = async (sponsorship: Sponsorship) => {
    setShowModal(true);
    setSelectedSponsorship(sponsorship);
    const subscriptionId = sponsorship.subscriptionId;
    if (!paymentCache[subscriptionId])
      await fetchPaymentsForSponsorship(subscriptionId);
  };

  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  const totalOrphans = sponsorships.reduce(
    (total, s) => total + (s.orphanUserAllocations?.length || 0),
    0
  );
  const activeSponsorships = sponsorships.filter(
    (s) => s.status === "active"
  ).length;
  const totalMonthlyAmount =
    sponsorships
      .filter((s) => s.status === "active")
      .reduce(
        (sum, s) =>
          sum + s.amountInCents * (s.orphanUserAllocations?.length || 1),
        0
      ) / 100;

  const renderHeader = () => (
    <>
      <Text style={styles.title}>Orphan Sponsorships</Text>
      <Text style={styles.subtitle}>
        Manage and view your orphan sponsorships
      </Text>

      {sponsorships.length > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#E0F2FF" }]}>
            <Text style={styles.statLabel}>Total Orphans Sponsored</Text>
            <Text style={styles.statValue}>{totalOrphans}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
            <Text style={styles.statLabel}>Active Sponsorships</Text>
            <Text style={styles.statValue}>{activeSponsorships}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
            <Text style={styles.statLabel}>Total Monthly Amount</Text>
            <Text style={styles.statValue}>
              ${totalMonthlyAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View
          style={[styles.center, { padding: 16, backgroundColor: "#FEE2E2" }]}
        >
          <Text style={{ color: "#B91C1C" }}>{error}</Text>
        </View>
      )}

      {!error && sponsorships.length === 0 && (
        <View
          style={[
            styles.center,
            { padding: 32, backgroundColor: "#F0F9FF", borderRadius: 12 },
          ]}
        >
          <FontAwesome name="heart" size={40} color="#3B82F6" />
          <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 8 }}>
            No Sponsorships Found
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            You haven't sponsored any orphans yet. Start making a difference
            today.
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={sponsorships}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardClick(s)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {s.orphanUserAllocations?.length || 0} Orphan
                {s.orphanUserAllocations && s.orphanUserAllocations.length > 1
                  ? "s"
                  : ""}
              </Text>
              <Text style={styles.cardSubtitle}>
                $
                {(
                  (s.amountInCents / 100) *
                  (s.orphanUserAllocations?.length || 1)
                ).toFixed(2)}{" "}
                / {s.sponsorshipType}
              </Text>
            </View>
            <View style={styles.cardDetails}>
              <Text>Start: {new Date(s.startDate).toLocaleDateString()}</Text>
              <Text>
                Next Due:{" "}
                {s.nextDueDate
                  ? new Date(s.nextDueDate).toLocaleDateString()
                  : "N/A"}
              </Text>
              <Text>
                Subscription ID: #{s.subscriptionId?.slice(0, 8) || "N/A"}
              </Text>
              <TouchableOpacity
                onPress={() => openCancelModal(s)}
                disabled={cancelling === s.id}
                style={[
                  styles.cancelBtn,
                  cancelling === s.id && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.cancelBtnText}>
                  {cancelling === s.id ? "Cancelling..." : "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Modals */}
      {showModal && selectedSponsorship && (
        <PaymentHistoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onExport={() => {}}
          selectedSponsorship={selectedSponsorship}
          loadingPayments={loadingPayments}
          getGroupedPayments={() => []}
          openOrphanDetailsModal={openOrphanDetailsModal}
        />
      )}

      {showCancelModal && sponsorshipToCancel && (
        <CancelSponsorshipModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancel={() =>
            handleCancel(
              sponsorshipToCancel.id,
              sponsorshipToCancel.orphanUserAllocations?.[0]?.orphanId ||
                sponsorshipToCancel.Orphan?.id
            )
          }
          sponsorship={sponsorshipToCancel}
          cancelling={cancelling === sponsorshipToCancel.id}
        />
      )}

      {showOrphanDetailsModal && selectedOrphan && (
        <OrphanProfileDetailsModal
          isOpen={showOrphanDetailsModal}
          onClose={() => setShowOrphanDetailsModal(false)}
          orphan={selectedOrphan}
          selectedSponsorship={selectedSponsorship}
        />
      )}
    </SafeAreaView>
  );
};

export default OrphanSponsorshipsTab;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: { flex: 1, padding: 12, borderRadius: 12, marginHorizontal: 4 },
  statLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { fontSize: 14, color: "#1D4ED8", fontWeight: "600" },
  cardDetails: { marginTop: 8 },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
