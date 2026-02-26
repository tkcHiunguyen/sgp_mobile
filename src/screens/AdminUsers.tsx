// src/screens/AdminUsers.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AppScreen } from "../components/ui/AppScreen";
import { EmptyState } from "../components/ui/EmptyState";
import HeaderBar from "../components/ui/HeaderBar";
import { AUTH_WEBAPP_URL } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import {
    ROLE_OPTIONS,
    ROLE_LABEL,
    normalizeRoleId,
    type RoleId,
} from "../types/roles";

import type { ThemeColors } from "../theme/theme";

type UserRow = {
    userId: string;
    username: string;
    fullName?: string;
    code?: string;
    role?: string;
    active?: string | number;
    createdAt?: string;
    updatedAt?: string;
};

type TabKey = "active" | "pending";

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function formatIsoToVn(value?: string) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = pad2(d.getFullYear() % 100);
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

/** ============ Session-expired detection ============ */
function isSessionExpiredMessage(msg?: string) {
    const s = String(msg || "")
        .toLowerCase()
        .trim();
    if (!s) return false;

    // Các message phía Apps Script của bạn đang trả về
    const keys = [
        "token đã hết hạn",
        "token không hợp lệ",
        "token đã bị logout",
        "thiếu token",
        "user đã bị khóa",
        "unauthorized",
        "forbidden",
    ];

    return keys.some((k) => s.includes(k));
}

class SessionExpiredError extends Error {
    code = "SESSION_EXPIRED";
    constructor(message: string) {
        super(message);
        this.name = "SessionExpiredError";
    }
}

async function parseResponseJson(res: Response) {
    const text = await res.text();
    let data: any = null;
    try {
        data = JSON.parse(text);
    } catch {
        data = null;
    }
    return { text, data };
}

/** =================================================== */

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
                    <Text style={styles.confirmTitle}>{state.title}</Text>
                    <Pressable onPress={onClose} hitSlop={10}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={colors.textMuted}
                        />
                    </Pressable>
                </View>

                {!!state.message && (
                    <Text style={styles.confirmMessage}>{state.message}</Text>
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

/** ✅ Modal “Hết phiên” chỉ dùng trong AdminUsers */
type SessionModalState =
    | { visible: true; message?: string }
    | { visible: false };

function SessionExpiredModal({
    state,
    busy,
    onClose,
    onGoLogin,
}: {
    state: SessionModalState;
    busy: boolean;
    onClose: () => void;
    onGoLogin: () => void;
}) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    if (!state.visible) return null;

    return (
        <Modal transparent animationType="fade" visible>
            <View style={styles.modalOverlay} />

            <View style={styles.sessionCard}>
                <View style={styles.confirmHeader}>
                    <Text style={styles.confirmTitle}>Hết phiên đăng nhập</Text>
                    <Pressable onPress={onClose} hitSlop={10} disabled={busy}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={colors.textMuted}
                        />
                    </Pressable>
                </View>

                <Text style={styles.confirmMessage}>
                    {state.message ||
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."}
                </Text>

                <View style={styles.confirmActions}>
                    <Pressable
                        onPress={onGoLogin}
                        style={({ pressed }) => [
                            styles.btn,
                            styles.btnPrimary,
                            pressed && styles.pressedSm,
                            busy && { opacity: 0.7 },
                        ]}
                        disabled={busy}
                    >
                        {busy ? (
                            <ActivityIndicator />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Đăng nhập</Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export default function AdminUsersScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const navigation = useNavigation<any>();
    const { token, user, logout } = useAuth() as any;

    const myRole = String(user?.role || "").toLowerCase();
    const isAdmin = myRole === "administrator" || myRole === "admin";

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [rows, setRows] = useState<UserRow[]>([]);
    const [q, setQ] = useState("");
    const [tab, setTab] = useState<TabKey>("active");

    // role picker
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);

    // confirm modal (custom)
    const [confirm, setConfirm] = useState<ConfirmState>({ visible: false });
    const [confirmBusy, setConfirmBusy] = useState(false);

    // ✅ session expired modal (admin only)
    const [sessionModal, setSessionModal] = useState<SessionModalState>({
        visible: false,
    });
    const [sessionBusy, setSessionBusy] = useState(false);

    const closeConfirm = () => {
        if (confirmBusy) return;
        setConfirm({ visible: false });
    };

    const closeSessionModal = () => {
        if (sessionBusy) return;
        setSessionModal({ visible: false });
    };

    const goLoginHard = () => {
        // reset stack về Login cho chắc
        navigation.reset?.({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    const handleSessionExpired = async (message?: string) => {
        // chỉ gọi 1 lần
        setSessionModal({
            visible: true,
            message:
                message ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        });
    };

    /** ============ Requests wrappers (AdminUsers only) ============ */
    const postAdminAction = async <T = any,>(args: {
        action: string;
        token: string;
        payload?: Record<string, any>;
    }): Promise<T> => {
        const { action, token: t, payload } = args;

        if (!AUTH_WEBAPP_URL)
            throw new Error("Bạn chưa cấu hình AUTH_WEBAPP_URL");
        if (!t)
            throw new SessionExpiredError(
                "Thiếu token. Bạn hãy đăng nhập lại."
            );

        const res = await fetch(AUTH_WEBAPP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, token: t, ...(payload || {}) }),
        });

        const { text, data } = await parseResponseJson(res);

        // Apps Script của bạn thường trả 200 nhưng ok:false
        const msg =
            (data && (data.message || data.error)) ||
            (!res.ok ? `HTTP ${res.status}: ${text}` : "");

        if (!res.ok) {
            if (isSessionExpiredMessage(msg))
                throw new SessionExpiredError(msg || "Unauthorized");
            throw new Error(msg || `HTTP ${res.status}`);
        }

        if (!data?.ok) {
            if (isSessionExpiredMessage(data?.message || msg)) {
                throw new SessionExpiredError(
                    String(data?.message || msg || "Token expired")
                );
            }
            throw new Error(data?.message || "Server error");
        }

        return data as T;
    };

    const fetchUsers = async () => {
        setLoading(true);
        setErr(null);

        try {
            const t = String(token || "");
            if (!t)
                throw new SessionExpiredError(
                    "Thiếu token. Bạn hãy đăng nhập lại."
                );

            const data: any = await postAdminAction({
                action: "admin_list_users",
                token: t,
            });

            const list: UserRow[] = Array.isArray(data.users) ? data.users : [];
            setRows(list);
        } catch (e: any) {
            const msg = String(e?.message || "Network error");

            if (
                e?.name === "SessionExpiredError" ||
                e?.code === "SESSION_EXPIRED"
            ) {
                await handleSessionExpired(msg);
            } else if (isSessionExpiredMessage(msg)) {
                await handleSessionExpired(msg);
            } else {
                setErr(msg);
                setRows([]);
            }
        } finally {
            setLoading(false);
        }
    };
    /** =========================================================== */

    useEffect(() => {
        if (isAdmin) fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const { activeRows, pendingRows } = useMemo(() => {
        const act: UserRow[] = [];
        const pen: UserRow[] = [];
        for (const r of rows) {
            const isActive = String(r.active ?? "0") === "1";
            if (isActive) act.push(r);
            else pen.push(r);
        }
        return { activeRows: act, pendingRows: pen };
    }, [rows]);

    const filtered = useMemo(() => {
        const base = tab === "active" ? activeRows : pendingRows;

        const s = q.trim().toLowerCase();
        if (!s) return base;

        return base.filter((r) => {
            const hay = [
                r.userId,
                r.username,
                r.fullName,
                r.code,
                r.role,
                String(r.active ?? ""),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(s);
        });
    }, [tab, activeRows, pendingRows, q]);

    const openRolePicker = (target: UserRow) => {
        setRoleTarget(target);
        setRoleModalOpen(true);
    };

    const requestChangeRole = (target: UserRow, nextRole: RoleId) => {
        const uname = target.username || target.userId;
        const roleText = ROLE_LABEL[nextRole] || nextRole;

        setConfirm({
            visible: true,
            title: "Đổi chức danh?",
            message: `${uname}\n\nChuyển sang: ${roleText}`,
            confirmText: "Đổi",
            cancelText: "Hủy",
            onConfirm: async () => {
                try {
                    setConfirmBusy(true);
                    setErr(null);

                    await postAdminAction({
                        action: "admin_set_user_role",
                        token: String(token || ""),
                        payload: { userId: target.userId, role: nextRole },
                    });

                    setRows((prev) =>
                        prev.map((x) =>
                            x.userId === target.userId
                                ? {
                                      ...x,
                                      role: nextRole,
                                      updatedAt: new Date().toISOString(),
                                  }
                                : x
                        )
                    );

                    setRoleModalOpen(false);
                    setRoleTarget(null);
                    setConfirm({ visible: false });
                } catch (e: any) {
                    const msg = String(e?.message || "Không thể đổi role");
                    if (
                        e?.name === "SessionExpiredError" ||
                        e?.code === "SESSION_EXPIRED"
                    ) {
                        setConfirm({ visible: false });
                        await handleSessionExpired(msg);
                    } else if (isSessionExpiredMessage(msg)) {
                        setConfirm({ visible: false });
                        await handleSessionExpired(msg);
                    } else {
                        setErr(msg);
                    }
                } finally {
                    setConfirmBusy(false);
                }
            },
        });
    };

    const requestToggleActive = (target: UserRow) => {
        const isActive = String(target.active ?? "0") === "1";
        const nextActive: 0 | 1 = isActive ? 0 : 1;

        setConfirm({
            visible: true,
            title:
                nextActive === 1 ? "Kích hoạt tài khoản?" : "Khóa tài khoản?",
            message: `${target.username}\n\nBạn chắc chắn muốn ${
                nextActive === 1 ? "KÍCH HOẠT" : "KHÓA"
            } tài khoản này?`,
            confirmText: "Xác nhận",
            cancelText: "Hủy",
            danger: nextActive === 0,
            onConfirm: async () => {
                try {
                    setConfirmBusy(true);
                    setErr(null);

                    await postAdminAction({
                        action: "admin_set_user_active",
                        token: String(token || ""),
                        payload: {
                            userId: target.userId,
                            active: String(nextActive),
                        },
                    });

                    setRows((prev) =>
                        prev.map((x) =>
                            x.userId === target.userId
                                ? {
                                      ...x,
                                      active: String(nextActive),
                                      updatedAt: new Date().toISOString(),
                                  }
                                : x
                        )
                    );

                    setConfirm({ visible: false });
                } catch (e: any) {
                    const msg = String(
                        e?.message || "Không thể đổi trạng thái active"
                    );

                    if (
                        e?.name === "SessionExpiredError" ||
                        e?.code === "SESSION_EXPIRED"
                    ) {
                        setConfirm({ visible: false });
                        await handleSessionExpired(msg);
                    } else if (isSessionExpiredMessage(msg)) {
                        setConfirm({ visible: false });
                        await handleSessionExpired(msg);
                    } else {
                        setErr(msg);
                    }
                } finally {
                    setConfirmBusy(false);
                }
            },
        });
    };

    const renderItem = ({ item }: { item: UserRow }) => {
        const active = String(item.active ?? "0") === "1";
        const roleId = normalizeRoleId(item.role);
        const roleLabel = ROLE_LABEL[roleId] || String(item.role || "employee");

        return (
            <View style={styles.card}>
                {/* Row: username + role chip + badge */}
                <View style={styles.rowTop}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.nameRow}>
                            <Text style={styles.username} numberOfLines={1}>
                                {item.username || "(no username)"}
                            </Text>

                            {/* ✅ role chip ngay cạnh tên */}
                            <Pressable
                                onPress={() => openRolePicker(item)}
                                style={({ pressed }) => [
                                    styles.roleChipInline,
                                    pressed && styles.pressedSm,
                                ]}
                                hitSlop={6}
                            >
                                <Text
                                    style={styles.roleChipInlineText}
                                    numberOfLines={1}
                                >
                                    {roleLabel}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={14}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        </View>

                        {!!item.fullName && (
                            <Text style={styles.meta} numberOfLines={1}>
                                {item.fullName}
                            </Text>
                        )}
                    </View>

                    {/* ✅ bấm badge để đổi active (mở modal confirm) */}
                    <Pressable
                        onPress={() => requestToggleActive(item)}
                        style={({ pressed }) => [
                            styles.badge,
                            active ? styles.badgeOk : styles.badgePending,
                            pressed && styles.pressedSm,
                        ]}
                        hitSlop={6}
                    >
                        <Text style={styles.badgeText}>
                            {active ? "ACTIVE" : "PENDING"}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaSmall}>ID: {item.userId}</Text>
                    {!!item.code && (
                        <Text style={styles.metaSmall}>Code: {item.code}</Text>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaSmall}>
                        Created: {formatIsoToVn(item.createdAt)}
                    </Text>
                    <Text style={styles.metaSmall}>
                        Updated: {formatIsoToVn(item.updatedAt)}
                    </Text>
                </View>
            </View>
        );
    };

    if (!isAdmin) {
        return (
            <AppScreen>
                <HeaderBar title="Admin" onBack={() => navigation.goBack()} />
                <EmptyState
                    title="Không có quyền"
                    message="Chỉ tài khoản admin/administrator mới xem được trang này."
                />
            </AppScreen>
        );
    }

    return (
        <AppScreen topPadding={0}>
            <HeaderBar
                title="Admin - Users"
                onBack={() => navigation.goBack()}
            />

            {/* Top area */}
            <View style={styles.topArea}>
                {/* Search + refresh */}
                <View style={styles.searchRow}>
                    <View style={styles.searchWrap}>
                        <Ionicons
                            name="search"
                            size={18}
                            color={colors.textMuted}
                        />
                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="Tìm userId / username / code / role..."
                            placeholderTextColor={colors.textMuted}
                            style={styles.searchInput}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {!!q && (
                            <Pressable onPress={() => setQ("")} hitSlop={10}>
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        )}
                    </View>

                    <Pressable
                        onPress={fetchUsers}
                        style={({ pressed }) => [
                            styles.refreshBtnSm,
                            pressed && styles.pressedSm,
                        ]}
                        disabled={loading}
                        hitSlop={8}
                    >
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <Ionicons
                                name="refresh"
                                size={18}
                                color={colors.text}
                            />
                        )}
                    </Pressable>
                </View>

                {/* Tabs */}
                <View style={styles.tabBar}>
                    <Pressable
                        onPress={() => setTab("active")}
                        style={({ pressed }) => [
                            styles.tabBtn,
                            tab === "active" && styles.tabBtnActive,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "active" && styles.tabTextActive,
                            ]}
                        >
                            Đang hoạt động ({activeRows.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setTab("pending")}
                        style={({ pressed }) => [
                            styles.tabBtn,
                            tab === "pending" && styles.tabBtnActive,
                            pressed && styles.pressedSm,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "pending" && styles.tabTextActive,
                            ]}
                        >
                            Chờ phê duyệt ({pendingRows.length})
                        </Text>
                    </Pressable>
                </View>

                {!!err && <Text style={styles.errText}>{err}</Text>}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(it, idx) => `${it.userId || it.username || idx}`}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
                ListEmptyComponent={
                    loading ? null : (
                        <EmptyState
                            title="Trống"
                            message={
                                tab === "active"
                                    ? "Không có user đang hoạt động."
                                    : "Không có user chờ phê duyệt."
                            }
                        />
                    )
                }
            />

            {/* Role picker modal */}
            <Modal
                visible={roleModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setRoleModalOpen(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setRoleModalOpen(false)}
                />

                <View style={styles.roleModalCard}>
                    <View style={styles.roleModalHeader}>
                        <Text style={styles.roleModalTitle}>
                            Chọn chức danh
                        </Text>
                        <Pressable
                            onPress={() => setRoleModalOpen(false)}
                            hitSlop={10}
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color={colors.textMuted}
                            />
                        </Pressable>
                    </View>

                    <Text style={styles.roleModalSub}>
                        {roleTarget?.username || roleTarget?.userId || ""}
                    </Text>

                    <ScrollView
                        style={styles.roleList}
                        contentContainerStyle={{ paddingBottom: 12 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {(
                            [
                                "Admin",
                                "Management",
                                "Deputy",
                                "Manager",
                                "Operation",
                            ] as const
                        ).map((group) => {
                            const list = ROLE_OPTIONS.filter(
                                (r) => r.group === group
                            );
                            if (!list.length) return null;

                            return (
                                <View key={group} style={{ marginTop: 10 }}>
                                    <Text style={styles.roleGroupTitle}>
                                        {group}
                                    </Text>

                                    {list.map((r) => (
                                        <Pressable
                                            key={r.id}
                                            onPress={() => {
                                                if (!roleTarget) return;
                                                requestChangeRole(
                                                    roleTarget,
                                                    r.id
                                                );
                                            }}
                                            style={({ pressed }) => [
                                                styles.roleItem,
                                                pressed && styles.pressedSm,
                                            ]}
                                        >
                                            <Text style={styles.roleItemText}>
                                                {r.label}
                                            </Text>
                                            <Ionicons
                                                name="chevron-forward"
                                                size={18}
                                                color={colors.textMuted}
                                            />
                                        </Pressable>
                                    ))}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>

            {/* ✅ Custom confirm modal (thay Alert) */}
            <ConfirmModal
                state={confirm}
                busy={confirmBusy}
                onClose={closeConfirm}
            />

            {/* ✅ Session expired modal (chỉ admin page) */}
            <SessionExpiredModal
                state={sessionModal}
                busy={sessionBusy}
                onClose={closeSessionModal}
                onGoLogin={async () => {
                    try {
                        setSessionBusy(true);
                        // logout() của bạn đã clearLocal + gọi auth_logout (best-effort)
                        await logout?.();
                    } catch {
                        // ignore
                    } finally {
                        setSessionBusy(false);
                        setSessionModal({ visible: false });
                        goLoginHard();
                    }
                }}
            />
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    topArea: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
    },

    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    searchWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        ...textStyle(14, { weight: "600", lineHeightPreset: "tight" }),
    },

    refreshBtnSm: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },

    tabBar: {
        marginTop: 10,
        flexDirection: "row",
        gap: 10,
    },
    tabBtn: {
        flex: 1,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    tabBtnActive: {
        backgroundColor: colors.background,
        borderColor: colors.primaryBorderStrong,
    },
    tabText: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    tabTextActive: {
        color: colors.text,
    },

    errText: {
        color: colors.danger,
        marginTop: 8,
        ...textStyle(13, { weight: "800", lineHeightPreset: "tight" }),
    },

    card: {
        marginHorizontal: 12,
        marginBottom: 10,
        padding: 12,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },

    rowTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "nowrap",
    },

    username: {
        color: colors.text,
        ...textStyle(15, { weight: "900", lineHeightPreset: "tight" }),
        maxWidth: "55%",
    },

    roleChipInline: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        height: 28,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
        maxWidth: "45%",
    },
    roleChipInlineText: {
        color: colors.textSoft,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
        flexShrink: 1,
    },

    meta: {
        marginTop: 4,
        color: colors.textSoft,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
    },

    metaRow: {
        marginTop: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    metaSmall: {
        color: colors.textMuted,
        ...textStyle(12, { weight: "700", lineHeightPreset: "tight" }),
    },

    badge: {
        paddingHorizontal: 10,
        height: 28,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    badgeOk: {
        backgroundColor: "rgba(22,163,74,0.14)",
        borderColor: "rgba(22,163,74,0.4)",
    },
    badgePending: {
        backgroundColor: "rgba(220,38,38,0.14)",
        borderColor: "rgba(220,38,38,0.4)",
    },
    badgeText: {
        color: colors.text,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },

    pressedSm: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },

    // ===== Overlays / Modals =====
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(2,6,23,0.72)",
    },

    roleModalCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "18%",
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primaryBorderStrong,
        padding: 12,
        maxHeight: "70%",
    },
    roleModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    roleModalTitle: {
        color: colors.text,
        ...textStyle(15, { weight: "900", lineHeightPreset: "tight" }),
    },
    roleModalSub: {
        marginTop: 6,
        color: colors.textMuted,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
    },
    roleList: {
        marginTop: 10,
    },
    roleGroupTitle: {
        color: colors.textSoft,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
        marginBottom: 8,
    },
    roleItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 8,
    },
    roleItemText: {
        color: colors.text,
        ...textStyle(14, { weight: "800", lineHeightPreset: "tight" }),
        flex: 1,
    },

    // ===== Confirm modal =====
    confirmCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "32%",
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
    },
    confirmMessage: {
        color: colors.textSoft,
        ...textStyle(13, { weight: "700", lineHeightPreset: "loose" }),
        marginTop: 4,
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

    // ===== Session modal =====
    sessionCard: {
        position: "absolute",
        left: 12,
        right: 12,
        top: "32%",
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primaryBorderStrong,
        padding: 12,
    },
    });
