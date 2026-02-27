// src/screens/Scanner.tsx (hoặc ScannerScreen.tsx)
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    Animated,
    Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from "react-native-vision-camera";


import BackButton from "../components/backButton";
import { AddHistoryAction } from "../components/maintenance/AddHistoryButton";
import { getApiBase, getSheetId } from "../config/apiConfig";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import { useTheme } from "../context/ThemeContext";
import { trackScanSuccess } from "../services/analytics";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { RootStackParamList } from "../types/navigation";

import { useScannerDeviceLookup } from "./scanner/hooks/useScannerDeviceLookup";

import type { ThemeColors } from "../theme/theme";
import type { HistoryRow } from "../types/deviceGroup";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Scanner">;

const SCAN_SIZE = 250;

type ScanType = "device" | "url" | "text" | null;

// helper: parse "dd-MM-yy" -> Date
const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10);
    return new Date(year, month, day);
};

const getHistoryRowKey = (item: HistoryRow): string =>
    `${item.deviceName || "device"}-${item.date || "date"}-${item.content || ""}`;

// phán đoán có phải URL hay không
const isProbablyUrl = (value: string): boolean => {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return true;
    if (!/\s/.test(trimmed) && /[.]/.test(trimmed)) return true;
    return false;
};

export default function ScannerScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();

    const { deviceGroups, appendHistoryAndSync } = useDeviceGroup();

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

    // ✅ FIX: vị trí nút flash tính theo scannerBox (không hard-code bottom)
    const { height } = Dimensions.get("window");
    const FLASH_SIZE = 70;
    const FLASH_GAP = 22;

    const scannerTop = (height - SCAN_SIZE) / 2;
    const idealFlashTop = scannerTop + SCAN_SIZE + FLASH_GAP;

    // chặn không cho nút xuống quá sát đáy (tránh đụng home bar / gesture)
    const BOTTOM_SAFE = 24;
    const maxFlashTop = height - FLASH_SIZE - BOTTOM_SAFE;

    const flashTop = Math.min(idealFlashTop, maxFlashTop);

    useEffect(() => {
        (async () => {
            if (!hasPermission) await requestPermission();
        })();
    }, [hasPermission, requestPermission]);

    useEffect(() => {
        const t = setTimeout(() => setScanReady(true), 700);
        return () => clearTimeout(t);
    }, []);

    const toggleFlash = () => setFlashOn((prev) => !prev);

    const { findDeviceInfo } = useScannerDeviceLookup(deviceGroups);

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

    const processScannedValue = useCallback(
        (value: string) => {
            const deviceInfo = findDeviceInfo(value);
            if (deviceInfo) {
                trackScanSuccess("device");
                setScannedValue(value);
                setScanType("device");
                setDeviceGroupName(deviceInfo.groupName);
                setDeviceHistory(deviceInfo.history);
                setShowPopup(true);
                return;
            }

            if (isProbablyUrl(value)) {
                trackScanSuccess("url");
                setScannedValue(value);
                setScanType("url");
                setShowPopup(true);
                return;
            }

            trackScanSuccess("text");
            setScannedValue(value);
            setScanType("text");
            setShowPopup(true);
        },
        [findDeviceInfo]
    );

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
                processScannedValue(pendingValue);
                setIsCapturing(false);
                setPendingValue(null);
            });
        }
    }, [isCapturing, pendingValue, captureAnim, processScannedValue]);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: (codes) => {
            if (!scanReady || showPopup || isCapturing || codes.length === 0)
                return;

            const raw = codes[0]?.value;
            const value = raw?.trim();
            if (!value) return;

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
            navigation.navigate("WebViewer", { url: scannedValue });
        }, 100);
    };

    const renderPopupContent = () => {
        if (!scanType || !scannedValue) return null;

        if (scanType === "device") {
            const deviceName = scannedValue;
            const groupLabel = deviceGroupName ?? "Không xác định";

            return (
                <>
                    <View style={styles.popupHeader2}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIconWrap}>
                                <Ionicons
                                    name="hardware-chip-outline"
                                    size={18}
                                    color={colors.text}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.popupTitle2}>
                                    Thiết bị được nhận diện
                                </Text>

                                <Text
                                    style={styles.deviceNameBig}
                                    numberOfLines={2}
                                >
                                    {deviceName}
                                </Text>

                                <View style={styles.metaRow}>
                                    <View style={styles.pill}>
                                        <Ionicons
                                            name="layers-outline"
                                            size={14}
                                            color={colors.text}
                                        />
                                        <Text
                                            style={styles.pillText}
                                            numberOfLines={1}
                                        >
                                            {groupLabel}
                                        </Text>
                                    </View>

                                    <View style={styles.badgeCount}>
                                        <Ionicons
                                            name="time-outline"
                                            size={14}
                                            color={colors.text}
                                        />
                                        <Text style={styles.badgeCountText}>
                                            {deviceHistory.length} lịch sử
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.headerRight}>
                            <AddHistoryAction
                                appScriptUrl={getApiBase()}
                                sheetId={getSheetId()}
                                sheetName={deviceGroupName ?? ""}
                                deviceName={deviceName}
                                iconSize={18}
                                disabled={!deviceGroupName}
                                onPosted={async (row) => {
                                    setDeviceHistory((prev) => {
                                        const next = [row, ...prev];
                                        return next.sort(
                                            (a, b) =>
                                                parseDate(b.date).getTime() -
                                                parseDate(a.date).getTime()
                                        );
                                    });

                                    await appendHistoryAndSync({
                                        sheetName: deviceGroupName ?? "",
                                        row,
                                    });
                                }}
                            />
                        </View>
                    </View>

                    <View style={styles.historyWrap2}>
                        {deviceHistory.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={18}
                                    color={colors.text}
                                />
                                <Text style={styles.emptyText}>
                                    Thiết bị này chưa có lịch sử bảo trì.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={deviceHistory}
                                keyExtractor={getHistoryRowKey}
                                style={styles.historyScroll2}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View
                                        style={styles.historyCard}
                                    >
                                        <View style={styles.historyCardTop}>
                                            <Ionicons
                                                name="calendar-outline"
                                                size={14}
                                                color={colors.textMuted}
                                            />
                                            <Text style={styles.historyDate2}>
                                                {item.date}
                                            </Text>
                                        </View>
                                        <Text style={styles.historyContent2}>
                                            {item.content}
                                        </Text>
                                    </View>
                                )}
                                ListFooterComponent={<View style={{ height: 6 }} />}
                            />
                        )}
                    </View>

                    <View style={styles.singleBtnRow2}>
                        <TouchableOpacity
                            style={[
                                styles.btnBase,
                                styles.singleBtn2,
                                styles.closeBtn2,
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

        return (
            <>
                <Text style={styles.title}>Nội dung QR</Text>
                <Text style={styles.content}>{scannedValue}</Text>
                <View style={styles.singleBtnRow}>
                    <TouchableOpacity
                        style={[styles.btnBase, styles.singleBtn, styles.okBtn]}
                        onPress={resetPopupState}
                    >
                        <Text style={styles.btnText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    };

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

            <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayCenter}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scannerBox}>
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

            {/* ✅ FIX: đặt theo top động */}
            <TouchableOpacity
                style={[styles.flashBtn, { top: flashTop }]}
                onPress={toggleFlash}
                activeOpacity={0.85}
            >
                <Ionicons
                    name={flashOn ? "flash" : "flash-off"}
                    size={35}
                    color={colors.text}
                />
            </TouchableOpacity>

            <Modal transparent visible={showPopup} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.popup}>{renderPopupContent()}</View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    overlayTop: {
        flex: 1,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    overlayBottom: {
        flex: 1,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    overlayCenter: {
        flexDirection: "row",
    },
    overlaySide: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    scannerBox: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
        borderWidth: 2,
        borderColor: colors.success,
        borderRadius: 20,
        backgroundColor: "transparent",
        position: "relative",
    },

    corner: {
        position: "absolute",
        width: 32,
        height: 32,
        borderColor: colors.success,
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
        alignSelf: "center",
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        elevation: 50,
    },

    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    addCornerBtn: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    title: {
        ...textStyle(20, { weight: "700", lineHeightPreset: "tight" }),
        marginBottom: 10,
        textAlign: "center",
        color: colors.text,
    },
    content: {
        ...textStyle(15),
        marginBottom: 18,
        textAlign: "center",
        color: colors.textSoft,
    },

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
        backgroundColor: colors.success,
    },
    cancelBtn: {
        backgroundColor: colors.danger,
    },
    closeBtn: {
        backgroundColor: colors.danger,
    },
    btnText: {
        color: colors.text,
        ...textStyle(15, { weight: "700", lineHeightPreset: "tight" }),
        textAlign: "center",
    },

    deviceNamePopup: {
        ...textStyle(18, { weight: "800", lineHeightPreset: "tight" }),
        color: colors.text,
        textAlign: "center",
        marginBottom: 4,
    },
    deviceGroupPopup: {
        ...textStyle(13, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
        textAlign: "center",
        marginBottom: 10,
    },
    historyContainer: {
        maxHeight: 260,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.background,
        padding: 10,
        marginBottom: 12,
    },
    historyScroll: {
        maxHeight: 250,
    },
    noHistoryText: {
        ...textStyle(13, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
        textAlign: "center",
        paddingVertical: 8,
    },
    historyRow: {
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.primarySoftBorder,
    },
    historyDate: {
        ...textStyle(12, { weight: "600", lineHeightPreset: "tight" }),
        color: colors.textAccent,
        marginBottom: 2,
    },
    historyContent: {
        ...textStyle(13, { lineHeightPreset: "normal" }),
        color: colors.textSoft,
    },
    popup: {
        width: "90%",
        padding: 26,
        borderRadius: 18,
        backgroundColor: colors.surface,
        shadowColor: colors.accent,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        maxHeight: "80%",
        position: "relative",
        overflow: "visible",
    },

    popupHeader: {
        position: "relative",
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
        zIndex: 50,
        elevation: 50,
    },

    popupHeaderText: {
        flex: 1,
        paddingRight: 12,
    },

    popupHeaderAction: {
        zIndex: 999,
        elevation: 999,
        alignSelf: "flex-start",
    },
    popupHeader2: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: 14,
        borderRadius: 16,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        flex: 1,
        paddingRight: 10,
    },
    headerRight: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
    },
    headerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginRight: 10,
    },

    popupTitle2: {
        color: colors.textMuted,
        ...textStyle(12, {
            weight: "800",
            lineHeightPreset: "tight",
            letterSpacing: 0.2,
        }),
    },
    deviceNameBig: {
        color: colors.text,
        ...textStyle(18, { weight: "900", lineHeightPreset: "tight" }),
        marginTop: 4,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 10,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(22,163,74,0.18)",
        borderWidth: 1,
        borderColor: "rgba(22,163,74,0.35)",
        marginRight: 8,
        marginBottom: 8,
    },
    pillText: {
        marginLeft: 6,
        color: colors.text,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
    },
    badgeCount: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 8,
    },
    badgeCountText: {
        marginLeft: 6,
        color: colors.text,
        ...textStyle(12, { weight: "800", lineHeightPreset: "tight" }),
    },

    historyWrap2: {
        borderRadius: 16,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        padding: 12,
        marginBottom: 10,
    },
    historyScroll2: {
        maxHeight: 300,
    },

    emptyBox: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.backgroundAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },
    emptyText: {
        marginLeft: 8,
        color: colors.textSoft,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
    },

    historyCard: {
        padding: 12,
        borderRadius: 14,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        marginBottom: 10,
    },
    historyCardTop: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    historyDate2: {
        marginLeft: 6,
        color: colors.textMuted,
        ...textStyle(12, { weight: "900", lineHeightPreset: "tight" }),
    },
    historyContent2: {
        color: colors.text,
        ...textStyle(13, { weight: "700", lineHeightPreset: "normal" }),
    },

    singleBtnRow2: {
        marginTop: 6,
    },
    singleBtn2: {
        alignSelf: "center",
        width: "70%",
        marginTop: 2,
    },
    closeBtn2: {
        backgroundColor: colors.danger,
    },
    });
