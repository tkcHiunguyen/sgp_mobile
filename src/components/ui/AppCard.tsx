import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

import { radius } from "../../theme/theme";
import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, style }: Props) {
    const styles = useThemedStyles(createStyles);
    return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        padding: 18,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    });
