import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

import { clampDate, dateToDmy, dmyToDate } from "./datePicker/dateUtils";
import { IOSSpinnerPickerModal } from "./datePicker/IOSSpinnerPickerModal";

import type { ThemeColors } from "../theme/theme";

type Props = {
    /** dd-MM-yy */
    value: string;
    onChange: (next: string) => void;

    minDate?: Date;
    maxDate?: Date;
    iconSize?: number;
    interaction?: "popover" | "direct";
    title?: string;
    fieldLabel?: string;
    todayLabel?: string;
    clearLabel?: string;
    closeLabel?: string;
    cancelLabel?: string;
    confirmLabel?: string;
};

type Anchor = { x: number; y: number; w: number; h: number };

export function SingleDatePickerIOSDark({
    value,
    onChange,
    minDate,
    maxDate,
    iconSize = 20,
    interaction = "popover",
    title = "Chọn ngày",
    fieldLabel = "Ngày",
    todayLabel = "Hôm nay",
    clearLabel = "Xóa",
    closeLabel = "Đóng",
    cancelLabel = "Hủy",
    confirmLabel = "OK",
}: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
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
    const isDirect = interaction === "direct";

    const applyPicked = (pickedRaw: Date) => {
        const picked = clampDate(new Date(pickedRaw), minD, maxD);
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

    const handleIconPress = () => {
        if (isDirect) {
            openPick();
            return;
        }
        openPopover();
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
                        ((isDirect
                            ? iosPickerOpen || showAndroidPicker
                            : open) ||
                            !!value) &&
                            styles.iconBtnActive,
                    ]}
                    onPress={handleIconPress}
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
            {!isDirect && (
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
                                <Text style={styles.dropdownTitle}>{title}</Text>

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
                                <Text style={styles.label}>{fieldLabel}</Text>
                                <Text style={styles.value}>{value || "--"}</Text>
                            </TouchableOpacity>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    onPress={setToday}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.linkPrimary}>
                                        {todayLabel}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={clear}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.linkMuted}>
                                        {clearLabel}
                                    </Text>
                                </TouchableOpacity>

                                <View style={{ flex: 1 }} />

                                <TouchableOpacity
                                    onPress={closePopover}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.linkMuted}>
                                        {closeLabel}
                                    </Text>
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
            )}

            {isDirect && showAndroidPicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={currentValue}
                    mode="date"
                    display="calendar"
                    minimumDate={minD}
                    maximumDate={maxD}
                    onChange={onAndroidPick}
                />
            )}

            <IOSSpinnerPickerModal
                visible={iosPickerOpen}
                title={title}
                value={iosDraft}
                minDate={minD}
                maxDate={maxD}
                cancelLabel={cancelLabel}
                confirmLabel={confirmLabel}
                onChange={setIosDraft}
                onCancel={() => setIosPickerOpen(false)}
                onConfirm={() => {
                    applyPicked(iosDraft);
                    setIosPickerOpen(false);
                    closePopover();
                }}
            />
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    iconBtn: {
        width: 42,
        height: 40,
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

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
    },

    dropdown: {
        position: "absolute",
        width: 240,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        zIndex: 999,
        elevation: 20,
        padding: 12,
        gap: 10,

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
        width: 30,
        height: 30,
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

    actionsRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 4,
    },
    linkPrimary: {
        color: colors.textAccent,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    linkMuted: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },

    });
