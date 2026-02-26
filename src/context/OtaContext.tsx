// src/context/OtaContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";

import { storage, VERSION as BUILD_VERSION } from "../config/apiConfig";
import { downloadAndInstallApk, type OtaInfo } from "../services/otaService";

const KEY_APP_VERSION = "APP_VERSION";

interface OtaContextValue {
    appVersion: string; // phiên bản đã cài (MMKV)
    buildVersion: string; // VERSION build đang chạy
    isDownloading: boolean;
    downloadProgress: number | null; // 0 - 100
    startDownload: (ota: OtaInfo) => Promise<void>;
}

const OtaContext = createContext<OtaContextValue | undefined>(undefined);

export const OtaProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [appVersion, setAppVersion] = useState<string>(BUILD_VERSION);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(
        null
    );

    const downloadingRef = useRef(false);

    // đọc version từ MMKV
    useEffect(() => {
        try {
            const stored =
                typeof storage.getString === "function"
                    ? storage.getString(KEY_APP_VERSION)
                    : null;

            if (stored && typeof stored === "string") {
                setAppVersion(stored);
            } else {
                setAppVersion(BUILD_VERSION);
            }
        } catch (e) {
            console.warn("Không đọc được APP_VERSION từ storage:", e);
            setAppVersion(BUILD_VERSION);
        }
    }, []);

    const startDownload = useCallback(async (ota: OtaInfo) => {
        if (downloadingRef.current) {
            // đang tải rồi thì bỏ qua
            return;
        }

        downloadingRef.current = true;
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            await downloadAndInstallApk(ota, {
                onProgress: (fraction: number) => {
                    const percent = Math.round(fraction * 100);
                    setDownloadProgress(percent);
                },
            });

            try {
                // @ts-ignore tùy setup storage
                if (typeof storage.set === "function") {
                    storage.set(KEY_APP_VERSION, ota.version);
                }
                setAppVersion(ota.version);
            } catch (e) {
                console.warn("Không lưu được APP_VERSION:", e);
            }
        } finally {
            downloadingRef.current = false;
            setIsDownloading(false);
            setDownloadProgress(null);
        }
    }, []);

    return (
        <OtaContext.Provider
            value={{
                appVersion,
                buildVersion: BUILD_VERSION,
                isDownloading,
                downloadProgress,
                startDownload,
            }}
        >
            {children}
        </OtaContext.Provider>
    );
};

export const useOta = () => {
    const ctx = useContext(OtaContext);
    if (!ctx) {
        throw new Error("useOta must be used inside OtaProvider");
    }
    return ctx;
};
