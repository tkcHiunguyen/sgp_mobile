import {
    isValidDdMmYy,
    todayDdMmYy,
    postAppendHistoryToAppScript,
} from "../historyAdd";

describe("historyAdd utils", () => {
    describe("isValidDdMmYy", () => {
        test("valid date", () => {
            expect(isValidDdMmYy("05-01-26")).toBe(true);
        });

        test("invalid format", () => {
            expect(isValidDdMmYy("2026-01-05")).toBe(false);
            expect(isValidDdMmYy("aa-bb-cc")).toBe(false);
            expect(isValidDdMmYy(" 05-01-26 ")).toBe(false); 
        });

        test("bounds", () => {
            expect(isValidDdMmYy("00-01-26")).toBe(false);
            expect(isValidDdMmYy("32-01-26")).toBe(false);
            expect(isValidDdMmYy("01-00-26")).toBe(false);
            expect(isValidDdMmYy("01-13-26")).toBe(false);
        });

        test("impossible date", () => {
            expect(isValidDdMmYy("31-02-26")).toBe(false);
        });

        test("leap year", () => {
            expect(isValidDdMmYy("29-02-24")).toBe(true); 
            expect(isValidDdMmYy("29-02-23")).toBe(false); 
        });
    });

    describe("todayDdMmYy", () => {
        test("formats fixed date", () => {
            const d = new Date(2026, 0, 5);
            expect(todayDdMmYy(d)).toBe("05-01-26");
        });

        test("pads day/month", () => {
            const d = new Date(2026, 1, 1); // 01-02-26
            expect(todayDdMmYy(d)).toBe("01-02-26");
        });
    });

    describe("postAppendHistoryToAppScript", () => {
        const row = { deviceName: "X", date: "05-01-26", content: "abc" };

        beforeEach(() => {
            global.fetch = jest.fn();
        });

        test("validates missing appScriptUrl/sheetId/sheetName", async () => {
            expect(
                await postAppendHistoryToAppScript({
                    appScriptUrl: "",
                    sheetId: "1",
                    sheetName: "HISTORY",
                    row,
                })
            ).toEqual({ ok: false, message: "Thiếu appScriptUrl" });

            expect(
                await postAppendHistoryToAppScript({
                    appScriptUrl: "https://example.com",
                    sheetId: "",
                    sheetName: "HISTORY",
                    row,
                })
            ).toEqual({ ok: false, message: "Thiếu sheetId" });

            expect(
                await postAppendHistoryToAppScript({
                    appScriptUrl: "https://example.com",
                    sheetId: "1",
                    sheetName: "",
                    row,
                })
            ).toEqual({ ok: false, message: "Thiếu sheetName" });
        });

        test("calls fetch with correct payload (trims URL)", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                text: async () => JSON.stringify({}),
            });

            const r = await postAppendHistoryToAppScript({
                appScriptUrl: "   https://example.com   ",
                sheetId: "SID",
                sheetName: "SHEET",
                row,
            });

            expect(r).toEqual({ ok: true });

            expect(global.fetch).toHaveBeenCalledTimes(1);
            const [url, init] = (global.fetch as jest.Mock).mock.calls[0];

            expect(url).toBe("https://example.com");
            expect(init.method).toBe("POST");
            expect(init.headers).toEqual({
                "Content-Type": "application/json",
            });

            const body = JSON.parse(init.body);
            expect(body).toMatchObject({
                action: "appendHistory",
                sheetId: "SID",
                sheetName: "SHEET",
                deviceName: "X",
                date: "05-01-26",
                content: "abc",
            });
        });

        test("returns ok:false when HTTP not ok and JSON has message", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => JSON.stringify({ message: "bad request" }),
            });

            const r = await postAppendHistoryToAppScript({
                appScriptUrl: "https://example.com",
                sheetId: "1",
                sheetName: "HISTORY",
                row,
            });

            expect(r).toEqual({ ok: false, message: "bad request" });
        });

        test("returns ok:false when HTTP not ok and response is not JSON", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => "server down",
            });

            const r = await postAppendHistoryToAppScript({
                appScriptUrl: "https://example.com",
                sheetId: "1",
                sheetName: "HISTORY",
                row,
            });

            expect(r.ok).toBe(false);
            if (!r.ok) {
                expect(r.message).toContain("HTTP 500");
            }
        });

        test("returns ok:false when JSON has error flag", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                text: async () =>
                    JSON.stringify({ error: true, message: "Server error" }),
            });

            const r = await postAppendHistoryToAppScript({
                appScriptUrl: "https://example.com",
                sheetId: "1",
                sheetName: "HISTORY",
                row,
            });

            expect(r).toEqual({ ok: false, message: "Server error" });
        });

        test("returns ok:false on network error", async () => {
            (global.fetch as jest.Mock).mockRejectedValue(
                new Error("Network fail")
            );

            const r = await postAppendHistoryToAppScript({
                appScriptUrl: "https://example.com",
                sheetId: "1",
                sheetName: "HISTORY",
                row,
            });

            expect(r).toEqual({ ok: false, message: "Network fail" });
        });
    });
});
