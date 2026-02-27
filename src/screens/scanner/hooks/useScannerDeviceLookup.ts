import { useCallback } from "react";

import type { DeviceGroup, HistoryRow } from "../../../types/deviceGroup";

const parseDate = (value: string): Date => {
    const [dd, mm, yy] = value.split("-");
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = 2000 + parseInt(yy, 10);
    return new Date(year, month, day);
};

type DeviceLookupResult = {
    groupName: string;
    history: HistoryRow[];
} | null;

export const useScannerDeviceLookup = (deviceGroups: DeviceGroup[]) => {
    const findDeviceInfo = useCallback(
        (value: string): DeviceLookupResult => {
            for (const group of deviceGroups) {
                const deviceRows = group.devices?.rows ?? [];
                const foundDevice = deviceRows.find((d) => d.name === value);
                if (!foundDevice) continue;

                const historyRows = group.history?.rows ?? [];
                const filtered = historyRows.filter((h) => h.deviceName === value);
                const sorted = [...filtered].sort(
                    (a, b) =>
                        parseDate(b.date).getTime() - parseDate(a.date).getTime()
                );

                return {
                    groupName: group.table,
                    history: sorted,
                };
            }

            return null;
        },
        [deviceGroups]
    );

    return { findDeviceInfo };
};

