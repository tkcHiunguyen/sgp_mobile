import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Platform,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { MIN_TOUCH_TARGET_SIZE } from "../theme/touchTargets";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

import {
    addDays,
    clampDate,
    dateToDmy,
    dmyToDate,
    startOfMonth,
} from "./datePicker/dateUtils";
import { IOSSpinnerPickerModal } from "./datePicker/IOSSpinnerPickerModal";

import type { ThemeColors } from "../theme/theme";

type Props = {
    fromDate: string; // dd-MM-yy
    toDate: string; // dd-MM-yy
    onChange: (next: { fromDate: string; toDate: string }) => void;

    open: boolean;
    onToggleOpen: () => void;
    onClose: () => void;
    title?: string;
    fromLabel?: string;
    toLabel?: string;
    resetLabel?: string;
    closeLabel?: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

export function DateRangeNativePicker({
    fromDate,
    toDate,
    onChange,
    open,
    onToggleOpen,
    onClose,
    title = "Bộ lọc ngày",
    fromLabel = "Từ",
    toLabel = "Đến",
    resetLabel = "Reset",
    closeLabel = "Đóng",
    cancelLabel = "Hủy",
    confirmLabel = "OK",
}: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const minDate = useMemo(() => new Date(2022, 0, 1), []);
    const maxDate = useMemo(() => new Date(), []);

    const [target, setTarget] = useState<"from" | "to">("from");

    const [showAndroidPicker, setShowAndroidPicker] = useState(false);

    const [iosPickerOpen, setIosPickerOpen] = useState(false);
    const [iosDraft, setIosDraft] = useState<Date>(new Date());

    const currentTargetValue = useMemo(() => {
        const d = target === "from" ? dmyToDate(fromDate) : dmyToDate(toDate);
        return d ?? new Date();
    }, [fromDate, toDate, target]);

    const applyPicked = (pickedRaw: Date) => {
        const picked = clampDate(new Date(pickedRaw), minDate, maxDate);
        const pickedDmy = dateToDmy(picked);

        const next = { fromDate, toDate };
        if (target === "from") next.fromDate = pickedDmy;
        else next.toDate = pickedDmy;

        // auto-swap nếu from > to
        const a = dmyToDate(next.fromDate);
        const b = dmyToDate(next.toDate);
        if (a && b && a > b) {
            onChange({ fromDate: next.toDate, toDate: next.fromDate });
            return;
        }
        onChange(next);
    };

    const openPicker = (t: "from" | "to") => {
        setTarget(t);

        if (Platform.OS === "ios") {
            setIosDraft(currentTargetValue);
            setIosPickerOpen(true);
        } else {
            setShowAndroidPicker(true);
        }
    };

    const onAndroidPick = (e: DateTimePickerEvent, selected?: Date) => {
        setShowAndroidPicker(false);
        if (e.type !== "set" || !selected) return;
        applyPicked(selected);
    };

    const onClearOne = (t: "from" | "to") => {
        onChange({
            fromDate: t === "from" ? "" : fromDate,
            toDate: t === "to" ? "" : toDate,
        });
    };

    const onReset = () => {
        onChange({ fromDate: "", toDate: "" });
        onClose();
    };

    const setToday = () => {
        const today = clampDate(new Date(), minDate, maxDate);
        onChange({ fromDate: dateToDmy(today), toDate: dateToDmy(today) });
    };

    const setLastNDays = (n: number) => {
        const today = clampDate(new Date(), minDate, maxDate);
        const from = clampDate(addDays(today, -(n - 1)), minDate, maxDate);
        onChange({ fromDate: dateToDmy(from), toDate: dateToDmy(today) });
    };

    const setThisMonth = () => {
        const today = clampDate(new Date(), minDate, maxDate);
        const from = clampDate(startOfMonth(today), minDate, maxDate);
        onChange({ fromDate: dateToDmy(from), toDate: dateToDmy(today) });
    };

    const hasValue = !!fromDate || !!toDate;

    const [mounted, setMounted] = useState(open);
    const anim = useRef(new Animated.Value(open ? 1 : 0)).current;

    useEffect(() => {
        if (open) {
            setMounted(true);
            Animated.spring(anim, {
                toValue: 1,
                damping: 18,
                stiffness: 220,
                mass: 0.9,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) setMounted(false);
            });
        }
    }, [open, anim]);

    const dropdownAnimStyle = {
        opacity: anim,
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-6, 0],
                }),
            },
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                }),
            },
        ],
    };

    return (
        <View style={styles.host}>
            {/* ICON */}
            <TouchableOpacity
                style={[
                    styles.iconBtn,
                    (open || hasValue) && styles.iconBtnActive,
                ]}
                onPress={onToggleOpen}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.textAccent}
                />
            </TouchableOpacity>

            {/* DROPDOWN (animated mount/unmount) */}
            {mounted && (
                <Animated.View style={[styles.dropdown, dropdownAnimStyle]}>
                    <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>{title}</Text>

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.8}
                            style={styles.headerCloseBtn}
                        >
                            <Ionicons
                                name="close"
                                size={16}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.box}
                        onPress={() => openPicker("from")}
                        activeOpacity={0.85}
                    >
                        <View style={styles.boxTopRow}>
                            <Text style={styles.label}>{fromLabel}</Text>
                            {!!fromDate && (
                                <TouchableOpacity
                                    onPress={() => onClearOne("from")}
                                    hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10,
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={18}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.value}>{fromDate || "--"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.box}
                        onPress={() => openPicker("to")}
                        activeOpacity={0.85}
                    >
                        <View style={styles.boxTopRow}>
                            <Text style={styles.label}>{toLabel}</Text>
                            {!!toDate && (
                                <TouchableOpacity
                                    onPress={() => onClearOne("to")}
                                    hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10,
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={18}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.value}>{toDate || "--"}</Text>
                    </TouchableOpacity>

                    {/* PRESETS */}
                    <View style={styles.presetsRow}>
                        <PresetChip label="Hôm nay" onPress={setToday} />
                        <PresetChip
                            label="7 ngày"
                            onPress={() => setLastNDays(7)}
                        />
                        <PresetChip
                            label="30 ngày"
                            onPress={() => setLastNDays(30)}
                        />
                        <PresetChip label="Tháng này" onPress={setThisMonth} />
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            onPress={onReset}
                            activeOpacity={0.85}
                            style={styles.actionTouchTarget}
                        >
                            <Text style={styles.linkPrimary}>{resetLabel}</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.85}
                            style={styles.actionTouchTarget}
                        >
                            <Text style={styles.linkMuted}>{closeLabel}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ANDROID native dialog */}
                    {showAndroidPicker && Platform.OS === "android" && (
                        <DateTimePicker
                            value={currentTargetValue}
                            mode="date"
                            display="calendar"
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            onChange={onAndroidPick}
                        />
                    )}
                </Animated.View>
            )}

            <IOSSpinnerPickerModal
                visible={iosPickerOpen}
                title={`Chọn ${target === "from" ? fromLabel : toLabel}`}
                value={iosDraft}
                minDate={minDate}
                maxDate={maxDate}
                cancelLabel={cancelLabel}
                confirmLabel={confirmLabel}
                onChange={setIosDraft}
                onCancel={() => setIosPickerOpen(false)}
                onConfirm={() => {
                    applyPicked(iosDraft);
                    setIosPickerOpen(false);
                }}
            />
        </View>
    );
}

function PresetChip({
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
}) {
    const styles = useThemedStyles(createStyles);
    return (
        <TouchableOpacity
            style={styles.chip}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={styles.chipText}>{label}</Text>
        </TouchableOpacity>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    host: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        zIndex: 20,
    },

    iconBtn: {
        width: MIN_TOUCH_TARGET_SIZE,
        height: MIN_TOUCH_TARGET_SIZE,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnActive: {
        borderColor: colors.primaryBorderStrong,
        backgroundColor: colors.backgroundAlt,
    },

    dropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 252,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        zIndex: 999,
        elevation: 12,
        padding: 12,
        gap: 10,

        // iOS shadow
        shadowColor: colors.accent,
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
    },

    dropdownHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    dropdownTitle: {
        color: colors.text,
        ...textStyle(13, {
            weight: "900",
            lineHeightPreset: "tight",
            letterSpacing: 0.2,
        }),
    },
    headerCloseBtn: {
        width: MIN_TOUCH_TARGET_SIZE,
        height: MIN_TOUCH_TARGET_SIZE,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },

    box: {
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.background,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    boxTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    label: {
        color: colors.textMuted,
        ...textStyle(11, {
            weight: "800",
            lineHeightPreset: "tight",
            letterSpacing: 0.2,
        }),
        marginBottom: 4,
    },
    value: {
        color: colors.text,
        ...textStyle(13, { weight: "900", lineHeightPreset: "tight" }),
    },

    presetsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    chip: {
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    chipText: {
        color: colors.text,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
    },

    actionsRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    linkPrimary: {
        color: colors.textAccent,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    linkMuted: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    actionTouchTarget: {
        minHeight: MIN_TOUCH_TARGET_SIZE,
        minWidth: MIN_TOUCH_TARGET_SIZE,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },

    });
