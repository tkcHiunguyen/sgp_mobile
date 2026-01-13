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

import { SingleDatePickerIOSDark } from "../SingleDatePickerIOSDark"; // chỉnh path đúng
import {
    HistoryRow,
    todayDdMmYy,
    isValidDdMmYy,
    postAppendHistoryToAppScript,
} from "../../utils/historyAdd";

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
        console.log("🧩 [AddHistory] PROPS =", {
            appScriptUrl,
            sheetId,
            sheetName,
            deviceName,
        });
        console.log("🧩 [AddHistory] ROW =", row);

        setSubmitting(true);
        const result = await postAppendHistoryToAppScript({
            appScriptUrl,
            sheetId,
            sheetName,
            row,
        });

        if (!result.ok) {
            console.warn("⚠️ [AddHistory] POST FAILED =", result);
            setSubmitting(false);
            setError(result.message || "Không thể lưu lịch sử");
            return;
        }

        console.log("✅ [AddHistory] POST OK");
        setSubmitting(false);
        setOpen(false);
        onPosted?.(row);
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
                    color={stylesVars.primary}
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
                    style={styles.overlay}
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
                                        placeholderTextColor={
                                            stylesVars.textMuted
                                        }
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
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Nội dung</Text>
                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Nhập nội dung bảo trì..."
                                placeholderTextColor={stylesVars.textMuted}
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
                                        <ActivityIndicator />
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

const stylesVars = {
    background: "#020617",
    surfaceAlt: "#111827",
    text: "#E5F2FF",
    textMuted: "#9CA3AF",

    primary: "#3B82F6",
    danger: "#DC2626",
    success: "#16A34A", // ✅ xanh lá
};

const styles = StyleSheet.create({
    /* ===== Nút dấu cộng (GIỮ NGUYÊN) ===== */
    addBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(59,130,246,0.15)",
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.45)",
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
        backgroundColor: "rgba(15,23,42,0.85)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    /* ===== Card ===== */
    card: {
        width: "96%",
        maxWidth: 560,
        maxHeight: "88%",
        backgroundColor: stylesVars.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.5)",
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    cardContent: {
        paddingBottom: 6,
    },

    /* ===== Text ===== */
    title: {
        color: stylesVars.text,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 10,
        textAlign: "center",
    },
    label: {
        color: stylesVars.textMuted,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 10,
        marginBottom: 6,
    },

    /* ===== Readonly ===== */
    readonlyBox: {
        backgroundColor: stylesVars.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    readonlyText: {
        color: stylesVars.text,
        fontSize: 14,
        fontWeight: "700",
    },

    /* ===== Inputs ===== */
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
    },

    input: {
        backgroundColor: stylesVars.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: stylesVars.text,
        fontSize: 14,
        fontWeight: "600",
    },
    inputReadonly: {
        opacity: 0.95,
    },

    textarea: {
        backgroundColor: stylesVars.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: stylesVars.text,
        fontSize: 14,
        minHeight: 120,
        textAlignVertical: "top",
    },

    /* ===== Errors ===== */
    inputError: {
        borderColor: "rgba(220,38,38,0.65)",
    },
    errorText: {
        color: stylesVars.danger,
        fontSize: 12,
        fontWeight: "600",
    },

    /* ===== Footer buttons ===== */
    footer: {
        flexDirection: "row",
        marginTop: 14,
    },

    btn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },

    /* ✅ Nút LƯU — XANH LÁ #16A34A */
    btnPrimary: {
        backgroundColor: "#16A34A",
        borderColor: stylesVars.success,
    },

    /* ❌ Nút HỦY — GIỮ NGUYÊN */
    btnSecondary: {
        backgroundColor: "#DC2626",
        borderColor: "rgba(255,255,255,0.12)",
    },

    btnDisabled: {
        opacity: 0.5,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.12)",
    },

    btnPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.9,
    },

    btnText: {
        color: stylesVars.text,
        fontWeight: "800",
    },
});
