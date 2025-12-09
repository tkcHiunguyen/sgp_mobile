import React from "react";
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
import DataSyncIndicator from "../components/DataSyncIndicator";
import notifee, { AndroidImportance } from "@notifee/react-native";

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
const features = [
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
    {
        id: "settings",
        title: "Cài đặt",
        icon: "settings-outline",
        route: "Settings",
        isReady: true,
    },
    // {
    //     id: "test-noti",
    //     title: "Test thông báo",
    //     icon: "notifications-outline",
    //     route: null,
    //     isReady: true,
    // },
] as const;

type FeatureItem = (typeof features)[number];

function FeatureTile({ item }: { item: FeatureItem }) {
    const navigation = useNavigation<any>();
    const scale = React.useRef(new Animated.Value(1)).current;

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

        if (item.id === "test-noti") {
            triggerTestNotification();
            return;
        }

        if (item.route) {
            navigation.navigate(item.route);
        }
    };

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
                    colors={["#0F172A", "#020617"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.tile,
                        {
                            borderColor: item.isReady
                                ? "rgba(59,130,246,0.4)"
                                : "rgba(75,85,99,0.8)",
                            opacity: item.isReady ? 1 : 0.5,
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={item.icon}
                            size={26}
                            color={item.isReady ? "#60A5FA" : "#6B7280"}
                        />
                    </View>
                    <Text
                        style={[
                            styles.tileText,
                            { color: item.isReady ? "#E5F2FF" : "#9CA3AF" },
                        ]}
                    >
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
    return (
        <View style={styles.container}>
            <DataSyncIndicator />
            <Text style={styles.header}>Industrial Manager</Text>

            <FlatList
                data={features}
                renderItem={({ item }) => <FeatureTile item={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: "900",
        color: "#E5F2FF",
        marginBottom: 24,
        textAlign: "center",
        letterSpacing: 0.8,
    },
    content: {
        paddingBottom: 80,
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
