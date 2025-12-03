// components/AddButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type AddButtonProps = {
    onPress?: () => void; 
    style?: ViewStyle;
};

export default function AddButton({ onPress, style }: AddButtonProps) {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 80,
        right: 40,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#4EA8FF",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});
