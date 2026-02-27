import { useMemo } from "react";

import type { DeviceGroup, DeviceRow } from "../../../types/deviceGroup";

export const parseDeviceCode = (fullCode: string) => {
    if (!fullCode) return { group: "", kind: "", code: "" };

    const parts = fullCode.split("-");
    if (parts.length < 2) return { group: "", kind: "", code: fullCode };

    const group = parts[0] || "";
    const kind = parts[1] || "";
    const code = parts.slice(2).join("-") || "";
    return { group, kind, code };
};

type UseDevicesDataArgs = {
    deviceGroups: DeviceGroup[];
    selectedGroup: string | null;
    searchText: string;
    selectedKinds: string[];
};

export const useDevicesData = ({
    deviceGroups,
    selectedGroup,
    searchText,
    selectedKinds,
}: UseDevicesDataArgs) => {
    const selectedGroupData = useMemo(
        () => deviceGroups.find((g) => g.table === selectedGroup),
        [deviceGroups, selectedGroup]
    );

    const devicesInGroup = useMemo<DeviceRow[]>(
        () => selectedGroupData?.devices?.rows ?? [],
        [selectedGroupData]
    );

    const availableKinds = useMemo(() => {
        const set = new Set<string>();
        devicesInGroup.forEach((dev) => {
            const parsed = parseDeviceCode(dev.name);
            if (parsed.kind) set.add(parsed.kind);
        });
        return Array.from(set).sort();
    }, [devicesInGroup]);

    const allKindsActive =
        availableKinds.length === 0 ||
        selectedKinds.length === availableKinds.length;

    const filteredDevices = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        return devicesInGroup.filter((dev) => {
            const parsed = parseDeviceCode(dev.name);

            if (availableKinds.length > 0 && selectedKinds.length === 0) {
                return false;
            }

            if (
                availableKinds.length > 0 &&
                !allKindsActive &&
                (!parsed.kind || !selectedKinds.includes(parsed.kind))
            ) {
                return false;
            }

            if (!q) return true;

            const code = (parsed.code || "").toLowerCase();
            const name = (dev.name || "").toLowerCase();
            const type = (dev.type || "").toLowerCase();
            const kind = (parsed.kind || "").toLowerCase();
            const group = (parsed.group || "").toLowerCase();

            return (
                name.includes(q) ||
                code.includes(q) ||
                type.includes(q) ||
                kind.includes(q) ||
                group.includes(q)
            );
        });
    }, [
        devicesInGroup,
        searchText,
        selectedKinds,
        availableKinds,
        allKindsActive,
    ]);

    return {
        selectedGroupData,
        devicesInGroup,
        availableKinds,
        allKindsActive,
        filteredDevices,
    };
};

