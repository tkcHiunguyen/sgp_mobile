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
} from "../config/apiConfig";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
    const [apiBase, setApiBaseInput] = useState<string>("");
    const [sheetId, setSheetIdInput] = useState<string>("");

    // sheet ban đầu để biết có đổi không
    const [initialSheetId, setInitialSheetId] = useState<string>("");

    const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
    const [showDoneResetModal, setShowDoneResetModal] = useState(false);
    const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
    const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);

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

    useEffect(() => {
        try {
            const currentApiBase = getApiBase();
            const currentSheetId = getSheetId();

            setApiBaseInput(currentApiBase);
            setSheetIdInput(currentSheetId);
            setInitialSheetId(currentSheetId);
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
        } else {
            // không làm gì, chỉ đóng modal
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

            {/* Modal thông báo đã reset xong → yêu cầu tải lại dữ liệu */}
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
        width: 100,
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
