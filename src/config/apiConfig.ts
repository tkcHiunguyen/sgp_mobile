// src/config/apiConfig.ts
import { createMMKV } from "react-native-mmkv";

export const MMKV_ID = "app-storage";
export const storage = createMMKV({ id: MMKV_ID });

// ---- CÁC KEY DÙNG TRONG MMKV ----
export const KEY_API_BASE = "api_base";
export const KEY_SHEET_ID = "sheet_id";
export const KEY_ALL_DATA = "allData";

// ---- GIÁ TRỊ MẶC ĐỊNH ----
export const DEFAULT_API_BASE =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec";

export const DEFAULT_SHEET_ID = "1NQdJA-_9roVzLyAV5IJXeQL2X60wxLa3qC2Z-oNQnCE";

export const getApiBase = (): string => {
    const saved = storage.getString(KEY_API_BASE);
    return saved && saved.trim().length > 0 ? saved.trim() : DEFAULT_API_BASE;
};

export const getSheetId = (): string => {
    const saved = storage.getString(KEY_SHEET_ID);
    return saved && saved.trim().length > 0 ? saved.trim() : DEFAULT_SHEET_ID;
};

export const resetConfig = () => {
    try {
        storage.set(KEY_API_BASE, DEFAULT_API_BASE);
        storage.set(KEY_SHEET_ID, DEFAULT_SHEET_ID);
        storage.set(KEY_ALL_DATA, JSON.stringify([]));
        return true;
    } catch (e) {
        console.warn("resetConfig error:", e);
        return false;
    }
};

export const setApiBase = (value: string | null) => {
    const v = (value ?? "").trim();
    if (!v) {
        storage.set(KEY_API_BASE, DEFAULT_API_BASE);
    } else {
        storage.set(KEY_API_BASE, v);
    }
};

export const setSheetId = (value: string | null) => {
    const v = (value ?? "").trim();
    if (!v) {
        storage.set(KEY_SHEET_ID, DEFAULT_SHEET_ID);
    } else {
        storage.set(KEY_SHEET_ID, v);
    }
};

export const API_BASE_URL = "https://sgp.skybot.id.vn/";
export const VERSION = "1.0.7";
// KEY FOR AUTHENTIACTIONS //
export const AUTH_WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycby7hdEetvSbbwtuJQiTl0Mp0JP-Jpz1wDn-4Mt5fzDFCah67GxLaU1UMxoqKSEn-Tz5EQ/exec";

export const KEY_AUTH_TOKEN = "auth_token";
export const KEY_AUTH_EXPIRES_AT = "auth_expiresAt";
export const KEY_AUTH_USER = "auth_user";
export const KEY_REMEMBER_ME = "auth_remember_me";
export const KEY_REMEMBERED_USERNAME = "auth_remembered_username";
export const KEY_REMEMBERED_PASSWORD = "auth_remembered_password";
