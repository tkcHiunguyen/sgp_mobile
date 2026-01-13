// src/types/roles.ts
export type RoleId =
    | "admin"
    | "general_manager"
    | "deputy_manager_planning"
    | "deputy_manager_mechanical"
    | "deputy_manager_electricity"
    | "deputy_manager_automation"
    | "manager_maintenance"
    | "manager_technical_service"
    | "supervisor"
    | "specialist"
    | "staff"
    | "employee";

export type RoleOption = {
    id: RoleId;
    label: string; // hiển thị trong app
    shortLabel?: string; // hiển thị chip nhỏ
    group: "Admin" | "Management" | "Deputy" | "Manager" | "Operation";
};

export const ROLE_OPTIONS: RoleOption[] = [
    {
        id: "admin",
        label: "Admin (Quản trị hệ thống)",
        shortLabel: "Admin",
        group: "Admin",
    },

    {
        id: "general_manager",
        label: "General Manager (Tổng quản lý)",
        shortLabel: "GM",
        group: "Management",
    },

    // Deputy Manager - theo các mảng
    {
        id: "deputy_manager_planning",
        label: "Deputy Manager - Planning (Phó QL - Kế hoạch)",
        shortLabel: "DP Planning",
        group: "Deputy",
    },
    {
        id: "deputy_manager_mechanical",
        label: "Deputy Manager - Mechanical (Phó QL - Cơ khí)",
        shortLabel: "DP Mechanical",
        group: "Deputy",
    },
    {
        id: "deputy_manager_electricity",
        label: "Deputy Manager - Electricity (Phó QL - Điện)",
        shortLabel: "DP Electricity",
        group: "Deputy",
    },
    {
        id: "deputy_manager_automation",
        label: "Deputy Manager - Automation (Phó QL - Tự động hóa)",
        shortLabel: "DP Automation",
        group: "Deputy",
    },

    // Manager - theo bộ phận
    {
        id: "manager_maintenance",
        label: "Manager - Maintenance Section (Trưởng BP - Bảo trì)",
        shortLabel: "Mgr Maint.",
        group: "Manager",
    },
    {
        id: "manager_technical_service",
        label: "Manager - Technical Service Section (Trưởng BP - Kỹ thuật)",
        shortLabel: "Mgr Tech.",
        group: "Manager",
    },

    // vận hành
    {
        id: "supervisor",
        label: "Supervisor (Giám sát)",
        shortLabel: "Supervisor",
        group: "Operation",
    },
    {
        id: "specialist",
        label: "Specialist (Chuyên viên)",
        shortLabel: "Specialist",
        group: "Operation",
    },
    {
        id: "staff",
        label: "Staff (Nhân viên)",
        shortLabel: "Staff",
        group: "Operation",
    },
    {
        id: "employee",
        label: "Employee (Công nhân/Nhân sự tuyến)",
        shortLabel: "Employee",
        group: "Operation",
    },
];

export const ROLE_LABEL: Record<RoleId, string> = ROLE_OPTIONS.reduce(
    (acc, r) => {
        acc[r.id] = r.shortLabel || r.label;
        return acc;
    },
    {} as Record<RoleId, string>
);

export function normalizeRoleId(value: any): RoleId {
    const v = String(value || "")
        .trim()
        .toLowerCase();

    // map các tên cũ bạn từng dùng
    if (v === "administrator") return "admin";
    if (v === "employee") return "employee";

    // nếu trùng id thì trả
    const hit = ROLE_OPTIONS.find((x) => x.id === v);
    return (hit?.id as RoleId) || "employee";
}
