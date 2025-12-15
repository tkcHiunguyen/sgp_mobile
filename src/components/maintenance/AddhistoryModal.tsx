import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { BaseModal } from "../ui/BaseModal";
import { AppButton } from "../ui/AppButton";
import { colors } from "../../theme/theme";

export type HistoryRow = {
    deviceName: string;
    date: string; // dd-MM-yy
    content: string;
};

type Props = {
    visible: boolean;
    deviceName: string;
    onClose: () => void;
    onSubmit: (row: HistoryRow) => void;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const todayDdMmYy = () => {
    const d = new Date();
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = pad2(d.getFullYear() % 100);
    return `${dd}-${mm}-${yy}`;
};

const isValidDdMmYy = (value: string) => {
    // very small validation; keep it predictable for UI-only phase
    const m = value.match(/^\d{2}-\d{2}-\d{2}$/);
    if (!m) return false;

    const [dd, mm, yy] = value.split("-").map((x) => parseInt(x, 10));
    if (!dd || !mm) return false;
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;

    // Basic Date sanity check
    const year = 2000 + yy;
    const dt = new Date(year, mm - 1, dd);
    return (
        dt.getFullYear() === year &&
        dt.getMonth() === mm - 1 &&
        dt.getDate() === dd
    );
};

export const AddHistoryModal = ({
    visible,
    deviceName,
    onClose,
    onSubmit,
}: Props) => {
    const defaultDate = useMemo(() => todayDdMmYy(), []);
    const [date, setDate] = useState(defaultDate);
    const [content, setContent] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (visible) {
            setDate(todayDdMmYy());
            setContent("");
            setTouched(false);
        }
    }, [visible]);

    const contentOk = content.trim().length >= 3;
    const dateOk = isValidDdMmYy(date.trim());
    const canSave = contentOk && dateOk;

    const handleSave = () => {
        setTouched(true);
        if (!canSave) return;

        onSubmit({
            deviceName,
            date: date.trim(),
            content: content.trim(),
        });
    };

    return (
        <BaseModal visible={visible} onRequestClose={onClose} width="90%">
            <Text style={styles.modalTitle}>Thêm lịch sử</Text>
            <View style={styles.body}>
                <Text style={styles.label}>Thiết bị</Text>
                <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>{deviceName}</Text>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Ngày (dd-MM-yy)</Text>
                        <TextInput
                            value={date}
                            onChangeText={setDate}
                            placeholder="vd: 15-12-25"
                            placeholderTextColor={colors.textMuted}
                            style={[
                                styles.input,
                                touched && !dateOk && styles.inputError,
                            ]}
                        />
                        {touched && !dateOk && (
                            <Text style={styles.errorText}>
                                Ngày không hợp lệ. Định dạng: dd-MM-yy
                            </Text>
                        )}
                    </View>

                    <View style={{ width: 12 }} />

                    <View style={{ width: 120, justifyContent: "flex-end" }}>
                        <AppButton
                            title="Hôm nay"
                            variant="secondary"
                            onPress={() => setDate(todayDdMmYy())}
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
                />
                {touched && !contentOk && (
                    <Text style={styles.errorText}>
                        Vui lòng nhập nội dung (tối thiểu 3 ký tự).
                    </Text>
                )}

                <View style={styles.footer}>
                    <AppButton
                        title="Hủy"
                        variant="secondary"
                        onPress={onClose}
                        style={{ flex: 1 }}
                    />
                    <View style={{ width: 12 }} />
                    <AppButton
                        title="Lưu"
                        onPress={handleSave}
                        disabled={!canSave && touched}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 10,
    },
    label: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 6,
    },
    readonlyBox: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    readonlyText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
    },
    textarea: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
        minHeight: 120,
    },
    inputError: {
        borderColor: "rgba(220,38,38,0.65)",
    },
    errorText: {
        color: colors.danger,
        fontSize: 12,
        marginTop: 6,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        marginTop: 6,
    },
    modalTitle: {},
});
