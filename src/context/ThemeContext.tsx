// src/context/ThemeContext.tsx
import React, {
    createContext,
    useContext,
    useCallback,
    useMemo,
    useState,
    ReactNode,
} from "react";

import { storage } from "../config/apiConfig";
import {
    THEME_MODE_KEY,
    applyThemeMode,
    getColorsForMode,
    getCurrentThemeMode,
    type ThemeColors,
    type ThemeMode,
} from "../theme/theme";

type ThemeContextValue = {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(() => getCurrentThemeMode());

    const setMode = useCallback((value: ThemeMode) => {
        applyThemeMode(value);
        setModeState(value);
        try {
            storage.set(THEME_MODE_KEY, value);
        } catch (e) {
            console.warn("Không lưu được theme mode:", e);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setMode(mode === "dark" ? "light" : "dark");
    }, [mode, setMode]);

    const colors = useMemo(
        () => getColorsForMode(mode),
        [mode]
    );

    const value = useMemo(
        () => ({ mode, colors, toggleTheme, setMode }),
        [mode, colors, toggleTheme, setMode]
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
