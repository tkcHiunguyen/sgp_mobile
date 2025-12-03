import React from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";
type Props = NativeStackScreenProps<RootStackParamList, "WebViewer">;

export default function WebViewerScreen({ navigation, route }: Props) {
    const { url } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.topSpacer} />
            <BackButton onPress={() => navigation.goBack()} />
            <WebView source={{ uri: url }} style={styles.webview} />

            {/* <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    topSpacer: { height: StatusBar.currentHeight || 40 },
    webview: { flex: 1 },
    closeBtn: {
        position: "absolute",
        top: (StatusBar.currentHeight || 40) + 10,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        zIndex: 10,
    },
    closeText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
