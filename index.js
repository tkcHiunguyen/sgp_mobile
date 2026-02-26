// index.js
import { getApp, getApps } from "@react-native-firebase/app";
import {
    getMessaging,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { AppRegistry } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import App from "./App";
import { name as appName } from "./app.json";

// Ensure Ionicons font is registered before rendering icon-heavy screens.
void Ionicons.loadFont();

if (getApps().length > 0) {
    const app = getApp();
    const messaging = getMessaging(app);

    setBackgroundMessageHandler(messaging, async (remoteMessage) => {
        if (__DEV__) {
            console.warn("📩 FCM (background/quit):", remoteMessage);
        }
    });
} else {
    if (__DEV__) {
        console.warn(
            "Firebase default app not found. Add iOS GoogleService-Info.plist to enable FCM."
        );
    }
}

AppRegistry.registerComponent(appName, () => App);
