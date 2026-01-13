import React, { useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/theme";
import { BaseModal } from "./ui/BaseModal";

type Props = {
    /** dd-MM-yy */
    value: string;
    onChange: (next: string) => void;

    minDate?: Date;
    maxDate?: Date;
    iconSize?: number;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const dmyToDate = (dmy: string) => {
    if (!dmy) return null;
    const m = dmy.match(/^\d{2}-\d{2}-\d{2}$/);
    if (!m) return null;
    const [dd, mm, yy] = dmy.split("-").map((x) => parseInt(x, 10));
    if (!dd || !mm) return null;
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

type Anchor = { x: number; y: number; w: number; h: number };

export function SingleDatePickerIOSDark({
    value,
    onChange,
    minDate,
    maxDate,
    iconSize = 20,
}: Props) {
    const minD = useMemo(() => minDate ?? new Date(2022, 0, 1), [minDate]);
    const maxD = useMemo(() => maxDate ?? new Date(), [maxDate]);

    const currentValue = useMemo(() => dmyToDate(value) ?? new Date(), [value]);

    const iconRef = useRef<View>(null);

    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<Anchor | null>(null);

    // Android native picker
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);

    // iOS spinner modal (nếu bạn muốn vẫn dùng BaseModal)
    const [iosPickerOpen, setIosPickerOpen] = useState(false);
    const [iosDraft, setIosDraft] = useState<Date>(currentValue);

    const applyPicked = (pickedRaw: Date) => {
        const picked = clamp(new Date(pickedRaw), minD, maxD);
        onChange(dateToDmy(picked));
    };

    const openPopover = () => {
        iconRef.current?.measureInWindow((x, y, w, h) => {
            setAnchor({ x, y, w, h });
            setOpen(true);
        });
    };

    const closePopover = () => {
        setOpen(false);
        setShowAndroidPicker(false);
    };

    const setToday = () => {
        applyPicked(new Date());
        closePopover();
    };

    const clear = () => {
        onChange("");
        closePopover();
    };

    const openPick = () => {
        if (Platform.OS === "ios") {
            setIosDraft(currentValue);
            setIosPickerOpen(true);
        } else {
            setShowAndroidPicker(true);
        }
    };

    const onAndroidPick = (e: DateTimePickerEvent, selected?: Date) => {
        setShowAndroidPicker(false);
        if (e.type !== "set" || !selected) return;
        applyPicked(selected);
        closePopover();
    };

    const dropdownW = 240;
    const screen = Dimensions.get("window");

    // tính vị trí dropdown: nằm dưới icon
    const dropdownPos = useMemo(() => {
        if (!anchor) return { top: 0, left: 0 };
        const gap = 8;
        const top = anchor.y + anchor.h + gap;

        // canh phải dropdown theo icon (giống rangePicker), nhưng tránh tràn màn
        const desiredLeft = anchor.x + anchor.w - dropdownW;
        const left = Math.max(
            8,
            Math.min(desiredLeft, screen.width - dropdownW - 8)
        );

        return { top, left };
    }, [anchor, screen.width]);

    return (
        <View>
            {/* ICON */}
            <View ref={iconRef} collapsable={false}>
                <TouchableOpacity
                    style={[
                        styles.iconBtn,
                        (open || !!value) && styles.iconBtnActive,
                    ]}
                    onPress={openPopover}
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={iconSize}
                        color={colors.textAccent}
                    />
                </TouchableOpacity>
            </View>

            {/* ✅ POPOVER MODAL: chặn xuyên touch xuống TextInput phía sau */}
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={closePopover}
            >
                {/* backdrop bắt mọi tap ngoài */}
                <Pressable style={styles.backdrop} onPress={closePopover} />

                {/* dropdown nằm đúng dưới icon */}
                {anchor && (
                    <View
                        style={[
                            styles.dropdown,
                            { top: dropdownPos.top, left: dropdownPos.left },
                        ]}
                    >
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Chọn ngày</Text>

                            <TouchableOpacity
                                onPress={closePopover}
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
                            onPress={openPick}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.label}>Ngày</Text>
                            <Text style={styles.value}>{value || "--"}</Text>
                        </TouchableOpacity>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                onPress={setToday}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.linkPrimary}>Hôm nay</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={clear}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.linkMuted}>Xóa</Text>
                            </TouchableOpacity>

                            <View style={{ flex: 1 }} />

                            <TouchableOpacity
                                onPress={closePopover}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.linkMuted}>Đóng</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ANDROID native dialog (dialog nổi lên từ dropdown) */}
                        {showAndroidPicker && Platform.OS === "android" && (
                            <DateTimePicker
                                value={currentValue}
                                mode="date"
                                display="calendar"
                                minimumDate={minD}
                                maximumDate={maxD}
                                onChange={onAndroidPick}
                            />
                        )}
                    </View>
                )}
            </Modal>

            {/* iOS spinner modal */}
            <BaseModal
                visible={iosPickerOpen}
                onRequestClose={() => setIosPickerOpen(false)}
                width="92%"
            >
                <View style={styles.iosModalCard}>
                    <Text style={styles.iosModalTitle}>Chọn ngày</Text>

                    <DateTimePicker
                        value={iosDraft}
                        mode="date"
                        display="spinner"
                        minimumDate={minD}
                        maximumDate={maxD}
                        onChange={(_, d) => {
                            if (d) setIosDraft(d);
                        }}
                    />

                    <View style={styles.iosModalActions}>
                        <TouchableOpacity
                            onPress={() => setIosPickerOpen(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.linkMuted}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                applyPicked(iosDraft);
                                setIosPickerOpen(false);
                                closePopover();
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.linkPrimary}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BaseModal>
        </View>
    );
}

const styles = StyleSheet.create({
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

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
    },

    dropdown: {
        position: "absolute",
        width: 240,
        borderRadius: 16,
        backgroundColor: "rgba(15,23,42,0.96)",
        borderWidth: 1,
        borderColor: "rgba(96,165,250,0.35)",
        zIndex: 999,
        elevation: 20,
        padding: 12,
        gap: 10,

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

    actionsRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 4,
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
