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
import Ionicons from "react-native-vector-icons/Ionicons";

// 🔹 DÙNG CONFIG CHUNG
import {
    storage,
    getApiBase,
    getSheetId,
    KEY_ALL_DATA,
} from "../config/apiConfig";

type Status = "checking" | "loadingNew" | "ready";

export default function LoadingScreen() {
    const navigation = useNavigation<any>();
    const { setDeviceGroups, setIsDataFromCache } = useDeviceGroup();

    const [status, setStatus] = useState<Status>("checking");
    const [hasLocalData, setHasLocalData] = useState(false);
    const opacity = useRef(new Animated.Value(1)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 👉 state để hiển thị meta từ API
    const [totalTable, setTotalTable] = useState<number | null>(null);
    const [validTable, setValidTable] = useState<string[]>([]);
    const [errTable, setErrTable] = useState<string[]>([]);

    const fetchAllData = async () => {
        setStatus("loadingNew");

        try {
            const apiBase = getApiBase();
            const sheetId = getSheetId();

            const res = await fetch(
                `${apiBase}?action=getAllData&sheetId=${encodeURIComponent(
                    sheetId
                )}`,
                {
                    method: "GET",
                }
            );

            const result = await res.json();
            console.log("📌 Raw getAllData result:", result);

            // 👇 Trích xuất meta mới
            const total = result.totalTable ?? 0;
            const valid = result.validTable ?? [];
            const err = result.errTable ?? [];

            // 👇 Đây mới là mảng nhóm thiết bị dùng trong app
            const allData = result.data ?? [];

            console.log(
                "📌 Dữ liệu tất cả các bảng (mới) đã được lấy:",
                allData
            );
            console.log("🔎 Meta:", { total, valid, err });

            // lưu state meta để hiển thị trên UI
            setTotalTable(total);
            setValidTable(valid);
            setErrTable(err);

            storage.set(KEY_ALL_DATA, JSON.stringify(allData));
            setDeviceGroups(allData);

            setHasLocalData(false);
            setIsDataFromCache(false);
            setStatus("ready");
        } catch (err) {
            console.error("❌ Lỗi khi lấy dữ liệu tất cả các bảng:", err);
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setStatus("checking");

                const savedData = storage.getString(KEY_ALL_DATA);

                if (savedData) {
                    let allData: any = null;
                    let isEmpty = false;

                    try {
                        allData = JSON.parse(savedData);

                        if (Array.isArray(allData)) {
                            isEmpty = allData.length === 0;
                        } else if (allData && typeof allData === "object") {
                            isEmpty = Object.keys(allData).length === 0;
                        } else {
                            isEmpty = true;
                        }
                    } catch (e) {
                        console.warn(
                            "⚠️ Lỗi parse allData từ storage, sẽ tải mới:",
                            e
                        );
                        isEmpty = true;
                    }

                    if (!isEmpty) {
                        console.log(
                            "📌 Dữ liệu lấy từ bộ nhớ (CŨ, có nội dung):",
                            allData
                        );

                        setDeviceGroups(allData);
                        setHasLocalData(true);
                        setIsDataFromCache(true); // dùng cache + auto sync sau
                        setStatus("ready");
                        return;
                    }

                    console.log(
                        "ℹ️ allData trong storage rỗng -> sẽ tải dữ liệu mới"
                    );
                }

                // Không có savedData hoặc rỗng -> tải mới
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

    const hasMeta = totalTable !== null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    opacity,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
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

                <Text style={styles.title}>{renderTitle()}</Text>

                {isDone && hasLocalData && (
                    <Text style={styles.subText}>
                        Sử dụng tạm dữ liệu trong bộ nhớ...
                    </Text>
                )}

                {isDone && !hasLocalData && (
                    <>
                        <Text style={styles.subText}>
                            Dữ liệu mới đã sẵn sàng, chuyển đến trang chính...
                        </Text>

                        {/* 👇 Hiển thị meta khi vừa tải mới từ server */}
                        {hasMeta && (
                            <>
                                <Text style={styles.metaText}>
                                    Tổng số bảng: {totalTable}
                                </Text>
                                <Text style={styles.metaText}>
                                    Bảng hợp lệ: {validTable.length} | Bảng lỗi:{" "}
                                    {errTable.length}
                                </Text>
                                {errTable.length > 0 && (
                                    <Text style={styles.metaTextSmall}>
                                        Bảng lỗi: {errTable.join(", ")}
                                    </Text>
                                )}
                            </>
                        )}
                    </>
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
    metaText: {
        marginTop: 4,
        color: "#93C5FD",
        fontSize: 13,
        textAlign: "center",
    },
    metaTextSmall: {
        marginTop: 2,
        color: "#FCA5A5",
        fontSize: 12,
        textAlign: "center",
    },
});
