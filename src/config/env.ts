import {
    AUTH_WEBAPP_URL as ENV_AUTH_WEBAPP_URL,
    DATA_WEBAPP_URL as ENV_DATA_WEBAPP_URL,
    DEFAULT_SHEET_ID as ENV_DEFAULT_SHEET_ID,
    OTA_API_BASE_URL as ENV_OTA_API_BASE_URL,
    OTA_PUBLIC_KEY_DEFAULT as ENV_OTA_PUBLIC_KEY_DEFAULT,
    SECURE_AUTH_ENCRYPTION_KEY as ENV_SECURE_AUTH_ENCRYPTION_KEY,
} from "@env";

const readEnv = (value: string | undefined): string => String(value ?? "").trim();
const normalizeMultiline = (value: string): string =>
    value
        .replace(/\\n/g, "\n")
        .trim();

const fallback = {
    dataWebappUrl:
        "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec",
    defaultSheetId: "1NQdJA-_9roVzLyAV5IJXeQL2X60wxLa3qC2Z-oNQnCE",
    otaApiBaseUrl: "https://sgp.skybot.id.vn/",
    authWebappUrl:
        "https://script.google.com/macros/s/AKfycby7hdEetvSbbwtuJQiTl0Mp0JP-Jpz1wDn-4Mt5fzDFCah67GxLaU1UMxoqKSEn-Tz5EQ/exec",
    otaPublicKeyDefault: `-----BEGIN PUBLIC KEY-----
REPLACE_WITH_REAL_OTA_PUBLIC_KEY
-----END PUBLIC KEY-----`,
    secureAuthEncryptionKey: "SGP_AUTH_TOKEN_ENCRYPTION_KEY_V1_2026",
} as const;

export const ENV_CONFIG = {
    dataWebappUrl: readEnv(ENV_DATA_WEBAPP_URL) || fallback.dataWebappUrl,
    defaultSheetId: readEnv(ENV_DEFAULT_SHEET_ID) || fallback.defaultSheetId,
    otaApiBaseUrl: readEnv(ENV_OTA_API_BASE_URL) || fallback.otaApiBaseUrl,
    authWebappUrl: readEnv(ENV_AUTH_WEBAPP_URL) || fallback.authWebappUrl,
    otaPublicKeyDefault:
        normalizeMultiline(readEnv(ENV_OTA_PUBLIC_KEY_DEFAULT)) ||
        fallback.otaPublicKeyDefault,
    secureAuthEncryptionKey:
        readEnv(ENV_SECURE_AUTH_ENCRYPTION_KEY) ||
        fallback.secureAuthEncryptionKey,
} as const;
