export type HistoryRow = {
    deviceName: string;
    date: string;
    content: string;
};

export type DeviceRow = {
    id: string | number | null;
    name: string;
    type: string;
    freq: string | number | null;
};

export type DeviceGroup = {
    table: string;
    devices?: {
        headers?: string[];
        rows?: DeviceRow[];
    };
    history?: {
        headers?: string[];
        rows?: HistoryRow[];
    };
};

