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
import { colors, radius, spacing } from "../../theme/theme";
import { textStyle } from "../../theme/typography";

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
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: {
        backgroundColor: colors.primary,
    },
    danger: {
        backgroundColor: colors.danger,
    },
    secondary: {
        backgroundColor: "#1F2937",
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        color: "#F9FAFB",
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
});
