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
    onPrimary: string;
    overlayStrong: string;
    overlayMedium: string;
    overlaySoft: string;
    backdropStrong: string;
    backdropSoft: string;
    backdropCard: string;
    successSoftBg: string;
    successSoftBorder: string;
    successStrongBg: string;
    dangerSoftBg: string;
    dangerSoftBorder: string;
    dangerSubtleBg: string;
    dangerSubtleBorder: string;
    warningSoftBg: string;
    warningSoftBorder: string;
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
    onPrimary: "#F8FAFC",
    overlayStrong: "rgba(0,0,0,0.6)",
    overlayMedium: "rgba(0,0,0,0.5)",
    overlaySoft: "rgba(0,0,0,0.35)",
    backdropStrong: "rgba(15,23,42,0.85)",
    backdropSoft: "rgba(15,23,42,0.35)",
    backdropCard: "rgba(2,6,23,0.72)",
    successSoftBg: "rgba(22,163,74,0.14)",
    successSoftBorder: "rgba(22,163,74,0.35)",
    successStrongBg: "rgba(22,163,74,0.2)",
    dangerSoftBg: "rgba(220,38,38,0.18)",
    dangerSoftBorder: "rgba(220,38,38,0.45)",
    dangerSubtleBg: "rgba(220,38,38,0.08)",
    dangerSubtleBorder: "rgba(220,38,38,0.35)",
    warningSoftBg: "rgba(251,191,36,0.16)",
    warningSoftBorder: "rgba(251,191,36,0.55)",
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
    onPrimary: "#F8FAFC",
    overlayStrong: "rgba(15,23,42,0.45)",
    overlayMedium: "rgba(15,23,42,0.35)",
    overlaySoft: "rgba(15,23,42,0.2)",
    backdropStrong: "rgba(15,23,42,0.65)",
    backdropSoft: "rgba(15,23,42,0.35)",
    backdropCard: "rgba(15,23,42,0.5)",
    successSoftBg: "rgba(22,163,74,0.12)",
    successSoftBorder: "rgba(22,163,74,0.3)",
    successStrongBg: "rgba(22,163,74,0.2)",
    dangerSoftBg: "rgba(220,38,38,0.12)",
    dangerSoftBorder: "rgba(220,38,38,0.3)",
    dangerSubtleBg: "rgba(220,38,38,0.08)",
    dangerSubtleBorder: "rgba(220,38,38,0.25)",
    warningSoftBg: "rgba(217,119,6,0.12)",
    warningSoftBorder: "rgba(217,119,6,0.3)",
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
    xxl: 32,
    screen: 20,
};

export const radius = {
    xs: 4,
    sm: 8,
    md: 10,
    base: 12,
    chip: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    pill: 999,
};

export const border = {
    subtle: 1,
    strong: 1.5,
    focus: 2,
} as const;

export const elevation = {
    cardShadowOpacity: 0.22,
    cardShadowRadius: 12,
    cardShadowOffsetY: 6,
    cardElevation: 6,
    buttonShadowOpacity: 0.26,
    buttonShadowRadius: 10,
    buttonShadowOffsetY: 4,
    buttonElevation: 5,
    modalShadowOpacity: 0.3,
    modalShadowRadius: 16,
    modalShadowOffsetY: 8,
    modalElevation: 12,
} as const;

export const motion = {
    fastDuration: 140,
    baseDuration: 180,
    slowDuration: 240,
    modalInDuration: 200,
    modalOutDuration: 160,
    pressScale: 0.985,
} as const;

export const componentMetrics = {
    buttonPaddingVertical: 12,
    buttonPaddingHorizontal: 14,
    buttonActiveOpacity: 0.88,
    buttonBorderWidth: border.subtle,
    buttonDisabledOpacity: 0.6,
    buttonBusyOpacity: 0.7,
    mutedContentOpacity: 0.7,
    subtleTextOpacity: 0.95,
    pressFeedbackOpacity: 0.9,
    appCardPadding: 18,
    appCardBorderWidth: border.subtle,
    appCardCornerRadius: radius.xl,
    headerPaddingHorizontal: 12,
    headerPaddingTop: 6,
    headerPaddingBottom: 10,
    headerTitleMarginTop: 8,
    modalOverlayPaddingHorizontal: 24,
    modalBorderWidth: border.subtle,
    modalCornerRadius: radius.xl,
    modalMaxHeight: "80%",
    modalInScaleFrom: 0.96,
    modalInTranslateY: 10,
    screenHorizontalPadding: 0,
    screenTopPadding: 40,
} as const;

export { inputMetrics, lineHeightFor, normalizeWeight, textStyle } from "./typography";
