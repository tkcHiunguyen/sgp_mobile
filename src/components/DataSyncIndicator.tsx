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

    // Tự động sync nếu data từ cache
    useEffect(() => {
        if (isDataFromCache && !isSyncing) {
            console.log("⏳ [AUTO SYNC] Dữ liệu cũ -> auto sync...");
            refreshAllData();
        }
    }, [isDataFromCache, isSyncing, refreshAllData]);

    const renderIcon = () => {
        if (isSyncing)
            return <ActivityIndicator size="small" color="#38BDF8" />;

        if (isDataFromCache)
            return <Ionicons name="cloud-outline" size={18} color="#FBBF24" />;

        return <Ionicons name="cloud-done-outline" size={18} color="#4ADE80" />;
    };

    return (
        <View style={[inline ? styles.inlineWrapper : styles.wrapper, style]}>
            <Pressable
                onPress={() => {
                    console.log(
                        "🔁 [USER ACTION] Người dùng yêu cầu tải mới dữ liệu."
                    );
                    refreshAllData();
                }}
                style={styles.iconButton}
            >
                {renderIcon()}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: "rgba(15,23,42,0.9)",
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
});

