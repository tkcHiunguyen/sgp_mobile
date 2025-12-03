import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Alert,
    Modal,
    TextInput,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import DatePicker from "react-native-date-picker";
import BackButton from "../components/backButton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import AddButton from "../components/addButton";
import Ionicons from "react-native-vector-icons/Ionicons";

type Device = {
    id: string;
    system: string;
    name: string;
    check_date: string;
    estimate_check: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "SystemManager">;

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_BASE_URL =
    "https://script.google.com/macros/s/AKfycby7hdEetvSbbwtuJQiTl0Mp0JP-Jpz1wDn-4Mt5fzDFCah67GxLaU1UMxoqKSEn-Tz5EQ/exec";

export default function SystemManager({ route, navigation }: Props) {
    const { id, name } = route.params;
    const today = new Date();
    const [data, setData] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState("");

    const [checkDate, setCheckDate] = useState(new Date());
    const [estimateDate, setEstimateDate] = useState(new Date());
    const [openCheckPicker, setOpenCheckPicker] = useState(false);
    const [openEstPicker, setOpenEstPicker] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
    const formatDate = (dateString: string | Date) => {
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-based
        const day = String(d.getDate()).padStart(2, "0");
        return `${day}-${month}-${year}`;
    };
    const fetchData = async () => {
        try {
            const res = await fetch(
                `${API_BASE_URL}?action=getDevicesBySystem&system=${id}`
            );
            const json = await res.json();
            setData(json.rows || []);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (itemId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === itemId ? null : itemId);
    };

    const handleAddDevice = async () => {
        if (!newName.trim()) {
            Alert.alert("Lỗi", "Tên thiết bị không được để trống");
            return;
        }

        const check = checkDate.toISOString().split("T")[0];
        const estimate = estimateDate.toISOString().split("T")[0];

        await fetch(`${API_BASE_URL}?action=addDevice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system: id,
                name: newName,
                check_date: check,
                estimate_check: estimate,
            }),
        });

        setNewName("");
        setModalVisible(false);
        fetchData();
    };

    const confirmDelete = async () => {
        if (!deviceToDelete) return;

        const url = `${API_BASE_URL}?action=deleteDevice`;
        const payload = { id: deviceToDelete.id };
        const headers = { "Content-Type": "application/json" };

        // Debug packet
        console.log("=== DELETE REQUEST SENT ===");
        console.log("URL:", url);
        console.log("Method: POST");
        console.log("Headers:", headers);
        console.log("Body:", payload);
        console.log("===========================");

        try {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            // Debug response raw
            console.log("=== RAW RESPONSE ===");
            console.log(res);

            const json = await res.json();

            // Debug parsed response
            console.log("=== PARSED RESPONSE ===");
            console.log(json);

            if (json.error) throw new Error(json.message);

            setDeleteModalVisible(false);
            setDeviceToDelete(null);
            fetchData();
        } catch (err: any) {
            console.log("=== DELETE ERROR ===", err);
            Alert.alert("Lỗi", err.toString());
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4EA8FF" />
                <Text style={styles.loadingText}>
                    {" "}
                    Đang tải danh sách thiết bị...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            <Text style={styles.header}>Quản lý {name}</Text>
            {data.length === 0 && (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                        Chưa có thiết bị nào trong hệ thống này
                    </Text>
                    <Text style={styles.emptyHint}>
                        Nhấn nút + để thêm thiết bị đầu tiên
                    </Text>
                </View>
            )}
            {data.length > 0 && (
                <FlatList
                    data={data}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>
                                    {item.name}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => toggleExpand(item.id)}
                                    style={styles.cardBtn}
                                >
                                    <Text style={styles.cardBtnText}>
                                        {expandedId === item.id
                                            ? "Đóng"
                                            : "Xem"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setDeviceToDelete(item);
                                        setDeleteModalVisible(true);
                                    }}
                                    style={styles.deleteIcon}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>

                            {expandedId === item.id && (
                                <View style={styles.cardBody}>
                                    <Text style={styles.infoLabel}>
                                        Ngày kiểm định:{" "}
                                        {formatDate(item.check_date)}
                                    </Text>
                                    <Text style={styles.infoLabel}>
                                        Hạn kiểm định:{" "}
                                        {formatDate(item.estimate_check)}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionBtn,
                                            {
                                                backgroundColor: "#FFA500",
                                                marginTop: 10,
                                            },
                                        ]}
                                        onPress={() =>
                                            navigation.navigate("History", {
                                                deviceId: item.id,
                                                deviceName: item.name,
                                            })
                                        }
                                    >
                                        <Text style={styles.actionText}>
                                            Xem lịch sử
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                />
            )}

            <AddButton onPress={() => setModalVisible(true)} />

            {/* MODAL ADD */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Thêm thiết bị</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên thiết bị"
                            placeholderTextColor="#667"
                            value={newName}
                            onChangeText={setNewName}
                        />

                        <TouchableOpacity
                            style={styles.dateBtn}
                            onPress={() => setOpenCheckPicker(true)}
                        >
                            <Text style={styles.dateText}>
                                Ngày kiểm định: {formatDate(checkDate)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateBtn}
                            onPress={() => setOpenEstPicker(true)}
                        >
                            <Text style={styles.dateText}>
                                Kiểm định tiếp: {formatDate(estimateDate)}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleAddDevice}
                                style={[
                                    styles.actionBtn,
                                    { backgroundColor: "#4EA8FF" },
                                ]}
                            >
                                <Text style={styles.actionText}>Thêm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[
                                    styles.actionBtn,
                                    { backgroundColor: "#FF6B6B" },
                                ]}
                            >
                                <Text style={styles.actionText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DATE PICKER CUSTOMIZED */}
            <DatePicker
                modal
                mode="date"
                theme="dark"
                open={openCheckPicker}
                date={checkDate}
                onConfirm={(d) => {
                    setOpenCheckPicker(false);
                    if (d > estimateDate) {
                        Alert.alert(
                            "Lỗi",
                            "Ngày kiểm định không được sau ngày dự kiến kiểm định!"
                        );
                        return;
                    }
                    setCheckDate(d);
                }}
                onCancel={() => setOpenCheckPicker(false)}
            />

            <DatePicker
                modal
                mode="date"
                theme="dark"
                open={openEstPicker}
                date={estimateDate}
                onConfirm={(d) => {
                    setOpenEstPicker(false);
                    if (d < checkDate) {
                        Alert.alert(
                            "Lỗi",
                            "Ngày dự kiến kiểm định phải sau ngày kiểm định!"
                        );
                        return;
                    }
                    setEstimateDate(d);
                }}
                onCancel={() => setOpenEstPicker(false)}
            />

            {/* DELETE MODAL */}
            <Modal
                transparent
                visible={deleteModalVisible}
                animationType="fade"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Xóa "{deviceToDelete?.name}"?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={confirmDelete}
                                style={[
                                    styles.actionBtn,
                                    { backgroundColor: "#FF4D4F" },
                                ]}
                            >
                                <Text style={styles.actionText}>Xóa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                style={[
                                    styles.actionBtn,
                                    { backgroundColor: "#4EA8FF" },
                                ]}
                            >
                                <Text style={styles.actionText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
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
    header: {
        fontSize: 24,
        color: "#E0F2FF",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 20,
    },

    /* Card list */
    card: {
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardTitle: {
        flex: 1,
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    cardBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: "#3B82F6",
        borderRadius: 8,
        marginRight: 10,
    },
    cardBtnText: { color: "#fff", fontWeight: "600" },
    deleteIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#DC2626",
        justifyContent: "center",
        alignItems: "center",
    },

    cardBody: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#334155",
    },
    infoLabel: {
        color: "#9CCAFF",
        marginBottom: 6,
    },

    /* Modal */
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    modalBox: {
        width: "85%",
        backgroundColor: "#1E293B",
        padding: 22,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#0F172A",
        borderWidth: 1,
        borderColor: "#334155",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 14,
    },

    dateBtn: {
        backgroundColor: "#0F172A",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    dateText: { color: "#9CCAFF" },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 6,
    },
    actionText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A0F1C",
    },
    loadingText: { marginTop: 10, color: "#9CCAFF", fontSize: 14 },
    emptyBox: {
        marginTop: 50,
        padding: 20,
        backgroundColor: "#1E293B",
        borderRadius: 12,
        alignItems: "center",
    },
    emptyText: {
        color: "#BBDFFF",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyHint: {
        color: "#9CCAFF",
        fontSize: 14,
    },
});
