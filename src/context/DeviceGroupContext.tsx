import React, { createContext, useState, useContext, useCallback } from "react";
import {
    storage,
    getApiBase,
    getSheetId,
    KEY_ALL_DATA,
} from "../config/apiConfig";

interface DeviceGroupContextType {
    deviceGroups: any[];
    setDeviceGroups: (groups: any[]) => void;

    isDataFromCache: boolean;
    setIsDataFromCache: (fromCache: boolean) => void;

    isSyncing: boolean;
    refreshAllData: () => Promise<void>;
    appendHistoryAndSync: (args: {
        sheetName: string; // tên group (ví dụ "PM5")
        row: { deviceName: string; date: string; content: string };
    }) => Promise<void>;
}

const DeviceGroupContext = createContext<DeviceGroupContextType | null>(null);

export const useDeviceGroup = () => {
    const ctx = useContext(DeviceGroupContext);
    if (!ctx) {
        throw new Error(
            "useDeviceGroup must be used inside DeviceGroupProvider"
        );
    }
    return ctx;
};

export const DeviceGroupProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [deviceGroups, setDeviceGroups] = useState<any[]>([]);
    const [isDataFromCache, setIsDataFromCache] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const refreshAllData = useCallback(async () => {
        if (isSyncing) return;

        console.log("🔄 [SYNC] BẮT ĐẦU tải dữ liệu mới...");
        const start = Date.now();

        try {
            setIsSyncing(true);

            const apiBase = getApiBase();
            const sheetId = getSheetId();

            const res = await fetch(
                `${apiBase}?action=getAllData&sheetId=${encodeURIComponent(
                    sheetId
                )}`,
                { method: "GET" }
            );

            const result = await res.json();
            console.log("📌 [SYNC] Raw result:", result);

            const allData = result.data ?? [];

            storage.set(KEY_ALL_DATA, JSON.stringify(allData));
            setDeviceGroups(allData);
            setIsDataFromCache(false);

            console.log(`✅ [SYNC] HOÀN TẤT (mất ${Date.now() - start}ms)`);
        } catch (err) {
            console.error("❌ [SYNC] Lỗi khi đồng bộ:", err);
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    const appendHistoryAndSync = useCallback(
        async (args: {
            sheetName: string;
            row: { deviceName: string; date: string; content: string };
        }) => {
            const { sheetName, row } = args;

            // 1) Update UI ngay lập tức
            setDeviceGroups((prev) => {
                const next = prev.map((g) => {
                    if (g.table !== sheetName) return g;

                    const oldHistoryRows = (g.history?.rows ?? []) as any[];

                    // prepend để thấy ngay dòng mới nhất
                    const newHistoryRows = [row, ...oldHistoryRows];

                    return {
                        ...g,
                        history: {
                            ...(g.history ?? {
                                headers: ["deviceName", "date", "content"],
                            }),
                            rows: newHistoryRows,
                        },
                    };
                });

                // ✅ cập nhật cache ngay sau khi đã có next
                // (lưu ý: storage.set nên dùng ngay ở đây vì next đã là mảng mới)
                storage.set(KEY_ALL_DATA, JSON.stringify(next));
                return next;
            });

            // 2) Sync ngay với server để đảm bảo chuẩn (đặc biệt nếu server format ngày khác)
            await refreshAllData();
        },
        [refreshAllData]
    );

    const value: DeviceGroupContextType = {
        deviceGroups,
        setDeviceGroups,
        isDataFromCache,
        setIsDataFromCache,
        isSyncing,
        refreshAllData,
        appendHistoryAndSync, // ✅
    };

    return (
        <DeviceGroupContext.Provider value={value}>
            {children}
        </DeviceGroupContext.Provider>
    );
};

