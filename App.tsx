// App.tsx
import React from "react";

import { AuthProvider } from "./src/context/AuthContext";
import { DeviceGroupProvider } from "./src/context/DeviceGroupContext";
import { OtaProvider } from "./src/context/OtaContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useFirebaseNotifications } from "./src/hooks/useFirebaseNotifications";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
    useFirebaseNotifications();

    return (
        <ThemeProvider>
            <AuthProvider>
                <DeviceGroupProvider>
                    <OtaProvider>
                        <AppNavigator />
                    </OtaProvider>
                </DeviceGroupProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
