// src/screens/Tools.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";

import type { ThemeColors } from "../theme/theme";

export default function ToolsScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);

    return (
        <View style={styles.container}>
            <Ionicons name="construct-outline" size={64} color={colors.text} />
            <Text style={styles.title}>Tools</Text>
            <Text style={styles.caption}>Utilities and diagnostic tools</Text>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.background,
    },
    title: {
        ...textStyle(24, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.text,
    },
    caption: {
        ...textStyle(14),
        color: colors.textMuted,
        opacity: 0.7,
    },
    });
