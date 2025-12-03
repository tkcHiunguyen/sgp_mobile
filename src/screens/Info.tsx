import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";

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
            <BackButton onPress={() => navigation.goBack()} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
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
    safeArea: { flex: 1, backgroundColor: "#0A0F1C" },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    contentContainer: {
        paddingBottom: 80,
    },

    header: {
        marginTop: 80,
        fontSize: 28,
        fontWeight: "900",
        color: "#E0F2FF",
        marginBottom: 30,
        textAlign: "center",
        letterSpacing: 1,
        textShadowColor: "rgba(78,168,255,0.6)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },

    card: {
        backgroundColor: "#1E293B",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#4EA8FF",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: "rgba(78,168,255,0.1)",
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#BBDFFF",
        marginBottom: 8,
    },

    description: {
        fontSize: 14,
        color: "#D7E9FF",
        lineHeight: 20,
    },
});
