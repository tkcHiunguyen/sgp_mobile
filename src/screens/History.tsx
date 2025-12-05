import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import BackButton from "../components/backButton";
import DataSyncIndicator from "../components/DataSyncIndicator";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

// helper: chuyển "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10); // "25" -> 2025
    return new Date(year, month, day);
};

export default function HistoryScreen({ navigation }: Props) {
    const { deviceGroups } = useDeviceGroup();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    const [historyData, setHistoryData] = useState<
        { deviceName: string; date: string; content: string }[]
    >([]);

    // Danh sách tên nhóm thiết bị (table names) từ allData
    const groupNames = useMemo(
        () => deviceGroups.map((g: any) => g.table as string),
        [deviceGroups]
    );

    // Khi chọn group -> lấy lịch sử từ allData, sort ngày giảm dần
    const handleSelectGroup = (groupName: string) => {
        setSelectedGroup(groupName);
        setModalVisible(false);

        const foundGroup = deviceGroups.find((g: any) => g.table === groupName);

        if (!foundGroup || !foundGroup.history || !foundGroup.history.rows) {
            setHistoryData([]);
            return;
        }

        const rows = foundGroup.history.rows as {
            deviceName: string;
            date: string;
            content: string;
        }[];

        // sort theo ngày mới -> cũ
        const sorted = [...rows].sort((a, b) => {
            const da = parseDate(a.date).getTime();
            const db = parseDate(b.date).getTime();
            return db - da;
        });

        setHistoryData(sorted);
    };

    const renderHistoryItem = ({
        item,
    }: {
        item: { deviceName: string; date: string; content: string };
    }) => {
        const [groupCode, deviceCode] = item.deviceName.split("_");
        return (
            <View style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                    <Text style={styles.deviceName}>
                        {deviceCode || item.deviceName}
                    </Text>
                    <Text style={styles.deviceGroup}>
                        {groupCode || selectedGroup}
                    </Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <View style={styles.historyItemRight}>
                    <ScrollView style={styles.contentWrapper}>
                        <Text style={styles.content}>{item.content}</Text>
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Back góc trái */}
            <BackButton onPress={() => navigation.goBack()} />
            {/* Sync icon góc phải */}
            <DataSyncIndicator />

            <View style={styles.container}>
                <Text style={styles.header}>Lịch sử bảo trì</Text>

                {/* Nút chọn nhóm thiết bị */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.dropdownText}>
                        {selectedGroup || "Chọn nhóm thiết bị"}
                    </Text>
                </TouchableOpacity>

                {/* Modal chọn nhóm */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Chọn nhóm thiết bị
                            </Text>
                            <FlatList
                                data={groupNames}
                                keyExtractor={(name) => name}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.deviceItem}
                                        onPress={() => handleSelectGroup(item)}
                                    >
                                        <Text style={styles.deviceText}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
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

                {/* Nội dung lịch sử */}
                {!selectedGroup ? (
                    <View style={styles.center}>
                        <Text style={styles.noDataText}>
                            Vui lòng chọn nhóm thiết bị
                        </Text>
                    </View>
                ) : historyData.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.noDataText}>
                            Không có bản ghi lịch sử cho nhóm {selectedGroup}.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={historyData}
                        renderItem={renderHistoryItem}
                        keyExtractor={(item, index) =>
                            `${item.deviceName}-${item.date}-${index}`
                        }
                        contentContainerStyle={{ paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#020617",
    },
    header: {
        fontSize: 26,
        fontWeight: "900",
        color: "#E5F2FF",
        marginBottom: 24,
        textAlign: "center",
        letterSpacing: 0.8,
    },
    container: {
        flex: 1,
        backgroundColor: "#020617",
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    dropdownButton: {
        backgroundColor: "#0F172A",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.45)",
        marginBottom: 18,
    },
    dropdownText: {
        color: "#E5F2FF",
        fontSize: 14,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#020617",
        padding: 20,
        borderRadius: 14,
        width: "80%",
        maxHeight: "80%",
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.6)",
    },
    modalTitle: {
        fontSize: 18,
        color: "#E5F2FF",
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "700",
    },
    deviceItem: {
        backgroundColor: "#0F172A",
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.8)",
    },
    deviceText: {
        color: "#E5F2FF",
        fontSize: 14,
        textAlign: "center",
    },
    closeButton: {
        backgroundColor: "#1D4ED8",
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    closeButtonText: {
        color: "#FFF",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "600",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    noDataText: {
        color: "#9CA3AF",
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    historyItem: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#0F172A",
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(55,65,81,0.9)",
    },
    historyItemLeft: {
        flex: 1,
        justifyContent: "center",
        padding: 10,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: "#111827",
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.45)",
        shadowColor: "#1E3A8A",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    historyItemRight: {
        flex: 2,
        justifyContent: "center",
        paddingLeft: 4,
    },
    deviceName: {
        color: "#E5F2FF",
        fontSize: 15,
        fontWeight: "700",
    },
    deviceGroup: {
        color: "#9CA3AF",
        fontSize: 12,
        marginTop: 2,
    },
    date: {
        color: "#60A5FA",
        fontSize: 12,
        marginTop: 4,
    },
    contentWrapper: {
        maxHeight: 90,
    },
    content: {
        color: "#CBD5F5",
        fontSize: 13,
        lineHeight: 18,
        paddingRight: 6,
    },
});
