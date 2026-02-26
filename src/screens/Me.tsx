// src/screens/Me.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    Image,
    Platform,
    PermissionsAndroid,
    Linking,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AppScreen } from "../components/ui/AppScreen";
import HeaderBar from "../components/ui/HeaderBar";
import { AUTH_WEBAPP_URL } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { logger } from "../utils/logger";

import type { ThemeColors } from "../theme/theme";

type ConfirmState =
    | {
          visible: true;
          title: string;
          message?: string;
          confirmText?: string;
          cancelText?: string;
          danger?: boolean;
          onConfirm: () => Promise<void> | void;
      }
    | { visible: false };

function ConfirmModal({
    state,
    busy,
    onClose,
}: {
    state: ConfirmState;
    busy: boolean;
    onClose: () => void;
}) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    if (!state.visible) return null;

    return (
        <Modal transparent animationType="fade" visible>
            <Pressable style={styles.modalOverlay} onPress={onClose} />

            <View style={styles.confirmCard}>
                <View style={styles.confirmHeader}>
                    <Text style={styles.confirmTitle} numberOfLines={2}>
                        {state.title}
                    </Text>
                    <Pressable onPress={onClose} hitSlop={10}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={colors.textMuted}
                        />
                    </Pressable>
                </View>

                {!!state.message && (
                    <View style={styles.confirmMessageBox}>
                        <ScrollView
                            style={styles.confirmMessageScroll}
                            contentContainerStyle={
                                styles.confirmMessageScrollContent
                            }
                            showsVerticalScrollIndicator
                        >
                            <Text style={styles.confirmMessageText}>
                                {state.message}
                            </Text>
                        </ScrollView>
                    </View>
                )}

                <View style={styles.confirmActions}>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [
                            styles.btn,
                            styles.btnGhost,
                            pressed && styles.pressedSm,
                        ]}
                        disabled={busy}
                    >
                        <Text style={styles.btnGhostText}>
                            {state.cancelText || "Hủy"}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={state.onConfirm}
                        style={({ pressed }) => [
                            styles.btn,
                            state.danger ? styles.btnDanger : styles.btnPrimary,
                            pressed && styles.pressedSm,
                            busy && { opacity: 0.7 },
                        ]}
                        disabled={busy}
                    >
                        {busy ? (
                            <ActivityIndicator />
                        ) : (
                            <Text style={styles.btnPrimaryText}>
                                {state.confirmText || "Xác nhận"}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// ===== Permission modal =====
type PermissionModalState =
    | {
          visible: true;
          title: string;
          message: string;
      }
    | { visible: false };

function PermissionModal({
    state,
    onClose,
    onOpenSettings,
}: {
    state: PermissionModalState;
    onClose: () => void;
    onOpenSettings: () => void;
}) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    if (!state.visible) return null;

    return (
        <Modal transparent animationType="fade" visible>
            <Pressable style={styles.modalOverlay} onPress={onClose} />

            <View style={styles.permCard}>
                <View style={styles.confirmHeader}>
                    <Text style={styles.confirmTitle} numberOfLines={2}>
                        {state.title}
                    </Text>
                    <Pressable onPress={onClose} hitSlop={10}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={colors.textMuted}
                        />
                    </Pressable>
                </View>

                <Text style={styles.confirmMessage}>{state.message}</Text>

                <View style={styles.confirmActions}>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [
                            styles.btn,
                            styles.btnGhost,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <Text style={styles.btnGhostText}>Để sau</Text>
                    </Pressable>

                    <Pressable
                        onPress={onOpenSettings}
                        style={({ pressed }) => [
                            styles.btn,
                            styles.btnPrimary,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <Text style={styles.btnPrimaryText}>Mở cài đặt</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// ===== API error for rich debugging =====
class ApiError extends Error {
    status?: number;
    code?: string;
    details?: any;
    raw?: string;
    response?: any;

    constructor(
        message: string,
        opts?: {
            status?: number;
            code?: string;
            details?: any;
            raw?: string;
            response?: any;
        }
    ) {
        super(message);
        this.name = "ApiError";
        this.status = opts?.status;
        this.code = opts?.code;
        this.details = opts?.details;
        this.raw = opts?.raw;
        this.response = opts?.response;
    }
}

async function postAuthAction<T = any>(args: {
    action: string;
    token: string;
    payload?: Record<string, any>;
}): Promise<T> {
    const { action, token, payload } = args;

    if (!AUTH_WEBAPP_URL) throw new Error("Bạn chưa cấu hình AUTH_WEBAPP_URL");
    if (!token) throw new Error("Thiếu token. Bạn hãy đăng nhập lại.");

    let res: Response;
    let text = "";

    try {
        res = await fetch(AUTH_WEBAPP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, token, ...(payload || {}) }),
        });
    } catch (e: any) {
        throw new ApiError(e?.message || "Network error", {
            code: "NETWORK_ERROR",
            details: e,
        });
    }

    try {
        text = await res.text();
    } catch {
        text = "";
    }

    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    logger.debug("[AUTH_API]", {
        action,
        status: res.status,
        okHttp: res.ok,
        parsed: data,
        raw: text?.slice?.(0, 5000) || text,
    });

    if (!res.ok) {
        const msg =
            (data && (data.message || data.error)) ||
            `HTTP ${res.status}: ${text || "(empty)"}`;

        throw new ApiError(msg, {
            status: res.status,
            code: data?.error || "HTTP_ERROR",
            details: data?.details,
            raw: text,
            response: data,
        });
    }

    if (data && data.ok === false) {
        const msg = data?.message || "Server error";
        throw new ApiError(msg, {
            status: res.status,
            code: data?.error || "SERVER_ERROR",
            details: data?.details,
            raw: text,
            response: data,
        });
    }

    return data as T;
}

// ===== helpers: naming / cache =====
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function buildAvatarFilename(mime?: string | null) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = pad2(now.getMonth() + 1);
    const dd = pad2(now.getDate());
    const HH = pad2(now.getHours());
    const MM = pad2(now.getMinutes());
    const SS = pad2(now.getSeconds());

    const m = String(mime || "").toLowerCase();
    const ext = m.includes("png")
        ? "png"
        : m.includes("webp")
        ? "webp"
        : m.includes("gif")
        ? "gif"
        : "jpg";

    return `avatar_${yyyy}-${mm}-${dd}_${HH}-${MM}-${SS}.${ext}`;
}

function withCacheBust(url: string) {
    if (!url) return url;
    const t = Date.now();
    return url.includes("?") ? `${url}&t=${t}` : `${url}?t=${t}`;
}

function safeFolderName(input: string) {
    return String(input || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
}

export default function MeScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const navigation = useNavigation<any>();
    const auth = useAuth() as any;
    const { user, token, logout } = auth;

    const myRole = String(user?.role || "").toLowerCase();
    const isAdmin = myRole === "admin" || myRole === "administrator";

    const displayName = useMemo(() => {
        const full = String(user?.fullName || "").trim();
        const uname = String(user?.username || "").trim();
        return full || uname || "Tài khoản";
    }, [user]);

    const badgeRole = useMemo(() => {
        if (isAdmin) return "ADMIN";
        const role = String(user?.role || "").trim();
        return role ? role.toUpperCase() : "EMPLOYEE";
    }, [isAdmin, user]);

    const [confirm, setConfirm] = useState<ConfirmState>({ visible: false });
    const [confirmBusy, setConfirmBusy] = useState(false);

    const closeConfirm = () => {
        if (confirmBusy) return;
        setConfirm({ visible: false });
    };

    // ===== Permission modal state =====
    const [permModal, setPermModal] = useState<PermissionModalState>({
        visible: false,
    });

    const closePermModal = () => setPermModal({ visible: false });

    const openAppSettings = async () => {
        try {
            closePermModal();
            await Linking.openSettings();
        } catch {
            // ignore
        }
    };

    // ===== Avatar upload state =====
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [avatarUrlOverride, setAvatarUrlOverride] = useState<string | null>(
        null
    );

    // folderName theo userId (fallback username)
    const avatarFolderName = useMemo(() => {
        const uid = String(user?.userId || "").trim();
        const uname = String(user?.username || "").trim();
        return safeFolderName(uid || uname || "unknown");
    }, [user]);

    // Ưu tiên override -> server avatarUrl -> null
    const avatarUri = useMemo(() => {
        const raw =
            avatarUrlOverride ||
            String(user?.avatarUrl || user?.avatar || "").trim() ||
            "";
        return raw ? raw : null;
    }, [avatarUrlOverride, user]);

    // ===== Android permission helper =====
    const ensureAndroidGalleryPermission = async (): Promise<boolean> => {
        if (Platform.OS !== "android") return true;

        const perm =
            Platform.Version >= 33
                ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        try {
            const has = await PermissionsAndroid.check(perm);
            if (has) return true;

            const res = await PermissionsAndroid.request(perm);

            if (res === PermissionsAndroid.RESULTS.GRANTED) return true;

            setPermModal({
                visible: true,
                title: "Cần cấp quyền truy cập ảnh",
                message:
                    "Để đổi ảnh đại diện, bạn cần cấp quyền truy cập thư viện ảnh.\n\nVui lòng vào Cài đặt → Quyền ứng dụng → Ảnh & video (hoặc Bộ nhớ) và bật quyền cho ứng dụng.",
            });
            return false;
        } catch {
            setPermModal({
                visible: true,
                title: "Không thể xin quyền",
                message:
                    "Ứng dụng không thể xin quyền truy cập ảnh. Vui lòng vào Cài đặt và bật quyền cho ứng dụng.",
            });
            return false;
        }
    };

    const pickAndUploadAvatar = async () => {
        if (avatarBusy) return;

        const okPerm = await ensureAndroidGalleryPermission();
        if (!okPerm) return;

        try {
            const res = await new Promise<any>((resolve) => {
                launchImageLibrary(
                    {
                        mediaType: "photo",
                        quality: 0.9,
                        selectionLimit: 1,
                        includeBase64: true,
                    },
                    (response: any) => resolve(response)
                );
            });

            if (res?.didCancel) return;

            const asset = res?.assets?.[0];
            if (!asset) return;

            if (res?.errorCode) {
                if (
                    String(res.errorCode).toLowerCase().includes("permission")
                ) {
                    setPermModal({
                        visible: true,
                        title: "Bạn cần cấp quyền",
                        message:
                            "Ứng dụng chưa có quyền truy cập ảnh. Vui lòng mở Cài đặt và bật quyền để tiếp tục đổi ảnh đại diện.",
                    });
                    return;
                }
                throw new Error(
                    res?.errorMessage || "Không thể mở thư viện ảnh"
                );
            }

            const base64Raw: string | undefined = asset.base64;
            const mime = asset.type || "image/jpeg";

            if (!base64Raw) {
                throw new Error(
                    "Không lấy được dữ liệu ảnh (base64). Bạn hãy thử ảnh khác."
                );
            }

            // ✅ strip prefix data:*;base64,
            const base64 = String(base64Raw).replace(/^data:.+;base64,/, "");

            // ===== size check 10MB =====
            const approxBytesFromBase64 = (b64: string) => {
                const len = b64.length;
                const padding = b64.endsWith("==")
                    ? 2
                    : b64.endsWith("=")
                    ? 1
                    : 0;
                return Math.floor((len * 3) / 4) - padding;
            };

            const sizeBytes =
                typeof asset.fileSize === "number" && asset.fileSize > 0
                    ? asset.fileSize
                    : approxBytesFromBase64(base64);

            const MAX_BYTES = 10 * 1024 * 1024;
            if (sizeBytes > MAX_BYTES) {
                throw new Error(
                    `Ảnh quá lớn (${(sizeBytes / 1024 / 1024).toFixed(
                        2
                    )}MB). Vui lòng chọn ảnh ≤ 10MB.`
                );
            }

            // ✅ filename theo ngày giờ (server rename theo filename)
            const filename = buildAvatarFilename(mime);

            // ✅ userId bắt buộc cho server update sheet + đặt folder theo id
            const userId = String(user?.userId || "").trim();
            if (!userId)
                throw new Error("Thiếu userId. Bạn hãy đăng nhập lại.");

            setAvatarBusy(true);

            const data = await postAuthAction<{
                ok: true;
                avatarUrl?: string;
                url?: string;
                fileId?: string;
                name?: string;
                message?: string;
                error?: string;
                details?: any;
            }>({
                action: "auth_upload_avatar",
                token: String(token || ""),
                payload: {
                    userId, // ✅ server cần
                    folderName: avatarFolderName, // ✅ server tạo / lấy folder
                    filename, // ✅ server đặt tên theo ngày
                    mime,
                    base64,
                    platform: Platform.OS,
                    clientInfo: {
                        fileSize: asset.fileSize,
                        width: asset.width,
                        height: asset.height,
                        uri: asset.uri,
                        name: asset.fileName,
                        type: asset.type,
                    },
                },
            });

            const newUrl = String(data?.avatarUrl || data?.url || "").trim();
            if (!newUrl)
                throw new Error(
                    "Upload xong nhưng server không trả avatarUrl/url."
                );

            // ✅ chống cache để không hiện ảnh cũ
            setAvatarUrlOverride(withCacheBust(newUrl));

            // sync lại user (nếu context có)
            if (typeof auth?.refreshMe === "function") {
                try {
                    await auth.refreshMe();
                } catch {
                    // ignore
                }
            }
        } catch (e: any) {
            const status = e?.status;
            const code = e?.code;
            const details = e?.details;
            const raw = e?.raw;

            const msgLines: string[] = [];
            msgLines.push(e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");

            if (status) msgLines.push(`HTTP: ${status}`);
            if (code) msgLines.push(`Code: ${code}`);
            if (details) msgLines.push(`Details: ${String(details)}`);
            if (raw && typeof raw === "string")
                msgLines.push(`Raw: ${raw.slice(0, 2000)}`);

            setConfirm({
                visible: true,
                title: "Không thể đổi ảnh đại diện",
                message: msgLines.join("\n"),
                confirmText: "OK",
                cancelText: "Đóng",
                onConfirm: () => setConfirm({ visible: false }),
            });
        } finally {
            setAvatarBusy(false);
        }
    };

    // ===== Change password modal state =====
    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwdBusy, setPwdBusy] = useState(false);
    const [pwdErr, setPwdErr] = useState<string | null>(null);

    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [newPwd2, setNewPwd2] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showNew2, setShowNew2] = useState(false);

    const openChangePassword = () => {
        setPwdErr(null);
        setOldPwd("");
        setNewPwd("");
        setNewPwd2("");
        setShowOld(false);
        setShowNew(false);
        setShowNew2(false);
        setPwdOpen(true);
    };

    const submitChangePassword = async () => {
        const o = oldPwd.trim();
        const n = newPwd;
        const n2 = newPwd2;

        if (!o || !n || !n2) {
            setPwdErr("Vui lòng nhập đủ 3 trường.");
            return;
        }
        if (n.length < 6) {
            setPwdErr("Mật khẩu mới tối thiểu 6 ký tự.");
            return;
        }
        if (n !== n2) {
            setPwdErr("Xác nhận mật khẩu mới không khớp.");
            return;
        }
        if (o === n) {
            setPwdErr("Mật khẩu mới phải khác mật khẩu hiện tại.");
            return;
        }

        try {
            setPwdBusy(true);
            setPwdErr(null);

            await postAuthAction({
                action: "auth_change_password",
                token: String(token || ""),
                payload: { oldPassword: o, newPassword: n },
            });

            setPwdOpen(false);

            setConfirm({
                visible: true,
                title: "Đổi mật khẩu thành công",
                message: "Bạn cần đăng nhập lại để tiếp tục sử dụng.",
                confirmText: "OK",
                cancelText: "Đóng",
                onConfirm: async () => {
                    try {
                        setConfirmBusy(true);
                        await logout();
                        setConfirm({ visible: false });
                    } finally {
                        setConfirmBusy(false);
                    }
                },
            });
        } catch (e: any) {
            setPwdErr(e?.message || "Không thể đổi mật khẩu");
        } finally {
            setPwdBusy(false);
        }
    };

    const requestLogout = () => {
        setConfirm({
            visible: true,
            title: "Đăng xuất?",
            message:
                "Bạn chắc chắn muốn đăng xuất khỏi thiết bị này?\n\nBạn sẽ cần đăng nhập lại để tiếp tục sử dụng.",
            confirmText: "Đăng xuất",
            cancelText: "Hủy",
            danger: true,
            onConfirm: async () => {
                try {
                    setConfirmBusy(true);
                    await logout();
                    setConfirm({ visible: false });
                } finally {
                    setConfirmBusy(false);
                }
            },
        });
    };

    return (
        <AppScreen topPadding={0}>
            <HeaderBar title="Tài khoản" onBack={() => navigation.goBack()} />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileCardShadow}>
                    <LinearGradient
                        colors={[colors.surface, colors.background]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileCard}
                    >
                        <View style={styles.profileTop}>
                            <Pressable
                                onPress={pickAndUploadAvatar}
                                style={({ pressed }) => [
                                    styles.avatarWrap,
                                    pressed && styles.pressedSm,
                                ]}
                                disabled={avatarBusy}
                            >
                                {avatarUri ? (
                                    <Image
                                        source={{ uri: avatarUri }}
                                        style={styles.avatarImg}
                                    />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Ionicons
                                            name="person"
                                            size={26}
                                            color={colors.text}
                                        />
                                    </View>
                                )}

                                <View style={styles.avatarBadge}>
                                    {avatarBusy ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <Ionicons
                                            name="camera-outline"
                                            size={16}
                                            color={colors.text}
                                        />
                                    )}
                                </View>
                            </Pressable>

                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Text style={styles.fullName} numberOfLines={1}>
                                    {displayName}
                                </Text>

                                {!!user?.username && (
                                    <Text style={styles.username} numberOfLines={1}>
                                        @{String(user.username)}
                                    </Text>
                                )}

                                <View style={styles.chipRow}>
                                    <View style={styles.chip}>
                                        <Text style={styles.chipText}>
                                            {badgeRole}
                                        </Text>
                                    </View>

                                    <View style={[styles.chip, styles.chipOk]}>
                                        <Text style={styles.chipText}>
                                            ĐÃ KÍCH HOẠT
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metaBlock}>
                            <Text style={styles.metaText}>
                                User ID:{" "}
                                <Text style={styles.metaTextStrong}>
                                    {String(user?.userId || "-")}
                                </Text>
                            </Text>

                            <Text style={styles.metaText}>
                                Mã nhân viên:{" "}
                                <Text style={styles.metaTextStrong}>
                                    {String(user?.code || "-")}
                                </Text>
                            </Text>

                            <Text style={styles.metaText}>
                                Thư mục avatar:{" "}
                                <Text style={styles.metaTextStrong}>
                                    {avatarFolderName || "-"}
                                </Text>
                            </Text>
                        </View>

                        <Text style={styles.avatarHint}>
                            Nhấn vào ảnh để đổi ảnh đại diện
                        </Text>
                    </LinearGradient>
                </View>

                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Tác vụ nhanh</Text>
                </View>

                <View style={styles.actionGrid}>
                    <Pressable
                        onPress={openChangePassword}
                        style={({ pressed }) => [
                            styles.actionTile,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <View style={styles.actionIconWrap}>
                            <Ionicons
                                name="key-outline"
                                size={20}
                                color={colors.text}
                            />
                        </View>
                        <Text style={styles.actionText}>Đổi mật khẩu</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.textMuted}
                        />
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.navigate("Settings")}
                        style={({ pressed }) => [
                            styles.actionTile,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <View style={styles.actionIconWrap}>
                            <Ionicons
                                name="settings-outline"
                                size={20}
                                color={colors.text}
                            />
                        </View>
                        <Text style={styles.actionText}>Cài đặt</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.textMuted}
                        />
                    </Pressable>

                    {isAdmin && (
                        <Pressable
                            onPress={() => navigation.navigate("AdminUsers")}
                            style={({ pressed }) => [
                                styles.actionTile,
                                pressed && styles.pressedSm,
                            ]}
                        >
                            <View style={styles.actionIconWrap}>
                                <Ionicons
                                    name="people-outline"
                                    size={20}
                                    color={colors.text}
                                />
                            </View>
                            <Text style={styles.actionText}>
                                Quản trị người dùng
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={colors.textMuted}
                            />
                        </Pressable>
                    )}
                </View>

                <View style={styles.logoutCard}>
                    <Pressable
                        onPress={requestLogout}
                        style={({ pressed }) => [
                            styles.logoutBtn,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={20}
                            color={colors.text}
                        />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </Pressable>

                    <Text style={styles.logoutHint}>
                        Đăng xuất sẽ xóa phiên đăng nhập trên thiết bị này.
                    </Text>
                </View>
            </ScrollView>

            {/* ===== Change password modal ===== */}
            <Modal
                visible={pwdOpen}
                transparent
                animationType="fade"
                onRequestClose={() => !pwdBusy && setPwdOpen(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => !pwdBusy && setPwdOpen(false)}
                />

                <View style={styles.pwdCard}>
                    <View style={styles.pwdHeader}>
                        <Text style={styles.pwdTitle}>Đổi mật khẩu</Text>
                        <Pressable
                            onPress={() => !pwdBusy && setPwdOpen(false)}
                            hitSlop={10}
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color={colors.textMuted}
                            />
                        </Pressable>
                    </View>

                    <View style={{ gap: 10, marginTop: 10 }}>
                        <View style={styles.inputRow}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <TextInput
                                value={oldPwd}
                                onChangeText={setOldPwd}
                                placeholder="Mật khẩu hiện tại"
                                placeholderTextColor={colors.textMuted}
                                style={styles.input}
                                secureTextEntry={!showOld}
                                editable={!pwdBusy}
                            />
                            <Pressable
                                onPress={() => setShowOld((s) => !s)}
                                hitSlop={10}
                                disabled={pwdBusy}
                            >
                                <Ionicons
                                    name={showOld ? "eye-off" : "eye"}
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.inputRow}>
                            <Ionicons
                                name="key-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <TextInput
                                value={newPwd}
                                onChangeText={setNewPwd}
                                placeholder="Mật khẩu mới (>= 6 ký tự)"
                                placeholderTextColor={colors.textMuted}
                                style={styles.input}
                                secureTextEntry={!showNew}
                                editable={!pwdBusy}
                            />
                            <Pressable
                                onPress={() => setShowNew((s) => !s)}
                                hitSlop={10}
                                disabled={pwdBusy}
                            >
                                <Ionicons
                                    name={showNew ? "eye-off" : "eye"}
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.inputRow}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <TextInput
                                value={newPwd2}
                                onChangeText={setNewPwd2}
                                placeholder="Xác nhận mật khẩu mới"
                                placeholderTextColor={colors.textMuted}
                                style={styles.input}
                                secureTextEntry={!showNew2}
                                editable={!pwdBusy}
                            />
                            <Pressable
                                onPress={() => setShowNew2((s) => !s)}
                                hitSlop={10}
                                disabled={pwdBusy}
                            >
                                <Ionicons
                                    name={showNew2 ? "eye-off" : "eye"}
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        </View>

                        {!!pwdErr && (
                            <Text style={styles.errText}>{pwdErr}</Text>
                        )}

                        <View style={styles.pwdActions}>
                            <Pressable
                                onPress={() => !pwdBusy && setPwdOpen(false)}
                                style={({ pressed }) => [
                                    styles.btn,
                                    styles.btnGhost,
                                    pressed && styles.pressedSm,
                                ]}
                                disabled={pwdBusy}
                            >
                                <Text style={styles.btnGhostText}>Hủy</Text>
                            </Pressable>

                            <Pressable
                                onPress={submitChangePassword}
                                style={({ pressed }) => [
                                    styles.btn,
                                    styles.btnPrimary,
                                    pressed && styles.pressedSm,
                                    pwdBusy && { opacity: 0.7 },
                                ]}
                                disabled={pwdBusy}
                            >
                                {pwdBusy ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text style={styles.btnPrimaryText}>
                                        Đổi mật khẩu
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Permission modal */}
            <PermissionModal
                state={permModal}
                onClose={closePermModal}
                onOpenSettings={openAppSettings}
            />

            <ConfirmModal
                state={confirm}
                busy={confirmBusy}
                onClose={closeConfirm}
            />
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    pressedSm: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },

    profileCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        padding: 12,
    },
    profileCardShadow: {
        borderRadius: 18,
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 3,
    },
    profileTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    // ===== Avatar =====
    avatarWrap: {
        width: 62,
        height: 62,
        borderRadius: 18,
    },
    avatarImg: {
        width: 62,
        height: 62,
        borderRadius: 18,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    avatarFallback: {
        width: 62,
        height: 62,
        borderRadius: 18,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarBadge: {
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarHint: {
        marginTop: 10,
        color: colors.textMuted,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
        textAlign: "center",
    },

    fullName: {
        color: colors.text,
        ...textStyle(16, { weight: "900", lineHeightPreset: "tight" }),
    },
    username: {
        marginTop: 2,
        color: colors.textMuted,
        ...textStyle(13, { weight: "800", lineHeightPreset: "tight" }),
    },
    chipRow: {
        marginTop: 8,
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    chip: {
        paddingHorizontal: 10,
        height: 26,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    chipOk: {
        backgroundColor: "rgba(22,163,74,0.14)",
        borderColor: "rgba(22,163,74,0.35)",
    },
    chipText: {
        color: colors.text,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },

    metaBlock: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.primarySoftBorder,
        gap: 6,
    },
    metaText: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
    },
    metaTextStrong: {
        color: colors.text,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },

    sectionTitleRow: {
        marginTop: 14,
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        color: colors.textSoft,
        ...textStyle(13, { weight: "900", lineHeightPreset: "tight" }),
    },

    actionGrid: {
        gap: 10,
    },
    actionTile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
    },
    actionIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    actionText: {
        flex: 1,
        color: colors.text,
        ...textStyle(14, { weight: "900", lineHeightPreset: "tight" }),
    },

    logoutCard: {
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(220,38,38,0.35)",
        backgroundColor: "rgba(220,38,38,0.08)",
        padding: 12,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 46,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(220,38,38,0.45)",
        backgroundColor: "rgba(220,38,38,0.18)",
    },
    logoutText: {
        color: colors.text,
        ...textStyle(14, { weight: "900", lineHeightPreset: "tight" }),
    },
    logoutHint: {
        marginTop: 8,
        color: colors.textMuted,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
        textAlign: "center",
    },

    errText: {
        color: colors.danger,
        ...textStyle(13, { weight: "900", lineHeightPreset: "tight" }),
        marginTop: 2,
    },

    // ===== Overlays / Modals =====
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(2,6,23,0.72)",
    },

    // ===== Change password modal =====
    pwdCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "22%",
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        padding: 12,
    },
    pwdHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    pwdTitle: {
        color: colors.text,
        ...textStyle(15, { weight: "900", lineHeightPreset: "tight" }),
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        height: 46,
        borderRadius: 14,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    input: {
        flex: 1,
        color: colors.text,
        ...textStyle(14, { weight: "800", lineHeightPreset: "tight" }),
    },
    pwdActions: {
        marginTop: 8,
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-end",
    },

    // ===== Confirm modal =====
    confirmCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "22%",
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        padding: 12,
        maxHeight: "70%",
    },

    // ===== Permission modal =====
    permCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "30%",
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        padding: 12,
    },

    confirmHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 6,
    },
    confirmTitle: {
        color: colors.text,
        ...textStyle(15, { weight: "900", lineHeightPreset: "tight" }),
        flex: 1,
        minWidth: 0,
    },

    confirmMessage: {
        color: colors.textSoft,
        ...textStyle(13, { weight: "700", lineHeightPreset: "loose" }),
        marginTop: 4,
    },

    confirmMessageBox: {
        marginTop: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        overflow: "hidden",
    },
    confirmMessageScroll: {
        maxHeight: 240,
    },
    confirmMessageScrollContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    confirmMessageText: {
        color: colors.textSoft,
        ...textStyle(12, { weight: "700", lineHeightPreset: "normal" }),
        flexShrink: 1,
    },

    confirmActions: {
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-end",
    },
    btn: {
        minWidth: 110,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    btnGhost: {
        backgroundColor: "transparent",
        borderColor: colors.primarySoftBorder,
    },
    btnGhostText: {
        color: colors.text,
        ...textStyle(14, { weight: "900", lineHeightPreset: "tight" }),
    },
    btnPrimary: {
        backgroundColor: colors.backgroundAlt,
        borderColor: colors.primaryBorderStrong,
    },
    btnDanger: {
        backgroundColor: "rgba(220,38,38,0.18)",
        borderColor: "rgba(220,38,38,0.45)",
    },
    btnPrimaryText: {
        color: colors.text,
        ...textStyle(14, { weight: "900", lineHeightPreset: "tight" }),
    },
    });
