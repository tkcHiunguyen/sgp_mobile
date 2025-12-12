import React from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";
import { colors, spacing } from "../../theme/theme";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: Props) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    title: {
        fontSize: 26,
        fontWeight: "900",
        color: colors.text,
        marginBottom: spacing.xl,
        textAlign: "center",
        letterSpacing: 0.8,
    },
});
