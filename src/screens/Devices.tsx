import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Modal,
    ScrollView,
} from "react-native";
import BackButton from "../components/backButton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

function formatDate(value: any) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);

    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${dd}-${mm}-${yy}`;
}

const API_BASE =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec";

type Props = NativeStackScreenProps<RootStackParamList, "Devices">;
const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 60) / 2;

export default function DevicesScreen({ navigation }: Props) {
    const [tables, setTables] = useState<{ name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [devices, setDevices] = useState<any[][]>([]);
    const [currentSheet, setCurrentSheet] = useState("");
    const [device_name, setDevice_name] = useState("");
    const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch(`${API_BASE}?action=getalltables`);
            const json = await res.json();
            setTables(json);
        } catch (err) {
            console.error("❌ Lỗi fetch tables:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDevicesInGroup = async (sheetName: string) => {
        try {
            const res = await fetch(
                `${API_BASE}?action=gettabledata&sheet=${sheetName}`
            );
            const json = await res.json();

            if (!json.rows || !Array.isArray(json.rows)) return;
            setDevices(json.rows);
            setCurrentSheet(sheetName.replace(/^_/, ""));
            setModalVisible(true);
        } catch (err) {
            console.error("❌ Lỗi fetch table data:", err);
        }
    };

    const fetchMaintenanceHistory = async (deviceAndSheet: string) => {
        try {
            const res = await fetch(
                `${API_BASE}?action=getMaintenanceHistory&device_name=${deviceAndSheet}`
            );
            const json = await res.json();
            console.log(json);
            if (json.error) {
                console.error("❌ Lỗi khi lấy lịch sử:", json.message);
                return;
            }
            setMaintenanceHistory(json.rows || []);
        } catch (err) {
            console.error("❌ Lỗi fetch maintenance history:", err);
        }
    };

    const handleDevicePress = (deviceName: string, sheetName: string) => {
        const deviceAndSheet = `${deviceName}_${sheetName}`;
        console.log("Chuỗi thiết bị và nhóm được chọn: ", deviceAndSheet);
        setDevice_name(deviceName);
        setModalVisible(false);
        fetchMaintenanceHistory(deviceAndSheet);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4EA8FF" />
                <Text style={styles.loadingText}>
                    Đang tải danh sách bảng...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={styles.header}>Danh sách nhóm thiết bị</Text>

            <FlatList
                data={tables}
                keyExtractor={(item, index) => item.name + index}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => fetchDevicesInGroup(item.name)} // When pressed, show devices in the group
                    >
                        <Text style={styles.cardText}>
                            {item.name.replace(/^_/, "")}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* MODAL: DANH SÁCH THIẾT BỊ */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Thiết bị trong nhóm {currentSheet}
                        </Text>

                        {devices.length > 1 ? (
                            <ScrollView style={styles.modalScroll}>
                                {(() => {
                                    const header = devices[0].slice(1);
                                    const body = devices.slice(1);

                                    return (
                                        <View>
                                            <View style={styles.tableHeader}>
                                                {header.map((h, idx) => (
                                                    <Text
                                                        key={idx}
                                                        style={
                                                            styles.headerText
                                                        }
                                                    >
                                                        {h}
                                                    </Text>
                                                ))}
                                            </View>

                                            {body.map((row, rowIndex) => {
                                                const rowWithoutId =
                                                    row.slice(1);
                                                const deviceName = row[1];
                                                return (
                                                    <TouchableOpacity
                                                        key={rowIndex}
                                                        style={styles.tableRow}
                                                        onPress={() =>
                                                            handleDevicePress(
                                                                deviceName,
                                                                currentSheet
                                                            )
                                                        }
                                                    >
                                                        {rowWithoutId.map(
                                                            (col, colIndex) => {
                                                                const formatted =
                                                                    colIndex ===
                                                                        1 ||
                                                                    colIndex ===
                                                                        2
                                                                        ? formatDate(
                                                                              col
                                                                          )
                                                                        : col ||
                                                                          "-";

                                                                return (
                                                                    <Text
                                                                        key={
                                                                            colIndex
                                                                        }
                                                                        style={
                                                                            styles.rowText
                                                                        }
                                                                    >
                                                                        {
                                                                            formatted
                                                                        }
                                                                    </Text>
                                                                );
                                                            }
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    );
                                })()}
                            </ScrollView>
                        ) : (
                            <Text style={styles.noData}>Không có dữ liệu</Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: LỊCH SỬ BẢO TRÌ */}
            <Modal
                visible={maintenanceHistory.length > 0}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Lịch sử bảo trì của {device_name}
                        </Text>

                        {maintenanceHistory.length > 0 ? (
                            <ScrollView style={styles.modalScroll}>
                                {maintenanceHistory.map((item, index) => (
                                    <View
                                        key={index}
                                        style={styles.historyItem}
                                    >
                                        <Text style={styles.historyText}>
                                            {`Ngày: ${formatDate(
                                                item.date
                                            )}\nNội dung: ${item.content}`}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text style={styles.noData}>
                                Không có lịch sử bảo trì
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setMaintenanceHistory([])}
                        >
                            <Text style={styles.closeBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    loadingText: { marginTop: 10, color: "#9CCAFF" },

    header: {
        fontSize: 24,
        fontWeight: "900",
        color: "#E0F2FF",
        marginBottom: 20,
        textAlign: "center",
    },

    row: { justifyContent: "space-between", marginBottom: 16 },

    card: {
        backgroundColor: "#1E293B",
        width: CARD_SIZE,
        padding: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(78,168,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },

    cardText: {
        color: "#BBDFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    /* MODAL */
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    modalBox: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#FFF",
        borderRadius: 14,
        padding: 20,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 15,
        textAlign: "center",
    },

    modalScroll: {
        maxHeight: "90%",
        marginBottom: 20,
    },

    /* TABLE */
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
    },
    headerText: {
        flex: 1,
        fontWeight: "700",
        fontSize: 14,
        color: "#1E293B",
    },

    tableRow: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
    },

    rowText: {
        flex: 1,
        fontSize: 14,
        color: "#334155",
    },

    noData: {
        color: "#555",
        textAlign: "center",
        marginTop: 20,
    },

    closeBtn: {
        backgroundColor: "#1E293B",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    closeBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },

    historyItem: {
        backgroundColor: "#F1F5F9",
        padding: 12,
        marginBottom: 6,
        borderRadius: 8,
    },
    historyText: {
        color: "#334155",
        fontSize: 14,
    },
});
