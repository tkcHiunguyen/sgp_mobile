import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

import { componentMetrics, elevation } from "../../theme/theme";
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
        padding: componentMetrics.appCardPadding,
        borderRadius: componentMetrics.appCardCornerRadius,
        borderWidth: componentMetrics.appCardBorderWidth,
        borderColor: colors.primaryBorderStrong,
        shadowColor: colors.accent,
        shadowOpacity: elevation.cardShadowOpacity,
        shadowRadius: elevation.cardShadowRadius,
        shadowOffset: { width: 0, height: elevation.cardShadowOffsetY },
        elevation: elevation.cardElevation,
    },
    });
