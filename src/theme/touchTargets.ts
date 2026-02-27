import { Platform } from "react-native";

export const MIN_TOUCH_TARGET_SIZE = Platform.OS === "ios" ? 44 : 48;
