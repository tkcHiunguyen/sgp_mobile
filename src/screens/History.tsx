import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeviceGroup } from "../context/DeviceGroupContext";

const API_BASE =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec";

export default function HistoryScreen() {
    const { deviceGroups, setDeviceGroups } = useDeviceGroup();
    const [loading, setLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [tables, setTables] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]); // Lưu dữ liệu lịch sử của nhóm thiết bị

    useEffect(() => {
        if (!deviceGroups || deviceGroups.length === 0) {
            fetchDeviceGroups();
        }
    }, [deviceGroups]);

    const fetchDeviceGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}?action=getalltables`);
            const json = await res.json();
            setDeviceGroups(json);
            setTables(json);
        } catch (err) {
            console.error("❌ Lỗi fetch device groups:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeviceGroupPress = async (groupName: string) => {
        setSelectedGroup(groupName); // Cập nhật nhóm thiết bị đã chọn
        setModalVisible(false); // Đóng modal sau khi chọn

        // Clear previous history data and show loading indicator
        setHistoryData([]); // Clear the current list
        setLoading(true); // Show loading circle

        try {
            const response = await fetch(
                `${API_BASE}?action=getGroupHistory&groupName=${groupName}`
            );
            const data = await response.json();

            // Sắp xếp dữ liệu theo ngày từ gần đến xa
            const sortedData = data.rows.sort(
                (a: { date: string }, b: { date: string }) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB.getTime() - dateA.getTime(); // Sắp xếp từ gần đến xa (mới nhất trước)
                }
            );

            // Cập nhật dữ liệu đã sắp xếp vào state và ẩn loading indicator
            setHistoryData(sortedData);
        } catch (error) {
            console.error("Lỗi khi gọi API lấy lịch sử nhóm thiết bị:", error);
        } finally {
            setLoading(false); // Hide loading circle once the data is loaded
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Chọn lịch sử nhóm thiết bị</Text>

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.dropdownText}>
                    {selectedGroup || "Chọn nhóm thiết bị"}{" "}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Chọn nhóm thiết bị
                        </Text>
                        <FlatList
                            data={deviceGroups}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.deviceItem}
                                    onPress={() =>
                                        handleDeviceGroupPress(item.name)
                                    }
                                >
                                    <Text style={styles.deviceText}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.name}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {loading ? (
                // Show loading circle while data is being fetched
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4EA8FF" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : historyData.length === 0 ? (
                // Show message if no history data available
                <View style={styles.center}>
                    <Text style={styles.noDataText}>
                        Không có bản ghi lịch sử cho nhóm thiết bị này
                    </Text>
                </View>
            ) : (
                // Show the history list when data is available
                <FlatList
                    data={historyData}
                    renderItem={({ item }) => (
                        <View style={styles.historyItem}>
                            <View style={styles.historyItemLeft}>
                                <Text style={styles.deviceName}>
                                    {item.name.split("_")[1]}
                                </Text>
                                <Text style={styles.deviceGroup}>
                                    {item.name.split("_")[0]}
                                </Text>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>
                            <View style={styles.historyItemRight}>
                                <ScrollView style={styles.contentWrapper}>
                                    <Text style={styles.content}>
                                        {item.content}
                                    </Text>
                                </ScrollView>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0F1C",
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A0F1C",
    },
    header: {
        fontSize: 24,
        color: "#E0F2FF",
        fontWeight: "900",
        marginBottom: 20,
        textAlign: "center",
    },
    loadingText: {
        color: "#9CCAFF",
        fontSize: 14,
    },
    noDataText: {
        color: "#9CCAFF",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    dropdownButton: {
        backgroundColor: "#2D3B4F",
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    dropdownText: {
        color: "#BBDFFF",
        fontSize: 16,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#1E293B",
        padding: 20,
        borderRadius: 12,
        width: "80%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        color: "#E0F2FF",
        marginBottom: 10,
        textAlign: "center",
    },
    deviceItem: {
        backgroundColor: "#2D3B4F",
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
    },
    deviceText: {
        color: "#BBDFFF",
        fontSize: 16,
        textAlign: "center",
    },
    closeButton: {
        backgroundColor: "#40709fff",
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    closeButtonText: {
        color: "#FFF",
        fontSize: 16,
        textAlign: "center",
    },
    historyItem: {
        marginVertical: 10,
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#1E293B",
        borderRadius: 8,
    },
    historyItemLeft: {
        flex: 1,
        justifyContent: "center",
        paddingRight: 20,
        backgroundColor: "#2D3B4F",
        borderRadius: 8,
        padding: 10,
    },
    historyItemRight: {
        flex: 2,
        justifyContent: "center",
        paddingLeft: 10,
    },
    deviceName: {
        color: "#BBDFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    deviceGroup: {
        color: "#BBDFFF",
        fontSize: 14,
        marginTop: 5,
    },
    date: {
        color: "#9CCAFF",
        fontSize: 14,
        marginTop: 5,
    },
    contentWrapper: {
        maxHeight: 100,
    },
    content: {
        color: "#D7E9FF",
        fontSize: 14,
        paddingRight: 10,
    },
});
