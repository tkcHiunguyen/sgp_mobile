// src/components/ui/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../../theme/theme";

type Props = {
    message: string;
    title?: string;
};

export function EmptyState({ message, title }: Props) {
    return (
        <View style={styles.wrapper}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
        textAlign: "center",
    },
    message: {
        marginTop: 4,
        color: colors.textMuted,
        fontSize: 13,
        textAlign: "center",
    },
});
