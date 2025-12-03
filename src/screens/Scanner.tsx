import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from "react-native-vision-camera";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";

type Props = NativeStackScreenProps<RootStackParamList, "Scanner">;

const SCAN_SIZE = 250;

export default function ScannerScreen({ navigation }: Props) {
    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();

    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [flashOn, setFlashOn] = useState(false);

    const scannerActive = true;

    useEffect(() => {
        (async () => {
            if (!hasPermission) await requestPermission();
        })();
    }, [hasPermission, requestPermission]);

    const toggleFlash = () => setFlashOn((prev) => !prev);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: (codes) => {
            if (showPopup || codes.length === 0) return;
            const value = codes[0]?.value;
            if (value) {
                setScannedValue(value);
                setShowPopup(true);
            }
        },
    });

    if (!device) return <Text>Đang tải camera...</Text>;
    if (!hasPermission) return <Text>Không có quyền truy cập camera</Text>;

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={scannerActive && !showPopup}
                codeScanner={codeScanner}
                torch={flashOn ? "on" : "off"}
            />
            <BackButton onPress={() => navigation.goBack()} />
            {/* Overlay */}
            <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayCenter}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scannerBox} />
                    <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom} />
            </View>

            {/* Flash toggle */}
            <TouchableOpacity style={styles.flashBtn} onPress={toggleFlash}>
                <Ionicons
                    name={flashOn ? "flash" : "flash-off"}
                    size={35}
                    color="white"
                />
            </TouchableOpacity>

            {/* Popup */}
            <Modal transparent visible={showPopup} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.popup}>
                        <Text style={styles.title}>Mở tài liệu</Text>
                        <Text style={styles.content}>{scannedValue}</Text>
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.btn, styles.okBtn]}
                                onPress={() => {
                                    setShowPopup(false);
                                    setTimeout(() => {
                                        if (scannedValue) {
                                            navigation.navigate("WebViewer", {
                                                url: scannedValue,
                                            });
                                        }
                                    }, 100);
                                }}
                            >
                                <Text style={styles.btnText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.cancelBtn]}
                                onPress={() => setShowPopup(false)}
                            >
                                <Text style={styles.btnText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    overlayTop: { flex: 1, width: "100%", backgroundColor: "rgba(0,0,0,0.6)" },
    overlayBottom: {
        flex: 1,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    overlayCenter: { flexDirection: "row" },
    overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    scannerBox: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
        borderWidth: 2,
        borderColor: "#4CAF50",
        borderRadius: 20,
        backgroundColor: "transparent",
    },
    flashBtn: {
        position: "absolute",
        bottom: 190,
        alignSelf: "center",
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    popup: {
        width: "85%",
        padding: 25,
        borderRadius: 16,
        backgroundColor: "#1E293B",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#E0F2FF",
    },
    content: {
        fontSize: 16,
        marginBottom: 25,
        textAlign: "center",
        color: "#D7E9FF",
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 10,
        alignItems: "center",
    },
    okBtn: {
        backgroundColor: "#4CAF50",
    },
    cancelBtn: {
        backgroundColor: "#d9534f",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
