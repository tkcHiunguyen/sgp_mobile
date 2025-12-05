import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Animated,
} from "react-native";
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
import { useDeviceGroup } from "../context/DeviceGroupContext";

type Props = NativeStackScreenProps<RootStackParamList, "Scanner">;

const SCAN_SIZE = 250;

type ScanType = "device" | "url" | "text" | null;

interface HistoryRow {
    deviceName: string;
    date: string;
    content: string;
}

// helper: parse "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10); // "25" -> 2025
    return new Date(year, month, day);
};

// phán đoán có phải URL hay không
const isProbablyUrl = (value: string): boolean => {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return true;
    // dạng domain ngắn, không có khoảng trắng
    if (!/\s/.test(trimmed) && /[.]/.test(trimmed)) return true;
    return false;
};

export default function ScannerScreen({ navigation }: Props) {
    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();
    const { deviceGroups } = useDeviceGroup();

    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [flashOn, setFlashOn] = useState(false);

    const [scanType, setScanType] = useState<ScanType>(null);
    const [deviceGroupName, setDeviceGroupName] = useState<string | null>(null);
    const [deviceHistory, setDeviceHistory] = useState<HistoryRow[]>([]);

    // delay trước khi bắt đầu quét
    const [scanReady, setScanReady] = useState(false);

    // animation bắt mã
    const [isCapturing, setIsCapturing] = useState(false);
    const [pendingValue, setPendingValue] = useState<string | null>(null);
    const captureAnim = useRef(new Animated.Value(0)).current;

    const scannerActive = true;

    useEffect(() => {
        (async () => {
            if (!hasPermission) await requestPermission();
        })();
    }, [hasPermission, requestPermission]);

    // Đợi 700ms cho camera ổn định rồi mới cho phép quét
    useEffect(() => {
        const t = setTimeout(() => setScanReady(true), 700);
        return () => clearTimeout(t);
    }, []);

    const toggleFlash = () => setFlashOn((prev) => !prev);

    // Tìm xem value có phải là tên thiết bị trong allData hay không
    const findDeviceInfo = (value: string) => {
        for (const g of deviceGroups as any[]) {
            const devicesRows = (g.devices?.rows ?? []) as {
                id: number;
                name: string;
                freq: string | number | null;
            }[];

            const foundDevice = devicesRows.find((d) => d.name === value);
            if (foundDevice) {
                const historyRows =
                    ((g.history?.rows ?? []) as HistoryRow[]) || [];

                const filtered = historyRows.filter(
                    (h) => h.deviceName === value
                );

                const sorted = [...filtered].sort(
                    (a, b) =>
                        parseDate(b.date).getTime() -
                        parseDate(a.date).getTime()
                );

                return {
                    groupName: g.table as string,
                    history: sorted,
                };
            }
        }
        return null;
    };

    const resetPopupState = () => {
        setShowPopup(false);
        setScanType(null);
        setDeviceGroupName(null);
        setDeviceHistory([]);
        setScannedValue(null);
        setPendingValue(null);
        setIsCapturing(false);
        captureAnim.setValue(0);
    };

    // Sau khi animation bắt mã xong mới phân loại & mở popup
    const processScannedValue = (value: string) => {
        // 1) Ưu tiên check xem có phải tên thiết bị không
        const deviceInfo = findDeviceInfo(value);
        if (deviceInfo) {
            setScannedValue(value);
            setScanType("device");
            setDeviceGroupName(deviceInfo.groupName);
            setDeviceHistory(deviceInfo.history);
            setShowPopup(true);
            return;
        }

        // 2) Không phải thiết bị → check URL
        if (isProbablyUrl(value)) {
            setScannedValue(value);
            setScanType("url");
            setShowPopup(true);
            return;
        }

        // 3) Còn lại là text thường
        setScannedValue(value);
        setScanType("text");
        setShowPopup(true);
    };

    // Khi isCapturing = true thì chạy animation 4 góc
    useEffect(() => {
        if (isCapturing && pendingValue) {
            captureAnim.setValue(0);
            Animated.sequence([
                Animated.timing(captureAnim, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(captureAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // animation xong mới xử lý logic popup
                processScannedValue(pendingValue);
                setIsCapturing(false);
                setPendingValue(null);
            });
        }
    }, [isCapturing, pendingValue, captureAnim]);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: (codes) => {
            // chưa sẵn sàng, đang popup, đang capture → bỏ qua
            if (!scanReady || showPopup || isCapturing || codes.length === 0)
                return;

            const raw = codes[0]?.value;
            const value = raw?.trim();
            if (!value) return;

            // bắt đầu hiệu ứng bắt mã
            setPendingValue(value);
            setIsCapturing(true);
        },
    });

    if (!device) return <Text>Đang tải camera...</Text>;
    if (!hasPermission) return <Text>Không có quyền truy cập camera</Text>;

    const handleOpenUrl = () => {
        if (!scannedValue) return;
        setShowPopup(false);
        setTimeout(() => {
            navigation.navigate("WebViewer", {
                url: scannedValue,
            });
        }, 100);
    };

    const renderPopupContent = () => {
        if (!scanType || !scannedValue) return null;

        if (scanType === "device") {
            const [groupCode, deviceCode] = scannedValue.split("_");
            return (
                <>
                    <Text style={styles.title}>Thiết bị được nhận diện</Text>
                    <Text style={styles.deviceNamePopup}>
                        {deviceCode || scannedValue}
                    </Text>
                    <Text style={styles.deviceGroupPopup}>
                        Nhóm: {deviceGroupName || groupCode || "Không xác định"}
                    </Text>

                    <View style={styles.historyContainer}>
                        {deviceHistory.length === 0 ? (
                            <Text style={styles.noHistoryText}>
                                Thiết bị này chưa có lịch sử bảo trì.
                            </Text>
                        ) : (
                            <ScrollView
                                style={styles.historyScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                {deviceHistory.map((item, index) => (
                                    <View
                                        key={`${item.date}-${index}`}
                                        style={styles.historyRow}
                                    >
                                        <Text style={styles.historyDate}>
                                            {item.date}
                                        </Text>
                                        <Text style={styles.historyContent}>
                                            {item.content}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.singleBtnRow}>
                        <TouchableOpacity
                            style={[
                                styles.btnBase,
                                styles.singleBtn,
                                styles.closeBtn,
                            ]}
                            onPress={resetPopupState}
                        >
                            <Text style={styles.btnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </>
            );
        }

        if (scanType === "url") {
            return (
                <>
                    <Text style={styles.title}>Liên kết được quét</Text>
                    <Text style={styles.content}>{scannedValue}</Text>
                    <View style={styles.btnRow}>
                        <TouchableOpacity
                            style={[
                                styles.btnBase,
                                styles.btnHalf,
                                styles.okBtn,
                            ]}
                            onPress={handleOpenUrl}
                        >
                            <Text style={styles.btnText}>Mở liên kết</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btnBase,
                                styles.btnHalf,
                                styles.cancelBtn,
                            ]}
                            onPress={resetPopupState}
                        >
                            <Text style={styles.btnText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </>
            );
        }

        // text thường
        return (
            <>
                <Text style={styles.title}>Nội dung QR</Text>
                <Text style={styles.content}>{scannedValue}</Text>
                <View style={styles.singleBtnRow}>
                    <TouchableOpacity
                        style={[
                            styles.btnBase,
                            styles.singleBtn,
                            styles.okBtn,
                        ]}
                        onPress={resetPopupState}
                    >
                        <Text style={styles.btnText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    // style animation cho 4 góc
    const cornerAnimatedStyle = {
        opacity: captureAnim,
        transform: [
            {
                scale: captureAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.1],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={scannerActive && !showPopup && !isCapturing}
                codeScanner={codeScanner}
                torch={flashOn ? "on" : "off"}
            />
            <BackButton onPress={() => navigation.goBack()} />

            {/* Overlay khung quét */}
            <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayCenter}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scannerBox}>
                        {/* 4 góc bắt mã */}
                        <Animated.View
                            style={[
                                styles.corner,
                                styles.cornerTL,
                                cornerAnimatedStyle,
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.corner,
                                styles.cornerTR,
                                cornerAnimatedStyle,
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.corner,
                                styles.cornerBL,
                                cornerAnimatedStyle,
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.corner,
                                styles.cornerBR,
                                cornerAnimatedStyle,
                            ]}
                        />
                    </View>
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

            {/* Popup kết quả */}
            <Modal transparent visible={showPopup} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.popup}>{renderPopupContent()}</View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
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
        position: "relative",
    },

    // 4 góc highlight
    corner: {
        position: "absolute",
        width: 32,
        height: 32,
        borderColor: "#22C55E",
    },
    cornerTL: {
        top: -2,
        left: -2,
        borderLeftWidth: 4,
        borderTopWidth: 4,
        borderTopLeftRadius: 16,
    },
    cornerTR: {
        top: -2,
        right: -2,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderTopRightRadius: 16,
    },
    cornerBL: {
        bottom: -2,
        left: -2,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderBottomLeftRadius: 16,
    },
    cornerBR: {
        bottom: -2,
        right: -2,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderBottomRightRadius: 16,
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
        width: "90%",
        padding: 26,
        borderRadius: 18,
        backgroundColor: "#0B1220",
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.6)",
        maxHeight: "80%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#E0F2FF",
    },
    content: {
        fontSize: 15,
        marginBottom: 18,
        textAlign: "center",
        color: "#D7E9FF",
    },

    // BUTTON STYLES
    btnBase: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
    },
    btnHalf: {
        flex: 1,
        marginHorizontal: 5,
    },
    singleBtn: {
        alignSelf: "center",
        width: "60%",
        marginTop: 4,
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    singleBtnRow: {
        marginTop: 8,
    },
    okBtn: {
        backgroundColor: "#16A34A",
    },
    cancelBtn: {
        backgroundColor: "#DC2626",
    },
    closeBtn: {
        backgroundColor: "#DC2626",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        textAlign: "center",
    },

    // popup device
    deviceNamePopup: {
        fontSize: 18,
        fontWeight: "800",
        color: "#E5F2FF",
        textAlign: "center",
        marginBottom: 4,
    },
    deviceGroupPopup: {
        fontSize: 13,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 10,
    },
    historyContainer: {
        maxHeight: 260,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(55,65,81,0.9)",
        backgroundColor: "#020617",
        padding: 10,
        marginBottom: 12,
    },
    historyScroll: {
        maxHeight: 250,
    },
    noHistoryText: {
        fontSize: 13,
        color: "#9CA3AF",
        textAlign: "center",
        paddingVertical: 8,
    },
    historyRow: {
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(31,41,55,0.8)",
    },
    historyDate: {
        fontSize: 12,
        color: "#60A5FA",
        marginBottom: 2,
        fontWeight: "600",
    },
    historyContent: {
        fontSize: 13,
        color: "#CBD5F5",
        lineHeight: 18,
    },
});
