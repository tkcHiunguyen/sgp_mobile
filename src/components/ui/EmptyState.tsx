// src/components/ui/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";


import { textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Props = {
    message: string;
    title?: string;
};

export function EmptyState({ message, title }: Props) {
    const styles = useThemedStyles(createStyles);

    return (
        <View style={styles.wrapper}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    title: {
        color: colors.text,
        ...textStyle(16, { weight: "700", lineHeightPreset: "tight" }),
        marginBottom: 4,
        textAlign: "center",
    },
    message: {
        marginTop: 4,
        color: colors.textMuted,
        ...textStyle(13),
        textAlign: "center",
    },
    });
