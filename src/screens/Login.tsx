// src/screens/Login.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";

import Logo from "../logo.png";
import { AppScreen } from "../components/ui/AppScreen";
import { BaseModal } from "../components/ui/BaseModal";
import { colors, spacing, radius } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import {
    VERSION,
    storage,
    KEY_REMEMBER_ME,
    KEY_REMEMBERED_USERNAME,
    KEY_REMEMBERED_PASSWORD,
} from "../config/apiConfig";
import DeviceInfo from "react-native-device-info";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation, route }: Props) {
    const { login, verifyReset, resetPassword, error } = useAuth();

    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [rememberMe, setRememberMe] = useState(() => {
        return storage.getString(KEY_REMEMBER_ME) === "1";
    });

    // 👁 show/hide password
    const [showPass, setShowPass] = useState(false);
    const passRef = useRef<TextInput>(null);

    // =========================
    // Forgot password (2-step)
    // =========================
    // Step 1: verify username + code
    const [fpVerifyOpen, setFpVerifyOpen] = useState(false);
    const [fpVerifySubmitting, setFpVerifySubmitting] = useState(false);
    const [fpVerifyErr, setFpVerifyErr] = useState<string>("");

    const [fpUsername, setFpUsername] = useState("");
    const [fpCode, setFpCode] = useState("");

    const fpUserRef = useRef<TextInput>(null);
    const fpCodeRef = useRef<TextInput>(null);

    // Step 2: reset password with resetToken
    const [fpResetOpen, setFpResetOpen] = useState(false);
    const [fpResetSubmitting, setFpResetSubmitting] = useState(false);
    const [fpResetErr, setFpResetErr] = useState<string>("");

    const [fpNewPass, setFpNewPass] = useState("");
    const [fpConfirm, setFpConfirm] = useState("");
    const [fpShowNew, setFpShowNew] = useState(false);
    const [fpShowConfirm, setFpShowConfirm] = useState(false);

    const [fpResetToken, setFpResetToken] = useState<string>("");
    const [fpSuccessOpen, setFpSuccessOpen] = useState(false);

    const fpNewRef = useRef<TextInput>(null);
    const fpConfirmRef = useRef<TextInput>(null);
    const MODAL_MAX_H = Math.floor(Dimensions.get("window").height * 0.86);

    // ✅ prefill username from Register
    useEffect(() => {
        const u = route?.params?.prefillUsername;
        if (u && u.trim().length > 0) {
            setUsername(u.trim());
            setPassword("");
            requestAnimationFrame(() => passRef.current?.focus());
            navigation.setParams({ prefillUsername: undefined });
        }
    }, [route?.params?.prefillUsername, navigation]);

    // ✅ load remembered username + password (only if rememberMe=true)
    useEffect(() => {
        if (!rememberMe) return;

        const rememberedU = storage.getString(KEY_REMEMBERED_USERNAME) || "";
        const rememberedP = storage.getString(KEY_REMEMBERED_PASSWORD) || "";

        if (rememberedU.trim().length > 0) setUsername(rememberedU.trim());
        if (rememberedP.length > 0) setPassword(rememberedP);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Animation =====
    const aLogo = useRef(new Animated.Value(0)).current;
    const aBrand = useRef(new Animated.Value(0)).current;
    const aWelcome = useRef(new Animated.Value(0)).current;
    const aDesc = useRef(new Animated.Value(0)).current;
    const aForm = useRef(new Animated.Value(0)).current;
    const aFooter = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(160, [
            Animated.timing(aLogo, {
                toValue: 1,
                duration: 420,
                useNativeDriver: true,
            }),
            Animated.timing(aBrand, {
                toValue: 1,
                duration: 460,
                useNativeDriver: true,
            }),
            Animated.timing(aWelcome, {
                toValue: 1,
                duration: 520,
                useNativeDriver: true,
            }),
            Animated.timing(aDesc, {
                toValue: 1,
                duration: 680,
                delay: 280,
                useNativeDriver: true,
            }),
            Animated.timing(aForm, {
                toValue: 1,
                duration: 520,
                useNativeDriver: true,
            }),
            Animated.timing(aFooter, {
                toValue: 1,
                duration: 520,
                useNativeDriver: true,
            }),
        ]).start();
    }, [aLogo, aBrand, aWelcome, aDesc, aForm, aFooter]);

    const canSubmit = useMemo(
        () => username.trim().length > 0 && password.length > 0 && !submitting,
        [username, password, submitting]
    );

    // ✅ persist remember (username + password)
    const persistRemember = (checked: boolean, u: string, p: string) => {
        storage.set(KEY_REMEMBER_ME, checked ? "1" : "0");

        if (checked) {
            if (u.trim()) storage.set(KEY_REMEMBERED_USERNAME, u.trim());
            if (p.length > 0) storage.set(KEY_REMEMBERED_PASSWORD, p);
        } else {
            storage.remove(KEY_REMEMBERED_USERNAME);
            storage.remove(KEY_REMEMBERED_PASSWORD);
        }
    };

    const onToggleRemember = () => {
        const next = !rememberMe;
        setRememberMe(next);

        // nếu bật thì lưu ngay giá trị hiện tại; nếu tắt thì xoá
        persistRemember(next, username, password);
    };

    const onSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const deviceName =
                (await DeviceInfo.getDeviceName()) || `${Platform.OS}-device`;

            const result = await login(username.trim(), password, deviceName);

            // ✅ login ok -> persist remember theo toggle
            if (result.ok) {
                persistRemember(rememberMe, username.trim(), password);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const animStyle = (v: Animated.Value, y = 10) => ({
        opacity: v,
        transform: [
            {
                translateY: v.interpolate({
                    inputRange: [0, 1],
                    outputRange: [y, 0],
                }),
            },
        ],
    });

    const toggleShowPass = () => {
        if (submitting) return;
        setShowPass((v) => !v);
        requestAnimationFrame(() => passRef.current?.focus());
    };

    // =========================
    // Forgot password handlers
    // =========================
    const openForgot = () => {
        // reset all states
        setFpVerifyErr("");
        setFpResetErr("");
        setFpSuccessOpen(false);

        const u = username.trim();
        setFpUsername(u);
        setFpCode("");

        setFpResetToken("");
        setFpNewPass("");
        setFpConfirm("");
        setFpShowNew(false);
        setFpShowConfirm(false);

        // open step 1
        setFpResetOpen(false);
        setFpVerifyOpen(true);

        requestAnimationFrame(() => {
            if (u) fpCodeRef.current?.focus();
            else fpUserRef.current?.focus();
        });
    };

    const fpVerifyCanSubmit = useMemo(() => {
        if (fpVerifySubmitting) return false;
        if (!fpUsername.trim()) return false;
        if (!fpCode.trim()) return false;
        return true;
    }, [fpUsername, fpCode, fpVerifySubmitting]);

    const submitVerify = async () => {
        if (!fpVerifyCanSubmit) return;
        setFpVerifySubmitting(true);
        setFpVerifyErr("");

        try {
            const rs = await verifyReset({
                username: fpUsername.trim(),
                code: fpCode.trim(),
            });

            if (!rs.ok || !rs.resetToken) {
                setFpVerifyErr(rs.message || "Sai username hoặc mã nhân viên");
                return;
            }

            // ok -> open step 2
            setFpResetToken(rs.resetToken);
            setFpVerifyOpen(false);
            setFpResetOpen(true);

            requestAnimationFrame(() => fpNewRef.current?.focus());
        } catch (e: any) {
            setFpVerifyErr(e?.message || "Xác minh thất bại");
        } finally {
            setFpVerifySubmitting(false);
        }
    };

    const fpResetCanSubmit = useMemo(() => {
        if (fpResetSubmitting) return false;
        if (!fpResetToken) return false;
        if (fpNewPass.length < 6) return false;
        if (fpConfirm.length < 6) return false;
        if (fpNewPass !== fpConfirm) return false;
        return true;
    }, [fpResetSubmitting, fpResetToken, fpNewPass, fpConfirm]);

    const submitReset = async () => {
        if (!fpResetCanSubmit) return;
        setFpResetSubmitting(true);
        setFpResetErr("");

        try {
            const ok = await resetPassword({
                resetToken: fpResetToken,
                newPassword: fpNewPass,
            });

            if (!ok) {
                setFpResetErr("Đặt lại mật khẩu thất bại");
                return;
            }

            setFpResetOpen(false);
            setFpSuccessOpen(true);

            // prefill login username
            setUsername(fpUsername.trim());
            setPassword("");
            requestAnimationFrame(() => passRef.current?.focus());
        } catch (e: any) {
            setFpResetErr(e?.message || "Đặt lại mật khẩu thất bại");
        } finally {
            setFpResetSubmitting(false);
        }
    };

    return (
        <AppScreen>
            {/* ===================== */}
            {/* Forgot Password - Step 1 */}
            {/* ===================== */}
            <BaseModal
                visible={fpVerifyOpen}
                onRequestClose={() => setFpVerifyOpen(false)}
                width="100%"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={[styles.modalKav, { maxHeight: MODAL_MAX_H }]}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior="never"
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <View style={styles.fpWrap}>
                            <Text style={styles.fpTitle}>Quên mật khẩu</Text>
                            <Text style={styles.fpDesc}>
                                Nhập tên đăng nhập và mã nhân viên để xác minh.
                            </Text>

                            <Text
                                style={[
                                    styles.label,
                                    { marginTop: spacing.md },
                                ]}
                            >
                                Tên đăng nhập
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={colors.textMuted}
                                    style={styles.leftIcon}
                                />
                                <TextInput
                                    ref={fpUserRef}
                                    value={fpUsername}
                                    onChangeText={setFpUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholder="vd: hieu.nguyen"
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.input}
                                    editable={!fpVerifySubmitting}
                                    returnKeyType="next"
                                    onSubmitEditing={() =>
                                        fpCodeRef.current?.focus()
                                    }
                                />
                            </View>

                            <Text
                                style={[
                                    styles.label,
                                    { marginTop: spacing.md },
                                ]}
                            >
                                Mã nhân viên
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name="barcode-outline"
                                    size={18}
                                    color={colors.textMuted}
                                    style={styles.leftIcon}
                                />
                                <TextInput
                                    ref={fpCodeRef}
                                    value={fpCode}
                                    onChangeText={setFpCode}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    placeholder="vd: NV00123"
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.input}
                                    editable={!fpVerifySubmitting}
                                    returnKeyType="done"
                                    onSubmitEditing={submitVerify}
                                />
                            </View>

                            {!!fpVerifyErr && (
                                <View style={styles.errorBox}>
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={18}
                                        color={colors.danger}
                                    />
                                    <Text style={styles.errorText}>
                                        {fpVerifyErr}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={submitVerify}
                                disabled={!fpVerifyCanSubmit}
                                style={[
                                    styles.fpBtn,
                                    (!fpVerifyCanSubmit ||
                                        fpVerifySubmitting) && {
                                        opacity: 0.6,
                                    },
                                ]}
                            >
                                {fpVerifySubmitting ? (
                                    <ActivityIndicator />
                                ) : (
                                    <View style={styles.buttonRow}>
                                        <Ionicons
                                            name="arrow-forward-outline"
                                            size={18}
                                            color={colors.text}
                                        />
                                        <Text style={styles.fpBtnText}>
                                            Tiếp tục
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setFpVerifyOpen(false)}
                                disabled={fpVerifySubmitting}
                                style={styles.fpBtnGhost}
                            >
                                <Text style={styles.fpBtnGhostText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BaseModal>

            {/* ===================== */}
            {/* Forgot Password - Step 2 */}
            {/* ===================== */}
            <BaseModal
                visible={fpResetOpen}
                onRequestClose={() => setFpResetOpen(false)}
                width="100%"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={[styles.modalKav, { maxHeight: MODAL_MAX_H }]}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <View style={styles.fpWrap}>
                            <Text style={styles.fpTitle}>Đặt mật khẩu mới</Text>
                            <Text style={styles.fpDesc}>
                                Nhập mật khẩu mới cho tài khoản{" "}
                                <Text style={{ fontWeight: "900" }}>
                                    {fpUsername.trim()}
                                </Text>
                            </Text>

                            <Text
                                style={[
                                    styles.label,
                                    { marginTop: spacing.md },
                                ]}
                            >
                                Mật khẩu mới
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={18}
                                    color={colors.textMuted}
                                    style={styles.leftIcon}
                                />
                                <TextInput
                                    ref={fpNewRef}
                                    value={fpNewPass}
                                    onChangeText={setFpNewPass}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry={!fpShowNew}
                                    placeholder="Tối thiểu 6 ký tự"
                                    placeholderTextColor={colors.textMuted}
                                    style={[
                                        styles.input,
                                        styles.singleLineInput,
                                    ]}
                                    editable={!fpResetSubmitting}
                                    returnKeyType="next"
                                    onSubmitEditing={() =>
                                        fpConfirmRef.current?.focus()
                                    }
                                    multiline={false}
                                    numberOfLines={1}
                                />
                                <TouchableOpacity
                                    onPress={() => setFpShowNew((v) => !v)}
                                    disabled={fpResetSubmitting}
                                    style={styles.eyeBtn}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={
                                            fpShowNew
                                                ? "eye-off-outline"
                                                : "eye-outline"
                                        }
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text
                                style={[
                                    styles.label,
                                    { marginTop: spacing.md },
                                ]}
                            >
                                Nhập lại mật khẩu mới
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={18}
                                    color={colors.textMuted}
                                    style={styles.leftIcon}
                                />
                                <TextInput
                                    ref={fpConfirmRef}
                                    value={fpConfirm}
                                    onChangeText={setFpConfirm}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry={!fpShowConfirm}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={colors.textMuted}
                                    style={[
                                        styles.input,
                                        styles.singleLineInput,
                                    ]}
                                    editable={!fpResetSubmitting}
                                    returnKeyType="done"
                                    onSubmitEditing={submitReset}
                                    multiline={false}
                                    numberOfLines={1}
                                />
                                <TouchableOpacity
                                    onPress={() => setFpShowConfirm((v) => !v)}
                                    disabled={fpResetSubmitting}
                                    style={styles.eyeBtn}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={
                                            fpShowConfirm
                                                ? "eye-off-outline"
                                                : "eye-outline"
                                        }
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            {fpNewPass.length > 0 &&
                                fpConfirm.length > 0 &&
                                fpNewPass !== fpConfirm && (
                                    <Text style={styles.fpInlineWarn}>
                                        Mật khẩu nhập lại không khớp
                                    </Text>
                                )}

                            {!!fpResetErr && (
                                <View style={styles.errorBox}>
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={18}
                                        color={colors.danger}
                                    />
                                    <Text style={styles.errorText}>
                                        {fpResetErr}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={submitReset}
                                disabled={!fpResetCanSubmit}
                                style={[
                                    styles.fpBtn,
                                    (!fpResetCanSubmit ||
                                        fpResetSubmitting) && {
                                        opacity: 0.6,
                                    },
                                ]}
                            >
                                {fpResetSubmitting ? (
                                    <ActivityIndicator />
                                ) : (
                                    <View style={styles.buttonRow}>
                                        <Ionicons
                                            name="refresh-outline"
                                            size={18}
                                            color={colors.text}
                                        />
                                        <Text style={styles.fpBtnText}>
                                            Đặt lại mật khẩu
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    // quay lại bước 1 nếu muốn
                                    setFpResetOpen(false);
                                    setFpVerifyOpen(true);
                                    requestAnimationFrame(() =>
                                        fpCodeRef.current?.focus()
                                    );
                                }}
                                disabled={fpResetSubmitting}
                                style={styles.fpBtnGhost}
                            >
                                <Text style={styles.fpBtnGhostText}>
                                    Quay lại
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BaseModal>

            {/* ===== Forgot Password Success Modal ===== */}
            <BaseModal
                visible={fpSuccessOpen}
                onRequestClose={() => setFpSuccessOpen(false)}
                width="100%"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={[styles.modalKav, { maxHeight: MODAL_MAX_H }]}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <View style={styles.fpSuccessWrap}>
                            <View style={styles.fpSuccessIcon}>
                                <Ionicons
                                    name="checkmark"
                                    size={26}
                                    color={colors.text}
                                />
                            </View>

                            <Text style={styles.fpSuccessTitle}>
                                Đặt lại mật khẩu thành công
                            </Text>
                            <Text style={styles.fpSuccessDesc}>
                                Bạn có thể đăng nhập ngay bằng mật khẩu mới.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setFpSuccessOpen(false)}
                                style={[
                                    styles.fpBtn,
                                    { marginTop: spacing.md },
                                ]}
                            >
                                <View style={styles.buttonRow}>
                                    <Ionicons
                                        name="log-in-outline"
                                        size={18}
                                        color={colors.text}
                                    />
                                    <Text style={styles.fpBtnText}>
                                        Về đăng nhập
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BaseModal>

            {/* ===== MAIN LOGIN ===== */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} // ✅ fix: Android cũng tránh bàn phím
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                    accessible={false}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            {/* ===== TOP BRAND ===== */}
                            <Animated.View
                                style={[
                                    styles.brandBlock,
                                    animStyle(aLogo, 14),
                                ]}
                            >
                                <View style={styles.logoWrap}>
                                    <Image
                                        source={Logo}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                </View>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.brandTextBlock,
                                    animStyle(aBrand, 12),
                                ]}
                            >
                                <Text style={styles.appName}>SGP TRACKING</Text>
                                <Text style={styles.appTagline}>
                                    Hệ thống quản lý công nghiệp
                                </Text>
                            </Animated.View>

                            {/* ===== WELCOME ===== */}
                            <Animated.View
                                style={[
                                    styles.welcomeBlock,
                                    animStyle(aWelcome, 10),
                                ]}
                            >
                                <Text style={styles.welcomeTitle}>
                                    Chào mừng trở lại
                                </Text>
                            </Animated.View>

                            <Animated.View
                                style={[styles.descBlock, animStyle(aDesc, 8)]}
                            >
                                <Text style={styles.welcomeDesc}>
                                    Đăng nhập để truy cập bảng điều khiển
                                </Text>
                            </Animated.View>

                            {/* ===== FORM ===== */}
                            <Animated.View
                                style={[styles.formCard, animStyle(aForm, 10)]}
                            >
                                {/* Username */}
                                <Text style={styles.label}>Tên đăng nhập</Text>
                                <View style={styles.inputWrap}>
                                    <Ionicons
                                        name="person-outline"
                                        size={18}
                                        color={colors.textMuted}
                                        style={styles.leftIcon}
                                    />
                                    <TextInput
                                        value={username}
                                        onChangeText={(t) => {
                                            setUsername(t);

                                            // ✅ nếu đang bật rememberMe thì update username lưu
                                            if (rememberMe) {
                                                storage.set(
                                                    KEY_REMEMBERED_USERNAME,
                                                    t.trim()
                                                );
                                            }
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        placeholder="Email hoặc ID nhân viên"
                                        placeholderTextColor={colors.textMuted}
                                        style={styles.input}
                                        editable={!submitting}
                                        returnKeyType="next"
                                        onSubmitEditing={() =>
                                            passRef.current?.focus()
                                        }
                                    />
                                </View>

                                {/* Password */}
                                <Text
                                    style={[
                                        styles.label,
                                        { marginTop: spacing.md },
                                    ]}
                                >
                                    Mật khẩu
                                </Text>
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
                                        onChangeText={(t) => {
                                            setPassword(t);

                                            // ✅ nếu đang bật rememberMe thì update password lưu luôn
                                            if (rememberMe) {
                                                storage.set(
                                                    KEY_REMEMBERED_PASSWORD,
                                                    t
                                                );
                                            }
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        secureTextEntry={!showPass}
                                        textContentType="password"
                                        autoComplete="password"
                                        importantForAutofill="no"
                                        placeholder="Nhập mật khẩu của bạn"
                                        placeholderTextColor={colors.textMuted}
                                        style={[
                                            styles.input,
                                            styles.singleLineInput,
                                        ]}
                                        editable={!submitting}
                                        returnKeyType="done"
                                        onSubmitEditing={onSubmit}
                                        multiline={false}
                                        numberOfLines={1}
                                        scrollEnabled
                                        textAlignVertical="center"
                                        selectionColor={colors.primary}
                                    />

                                    {/* 👁 eye toggle */}
                                    <TouchableOpacity
                                        onPress={toggleShowPass}
                                        disabled={submitting}
                                        style={styles.eyeBtn}
                                        activeOpacity={0.8}
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

                                {/* Remember + Forgot */}
                                <View style={styles.rowBetween}>
                                    <Pressable
                                        onPress={onToggleRemember}
                                        style={styles.rememberRow}
                                        disabled={submitting}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                rememberMe &&
                                                    styles.checkboxChecked,
                                            ]}
                                        >
                                            {rememberMe && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={14}
                                                    color={colors.text}
                                                />
                                            )}
                                        </View>
                                        <Text style={styles.rememberText}>
                                            Ghi nhớ tôi
                                        </Text>
                                    </Pressable>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={openForgot}
                                        disabled={submitting}
                                    >
                                        <Text style={styles.forgotText}>
                                            Quên mật khẩu?
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {!!error && (
                                    <View style={styles.errorBox}>
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={18}
                                            color={colors.danger}
                                        />
                                        <Text style={styles.errorText}>
                                            {error}
                                        </Text>
                                    </View>
                                )}

                                {/* Submit */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={onSubmit}
                                    disabled={!canSubmit}
                                    style={[
                                        styles.button,
                                        (!canSubmit || submitting) && {
                                            opacity: 0.6,
                                        },
                                    ]}
                                >
                                    {submitting ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <View style={styles.buttonRow}>
                                            <Ionicons
                                                name="log-in-outline"
                                                size={18}
                                                color={colors.text}
                                            />
                                            <Text style={styles.buttonText}>
                                                Đăng nhập
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>

                            {/* ===== FOOTER ===== */}
                            <Animated.View
                                style={[styles.footer, animStyle(aFooter, 8)]}
                            >
                                <View style={styles.footerRow}>
                                    <Text style={styles.footerMuted}>
                                        Chưa có tài khoản?
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            navigation.navigate("Register")
                                        }
                                        disabled={submitting}
                                    >
                                        <Text style={styles.footerLink}>
                                            {" "}
                                            Đăng ký ngay
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.versionText}>
                                    • Phiên bản {VERSION}
                                </Text>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
        justifyContent: "center",
    },

    brandBlock: { alignItems: "center" },

    brandTextBlock: {
        alignItems: "center",
        marginTop: spacing.lg,
    },
    appName: {
        color: colors.text,
        fontSize: 34,
        fontWeight: "800",
    },
    appTagline: {
        color: colors.textMuted,
        marginTop: 6,
        fontSize: 15,
    },

    welcomeBlock: {
        marginTop: spacing.xl,
        alignItems: "center",
    },
    welcomeTitle: {
        color: colors.text,
        fontSize: 30,
        fontWeight: "800",
    },
    descBlock: {
        marginTop: 8,
        alignItems: "center",
    },
    welcomeDesc: {
        color: colors.textMuted,
        fontSize: 14,
    },

    formCard: {
        marginTop: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },

    label: {
        color: colors.textSoft,
        marginBottom: 8,
        fontSize: 13,
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
    singleLineInput: {
        height: 48,
        paddingVertical: 0,
        includeFontPadding: false,
    },
    eyeBtn: {
        paddingHorizontal: spacing.md,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },

    rowBetween: {
        marginTop: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primaryBorderStrong,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    rememberText: {
        color: colors.textSoft,
        fontSize: 13,
    },
    forgotText: {
        color: colors.primary,
        fontWeight: "700",
        fontSize: 13,
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

    button: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: "center",
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    buttonText: {
        color: colors.text,
        fontWeight: "800",
        fontSize: 16,
    },

    footer: {
        marginTop: spacing.xl,
        alignItems: "center",
        gap: 10,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerMuted: {
        color: colors.textMuted,
        fontSize: 13,
    },
    footerLink: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "800",
    },
    versionText: {
        color: colors.textMuted,
        fontSize: 12,
        opacity: 0.7,
    },

    logoWrap: {
        width: 96,
        height: 96,
        borderRadius: 24,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    logo: {
        width: 96,
        height: 96,
    },

    // ===== Forgot Password Modal =====
    fpWrap: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    fpTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "900",
        textAlign: "center",
    },
    fpDesc: {
        marginTop: 8,
        color: colors.textMuted,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
    },
    fpInlineWarn: {
        marginTop: 8,
        color: colors.warning,
        fontSize: 12.5,
    },
    fpBtn: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    fpBtnText: {
        color: colors.text,
        fontWeight: "900",
        fontSize: 15,
    },
    fpBtnGhost: {
        marginTop: spacing.md,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingVertical: 12,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    fpBtnGhostText: {
        color: colors.textSoft,
        fontWeight: "800",
        fontSize: 14,
        opacity: 0.95,
    },

    fpSuccessWrap: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
    },
    fpSuccessIcon: {
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
    fpSuccessTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "900",
        textAlign: "center",
    },
    fpSuccessDesc: {
        marginTop: 8,
        color: colors.textSoft,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        maxWidth: 320,
        opacity: 0.95,
    },
    modalKav: {
        width: "100%",
        alignSelf: "stretch",
        flexShrink: 1,
    },
    modalScrollContent: {
        paddingTop: 0,
        paddingBottom: 0,
    },
});
