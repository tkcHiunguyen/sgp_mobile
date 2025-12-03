import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext<any>(null);

const API_URL =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec?action=getalltables";

export function DataProvider({ children }: any) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const res = await fetch(API_URL);
            const json = await res.json();
            console.log("📡 Loaded data:", json);
            setData(json);
        } catch (err) {
            console.error("❌ Load failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ data, loading }}>
            {children}
        </DataContext.Provider>
    );
}
