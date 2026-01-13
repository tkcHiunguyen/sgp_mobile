import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";
import { AppScreen } from "../components/ui/AppScreen";
import HeaderBar from "../components/ui/HeaderBar";
import { colors } from "../theme/theme";

// ✅ Import component nút + (chỉnh path cho đúng)
import { AddHistoryAction } from "../components/maintenance/AddHistoryButton";

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
    const [lastPosted, setLastPosted] = useState<string>("Chưa có");

    const appScriptUrl = "PASTE_YOUR_APPS_SCRIPT_WEBAPP_URL_HERE";
    const sheetId = "PASTE_YOUR_SHEET_ID_HERE";
    const sheetName = "History"; // hoặc đúng tên sheet bạn append
    const deviceName = "TEST_DEVICE_01";

    return (
        <AppScreen topPadding={0}>
            <HeaderBar title="Thông tin" onBack={() => navigation.goBack()} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* ✅ Card test nút + */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>Test thêm lịch sử</Text>

                        <AddHistoryAction
                            appScriptUrl={appScriptUrl}
                            sheetId={sheetId}
                            sheetName={sheetName}
                            deviceName={deviceName}
                            iconSize={20}
                            onPosted={(row) => {
                                setLastPosted(
                                    `${row.deviceName} | ${row.date} | ${row.content}`
                                );
                            }}
                        />
                    </View>

                    <Text style={styles.description}>
                        Bấm nút “+” để mở modal. (Thiết bị test: {deviceName})
                    </Text>

                    <Text style={[styles.description, { marginTop: 8 }]}>
                        Last posted: {lastPosted}
                    </Text>

                    <Text style={[styles.hint, { marginTop: 10 }]}>
                        Lưu ý: nếu chưa muốn test POST, bạn vẫn test được UI
                        mở/đóng modal. Muốn test POST thật thì điền đúng
                        appScriptUrl/sheetId/sheetName.
                    </Text>
                </View>

                {/* Các card info cũ */}
                {infoData.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>
                            {item.description}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    contentContainer: {
        paddingBottom: 80,
        paddingTop: 12,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 6,
        flex: 1,
    },
    description: {
        fontSize: 13,
        color: colors.textSoft,
        lineHeight: 20,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 18,
    },
});
