import React from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";
import { colors, spacing } from "../../theme/theme";
import { textStyle } from "../../theme/typography";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: Props) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    title: {
        ...textStyle(26, { weight: "900", lineHeightPreset: "tight", letterSpacing: 0.8 }),
        color: colors.text,
        marginBottom: spacing.xl,
        textAlign: "center",
    },
});
