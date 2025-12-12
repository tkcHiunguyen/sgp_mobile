// src/components/ui/BaseModal.tsx
import React from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    ViewStyle,
    StyleProp,
    DimensionValue,
} from "react-native";
import { colors, radius, spacing } from "../../theme/theme";

type Props = {
    visible: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
    width?: DimensionValue;
    style?: StyleProp<ViewStyle>;
};

export function BaseModal({
    visible,
    onRequestClose,
    children,
    width = "100%",
    style,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={styles.overlay}>
                {/* Lớp backdrop bắt tap để đóng modal */}
                <TouchableWithoutFeedback onPress={onRequestClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Thân modal: KHÔNG bọc trong TouchableWithoutFeedback nữa */}
                <View style={[styles.container, { width }, style]}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.85)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject, 
    },
    container: {
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.5)",
        maxHeight: "80%",
    },
});
