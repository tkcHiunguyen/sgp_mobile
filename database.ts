import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(true);

const DB_NAME = "appdata.db";

let db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = async () => {
    if (db) return db;

    db = await SQLite.openDatabase({ name: DB_NAME, location: "default" });
    await createTables();
    return db;
};

const createTables = async () => {
    if (!db) throw new Error("Database not opened");

    await db.executeSql(`DROP TABLE IF EXISTS systems;`);
    await db.executeSql(`DROP TABLE IF EXISTS devices;`);
    await db.executeSql(`DROP TABLE IF EXISTS maintenance;`);
    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS systems (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            description TEXT
        );
    `);

    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY NOT NULL,
        system TEXT NOT NULL,
        name TEXT NOT NULL,
        check_date TEXT,
        estimate_check TEXT,
        create_at TEXT
    );
    `);

    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS maintenance (
            id TEXT PRIMARY KEY NOT NULL,
            device_id TEXT NOT NULL,
            action_type TEXT,
            action_desc TEXT,
            performed_by TEXT,
            action_date TEXT,
            created_at TEXT
        );
    `);
};

export const syncDataToDB = async (data: {
    systems?: any[];
    devices?: any[];
    histories?: any[];
}) => {
    if (!db) throw new Error("Database not opened");

    const { systems, devices, histories } = data;

    if (!systems || !devices || !histories) {
        console.warn("syncDataToDB: invalid data", data);
        return; // hoặc throw new Error("Invalid data from server");
    }

    // Xoá dữ liệu cũ
    await db.executeSql("DELETE FROM systems");
    await db.executeSql("DELETE FROM devices");
    await db.executeSql("DELETE FROM maintenance");

    // Insert lại
    for (const s of systems) {
        await db.executeSql(
            `INSERT INTO systems (id, name, description) VALUES (?, ?, ?)`,
            [s.id, s.name, s.description || null]
        );
    }

    for (const d of devices) {
        await db.executeSql(
            `INSERT INTO devices (id, system, name, check_date, estimate_check, create_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.system,
                d.name,
                d.check_date || null,
                d.estimate_check || null,
                d.create_at || null,
            ]
        );
    }

    for (const h of histories) {
        await db.executeSql(
            `INSERT INTO maintenance (id, device_id, action_type, action_desc, performed_by, action_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                h.id,
                h.device_id,
                h.action_type,
                h.action_desc,
                h.performed_by,
                h.action_date,
                h.created_at || null,
            ]
        );
    }

    console.warn("✅ syncDataToDB: data synced", {
        systemsCount: systems.length,
        devicesCount: devices.length,
        historiesCount: histories.length,
    });
};
