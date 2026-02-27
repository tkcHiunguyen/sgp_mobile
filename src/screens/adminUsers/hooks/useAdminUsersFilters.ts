import { useMemo } from "react";

import type { AdminUserRow } from "../../../services/userApi";

export type TabKey = "active" | "pending";

export const getUserRowKey = (item: AdminUserRow): string => {
    const primary = String(item.userId || item.username || "").trim();
    if (primary) {
        return primary;
    }

    return [
        item.code ?? "",
        item.fullName ?? "",
        item.createdAt ?? "",
        item.updatedAt ?? "",
        item.role ?? "",
        String(item.active ?? ""),
    ].join("|");
};

type UseAdminUsersFiltersArgs = {
    rows: AdminUserRow[];
    tab: TabKey;
    query: string;
};

export const useAdminUsersFilters = ({
    rows,
    tab,
    query,
}: UseAdminUsersFiltersArgs) => {
    const { activeRows, pendingRows } = useMemo(() => {
        const active: AdminUserRow[] = [];
        const pending: AdminUserRow[] = [];
        for (const row of rows) {
            const isActive = String(row.active ?? "0") === "1";
            if (isActive) active.push(row);
            else pending.push(row);
        }
        return { activeRows: active, pendingRows: pending };
    }, [rows]);

    const filteredRows = useMemo(() => {
        const base = tab === "active" ? activeRows : pendingRows;
        const search = query.trim().toLowerCase();
        if (!search) return base;

        return base.filter((row) => {
            const haystack = [
                row.userId,
                row.username,
                row.fullName,
                row.code,
                row.role,
                String(row.active ?? ""),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(search);
        });
    }, [tab, activeRows, pendingRows, query]);

    return { activeRows, pendingRows, filteredRows };
};

