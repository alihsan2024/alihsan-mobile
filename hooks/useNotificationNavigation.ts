import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

export default function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    // When user taps notification
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;

        if (typeof url === "string") {
          router.push(url);
        }
      },
    );

    return () => sub.remove();
  }, [router]);
}
