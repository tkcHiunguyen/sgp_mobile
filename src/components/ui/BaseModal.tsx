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
    // ✅ Giữ modal mount để animate khi đóng
    const [mounted, setMounted] = useState(visible);

    // 0 -> 1 khi mở
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setMounted(true);
            anim.stopAnimation();
            Animated.timing(anim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }).start();
        } else {
            anim.stopAnimation();
            Animated.timing(anim, {
                toValue: 0,
                duration: 140,
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
        outputRange: [0.96, 1],
    });

    const containerTranslateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 0],
    });

    return (
        <Modal
            visible={mounted}
            transparent
            animationType="none" // ✅ tự animate bằng Animated
            onRequestClose={onRequestClose}
        >
            <Animated.View
                style={[styles.overlay, { opacity: overlayOpacity }]}
            >
                {/* Backdrop bắt tap để đóng */}
                <TouchableWithoutFeedback onPress={onRequestClose}>
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
