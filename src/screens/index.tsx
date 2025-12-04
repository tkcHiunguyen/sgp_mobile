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

// Thêm thuộc tính `isReady` vào các tính năng
const features = [
    {
        id: "scan",
        title: "Quét mã QR",
        icon: "qr-code-outline",
        route: "Scanner",
        isReady: true, // Đã sẵn sàng
    },
    {
        id: "device",
        title: "Quản lý thiết bị",
        icon: "server-outline",
        route: "Devices",
        isReady: true, // Chưa sẵn sàng
    },
    {
        id: "history",
        title: "Lịch sử",
        icon: "time-outline",
        route: "History",
        isReady: true, // Đã sẵn sàng
    },
    {
        id: "tools",
        title: "Công cụ",
        icon: "construct-outline",
        route: "Tools",
        isReady: false, // Đã sẵn sàng
    },
    {
        id: "info",
        title: "Thông tin",
        icon: "information-circle-outline",
        route: "Info",
        isReady: true, // Đã sẵn sàng
    },
    {
        id: "database",
        title: "Cơ sở dữ liệu",
        icon: "analytics-outline",
        route: "Database",
        isReady: false, // Chưa sẵn sàng
    },
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
        if (item.isReady) {
            navigation.navigate(item.route);
        }
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={{
                borderRadius: 20,
                overflow: "hidden",
                width: "48%",
                backgroundColor: item.isReady ? "#1E293B" : "#333", 
                opacity: item.isReady ? 1 : 0.5, 
            }}
            disabled={!item.isReady}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <LinearGradient
                    colors={["#1E293B", "#0F172A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.tile,
                        {
                            borderColor: item.isReady
                                ? "rgba(78,168,255,0.15)"
                                : "#555", // Đổi màu viền tùy vào trạng thái
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={item.icon}
                            size={28}
                            color={item.isReady ? "#4EA8FF" : "#B0B0B0"}
                        />
                    </View>
                    <Text
                        style={[
                            styles.tileText,
                            { color: item.isReady ? "#BBDFFF" : "#B0B0B0" },
                        ]}
                    >
                        {item.title}
                    </Text>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
}

export default function IndexScreen() {
    return (
        <View style={styles.container}>
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
        backgroundColor: "#0A0F1C",
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: "900",
        color: "#E0F2FF",
        marginBottom: 30,
        textAlign: "center",
        letterSpacing: 1,
        textShadowColor: "rgba(78,168,255,0.6)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    content: { paddingBottom: 80 },
    row: { justifyContent: "space-between", marginBottom: 28 },
    tile: {
        paddingVertical: 24,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4EA8FF",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: "rgba(78,168,255,0.15)",
    },
    iconContainer: {
        backgroundColor: "rgba(78,168,255,0.1)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(78,168,255,0.2)",
    },
    tileText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#BBDFFF",
        letterSpacing: 0.4,
    },
});
