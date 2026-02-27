// src/navigation/AppNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";


import { useAuth } from "../context/AuthContext";
import AdminUsersScreen from "../screens/AdminUsers";
import DevicesScreen from "../screens/Devices";
import HistoryScreen from "../screens/History";
import IndexScreen from "../screens/index";
import InfoScreen from "../screens/Info";
import KpiDashboardScreen from "../screens/KpiDashboard";
import LoadingScreen from "../screens/LoadingScreen";
import LoginScreen from "../screens/Login";
import MeScreen from "../screens/Me";
import RegisterScreen from "../screens/Register";
import ScannerScreen from "../screens/Scanner";
import SettingsScreen from "../screens/Settings";
import ToolsScreen from "../screens/Tools";
import WebViewerScreen from "../screens/WebViewerScreen";

import type { RootStackParamList } from "../types/navigation";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { isAuthed } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthed ? (
                    <>
                        {/* Auth stack */}
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                        />
                    </>
                ) : (
                    <>
                        {/* App stack */}
                        <Stack.Screen
                            name="Loading"
                            component={LoadingScreen}
                        />
                        <Stack.Screen name="Home" component={IndexScreen} />
                        <Stack.Screen
                            name="Scanner"
                            component={ScannerScreen}
                        />
                        <Stack.Screen
                            name="Devices"
                            component={DevicesScreen}
                        />
                        <Stack.Screen
                            name="History"
                            component={HistoryScreen}
                        />
                        <Stack.Screen name="Tools" component={ToolsScreen} />
                        <Stack.Screen name="Info" component={InfoScreen} />
                        <Stack.Screen
                            name="WebViewer"
                            component={WebViewerScreen}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                        />
                        <Stack.Screen
                            name="AdminUsers"
                            component={AdminUsersScreen}
                        />
                        <Stack.Screen
                            name="KpiDashboard"
                            component={KpiDashboardScreen}
                        />
                        <Stack.Screen name="Me" component={MeScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
