import { storage } from "../config/apiConfig";
import { logger } from "../utils/logger";

const ANALYTICS_PREFIX = "analytics_event_";
const ANALYTICS_PENDING_LOGIN_AT = "analytics_pending_login_at";

const ANALYTICS_EVENTS = [
    "login_success",
    "time_to_home",
    "scan_success",
    "add_history_success",
    "add_history_fail",
] as const;

type AnalyticsPayload = Record<string, unknown>;
type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

type AnalyticsRecord = {
    count: number;
    lastAt: number;
    lastPayload: AnalyticsPayload | null;
};

const readRecord = (key: string): AnalyticsRecord | null => {
    const raw = storage.getString(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AnalyticsRecord;
    } catch {
        return null;
    }
};

const removeStorageKey = (key: string) => {
    const mmkv = storage as unknown as {
        delete?: (k: string) => void;
        remove?: (k: string) => void;
    };

    if (typeof mmkv.delete === "function") {
        mmkv.delete(key);
        return;
    }

    if (typeof mmkv.remove === "function") {
        mmkv.remove(key);
    }
};

export const trackEvent = (name: string, payload: AnalyticsPayload = {}) => {
    const key = `${ANALYTICS_PREFIX}${name}`;
    const now = Date.now();
    const prev = readRecord(key);

    const next: AnalyticsRecord = {
        count: (prev?.count ?? 0) + 1,
        lastAt: now,
        lastPayload: Object.keys(payload).length > 0 ? payload : null,
    };

    storage.set(key, JSON.stringify(next));
    logger.info("[ANALYTICS]", name, next.lastPayload ?? {});
};

export const markLoginSuccess = () => {
    storage.set(ANALYTICS_PENDING_LOGIN_AT, String(Date.now()));
    trackEvent("login_success");
};

export const trackTimeToHomeIfPending = () => {
    const raw = storage.getString(ANALYTICS_PENDING_LOGIN_AT);
    if (!raw) return;

    const startedAt = Number(raw);
    storage.remove(ANALYTICS_PENDING_LOGIN_AT);
    if (!Number.isFinite(startedAt) || startedAt <= 0) return;

    const durationMs = Math.max(0, Date.now() - startedAt);
    trackEvent("time_to_home", { durationMs });
};

export const trackScanSuccess = (kind: "device" | "url" | "text") => {
    trackEvent("scan_success", { kind });
};

export const trackAddHistoryResult = (
    ok: boolean,
    payload: {
        deviceName: string;
        sheetName: string;
    }
) => {
    trackEvent(ok ? "add_history_success" : "add_history_fail", payload);
};

export type AnalyticsSummaryItem = {
    name: AnalyticsEventName;
    count: number;
    lastAt: number | null;
    lastPayload: AnalyticsPayload | null;
};

export const getAnalyticsSummary = (): AnalyticsSummaryItem[] => {
    return ANALYTICS_EVENTS.map((name) => {
        const record = readRecord(`${ANALYTICS_PREFIX}${name}`);
        return {
            name,
            count: record?.count ?? 0,
            lastAt: typeof record?.lastAt === "number" ? record.lastAt : null,
            lastPayload: record?.lastPayload ?? null,
        };
    });
};

export const clearAnalyticsSummary = () => {
    for (const name of ANALYTICS_EVENTS) {
        removeStorageKey(`${ANALYTICS_PREFIX}${name}`);
    }
    removeStorageKey(ANALYTICS_PENDING_LOGIN_AT);
};
