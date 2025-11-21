import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Campaign } from "../services/api";
import { Image as ExpoImage } from "expo-image";

type Props = {
  campaigns: Campaign[];
};

export default function CampaignCard({ campaigns }: Props) {
  const router = useRouter();
  const decodeHtml = (html: string) => {
    const text = html.replace(/<[^>]+>/g, ""); // remove HTML tags
    const entities: Record<string, string> = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&quot;": '"',
      "&lt;": "<",
      "&gt;": ">",
      // add more if needed
    };

    return text.replace(/&[a-z]+;/gi, (match) => entities[match] || "").trim();
  };

  if (campaigns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No campaigns available</Text>
      </View>
    );
  }

  return (
    <>
      {campaigns.map((campaign) => (
        <TouchableOpacity
          key={campaign.id}
          style={styles.campaignCard}
          onPress={() => router.push(`/campaign/${campaign.slug}`)}
          activeOpacity={0.7}
        >
          <Text style={styles.campaignName}>{campaign.name}</Text>
          <Text style={styles.campaignSlug}>Slug: {campaign.slug}</Text>
          <Text style={styles.campaignDescription} numberOfLines={2}>
            {campaign.description
              ? decodeHtml(campaign.description)
              : campaign.descriptionText
              ? decodeHtml(campaign.descriptionText)
              : "No description"}
          </Text>
          {campaign.coverImage && (
            <ExpoImage
              source={{ uri: campaign.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            />
          )}
        </TouchableOpacity>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  campaignCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#264B8B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  campaignName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264B8B",
    marginBottom: 4,
  },
  campaignSlug: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  imageUrl: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  coverImage: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
