import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";

const API_URL =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec?action=getalltables";

const DatabaseScreen = () => {
    const [tables, setTables] = useState<string[]>([]);

    // Fetch danh sách các bảng
    const fetchTables = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            console.log("Danh sách bảng:", data);
            setTables(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    // Render mỗi thẻ
    const renderTableCard = (tableName: string) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                console.log("Bạn đã chọn bảng:", tableName);
            }}
        >
            <Text style={styles.cardText}>{tableName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Danh sách bảng</Text>

            <FlatList
                data={tables}
                keyExtractor={(item, index) => item + "_" + index}
                renderItem={({ item }) => renderTableCard(item)}
                numColumns={2}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 20,
        backgroundColor: "#1E293B",
    },
    header: {
        fontSize: 24,
        color: "#E0F2FF",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#334155",
        padding: 15,
        margin: 10,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
    },
    cardText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    row: {
        justifyContent: "space-between",
    },
});

export default DatabaseScreen;
