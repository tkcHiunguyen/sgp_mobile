// src/hooks/useFirebaseNotifications.ts
import { useEffect } from "react";
import { getApp } from "@react-native-firebase/app";
import {
    AuthorizationStatus,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
    subscribeToTopic,
} from "@react-native-firebase/messaging";
import { showServerStatusNotification } from "../utils/notifications";

const app = getApp();
const messaging = getMessaging(app);

export function useFirebaseNotifications() {
    useEffect(() => {
        (async () => {
            // 🔐 Xin quyền
            const authStatus = await requestPermission(messaging);
            const enabled =
                authStatus === AuthorizationStatus.AUTHORIZED ||
                authStatus === AuthorizationStatus.PROVISIONAL;

            console.log(
                "🔔 Notification permission:",
                authStatus,
                "enabled:",
                enabled
            );

            // 🔔 Đăng ký topic
            await subscribeToTopic(messaging, "server-status");
            console.log("✅ Đã subscribe topic server-status");

            // 🔑 Lấy FCM token
            const token = await getToken(messaging);
            console.log("📲 FCM token:", token);
        })();

        // 📩 Khi app foreground
        const unsubscribeForeground = onMessage(
            messaging,
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
