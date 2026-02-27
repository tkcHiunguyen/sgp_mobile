import { createMMKV } from "react-native-mmkv";

import { ENV_CONFIG } from "../config/env";

const SECURE_AUTH_STORAGE_ID = "secure-auth-storage";
const SECURE_AUTH_TOKEN_KEY = "auth_token_secure";

// NOTE:
// - This key is used only to encrypt local MMKV file-at-rest.
// - Public app binaries can still be reverse-engineered, so this is defense-in-depth.
// - For stronger guarantees, rotate this key and pair with platform keystore/keychain.
const SECURE_AUTH_ENCRYPTION_KEY = ENV_CONFIG.secureAuthEncryptionKey;

const secureAuthStorage = createMMKV({
    id: SECURE_AUTH_STORAGE_ID,
    encryptionKey: SECURE_AUTH_ENCRYPTION_KEY,
});

const removeKey = (key: string): void => {
    const mmkv = secureAuthStorage as unknown as {
        remove?: (k: string) => void;
        delete?: (k: string) => void;
    };

    if (typeof mmkv.remove === "function") {
        mmkv.remove(key);
        return;
    }

    if (typeof mmkv.delete === "function") {
        mmkv.delete(key);
    }
};

export const secureTokenStorage = {
    getToken(): string | null {
        return secureAuthStorage.getString(SECURE_AUTH_TOKEN_KEY) ?? null;
    },

    setToken(token: string): void {
        secureAuthStorage.set(SECURE_AUTH_TOKEN_KEY, token);
    },

    clearToken(): void {
        removeKey(SECURE_AUTH_TOKEN_KEY);
    },
};
