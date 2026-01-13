// src/utils/historyAdd.ts
export type HistoryRow = {
    deviceName: string;
    date: string; // dd-MM-yy
    content: string;
};

export const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const todayDdMmYy = (now = new Date()) => {
    const dd = pad2(now.getDate());
    const mm = pad2(now.getMonth() + 1);
    const yy = pad2(now.getFullYear() % 100);
    return `${dd}-${mm}-${yy}`;
};

export const isValidDdMmYy = (value: string) => {
    const m = value.match(/^\d{2}-\d{2}-\d{2}$/);
    if (!m) return false;

    const [dd, mm, yy] = value.split("-").map((x) => parseInt(x, 10));
    if (!dd || !mm) return false;
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;

    const year = 2000 + yy;
    const dt = new Date(year, mm - 1, dd);
    return (
        dt.getFullYear() === year &&
        dt.getMonth() === mm - 1 &&
        dt.getDate() === dd
    );
};

export async function postAppendHistoryToAppScript(args: {
    appScriptUrl: string;
    sheetId: string;
    sheetName: string;
    row: HistoryRow;
}): Promise<{ ok: true } | { ok: false; message: string }> {
    const { appScriptUrl, sheetId, sheetName, row } = args;

    const url = (appScriptUrl || "").trim();
    if (!url) return { ok: false, message: "Thiếu appScriptUrl" };
    if (!sheetId) return { ok: false, message: "Thiếu sheetId" };
    if (!sheetName) return { ok: false, message: "Thiếu sheetName" };

    const payload = {
        action: "appendHistory",
        sheetId,
        sheetName,
        deviceName: row.deviceName,
        date: row.date,
        content: row.content,
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const text = await res.text();

        let data: any = null;
        try {
            data = JSON.parse(text);
        } catch {
            // ignore
        }

        if (!res.ok) {
            return {
                ok: false,
                message:
                    (data && (data.message || data.error)) ||
                    `HTTP ${res.status}: ${text}`,
            };
        }

        if (data && data.error) {
            return { ok: false, message: data.message || "Server error" };
        }

        return { ok: true };
    } catch (e: any) {
        return { ok: false, message: e?.message || "Network error" };
    }
}
