import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";
import { colors } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "WebViewer">;

export default function WebViewerScreen({ navigation, route }: Props) {
    const { url } = route.params;

    return (
        <View style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            <WebView source={{ uri: url }} style={styles.webview} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    webview: {
        flex: 1,
    },
});
