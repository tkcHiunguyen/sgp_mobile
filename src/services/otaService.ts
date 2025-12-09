// src/services/otaService.ts
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import { API_BASE_URL } from "../config/apiConfig";

export type OtaInfo = {
    version: string;
    changelog?: string;
    file: string;
    createdAt: string;
    downloadUrl: string;
};

export type OtaErrorKind =
    | "NETWORK"
    | "HTTP"
    | "PLATFORM"
    | "DOWNLOAD"
    | "UNKNOWN";

export class OtaError extends Error {
    kind: OtaErrorKind;
    status?: number;

    constructor(kind: OtaErrorKind, message: string, status?: number) {
        super(message);
        this.kind = kind;
        this.status = status;
    }
}

export async function fetchLatestOta(): Promise<OtaInfo | null> {
    const base = API_BASE_URL.replace(/\/$/, "");
    const url = `${base}/ota/latest`;

    console.log("🔗 OTA check URL:", url);

    let res: Response;

    try {
        res = await fetch(url);
    } catch (err) {
        console.log("❌ fetchLatestOta network error:", err);
        throw new OtaError(
            "NETWORK",
            "Không kết nối được tới server OTA. Vui lòng kiểm tra lại Wi-Fi/4G hoặc địa chỉ server."
        );
    }

    if (!res.ok) {
        console.log("❌ fetchLatestOta HTTP status:", res.status);
        throw new OtaError(
            "HTTP",
            `Server OTA trả về lỗi HTTP ${res.status}.`,
            res.status
        );
    }

    try {
        const data = await res.json();
        if (!data.update) return null;
        return data as OtaInfo;
    } catch (err) {
        console.log("❌ fetchLatestOta parse error:", err);
        throw new OtaError(
            "UNKNOWN",
            "Dữ liệu OTA từ server không hợp lệ. Hãy kiểm tra lại API /ota/latest."
        );
    }
}

export function isNewerVersion(serverVersion: string, currentVersion: string) {
    const s = serverVersion.split(".").map((n) => parseInt(n, 10));
    const c = currentVersion.split(".").map((n) => parseInt(n, 10));

    const len = Math.max(s.length, c.length);
    for (let i = 0; i < len; i++) {
        const sv = s[i] || 0;
        const cv = c[i] || 0;
        if (sv > cv) return true;
        if (sv < cv) return false;
    }
    return false;
}

type DownloadOptions = {
    onProgress?: (fraction: number) => void;
};

export async function downloadAndInstallApk(
    ota: OtaInfo,
    opts?: DownloadOptions
) {
    if (Platform.OS !== "android") {
        throw new OtaError("PLATFORM", "OTA chỉ hỗ trợ Android.");
    }

    const base = API_BASE_URL.replace(/\/$/, "");
    const downloadUrl = ota.downloadUrl.startsWith("http")
        ? ota.downloadUrl
        : `${base}${ota.downloadUrl.startsWith("/") ? "" : "/"}${
              ota.downloadUrl
          }`;

    const fileName = ota.file || "update.apk";
    const localPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    console.log("⬇️ OTA download from:", downloadUrl);
    console.log("📁 OTA save to:", localPath);

    let result: RNFS.DownloadResult;

    try {
        const task = RNFS.downloadFile({
            fromUrl: downloadUrl,
            toFile: localPath,
            // 🆕 callback progress
            progress: (data) => {
                if (opts?.onProgress && data.contentLength > 0) {
                    const fraction = data.bytesWritten / data.contentLength;
                    opts.onProgress(fraction);
                }
            },
            // gọi progress mỗi ~5% để đỡ spam
            progressDivider: 5,
        });

        result = await task.promise;
    } catch (err) {
        console.log("❌ OTA download network error:", err);
        throw new OtaError(
            "NETWORK",
            "Không tải được file cập nhật từ server. Vui lòng kiểm tra lại kết nối mạng."
        );
    }

    console.log("📦 Download result:", result);

    if (result.statusCode !== 200) {
        throw new OtaError(
            "HTTP",
            `Tải file cập nhật thất bại (HTTP ${result.statusCode}).`,
            result.statusCode
        );
    }

    try {
        await FileViewer.open(localPath, {
            showOpenWithDialog: true,
        });
    } catch (err) {
        console.log("❌ OTA open file error:", err);
        throw new OtaError(
            "DOWNLOAD",
            "Tải xong nhưng không mở được file cài đặt. Hãy thử mở file APK trong thư mục Download."
        );
    }
}
