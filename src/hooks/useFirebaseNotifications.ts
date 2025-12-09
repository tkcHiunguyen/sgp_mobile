// src/hooks/useFirebaseNotifications.ts
import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { showServerStatusNotification } from "../utils/notifications";

export function useFirebaseNotifications() {
    useEffect(() => {
        (async () => {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            console.log(
                "🔔 Notification permission:",
                authStatus,
                "enabled:",
                enabled
            );

            await messaging().subscribeToTopic("server-status");
            console.log("✅ Đã subscribe topic server-status");

            const token = await messaging().getToken();
            console.log("📲 FCM token:", token);
        })();

        // Khi app đang mở (foreground)
        const unsubscribeForeground = messaging().onMessage(
            async (remoteMessage) => {
                console.log("📩 FCM (foreground):", remoteMessage);

                const rawTitle =
                    remoteMessage.data?.title ??
                    remoteMessage.notification?.title ??
                    "Thông báo";

                const rawBody =
                    remoteMessage.data?.body ??
                    remoteMessage.notification?.body ??
                    "";

                const title =
                    typeof rawTitle === "string"
                        ? rawTitle
                        : JSON.stringify(rawTitle);

                const body =
                    typeof rawBody === "string"
                        ? rawBody
                        : JSON.stringify(rawBody);

                await showServerStatusNotification(title, body);
            }
        );

        return () => {
            unsubscribeForeground();
        };
    }, []);
}
