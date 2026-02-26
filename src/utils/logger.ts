type ConsoleMethod = "log" | "warn" | "error";

const isDevEnv =
    typeof __DEV__ === "boolean"
        ? __DEV__
        : process.env.NODE_ENV !== "production";

const emit = (method: ConsoleMethod, args: unknown[]) => {
    const writer =
        typeof console[method] === "function" ? console[method] : console.log;
    writer(...args);
};

const withScope =
    (scope: string) =>
    (...args: unknown[]) =>
        [scope, ...args];

export const logger = {
    debug: (...args: unknown[]) => {
        if (!isDevEnv) return;
        emit("log", args);
    },
    info: (...args: unknown[]) => {
        if (!isDevEnv) return;
        emit("log", args);
    },
    warn: (...args: unknown[]) => {
        if (!isDevEnv) return;
        emit("warn", args);
    },
    error: (...args: unknown[]) => {
        emit("error", args);
    },
    scoped: (scope: string) => ({
        debug: (...args: unknown[]) => logger.debug(...withScope(scope)(...args)),
        info: (...args: unknown[]) => logger.info(...withScope(scope)(...args)),
        warn: (...args: unknown[]) => logger.warn(...withScope(scope)(...args)),
        error: (...args: unknown[]) =>
            logger.error(...withScope(scope)(...args)),
    }),
};

export const isDevLoggingEnabled = isDevEnv;
