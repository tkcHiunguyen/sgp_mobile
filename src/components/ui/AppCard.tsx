import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, spacing, radius } from "../../theme/theme";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, style }: Props) {
    return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        padding: 18,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.35)",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
});
