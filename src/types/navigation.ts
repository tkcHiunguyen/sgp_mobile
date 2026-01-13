// src/types/navigation.ts

export type RootStackParamList = {
    Loading: undefined;

    Home: undefined;
    Scanner: undefined;
    Devices: undefined;

    History: {
        deviceId: string;
        deviceName: string;
    };

    Tools: undefined;

    Info: {
        url: string;
    };

    WebViewer: {
        url: string;
        title?: string;
    };
    Me: undefined;
    Settings: undefined;
    Login: { prefillUsername?: string } | undefined;
    Register: undefined;
    AdminUsers: undefined;
};
