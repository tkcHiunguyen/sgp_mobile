// src/context/AuthContext.tsx
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AUTH_WEBAPP_URL,
    storage,
    KEY_AUTH_TOKEN,
    KEY_AUTH_EXPIRES_AT,
    KEY_AUTH_USER,
} from "../config/apiConfig";
import { secureTokenStorage } from "../services/secureTokenStorage";
import { logger } from "../utils/logger";

export type AuthUser = {
    userId: string;
    username: string;
    fullName?: string;
    code?: string;
    role?: string;
    active?: string | number;
    avatar?: string;
    avatarUrl?: string;
};

export type RegisterPayload = {
    username: string;
    fullName: string;
    code: string;
    password: string;
};

export type VerifyResetPayload = {
    username: string;
    code: string;
};

export type ResetPasswordPayload = {
    resetToken: string;
    newPassword: string;
};

export type VerifyResetResult = {
    ok: boolean;
    resetToken?: string;
    expiresAt?: string;
    message?: string;
};

type SessionExpiredMode = "silent" | "modal";

type SessionExpiredNotice = {
    open: boolean;
    message: string;
};

type AuthedFetchArgs = {
    method: "GET" | "POST";
    action: string;
    payload?: Record<string, any>;
    sessionExpiredMode?: SessionExpiredMode; // default: silent
};

type AuthState = {
    loading: boolean;
    token: string | null;
    expiresAt: string | null;
    user: AuthUser | null;
    isAuthed: boolean;
    error: string | null;

    // session-expired UI (AdminUsers)
    sessionExpiredNotice: SessionExpiredNotice;
    ackSessionExpiredNotice: () => Promise<void>;
    handleSessionExpired: (opts?: {
        mode?: SessionExpiredMode;
        message?: string;
    }) => void;

    login: (
        username: string,
        password: string,
        deviceId?: string
    ) => Promise<{ ok: boolean; pending: boolean; message?: string }>;

    register: (payload: RegisterPayload) => Promise<AuthUser>;

    logout: (opts?: {
        reason?: "manual" | "expired" | "forced";
        callServer?: boolean;
    }) => Promise<void>;

    refreshMe: () => Promise<boolean>;
    clearLocal: () => void;

    verifyReset: (payload: VerifyResetPayload) => Promise<VerifyResetResult>;
    resetPassword: (payload: ResetPasswordPayload) => Promise<boolean>;

    authedFetchJson: <T = any>(args: AuthedFetchArgs) => Promise<T>;
};

const AuthContext = createContext<AuthState | null>(null);

function safeJsonParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true;
    const t = new Date(expiresAt).getTime();
    if (Number.isNaN(t)) return true;
    return t <= Date.now();
}

/**
 * ✅ CHỐT THEO SERVER BẠN:
 * Những message sau => phải logout
 * - Thiếu token
 * - Token không hợp lệ
 * - Token đã bị logout
 * - Token đã hết hạn
 * - User không tồn tại
 * - User đã bị khóa
 *
 * KHÔNG logout:
 * - Không có quyền admin (token vẫn hợp lệ)
 */
function isSessionInvalidByServerMessage(msg: string): boolean {
    const s = String(msg || "")
        .trim()
        .toLowerCase();

    const mustLogout = [
        "thiếu token",
        "token không hợp lệ",
        "token đã bị logout",
        "token đã hết hạn",
        "user không tồn tại",
        "user đã bị khóa",
    ];

    // nếu là "Không có quyền admin" => không logout
    if (s.includes("không có quyền admin")) return false;

    return mustLogout.some((k) => s.includes(k));
}

async function fetchJsonText(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    const text = await res.text();
    let json: any = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = null;
    }
    return { res, text, json };
}

/**
 * POST action helper (Apps Script action-based)
 * ⚠️ Vì server json_() KHÔNG set status code thật => không dùng res.status/res.ok
 * => chỉ dựa vào json.ok + json.message
 */
async function postActionJson<T = any>(body: Record<string, any>): Promise<T> {
    const requestId = Math.random().toString(16).slice(2, 8);
    if (!AUTH_WEBAPP_URL) throw new Error("Bạn chưa cấu hình AUTH_WEBAPP_URL");

    const safeBody: Record<string, any> = { ...body };
    if (safeBody.password) safeBody.password = "***";
    if (safeBody.newPassword) safeBody.newPassword = "***";

    logger.debug(`🛰️ [AUTH ${requestId}] POST ${AUTH_WEBAPP_URL}`);
    logger.debug(`🧾 [AUTH ${requestId}] body:`, safeBody);

    const { text, json } = await fetchJsonText(AUTH_WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    logger.debug(`📦 [AUTH ${requestId}] raw:`, text);
    logger.debug(`✅ [AUTH ${requestId}] json:`, json);

    if (!json) {
        throw new Error(
            `SERVER_INVALID_JSON: ${String(text || "").slice(0, 200)}`
        );
    }

    if (json.ok === false) {
        const msg = String(json.message || json.error || "Server error");
        const err = new Error(msg);
        (err as any).server = json;
        // mark session invalid by message
        if (isSessionInvalidByServerMessage(msg))
            (err as any).code = "SESSION_EXPIRED";
        throw err;
    }

    return json as T;
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [loading, setLoading] = useState(true);

    const [token, setToken] = useState<string | null>(
        () => secureTokenStorage.getToken()
    );
    const [expiresAt, setExpiresAt] = useState<string | null>(
        () => storage.getString(KEY_AUTH_EXPIRES_AT) ?? null
    );
    const [user, setUser] = useState<AuthUser | null>(() => {
        const raw = storage.getString(KEY_AUTH_USER);
        return safeJsonParse<AuthUser>(raw ?? null);
    });

    const [error, setError] = useState<string | null>(null);

    const [sessionExpiredNotice, setSessionExpiredNotice] =
        useState<SessionExpiredNotice>({
            open: false,
            message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        });

    const isAuthed = useMemo(
        () => !!token && !!user && !isExpired(expiresAt),
        [token, user, expiresAt]
    );

    const persist = useCallback(
        (next: {
            token: string | null;
            expiresAt: string | null;
            user: AuthUser | null;
        }) => {
            if (next.token) {
                secureTokenStorage.setToken(next.token);
                // cleanup legacy plain token key if present
                storage.remove(KEY_AUTH_TOKEN);
            } else {
                secureTokenStorage.clearToken();
                storage.remove(KEY_AUTH_TOKEN);
            }

            if (next.expiresAt) storage.set(KEY_AUTH_EXPIRES_AT, next.expiresAt);
            else storage.remove(KEY_AUTH_EXPIRES_AT);

            if (next.user) storage.set(KEY_AUTH_USER, JSON.stringify(next.user));
            else storage.remove(KEY_AUTH_USER);
        },
        []
    );

    const clearLocal = useCallback(() => {
        setToken(null);
        setExpiresAt(null);
        setUser(null);
        setError(null);
        persist({ token: null, expiresAt: null, user: null });
    }, [persist]);

    const handleSessionExpired = useCallback(
        (opts?: { mode?: SessionExpiredMode; message?: string }) => {
            const mode = opts?.mode || "silent";
            const message =
                opts?.message ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

            if (mode === "modal") {
                setSessionExpiredNotice({ open: true, message });
                clearLocal();
                return;
            }

            clearLocal();
        },
        [clearLocal]
    );

    const logout = useCallback(
        async (opts?: {
            reason?: "manual" | "expired" | "forced";
            callServer?: boolean;
        }) => {
            const reason = opts?.reason || "manual";
            const callServer =
                typeof opts?.callServer === "boolean"
                    ? opts.callServer
                    : reason === "manual";

            const t = token;
            clearLocal();
            setSessionExpiredNotice((prev) =>
                prev.open ? { ...prev, open: false } : prev
            );

            try {
                if (callServer && t) {
                    // server: action auth_logout {token}
                    await postActionJson({ action: "auth_logout", token: t });
                }
            } catch {
                // ignore
            }
        },
        [token, clearLocal]
    );

    const ackSessionExpiredNotice = useCallback(async () => {
        setSessionExpiredNotice((prev) => ({ ...prev, open: false }));
        await logout({ reason: "expired", callServer: false });
    }, [logout]);

    const hydrate = useCallback(async () => {
        try {
            const secureToken = secureTokenStorage.getToken();
            const legacyToken = storage.getString(KEY_AUTH_TOKEN) || null;
            const savedToken = secureToken || legacyToken;
            const savedExpiresAt =
                storage.getString(KEY_AUTH_EXPIRES_AT) || null;
            const savedUser = safeJsonParse<AuthUser>(
                storage.getString(KEY_AUTH_USER) || null
            );

            if (!secureToken && legacyToken) {
                // one-time migration: plain MMKV -> encrypted MMKV
                secureTokenStorage.setToken(legacyToken);
                storage.remove(KEY_AUTH_TOKEN);
            }

            if (!savedToken) {
                clearLocal();
                return;
            }

            if (isExpired(savedExpiresAt)) {
                clearLocal();
                return;
            }

            // call auth_me to validate token
            const me: any = await postActionJson({
                action: "auth_me",
                token: savedToken,
            });

            if (me?.ok) {
                const meUser = (me.user || savedUser) as AuthUser | null;

                setToken(savedToken);
                setExpiresAt(
                    String(me?.session?.expiresAt || savedExpiresAt || "")
                );
                setUser(meUser);
                setError(null);

                persist({
                    token: savedToken,
                    expiresAt: String(
                        me?.session?.expiresAt || savedExpiresAt || ""
                    ),
                    user: meUser,
                });
                return;
            }

            // ok:false
            const msg = String(me?.message || "Token không hợp lệ");
            if (isSessionInvalidByServerMessage(msg)) {
                clearLocal();
                return;
            }

            // các lỗi khác: vẫn clear để an toàn
            clearLocal();
        } catch {
            // lỗi mạng: nếu local token còn hạn thì cho vào app
            const savedToken = secureTokenStorage.getToken();
            const savedExpiresAt =
                storage.getString(KEY_AUTH_EXPIRES_AT) || null;
            const savedUser = safeJsonParse<AuthUser>(
                storage.getString(KEY_AUTH_USER) || null
            );

            if (savedToken && savedUser && !isExpired(savedExpiresAt)) {
                setToken(savedToken);
                setExpiresAt(savedExpiresAt);
                setUser(savedUser);
                setError(null);
            } else {
                clearLocal();
            }
        }
    }, [clearLocal, persist]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await hydrate();
            setLoading(false);
        })();
    }, [hydrate]);

    const login = async (
        username: string,
        password: string,
        deviceId = "rn"
    ): Promise<{ ok: boolean; pending: boolean; message?: string }> => {
        setError(null);

        try {
            // dùng fetch thẳng để giữ logic pending/active
            const { json } = await fetchJsonText(AUTH_WEBAPP_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "auth_login",
                    username,
                    password,
                    deviceId,
                }),
            });

            if (!json) {
                const msg = "Server invalid JSON";
                setError(msg);
                return { ok: false, pending: false, message: msg };
            }

            if (json.ok === false) {
                const msg = String(
                    json.message || json.error || "Đăng nhập thất bại"
                );
                // server: pending approval => ok:false error=PENDING_APPROVAL
                const isPending =
                    String(json.error || "") === "PENDING_APPROVAL";
                setError(msg);
                return { ok: false, pending: isPending, message: msg };
            }

            if (!json.token) {
                const msg = "Đăng nhập thất bại";
                setError(msg);
                return { ok: false, pending: false, message: msg };
            }

            const nextToken = String(json.token);
            const nextExpiresAt = String(json.expiresAt || "");
            const nextUser = (json.user || null) as AuthUser | null;

            setToken(nextToken);
            setExpiresAt(nextExpiresAt);
            setUser(nextUser);

            persist({
                token: nextToken,
                expiresAt: nextExpiresAt,
                user: nextUser,
            });
            return { ok: true, pending: false };
        } catch (e: any) {
            const msg = String(e?.message || "Lỗi mạng khi đăng nhập");
            setError(msg);
            return { ok: false, pending: false, message: msg };
        }
    };

    const register = async (payload: RegisterPayload) => {
        try {
            const json: any = await postActionJson({
                action: "auth_register",
                username: payload.username,
                fullName: payload.fullName,
                code: payload.code,
                password: payload.password,
            });
            return (
                (json?.user as AuthUser) || {
                    userId: "",
                    username: payload.username,
                }
            );
        } catch (e: any) {
            throw new Error(String(e?.message || "Đăng ký thất bại"));
        }
    };

    const verifyReset = async (
        payload: VerifyResetPayload
    ): Promise<VerifyResetResult> => {
        try {
            const json: any = await postActionJson({
                action: "auth_verify_reset",
                username: payload.username,
                code: payload.code,
            });

            return {
                ok: true,
                resetToken: String(json?.resetToken || ""),
                expiresAt: json?.expiresAt ? String(json.expiresAt) : undefined,
                message: json?.message ? String(json.message) : undefined,
            };
        } catch (e: any) {
            return {
                ok: false,
                message: String(e?.message || "Xác minh thất bại"),
            };
        }
    };

    const resetPassword = async (payload: ResetPasswordPayload) => {
        setError(null);
        try {
            await postActionJson({
                action: "auth_reset_password",
                resetToken: payload.resetToken,
                newPassword: payload.newPassword,
            });
            return true;
        } catch (e: any) {
            const msg = String(e?.message || "Đặt lại mật khẩu thất bại");
            setError(msg);
            return false;
        }
    };

    const refreshMe = async () => {
        if (!token) return false;
        try {
            const me: any = await postActionJson({
                action: "auth_me",
                token: String(token),
            });
            if (me?.ok) {
                const meUser = (me.user || user) as AuthUser | null;
                const nextExpiresAt = String(
                    me?.session?.expiresAt || expiresAt || ""
                );

                setUser(meUser);
                setExpiresAt(nextExpiresAt);
                persist({ token, expiresAt: nextExpiresAt, user: meUser });
                setError(null);
                return true;
            }

            const msg = String(me?.message || "Token không hợp lệ");
            if (isSessionInvalidByServerMessage(msg)) {
                handleSessionExpired({ mode: "silent", message: msg });
                return false;
            }
            return false;
        } catch {
            return !!user;
        }
    };

    const authedFetchJson = useCallback(
        async <T,>(args: AuthedFetchArgs): Promise<T> => {
            const mode = args.sessionExpiredMode || "silent";

            // local guard
            if (!token || !user || isExpired(expiresAt)) {
                handleSessionExpired({ mode, message: "Token đã hết hạn" });
                throw new Error("SESSION_EXPIRED");
            }

            try {
                if (args.method === "GET") {
                    const data: any = await postActionJson({
                        action: args.action,
                        token: String(token),
                        ...(args.payload || {}),
                    });

                    return data as T;
                }

                const data: any = await postActionJson({
                    action: args.action,
                    token: String(token),
                    ...(args.payload || {}),
                });

                // postActionJson đã throw nếu ok:false
                return data as T;
            } catch (e: any) {
                const msg = String(e?.message || "");

                if (
                    (e as any)?.code === "SESSION_EXPIRED" ||
                    isSessionInvalidByServerMessage(msg)
                ) {
                    handleSessionExpired({ mode, message: msg || undefined });
                    throw new Error("SESSION_EXPIRED");
                }

                throw e;
            }
        },
        [token, user, expiresAt, handleSessionExpired]
    );

    const value: AuthState = {
        loading,
        token,
        expiresAt,
        user,
        isAuthed,
        error,

        sessionExpiredNotice,
        ackSessionExpiredNotice,
        handleSessionExpired,

        login,
        register,
        logout,
        refreshMe,
        clearLocal,

        verifyReset,
        resetPassword,

        authedFetchJson,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
