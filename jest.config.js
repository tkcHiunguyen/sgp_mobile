module.exports = {
    preset: "react-native",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    transformIgnorePatterns: [
        "node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-mmkv)/)",
    ],
    testMatch: [
        "**/__tests__/**/*.test.(js|jsx|ts|tsx)",
        "**/?(*.)+(spec|test).(js|jsx|ts|tsx)",
    ],
};
