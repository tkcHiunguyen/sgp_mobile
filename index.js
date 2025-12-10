// index.js
import { AppRegistry } from "react-native";
import { getApp } from "@react-native-firebase/app";
import {
    getMessaging,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import App from "./App";
import { name as appName } from "./app.json";

const app = getApp();
const messaging = getMessaging(app);

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log("📩 FCM (background/quit):", remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
