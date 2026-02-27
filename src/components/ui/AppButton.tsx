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

import { radius } from "../../theme/theme";
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
            activeOpacity={0.8}
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
        paddingVertical: 12,
        paddingHorizontal: 14,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    danger: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },
    secondary: {
        backgroundColor: colors.surface,
        borderColor: colors.primarySoftBorder,
    },
    disabled: {
        opacity: 0.6,
    },
    textBase: {
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
    textOnSolid: {
        color: "#F8FAFC",
    },
    textSecondary: {
        color: colors.text,
    },
    });
