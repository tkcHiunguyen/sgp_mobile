import React, {
    useMemo,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";

import { RootStackParamList } from "../types/navigation";
import { useDeviceGroup } from "../context/DeviceGroupContext";

import { AppScreen } from "../components/ui/AppScreen";
import HeaderBar from "../components/ui/HeaderBar";
import { BaseModal } from "../components/ui/BaseModal";
import { EmptyState } from "../components/ui/EmptyState";
import { AppButton } from "../components/ui/AppButton";
import { colors } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Devices">;

// helper: parse "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10); // "25" -> 2025
    return new Date(year, month, day);
};

const parseDeviceCode = (fullCode: string) => {
    if (!fullCode) {
        return { group: "", kind: "", code: "" };
    }

    const parts = fullCode.split("-");
    if (parts.length < 2) {
        return { group: "", kind: "", code: fullCode };
    }

    const group = parts[0] || "";
    const kind = parts[1] || "";
    const code = parts.slice(2).join("-") || "";

    return { group, kind, code };
};

const highlightText = (
    text: string,
    query: string,
    baseStyle: any,
    highlightStyle: any
) => {
    const q = query.trim();
    if (!q) {
        return <Text style={baseStyle}>{text}</Text>;
    }

    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();

    let currentIndex = 0;
    const parts: React.ReactNode[] = [];
    let matchIndex = lowerText.indexOf(lowerQ, currentIndex);

    if (matchIndex === -1) {
        return <Text style={baseStyle}>{text}</Text>;
    }

    while (matchIndex !== -1) {
        if (matchIndex > currentIndex) {
            parts.push(
                <Text key={currentIndex} style={baseStyle}>
                    {text.slice(currentIndex, matchIndex)}
                </Text>
            );
        }

        parts.push(
            <Text key={matchIndex} style={[baseStyle, highlightStyle]}>
                {text.slice(matchIndex, matchIndex + q.length)}
            </Text>
        );

        currentIndex = matchIndex + q.length;
        matchIndex = lowerText.indexOf(lowerQ, currentIndex);
    }

    if (currentIndex < text.length) {
        parts.push(
            <Text key={`${currentIndex}-end`} style={baseStyle}>
                {text.slice(currentIndex)}
            </Text>
        );
    }

    return <Text>{parts}</Text>;
};

interface DeviceRow {
    id: string | null; // có thể rỗng
    name: string; // Mã thiết bị (PM5-VFD-...)
    type: string; // Mô tả / Chủng loại
    freq: string | number | null; // Tần suất bảo trì
}

interface HistoryRow {
    deviceName: string;
    date: string;
    content: string;
}
export default function DevicesScreen({ navigation }: Props) {
    const { deviceGroups } = useDeviceGroup();

    const groups = deviceGroups || [];

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [deviceModalVisible, setDeviceModalVisible] = useState(false);

    const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(
        null
    );
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [maintenanceHistory, setMaintenanceHistory] = useState<HistoryRow[]>(
        []
    );

    // state cho tìm kiếm + lọc loại
    const [searchText, setSearchText] = useState("");
    const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
    const [kindsInitialized, setKindsInitialized] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

    // animation cho dropdown
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (filterDropdownOpen) {
            dropdownAnim.setValue(0);
            Animated.timing(dropdownAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    }, [filterDropdownOpen, dropdownAnim]);

    // Reset state mỗi lần rời khỏi màn Devices
    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedGroup(null);
                setDeviceModalVisible(false);
                setSelectedDeviceName(null);
                setHistoryModalVisible(false);
                setMaintenanceHistory([]);
                setSearchText("");
                setSelectedKinds([]);
                setKindsInitialized(false);
                setFilterDropdownOpen(false);
            };
        }, [])
    );

    // Lấy data group đang chọn
    const selectedGroupData = useMemo(
        () => groups.find((g: any) => g.table === selectedGroup),
        [groups, selectedGroup]
    );

    const devicesInGroup: DeviceRow[] =
        (selectedGroupData?.devices?.rows as DeviceRow[]) || [];

    // Tập các loại (kind) phân tích từ mã thiết bị: PM5-VFD-... -> VFD, SOT, ...
    const availableKinds = useMemo(() => {
        const set = new Set<string>();
        devicesInGroup.forEach((dev) => {
            const parsed = parseDeviceCode(dev.name);
            if (parsed.kind) {
                set.add(parsed.kind);
            }
        });
        return Array.from(set).sort(); // sort cho gọn
    }, [devicesInGroup]);

    // ✅ Map theo pattern History:
    // - Khi mở group: mặc định chọn tất cả kinds
    // - "ALL active" khi selectedKinds === availableKinds
    // - Nếu selectedKinds rỗng => không hiển thị gì (giống History)
    useEffect(() => {
        if (
            deviceModalVisible &&
            !kindsInitialized &&
            availableKinds.length > 0
        ) {
            setSelectedKinds(availableKinds);
            setKindsInitialized(true);
        }
    }, [deviceModalVisible, kindsInitialized, availableKinds]);

    const allKindsActive =
        availableKinds.length === 0 ||
        selectedKinds.length === availableKinds.length;

    // Lọc theo search + loại (multi-select)
    const filteredDevices = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        return devicesInGroup.filter((dev) => {
            const parsed = parseDeviceCode(dev.name);

            // ✅ Pattern giống History:
            // - Không chọn gì => không hiển thị gì
            if (availableKinds.length > 0 && selectedKinds.length === 0) {
                return false;
            }

            // - Nếu không phải "ALL" thì mới lọc theo kind
            if (
                availableKinds.length > 0 &&
                !allKindsActive &&
                (!parsed.kind || !selectedKinds.includes(parsed.kind))
            ) {
                return false;
            }

            if (!q) return true;

            const code = parsed.code.toLowerCase();
            const name = dev.name.toLowerCase();
            const type = (dev.type || "").toLowerCase();

            return name.includes(q) || code.includes(q) || type.includes(q);
        });
    }, [
        devicesInGroup,
        searchText,
        selectedKinds,
        availableKinds,
        allKindsActive,
    ]);

    const handleOpenGroup = (groupName: string) => {
        setSelectedGroup(groupName);
        setDeviceModalVisible(true);
        // reset filter khi chọn group mới
        setSearchText("");
        setSelectedKinds([]);
        setKindsInitialized(false);
        setFilterDropdownOpen(false);
    };

    const handleOpenDeviceHistory = (deviceCode: string) => {
        if (!selectedGroupData || !selectedGroupData.history) return;

        const allHistory: HistoryRow[] =
            (selectedGroupData.history.rows as HistoryRow[]) || [];

        const filtered = allHistory.filter((h) => h.deviceName === deviceCode);

        const sorted = [...filtered].sort(
            (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
        );

        setSelectedDeviceName(deviceCode);
        setMaintenanceHistory(sorted);
        setHistoryModalVisible(true);
    };

    const closeDeviceModal = () => {
        setDeviceModalVisible(false);
        setFilterDropdownOpen(false);
    };

    const closeHistoryModal = () => {
        setHistoryModalVisible(false);
        setMaintenanceHistory([]);
        setSelectedDeviceName(null);
    };

    // toggle multi-select kind
    const toggleKind = (kind: string) => {
        setSelectedKinds((prev) => {
            if (prev.includes(kind)) {
                return prev.filter((k) => k !== kind);
            }
            return [...prev, kind];
        });
    };

    const toggleAllKinds = () => {
        if (allKindsActive) {
            // đang chọn tất cả -> bỏ hết (giống History)
            setSelectedKinds([]);
        } else {
            // chọn tất cả
            setSelectedKinds(availableKinds);
        }
        setKindsInitialized(true);
    };

    const hasFilter =
        availableKinds.length > 0 &&
        (selectedKinds.length === 0 ||
            selectedKinds.length !== availableKinds.length);

    const showClearSearch = searchText.trim().length > 0;

    // allKindsActive đã được tính phía trên theo pattern History

    return (
        <AppScreen topPadding={0}>
            {/* HEADER */}
            <HeaderBar
                title="Danh sách nhóm thiết bị"
                onBack={() => navigation.goBack()}
            />

            {/* CONTENT */}
            <View style={styles.content}>
                {groups.length === 0 ? (
                    <EmptyState message="Chưa có nhóm thiết bị. Vui lòng đồng bộ hoặc thêm dữ liệu nhóm thiết bị." />
                ) : (
                    <FlatList
                        data={groups}
                        keyExtractor={(item: any, index) =>
                            `${item.table}-${index}`
                        }
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
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
                )}
            </View>

            {/* MODAL: DANH SÁCH THIẾT BỊ TRONG NHÓM */}
            <BaseModal
                visible={deviceModalVisible}
                onRequestClose={closeDeviceModal}
                width="96%"
            >
                <Text style={styles.modalTitle}>
                    Thiết bị trong nhóm {selectedGroup}
                </Text>

                {devicesInGroup.length > 0 ? (
                    <>
                        {/* Thanh tìm kiếm + lọc */}
                        <View style={styles.searchFilterRow}>
                            {/* SEARCH */}
                            <View style={styles.searchWrapper}>
                                <View style={styles.searchInputRow}>
                                    <Ionicons
                                        name="search-outline"
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Tìm kiếm"
                                        placeholderTextColor={colors.textMuted}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                    />
                                    {showClearSearch && (
                                        <TouchableOpacity
                                            onPress={() => setSearchText("")}
                                            hitSlop={{
                                                top: 8,
                                                bottom: 8,
                                                left: 8,
                                                right: 8,
                                            }}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                style={styles.clearIcon}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* FILTER */}
                            <View style={styles.filterWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterBox,
                                        hasFilter && styles.filterBoxActive,
                                    ]}
                                    onPress={() =>
                                        setFilterDropdownOpen(
                                            !filterDropdownOpen
                                        )
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="filter-outline"
                                        style={styles.filterIcon}
                                    />
                                    {hasFilter && (
                                        <View style={styles.filterDot} />
                                    )}
                                </TouchableOpacity>

                                {filterDropdownOpen && (
                                    <Animated.View
                                        style={[
                                            styles.filterDropdown,
                                            {
                                                opacity: dropdownAnim,
                                                transform: [
                                                    {
                                                        scale: dropdownAnim.interpolate(
                                                            {
                                                                inputRange: [
                                                                    0, 1,
                                                                ],
                                                                outputRange: [
                                                                    0.96, 1,
                                                                ],
                                                            }
                                                        ),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.filterOption,
                                                allKindsActive &&
                                                    styles.filterOptionActive,
                                            ]}
                                            onPress={toggleAllKinds}
                                        >
                                            <View
                                                style={styles.filterOptionRow}
                                            >
                                                <Text
                                                    style={
                                                        styles.filterOptionText
                                                    }
                                                >
                                                    Tất cả loại
                                                </Text>

                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        allKindsActive &&
                                                            styles.checkboxActive,
                                                    ]}
                                                >
                                                    {allKindsActive && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            style={
                                                                styles.checkboxIcon
                                                            }
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>

                                        {availableKinds.map((kind) => {
                                            const active =
                                                selectedKinds.includes(kind);
                                            return (
                                                <TouchableOpacity
                                                    key={kind}
                                                    style={[
                                                        styles.filterOption,
                                                        active &&
                                                            styles.filterOptionActive,
                                                    ]}
                                                    onPress={() =>
                                                        toggleKind(kind)
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.filterOptionRow
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.filterOptionText
                                                            }
                                                        >
                                                            {kind}
                                                        </Text>
                                                        <View
                                                            style={[
                                                                styles.checkbox,
                                                                active &&
                                                                    styles.checkboxActive,
                                                            ]}
                                                        >
                                                            {active && (
                                                                <Ionicons
                                                                    name="checkmark"
                                                                    style={
                                                                        styles.checkboxIcon
                                                                    }
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </Animated.View>
                                )}
                            </View>
                        </View>

                        <ScrollView
                            style={styles.modalScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {filteredDevices.map((dev, index) => {
                                const parsed = parseDeviceCode(dev.name);
                                const displayCode = parsed.code || dev.name;

                                return (
                                    <TouchableOpacity
                                        key={`${dev.name}-${index}`}
                                        style={styles.deviceRow}
                                        onPress={() =>
                                            handleOpenDeviceHistory(dev.name)
                                        }
                                    >
                                        <View style={styles.deviceBlock}>
                                            {/* Hàng thông tin: tag + code cùng 1 hàng bên trái */}
                                            <View style={styles.deviceInfoRow}>
                                                <View
                                                    style={
                                                        styles.deviceTagGroup
                                                    }
                                                >
                                                    {!!parsed.group && (
                                                        <Text
                                                            style={
                                                                styles.deviceTag
                                                            }
                                                        >
                                                            {parsed.group}
                                                        </Text>
                                                    )}
                                                    {!!parsed.kind && (
                                                        <Text
                                                            style={
                                                                styles.deviceTag
                                                            }
                                                        >
                                                            {parsed.kind}
                                                        </Text>
                                                    )}

                                                    {highlightText(
                                                        displayCode,
                                                        searchText,
                                                        styles.deviceCode,
                                                        styles.highlight
                                                    )}
                                                </View>
                                            </View>

                                            {/* Mô tả thiết bị */}
                                            {highlightText(
                                                dev.type,
                                                searchText,
                                                styles.deviceDesc,
                                                styles.highlight
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </>
                ) : (
                    <Text style={styles.noData}>
                        Nhóm này chưa có thiết bị.
                    </Text>
                )}

                <AppButton
                    title="Đóng"
                    variant="secondary"
                    onPress={closeDeviceModal}
                    style={{ marginTop: 8 }}
                />
            </BaseModal>

            {/* MODAL: LỊCH SỬ BẢO TRÌ CỦA TỪNG THIẾT BỊ */}
            <BaseModal
                visible={historyModalVisible}
                onRequestClose={closeHistoryModal}
                width="90%"
            >
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

                <AppButton
                    title="Đóng"
                    variant="secondary"
                    onPress={closeHistoryModal}
                    style={{ marginTop: 8 }}
                />
            </BaseModal>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },

    // Grid nhóm thiết bị
    row: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 80,
    },
    cardWrapper: {
        flexBasis: "48%",
        marginBottom: 16,
    },
    card: {
        backgroundColor: colors.surface,
        paddingVertical: 22,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
        paddingHorizontal: 10,
    },
    cardText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },

    // Modal chung
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.text,
        marginBottom: 12,
        textAlign: "center",
    },
    modalScroll: {
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    noData: {
        paddingBottom: 20,
        color: colors.textMuted,
        textAlign: "center",
        marginTop: 20,
        fontSize: 14,
    },

    // ================= SEARCH + FILTER =================
    searchFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        paddingHorizontal: 8,
    },

    // SEARCH
    searchWrapper: {
        flex: 1,
        marginRight: 8,
    },
    searchInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.9)",
        backgroundColor: colors.surface,
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        fontSize: 18,
        color: colors.textMuted,
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
        paddingVertical: 0,
    },
    clearIcon: {
        fontSize: 18,
        color: colors.textMuted,
        marginLeft: 4,
    },

    // FILTER
    filterWrapper: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    filterBox: {
        width: 42,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.8)",
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    filterBoxActive: {
        borderColor: "#60A5FA",
        backgroundColor: "rgba(37,99,235,0.18)",
    },
    filterIcon: {
        fontSize: 20,
        color: colors.textAccent,
    },
    filterDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#22C55E",
    },

    // DROPDOWN OVERLAY
    filterDropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 170,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.8)",
        zIndex: 999,
        elevation: 10,
        paddingVertical: 4,
    },

    filterOption: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    filterOptionActive: {
        backgroundColor: "rgba(37,99,235,0.25)",
    },
    filterOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    filterOptionText: {
        fontSize: 13,
        color: colors.text,
    },

    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "rgba(156,163,175,0.9)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    checkboxActive: {
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.12)",
    },
    checkboxIcon: {
        fontSize: 14,
        color: "#22C55E",
    },

    // DANH SÁCH THIẾT BỊ TRONG NHÓM
    deviceRow: {
        marginBottom: 10,
    },
    deviceBlock: {
        borderWidth: 1,
        borderColor: "rgba(75,85,99,0.9)",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },

    // Hàng chứa tag + code (kiểu B: tất cả nằm bên trái)
    deviceInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    deviceTagGroup: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
        flexWrap: "wrap",
    },
    deviceTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.7)",
        color: colors.textAccent,
        fontSize: 12,
        fontWeight: "600",
        marginRight: 6,
        marginBottom: 2,
    },
    deviceCode: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "700",
        marginLeft: 4,
    },
    deviceDesc: {
        color: colors.textSoft,
        fontSize: 14,
        textAlign: "left",
        lineHeight: 20,
    },

    // highlight search text
    highlight: {
        backgroundColor: "#FACC15",
        color: "#111827",
        borderRadius: 3,
        overflow: "hidden",
    },

    // LỊCH SỬ BẢO TRÌ THIẾT BỊ
    historyItem: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.surface,
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
        backgroundColor: colors.surfaceAlt,
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
        color: colors.textAccent,
        fontSize: 13,
        fontWeight: "700",
        textAlign: "center",
    },
    historyContent: {
        color: colors.textSoft,
        fontSize: 13,
        lineHeight: 18,
    },
});
