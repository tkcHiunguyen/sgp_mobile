import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { textStyle } from "../../theme/typography";
import { useThemedStyles } from "../../theme/useThemedStyles";
import BackButton from "../backButton";
import DataSyncIndicator from "../DataSyncIndicator";

import type { ThemeColors } from "../../theme/theme";

interface HeaderBarProps {
    title: string;
    onBack?: () => void;
}

export function HeaderBar({ title, onBack }: HeaderBarProps) {
    const styles = useThemedStyles(createStyles);
    const handleBack = onBack ?? (() => {});

    return (
        <View style={styles.wrapper}>
            {/* ROW 1: Back + Sync */}
            <View style={styles.topRow}>
                <BackButton onPress={handleBack} style={styles.backInline} />

                <View style={styles.rightWrapper}>
                    <DataSyncIndicator inline />
                </View>
            </View>

            {/* ROW 2: Title */}
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
            </Text>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    wrapper: {
        width: "100%",
        paddingHorizontal: 12, // ↓ giảm từ 20 xuống 12
        paddingTop: 6, // mỏng hơn xíu
        paddingBottom: 10,
        backgroundColor: colors.background,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rightWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },

    // Override style của BackButton để dùng inline, sát viền hơn
    backInline: {
        position: "relative",
        top: 0,
        left: 0,
    },

    title: {
        marginTop: 8,
        ...textStyle(22, { weight: "900", lineHeightPreset: "tight", letterSpacing: 0.7 }),
        textAlign: "center",
        color: colors.text,
    },
    });

export default HeaderBar;
