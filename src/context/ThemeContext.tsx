// src/context/ThemeContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from "react";
import { storage } from "../config/apiConfig";
import { colors as baseColors } from "../theme/theme";

const THEME_KEY = "app_theme_mode";

export type ThemeMode = "light" | "dark";

export type ThemeColors = typeof baseColors;

type ThemeContextValue = {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// tạm thời dùng cùng cấu trúc với colors hiện tại
const darkColors: ThemeColors = {
    ...baseColors,
};

const lightColors: ThemeColors = {
    ...baseColors,
    // tuỳ bạn chỉnh lại cho sáng hơn
    background: "#F3F4F6",
    surface: "#FFFFFF",
    surfaceAlt: "#E5E7EB",
    text: "#111827",
    textSoft: "#374151",
    textMuted: "#6B7280",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>("dark");

    useEffect(() => {
        try {
            const saved = storage.getString(THEME_KEY);
            if (saved === "light" || saved === "dark") {
                setModeState(saved);
            }
        } catch (e) {
            console.warn("Không đọc được theme mode:", e);
        }
    }, []);

    const setMode = (value: ThemeMode) => {
        setModeState(value);
        try {
            storage.set(THEME_KEY, value);
        } catch (e) {
            console.warn("Không lưu được theme mode:", e);
        }
    };

    const toggleTheme = () => {
        setMode(mode === "dark" ? "light" : "dark");
    };

    const colors = useMemo(
        () => (mode === "dark" ? darkColors : lightColors),
        [mode]
    );

    const value = useMemo(
        () => ({ mode, colors, toggleTheme, setMode }),
        [mode, colors]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme phải được dùng bên trong ThemeProvider");
    }
    return ctx;
}
