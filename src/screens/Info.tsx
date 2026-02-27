import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";


import { AppScreen } from "../components/ui/AppScreen";
import HeaderBar from "../components/ui/HeaderBar";
import { VERSION } from "../config/apiConfig";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { RootStackParamList } from "../types/navigation";

import type { ThemeColors } from "../theme/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const infoData = [
    {
        title: "Quét QR",
        description:
            "Quét mã QR để truy cập nhanh tài liệu hoặc thông tin thiết bị.",
    },
    {
        title: "Thiết bị",
        description:
            "Quản lý danh sách thiết bị và xem thông tin vận hành theo từng khu vực.",
    },
    {
        title: "Lịch sử",
        description:
            "Xem lịch sử hoạt động, các bản ghi đã cập nhật và dữ liệu đã đồng bộ.",
    },
    {
        title: "Công cụ",
        description:
            "Nhóm chức năng hỗ trợ thao tác nhanh cho vận hành nội bộ.",
    },
    {
        title: "Thông tin ứng dụng",
        description:
            "Ứng dụng phục vụ nội bộ, tối ưu cho thao tác đơn giản và ổn định trong môi trường nhà máy.",
    },
    {
        title: "Phiên bản",
        description: `Phiên bản hiện tại: ${VERSION}`,
    },
    {
        title: "Tác giả",
        description: "Phát triển bởi nhóm R&D nội bộ.",
    },
    {
        title: "Hướng dẫn sử dụng",
        description:
            "1. Vào trang Quét QR để quét mã.\n2. Vào trang Thiết bị để tra cứu thông tin.\n3. Vào trang Lịch sử để theo dõi hoạt động.\n4. Vào trang Cài đặt để cấu hình và cập nhật.",
    },
];

type Props = NativeStackScreenProps<RootStackParamList, "Info">;

export default function InfoScreen({ navigation }: Props) {
    const styles = useThemedStyles(createStyles);

    return (
        <AppScreen topPadding={0}>
            <HeaderBar title="Thông tin" onBack={() => navigation.goBack()} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {infoData.map((item) => (
                    <View key={item.title} style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                ))}
            </ScrollView>
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
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
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        ...textStyle(16, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.text,
        marginBottom: 6,
    },
    description: {
        ...textStyle(13, { lineHeightPreset: "loose" }),
        color: colors.textSoft,
    },
    });
