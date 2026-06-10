// src/components/ui/BaseModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    ViewStyle,
    StyleProp,
    DimensionValue,
    Animated,
} from "react-native";

import { componentMetrics, elevation, motion, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/useThemedStyles";

import type { ThemeColors } from "../../theme/theme";

type Props = {
    visible: boolean;

    /**
     * ✅ API mới: dùng onClose cho thống nhất
     */
    onClose?: () => void;

    /**
     * ✅ Giữ tương thích ngược (code cũ)
     * - Nếu bạn đang dùng onRequestClose ở chỗ khác vẫn chạy bình thường.
     */
    onRequestClose?: () => void;

    children: React.ReactNode;
    width?: DimensionValue;
    style?: StyleProp<ViewStyle>;
};

export function BaseModal({
    visible,
    onClose,
    onRequestClose,
    children,
    width = "100%",
    style,
}: Props) {
    const styles = useThemedStyles(createStyles);
    const [mounted, setMounted] = useState(visible);
    const anim = useRef(new Animated.Value(0)).current;

    // ✅ 1 handler duy nhất để đóng
    const handleClose = onClose || onRequestClose || (() => {});

    useEffect(() => {
        if (visible) {
            setMounted(true);
            anim.stopAnimation();
            Animated.timing(anim, {
                toValue: 1,
                duration: motion.modalInDuration,
                useNativeDriver: true,
            }).start();
        } else {
            anim.stopAnimation();
            Animated.timing(anim, {
                toValue: 0,
                duration: motion.modalOutDuration,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) setMounted(false);
            });
        }
    }, [visible, anim]);

    if (!mounted) return null;

    const overlayOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const containerOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const containerScale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [componentMetrics.modalInScaleFrom, 1],
    });

    const containerTranslateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [componentMetrics.modalInTranslateY, 0],
    });

    return (
        <Modal
            visible={mounted}
            transparent
            animationType="none" // ✅ tự animate bằng Animated
            onRequestClose={handleClose} // ✅ Android back
        >
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: overlayOpacity },
                ]}
            >
                {/* Backdrop bắt tap để đóng */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Thân modal */}
                <Animated.View
                    style={[
                        styles.container,
                        { width },
                        style,
                        {
                            opacity: containerOpacity,
                            transform: [
                                { translateY: containerTranslateY },
                                { scale: containerScale },
                            ],
                        },
                    ]}
                >
                    {children}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: componentMetrics.modalOverlayPaddingHorizontal,
        backgroundColor: colors.backdropCard,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: componentMetrics.modalCornerRadius,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderWidth: componentMetrics.modalBorderWidth,
        borderColor: colors.primaryBorderStrong,
        maxHeight: componentMetrics.modalMaxHeight,
        shadowColor: colors.accent,
        shadowOpacity: elevation.modalShadowOpacity,
        shadowRadius: elevation.modalShadowRadius,
        shadowOffset: { width: 0, height: elevation.modalShadowOffsetY },
        elevation: elevation.modalElevation,
    },
    });
