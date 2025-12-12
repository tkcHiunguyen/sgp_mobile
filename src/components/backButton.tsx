// components/BackButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
    onPress: () => void;
    style?: ViewStyle;
};

export default function BackButton({ onPress, style }: Props) {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Ionicons name="chevron-back" size={28} color="#fcfcfcff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 30,
        left: 12,
        width: 44,
        height: 44,
        backgroundColor: "rgba(120,120,120,0.55)",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});
