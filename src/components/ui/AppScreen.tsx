import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    withHorizontalPadding?: boolean;
    topPadding?: number;
};

export function AppScreen({
    children,
    style,
    withHorizontalPadding = true,
    topPadding = 40,
}: Props) {
    const styles = useThemedStyles(createStyles);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View
                style={[
                    styles.container,
                    withHorizontalPadding && styles.horizontalPadding,
                    { paddingTop: topPadding },
                    style,
                ]}
            >
                {children}
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    horizontalPadding: {
        paddingHorizontal: 0,
    },
    });
