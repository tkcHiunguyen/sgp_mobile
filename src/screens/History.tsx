import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    SectionList,
    TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


import { DateRangeNativePicker } from "../components/DateRangeFilter";
import { AppButton } from "../components/ui/AppButton";
import { AppScreen } from "../components/ui/AppScreen";
import { BaseModal } from "../components/ui/BaseModal";
import { EmptyState } from "../components/ui/EmptyState";
import HeaderBar from "../components/ui/HeaderBar";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import { useTheme } from "../context/ThemeContext";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { RootStackParamList } from "../types/navigation";

import type { ThemeColors } from "../theme/theme";
import type { DeviceGroup, DeviceRow, HistoryRow } from "../types/deviceGroup";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10); // "25" -> 2025
    return new Date(year, month, day);
};

// "PM5-VFD-61-27002" -> { group: "PM5", kind: "VFD", code: "61-27002" }
const parseDeviceCode = (fullCode: string) => {
    if (!fullCode) return { group: "", kind: "", code: "" };

    const parts = fullCode.split("-");
    if (parts.length < 2) {
        return { group: "", kind: "", code: fullCode };
    }

    const group = parts[0] || "";
    const kind = parts[1] || "";
    const code = parts.slice(2).join("-") || "";

    return { group, kind, code };
};

// bôi vàng phần match với query
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

const getHistoryRowKey = (item: HistoryRow): string =>
    `${item.deviceName || "device"}-${item.date || "date"}-${item.content || ""}`;

export default function HistoryScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const { deviceGroups } = useDeviceGroup();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    const [groupHistory, setGroupHistory] = useState<HistoryRow[]>([]);
    const [groupDevices, setGroupDevices] = useState<DeviceRow[]>([]);

    // search + filter theo thiết bị
    const [searchText, setSearchText] = useState("");
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [deviceFilterOpen, setDeviceFilterOpen] = useState(false);

    // filter theo ngày
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateFilterOpen, setDateFilterOpen] = useState(false);

    // modal xem danh sách thiết bị sửa nhiều nhất (trường hợp bằng nhau)
    const [topDeviceModalVisible, setTopDeviceModalVisible] = useState(false);

    // Danh sách tên nhóm thiết bị (table names) từ allData
    const groupNames = useMemo(
        () => deviceGroups.map((g: DeviceGroup) => g.table),
        [deviceGroups]
    );

    // map mã thiết bị -> mô tả (type) cho group hiện tại
    const deviceMap = useMemo(() => {
        const map: Record<string, DeviceRow> = {};
        groupDevices.forEach((d) => {
            if (d.name) {
                map[d.name] = d;
            }
        });
        return map;
    }, [groupDevices]);

    const handleSelectGroup = (groupName: string) => {
        setSelectedGroup(groupName);
        setModalVisible(false);

        const foundGroup = deviceGroups.find(
            (g: DeviceGroup) => g.table === groupName
        );

        if (!foundGroup) {
            setGroupHistory([]);
            setGroupDevices([]);
            setSelectedDevices([]);
            return;
        }

        const rows = foundGroup.history?.rows ?? [];
        const devices = foundGroup.devices?.rows ?? [];

        // Sắp xếp theo ngày
        const sorted = [...rows].sort((a, b) => {
            const da = parseDate(a.date).getTime();
            const db = parseDate(b.date).getTime();
            return db - da;
        });

        setGroupHistory(sorted);
        setGroupDevices(devices);

        /** 🔥 LẤY TẤT CẢ TÊN THIẾT BỊ TRONG GROUP */
        const allDeviceNames = Array.from(
            new Set(rows.map((r) => r.deviceName).filter(Boolean))
        );

        /** 🔥 MẶC ĐỊNH CHỌN TẤT CẢ */
        setSelectedDevices(allDeviceNames);

        // reset filter khác
        setSearchText("");
        setDeviceFilterOpen(false);
        setFromDate("");
        setToDate("");
        setDateFilterOpen(false);
    };

    // danh sách mã thiết bị (để filter)
    const deviceNamesInGroup = useMemo(() => {
        const set = new Set<string>();
        groupHistory.forEach((h) => {
            if (h.deviceName) set.add(h.deviceName);
        });
        return Array.from(set);
    }, [groupHistory]);

    // áp dụng filter + search + khoảng ngày
    const filteredHistory = useMemo(() => {
        if (!groupHistory.length) return [];

        const q = searchText.trim().toLowerCase();
        const hasFrom = fromDate.trim().length > 0;
        const hasTo = toDate.trim().length > 0;

        let fromTime = 0;
        let toTime = 0;

        try {
            if (hasFrom) {
                fromTime = parseDate(fromDate.trim()).getTime();
            }
            if (hasTo) {
                toTime = parseDate(toDate.trim()).getTime();
            }
        } catch {
            // nếu date nhập sai format thì coi như không áp dụng
            fromTime = 0;
            toTime = 0;
        }

        return groupHistory.filter((item) => {
            // ⭐ Nếu không chọn thiết bị nào → không hiển thị gì hết
            if (selectedDevices.length === 0) return false;

            // lọc theo thiết bị
            if (!selectedDevices.includes(item.deviceName)) return false;

            // lọc theo khoảng ngày
            if ((hasFrom || hasTo) && item.date) {
                const itemTime = parseDate(item.date).getTime();
                if (hasFrom && itemTime < fromTime) return false;
                if (hasTo && itemTime > toTime) return false;
            }

            // search theo nội dung / tên thiết bị
            if (!q) return true;

            const content = (item.content || "").toLowerCase();
            const deviceName = (item.deviceName || "").toLowerCase();

            return content.includes(q) || deviceName.includes(q);
        });
    }, [groupHistory, searchText, selectedDevices, fromDate, toDate]);

    // group theo date -> SectionList
    const sections = useMemo(() => {
        const bucket: Record<string, HistoryRow[]> = {};

        filteredHistory.forEach((item) => {
            const key = item.date || "Không rõ ngày";
            if (!bucket[key]) bucket[key] = [];
            bucket[key].push(item);
        });

        const keys = Object.keys(bucket).sort((a, b) => {
            const da = parseDate(a).getTime();
            const db = parseDate(b).getTime();
            return db - da; // mới -> cũ (theo parseDate)
        });

        return keys.map((k) => ({
            title: k,
            data: bucket[k],
        }));
    }, [filteredHistory]);

    // summary bar dựa trên filteredHistory
    const summary = useMemo(() => {
        if (!filteredHistory.length) {
            return {
                total: 0,
                lastDate: null as string | null,
                topDevice: null as string | null,
            };
        }

        const total = filteredHistory.length;

        // lastDate = max date
        const lastDate = filteredHistory
            .map((h) => h.date)
            .reduce((acc, cur) => {
                if (!acc) return cur;
                const da = parseDate(acc).getTime();
                const db = parseDate(cur).getTime();
                return db > da ? cur : acc;
            }, "" as string);

        // đếm theo device -> chọn 1 cái nhiều nhất để hiển thị default
        const freq: Record<string, number> = {};
        filteredHistory.forEach((h) => {
            if (!h.deviceName) return;
            freq[h.deviceName] = (freq[h.deviceName] || 0) + 1;
        });

        let topDevice: string | null = null;
        let topCount = 0;
        Object.entries(freq).forEach(([dev, count]) => {
            if (count > topCount) {
                topCount = count;
                topDevice = dev;
            }
        });

        return {
            total,
            lastDate,
            topDevice,
        };
    }, [filteredHistory]);

    // danh sách thiết bị sửa nhiều nhất (kể cả trường hợp bằng nhau)
    const topDevicesDetail = useMemo(() => {
        if (!filteredHistory.length) return [];

        const freq: Record<string, number> = {};
        filteredHistory.forEach((h) => {
            if (!h.deviceName) return;
            freq[h.deviceName] = (freq[h.deviceName] || 0) + 1;
        });

        const entries = Object.entries(freq);
        if (!entries.length) return [];

        const maxCount = entries.reduce(
            (max, [, count]) => (count > max ? count : max),
            0
        );

        return entries
            .filter(([, count]) => count === maxCount)
            .map(([deviceName, count]) => ({ deviceName, count }));
    }, [filteredHistory]);

    const allDevicesSelected =
        deviceNamesInGroup.length > 0 &&
        selectedDevices.length === deviceNamesInGroup.length;

    const renderDeviceFilterOption = ({ item: dev }: { item: string }) => {
        const active = selectedDevices.includes(dev);

        return (
            <TouchableOpacity
                style={[
                    styles.filterOption,
                    active && styles.filterOptionActive,
                ]}
                onPress={() => {
                    setSelectedDevices((prev) =>
                        prev.includes(dev)
                            ? prev.filter((d) => d !== dev)
                            : [...prev, dev]
                    );
                }}
            >
                <View style={styles.filterOptionRow}>
                    <Text style={styles.filterOptionText}>{dev}</Text>

                    <View
                        style={[
                            styles.checkbox,
                            active && styles.checkboxActive,
                        ]}
                    >
                        {active && (
                            <Ionicons
                                name="checkmark"
                                style={styles.checkboxIcon}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderTopDeviceItem = ({
        item,
    }: {
        item: { deviceName: string; count: number };
    }) => {
        const meta = deviceMap[item.deviceName];
        const parsed = parseDeviceCode(item.deviceName);

        return (
            <View style={styles.topDeviceItem}>
                <View style={styles.deviceLine}>
                    {!!parsed.group && (
                        <Text style={styles.deviceTag}>{parsed.group}</Text>
                    )}
                    {!!parsed.kind && (
                        <Text style={styles.deviceTag}>{parsed.kind}</Text>
                    )}
                    <Text style={styles.deviceCode}>
                        {parsed.code || item.deviceName}
                    </Text>
                </View>
                {meta?.type ? (
                    <Text style={styles.deviceDesc}>{meta.type}</Text>
                ) : null}
                <Text style={styles.topDeviceCount}>Số lần sửa: {item.count}</Text>
            </View>
        );
    };

    const renderHistoryItem = ({ item }: { item: HistoryRow }) => {
        const parsed = parseDeviceCode(item.deviceName);
        const meta = deviceMap[item.deviceName];

        const displayCode = parsed.code || item.deviceName;

        return (
            <View style={styles.historyCard}>
                {/* Hàng: group - kind - code */}
                <View style={styles.deviceLine}>
                    {!!parsed.group && (
                        <Text style={styles.deviceTag}>{parsed.group}</Text>
                    )}
                    {!!parsed.kind && (
                        <Text style={styles.deviceTag}>{parsed.kind}</Text>
                    )}

                    {highlightText(
                        displayCode,
                        searchText,
                        styles.deviceCode,
                        styles.highlight
                    )}
                </View>

                {/* Mô tả thiết bị (lấy từ bảng thiết bị) */}
                {meta?.type
                    ? highlightText(
                          meta.type,
                          searchText,
                          styles.deviceDesc,
                          styles.highlight
                      )
                    : null}

                {/* Nội dung bảo trì được đặt trong box nền khác */}
                <View style={styles.historyContentBox}>
                    {highlightText(
                        item.content,
                        searchText,
                        styles.historyContent,
                        styles.highlight
                    )}
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (!selectedGroup) {
            return (
                <EmptyState message="Vui lòng chọn nhóm thiết bị để xem lịch sử." />
            );
        }

        if (!groupHistory.length) {
            return (
                <EmptyState
                    message={`Không có bản ghi lịch sử cho nhóm ${selectedGroup}.`}
                />
            );
        }

        const hasManyTopDevices = topDevicesDetail.length > 1;

        return (
            <>
                {/* Summary bar */}
                <View style={styles.summaryBar}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Tổng số lần</Text>
                        <Text style={styles.summaryValue}>{summary.total}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Lần gần nhất</Text>
                        <Text style={styles.summaryValue}>
                            {summary.lastDate || "-"}
                        </Text>
                    </View>
                    <View style={styles.summaryItemWide}>
                        <Text style={styles.summaryLabel}>
                            Thiết bị sửa nhiều nhất
                        </Text>

                        {!filteredHistory.length ? (
                            <Text style={styles.summaryValueSmall}>-</Text>
                        ) : hasManyTopDevices ? (
                            <AppButton
                                title="Xem"
                                variant="secondary"
                                onPress={() => setTopDeviceModalVisible(true)}
                                style={styles.summaryViewButton}
                            />
                        ) : (
                            <Text style={styles.summaryValueSmall}>
                                {topDevicesDetail[0]?.deviceName ||
                                    summary.topDevice ||
                                    "-"}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Thanh search + filter */}
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
                                placeholder="Tìm theo thiết bị / nội dung"
                                placeholderTextColor={colors.textMuted}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchText("")}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        style={styles.clearIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* FILTER BY DATE */}
                    <DateRangeNativePicker
                        open={dateFilterOpen}
                        onToggleOpen={() => {
                            setDateFilterOpen(!dateFilterOpen);
                            if (!dateFilterOpen) setDeviceFilterOpen(false);
                        }}
                        onClose={() => setDateFilterOpen(false)}
                        fromDate={fromDate}
                        toDate={toDate}
                        onChange={({ fromDate: nextFromDate, toDate: nextToDate }) => {
                            setFromDate(nextFromDate);
                            setToDate(nextToDate);
                        }}
                        title="Lọc thời gian"
                        fromLabel="Từ ngày"
                        toLabel="Đến ngày"
                    />

                    {/* FILTER BY DEVICE */}
                    <View style={styles.filterWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.filterBox,
                                selectedDevices.length > 0 &&
                                    styles.filterBoxActive,
                            ]}
                            onPress={() => {
                                setDeviceFilterOpen(!deviceFilterOpen);
                                if (!deviceFilterOpen) setDateFilterOpen(false);
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="funnel-outline"
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>

                        {deviceFilterOpen && (
                            <View style={styles.filterDropdown}>
                                <FlatList
                                    data={deviceNamesInGroup}
                                    keyExtractor={(item) => item}
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={false}
                                    renderItem={renderDeviceFilterOption}
                                    ListHeaderComponent={
                                        <TouchableOpacity
                                            style={[
                                                styles.filterOption,
                                                allDevicesSelected &&
                                                    styles.filterOptionActive,
                                            ]}
                                            onPress={() => {
                                                if (allDevicesSelected) {
                                                    setSelectedDevices([]);
                                                } else {
                                                    setSelectedDevices(
                                                        deviceNamesInGroup
                                                    );
                                                }
                                            }}
                                        >
                                            <View style={styles.filterOptionRow}>
                                                <Text
                                                    style={
                                                        styles.filterOptionText
                                                    }
                                                >
                                                    Tất cả thiết bị
                                                </Text>

                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        allDevicesSelected &&
                                                            styles.checkboxActive,
                                                    ]}
                                                >
                                                    {allDevicesSelected && (
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
                                    }
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* List theo ngày (SectionList) */}
                <SectionList
                    sections={sections}
                    keyExtractor={getHistoryRowKey}
                    stickySectionHeadersEnabled
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{title}</Text>
                        </View>
                    )}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                />
            </>
        );
    };

    return (
        <AppScreen topPadding={0}>
            {/* Header */}
            <HeaderBar
                title="Lịch sử bảo trì"
                onBack={() => navigation.goBack()}
            />

            {/* CONTENT */}
            <View style={styles.content}>
                {/* Overlay để click ra ngoài đóng dropdown filter */}
                {(deviceFilterOpen || dateFilterOpen) && (
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setDeviceFilterOpen(false);
                            setDateFilterOpen(false);
                        }}
                    >
                        <View style={styles.filterBackdrop} />
                    </TouchableWithoutFeedback>
                )}

                {/* Nút chọn nhóm thiết bị */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.dropdownText}>
                        {selectedGroup || "Chọn nhóm thiết bị"}
                    </Text>
                </TouchableOpacity>

                {/* Nội dung lịch sử */}
                {renderContent()}
            </View>

            {/* Modal chọn nhóm */}
            <BaseModal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                width="90%"
            >
                <Text style={styles.modalTitle}>Chọn nhóm thiết bị</Text>
                <SectionList
                    sections={[
                        {
                            title: "Nhóm thiết bị",
                            data: groupNames,
                        },
                    ]}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.deviceItem}
                            onPress={() => handleSelectGroup(item)}
                        >
                            <Text style={styles.deviceText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
                <AppButton
                    title="Đóng"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCloseButton}
                />
            </BaseModal>

            {/* Modal thiết bị sửa nhiều nhất (nhiều thiết bị cùng số lần) */}
            <BaseModal
                visible={topDeviceModalVisible}
                onRequestClose={() => setTopDeviceModalVisible(false)}
                width="90%"
            >
                <View style={styles.topDeviceModal}>
                    <Text style={styles.modalTitle}>
                        Thiết bị sửa nhiều nhất
                    </Text>

                    {topDevicesDetail.length === 0 ? (
                        <Text style={styles.deviceText}>
                            Không có dữ liệu để hiển thị.
                        </Text>
                    ) : (
                        <View style={styles.topDeviceListWrapper}>
                            <FlatList
                                data={topDevicesDetail}
                                keyExtractor={(item) => item.deviceName}
                                renderItem={renderTopDeviceItem}
                                style={styles.topDeviceList}
                                contentContainerStyle={
                                    styles.topDeviceListContent
                                }
                                showsVerticalScrollIndicator
                                nestedScrollEnabled
                            />
                        </View>
                    )}

                    <AppButton
                        title="Đóng"
                        variant="secondary"
                        onPress={() => setTopDeviceModalVisible(false)}
                        style={styles.modalCloseButton}
                    />
                </View>
            </BaseModal>
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    /* ========= SCREEN LAYOUT ========= */
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
        position: "relative",
    },

    /* Overlay dùng để click ra ngoài đóng dropdown filter */
    filterBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 1,
    },

    /* ========= GROUP DROPDOWN (CHỌN NHÓM THIẾT BỊ) ========= */
    dropdownButton: {
        backgroundColor: colors.surface,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 12,
    },
    dropdownText: {
        color: colors.text,
        ...textStyle(14),
        textAlign: "center",
    },

    /* ========= GENERIC MODAL STYLES (DÙNG CHUNG) ========= */
    modalTitle: {
        ...textStyle(18, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.text,
        marginBottom: 10,
        textAlign: "center",
    },
    deviceItem: {
        backgroundColor: colors.surface,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    deviceText: {
        color: colors.text,
        ...textStyle(14, { lineHeightPreset: "tight" }),
        textAlign: "center",
    },
    modalCloseButton: {
        marginTop: 16,
    },

    /* ========= SUMMARY BAR ========= */
    summaryBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 10,
    },
    summaryItem: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    summaryItemWide: {
        flex: 1,
        alignItems: "flex-end",
    },
    summaryLabel: {
        color: colors.textMuted,
        ...textStyle(11, { lineHeightPreset: "tight" }),
        marginBottom: 2,
    },
    summaryValue: {
        color: colors.textAccent,
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
    summaryValueSmall: {
        color: colors.text,
        ...textStyle(12, { weight: "600", lineHeightPreset: "tight" }),
        textAlign: "right",
    },
    summaryViewButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginTop: 2,
        alignSelf: "flex-end",
    },

    /* ========= SEARCH + FILTER BAR ========= */
    searchFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
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
    clearIcon: {
        fontSize: 18,
        color: colors.textMuted,
        marginLeft: 4,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        ...textStyle(14, { lineHeightPreset: "tight" }),
        paddingVertical: 0,
    },

    /* ========= FILTER ICONS (THIẾT BỊ / NGÀY) ========= */
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
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    filterBoxActive: {
        backgroundColor: colors.backgroundAlt,
    },
    filterIcon: {
        fontSize: 20,
        color: colors.textAccent,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    /* ========= DROPDOWN FILTER THIẾT BỊ ========= */
    filterDropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 180,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        zIndex: 999,
        elevation: 10,
        maxHeight: 260,
        paddingBottom: 6,
    },
    filterOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    filterOptionActive: {
        backgroundColor: colors.backgroundAlt,
    },
    filterOptionText: {
        ...textStyle(13, { lineHeightPreset: "tight" }),
        color: colors.text,
    },

    /* ========= DROPDOWN FILTER NGÀY ========= */
    dateDropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 220,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        zIndex: 999,
        elevation: 10,
        padding: 10,
    },
    dateHint: {
        ...textStyle(11, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
        marginBottom: 6,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    dateLabel: {
        width: 32,
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
    },
    dateInput: {
        flex: 1,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingHorizontal: 8,
        color: colors.text,
        ...textStyle(13, { lineHeightPreset: "tight" }),
        backgroundColor: colors.surfaceAlt,
    },
    dateActionsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },
    dateActionText: {
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textAccent,
        marginLeft: 16,
    },

    /* ========= SECTION HEADER (THEO NGÀY) ========= */
    sectionHeader: {
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 4,
        paddingBottom: 4,
        paddingHorizontal: 2,
        backgroundColor: colors.background,
        zIndex: 2,
        elevation: 2,
    },
    sectionHeaderText: {
        color: colors.textSoft,
        ...textStyle(12, { weight: "700", lineHeightPreset: "tight" }),
    },

    /* ========= HISTORY CARD ========= */
    historyCard: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    deviceLine: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        flexWrap: "wrap",
    },
    deviceTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        color: colors.textAccent,
        ...textStyle(11, { weight: "600", lineHeightPreset: "tight" }),
        marginRight: 6,
    },
    deviceCode: {
        color: colors.text,
        ...textStyle(15, { weight: "700", lineHeightPreset: "tight" }),
        flexShrink: 1,
    },
    deviceDesc: {
        color: colors.textSoft,
        ...textStyle(13, { lineHeightPreset: "tight" }),
        marginBottom: 4,
    },

    /* ========= HISTORY CONTENT BOX ========= */
    historyContentBox: {
        marginTop: 4,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: colors.backgroundAlt,
    },
    historyContent: {
        color: colors.textSoft,
        ...textStyle(13, { lineHeightPreset: "normal" }),
    },

    highlight: {
        backgroundColor: colors.warning,
        color: colors.background,
        borderRadius: 10,
        overflow: "hidden",
    },

    /* ========= TOP DEVICE MODAL ========= */
    topDeviceModal: {
        maxHeight: "80%",
    },
    topDeviceListWrapper: {
        maxHeight: 320,
        marginTop: 8,
        marginBottom: 8,
    },
    topDeviceList: {
        // để trống cho ScrollView fill wrapper
    },
    topDeviceListContent: {
        paddingBottom: 4,
    },
    topDeviceItem: {
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    topDeviceCount: {
        marginTop: 4,
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
    },
    filterOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        ...textStyle(14, { lineHeightPreset: "tight" }),
        color: colors.success,
    },
    });
