import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { blue } from "react-native-reanimated/lib/typescript/Colors";

const API_URL =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec?action=getHistory";

export default function MaintenanceHistory() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(API_URL);
            const json = await res.json();
            setData(json.rows || []);
        } catch (err) {
            console.log("❌ Lỗi tải lịch sử:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";

        const isISO8601 = dateString.includes("T") && dateString.includes("Z");

        let dateObj;
        if (isISO8601) {
            dateObj = new Date(dateString);
        } else {
            const [day, month, year] = dateString.split("/");
            if (!day || !month || !year) {
                return "";
            }
            dateObj = new Date(
                `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            );
        }

        if (isNaN(dateObj.getTime())) {
            return "";
        }

        const formattedDay = String(dateObj.getDate()).padStart(2, "0");
        const formattedMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
        const formattedYear = dateObj.getFullYear().toString().slice(2);

        return `${formattedDay}-${formattedMonth}-${formattedYear}`;
    };

    const formatDeviceName = (deviceName: string) => {
        const parts = deviceName.split("_");
        const mainName = parts[0];
        const extraName = parts.slice(1).join("_");

        return (
            <View>
                <Text style={styles.device}>{mainName}</Text>
                {extraName && (
                    <Text style={styles.deviceExtra}>{extraName}</Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4EA8FF" />
                <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Lịch sử sửa chữa</Text>

            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.leftSection}>
                            <Text style={styles.deviceName}>
                                {formatDeviceName(item.device)}
                            </Text>

                            <Text style={styles.date}>
                                {formatDate(item.date)}
                            </Text>
                        </View>

                        <View style={styles.rightSection}>
                            <ScrollView style={styles.scrollableContent}>
                                <Text style={styles.desc}>
                                    {item.content || "Không có mô tả"}
                                </Text>
                            </ScrollView>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0F1C",
        padding: 20,
        paddingTop: 60,
    },
    center: {
        backgroundColor: "#0A0F1C",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#9CCAFF",
        fontSize: 14,
    },
    header: {
        fontSize: 24,
        color: "#E0F2FF",
        fontWeight: "900",
        marginBottom: 20,
        textAlign: "center",
    },
    card: {
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#334155",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    leftSection: {
        flex: 1,
        backgroundColor: "#2D3B4F",
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    rightSection: {
        flex: 2,
        backgroundColor: "#40709fff",
        padding: 12,
        borderRadius: 8,
    },
    deviceName: {
        color: "#E0F2FF",
        fontSize: 17,
        fontWeight: "700",
    },
    deviceExtra: {
        color: "#BBDFFF",
        fontSize: 14,
        fontWeight: "400",
    },
    date: {
        color: "#9CCAFF",
        fontSize: 14,
        marginBottom: 6,
    },
    scrollableContent: {
        maxHeight: 120,
    },
    desc: {
        color: "#D7E9FF",
        fontSize: 15,
        lineHeight: 20,
    },
    device: {
        color: "#E0F2FF",
        fontSize: 14,
        fontWeight: "bold",
    },
});
