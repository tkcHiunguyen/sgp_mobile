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
import { BaseModal } from "./ui/BaseModal";

type Props = {
    fromDate: string; // dd-MM-yy
    toDate: string; // dd-MM-yy
    onChange: (next: { fromDate: string; toDate: string }) => void;

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

    const [showAndroidPicker, setShowAndroidPicker] = useState(false);

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
                            display="calendar"
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
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.55)",
        backgroundColor: "rgba(15,23,42,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnActive: {
        borderColor: "rgba(96,165,250,0.9)",
        backgroundColor: "rgba(37,99,235,0.18)",
    },

    dropdown: {
        position: "absolute",
        top: 48,
        right: 0,
        width: 252,
        borderRadius: 16,
        backgroundColor: "rgba(15,23,42,0.96)",
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.35)",
        zIndex: 999,
        elevation: 12,
        padding: 12,
        gap: 10,

        // iOS shadow
        shadowColor: "#000",
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
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    headerCloseBtn: {
        width: 30,
        height: 30,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(2,6,23,0.55)",
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.16)",
    },

    box: {
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.18)",
        backgroundColor: "rgba(2,6,23,0.55)",
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
        color: "rgba(229,242,255,0.62)",
        fontSize: 11,
        fontWeight: "800",
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    value: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "900",
    },

    presetsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    chip: {
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.22)",
        backgroundColor: "rgba(10,132,255,0.08)",
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    chipText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: "800",
    },

    actionsRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    linkPrimary: {
        color: colors.textAccent,
        fontSize: 12,
        fontWeight: "900",
    },
    linkMuted: {
        color: "rgba(229,242,255,0.55)",
        fontSize: 12,
        fontWeight: "900",
    },

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
