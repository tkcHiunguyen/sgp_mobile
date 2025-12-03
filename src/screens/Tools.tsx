// src/screens/Tools.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ToolsScreen() {
    return (
        <View style={styles.container}>
            <Ionicons name="construct-outline" size={64} />
            <Text style={styles.title}>Tools</Text>
            <Text style={styles.caption}>Utilities and diagnostic tools</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    caption: {
        fontSize: 14,
        opacity: 0.7,
    },
});
