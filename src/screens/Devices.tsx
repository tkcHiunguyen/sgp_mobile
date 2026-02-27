import { useFocusEffect } from "@react-navigation/native";
import React, {
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
    TextInput,
    Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AddHistoryAction } from "../components/maintenance/AddHistoryButton";
import { AppButton } from "../components/ui/AppButton";
import { AppScreen } from "../components/ui/AppScreen";
import { BaseModal } from "../components/ui/BaseModal";
import { EmptyState } from "../components/ui/EmptyState";
import HeaderBar from "../components/ui/HeaderBar";
import { getSheetId, getApiBase } from "../config/apiConfig";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import { useTheme } from "../context/ThemeContext";
import { MIN_TOUCH_TARGET_SIZE } from "../theme/touchTargets";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

import {
    parseDeviceCode,
    useDevicesData,
} from "./devices/hooks/useDevicesData";

import type { ThemeColors } from "../theme/theme";
import type { DeviceRow, HistoryRow } from "../types/deviceGroup";
import type { RootStackParamList } from "../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Devices">;

// helper: parse "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10);
    return new Date(year, month, day);
};

const getHistoryRowKey = (item: HistoryRow): string =>
    `${item.deviceName || "device"}-${item.date || "date"}-${item.content || ""}`;

const getDeviceRowKey = (item: DeviceRow): string =>
    String(item.id || item.name || "");

const highlightText = (
    text: string,
    query: string,
    baseStyle: any,
    highlightStyle: any
) => {
    const q = query.trim();
    if (!q) return <Text style={baseStyle}>{text}</Text>;

    const lowerText = (text || "").toLowerCase();
    const lowerQ = q.toLowerCase();

    let currentIndex = 0;
    const parts: React.ReactNode[] = [];
    let matchIndex = lowerText.indexOf(lowerQ, currentIndex);

    if (matchIndex === -1) return <Text style={baseStyle}>{text}</Text>;

    while (matchIndex !== -1) {
        if (matchIndex > currentIndex) {
            parts.push(text.slice(currentIndex, matchIndex));
        }

        parts.push(
            <Text key={`${matchIndex}-${currentIndex}`} style={highlightStyle}>
                {text.slice(matchIndex, matchIndex + q.length)}
            </Text>
        );

        currentIndex = matchIndex + q.length;
        matchIndex = lowerText.indexOf(lowerQ, currentIndex);
    }

    if (currentIndex < text.length) {
        parts.push(text.slice(currentIndex));
    }

    return <Text style={baseStyle}>{parts}</Text>;
};

export default function DevicesScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const { deviceGroups, appendHistoryAndSync } = useDeviceGroup();

    const groups = deviceGroups ?? [];

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [deviceModalVisible, setDeviceModalVisible] = useState(false);

    const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(
        null
    );
    const [showDeviceHistory, setShowDeviceHistory] = useState(false);
    const [maintenanceHistory, setMaintenanceHistory] = useState<HistoryRow[]>(
        []
    );

    // search + filter
    const [searchText, setSearchText] = useState("");
    const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
    const [kindsInitialized, setKindsInitialized] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedGroup(null);
                setDeviceModalVisible(false);

                setSelectedDeviceName(null);
                setShowDeviceHistory(false);
                setMaintenanceHistory([]);

                setSearchText("");
                setSelectedKinds([]);
                setKindsInitialized(false);
                setFilterDropdownOpen(false);
            };
        }, [])
    );

    const {
        selectedGroupData,
        devicesInGroup,
        availableKinds,
        allKindsActive,
        filteredDevices,
    } = useDevicesData({
        deviceGroups: groups,
        selectedGroup,
        searchText,
        selectedKinds,
    });

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

    const handleOpenGroup = (groupName: string) => {
        setSelectedGroup(groupName);
        setDeviceModalVisible(true);

        setSearchText("");
        setSelectedKinds([]);
        setKindsInitialized(false);
        setFilterDropdownOpen(false);
        setSelectedDeviceName(null);
        setMaintenanceHistory([]);
        setShowDeviceHistory(false);
    };

    const handleOpenDeviceHistory = (deviceCode: string) => {
        const normalizedDeviceCode = (deviceCode || "").trim().toLowerCase();
        const allHistory: HistoryRow[] =
            (selectedGroupData?.history?.rows as HistoryRow[]) || [];

        const filtered = allHistory.filter(
            (h) => (h.deviceName || "").trim().toLowerCase() === normalizedDeviceCode
        );

        const sorted = [...filtered].sort(
            (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
        );

        setSelectedDeviceName(deviceCode);
        setMaintenanceHistory(sorted);
        setFilterDropdownOpen(false);
        setShowDeviceHistory(true);
    };

    const closeDeviceModal = () => {
        setDeviceModalVisible(false);
        setFilterDropdownOpen(false);
        setSelectedDeviceName(null);
        setMaintenanceHistory([]);
        setShowDeviceHistory(false);
    };

    const closeHistoryView = () => {
        setShowDeviceHistory(false);
        setMaintenanceHistory([]);
        setSelectedDeviceName(null);
    };

    const handleDeviceModalRequestClose = () => {
        if (showDeviceHistory) {
            closeHistoryView();
            return;
        }
        closeDeviceModal();
    };

    const toggleKind = (kind: string) => {
        setSelectedKinds((prev) =>
            prev.includes(kind)
                ? prev.filter((k) => k !== kind)
                : [...prev, kind]
        );
    };

    const toggleAllKinds = () => {
        if (allKindsActive) setSelectedKinds([]);
        else setSelectedKinds(availableKinds);
        setKindsInitialized(true);
    };

    const hasFilter =
        availableKinds.length > 0 &&
        (selectedKinds.length === 0 ||
            selectedKinds.length !== availableKinds.length);

    const showClearSearch = searchText.trim().length > 0;

    return (
        <AppScreen topPadding={0}>
            <HeaderBar
                title="Danh sách nhóm thiết bị"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.content}>
                {groups.length === 0 ? (
                    <EmptyState message="Chưa có nhóm thiết bị. Vui lòng đồng bộ hoặc thêm dữ liệu nhóm thiết bị." />
                ) : (
                    <FlatList
                        data={groups}
                        keyExtractor={(item) => String(item.table || "")}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.cardWrapper}
                                onPress={() => handleOpenGroup(item.table)}
                                activeOpacity={0.85}
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
                onRequestClose={handleDeviceModalRequestClose}
                width={showDeviceHistory ? "90%" : "96%"}
            >
                {showDeviceHistory ? (
                    <>
                        <Text style={styles.modalTitle}>
                            Lịch sử bảo trì của {selectedDeviceName}
                        </Text>

                        {maintenanceHistory.length > 0 ? (
                            <FlatList
                                data={maintenanceHistory}
                                keyExtractor={getHistoryRowKey}
                                style={styles.modalScroll}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View
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
                                )}
                            />
                        ) : (
                            <Text style={styles.noData}>
                                Không có lịch sử bảo trì cho thiết bị này.
                            </Text>
                        )}

                        <AppButton
                            title="Đóng"
                            variant="secondary"
                            onPress={closeHistoryView}
                            style={{ marginTop: 8 }}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.modalTitle}>
                            Thiết bị trong nhóm {selectedGroup}
                        </Text>

                        {devicesInGroup.length > 0 ? (
                            <>
                                {/* SEARCH + FILTER */}
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
                                                hasFilter &&
                                                    styles.filterBoxActive,
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
                                                                        inputRange:
                                                                            [0, 1],
                                                                        outputRange:
                                                                            [0.96, 1],
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
                                                    activeOpacity={0.85}
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
                                                        selectedKinds.includes(
                                                            kind
                                                        );
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
                                                            activeOpacity={0.85}
                                                        >
                                                            <View
                                                                style={
                                                                    styles.filterOptionRow
                                                                }
                                                            >
                                                                {highlightText(
                                                                    kind,
                                                                    searchText,
                                                                    styles.filterOptionText,
                                                                    styles.highlight
                                                                )}

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

                                <FlatList
                                    data={filteredDevices}
                                    keyExtractor={getDeviceRowKey}
                                    style={styles.modalScroll}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item: dev }) => {
                                        const parsed = parseDeviceCode(dev.name);
                                        const codeText = parsed.code || dev.name;

                                        return (
                                            <TouchableOpacity
                                                style={styles.deviceRow}
                                                activeOpacity={0.85}
                                                onPress={() =>
                                                    handleOpenDeviceHistory(
                                                        dev.name
                                                    )
                                                }
                                                >
                                                <View style={styles.deviceBlock}>
                                                    <View
                                                        style={styles.deviceTopRow}
                                                    >
                                                        <View
                                                            style={
                                                                styles.deviceTagGroup
                                                            }
                                                        >
                                                            {!!parsed.group &&
                                                                highlightText(
                                                                    parsed.group,
                                                                    searchText,
                                                                    styles.deviceTag,
                                                                    styles.highlight
                                                                )}

                                                            {!!parsed.kind &&
                                                                highlightText(
                                                                    parsed.kind,
                                                                    searchText,
                                                                    styles.deviceTag,
                                                                    styles.highlight
                                                                )}

                                                            {highlightText(
                                                                codeText,
                                                                searchText,
                                                                styles.deviceCode,
                                                                styles.highlight
                                                            )}
                                                        </View>

                                                        <View
                                                            style={styles.addActionWrap}
                                                            onStartShouldSetResponder={() =>
                                                                true
                                                            }
                                                        >
                                                            <AddHistoryAction
                                                                appScriptUrl={getApiBase()}
                                                                sheetId={getSheetId()}
                                                                sheetName={
                                                                    selectedGroup ??
                                                                    ""
                                                                }
                                                                deviceName={
                                                                    dev.name
                                                                }
                                                                iconSize={18}
                                                                disabled={
                                                                    !selectedGroup
                                                                }
                                                                onPosted={async (
                                                                    row
                                                                ) => {
                                                                    await appendHistoryAndSync(
                                                                        {
                                                                            sheetName:
                                                                                selectedGroup ??
                                                                                "",
                                                                            row,
                                                                        }
                                                                    );

                                                                    if (
                                                                        selectedDeviceName ===
                                                                        row.deviceName
                                                                    ) {
                                                                        setMaintenanceHistory(
                                                                            (
                                                                                prev
                                                                            ) => [
                                                                                row,
                                                                                ...prev,
                                                                            ]
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </View>
                                                    </View>

                                                    {highlightText(
                                                        dev.type || "",
                                                        searchText,
                                                        styles.deviceDesc,
                                                        styles.highlight
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
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
                    </>
                )}
            </BaseModal>
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },

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
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
        paddingHorizontal: 10,
    },
    cardText: {
        color: colors.text,
        ...textStyle(16, { weight: "700", lineHeightPreset: "tight" }),
        textAlign: "center",
    },

    modalTitle: {
        ...textStyle(18, { weight: "800", lineHeightPreset: "tight" }),
        color: colors.text,
        marginBottom: 12,
        textAlign: "center",
    },
    modalScroll: {
        marginBottom: 16,
        paddingHorizontal: 0,
    },
    noData: {
        paddingBottom: 20,
        color: colors.textMuted,
        textAlign: "center",
        marginTop: 20,
        ...textStyle(14),
    },

    // search/filter
    searchFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        paddingHorizontal: 0,
    },
    searchWrapper: {
        flex: 1,
        marginRight: 8,
    },
    searchInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
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
        ...textStyle(14, { lineHeightPreset: "tight" }),
        paddingVertical: 0,
    },
    clearIcon: {
        fontSize: 18,
        color: colors.textMuted,
        marginLeft: 4,
    },

    filterWrapper: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    filterBox: {
        width: MIN_TOUCH_TARGET_SIZE,
        height: MIN_TOUCH_TARGET_SIZE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    filterBoxActive: {
        borderColor: colors.primaryBorderStrong,
        backgroundColor: colors.backgroundAlt,
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
        backgroundColor: colors.success,
    },

    filterDropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 170,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        zIndex: 999,
        elevation: 10,
        paddingVertical: 4,
    },
    filterOption: {
        minHeight: MIN_TOUCH_TARGET_SIZE,
        paddingVertical: 6,
        paddingHorizontal: 10,
        justifyContent: "center",
    },
    filterOptionActive: {
        backgroundColor: colors.backgroundAlt,
    },
    filterOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    filterOptionText: {
        ...textStyle(13, { lineHeightPreset: "tight" }),
        color: colors.text,
        flexShrink: 1,
        paddingRight: 8,
    },

    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    checkboxActive: {
        borderColor: colors.success,
        backgroundColor: "rgba(34,197,94,0.12)",
    },
    checkboxIcon: {
        fontSize: 14,
        color: colors.success,
    },

    // devices
    deviceRow: {
        marginBottom: 10,
        width: "100%",
    },
    deviceBlock: {
        width: "100%",
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },
    deviceTopRow: {
        position: "relative",
        minHeight: 34,
        marginBottom: 6,
    },
    deviceTagGroup: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        minWidth: 0,
        flexShrink: 1,
        flexWrap: "wrap",
        paddingRight: 44,
    },
    deviceTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        color: colors.textAccent,
        ...textStyle(12, { weight: "600", lineHeightPreset: "tight" }),
        marginRight: 6,
        marginBottom: 2,
    },
    deviceCode: {
        color: colors.text,
        ...textStyle(15, { weight: "700", lineHeightPreset: "tight" }),
        marginLeft: 0,
        flexShrink: 1,
    },
    deviceDesc: {
        color: colors.textSoft,
        ...textStyle(14, { lineHeightPreset: "loose" }),
        textAlign: "left",
    },
    addActionWrap: {
        position: "absolute",
        right: 0,
        top: 0,
    },

    highlight: {
        backgroundColor: colors.warning,
        color: colors.background,
        borderRadius: 3,
        overflow: "hidden",
    },

    // history
    historyItem: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    historyItemLeft: {
        width: 90,
        justifyContent: "center",
        padding: 8,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        shadowColor: colors.accent,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    historyItemRight: { flex: 1, justifyContent: "center" },
    historyDate: {
        color: colors.textAccent,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
        textAlign: "center",
    },
    historyContent: {
        color: colors.textSoft,
        ...textStyle(13, { lineHeightPreset: "normal" }),
    },
    });
