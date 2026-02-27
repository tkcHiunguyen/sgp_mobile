import { useMemo } from "react";

import type { AuthUser } from "../../../context/AuthContext";

const safeFolderName = (input: string) => {
    return String(input || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
};

const withCacheBust = (url: string) => {
    if (!url) return url;
    const t = Date.now();
    return url.includes("?") ? `${url}&t=${t}` : `${url}?t=${t}`;
};

type UseMeProfileSummaryArgs = {
    user: AuthUser | null;
    avatarUrlOverride: string | null;
};

export const useMeProfileSummary = ({
    user,
    avatarUrlOverride,
}: UseMeProfileSummaryArgs) => {
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

    const avatarFolderName = useMemo(() => {
        const uid = String(user?.userId || "").trim();
        const uname = String(user?.username || "").trim();
        return safeFolderName(uid || uname || "unknown");
    }, [user]);

    const avatarUri = useMemo(() => {
        const raw =
            avatarUrlOverride ||
            String(user?.avatarUrl || user?.avatar || "").trim() ||
            "";
        return raw ? withCacheBust(raw) : null;
    }, [avatarUrlOverride, user]);

    return {
        isAdmin,
        displayName,
        badgeRole,
        avatarFolderName,
        avatarUri,
    };
};

