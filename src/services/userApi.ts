import type { AuthUser } from "../context/AuthContext";
import type { RoleId } from "../types/roles";

type SessionExpiredMode = "silent" | "modal";

type AuthedFetchArgs = {
    method: "GET" | "POST";
    action: string;
    payload?: Record<string, unknown>;
    sessionExpiredMode?: SessionExpiredMode;
};

type AuthedFetchJson = <T = unknown>(args: AuthedFetchArgs) => Promise<T>;

export type AdminUserRow = {
    userId: string;
    username: string;
    fullName?: string;
    code?: string;
    role?: string;
    active?: string | number;
    createdAt?: string;
    updatedAt?: string;
};

type UploadAvatarPayload = {
    userId: string;
    folderName: string;
    filename: string;
    mime: string;
    base64: string;
    platform: string;
    clientInfo: Record<string, unknown>;
};

type UploadAvatarResult = {
    ok: boolean;
    avatarUrl?: string;
    url?: string;
    fileId?: string;
    name?: string;
    message?: string;
    error?: string;
    details?: unknown;
};

type ChangePasswordPayload = {
    oldPassword: string;
    newPassword: string;
};

type ListUsersResult = {
    users?: AdminUserRow[];
};

export const createUserApi = (authedFetchJson: AuthedFetchJson) => {
    return {
        listUsers: async (): Promise<AdminUserRow[]> => {
            const data = await authedFetchJson<ListUsersResult>({
                method: "POST",
                action: "admin_list_users",
            });
            return Array.isArray(data.users) ? data.users : [];
        },

        setUserRole: async (payload: { userId: string; role: RoleId }) => {
            await authedFetchJson({
                method: "POST",
                action: "admin_set_user_role",
                payload,
            });
        },

        setUserActive: async (payload: { userId: string; active: string }) => {
            await authedFetchJson({
                method: "POST",
                action: "admin_set_user_active",
                payload,
            });
        },

        uploadAvatar: async (
            payload: UploadAvatarPayload
        ): Promise<UploadAvatarResult> => {
            return authedFetchJson<UploadAvatarResult>({
                method: "POST",
                action: "auth_upload_avatar",
                payload,
            });
        },

        changePassword: async (payload: ChangePasswordPayload) => {
            await authedFetchJson({
                method: "POST",
                action: "auth_change_password",
                payload,
            });
        },

        me: async (): Promise<AuthUser | null> => {
            const data = await authedFetchJson<{ user?: AuthUser | null }>({
                method: "POST",
                action: "auth_me",
            });
            return data.user ?? null;
        },
    };
};

