// src/hooks/useFirebaseNotifications.ts
import { getApp, getApps } from "@react-native-firebase/app";
import {
    AuthorizationStatus,
    getAPNSToken,
    getMessaging,
    getToken,
    onMessage,
    registerDeviceForRemoteMessages,
    requestPermission,
    subscribeToTopic,
} from "@react-native-firebase/messaging";
import { useEffect } from "react";
import { Platform } from "react-native";

import { logger } from "../utils/logger";
import { showServerStatusNotification } from "../utils/notifications";

export function useFirebaseNotifications() {
    useEffect(() => {
        if (getApps().length === 0) {
            logger.warn(
                "Firebase default app is missing. Skipping notification setup."
            );
            return;
        }

        const app = getApp();
        const messaging = getMessaging(app);

        const wait = (ms: number) =>
            new Promise<void>((resolve) => setTimeout(resolve, ms));

        const waitForApnsToken = async () => {
            for (let attempt = 0; attempt < 10; attempt += 1) {
                const token = await getAPNSToken(messaging);
                if (token) return token;
                await wait(500);
            }
            return null;
        };

        const initializeNotifications = async () => {
            try {
                // 🔐 Xin quyền
                const authStatus = await requestPermission(messaging);
                const enabled =
                    authStatus === AuthorizationStatus.AUTHORIZED ||
                    authStatus === AuthorizationStatus.PROVISIONAL;

                logger.debug(
                    "🔔 Notification permission:",
                    authStatus,
                    "enabled:",
                    enabled
                );

                if (!enabled) {
                    logger.warn("Notification permission denied. Skip FCM setup.");
                    return;
                }

                if (Platform.OS === "ios") {
                    await registerDeviceForRemoteMessages(messaging);

                    const apnsToken = await waitForApnsToken();
                    if (!apnsToken) {
                        logger.warn(
                            "APNS token is not ready. Skip FCM token/topic setup for now."
                        );
                        return;
                    }

                    logger.debug("🍎 APNS token:", apnsToken);
                }

                // 🔔 Đăng ký topic
                await subscribeToTopic(messaging, "server-status");
                logger.debug("✅ Đã subscribe topic server-status");

                // 🔑 Lấy FCM token
                const token = await getToken(messaging);
                logger.debug("📲 FCM token:", token);
            } catch (error) {
                logger.warn("Firebase notification init failed:", error);
            }
        };

        void initializeNotifications();

        // 📩 Khi app foreground
        const unsubscribeForeground = onMessage(
            messaging,
            async (remoteMessage) => {
                logger.debug("📩 FCM (foreground):", remoteMessage);

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
