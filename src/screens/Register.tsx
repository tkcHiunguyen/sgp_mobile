// src/screens/Register.tsx
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";
import { AppScreen } from "../components/ui/AppScreen";
import BackButton from "../components/backButton";
import { BaseModal } from "../components/ui/BaseModal";
import { colors, spacing, radius } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string>("");

    const [successOpen, setSuccessOpen] = useState(false);

    const scrollRef = useRef<ScrollView>(null);

    // ✅ refs: typed with | null to match React.RefObject expectations
    const fullNameRef = useRef<TextInput | null>(null);
    const codeRef = useRef<TextInput | null>(null);
    const passRef = useRef<TextInput | null>(null);
    const confirmRef = useRef<TextInput | null>(null);

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!username.trim()) return false;
        if (!fullName.trim()) return false;
        if (!code.trim()) return false;
        if (password.length < 6) return false;
        if (confirm.length < 6) return false;
        if (password !== confirm) return false;
        return true;
    }, [username, fullName, code, password, confirm, submitting]);

    const passwordMismatch =
        password.length > 0 && confirm.length > 0 && password !== confirm;

    const onSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setErr("");

        try {
            await register({
                username: username.trim(),
                fullName: fullName.trim(),
                code: code.trim(),
                password,
            });

            setSuccessOpen(true);
        } catch (e: any) {
            setErr(e?.message || "Đăng ký thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const gotoLogin = () => {
        setSuccessOpen(false);
        navigation.navigate("Login", { prefillUsername: username.trim() });
    };

    const toggleShowPass = () => {
        if (submitting) return;
        setShowPass((v) => !v);
        requestAnimationFrame(() => passRef.current?.focus());
    };

    const toggleShowConfirm = () => {
        if (submitting) return;
        setShowConfirm((v) => !v);
        requestAnimationFrame(() => confirmRef.current?.focus());
    };

    return (
        <AppScreen>
            <BackButton onPress={() => navigation.goBack()} />

            {/* ✅ Success Modal */}
            <BaseModal
                visible={successOpen}
                onClose={() => setSuccessOpen(false)}
            >
                <View style={styles.modalCard}>
                    <View style={styles.modalIcon}>
                        <Ionicons
                            name="checkmark"
                            size={26}
                            color={colors.text}
                        />
                    </View>

                    <Text style={styles.modalTitle}>Đăng ký thành công</Text>
                    <Text style={styles.modalDesc}>
                        Vui lòng liên hệ quản trị viên để phê duyệt tài khoản
                        trước khi đăng nhập.
                    </Text>

                    <View style={styles.modalHint}>
                        <Ionicons
                            name="time-outline"
                            size={16}
                            color={colors.textMuted}
                        />
                        <Text style={styles.modalHintText}>
                            Tài khoản sẽ ở trạng thái “Chờ duyệt”.
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={gotoLogin}
                        style={[styles.modalBtn, styles.modalBtnPrimary]}
                    >
                        <View style={styles.btnRow}>
                            <Ionicons
                                name="log-in-outline"
                                size={18}
                                color={colors.text}
                            />
                            <Text style={styles.modalBtnText}>
                                Về đăng nhập
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSuccessOpen(false)}
                        style={[styles.modalBtn, styles.modalBtnGhost]}
                    >
                        <Text style={styles.modalGhostText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </BaseModal>

            {/* ✅ Keyboard behavior giống Login */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                    accessible={false}
                >
                    <ScrollView
                        ref={scrollRef}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="none" // ✅ kéo KHÔNG tắt bàn phím
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.page}>
                            {/* ===== Header (UI mới) ===== */}
                            <View style={styles.header}>
                                <Text style={styles.hTitle}>Tạo tài khoản</Text>
                                <Text style={styles.hSub}>
                                    Đăng ký tài khoản nội bộ • Chờ quản trị viên
                                    phê duyệt
                                </Text>

                                <View style={styles.hChips}>
                                    <View style={styles.chip}>
                                        <Ionicons
                                            name="key-outline"
                                            size={14}
                                            color={colors.textMuted}
                                        />
                                        <Text style={styles.chipText}>
                                            ≥ 6 ký tự
                                        </Text>
                                    </View>
                                    <View style={styles.chip}>
                                        <Ionicons
                                            name="barcode-outline"
                                            size={14}
                                            color={colors.textMuted}
                                        />
                                        <Text style={styles.chipText}>
                                            cần mã NV
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* ===== Form Card ===== */}
                            <View style={styles.formCard}>
                                <Text style={styles.sectionTitle}>
                                    Thông tin tài khoản
                                </Text>

                                <Field
                                    label="Tên đăng nhập"
                                    icon="person-outline"
                                    editable={!submitting}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="vd: hieu.nguyen"
                                    returnKeyType="next"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onSubmitEditing={() =>
                                        fullNameRef.current?.focus()
                                    }
                                />

                                <Field
                                    refInput={fullNameRef}
                                    label="Họ và tên"
                                    icon="id-card-outline"
                                    editable={!submitting}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="vd: Hiếu Nguyễn"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    onSubmitEditing={() =>
                                        codeRef.current?.focus()
                                    }
                                />

                                <Field
                                    refInput={codeRef}
                                    label="Mã nhân viên"
                                    icon="barcode-outline"
                                    editable={!submitting}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="vd: NV00123"
                                    returnKeyType="next"
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    onSubmitEditing={() =>
                                        passRef.current?.focus()
                                    }
                                />

                                <View style={styles.divider} />

                                <Text style={styles.sectionTitle}>
                                    Mật khẩu
                                </Text>

                                {/* Password */}
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Mật khẩu</Text>
                                </View>
                                <View style={styles.inputWrap}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={18}
                                        color={colors.textMuted}
                                        style={styles.leftIcon}
                                    />
                                    <TextInput
                                        ref={passRef}
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!submitting}
                                        placeholder="Tối thiểu 6 ký tự"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry={!showPass}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                        onSubmitEditing={() =>
                                            confirmRef.current?.focus()
                                        }
                                        style={[
                                            styles.input,
                                            styles.singleLine,
                                        ]}
                                        selectionColor={colors.primary}
                                        multiline={false}
                                        numberOfLines={1}
                                    />
                                    <TouchableOpacity
                                        onPress={toggleShowPass}
                                        disabled={submitting}
                                        style={styles.eyeBtn}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={
                                                showPass
                                                    ? "eye-off-outline"
                                                    : "eye-outline"
                                            }
                                            size={20}
                                            color={colors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Confirm */}
                                <View
                                    style={[styles.labelRow, { marginTop: 12 }]}
                                >
                                    <Text style={styles.label}>
                                        Nhập lại mật khẩu
                                    </Text>
                                </View>
                                <View style={styles.inputWrap}>
                                    <Ionicons
                                        name="shield-checkmark-outline"
                                        size={18}
                                        color={colors.textMuted}
                                        style={styles.leftIcon}
                                    />
                                    <TextInput
                                        ref={confirmRef}
                                        value={confirm}
                                        onChangeText={setConfirm}
                                        editable={!submitting}
                                        placeholder="Nhập lại mật khẩu"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry={!showConfirm}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={onSubmit}
                                        style={[
                                            styles.input,
                                            styles.singleLine,
                                        ]}
                                        selectionColor={colors.primary}
                                        multiline={false}
                                        numberOfLines={1}
                                    />
                                    <TouchableOpacity
                                        onPress={toggleShowConfirm}
                                        disabled={submitting}
                                        style={styles.eyeBtn}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={
                                                showConfirm
                                                    ? "eye-off-outline"
                                                    : "eye-outline"
                                            }
                                            size={20}
                                            color={colors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {passwordMismatch && (
                                    <View style={styles.warnRow}>
                                        <Ionicons
                                            name="warning-outline"
                                            size={16}
                                            color={colors.warning}
                                        />
                                        <Text style={styles.warnText}>
                                            Mật khẩu nhập lại không khớp
                                        </Text>
                                    </View>
                                )}

                                {!!err && (
                                    <View style={styles.errorBox}>
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={18}
                                            color={colors.danger}
                                        />
                                        <Text style={styles.errorText}>
                                            {err}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={onSubmit}
                                    disabled={!canSubmit}
                                    style={[
                                        styles.primaryBtn,
                                        (!canSubmit || submitting) && {
                                            opacity: 0.6,
                                        },
                                    ]}
                                >
                                    {submitting ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <View style={styles.btnRow}>
                                            <Ionicons
                                                name="person-add-outline"
                                                size={18}
                                                color={colors.text}
                                            />
                                            <Text style={styles.primaryBtnText}>
                                                Tạo tài khoản
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigation.navigate("Login", {
                                            prefillUsername:
                                                username.trim() || undefined,
                                        })
                                    }
                                    disabled={submitting}
                                    style={styles.secondaryRow}
                                >
                                    <Text style={styles.secondaryText}>
                                        Đã có tài khoản?
                                    </Text>
                                    <Text style={styles.secondaryLink}>
                                        {" "}
                                        Đăng nhập
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* ✅ tăng đệm đáy thêm để hết che ~20px */}
                            <View style={{ height: spacing.xl + 48 }} />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </AppScreen>
    );
}

/**
 * UI field component (theme đúng)
 */
function Field(props: {
    label: string;
    icon: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    editable: boolean;
    returnKeyType: "next" | "done";
    autoCapitalize?: "none" | "words" | "characters";
    autoCorrect?: boolean;
    onSubmitEditing?: () => void;
    // ✅ FIX TS: ref can be null
    refInput?: React.RefObject<TextInput | null>;
}) {
    const {
        label,
        icon,
        value,
        onChangeText,
        placeholder,
        editable,
        returnKeyType,
        autoCapitalize,
        autoCorrect,
        onSubmitEditing,
        refInput,
    } = props;

    return (
        <>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.inputWrap}>
                <Ionicons
                    name={icon as any}
                    size={18}
                    color={colors.textMuted}
                    style={styles.leftIcon}
                />
                <TextInput
                    ref={refInput}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.singleLine]}
                    returnKeyType={returnKeyType}
                    autoCapitalize={autoCapitalize || "none"}
                    autoCorrect={autoCorrect ?? false}
                    onSubmitEditing={onSubmitEditing}
                    selectionColor={colors.primary}
                    multiline={false}
                    numberOfLines={1}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    page: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: 0,
        paddingBottom: spacing.xl + 28, 
    },

    // ===== Header (
    //  UI) =====
    header: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    hTitle: {
        color: colors.text,
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: 0.2,
        textAlign: "center",
    },
    hSub: {
        marginTop: 8,
        color: colors.textMuted,
        fontSize: 13,
        lineHeight: 18,
        textAlign: "center",
        maxWidth: 360,
    },
    hChips: {
        flexDirection: "row",
        gap: 10,
        marginTop: spacing.md,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    chipText: {
        color: colors.textSoft,
        fontSize: 12.5,
        fontWeight: "800",
        opacity: 0.95,
    },

    // ===== Form Card =====
    formCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    sectionTitle: {
        color: colors.text,
        fontWeight: "900",
        fontSize: 14,
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginVertical: spacing.lg,
    },

    labelRow: {
        marginTop: 12,
        marginBottom: 8,
    },
    label: {
        color: colors.textSoft,
        fontSize: 13,
        fontWeight: "700",
    },

    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.backgroundAlt,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.primaryBorderStrong,
    },
    leftIcon: { marginLeft: spacing.md },
    input: {
        flex: 1,
        paddingHorizontal: spacing.sm,
        color: colors.text,
        fontSize: 15,
    },
    singleLine: {
        height: 48,
        paddingVertical: 0,
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    eyeBtn: {
        paddingHorizontal: spacing.md,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },

    warnRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    warnText: {
        color: colors.warning,
        fontSize: 12.5,
        flex: 1,
        fontWeight: "700",
    },

    errorBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: "rgba(220,38,38,0.5)",
        backgroundColor: "rgba(220,38,38,0.08)",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    errorText: { color: colors.danger, flex: 1 },

    primaryBtn: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    btnRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    primaryBtnText: {
        color: colors.text,
        fontWeight: "900",
        fontSize: 16,
    },

    secondaryRow: {
        marginTop: spacing.lg,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
        opacity: 0.95,
    },
    secondaryText: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: "600",
    },
    secondaryLink: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "900",
    },

    // ===== Modal =====
    modalCard: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
    },
    modalIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(22,163,74,0.2)",
        borderWidth: 1,
        borderColor: "rgba(22,163,74,0.35)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    modalTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "900",
        textAlign: "center",
    },
    modalDesc: {
        marginTop: 8,
        color: colors.textSoft,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        maxWidth: 320,
        opacity: 0.95,
    },
    modalHint: {
        marginTop: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: radius.md,
        width: "100%",
    },
    modalHintText: {
        color: colors.textMuted,
        fontSize: 12.5,
        flex: 1,
        lineHeight: 16,
    },

    modalBtn: {
        marginTop: spacing.md,
        width: "100%",
        borderRadius: radius.md,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnPrimary: { backgroundColor: colors.primary },
    modalBtnGhost: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    modalBtnText: {
        color: colors.text,
        fontWeight: "900",
        fontSize: 15,
    },
    modalGhostText: {
        color: colors.textSoft,
        fontWeight: "800",
        fontSize: 14,
        opacity: 0.95,
    },
});
