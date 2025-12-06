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
                {
                    method: "GET",
                }
            );

            const result = await res.json();
            console.log("📌 [SYNC] Raw result:", result);

            const totalTable = result.totalTable ?? 0;
            const validTable = result.validTable ?? [];
            const errTable = result.errTable ?? [];

            const allData = result.data ?? [];

            console.log("📌 [SYNC] allData:", allData);
            console.log("🔎 [SYNC] Meta:", {
                totalTable,
                validTable,
                errTable,
            });

            storage.set(KEY_ALL_DATA, JSON.stringify(allData));
            // OPTIONAL: lưu meta
            // storage.set(KEY_TABLE_META, JSON.stringify({ totalTable, validTable, errTable }));

            setDeviceGroups(allData);
            setIsDataFromCache(false);

            const ms = Date.now() - start;
            console.log(`✅ [SYNC] HOÀN TẤT (mất ${ms}ms)`);
        } catch (err) {
            console.error("❌ [SYNC] Lỗi khi đồng bộ:", err);
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    const value: DeviceGroupContextType = {
        deviceGroups,
        setDeviceGroups,

        isDataFromCache,
        setIsDataFromCache,

        isSyncing,
        refreshAllData,
    };

    return (
        <DeviceGroupContext.Provider value={value}>
            {children}
        </DeviceGroupContext.Provider>
    );
};
