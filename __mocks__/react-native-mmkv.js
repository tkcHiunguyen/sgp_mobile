class MMKVMock {
    constructor() {
        this.store = new Map();
    }
    set(key, value) {
        this.store.set(key, String(value));
    }
    getString(key) {
        const v = this.store.get(key);
        return v == null ? undefined : String(v);
    }
    getBoolean(key) {
        const v = this.store.get(key);
        if (v == null) return undefined;
        return v === "true";
    }
    getNumber(key) {
        const v = this.store.get(key);
        if (v == null) return undefined;
        const n = Number(v);
        return Number.isNaN(n) ? undefined : n;
    }
    delete(key) {
        this.store.delete(key);
    }
    remove(key) {
        this.delete(key);
    }
    clearAll() {
        this.store.clear();
    }
}

const createMMKV = () => new MMKVMock();

module.exports = { createMMKV };
