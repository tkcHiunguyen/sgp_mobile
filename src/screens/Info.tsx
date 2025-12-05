import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";
import DataSyncIndicator from "../components/DataSyncIndicator";

const infoData = [
    {
        title: "Quét QR",
        description: "Quét QR code để truy cập nhanh tài liệu hoặc thiết bị.",
    },
    {
        title: "Thiết bị",
        description: "Quản lý danh sách thiết bị trong nhà máy.",
    },
    {
        title: "Lịch sử",
        description:
            "Xem lịch sử hoạt động, truy cập hoặc các QR đã quét trước đó.",
    },
    {
        title: "Công cụ",
        description: "Các công cụ hỗ trợ nhanh cho vận hành nhà máy.",
    },
    {
        title: "Thông tin ứng dụng",
        description: "Thông tin chi tiết về ứng dụng...",
    },
    { title: "Phiên bản", description: "Phiên bản hiện tại: 1.0.0" },
    {
        title: "Tác giả",
        description: "Được phát triển bởi nhóm R&D nội bộ của nhà máy.",
    },
    {
        title: "Hướng dẫn sử dụng",
        description:
            "1. Truy cập trang Quét QR để quét mã.\n2. Quản lý thiết bị tại trang Thiết bị.\n3. Kiểm tra lịch sử quét tại trang Lịch sử.\n4. Sử dụng các công cụ hỗ trợ tại trang Công cụ.",
    },
];

type Props = NativeStackScreenProps<RootStackParamList, "Info">;

export default function InfoScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Back ở góc trái */}
            <BackButton onPress={() => navigation.goBack()} />

            {/* Icon đồng bộ ở góc phải */}
            <DataSyncIndicator />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.header}>Thông tin</Text>

                {infoData.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>
                            {item.description}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#020617",
    },
    container: {
        flex: 1,
        backgroundColor: "#020617",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    contentContainer: {
        paddingBottom: 80,
        paddingTop: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: "900",
        color: "#E5F2FF",
        marginBottom: 24,
        textAlign: "center",
        letterSpacing: 0.8, // giống Index
    },

    // Card trong Info giữ nguyên
    card: {
        backgroundColor: "#0F172A",
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.35)",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#E5F2FF",
        marginBottom: 6,
    },
    description: {
        fontSize: 13,
        color: "#CBD5F5",
        lineHeight: 20,
    },
});
