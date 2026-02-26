import React, { useEffect } from "react";
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Pressable,
    ViewStyle,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useDeviceGroup } from "../context/DeviceGroupContext";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { logger } from "../utils/logger";

import type { ThemeColors } from "../theme/theme";

type Props = {
    /**
     * inline = true: dùng trong header/flex row, KHÔNG absolute.
     * inline = false (mặc định): nổi ở góc màn hình như cũ.
     */
    inline?: boolean;
    style?: ViewStyle;
};

export default function DataSyncIndicator({ inline = false, style }: Props) {
    const { isDataFromCache, isSyncing, refreshAllData } = useDeviceGroup();
    const { colors, mode } = useTheme();
    const styles = useThemedStyles(createStyles);
    const spinnerColor = mode === "dark" ? "#93C5FD" : "#2563EB";

    // Tự động sync nếu data từ cache
    useEffect(() => {
        if (isDataFromCache && !isSyncing) {
            logger.debug("⏳ [AUTO SYNC] Dữ liệu cũ -> auto sync...");
            refreshAllData();
        }
    }, [isDataFromCache, isSyncing, refreshAllData]);

    const renderIcon = () => {
        if (isSyncing) return <ActivityIndicator size="small" color={spinnerColor} />;

        if (isDataFromCache)
            return (
                <Ionicons name="cloud-outline" size={18} color={colors.warning} />
            );

        return (
            <Ionicons
                name="cloud-done-outline"
                size={18}
                color={colors.success}
            />
        );
    };

    return (
        <View style={[inline ? styles.inlineWrapper : styles.wrapper, style]}>
            <Pressable
                onPress={() => {
                    logger.debug(
                        "🔁 [USER ACTION] Người dùng yêu cầu tải mới dữ liệu."
                    );
                    refreshAllData();
                }}
                style={[
                    styles.iconButton,
                    mode === "dark" ? styles.iconButtonDark : styles.iconButtonLight,
                ]}
            >
                {renderIcon()}
            </Pressable>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        wrapper: {
            position: "absolute",
            top: 40,
            right: 16,
            zIndex: 20,
        },
        inlineWrapper: {
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 0,
        },
        iconButton: {
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
        },
        iconButtonDark: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.primarySoftBorder,
        },
        iconButtonLight: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.primaryBorderStrong,
        },
    });
