import notifee, { AndroidImportance } from "@notifee/react-native";
import { Platform } from "react-native";

async function ensureChannel() {
    if (Platform.OS === "android") {
        await notifee.createChannel({
            id: "server-status-channel",
            name: "Server status",
            importance: AndroidImportance.HIGH,
        });
    }
}

export async function showServerStatusNotification(
    title: string,
    body: string
) {
    await ensureChannel();

    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId: "server-status-channel",
            smallIcon: "ic_stat_notification", 
            pressAction: {
                id: "default",
            },
        },
    });
}
