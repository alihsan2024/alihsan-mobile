import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import api from "@/utils/api";

export enum MyDonationTypes {
  ACTIVE_RECURRING = "ACTIVE_RECURRING",
  INACTIVE_RECURRING = "INACTIVE_RECURRING",
  ONETIME = "ONETIME",
}

const PAGE_LIMIT = 10;

const fetchDonations = async (
  type: MyDonationTypes,
  page: number,
  search: string,
  sort: string
) => {
  const order = sort.endsWith("-r") ? "desc" : "asc";
  const cleanSort = sort.split("-")[0];

  let endpoint = "";
  switch (type) {
    case MyDonationTypes.ACTIVE_RECURRING:
      endpoint = "recurring/active";
      break;
    case MyDonationTypes.INACTIVE_RECURRING:
      endpoint = "recurring/inactive";
      break;
    case MyDonationTypes.ONETIME:
      endpoint = "onetime";
      break;
    default:
      throw new Error("Invalid donation type");
  }

  const url =
    `/donations/of-user/${endpoint}` +
    `?page=${page}&limit=${PAGE_LIMIT}` +
    `&search=${encodeURIComponent(search)}` +
    `&sort=${cleanSort}&order=${order}`;

  const response = await api.get(url);
  return response.data.payload;
};

const DonationList = ({ type }: { type: MyDonationTypes }) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-r");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchDonations(type, page, search, sort);
      setData(res);
    } catch (err: any) {
      console.log("Error loading donations:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [search, sort]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Search Input */}
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Sort Toggle */}
      <TouchableOpacity
        onPress={() => setSort(sort === "date-r" ? "date" : "date-r")}
        style={styles.sortBtn}
      >
        <Text>Sort by date: {sort === "date-r" ? "Newest" : "Oldest"}</Text>
      </TouchableOpacity>

      {/* Loader */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : data?.rows?.length ? (
        <>
          <FlatList
            data={data.rows}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.title}>
                  {item.Campaign?.name || item.name}
                </Text>

                <Text>Amount: ${item.amount}</Text>
                <Text>Date: {item.date}</Text>

                {item.isRecurring && (
                  <Text style={{ marginTop: 4, color: "#4B7BEC" }}>
                    Recurring every {item.periodDays} days
                  </Text>
                )}
              </View>
            )}
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            {data.page > 1 && (
              <TouchableOpacity onPress={() => load(data.page - 1)}>
                <Text style={styles.pageBtn}>Previous</Text>
              </TouchableOpacity>
            )}

            {data.page < data.count && (
              <TouchableOpacity onPress={() => load(data.page + 1)}>
                <Text style={styles.pageBtn}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text>No donations found.</Text>
        </View>
      )}
    </View>
  );
};

// -------------------------------------
// Main Tab Component
// -------------------------------------
export default function UserDonationsTabs() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "active", title: "Active" },
    { key: "inactive", title: "Inactive" },
  ]);

  const renderScene = SceneMap({
    active: () => <DonationList type={MyDonationTypes.ACTIVE_RECURRING} />,
    inactive: () => <DonationList type={MyDonationTypes.INACTIVE_RECURRING} />,
  });

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderTabBar={({ navigationState }) => (
          <View style={styles.tabBar}>
            {navigationState.routes.map((route, i) => (
              <TouchableOpacity
                key={route.key}
                onPress={() => setIndex(i)}
                style={[styles.tab, index === i && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, index === i && styles.activeTabText]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

// -------------------------------------
// Styles
// -------------------------------------
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 10,
    margin: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4B7BEC",
  },
  tabText: {
    color: "#555",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  search: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  sortBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  item: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontWeight: "700",
    marginBottom: 5,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  pageBtn: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B7BEC",
  },
  empty: {
    paddingTop: 40,
    alignItems: "center",
  },
});
