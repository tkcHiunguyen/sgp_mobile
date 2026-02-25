// src/screens/Tools.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/theme";
import { textStyle } from "../theme/typography";

export default function ToolsScreen() {
    return (
        <View style={styles.container}>
            <Ionicons name="construct-outline" size={64} />
            <Text style={styles.title}>Tools</Text>
            <Text style={styles.caption}>Utilities and diagnostic tools</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
