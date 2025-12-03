import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4EA8FF" />
            <Text style={styles.title}>Đang tải dữ liệu...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0F1C",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        marginTop: 15,
        color: "#E0F2FF",
        fontSize: 18,
        fontWeight: "700",
    },
});
