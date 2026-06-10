import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import {
    storage,
    getApiBase,
    getSheetId,
    KEY_ALL_DATA,
} from "../config/apiConfig";
import { useDeviceGroup } from "../context/DeviceGroupContext";
import { useTheme } from "../context/ThemeContext";
import { radius, type ThemeColors } from "../theme/theme";
import { textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { logger } from "../utils/logger";

import type { RootStackParamList } from "../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Status = "checking" | "loadingNew" | "ready" | "error";

type CachedData = {
    data: any;
    isEmpty: boolean;
};

const parseCachedData = (rawData?: string | null): CachedData | null => {
    if (!rawData) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawData);
        const isEmpty = Array.isArray(parsed)
            ? parsed.length === 0
            : parsed && typeof parsed === "object"
            ? Object.keys(parsed).length === 0
            : true;

        return { data: parsed, isEmpty };
    } catch (error) {
        logger.warn("⚠️ Lỗi parse allData từ storage:", error);
        return null;
    }
};

const toUserErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        if (error.message.includes("HTTP_401")) {
            return "Xác thực không hợp lệ. Vui lòng kiểm tra cấu hình backend.";
        }
        if (error.message.includes("HTTP_403")) {
            return "Không có quyền truy cập dữ liệu.";
        }
        if (error.message.includes("HTTP_404")) {
            return "Không tìm thấy endpoint dữ liệu.";
        }
        if (error.message.includes("HTTP_")) {
            return "Máy chủ trả về lỗi. Vui lòng thử lại.";
        }
        if (error.message === "INVALID_JSON_RESPONSE") {
            return "Dữ liệu trả về không đúng định dạng.";
        }
        return error.message || "Không thể tải dữ liệu.";
    }

    return "Không thể tải dữ liệu.";
};

export default function LoadingScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { setDeviceGroups, setIsDataFromCache } = useDeviceGroup();

    const [status, setStatus] = useState<Status>("checking");
    const [hasLocalData, setHasLocalData] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [canUseCachedFallback, setCanUseCachedFallback] = useState(false);
    const opacity = useRef(new Animated.Value(1)).current;

    // ✅ kiểu timeout chuẩn cho React Native + TS
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // meta từ API
    const [totalTable, setTotalTable] = useState<number | null>(null);
    const [validTable, setValidTable] = useState<string[]>([]);
    const [errTable, setErrTable] = useState<string[]>([]);

    const fetchAllData = useCallback(async () => {
        setStatus("loadingNew");
        setErrorMessage("");
        setCanUseCachedFallback(false);

        try {
            const apiBase = getApiBase();
            const sheetId = getSheetId();

            const url = `${apiBase}?action=getAllData&sheetId=${encodeURIComponent(
                sheetId
            )}`;

            logger.debug("🔧 [Loading] apiBase:", apiBase);
            logger.debug("🔧 [Loading] sheetId (client gửi):", sheetId);
            logger.debug("🔗 [Loading] Request URL:", url);

            const res = await fetch(url, {
                method: "GET",
            });

            logger.debug(
                "📡 [Loading] HTTP status:",
                res.status,
                "| ok:",
                res.ok
            );

            // đọc raw text để biết server trả gì
            const rawText = await res.text();
            // logger.debug("📨 [Loading] Raw response text từ server:\n", rawText);

            if (!res.ok) {
                throw new Error(`HTTP_${res.status}:${rawText.slice(0, 160)}`);
            }

            let result: any;
            try {
                result = JSON.parse(rawText);
            } catch {
                throw new Error("INVALID_JSON_RESPONSE");
            }

            logger.debug("📌 [Loading] Parsed JSON result:", result);

            const total = result.totalTable ?? 0;
            const valid = result.validTable ?? [];
            const err = result.errTable ?? [];
            const allData = result.data ?? [];

            logger.debug("📌 [Loading] Dữ liệu tất cả các bảng (mới):", allData);
            logger.debug("🔎 [Loading] Meta:", { total, valid, err });

            setTotalTable(total);
            setValidTable(valid);
            setErrTable(err);

            storage.set(KEY_ALL_DATA, JSON.stringify(allData));
            setDeviceGroups(allData);

            setHasLocalData(false);
            setIsDataFromCache(false);
            setStatus("ready");
        } catch (err) {
            logger.error(
                "❌ [Loading] Lỗi khi lấy dữ liệu tất cả các bảng:",
                err
            );

            const cached = parseCachedData(storage.getString(KEY_ALL_DATA));
            setCanUseCachedFallback(Boolean(cached && !cached.isEmpty));
            setErrorMessage(toUserErrorMessage(err));
            setStatus("error");
        }
    }, [setDeviceGroups, setIsDataFromCache]);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setStatus("checking");

                const cached = parseCachedData(storage.getString(KEY_ALL_DATA));
                if (cached && !cached.isEmpty) {
                    logger.debug(
                        "📌 Dữ liệu lấy từ bộ nhớ (CŨ, có nội dung):",
                        cached.data
                    );
                    setDeviceGroups(cached.data);
                    setHasLocalData(true);
                    setIsDataFromCache(true);
                    setStatus("ready");
                    return;
                }

                await fetchAllData();
            } catch (error) {
                logger.error("Lỗi khi bootstrap dữ liệu:", error);
                setErrorMessage(toUserErrorMessage(error));
                setStatus("error");
            }
        };

        bootstrap();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fetchAllData, setDeviceGroups, setIsDataFromCache]);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (status !== "ready") {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                navigation.replace("Home");
            });
        }, 2000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [status, navigation, opacity]);

    const renderTitle = () => {
        if (status === "checking") return "Đang kiểm tra dữ liệu...";
        if (status === "loadingNew") return "Đang tải dữ liệu lần đầu...";
        if (status === "error") return "Không thể tải dữ liệu";
        if (status === "ready" && hasLocalData)
            return "Đã có dữ liệu trong bộ nhớ";
        if (status === "ready" && !hasLocalData) return "Tải dữ liệu hoàn tất";
        return "";
    };

    const handleRetry = () => {
        void fetchAllData();
    };

    const handleUseCachedData = () => {
        const cached = parseCachedData(storage.getString(KEY_ALL_DATA));
        if (!cached || cached.isEmpty) {
            setCanUseCachedFallback(false);
            setErrorMessage("Không tìm thấy dữ liệu cũ để sử dụng.");
            return;
        }

        setDeviceGroups(cached.data);
        setHasLocalData(true);
        setIsDataFromCache(true);
        setStatus("ready");
    };

    const isDone = status === "ready";
    const isError = status === "error";
    const hasMeta = totalTable !== null;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.inner, { opacity }]}>
                <View style={styles.circle}>
                    {isDone ? (
                        <Ionicons
                            name="checkmark-done-circle-outline"
                            size={80}
                            color={colors.success}
                        />
                    ) : isError ? (
                        <Ionicons
                            name="alert-circle-outline"
                            size={80}
                            color={colors.danger}
                        />
                    ) : (
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                    )}
                </View>

                <Text style={styles.title}>{renderTitle()}</Text>

                {isDone && hasLocalData && (
                    <Text style={styles.subText}>
                        Sử dụng tạm dữ liệu trong bộ nhớ...
                    </Text>
                )}

                {isError && (
                    <>
                        <Text style={styles.errorText}>
                            {errorMessage || "Không thể tải dữ liệu."}
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRetry}
                        >
                            <Text style={styles.primaryButtonText}>Thử lại</Text>
                        </TouchableOpacity>

                        {canUseCachedFallback && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleUseCachedData}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Dùng dữ liệu cũ
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {isDone && !hasLocalData && (
                    <>
                        <Text style={styles.subText}>
                            Dữ liệu mới đã sẵn sàng, chuyển đến trang chính...
                        </Text>

                        {hasMeta && (
                            <>
                                <Text style={styles.metaText}>
                                    Tổng số bảng: {totalTable}
                                </Text>
                                <Text style={styles.metaText}>
                                    Bảng hợp lệ: {validTable.length} | Bảng lỗi:{" "}
                                    {errTable.length}
                                </Text>
                                {errTable.length > 0 && (
                                    <Text style={styles.metaTextSmall}>
                                        Bảng lỗi: {errTable.join(", ")}
                                    </Text>
                                )}
                            </>
                        )}
                    </>
                )}

                {!isDone && status === "loadingNew" && (
                    <Text style={styles.subText}>
                        Lần đầu tải dữ liệu có thể mất vài giây...
                    </Text>
                )}
            </Animated.View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
    inner: {
        alignItems: "center",
        justifyContent: "center",
    },
    circle: {
        width: 140,
        height: 140,
        borderRadius: radius.pill,
        borderWidth: 3,
        borderColor: colors.primarySoftBorder,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceAlt,
    },
    title: {
        marginTop: 24,
        color: colors.text,
        ...textStyle(18, { weight: "700", lineHeightPreset: "tight" }),
        textAlign: "center",
    },
    subText: {
        marginTop: 8,
        color: colors.textMuted,
        ...textStyle(14),
        textAlign: "center",
    },
    errorText: {
        marginTop: 10,
        color: colors.danger,
        ...textStyle(14),
        textAlign: "center",
        maxWidth: 280,
    },
    primaryButton: {
        marginTop: 14,
        minWidth: 140,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: "center",
    },
    primaryButtonText: {
        color: colors.onPrimary,
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
    secondaryButton: {
        marginTop: 8,
        minWidth: 140,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: colors.primary,
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },
    metaText: {
        marginTop: 4,
        color: colors.textAccent,
        ...textStyle(13, { lineHeightPreset: "tight" }),
        textAlign: "center",
    },
    metaTextSmall: {
        marginTop: 2,
        color: colors.danger,
        ...textStyle(12, { lineHeightPreset: "tight" }),
        textAlign: "center",
    },
    });
