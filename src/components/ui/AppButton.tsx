// src/components/ui/AppButton.tsx
import React from "react";
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    StyleProp,
    ViewStyle,
} from "react-native";

import { componentMetrics, elevation, radius } from "../../theme/theme";
import { MIN_TOUCH_TARGET_SIZE } from "../../theme/touchTargets";
import { textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Variant = "primary" | "danger" | "secondary";

type Props = {
    title: string;
    onPress?: (e: GestureResponderEvent) => void;
    variant?: Variant;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
};

export function AppButton({
    title,
    onPress,
    variant = "primary",
    style,
    disabled,
}: Props) {
    const styles = useThemedStyles(createStyles);
    const solid = variant !== "secondary";

    return (
        <TouchableOpacity
            activeOpacity={componentMetrics.buttonActiveOpacity}
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.base,
                styles[variant],
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text
                style={[
                    styles.textBase,
                    solid ? styles.textOnSolid : styles.textSecondary,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    base: {
        paddingVertical: componentMetrics.buttonPaddingVertical,
        paddingHorizontal: componentMetrics.buttonPaddingHorizontal,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        borderRadius: radius.md,
        borderWidth: componentMetrics.buttonBorderWidth,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryBorderStrong,
        shadowColor: colors.accent,
        shadowOpacity: elevation.buttonShadowOpacity,
        shadowRadius: elevation.buttonShadowRadius,
        shadowOffset: { width: 0, height: elevation.buttonShadowOffsetY },
        elevation: elevation.buttonElevation,
    },
    danger: {
        backgroundColor: colors.danger,
        borderColor: colors.dangerSoftBorder,
        shadowColor: colors.danger,
        shadowOpacity: elevation.buttonShadowOpacity,
        shadowRadius: elevation.buttonShadowRadius,
        shadowOffset: { width: 0, height: elevation.buttonShadowOffsetY },
        elevation: elevation.buttonElevation,
    },
    secondary: {
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.primarySoftBorder,
    },
    disabled: {
        opacity: componentMetrics.buttonDisabledOpacity,
        shadowOpacity: 0,
        elevation: 0,
    },
    textBase: {
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
    textOnSolid: {
        color: colors.onPrimary,
    },
    textSecondary: {
        color: colors.text,
    },
    });
