import React, { createContext, useState, useContext, useCallback } from "react";
import { createMMKV } from "react-native-mmkv";

const API_BASE =
    "https://script.google.com/macros/s/AKfycbwUEEm_Eo30rDi-v-9O3V1vhel8eztYhgAkcU6jj-MfS7syQPBb4BrNYJMcsy9OSMQ/exec";

const MMKV = createMMKV();

// ----------- KIỂU DỮ LIỆU CHO CONTEXT -----------
interface DeviceGroupContextType {
    deviceGroups: any[];
    setDeviceGroups: (groups: any[]) => void;

    loadingDeviceGroups: boolean;
    fetchDeviceGroups: () => Promise<void>;

    selectedDeviceName: string | null;
    maintenanceHistory: any[];
    loadingMaintenanceHistory: boolean;
    fetchMaintenanceHistory: (deviceName: string) => Promise<void>;

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
    const [loadingDeviceGroups, setLoadingDeviceGroups] = useState(false);

    const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(
        null
    );
    const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
    const [loadingMaintenanceHistory, setLoadingMaintenanceHistory] =
        useState(false);

    const [isDataFromCache, setIsDataFromCache] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const fetchDeviceGroups = useCallback(async () => {
        if (loadingDeviceGroups) return;

        try {
            setLoadingDeviceGroups(true);
            const res = await fetch(`${API_BASE}?action=getalltables`);
            const json = await res.json();
            setDeviceGroups(json);
            // Có thể coi đây là dữ liệu mới
            setIsDataFromCache(false);
        } catch (err) {
            console.error("❌ Error fetching device groups:", err);
        } finally {
            setLoadingDeviceGroups(false);
        }
    }, [loadingDeviceGroups]);

    const fetchMaintenanceHistory = useCallback(async (deviceName: string) => {
        try {
            setSelectedDeviceName(deviceName);
            setLoadingMaintenanceHistory(true);
            setMaintenanceHistory([]);

            const res = await fetch(
                `${API_BASE}?action=getMaintenanceHistory&device_name=${encodeURIComponent(
                    deviceName
                )}`
            );
            const json = await res.json();

            if (json.error) {
                console.error("❌ Lỗi khi lấy lịch sử:", json.message);
                return;
            }

            const sorted = json.rows.sort(
                (a: any, b: any) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setMaintenanceHistory(sorted);
        } catch (err) {
            console.error("❌ Error fetching history:", err);
        } finally {
            setLoadingMaintenanceHistory(false);
        }
    }, []);

    const refreshAllData = useCallback(async () => {
        if (isSyncing) return;

        console.log("🔄 [SYNC] BẮT ĐẦU tải dữ liệu mới...");

        const start = Date.now();

        try {
            setIsSyncing(true);

            const res = await fetch(`${API_BASE}?action=getAllData`);
            const allData = await res.json();

            MMKV.set("allData", JSON.stringify(allData));
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

        loadingDeviceGroups,
        fetchDeviceGroups,

        selectedDeviceName,
        maintenanceHistory,
        loadingMaintenanceHistory,
        fetchMaintenanceHistory,

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
