// src/screens/Settings.tsx
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import { Switch } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AppButton } from "../components/ui/AppButton";
import { AppScreen } from "../components/ui/AppScreen";
import { BaseModal } from "../components/ui/BaseModal";
import HeaderBar from "../components/ui/HeaderBar";
import {
    storage,
    getApiBase,
    getSheetId,
    setApiBase,
    setSheetId,
    DEFAULT_API_BASE,
    DEFAULT_SHEET_ID,
    resetConfig,
    KEY_ALL_DATA,
} from "../config/apiConfig";
import { useOta } from "../context/OtaContext";
import { useTheme } from "../context/ThemeContext";
import {
    fetchLatestOta,
    OtaError,
    isNewerVersion,
    type OtaInfo,
} from "../services/otaService";
import { componentMetrics, radius, type ThemeColors } from "../theme/theme";
import { MIN_TOUCH_TARGET_SIZE } from "../theme/touchTargets";
import { inputMetrics, textStyle } from "../theme/typography";
import { useThemedStyles } from "../theme/useThemedStyles";
import { logger } from "../utils/logger";

import type { RootStackParamList } from "../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
    const [apiBase, setApiBaseInput] = useState<string>("");
    const [sheetId, setSheetIdInput] = useState<string>("");
    const [initialSheetId, setInitialSheetId] = useState<string>("");
    const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
    const [showDoneResetModal, setShowDoneResetModal] = useState(false);
    const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
    const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
    const [shouldGoToLoadingAfterSave, setShouldGoToLoadingAfterSave] =
        useState(false);
    // lock từng field
    const [apiLocked, setApiLocked] = useState<boolean>(true);
    const [sheetLocked, setSheetLocked] = useState<boolean>(true);
    // Modal cảnh báo trước khi unlock
    const [showDangerEditModal, setShowDangerEditModal] = useState(false);
    const [pendingUnlockField, setPendingUnlockField] = useState<
        "api" | "sheet" | null
    >(null);

    // OTA state
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [otaModalVisible, setOtaModalVisible] = useState(false);
    const [otaModalType, setOtaModalType] = useState<
        "info" | "error" | "confirm"
    >("info");
    const [otaModalTitle, setOtaModalTitle] = useState("");
    const [otaModalMessage, setOtaModalMessage] = useState("");
    const [pendingOta, setPendingOta] = useState<OtaInfo | null>(null);
    const {
        appVersion,
        isDownloading,
        downloadProgress,
        startDownload,
    } = useOta();
    const { mode, setMode, colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    useEffect(() => {
        try {
            const currentApiBase = getApiBase();
            const currentSheetId = getSheetId();

            setApiBaseInput(currentApiBase);
            setSheetIdInput(currentSheetId);
            setInitialSheetId(currentSheetId);
        } catch (e) {
            logger.warn("Không đọc được config:", e);
        }
    }, []);

    const handleSave = () => {
        try {
            const trimmedApiBase = apiBase.trim();
            const trimmedSheetId = sheetId.trim();

            const prevSheetId = initialSheetId.trim();
            const isSheetChanged = trimmedSheetId !== prevSheetId;

            setApiBase(trimmedApiBase);
            setSheetId(trimmedSheetId);

            if (isSheetChanged) {
                try {
                    storage.remove(KEY_ALL_DATA);
                    logger.debug(
                        "🧹 Đã xoá cache KEY_ALL_DATA do thay đổi sheetId"
                    );
                } catch (e) {
                    logger.warn("Không xoá được KEY_ALL_DATA:", e);
                }
            }

            setShouldGoToLoadingAfterSave(isSheetChanged);
            setShowSaveSuccessModal(true);
        } catch (e) {
            logger.error("Lỗi lưu config:", e);
            setShowSaveErrorModal(true);
        }
    };

    const handleResetToDefault = () => {
        setShowConfirmResetModal(true);
    };

    const handleConfirmReset = () => {
        const ok = resetConfig();
        if (!ok) {
            logger.warn("resetConfig trả về false");
        }

        setApiBaseInput(DEFAULT_API_BASE);
        setSheetIdInput(DEFAULT_SHEET_ID);

        setShowConfirmResetModal(false);
        setShowDoneResetModal(true);
    };

    const handleGoToLoadingAfterReset = () => {
        setShowDoneResetModal(false);
        navigation.reset({
            index: 0,
            routes: [{ name: "Loading" }],
        });
    };

    const requestUnlockField = (field: "api" | "sheet") => {
        if (
            (field === "api" && apiLocked) ||
            (field === "sheet" && sheetLocked)
        ) {
            setPendingUnlockField(field);
            setShowDangerEditModal(true);
        } else {
            if (field === "api") {
                setApiLocked(true);
            } else {
                setSheetLocked(true);
            }
        }
    };

    const handleAfterSaveOk = () => {
        setShowSaveSuccessModal(false);

        if (shouldGoToLoadingAfterSave) {
            navigation.reset({
                index: 0,
                routes: [{ name: "Loading" }],
            });
        }
    };

    const confirmUnlockDangerField = () => {
        if (pendingUnlockField === "api") {
            setApiLocked(false);
        } else if (pendingUnlockField === "sheet") {
            setSheetLocked(false);
        }
        setPendingUnlockField(null);
        setShowDangerEditModal(false);
    };

    const cancelUnlockDangerField = () => {
        setPendingUnlockField(null);
        setShowDangerEditModal(false);
    };

    // ---------- OTA ----------
    const openOtaModal = (
        type: "info" | "error" | "confirm",
        title: string,
        message: string
    ) => {
        setOtaModalType(type);
        setOtaModalTitle(title);
        setOtaModalMessage(message);
        setOtaModalVisible(true);
    };

    const handleCheckOta = async () => {
        if (checkingUpdate || isDownloading) return;

        try {
            setCheckingUpdate(true);

            const ota = await fetchLatestOta();

            if (!ota) {
                openOtaModal("info", "Cập nhật", "Không có bản cập nhật mới.");
                return;
            }

            const hasNew = isNewerVersion(ota.version, appVersion);
            if (!hasNew) {
                openOtaModal(
                    "info",
                    "Cập nhật",
                    `Bạn đang dùng phiên bản mới nhất (${appVersion}).`
                );
                return;
            }

            // Có bản mới
            setPendingOta(ota);
            openOtaModal(
                "confirm",
                `Có bản cập nhật ${ota.version}`,
                ota.changelog && ota.changelog.trim().length > 0
                    ? ota.changelog
                    : "Có bản cập nhật mới cho ứng dụng. Bạn có muốn tải và cài đặt ngay không?"
            );
        } catch (e: any) {
            if (e instanceof OtaError) {
                if (e.kind === "NETWORK") {
                    openOtaModal(
                        "error",
                        "Không thể kết nối",
                        "Không kết nối được tới server cập nhật.\n\nHãy kiểm tra lại Wi-Fi/4G hoặc địa chỉ API Base URL trong phần Cài đặt."
                    );
                } else if (e.kind === "HTTP") {
                    const statusText =
                        e.status === 404
                            ? "Server không tìm thấy endpoint /ota/latest. Hãy kiểm tra lại cấu hình route trên Node.js."
                            : `Server OTA trả về lỗi (HTTP ${e.status}). Vui lòng kiểm tra log server.`;

                    openOtaModal("error", "Lỗi server OTA", statusText);
                } else {
                    openOtaModal(
                        "error",
                        "Lỗi",
                        e.message || "Có lỗi xảy ra khi kiểm tra cập nhật."
                    );
                }
            } else {
                openOtaModal(
                    "error",
                    "Lỗi",
                    "Có lỗi không xác định khi kiểm tra cập nhật. Hãy thử lại sau."
                );
            }
        } finally {
            setCheckingUpdate(false);
        }
    };

    const handleThemeSwitch = (useDarkMode: boolean) => {
        const nextMode = useDarkMode ? "dark" : "light";
        if (nextMode === mode) return;
        setMode(nextMode);
    };

    const handleConfirmDownloadUpdate = async () => {
        if (!pendingOta) {
            logger.debug("[OTA] Không có pendingOta, đóng modal.");
            setOtaModalVisible(false);
            return;
        }
        logger.debug("[OTA] Bắt đầu tải:", pendingOta.version);
        setOtaModalVisible(false);

        try {
            await startDownload(pendingOta);
            logger.debug("[OTA] Tải xong, mở modal thông báo.");
            openOtaModal(
                "info",
                "Đã tải bản cập nhật",
                "Hệ thống sẽ mở màn hình cài đặt APK. Nếu không thấy, hãy kiểm tra trong thư mục Tải xuống (Download)."
            );
            setPendingOta(null);
        } catch (e: any) {
            logger.error("Lỗi tải/cài đặt OTA:", e);

            if (e instanceof OtaError) {
                if (e.kind === "NETWORK") {
                    openOtaModal(
                        "error",
                        "Lỗi mạng",
                        "Không tải được file cập nhật. Vui lòng kiểm tra lại kết nối mạng."
                    );
                } else if (e.kind === "HTTP") {
                    openOtaModal(
                        "error",
                        "Lỗi tải file",
                        `Server trả về lỗi khi tải file cập nhật (HTTP ${e.status}). Hãy kiểm tra lại server Node.js.`
                    );
                } else if (e.kind === "DOWNLOAD") {
                    openOtaModal(
                        "error",
                        "Không mở được file",
                        e.message ||
                            "Tải xong nhưng không mở được file cài đặt. Hãy thử mở file APK trong thư mục Download."
                    );
                } else if (e.kind === "VERIFY") {
                    openOtaModal(
                        "error",
                        "Xác minh OTA thất bại",
                        e.message ||
                            "Không thể xác minh tính toàn vẹn/chữ ký của file APK."
                    );
                } else if (e.kind === "PLATFORM") {
                    openOtaModal(
                        "error",
                        "Nền tảng không hỗ trợ",
                        "Chức năng OTA chỉ hỗ trợ trên Android."
                    );
                } else {
                    openOtaModal(
                        "error",
                        "Lỗi",
                        e.message ||
                            "Có lỗi xảy ra khi tải/cài đặt bản cập nhật."
                    );
                }
            } else {
                openOtaModal(
                    "error",
                    "Lỗi",
                    "Có lỗi không xác định khi tải/cài đặt bản cập nhật."
                );
            }
        }
    };

    const handleCloseOtaModal = () => {
        setOtaModalVisible(false);
    };

    return (
        <AppScreen topPadding={0}>
            {/* Header chung: Back + Sync + title 2 hàng */}
            <HeaderBar title="Cài đặt" onBack={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card: API Base URL */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>API Base URL</Text>
                        <Text style={styles.cardDescription}>
                            Địa chỉ API Apps Script. Thay đổi khi bạn dùng một
                            script mới hoặc endpoint mới.
                        </Text>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={[
                                    styles.input,
                                    apiLocked && styles.inputDisabled,
                                ]}
                                placeholder="https://script.google.com/macros/s/....../exec"
                                placeholderTextColor={colors.textMuted}
                                value={apiBase}
                                editable={!apiLocked}
                                selectTextOnFocus={!apiLocked}
                                onChangeText={(text) => {
                                    if (!apiLocked) setApiBaseInput(text);
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={styles.lockIconButton}
                                onPress={() => requestUnlockField("api")}
                            >
                                <Ionicons
                                    name={
                                        apiLocked
                                            ? "lock-closed-outline"
                                            : "lock-open-outline"
                                    }
                                    size={20}
                                    color={
                                        apiLocked ? colors.warning : colors.success
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Card: Sheet ID */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sheet ID</Text>
                        <Text style={styles.cardDescription}>
                            Mã định danh của nguồn dữ liệu (ví dụ: ID của file
                            Google Sheet). Giá trị này sẽ gửi kèm trong request
                            header hoặc query.
                        </Text>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={[
                                    styles.input,
                                    sheetLocked && styles.inputDisabled,
                                ]}
                                placeholder="Nhập Sheet ID hoặc mã cấu hình"
                                placeholderTextColor={colors.textMuted}
                                value={sheetId}
                                editable={!sheetLocked}
                                selectTextOnFocus={!sheetLocked}
                                onChangeText={(text) => {
                                    if (!sheetLocked) setSheetIdInput(text);
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={styles.lockIconButton}
                                onPress={() => requestUnlockField("sheet")}
                            >
                                <Ionicons
                                    name={
                                        sheetLocked
                                            ? "lock-closed-outline"
                                            : "lock-open-outline"
                                    }
                                    size={20}
                                    color={
                                        sheetLocked ? colors.warning : colors.success
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Card: OTA Update */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Cập nhật ứng dụng (OTA)
                        </Text>
                        <Text style={styles.cardDescription}>
                            Kiểm tra và tải về bản APK mới nhất từ server. Khi
                            có bản cập nhật, ứng dụng sẽ tải file APK và mở
                            trình cài đặt hệ thống.
                        </Text>

                        <View style={styles.otaRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.versionLabel}>
                                    Phiên bản hiện tại
                                </Text>
                                <Text style={styles.versionValue}>
                                    {appVersion}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.otaButton,
                                    (checkingUpdate || isDownloading) &&
                                        styles.otaButtonDisabled,
                                ]}
                                onPress={handleCheckOta}
                                disabled={checkingUpdate || isDownloading}
                            >
                                <Text style={styles.otaButtonText}>
                                    {isDownloading
                                        ? "Đang tải..."
                                        : checkingUpdate
                                        ? "Đang kiểm tra..."
                                        : "Kiểm tra cập nhật"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isDownloading && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBackground}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${
                                                    downloadProgress != null
                                                        ? downloadProgress
                                                        : 0
                                                }%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    Đang tải bản cập nhật
                                    {downloadProgress != null
                                        ? ` · ${downloadProgress}%`
                                        : ""}
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Card: Giao diện (Dark / Light) */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Giao diện</Text>
                        <Text style={styles.cardDescription}>
                            Chọn chế độ hiển thị sáng hoặc tối cho ứng dụng.
                        </Text>

                        <View style={styles.themeModeIconsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.themeModeBadge,
                                    mode === "light" &&
                                        styles.themeModeBadgeActive,
                                ]}
                                onPress={() => handleThemeSwitch(false)}
                                activeOpacity={0.85}
                                disabled={mode === "light"}
                            >
                                <Ionicons
                                    name="sunny-outline"
                                    size={16}
                                    style={[
                                        styles.themeModeIcon,
                                        mode === "light" &&
                                            styles.themeModeIconActive,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.themeModeBadgeText,
                                        mode === "light" &&
                                            styles.themeModeBadgeTextActive,
                                    ]}
                                >
                                    Sáng
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.themeModeBadge,
                                    mode === "dark" &&
                                        styles.themeModeBadgeActive,
                                ]}
                                onPress={() => handleThemeSwitch(true)}
                                activeOpacity={0.85}
                                disabled={mode === "dark"}
                            >
                                <Ionicons
                                    name="moon-outline"
                                    size={16}
                                    style={[
                                        styles.themeModeIcon,
                                        mode === "dark" &&
                                            styles.themeModeIconActive,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.themeModeBadgeText,
                                        mode === "dark" &&
                                            styles.themeModeBadgeTextActive,
                                    ]}
                                >
                                    Tối
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.themeRow}>
                            <View>
                                <Text style={styles.themeLabel}>
                                    {mode === "dark"
                                        ? "Chế độ tối"
                                        : "Chế độ sáng"}
                                </Text>
                                <Text style={styles.themeHint}>
                                    Nhấn nút gạt để chuyển chế độ.
                                </Text>
                            </View>
                            <Switch
                                value={mode === "dark"}
                                onValueChange={handleThemeSwitch}
                                thumbColor={
                                    mode === "dark"
                                        ? colors.surface
                                        : colors.warning
                                }
                                trackColor={{
                                    false: colors.warningSoftBorder,
                                    true: colors.primaryBorderStrong,
                                }}
                                ios_backgroundColor={colors.backdropSoft}
                            />
                        </View>
                    </View>
                    {/* Nút hành động */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.resetButton]}
                            onPress={handleResetToDefault}
                        >
                            <Text style={styles.buttonText}>
                                Đặt lại mặc định
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTA modal */}
            <BaseModal
                visible={otaModalVisible}
                onRequestClose={handleCloseOtaModal}
            >
                <Text style={styles.modalTitle}>{otaModalTitle}</Text>
                <Text style={styles.modalMessage}>{otaModalMessage}</Text>

                {otaModalType === "confirm" ? (
                    <View style={styles.modalButtonRow}>
                        <AppButton
                            title="Để sau"
                            variant="secondary"
                            onPress={handleCloseOtaModal}
                            style={{ flex: 1, marginRight: 4 }}
                        />
                        <AppButton
                            title="Cập nhật ngay"
                            variant="primary"
                            onPress={handleConfirmDownloadUpdate}
                            style={{ flex: 1, marginLeft: 4 }}
                        />
                    </View>
                ) : (
                    <View style={styles.modalButtonRowSingle}>
                        <AppButton
                            title="Đã hiểu"
                            variant="primary"
                            onPress={handleCloseOtaModal}
                        />
                    </View>
                )}
            </BaseModal>

            {/* Modal xác nhận reset */}
            <BaseModal
                visible={showConfirmResetModal}
                onRequestClose={() => setShowConfirmResetModal(false)}
            >
                <Text style={styles.modalTitle}>Đặt lại mặc định</Text>
                <Text style={styles.modalMessage}>
                    Thao tác này sẽ xoá dữ liệu đã tải (cache) và đưa đường dẫn
                    API cùng Sheet ID về giá trị mặc định ban đầu.
                    {"\n\n"}
                    Bạn có chắc chắn muốn tiếp tục?
                </Text>

                <View style={styles.modalButtonRow}>
                    <AppButton
                        title="Hủy"
                        variant="secondary"
                        onPress={() => setShowConfirmResetModal(false)}
                        style={{ flex: 1, marginRight: 4 }}
                    />
                    <AppButton
                        title="Xác nhận"
                        variant="danger"
                        onPress={handleConfirmReset}
                        style={{ flex: 1, marginLeft: 4 }}
                    />
                </View>
            </BaseModal>

            {/* Modal thông báo đã reset xong */}
            <BaseModal
                visible={showDoneResetModal}
                onRequestClose={() => setShowDoneResetModal(false)}
            >
                <Text style={styles.modalTitle}>Đã đặt lại thành công</Text>
                <Text style={styles.modalMessage}>
                    Cấu hình đã được đưa về mặc định và dữ liệu cũ đã xoá.
                    {"\n\n"}
                    Vui lòng tải lại dữ liệu để tiếp tục sử dụng ứng dụng.
                </Text>

                <View style={styles.modalButtonRowSingle}>
                    <AppButton
                        title="Tải lại dữ liệu"
                        variant="primary"
                        onPress={handleGoToLoadingAfterReset}
                    />
                </View>
            </BaseModal>

            {/* Modal lưu thành công */}
            <BaseModal
                visible={showSaveSuccessModal}
                onRequestClose={() => setShowSaveSuccessModal(false)}
            >
                <Text style={styles.modalTitle}>Đã lưu cấu hình</Text>
                <Text style={styles.modalMessage}>
                    Cấu hình API và Sheet ID đã được lưu thành công.
                </Text>
                <View style={styles.modalButtonRowSingle}>
                    <AppButton
                        title="Đã hiểu"
                        variant="primary"
                        onPress={handleAfterSaveOk}
                    />
                </View>
            </BaseModal>

            {/* Modal lưu lỗi */}
            <BaseModal
                visible={showSaveErrorModal}
                onRequestClose={() => setShowSaveErrorModal(false)}
            >
                <Text style={styles.modalTitle}>Lỗi</Text>
                <Text style={styles.modalMessage}>
                    Không thể lưu cấu hình. Vui lòng thử lại.
                </Text>
                <View style={styles.modalButtonRowSingle}>
                    <AppButton
                        title="Đã hiểu"
                        variant="primary"
                        onPress={() => setShowSaveErrorModal(false)}
                    />
                </View>
            </BaseModal>

            {/* Modal cho phép thay đổi nội dung nguy hiểm */}
            <BaseModal
                visible={showDangerEditModal}
                onRequestClose={cancelUnlockDangerField}
            >
                <Text style={styles.modalTitle}>
                    Thay đổi nội dung nhạy cảm
                </Text>
                <Text style={styles.modalMessage}>
                    Bạn sắp cho phép chỉnh sửa cấu hình quan trọng (API Base URL
                    / Sheet ID).
                    {"\n\n"}
                    Hãy chắc chắn rằng bạn hiểu rõ thay đổi này trước khi tiếp
                    tục.
                </Text>

                <View style={styles.modalButtonRow}>
                    <AppButton
                        title="Hủy"
                        variant="secondary"
                        onPress={cancelUnlockDangerField}
                        style={{ flex: 1, marginRight: 4 }}
                    />
                    <AppButton
                        title="Cho phép"
                        variant="primary"
                        onPress={confirmUnlockDangerField}
                        style={{ flex: 1, marginLeft: 4 }}
                    />
                </View>
            </BaseModal>
        </AppScreen>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingTop: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 18,
        borderRadius: radius.lg,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        ...textStyle(16, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.text,
        marginBottom: 6,
    },
    cardDescription: {
        ...textStyle(13),
        color: colors.textMuted,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    input: {
        flex: 1,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        paddingHorizontal: 12,
        paddingVertical: inputMetrics.paddingVertical,
        height: inputMetrics.height,
        color: colors.text,
        ...textStyle(14, { lineHeightPreset: "tight" }),
        backgroundColor: colors.background,
    },
    inputDisabled: {
        backgroundColor: colors.background,
        borderColor: colors.primarySoftBorder,
        opacity: componentMetrics.buttonDisabledOpacity,
    },
    lockIconButton: {
        marginLeft: 8,
        width: MIN_TOUCH_TARGET_SIZE,
        height: MIN_TOUCH_TARGET_SIZE,
        borderRadius: MIN_TOUCH_TARGET_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        borderRadius: radius.md,
        alignItems: "center",
        marginHorizontal: 4,
    },
    saveButton: {
        backgroundColor: colors.success,
    },
    resetButton: {
        backgroundColor: colors.danger,
    },
    buttonText: {
        color: colors.onPrimary,
        ...textStyle(14, { weight: "700", lineHeightPreset: "tight" }),
    },

    // OTA
    otaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    versionLabel: {
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
    },
    versionValue: {
        ...textStyle(14, { weight: "600", lineHeightPreset: "tight" }),
        color: colors.text,
        marginTop: 2,
    },
    otaButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        minHeight: MIN_TOUCH_TARGET_SIZE,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        marginLeft: 8,
        minWidth: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    otaButtonDisabled: {
        opacity: componentMetrics.buttonDisabledOpacity,
    },
    otaButtonText: {
        color: colors.onPrimary,
        ...textStyle(13, { weight: "700", lineHeightPreset: "tight" }),
    },

    // Progress bar
    progressContainer: {
        marginTop: 12,
    },
    progressBarBackground: {
        height: 6,
        borderRadius: radius.pill,
        backgroundColor: colors.backgroundAlt,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
    },
    progressText: {
        marginTop: 4,
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
        textAlign: "right",
    },

    // Modal (chỉ style nội dung, container/overlay đã có BaseModal)
    modalTitle: {
        ...textStyle(18, { weight: "800", lineHeightPreset: "tight" }),
        color: colors.text,
        marginBottom: 10,
        textAlign: "center",
    },
    modalMessage: {
        ...textStyle(14, { lineHeightPreset: "loose" }),
        color: colors.textMuted,
        textAlign: "center",
        marginBottom: 18,
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    modalButtonRowSingle: {
        marginTop: 4,
        alignItems: "center",
    },
    themeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    themeModeIconsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 6,
    },
    themeModeBadge: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: MIN_TOUCH_TARGET_SIZE,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.primarySoftBorder,
        backgroundColor: colors.backgroundAlt,
    },
    themeModeBadgeActive: {
        borderColor: colors.primaryBorderStrong,
        backgroundColor: colors.background,
    },
    themeModeIcon: {
        color: colors.textMuted,
        marginRight: 6,
    },
    themeModeIconActive: {
        color: colors.textAccent,
    },
    themeModeBadgeText: {
        ...textStyle(12, { weight: "700", lineHeightPreset: "tight" }),
        color: colors.textMuted,
    },
    themeModeBadgeTextActive: {
        color: colors.text,
    },
    themeLabel: {
        ...textStyle(14, { weight: "600", lineHeightPreset: "tight" }),
        color: colors.text,
    },
    themeHint: {
        ...textStyle(12, { lineHeightPreset: "tight" }),
        color: colors.textMuted,
        marginTop: 2,
    },
    });
