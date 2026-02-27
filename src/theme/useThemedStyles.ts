import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "../context/ThemeContext";

import type { ThemeColors } from "./theme";

type StyleFactory<T extends StyleSheet.NamedStyles<T>> = (
    colors: ThemeColors
) => T;

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
    factory: StyleFactory<T>
): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}

