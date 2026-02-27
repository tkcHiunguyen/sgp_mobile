import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";


import BackButton from "../components/backButton";
import { useThemedStyles } from "../theme/useThemedStyles";
import { RootStackParamList } from "../types/navigation";

import type { ThemeColors } from "../theme/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "WebViewer">;

export default function WebViewerScreen({ navigation, route }: Props) {
    const styles = useThemedStyles(createStyles);
    const { url } = route.params;

    return (
        <View style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            <WebView source={{ uri: url }} style={styles.webview} />
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    webview: {
        flex: 1,
    },
    });
