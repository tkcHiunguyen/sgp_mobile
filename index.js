// index.js
import { AppRegistry } from "react-native";
import { getApp, getApps } from "@react-native-firebase/app";
import {
    getMessaging,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import Ionicons from "react-native-vector-icons/Ionicons";
import App from "./App";
import { name as appName } from "./app.json";

// Ensure Ionicons font is registered before rendering icon-heavy screens.
void Ionicons.loadFont();

if (getApps().length > 0) {
    const app = getApp();
    const messaging = getMessaging(app);

    setBackgroundMessageHandler(messaging, async (remoteMessage) => {
        console.log("📩 FCM (background/quit):", remoteMessage);
    });
} else {
    console.warn(
        "Firebase default app not found. Add iOS GoogleService-Info.plist to enable FCM."
    );
}

AppRegistry.registerComponent(appName, () => App);
