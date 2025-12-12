import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Platform,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
} from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/theme";
import { BaseModal } from "./ui/BaseModal"; // nếu đường dẫn khác thì sửa lại

type Props = {
    fromDate: string; // dd-MM-yy
    toDate: string; // dd-MM-yy
    onChange: (next: { fromDate: string; toDate: string }) => void;

    // dropdown control (đúng flow bạn đang dùng ở History)
    open: boolean;
    onToggleOpen: () => void;
    onClose: () => void;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const dmyToDate = (dmy: string) => {
    if (!dmy) return null;
    const [dd, mm, yy] = dmy.split("-").map((x) => parseInt(x, 10));
    return new Date(2000 + yy, mm - 1, dd);
};

const dateToDmy = (d: Date) => {
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}-${mm}-${yy}`;
};

const clamp = (d: Date, min: Date, max: Date) => {
    const t = d.getTime();
    if (t < min.getTime()) return new Date(min);
    if (t > max.getTime()) return new Date(max);
    return d;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, days: number) =>
    new Date(d.getTime() + days * 86400000);

export function DateRangeNativePicker({
    fromDate,
    toDate,
    onChange,
    open,
    onToggleOpen,
    onClose,
}: Props) {
    const minDate = useMemo(() => new Date(2022, 0, 1), []);
    const maxDate = useMemo(() => new Date(), []);

    const [target, setTarget] = useState<"from" | "to">("from");

    // Android: render DateTimePicker -> dialog native
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);

    // iOS: modal custom (Cancel/OK)
    const [iosPickerOpen, setIosPickerOpen] = useState(false);
    const [iosDraft, setIosDraft] = useState<Date>(new Date());

    const currentTargetValue = useMemo(() => {
        const d = target === "from" ? dmyToDate(fromDate) : dmyToDate(toDate);
        return d ?? new Date();
    }, [fromDate, toDate, target]);

    const applyPicked = (pickedRaw: Date) => {
        const picked = clamp(new Date(pickedRaw), minDate, maxDate);
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
        // Android: dialog đóng ngay sau chọn / cancel
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

    // ✅ Reset = xoá cả 2 ô + đóng dropdown
    const onReset = () => {
        onChange({ fromDate: "", toDate: "" });
        onClose();
    };

    const setToday = () => {
        const today = clamp(new Date(), minDate, maxDate);
        onChange({ fromDate: dateToDmy(today), toDate: dateToDmy(today) });
    };

    const setLastNDays = (n: number) => {
        const today = clamp(new Date(), minDate, maxDate);
        const from = clamp(addDays(today, -(n - 1)), minDate, maxDate);
        onChange({ fromDate: dateToDmy(from), toDate: dateToDmy(today) });
    };

    const setThisMonth = () => {
        const today = clamp(new Date(), minDate, maxDate);
        const from = clamp(startOfMonth(today), minDate, maxDate);
        onChange({ fromDate: dateToDmy(from), toDate: dateToDmy(today) });
    };

    const hasValue = !!fromDate || !!toDate;

    // ===== ✅ Animation dropdown =====
    const [mounted, setMounted] = useState(open);
    const anim = useRef(new Animated.Value(open ? 1 : 0)).current;

    useEffect(() => {
        if (open) {
            setMounted(true);
            Animated.timing(anim, {
                toValue: 1,
                duration: 170,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 140,
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
                        <Text style={styles.dropdownTitle}>Bộ lọc ngày</Text>

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
                            <Text style={styles.label}>Từ</Text>
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
                            <Text style={styles.label}>Đến</Text>
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
                        >
                            <Text style={styles.linkPrimary}>Reset</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.linkMuted}>Đóng</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ANDROID native dialog */}
                    {showAndroidPicker && Platform.OS === "android" && (
                        <DateTimePicker
                            value={currentTargetValue}
                            mode="date"
                            display="default"
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            onChange={onAndroidPick}
                        />
                    )}
                </Animated.View>
            )}

            {/* iOS custom modal */}
            <BaseModal
                visible={iosPickerOpen}
                onRequestClose={() => setIosPickerOpen(false)}
                width="92%"
            >
                <View style={styles.iosModalCard}>
                    <Text style={styles.iosModalTitle}>
                        Chọn ngày {target === "from" ? "bắt đầu" : "kết thúc"}
                    </Text>

                    <DateTimePicker
                        value={iosDraft}
                        mode="date"
                        display="spinner"
                        minimumDate={minDate}
                        maximumDate={maxDate}
                        onChange={(_, d) => {
                            if (d) setIosDraft(d);
                        }}
                    />

                    <View style={styles.iosModalActions}>
                        <TouchableOpacity
                            onPress={() => setIosPickerOpen(false)}
                        >
                            <Text style={styles.linkMuted}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                applyPicked(iosDraft);
                                setIosPickerOpen(false);
                            }}
                        >
                            <Text style={styles.linkPrimary}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BaseModal>
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

const styles = StyleSheet.create({
    host: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        zIndex: 20,
    },
    iconBtn: {
        width: 42,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.8)",
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnActive: {
        backgroundColor: "rgba(37,99,235,0.2)",
    },

    dropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 240,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.8)",
        zIndex: 999,
        elevation: 10,
        padding: 10,
        gap: 8,
    },
    dropdownHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    dropdownTitle: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "800",
    },
    headerCloseBtn: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(2,6,23,0.35)",
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.18)",
    },

    box: {
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.25)",
        backgroundColor: "rgba(2,6,23,0.35)",
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
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 4,
    },
    value: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "800",
    },

    presetsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    chip: {
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.25)",
        backgroundColor: "rgba(2,6,23,0.35)",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    chipText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: "700",
    },

    actionsRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
    },

    linkPrimary: { color: colors.textAccent, fontSize: 12, fontWeight: "800" },
    linkMuted: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },

    iosModalCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.25)",
        padding: 12,
    },
    iosModalTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 8,
    },
    iosModalActions: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 6,
    },
});
