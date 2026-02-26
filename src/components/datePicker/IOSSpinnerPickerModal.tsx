import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";
import { MIN_TOUCH_TARGET_SIZE } from "../../theme/touchTargets";
import { textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";
import { BaseModal } from "../ui/BaseModal";

import type { ThemeColors } from "../../theme/theme";


type Props = {
    visible: boolean;
    title: string;
    value: Date;
    minDate: Date;
    maxDate: Date;
    cancelLabel?: string;
    confirmLabel?: string;
    onChange: (next: Date) => void;
    onCancel: () => void;
    onConfirm: () => void;
};

export function IOSSpinnerPickerModal({
    visible,
    title,
    value,
    minDate,
    maxDate,
    cancelLabel = "Hủy",
    confirmLabel = "OK",
    onChange,
    onCancel,
    onConfirm,
}: Props) {
    const { mode } = useTheme();
    const styles = useThemedStyles(createStyles);
    const iosPickerTextColor = mode === "dark" ? "#FFFFFF" : "#000000";
    const iosThemeVariant = mode === "dark" ? "dark" : "light";

    return (
        <BaseModal
            visible={visible}
            onRequestClose={onCancel}
            width="100%"
            style={styles.iosBaseModalContainer}
        >
            <View style={styles.iosModalCard}>
                <Text style={styles.iosModalTitle}>{title}</Text>

                <View style={styles.iosPickerWrap}>
                    <DateTimePicker
                        value={value}
                        mode="date"
                        display="spinner"
                        textColor={iosPickerTextColor}
                        themeVariant={iosThemeVariant}
                        minimumDate={minDate}
                        maximumDate={maxDate}
                        style={styles.iosPicker}
                        onChange={(_, d) => {
                            if (d) onChange(d);
                        }}
                    />
                </View>

                <View style={styles.iosModalActions}>
                    <TouchableOpacity
                        onPress={onCancel}
                        activeOpacity={0.85}
                        style={styles.actionButton}
                    >
                        <Text style={styles.linkMuted}>{cancelLabel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onConfirm}
                        activeOpacity={0.85}
                        style={styles.actionButton}
                    >
                        <Text style={styles.linkPrimary}>{confirmLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BaseModal>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        iosModalCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primarySoftBorder,
            paddingTop: 12,
            paddingBottom: 12,
            paddingHorizontal: 8,
        },
        iosBaseModalContainer: {
            paddingHorizontal: 0,
            paddingVertical: 0,
            borderWidth: 0,
            backgroundColor: "transparent",
        },
        iosPickerWrap: {
            alignItems: "center",
        },
        iosPicker: {
            alignSelf: "center",
        },
        iosModalTitle: {
            color: colors.text,
            ...textStyle(15, { weight: "900", lineHeightPreset: "tight" }),
            textAlign: "center",
            marginBottom: 8,
        },
        iosModalActions: {
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 6,
        },
        actionButton: {
            minHeight: MIN_TOUCH_TARGET_SIZE,
            minWidth: MIN_TOUCH_TARGET_SIZE,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
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
