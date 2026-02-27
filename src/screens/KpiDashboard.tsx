import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AppButton } from "../components/ui/AppButton";
import { AppScreen } from "../components/ui/AppScreen";
import { BaseModal } from "../components/ui/BaseModal";
import { EmptyState } from "../components/ui/EmptyState";
import HeaderBar from "../components/ui/HeaderBar";
import { useTheme } from "../context/ThemeContext";
import {
    clearAnalyticsSummary,
    getAnalyticsSummary,
    type AnalyticsSummaryItem,
} from "../services/analytics";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

import type { ThemeColors } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "KpiDashboard">;

const toLabel = (name: string): string => {
    switch (name) {
        case "login_success":
            return "Login thành công";
        case "time_to_home":
            return "Time to Home";
        case "scan_success":
            return "Scan thành công";
        case "add_history_success":
            return "Add history thành công";
        case "add_history_fail":
            return "Add history thất bại";
        default:
            return name;
    }
};

const formatDateTime = (ts: number | null) => {
    if (!ts) return "-";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN");
};

const payloadText = (payload: Record<string, unknown> | null): string => {
    if (!payload) return "-";
    try {
        return JSON.stringify(payload);
    } catch {
        return "-";
    }
};

export default function KpiDashboardScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const [summary, setSummary] = useState<AnalyticsSummaryItem[]>(() =>
        getAnalyticsSummary()
    );
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    const refresh = useCallback(() => {
        setSummary(getAnalyticsSummary());
    }, []);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const totalEvents = useMemo(
        () => summary.reduce((acc, item) => acc + item.count, 0),
        [summary]
    );

    const renderItem = ({ item }: { item: AnalyticsSummaryItem }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{toLabel(item.name)}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{item.count}</Text>
                    </View>
                </View>

                <Text style={styles.metaLine}>
                    Lần cuối: {formatDateTime(item.lastAt)}
                </Text>
                <Text style={styles.metaLine} numberOfLines={2}>
                    Payload: {payloadText(item.lastPayload)}
                </Text>
            </View>
        );
    };

    return (
        <AppScreen topPadding={0}>
            <HeaderBar title="KPI Usage" onBack={() => navigation.goBack()} />

            <View style={styles.headerRow}>
                <View style={styles.totalBox}>
                    <Ionicons
                        name="analytics-outline"
                        size={18}
                        color={colors.textAccent}
                    />
                    <Text style={styles.totalLabel}>
                        Tổng event đã ghi: {totalEvents}
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.refreshBtn,
                        pressed && styles.pressedSm,
                    ]}
                    onPress={refresh}
                >
                    <Ionicons
                        name="refresh"
                        size={18}
                        color={colors.text}
                    />
                </Pressable>
            </View>

            <FlatList
                data={summary}
                keyExtractor={(item) => item.name}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <EmptyState
                        title="Chưa có KPI"
                        message="Chưa có dữ liệu analytics để hiển thị."
                    />
                }
            />

            <View style={styles.footer}>
                <AppButton
                    title="Xoá dữ liệu KPI"
                    variant="danger"
                    onPress={() => setConfirmClearOpen(true)}
                />
            </View>

            <BaseModal
                visible={confirmClearOpen}
                onRequestClose={() => setConfirmClearOpen(false)}
                width="88%"
            >
                <Text style={styles.modalTitle}>Xoá dữ liệu KPI?</Text>
                <Text style={styles.modalMessage}>
                    Hành động này sẽ xoá toàn bộ thống kê analytics đang lưu cục
                    bộ trên thiết bị.
                </Text>
                <View style={styles.modalActions}>
                    <AppButton
                        title="Huỷ"
                        variant="secondary"
                        onPress={() => setConfirmClearOpen(false)}
                    />
                    <AppButton
                        title="Xoá"
                        variant="danger"
                        onPress={() => {
                            clearAnalyticsSummary();
                            refresh();
                            setConfirmClearOpen(false);
                        }}
                    />
                </View>
            </BaseModal>
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
    },
    totalBox: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
    },
    totalLabel: {
        color: colors.text,
        ...textStyle(13, { weight: "800", lineHeightPreset: "tight" }),
    },
    refreshBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    pressedSm: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
        gap: 8,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        padding: 12,
        gap: 6,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    cardTitle: {
        flex: 1,
        color: colors.text,
        ...textStyle(14, { weight: "900", lineHeightPreset: "tight" }),
    },
    countBadge: {
        minWidth: 36,
        height: 24,
        borderRadius: 999,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    countBadgeText: {
        color: colors.text,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    metaLine: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "700", lineHeightPreset: "tight" }),
    },
    footer: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    modalTitle: {
        color: colors.text,
        ...textStyle(16, { weight: "900", lineHeightPreset: "tight" }),
        marginBottom: 8,
        textAlign: "center",
    },
    modalMessage: {
        color: colors.textSoft,
        ...textStyle(13, { weight: "700", lineHeightPreset: "loose" }),
        textAlign: "center",
        marginBottom: 12,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
    },
    });

