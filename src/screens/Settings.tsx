// src/screens/Settings.tsx

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import BackButton from "../components/backButton";
import DataSyncIndicator from "../components/DataSyncIndicator";
import Ionicons from "react-native-vector-icons/Ionicons";

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
    VERSION, // 🔹 lấy VERSION từ config
} from "../config/apiConfig";

import {
    fetchLatestOta,
    isNewerVersion,
    downloadAndInstallApk,
    type OtaInfo,
    OtaError,
} from "../services/otaService";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

// key lưu version đã tải OTA (client-side)
const KEY_APP_VERSION = "APP_VERSION";

export default function SettingsScreen({ navigation }: Props) {
    const [apiBase, setApiBaseInput] = useState<string>("");
    const [sheetId, setSheetIdInput] = useState<string>("");

    // phiên bản để hiển thị trên UI
    const [appVersion, setAppVersion] = useState<string>(VERSION);

    // sheet ban đầu để biết có đổi không
    const [initialSheetId, setInitialSheetId] = useState<string>("");

    const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
    const [showDoneResetModal, setShowDoneResetModal] = useState(false);
    const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
    const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);

    const [downloadProgress, setDownloadProgress] = useState<number | null>(
        null
    );

    // Sau khi lưu xong có cần về Loading không
    const [shouldGoToLoadingAfterSave, setShouldGoToLoadingAfterSave] =
        useState(false);

    // 🔒 trạng thái khóa cho từng field
    const [apiLocked, setApiLocked] = useState<boolean>(true);
    const [sheetLocked, setSheetLocked] = useState<boolean>(true);

    // Modal cảnh báo "nội dung nguy hiểm" cho unlock
    const [showDangerEditModal, setShowDangerEditModal] = useState(false);
    const [pendingUnlockField, setPendingUnlockField] = useState<
        "api" | "sheet" | null
    >(null);

    // trạng thái OTA
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [downloadingUpdate, setDownloadingUpdate] = useState(false);

    const [otaModalVisible, setOtaModalVisible] = useState(false);
    const [otaModalType, setOtaModalType] = useState<
        "info" | "error" | "confirm"
    >("info");
    const [otaModalTitle, setOtaModalTitle] = useState("");
    const [otaModalMessage, setOtaModalMessage] = useState("");
    const [pendingOta, setPendingOta] = useState<OtaInfo | null>(null);

    useEffect(() => {
        try {
            const currentApiBase = getApiBase();
            const currentSheetId = getSheetId();

            setApiBaseInput(currentApiBase);
            setSheetIdInput(currentSheetId);
            setInitialSheetId(currentSheetId);

            try {
                const storedVersion =
                    typeof storage.getString === "function"
                        ? storage.getString(KEY_APP_VERSION)
                        : null;

                if (storedVersion && typeof storedVersion === "string") {
                    setAppVersion(storedVersion);
                } else {
                    setAppVersion(VERSION);
                }
            } catch (e) {
                console.warn("Không đọc được phiên bản từ storage:", e);
                setAppVersion(VERSION);
            }
        } catch (e) {
            console.warn("Không đọc được config:", e);
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
                    console.log(
                        "🧹 Đã xoá cache KEY_ALL_DATA do thay đổi sheetId"
                    );
                } catch (e) {
                    console.warn("Không xoá được KEY_ALL_DATA:", e);
                }
            }

            setShouldGoToLoadingAfterSave(isSheetChanged);
            setShowSaveSuccessModal(true);
        } catch (e) {
            console.error("Lỗi lưu config:", e);
            setShowSaveErrorModal(true);
        }
    };

    const handleResetToDefault = () => {
        setShowConfirmResetModal(true);
    };

    const handleConfirmReset = () => {
        const ok = resetConfig();
        if (!ok) {
            console.warn("resetConfig trả về false");
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

    const handleAfterSaveOk = () => {
        setShowSaveSuccessModal(false);

        if (shouldGoToLoadingAfterSave) {
            navigation.reset({
                index: 0,
                routes: [{ name: "Loading" }],
            });
        }
    };

    // ---------- XỬ LÝ KHÓA FIELD ----------
    const requestUnlockField = (field: "api" | "sheet") => {
        // nếu đang khóa -> hỏi cho phép
        if (
            (field === "api" && apiLocked) ||
            (field === "sheet" && sheetLocked)
        ) {
            setPendingUnlockField(field);
            setShowDangerEditModal(true);
        } else {
            // đang mở -> bấm lại để khóa luôn, không hỏi
            if (field === "api") {
                setApiLocked(true);
            } else {
                setSheetLocked(true);
            }
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
        if (checkingUpdate || downloadingUpdate) return;

        try {
            setCheckingUpdate(true);

            const ota = await fetchLatestOta();

            if (!ota) {
                openOtaModal("info", "Cập nhật", "Không có bản cập nhật mới.");
                return;
            }

            // So sánh version server với VERSION hiện tại của app
            const hasNew = isNewerVersion(ota.version, VERSION);
            if (!hasNew) {
                openOtaModal(
                    "info",
                    "Cập nhật",
                    `Bạn đang dùng phiên bản mới nhất (${VERSION}).`
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

    const handleConfirmDownloadUpdate = async () => {
        if (!pendingOta) {
            setOtaModalVisible(false);
            return;
        }

        setOtaModalVisible(false);
        try {
            setDownloadingUpdate(true);
            setDownloadProgress(0); // reset progress

            // truyền callback onProgress vào service
            await downloadAndInstallApk(pendingOta, {
                onProgress: (fraction: number) => {
                    const percent = Math.round(fraction * 100);
                    setDownloadProgress(percent);
                },
            });

            // lưu version OTA đã tải vào storage + state
            try {
                // @ts-ignore: tuỳ implementation của storage
                if (typeof storage.set === "function") {
                    storage.set(KEY_APP_VERSION, pendingOta.version);
                }
                setAppVersion(pendingOta.version);
            } catch (e) {
                console.warn("Không lưu được version vào storage:", e);
            }

            openOtaModal(
                "info",
                "Đã tải bản cập nhật",
                "Hệ thống sẽ mở màn hình cài đặt APK. Nếu không thấy, hãy kiểm tra trong thư mục Tải xuống (Download)."
            );
            setPendingOta(null);
        } catch (e: any) {
            console.error("Lỗi tải/cài đặt OTA:", e);

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
        } finally {
            setDownloadingUpdate(false);
            setDownloadProgress(null);
        }
    };

    const handleCloseOtaModal = () => {
        setOtaModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <BackButton onPress={() => navigation.goBack()} />
            <DataSyncIndicator />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.header}>Cài đặt</Text>

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
                                placeholderTextColor="#64748B"
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
                                    color={apiLocked ? "#FACC15" : "#22C55E"}
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
                                placeholderTextColor="#64748B"
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
                                    color={sheetLocked ? "#FACC15" : "#22C55E"}
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
                                <Text style={styles.versionSubText}>
                                    Build đang chạy: {VERSION}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.otaButton,
                                    (checkingUpdate || downloadingUpdate) &&
                                        styles.otaButtonDisabled,
                                ]}
                                onPress={handleCheckOta}
                                disabled={checkingUpdate || downloadingUpdate}
                            >
                                <Text style={styles.otaButtonText}>
                                    {downloadingUpdate
                                        ? "Đang tải..."
                                        : checkingUpdate
                                        ? "Đang kiểm tra..."
                                        : "Kiểm tra cập nhật"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* progress bar khi đang tải */}
                        {downloadingUpdate && (
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

            {/* Modal OTA custom */}
            <Modal
                visible={otaModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseOtaModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{otaModalTitle}</Text>
                        <Text style={styles.modalMessage}>
                            {otaModalMessage}
                        </Text>

                        {otaModalType === "confirm" ? (
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalCancel,
                                    ]}
                                    onPress={handleCloseOtaModal}
                                >
                                    <Text style={styles.modalButtonText}>
                                        Để sau
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalPrimary,
                                    ]}
                                    onPress={handleConfirmDownloadUpdate}
                                >
                                    <Text style={styles.modalButtonText}>
                                        Cập nhật ngay
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.modalButtonRowSingle}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalPrimary,
                                    ]}
                                    onPress={handleCloseOtaModal}
                                >
                                    <Text style={styles.modalButtonText}>
                                        Đã hiểu
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal xác nhận reset */}
            <Modal
                visible={showConfirmResetModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmResetModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Đặt lại mặc định</Text>
                        <Text style={styles.modalMessage}>
                            Thao tác này sẽ xoá dữ liệu đã tải (cache) và đưa
                            đường dẫn API cùng Sheet ID về giá trị mặc định ban
                            đầu.{"\n\n"}
                            Bạn có chắc chắn muốn tiếp tục?
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => setShowConfirmResetModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalDanger]}
                                onPress={handleConfirmReset}
                            >
                                <Text style={styles.modalButtonText}>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal thông báo đã reset xong */}
            <Modal
                visible={showDoneResetModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDoneResetModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Đã đặt lại thành công
                        </Text>
                        <Text style={styles.modalMessage}>
                            Cấu hình đã được đưa về mặc định và dữ liệu cũ đã
                            xoá.{"\n\n"}
                            Vui lòng tải lại dữ liệu để tiếp tục sử dụng ứng
                            dụng.
                        </Text>

                        <View style={styles.modalButtonRowSingle}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimary,
                                ]}
                                onPress={handleGoToLoadingAfterReset}
                            >
                                <Text style={styles.modalButtonText}>
                                    Tải lại dữ liệu
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal lưu thành công */}
            <Modal
                visible={showSaveSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSaveSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Đã lưu cấu hình</Text>
                        <Text style={styles.modalMessage}>
                            Cấu hình API và Sheet ID đã được lưu thành công.
                        </Text>
                        <View style={styles.modalButtonRowSingle}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimary,
                                ]}
                                onPress={handleAfterSaveOk}
                            >
                                <Text style={styles.modalButtonText}>
                                    Đã hiểu
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal lưu lỗi */}
            <Modal
                visible={showSaveErrorModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSaveErrorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Lỗi</Text>
                        <Text style={styles.modalMessage}>
                            Không thể lưu cấu hình. Vui lòng thử lại.
                        </Text>
                        <View style={styles.modalButtonRowSingle}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimary,
                                ]}
                                onPress={() => setShowSaveErrorModal(false)}
                            >
                                <Text style={styles.modalButtonText}>
                                    Đã hiểu
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal cho phép thay đổi nội dung nguy hiểm */}
            <Modal
                visible={showDangerEditModal}
                transparent
                animationType="fade"
                onRequestClose={cancelUnlockDangerField}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Thay đổi nội dung nhạy cảm
                        </Text>
                        <Text style={styles.modalMessage}>
                            Bạn sắp cho phép chỉnh sửa cấu hình quan trọng (API
                            Base URL / Sheet ID).{"\n\n"}
                            Hãy chắc chắn rằng bạn hiểu rõ thay đổi này trước
                            khi tiếp tục.
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={cancelUnlockDangerField}
                            >
                                <Text style={styles.modalButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimary,
                                ]}
                                onPress={confirmUnlockDangerField}
                            >
                                <Text style={styles.modalButtonText}>
                                    Cho phép
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#020617",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        fontSize: 26,
        fontWeight: "900",
        color: "#E5F2FF",
        marginBottom: 24,
        textAlign: "center",
        letterSpacing: 0.8,
    },
    card: {
        backgroundColor: "#0F172A",
        padding: 18,
        borderRadius: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.35)",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#E5F2FF",
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        color: "#9CA3AF",
        marginBottom: 10,
        lineHeight: 18,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    input: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(51,65,85,0.9)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#E5F2FF",
        fontSize: 14,
        backgroundColor: "#020617",
    },
    inputDisabled: {
        backgroundColor: "#020617",
        borderColor: "rgba(75,85,99,0.9)",
        opacity: 0.6,
    },
    lockIconButton: {
        marginLeft: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15,23,42,0.9)",
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.6)",
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 4,
    },
    saveButton: {
        backgroundColor: "#16A34A",
    },
    resetButton: {
        backgroundColor: "#DC2626",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },

    // OTA
    otaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    versionLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    versionValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#E5F2FF",
        marginTop: 2,
    },
    versionSubText: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 2,
    },
    otaButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: "#2563EB",
        marginLeft: 8,
        minWidth: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    otaButtonDisabled: {
        opacity: 0.6,
    },
    otaButtonText: {
        color: "#F9FAFB",
        fontSize: 13,
        fontWeight: "700",
    },

    // Progress bar
    progressContainer: {
        marginTop: 12,
    },
    progressBarBackground: {
        height: 6,
        borderRadius: 999,
        backgroundColor: "#1F2937",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#3B82F6",
    },
    progressText: {
        marginTop: 4,
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "right",
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.85)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalContainer: {
        backgroundColor: "#020617",
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 18,
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.5)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#E5F2FF",
        marginBottom: 10,
        textAlign: "center",
    },
    modalMessage: {
        fontSize: 14,
        color: "#9CA3AF",
        lineHeight: 20,
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
    modalButton: {
        width: 120,
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: "center",
        marginHorizontal: 4,
    },
    modalCancel: {
        backgroundColor: "#1F2937",
    },
    modalDanger: {
        backgroundColor: "#DC2626",
    },
    modalPrimary: {
        backgroundColor: "#3B82F6",
        alignSelf: "center",
    },
    modalButtonText: {
        color: "#F9FAFB",
        fontSize: 14,
        fontWeight: "700",
    },
});
