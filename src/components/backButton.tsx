// components/backButton.tsx
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/theme";

type Props = {
    onPress: () => void;
    style?: ViewStyle;
};

export default function BackButton({ onPress, style }: Props) {
    const scale = useRef(new Animated.Value(1)).current;

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
                    pressed && { opacity: 0.92 },
                ]}
                hitSlop={10}
            >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        top: 22,
        left: 14,
        zIndex: 9999,
        elevation: 12,
        shadowColor: "#000",
        shadowOpacity: 0.28,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    btn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "rgba(15, 23, 42, 0.72)", 
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.35)", 
    },
});
