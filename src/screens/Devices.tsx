import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/backButton";
import DataSyncIndicator from "../components/DataSyncIndicator";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useDeviceGroup } from "../context/DeviceGroupContext";

type Props = NativeStackScreenProps<RootStackParamList, "Devices">;

// helper: parse "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10); // "25" -> 2025
    return new Date(year, month, day);
};

interface DeviceRow {
    id: number;
    name: string;
    freq: string | number | null;
}

interface HistoryRow {
    deviceName: string;
    date: string;
    content: string;
}

export default function DevicesScreen({ navigation }: Props) {
    const { deviceGroups } = useDeviceGroup();

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [deviceModalVisible, setDeviceModalVisible] = useState(false);

    const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(
        null
    );
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [maintenanceHistory, setMaintenanceHistory] = useState<HistoryRow[]>(
        []
    );

    const isLoading = !deviceGroups || deviceGroups.length === 0;

    // Lấy data group đang chọn
    const selectedGroupData = useMemo(
        () => deviceGroups.find((g: any) => g.table === selectedGroup),
        [deviceGroups, selectedGroup]
    );

    const devicesInGroup: DeviceRow[] =
        (selectedGroupData?.devices?.rows as DeviceRow[]) || [];

    const handleOpenGroup = (groupName: string) => {
        setSelectedGroup(groupName);
        setDeviceModalVisible(true);
    };

    const handleOpenDeviceHistory = (deviceName: string) => {
        if (!selectedGroupData || !selectedGroupData.history) return;

        const allHistory: HistoryRow[] =
            (selectedGroupData.history.rows as HistoryRow[]) || [];

        const filtered = allHistory.filter((h) => h.deviceName === deviceName);

        const sorted = [...filtered].sort(
            (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
        );

        setSelectedDeviceName(deviceName);
        setMaintenanceHistory(sorted);
        setHistoryModalVisible(true);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4EA8FF" />
                    <Text style={styles.loadingText}>
                        Đang tải danh sách nhóm thiết bị...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <BackButton onPress={() => navigation.goBack()} />
            <DataSyncIndicator />

            <View style={styles.container}>
                <Text style={styles.header}>Danh sách nhóm thiết bị</Text>

                <FlatList
                    data={deviceGroups}
                    keyExtractor={(item: any, index) =>
                        `${item.table}-${index}`
                    }
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }: { item: any }) => (
                        <TouchableOpacity
                            style={styles.cardWrapper}
                            onPress={() => handleOpenGroup(item.table)}
                        >
                            <View style={styles.card}>
                                <Text style={styles.cardText}>
                                    {item.table}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* MODAL: DANH SÁCH THIẾT BỊ TRONG NHÓM */}
            <Modal
                visible={deviceModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeviceModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Thiết bị trong nhóm {selectedGroup}
                        </Text>

                        {devicesInGroup.length > 0 ? (
                            <ScrollView
                                style={styles.modalScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                {devicesInGroup.map((dev) => (
                                    <TouchableOpacity
                                        key={dev.id}
                                        style={styles.deviceRow}
                                        onPress={() =>
                                            handleOpenDeviceHistory(dev.name)
                                        }
                                    >
                                        <View style={styles.deviceRowLeft}>
                                            <Text style={styles.deviceName}>
                                                {dev.name}
                                            </Text>
                                            <Text style={styles.deviceSubLabel}>
                                                ID: {dev.id}
                                            </Text>
                                        </View>
                                        <View style={styles.deviceRowRight}>
                                            <Text style={styles.freqLabel}>
                                                Tần suất:
                                            </Text>
                                            <Text style={styles.freqValue}>
                                                {dev.freq || "-"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text style={styles.noData}>
                                Nhóm này chưa có thiết bị.
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setDeviceModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: LỊCH SỬ BẢO TRÌ CỦA TỪNG THIẾT BỊ */}
            <Modal
                visible={historyModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setHistoryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Lịch sử bảo trì của {selectedDeviceName}
                        </Text>

                        {maintenanceHistory.length > 0 ? (
                            <ScrollView
                                style={styles.modalScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                {maintenanceHistory.map((item, index) => (
                                    <View
                                        key={`${item.date}-${index}`}
                                        style={styles.historyItem}
                                    >
                                        <View style={styles.historyItemLeft}>
                                            <Text style={styles.historyDate}>
                                                {item.date}
                                            </Text>
                                        </View>
                                        <View style={styles.historyItemRight}>
                                            <Text style={styles.historyContent}>
                                                {item.content}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text style={styles.noData}>
                                Không có lịch sử bảo trì cho thiết bị này.
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => {
                                setHistoryModalVisible(false);
                                setMaintenanceHistory([]);
                                setSelectedDeviceName(null);
                            }}
                        >
                            <Text style={styles.closeBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#020617",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#020617",
    },
    loadingText: {
        marginTop: 10,
        color: "#9CCAFF",
        fontSize: 14,
    },
    header: {
        fontSize: 26,
        fontWeight: "900",
        color: "#E5F2FF",
        marginBottom: 20,
        textAlign: "center",
        letterSpacing: 0.8,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    cardWrapper: {
        flexBasis: "48%",
    },
    card: {
        backgroundColor: "#0F172A",
        paddingVertical: 22,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.45)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    cardText: {
        color: "#E5F2FF",
        fontSize: 16,
        fontWeight: "700",
    },

    // MODAL CHUNG
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalBox: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#020617",
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.7)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#E5F2FF",
        marginBottom: 12,
        textAlign: "center",
    },
    modalScroll: {
        // maxHeight: "75%",
        marginBottom: 16,
    },
    noData: {
        paddingBottom: 20,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 20,
        fontSize: 14,
    },
    closeBtn: {
        backgroundColor: "#1D4ED8",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    closeBtnText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },

    // DANH SÁCH THIẾT BỊ TRONG NHÓM
    deviceRow: {
        flexDirection: "row",
        backgroundColor: "#0F172A",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.9)",
    },
    deviceRowLeft: {
        flex: 3,
        paddingRight: 8,
    },
    deviceRowRight: {
        flex: 1.5,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    deviceName: {
        color: "#E5F2FF",
        fontSize: 14,
        fontWeight: "700",
    },
    deviceSubLabel: {
        color: "#9CA3AF",
        fontSize: 12,
        marginTop: 2,
    },
    freqLabel: {
        color: "#9CA3AF",
        fontSize: 11,
    },
    freqValue: {
        color: "#60A5FA",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 2,
    },

    // LỊCH SỬ BẢO TRÌ THIẾT BỊ
    historyItem: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#0F172A",
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(55,65,81,0.9)",
    },
    historyItemLeft: {
        width: 90,
        justifyContent: "center",
        padding: 8,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: "#111827",
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.6)",
        shadowColor: "#1E3A8A",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    historyItemRight: {
        flex: 1,
        justifyContent: "center",
    },
    historyDate: {
        color: "#60A5FA",
        fontSize: 13,
        fontWeight: "700",
        textAlign: "center",
    },
    historyContent: {
        color: "#CBD5F5",
        fontSize: 13,
        lineHeight: 18,
    },
});
