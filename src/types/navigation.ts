export type RootStackParamList = {
    Home: undefined;
    Scanner: undefined;
    Devices: undefined;
    History: {
        deviceId: string;
        deviceName: string;
    };
    Tools: undefined;
    Info: { url: string };
    WebViewer: { url: string };
    SystemManager: {
        id: string;
        name: string;
    };
    Data: undefined;
};
