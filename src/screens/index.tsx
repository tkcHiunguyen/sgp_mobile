import React, { useRef, useMemo } from "react";
import {
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { useAuth } from "../context/AuthContext";
import DataSyncIndicator from "../components/DataSyncIndicator";
import { AppScreen } from "../components/ui/AppScreen";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { colors } from "../theme/theme";
type FeaturesArray = ReturnType<typeof getFeatures>;
type FeatureItem = FeaturesArray[number];
// ====== HÀM TEST THÔNG BÁO ======
async function triggerTestNotification() {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
        id: "test-channel",
        name: "Test Channel",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: "🔔 Test thông báo",
        body: "Nếu bạn thấy cái này thì Notifee đã hoạt động!",
        android: {
            channelId,
            smallIcon: "ic_launcher",
        },
    });
}

// ====== DANH SÁCH CHỨC NĂNG ======
const getFeatures = (isAdmin: boolean) =>
    [
        {
            id: "scan",
            title: "Quét mã QR",
            icon: "qr-code-outline",
            route: "Scanner",
            isReady: true,
        },
        {
            id: "device",
            title: "Quản lý thiết bị",
            icon: "server-outline",
            route: "Devices",
            isReady: true,
        },
        {
            id: "history",
            title: "Lịch sử",
            icon: "time-outline",
            route: "History",
            isReady: true,
        },
        {
            id: "tools",
            title: "Công cụ",
            icon: "construct-outline",
            route: "Tools",
            isReady: false,
        },
        {
            id: "info",
            title: "Thông tin",
            icon: "information-circle-outline",
            route: "Info",
            isReady: true,
        },
        {
            id: "database",
            title: "Cơ sở dữ liệu",
            icon: "analytics-outline",
            route: "Database",
            isReady: false,
        },

        ...(isAdmin
            ? [
                  {
                      id: "admin-users",
                      title: "Quản trị Users",
                      icon: "people-outline",
                      route: "AdminUsers",
                      isReady: true,
                  },
              ]
            : []),

        {
            id: "settings",
            title: "Cài đặt",
            icon: "settings-outline",
            route: "Settings",
            isReady: true,
        },
        {
            id: "me",
            title: "Tài khoản",
            icon: "person-circle-outline",
            route: "Me",
            isReady: true,
        },
    ] as const;

function FeatureTile({ item }: { item: FeatureItem }) {
    const navigation = useNavigation<any>();
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.97,
            friction: 4,
            tension: 150,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 150,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (!item.isReady) return;

        // if (item.id === "test-noti") {
        //     triggerTestNotification();
        //     return;
        // }

        if (item.route) {
            navigation.navigate(item.route);
        }
    };

    const borderColor = item.isReady
        ? "rgba(59,130,246,0.4)"
        : "rgba(75,85,99,0.8)";
    const iconColor = item.isReady ? "#60A5FA" : "#6B7280";
    const textColor = item.isReady ? colors.text : colors.textMuted;

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={styles.tileWrapper}
            disabled={!item.isReady}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <LinearGradient
                    colors={[colors.surface, colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.tile,
                        {
                            borderColor,
                            opacity: item.isReady ? 1 : 0.5,
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={item.icon}
                            size={26}
                            color={iconColor}
                        />
                    </View>
                    <Text style={[styles.tileText, { color: textColor }]}>
                        {item.title}
                    </Text>
                    {!item.isReady && (
                        <Text style={styles.badgeText}>Sắp ra mắt</Text>
                    )}
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
}

export default function IndexScreen() {
    const { user } = useAuth() as any; // bạn chỉnh type nếu AuthContext đã có type
    const isAdmin = String(user?.role || "").toLowerCase() === "administrator";

    const features = useMemo(() => getFeatures(isAdmin), [isAdmin]);

    return (
        <AppScreen topPadding={0}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <DataSyncIndicator inline />
                </View>
                <ScreenTitle>Industrial Manager</ScreenTitle>
            </View>

            <FlatList
                data={features}
                renderItem={({ item }) => <FeatureTile item={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        marginBottom: 8,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 4,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
        paddingTop: 4,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 18,
    },
    tileWrapper: {
        flexBasis: "48%",
    },
    tile: {
        minHeight: 120,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        paddingVertical: 18,
        paddingHorizontal: 10,
    },
    iconContainer: {
        backgroundColor: "rgba(37,99,235,0.12)",
        padding: 10,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.4)",
    },
    tileText: {
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.4,
        textAlign: "center",
    },
    badgeText: {
        marginTop: 4,
        fontSize: 11,
        color: "#FBBF24",
    },
});
