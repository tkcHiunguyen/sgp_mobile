import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DeviceGroupProvider } from "./src/context/DeviceGroupContext"; // Import the provider

import LoadingScreen from "./src/screens/LoadingScreen";
import IndexScreen from "./src/screens/index";
import ScannerScreen from "./src/screens/Scanner";
import DevicesScreen from "./src/screens/Devices";
import HistoryScreen from "./src/screens/History";
import ToolsScreen from "./src/screens/Tools";
import InfoScreen from "./src/screens/Info";
import WebViewerScreen from "./src/screens/WebViewerScreen";
import SystemManager from "./src/screens/SystemManager";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <DeviceGroupProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Loading" component={LoadingScreen} />
                    <Stack.Screen name="Home" component={IndexScreen} />
                    <Stack.Screen name="Scanner" component={ScannerScreen} />
                    <Stack.Screen name="Devices" component={DevicesScreen} />
                    <Stack.Screen name="History" component={HistoryScreen} />
                    <Stack.Screen name="Tools" component={ToolsScreen} />
                    <Stack.Screen name="Info" component={InfoScreen} />
                    <Stack.Screen
                        name="WebViewer"
                        component={WebViewerScreen}
                    />
                    <Stack.Screen
                        name="SystemManager"
                        component={SystemManager}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </DeviceGroupProvider>
    );
}
