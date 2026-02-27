import { act, render, waitFor } from "@testing-library/react-native";
import React, { forwardRef, useImperativeHandle } from "react";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import {
    DeviceGroupProvider,
    useDeviceGroup,
} from "../src/context/DeviceGroupContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { useScannerDeviceLookup } from "../src/screens/scanner/hooks/useScannerDeviceLookup";

import type { HistoryRow, DeviceGroup } from "../src/types/deviceGroup";

type LoginResult = { ok: boolean; pending: boolean; message?: string };

type HarnessApi = {
    isReady: boolean;
    isAuthed: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    refreshAllData: () => Promise<void>;
    scanDevice: (value: string) => { groupName: string; history: HistoryRow[] } | null;
    getHistoryByDevice: (deviceName: string) => HistoryRow[];
    getGroupCount: () => number;
};

const WorkflowHarness = forwardRef<HarnessApi>((_, ref) => {
    const auth = useAuth();
    const { deviceGroups, refreshAllData } = useDeviceGroup();
    const { findDeviceInfo } = useScannerDeviceLookup(deviceGroups);

    useImperativeHandle(
        ref,
        () => ({
            isReady: !auth.loading,
            isAuthed: auth.isAuthed,
            login: auth.login,
            refreshAllData,
            scanDevice: findDeviceInfo,
            getHistoryByDevice: (deviceName: string) =>
                deviceGroups
                    .flatMap((group) => group.history?.rows ?? [])
                    .filter((row) => row.deviceName === deviceName),
            getGroupCount: () => deviceGroups.length,
        }),
        [auth.isAuthed, auth.loading, auth.login, deviceGroups, findDeviceInfo, refreshAllData]
    );

    return null;
});

WorkflowHarness.displayName = "WorkflowHarness";

const createResponse = (body: unknown): Response =>
    ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
        json: async () => body,
    }) as unknown as Response;

describe("critical path e2e", () => {
    it("login -> load data -> scan -> history", async () => {
        const sampleData: DeviceGroup[] = [
            {
                table: "PM5",
                devices: {
                    rows: [
                        {
                            id: 1,
                            name: "PM5-VFD-61-27002",
                            type: "Biến tần",
                            freq: "30",
                        },
                    ],
                },
                history: {
                    rows: [
                        {
                            deviceName: "PM5-VFD-61-27002",
                            date: "25-02-26",
                            content: "Kiểm tra định kỳ",
                        },
                        {
                            deviceName: "PM5-VFD-61-27002",
                            date: "10-02-26",
                            content: "Vệ sinh quạt làm mát",
                        },
                    ],
                },
            },
        ];

        const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            const method = String(init?.method || "GET").toUpperCase();

            if (method === "POST") {
                const body = JSON.parse(String(init?.body || "{}"));
                if (body.action === "auth_login") {
                    return createResponse({
                        ok: true,
                        token: "token-e2e",
                        expiresAt: "2099-01-01T00:00:00.000Z",
                        user: {
                            userId: "u-1",
                            username: "admin",
                            role: "administrator",
                        },
                    });
                }
            }

            if (method === "GET" && url.includes("action=getAllData")) {
                return createResponse({ data: sampleData });
            }

            throw new Error(`Unexpected request: ${method} ${url}`);
        });

        global.fetch = fetchMock as unknown as typeof global.fetch;

        const ref = React.createRef<HarnessApi>();

        render(
            <ThemeProvider>
                <AuthProvider>
                    <DeviceGroupProvider>
                        <WorkflowHarness ref={ref} />
                    </DeviceGroupProvider>
                </AuthProvider>
            </ThemeProvider>
        );

        await waitFor(() => {
            expect(ref.current?.isReady).toBe(true);
        });

        let loginResult: LoginResult | undefined;
        await act(async () => {
            loginResult = await ref.current!.login("admin", "123456");
        });

        expect(loginResult).toEqual({ ok: true, pending: false });
        expect(ref.current?.isAuthed).toBe(true);

        await act(async () => {
            await ref.current!.refreshAllData();
        });

        expect(ref.current?.getGroupCount()).toBe(1);

        const scan = ref.current!.scanDevice("PM5-VFD-61-27002");
        expect(scan?.groupName).toBe("PM5");
        expect(scan?.history).toHaveLength(2);
        expect(scan?.history[0]?.date).toBe("25-02-26");

        const historyRows = ref.current!.getHistoryByDevice("PM5-VFD-61-27002");
        expect(historyRows).toHaveLength(2);
        expect(historyRows.some((row) => row.content.includes("quạt"))).toBe(true);
    });
});

