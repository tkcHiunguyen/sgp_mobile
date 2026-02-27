import { storage } from "../config/apiConfig";

export type ThemeMode = "light" | "dark";
export const THEME_MODE_KEY = "app_theme_mode";

export type ThemeColors = {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primarySoftBorder: string;
    primaryBorderStrong: string;
    accent: string;
    text: string;
    textMuted: string;
    textSoft: string;
    textAccent: string;
    success: string;
    danger: string;
    warning: string;
};

export const darkColors: ThemeColors = {
    background: "#020617",
    backgroundAlt: "#0A0F1C",

    surface: "#0F172A",
    surfaceAlt: "#111827",

    primary: "#3B82F6",
    primarySoftBorder: "rgba(59,130,246,0.45)",
    primaryBorderStrong: "rgba(59,130,246,0.7)",

    accent: "#1D4ED8",

    text: "#E5F2FF",
    textMuted: "#9CA3AF",
    textSoft: "#CBD5F5",
    textAccent: "#60A5FA",

    success: "#16A34A",
    danger: "#DC2626",
    warning: "#FBBF24",
};

export const lightColors: ThemeColors = {
    background: "#F3F4F6",
    backgroundAlt: "#E5E7EB",

    surface: "#FFFFFF",
    surfaceAlt: "#F8FAFC",

    primary: "#2563EB",
    primarySoftBorder: "rgba(37,99,235,0.35)",
    primaryBorderStrong: "rgba(37,99,235,0.55)",

    accent: "#1D4ED8",

    text: "#111827",
    textMuted: "#6B7280",
    textSoft: "#334155",
    textAccent: "#2563EB",

    success: "#15803D",
    danger: "#B91C1C",
    warning: "#D97706",
};

export const getColorsForMode = (mode: ThemeMode): ThemeColors =>
    mode === "light" ? lightColors : darkColors;

export const resolveStoredThemeMode = (): ThemeMode => {
    try {
        const saved = storage.getString(THEME_MODE_KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
        console.warn("Không đọc được theme mode:", e);
    }
    return "dark";
};

let currentThemeMode: ThemeMode = resolveStoredThemeMode();

// Shared runtime colors object used across the app.
export const colors: ThemeColors = {
    ...getColorsForMode(currentThemeMode),
};

export const getCurrentThemeMode = () => currentThemeMode;

export const applyThemeMode = (mode: ThemeMode): ThemeColors => {
    currentThemeMode = mode;
    Object.assign(colors, getColorsForMode(mode));
    return colors;
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
};

export const radius = {
    sm: 8,
    md: 10,
    lg: 16,
    pill: 999,
};

export { inputMetrics, lineHeightFor, normalizeWeight, textStyle } from "./typography";
