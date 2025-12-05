import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import { createMMKV } from "react-native-mmkv";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_BASE =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec";

const MMKV = createMMKV();

type Status = "checking" | "loadingNew" | "ready";

export default function LoadingScreen() {
    const navigation = useNavigation<any>();
    const { setDeviceGroups, setIsDataFromCache } = useDeviceGroup();

    const [status, setStatus] = useState<Status>("checking");
    const [hasLocalData, setHasLocalData] = useState(false);
    const opacity = useRef(new Animated.Value(1)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAllData = async () => {
        setStatus("loadingNew");

        try {
            const res = await fetch(`${API_BASE}?action=getAllData`);
            const allData = await res.json();
            console.log(
                "📌 Dữ liệu tất cả các bảng (mới) đã được lấy:",
                allData
            );

            // Lưu mới vào bộ nhớ
            MMKV.set("allData", JSON.stringify(allData));
            setDeviceGroups(allData);

            // Dữ liệu hiện tại là dữ liệu mới (không phải từ cache)
            setHasLocalData(false);
            setIsDataFromCache(false);
            setStatus("ready");
        } catch (err) {
            console.error("❌ Lỗi khi lấy dữ liệu tất cả các bảng:", err);
            // TODO: tuỳ bạn muốn xử lý lỗi, có thể hiển thị thông báo hoặc cho retry
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setStatus("checking");

                const savedData = MMKV.getString("allData");

                if (savedData) {
                    // ✅ ĐÃ CÓ DỮ LIỆU TRONG LOCAL (dữ liệu cũ)
                    const allData = JSON.parse(savedData);
                    console.log("📌 Dữ liệu lấy từ bộ nhớ (CŨ):", allData);

                    setDeviceGroups(allData);
                    setHasLocalData(true);
                    setIsDataFromCache(true); // flag cho các screen sau

                    // Đã có data (cũ nhưng dùng được) -> cho vào app luôn
                    setStatus("ready");
                    return;
                }

                // ❌ CHƯA CÓ DỮ LIỆU -> PHẢI TẢI MỚI Ở LOADING SCREEN
                await fetchAllData();
            } catch (error) {
                console.error("Lỗi khi bootstrap dữ liệu:", error);
            }
        };

        bootstrap();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [navigation, setDeviceGroups, setIsDataFromCache]);

    // Chỉ cần CÓ dữ liệu (cũ hoặc mới) -> status = "ready" -> auto fade + sang Home
    useEffect(() => {
        if (status === "ready") {
            timeoutRef.current = setTimeout(() => {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    navigation.replace("Home");
                });
            }, 2000);
        }
    }, [status, navigation, opacity]);

    const renderTitle = () => {
        if (status === "checking") return "Đang kiểm tra dữ liệu...";
        if (status === "loadingNew") return "Đang tải dữ liệu lần đầu...";
        if (status === "ready" && hasLocalData)
            return "Đã có dữ liệu trong bộ nhớ";
        if (status === "ready" && !hasLocalData) return "Tải dữ liệu hoàn tất";
        return "";
    };

    const isDone = status === "ready";

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    opacity,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Vòng tròn ở giữa */}
                <View style={styles.circle}>
                    {isDone ? (
                        <Ionicons
                            name="checkmark-done-circle-outline"
                            size={80}
                            color="#4ADE80"
                        />
                    ) : (
                        <ActivityIndicator size="large" color="#4EA8FF" />
                    )}
                </View>

                {/* Text trạng thái */}
                <Text style={styles.title}>{renderTitle()}</Text>

                {isDone && hasLocalData && (
                    <Text style={styles.subText}>
                        Sử dụng tạm dữ liệu trong bộ nhớ...
                    </Text>
                )}

                {isDone && !hasLocalData && (
                    <Text style={styles.subText}>
                        Dữ liệu mới đã sẵn sàng, chuyển đến trang chính...
                    </Text>
                )}

                {!isDone && status === "loadingNew" && (
                    <Text style={styles.subText}>
                        Lần đầu tải dữ liệu có thể mất vài giây...
                    </Text>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0F1C",
        alignItems: "center",
        justifyContent: "center",
    },
    circle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: "rgba(78,168,255,0.4)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15,23,42,0.9)",
    },
    title: {
        marginTop: 24,
        color: "#E0F2FF",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    subText: {
        marginTop: 8,
        color: "#9CA3AF",
        fontSize: 14,
        textAlign: "center",
    },
});
