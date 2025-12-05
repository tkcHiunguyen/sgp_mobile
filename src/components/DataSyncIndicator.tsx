import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDeviceGroup } from "../context/DeviceGroupContext";

export default function DataSyncIndicator() {
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
        <View style={styles.wrapper}>
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
