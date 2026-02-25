// src/services/otaService.ts
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import {
    API_BASE_URL,
    OTA_SIGNATURE_DEFAULT_KEY_ID,
    OTA_SIGNATURE_PUBLIC_KEYS,
    OTA_SIGNATURE_REQUIRED,
} from "../config/apiConfig";

export type OtaInfo = {
    version: string;
    changelog?: string;
    file: string;
    createdAt: string;
    downloadUrl: string;
    sha256?: string;
    sizeBytes?: number | string;
    sig?: string;
    signature?: string;
    keyId?: string;
    signedPayload?: string;
};

export type OtaErrorKind =
    | "NETWORK"
    | "HTTP"
    | "PLATFORM"
    | "DOWNLOAD"
    | "VERIFY"
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

const APK_PREFIX = "sgp-app-v";
const APK_CLEAN_REGEX = /(sgp-app-v|app-v).*\.apk$/i;

function normalizeSha256(input: string): string {
    const raw = String(input || "")
        .trim()
        .toLowerCase()
        .replace(/^sha256:/, "");

    if (!/^[a-f0-9]{64}$/.test(raw)) {
        throw new OtaError(
            "VERIFY",
            "Checksum SHA-256 không hợp lệ từ server OTA."
        );
    }

    return raw;
}

function normalizeBase64(input: string): string {
    return String(input || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");
}

function utf8Encode(value: string): Uint8Array {
    if (typeof TextEncoder !== "undefined") {
        return new TextEncoder().encode(value);
    }

    const encoded = encodeURIComponent(value);
    const out: number[] = [];

    for (let i = 0; i < encoded.length; i++) {
        if (encoded[i] === "%") {
            const hex = encoded.slice(i + 1, i + 3);
            out.push(parseInt(hex, 16));
            i += 2;
        } else {
            out.push(encoded.charCodeAt(i));
        }
    }

    return new Uint8Array(out);
}

function manualBase64Decode(base64: string): Uint8Array {
    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = normalizeBase64(base64).replace(/=+$/, "");

    const bytes: number[] = [];
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < clean.length; i++) {
        const idx = alphabet.indexOf(clean[i]);
        if (idx < 0) throw new OtaError("VERIFY", "Chữ ký base64 không hợp lệ.");

        buffer = (buffer << 6) | idx;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >> bits) & 0xff);
        }
    }

    return new Uint8Array(bytes);
}

function base64ToBytes(base64: string): Uint8Array {
    const clean = normalizeBase64(base64);
    const atobFn = (globalThis as any)?.atob;

    if (typeof atobFn === "function") {
        try {
            const binary = atobFn(clean);
            const out = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                out[i] = binary.charCodeAt(i);
            }
            return out;
        } catch {
            return manualBase64Decode(clean);
        }
    }

    return manualBase64Decode(clean);
}

function pemToSpkiDerBytes(pem: string): Uint8Array {
    const body = String(pem || "")
        .replace(/-----BEGIN PUBLIC KEY-----/g, "")
        .replace(/-----END PUBLIC KEY-----/g, "")
        .replace(/\s+/g, "");

    if (!body) {
        throw new OtaError("VERIFY", "Public key OTA không hợp lệ.");
    }

    return base64ToBytes(body);
}

function toExactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
}

async function verifyRsaPkcs1Sha256Signature(args: {
    payload: string;
    signatureBase64: string;
    publicKeyPem: string;
}) {
    const subtle = (globalThis as any)?.crypto?.subtle;
    if (!subtle) {
        throw new OtaError(
            "VERIFY",
            "Thiết bị không hỗ trợ verify chữ ký (WebCrypto)."
        );
    }

    const keyDer = pemToSpkiDerBytes(args.publicKeyPem);
    const key = await subtle.importKey(
        "spki",
        toExactArrayBuffer(keyDer),
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["verify"]
    );

    const payloadBytes = utf8Encode(args.payload);
    const sigBytes = base64ToBytes(args.signatureBase64);

    const ok = await subtle.verify(
        "RSASSA-PKCS1-v1_5",
        key,
        toExactArrayBuffer(sigBytes),
        toExactArrayBuffer(payloadBytes)
    );

    if (!ok) {
        throw new OtaError("VERIFY", "Chữ ký OTA không hợp lệ.");
    }
}

function parseExpectedSize(sizeBytes: OtaInfo["sizeBytes"]): number | null {
    if (sizeBytes === null || sizeBytes === undefined || sizeBytes === "") {
        return null;
    }

    const n = Number(sizeBytes);
    if (!Number.isFinite(n) || n <= 0) {
        throw new OtaError(
            "VERIFY",
            "sizeBytes từ server OTA không hợp lệ."
        );
    }

    return Math.floor(n);
}

function getSignatureFromOta(ota: OtaInfo): string {
    return String(ota.sig || ota.signature || "").trim();
}

function buildDefaultSignedPayload(args: {
    ota: OtaInfo;
    normalizedSha256: string;
    actualSizeBytes: number;
}) {
    const { ota, normalizedSha256, actualSizeBytes } = args;

    return [
        String(ota.version || "").trim(),
        String(ota.file || "").trim(),
        normalizedSha256,
        String(actualSizeBytes),
    ].join("|");
}

async function verifyDownloadedApk(localPath: string, ota: OtaInfo) {
    if (!ota.sha256) {
        throw new OtaError(
            "VERIFY",
            "Thiếu checksum SHA-256 từ server OTA. Từ chối cài đặt để đảm bảo an toàn."
        );
    }

    const expectedSha256 = normalizeSha256(ota.sha256);

    let actualSha256 = "";
    try {
        actualSha256 = normalizeSha256(await RNFS.hash(localPath, "sha256"));
    } catch (err) {
        console.log("❌ OTA hash error:", err);
        throw new OtaError(
            "VERIFY",
            "Không thể tính checksum file APK sau khi tải."
        );
    }

    if (actualSha256 !== expectedSha256) {
        throw new OtaError(
            "VERIFY",
            "Checksum APK không khớp. File có thể bị lỗi hoặc bị thay đổi."
        );
    }

    let actualSize = 0;
    try {
        const stat = await RNFS.stat(localPath);
        actualSize = Number(stat.size || 0);
    } catch (err) {
        console.log("❌ OTA stat error:", err);
        throw new OtaError("VERIFY", "Không đọc được kích thước file APK đã tải.");
    }

    const expectedSize = parseExpectedSize(ota.sizeBytes);
    if (expectedSize != null && expectedSize !== actualSize) {
        throw new OtaError(
            "VERIFY",
            `Kích thước APK không khớp (expected ${expectedSize}, actual ${actualSize}).`
        );
    }

    const signature = getSignatureFromOta(ota);
    const shouldVerifySignature = OTA_SIGNATURE_REQUIRED || signature.length > 0;

    if (!shouldVerifySignature) {
        return;
    }

    if (!signature) {
        throw new OtaError(
            "VERIFY",
            "Thiếu chữ ký OTA trong metadata trong khi cấu hình yêu cầu verify chữ ký."
        );
    }

    const keyId = String(ota.keyId || OTA_SIGNATURE_DEFAULT_KEY_ID).trim();
    const publicKeyPem = OTA_SIGNATURE_PUBLIC_KEYS[keyId];

    if (!publicKeyPem) {
        throw new OtaError(
            "VERIFY",
            `Không tìm thấy public key cho keyId='${keyId}'.`
        );
    }

    const payload =
        String(ota.signedPayload || "").trim() ||
        buildDefaultSignedPayload({
            ota,
            normalizedSha256: actualSha256,
            actualSizeBytes: actualSize,
        });

    await verifyRsaPkcs1Sha256Signature({
        payload,
        signatureBase64: signature,
        publicKeyPem,
    });
}

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

    const fileName =
        ota.file && ota.file.trim().length > 0
            ? ota.file.trim()
            : `${APK_PREFIX}${ota.version}.apk`;

    const downloadsDir = RNFS.DownloadDirectoryPath;

    // 1) Delete old APK files from Download + subfolders.
    try {
        const scanDir = async (dir: string): Promise<RNFS.ReadDirItem[]> => {
            let collected: RNFS.ReadDirItem[] = [];

            try {
                const list = await RNFS.readDir(dir);

                for (const item of list) {
                    if (item.isFile()) {
                        if (APK_CLEAN_REGEX.test(item.name)) {
                            collected.push(item);
                        }
                    } else if (item.isDirectory()) {
                        const deeper = await scanDir(item.path);
                        collected = collected.concat(deeper);
                    }
                }
            } catch (err) {
                console.log("⚠️ [OTA] Không đọc được thư mục:", dir, err);
            }

            return collected;
        };

        const rootFiles = await RNFS.readDir(downloadsDir);
        console.log(
            "📂 [OTA] Files trong Download (root):",
            rootFiles.map((f) => ({
                name: f.name,
                isFile: f.isFile(),
                path: f.path,
            }))
        );

        const oldApks = await scanDir(downloadsDir);

        if (oldApks.length > 0) {
            console.log(
                "🧹 [OTA] Xoá APK cũ tìm thấy:",
                oldApks.map((f) => f.path)
            );
        } else {
            console.log("🧹 [OTA] Không tìm thấy APK cũ để xoá.");
        }

        for (const f of oldApks) {
            try {
                await RNFS.unlink(f.path);
                console.log("✅ [OTA] Đã xoá:", f.path);
            } catch (err) {
                console.log("⚠️ [OTA] Không xoá được file:", f.path, err);
            }
        }
    } catch (err) {
        console.log("⚠️ [OTA] Lỗi khi xử lý xoá file APK cũ:", err);
    }

    const localPath = `${downloadsDir}/${fileName}`;

    console.log("⬇️ OTA download from:", downloadUrl);
    console.log("📁 OTA save to:", localPath);

    let result: RNFS.DownloadResult;

    try {
        const task = RNFS.downloadFile({
            fromUrl: downloadUrl,
            toFile: localPath,
            progress: (data) => {
                if (opts?.onProgress && data.contentLength > 0) {
                    const fraction = data.bytesWritten / data.contentLength;
                    opts.onProgress(fraction);
                }
            },
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

    await verifyDownloadedApk(localPath, ota);

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
