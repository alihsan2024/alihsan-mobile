import React, { useState, useEffect } from "react";
import { Button, Alert, TextInput, View } from "react-native";
import api from "@/utils/api";
import { requestUserPermission } from "@/utils/notifications";

export const PushTestButton: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState("This is a real notification test.");

  useEffect(() => {
    requestUserPermission().then(setToken);
  }, []);

  const sendTestNotification = async () => {
    if (!token) {
      Alert.alert("No FCM token available");
      return;
    }
    setLoading(true);
    try {
      await api.post("/app-notifications/send-notification", {
        token,
        title,
        body,
        data: { type: "test" },
      });
      Alert.alert("Notification sent!");
    } catch (error: any) {
      Alert.alert(
        "Failed to send notification",
        error?.message || "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <TextInput
        placeholder="Notification Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 8,
          borderRadius: 6,
        }}
      />
      <TextInput
        placeholder="Notification Body"
        value={body}
        onChangeText={setBody}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 8,
          borderRadius: 6,
        }}
      />
      <Button
        title={loading ? "Sending..." : "Send Notification"}
        onPress={sendTestNotification}
        disabled={loading}
      />
    </View>
  );
};
