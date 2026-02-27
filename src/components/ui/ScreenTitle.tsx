import React from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";

import { spacing } from "../../theme/theme";
import { textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: Props) {
    const styles = useThemedStyles(createStyles);
    return <Text style={[styles.title, style]}>{children}</Text>;
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    title: {
        ...textStyle(26, { weight: "900", lineHeightPreset: "tight", letterSpacing: 0.8 }),
        color: colors.text,
        marginBottom: spacing.xl,
        textAlign: "center",
    },
    });
