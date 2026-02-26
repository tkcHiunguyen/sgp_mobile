// components/backButton.tsx
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { MIN_TOUCH_TARGET_SIZE } from "../theme/touchTargets";
import { useThemedStyles } from "../theme/useThemedStyles";

import type { ThemeColors } from "../theme/theme";

type Props = {
    onPress: () => void;
    style?: ViewStyle;
};

export default function BackButton({ onPress, style }: Props) {
    const { mode } = useTheme();
    const styles = useThemedStyles(createStyles);
    const scale = useRef(new Animated.Value(1)).current;
    const iconColor = mode === "dark" ? "#FFFFFF" : "#0F172A";

    const pressIn = () => {
        Animated.spring(scale, {
            toValue: 0.94,
            useNativeDriver: true,
            speed: 22,
            bounciness: 6,
        }).start();
    };

    const pressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 18,
            bounciness: 6,
        }).start();
    };

    return (
        <Animated.View style={[styles.wrap, { transform: [{ scale }] }, style]}>
            <Pressable
                onPress={onPress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                style={({ pressed }) => [
                    styles.btn,
                    mode === "dark" ? styles.btnDark : styles.btnLight,
                    pressed && styles.btnPressed,
                ]}
                hitSlop={10}
            >
                <Ionicons name="chevron-back" size={24} color={iconColor} />
            </Pressable>
        </Animated.View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        wrap: {
            position: "absolute",
            top: 22,
            left: 14,
            zIndex: 9999,
            elevation: 12,
            shadowColor: colors.accent,
            shadowOpacity: 0.22,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        },
        btn: {
            width: MIN_TOUCH_TARGET_SIZE,
            height: MIN_TOUCH_TARGET_SIZE,
            borderRadius: MIN_TOUCH_TARGET_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
        },
        btnDark: {
            backgroundColor: colors.surface,
            borderColor: colors.primarySoftBorder,
        },
        btnLight: {
            backgroundColor: colors.surface,
            borderColor: colors.primaryBorderStrong,
        },
        btnPressed: {
            opacity: 0.92,
        },
    });
