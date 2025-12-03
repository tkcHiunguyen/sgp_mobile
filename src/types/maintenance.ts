export type MaintenanceActionType =
    | "Kiểm tra"
    | "Vệ sinh"
    | "Sửa chữa"
    | "Thay thế"
    | "Hiệu chuẩn";

export interface MaintenanceHistoryItem {
    id: string;
    device_id: string;
    action_type: MaintenanceActionType | string;
    action_desc: string;
    performed_by: string;
    action_date: string; // ISO date string
    created_at: string; // ISO datetime string
}

export interface AddMaintenancePayload {
    device_id: string;
    action_type: MaintenanceActionType | string;
    action_desc: string;
    performed_by: string;
    action_date: string; // YYYY-MM-DD
}
