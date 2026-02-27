import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../../context/ThemeContext";
import { trackAddHistoryResult } from "../../services/analytics";
import { MIN_TOUCH_TARGET_SIZE } from "../../theme/touchTargets";
import { inputMetrics, textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";
import {
    HistoryRow,
    todayDdMmYy,
    isValidDdMmYy,
    postAppendHistoryToAppScript,
} from "../../utils/historyAdd";
import { logger } from "../../utils/logger";
import { SingleDatePickerIOSDark } from "../SingleDatePickerIOSDark"; // chỉnh path đúng

import type { ThemeColors } from "../../theme/theme";

type Props = {
    appScriptUrl: string;
    sheetId: string;
    sheetName: string;
    deviceName: string;
    onPosted?: (row: HistoryRow) => void;
    iconSize?: number;
    disabled?: boolean;
};

export function AddHistoryAction({
    appScriptUrl,
    sheetId,
    sheetName,
    deviceName,
    onPosted,
    iconSize = 20,
    disabled,
}: Props) {
    const { colors, mode } = useTheme();
    const styles = useThemedStyles(createStyles);
    const defaultDate = useMemo(() => todayDdMmYy(), []);
    const [open, setOpen] = useState(false);

    const [date, setDate] = useState(defaultDate);
    const [content, setContent] = useState("");
    const [touched, setTouched] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDate(todayDdMmYy());
            setContent("");
            setTouched(false);
            setSubmitting(false);
            setError(null);
        }
    }, [open]);

    const contentOk = content.trim().length >= 3;
    const dateOk = isValidDdMmYy(date.trim());
    const canSave = contentOk && dateOk && !submitting;

    const handleSave = async () => {
        setTouched(true);
        setError(null);
        if (!canSave) return;

        const row: HistoryRow = {
            deviceName,
            date: date.trim(),
            content: content.trim(),
        };

        // ✅ LOG: kiểm tra props/row ngay trước khi gọi POST
        logger.debug("🧩 [AddHistory] PROPS =", {
            appScriptUrl,
            sheetId,
            sheetName,
            deviceName,
        });
        logger.debug("🧩 [AddHistory] ROW =", row);

        setSubmitting(true);
        try {
            const result = await postAppendHistoryToAppScript({
                appScriptUrl,
                sheetId,
                sheetName,
                row,
            });

            if (!result.ok) {
                trackAddHistoryResult(false, { deviceName, sheetName });
                logger.warn("⚠️ [AddHistory] POST FAILED =", result);
                setError(result.message || "Không thể lưu lịch sử");
                return;
            }

            trackAddHistoryResult(true, { deviceName, sheetName });
            logger.debug("✅ [AddHistory] POST OK");
            setOpen(false);
            onPosted?.(row);
        } catch (e: any) {
            trackAddHistoryResult(false, { deviceName, sheetName });
            logger.error("❌ [AddHistory] POST ERROR =", e);
            setError(String(e?.message || "Không thể lưu lịch sử"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Nút + */}
            <Pressable
                style={({ pressed }) => [
                    styles.addBtn,
                    (disabled || submitting) && styles.addBtnDisabled,
                    pressed && !disabled && !submitting && styles.addBtnPressed,
                ]}
                onPress={() => setOpen(true)}
                disabled={disabled || submitting}
                hitSlop={10}
            >
                <Ionicons
                    name="add"
                    size={iconSize}
                    color={colors.textAccent}
                />
            </Pressable>

            {/* Modal form */}
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <KeyboardAvoidingView
                    style={[
                        styles.overlay,
                        mode === "dark"
                            ? styles.overlayDark
                            : styles.overlayLight,
                    ]}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    />

                    <View style={styles.card}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.cardContent}
                        >
                            <Text style={styles.title}>Thêm lịch sử</Text>

                            <Text style={styles.label}>Thiết bị</Text>
                            <View style={styles.readonlyBox}>
                                <Text style={styles.readonlyText}>
                                    {deviceName}
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>
                                        Ngày (dd-MM-yy)
                                    </Text>

                                    <TextInput
                                        value={date}
                                        editable={false}
                                        selectTextOnFocus={false}
                                        placeholder="Chọn ngày..."
                                        placeholderTextColor={colors.textMuted}
                                        style={[
                                            styles.input,
                                            styles.inputReadonly,
                                            touched &&
                                                !dateOk &&
                                                styles.inputError,
                                        ]}
                                    />

                                    {touched && !dateOk && (
                                        <Text style={styles.errorText}>
                                            Ngày không hợp lệ. Định dạng:
                                            dd-MM-yy
                                        </Text>
                                    )}
                                </View>

                                <View style={{ width: 12 }} />

                                <View style={{ zIndex: 50 }}>
                                    <SingleDatePickerIOSDark
                                        value={date}
                                        onChange={setDate}
                                        interaction="direct"
                                        title="Chọn ngày bảo trì"
                                        fieldLabel="Ngày bảo trì"
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Nội dung</Text>
                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Nhập nội dung bảo trì..."
                                placeholderTextColor={colors.textMuted}
                                style={[
                                    styles.textarea,
                                    touched && !contentOk && styles.inputError,
                                ]}
                                multiline
                                textAlignVertical="top"
                                returnKeyType="done"
                            />
                            {touched && !contentOk && (
                                <Text style={styles.errorText}>
                                    Vui lòng nhập nội dung (tối thiểu 3 ký tự).
                                </Text>
                            )}

                            {!!error && (
                                <Text
                                    style={[
                                        styles.errorText,
                                        { marginTop: 10 },
                                    ]}
                                >
                                    {error}
                                </Text>
                            )}

                            <View style={styles.footer}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.btn,
                                        styles.btnSecondary,
                                        pressed && styles.btnPressed,
                                    ]}
                                    onPress={() => setOpen(false)}
                                    disabled={submitting}
                                >
                                    <Text style={styles.btnText}>Hủy</Text>
                                </Pressable>

                                <View style={{ width: 12 }} />

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.btn,
                                        !canSave && touched
                                            ? styles.btnDisabled
                                            : styles.btnPrimary,
                                        pressed && canSave && styles.btnPressed,
                                    ]}
                                    onPress={handleSave}
                                    disabled={!canSave && touched}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color={colors.text} />
                                    ) : (
                                        <Text style={styles.btnText}>Lưu</Text>
                                    )}
                                </Pressable>
                            </View>

                            <View style={{ height: 12 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    /* ===== Nút dấu cộng (GIỮ NGUYÊN) ===== */
    addBtn: {
        width: MIN_TOUCH_TARGET_SIZE,
        height: MIN_TOUCH_TARGET_SIZE,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    addBtnPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    addBtnDisabled: {
        opacity: 0.45,
    },

    /* ===== Overlay ===== */
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    overlayDark: {
        backgroundColor: "rgba(15,23,42,0.85)",
    },
    overlayLight: {
        backgroundColor: "rgba(15,23,42,0.35)",
    },

    /* ===== Card ===== */
    card: {
        width: "96%",
        maxWidth: 560,
        maxHeight: "88%",
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    cardContent: {
        paddingBottom: 6,
    },

    /* ===== Text ===== */
    title: {
        color: colors.text,
        ...textStyle(16, { weight: "800", lineHeightPreset: "tight" }),
        marginBottom: 10,
        textAlign: "center",
    },
    label: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "700", lineHeightPreset: "tight" }),
        marginTop: 10,
        marginBottom: 6,
    },

    /* ===== Readonly ===== */
    readonlyBox: {
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    readonlyText: {
        color: colors.text,
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },

    /* ===== Inputs ===== */
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
    },

    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingHorizontal: 12,
        paddingVertical: inputMetrics.paddingVertical,
        color: colors.text,
        ...textStyle(14, { weight: "600", lineHeightPreset: "tight" }),
        height: inputMetrics.height,
    },
    inputReadonly: {
        opacity: 0.95,
    },

    textarea: {
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text,
        ...textStyle(14, { lineHeightPreset: "normal" }),
        minHeight: 120,
        textAlignVertical: "top",
    },

    /* ===== Errors ===== */
    inputError: {
        borderColor: colors.danger,
    },
    errorText: {
        color: colors.danger,
        ...textStyle(12, { weight: "600", lineHeightPreset: "tight" }),
    },

    /* ===== Footer buttons ===== */
    footer: {
        flexDirection: "row",
        marginTop: 14,
    },

    btn: {
        flex: 1,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },

    /* ✅ Nút LƯU — XANH LÁ #16A34A */
    btnPrimary: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },

    /* ❌ Nút HỦY — GIỮ NGUYÊN */
    btnSecondary: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },

    btnDisabled: {
        opacity: 0.5,
        backgroundColor: colors.backgroundAlt,
        borderColor: colors.primarySoftBorder,
    },

    btnPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.9,
    },

    btnText: {
        color: "#F8FAFC",
        ...textStyle(14, { weight: "800", lineHeightPreset: "tight" }),
    },
    });
