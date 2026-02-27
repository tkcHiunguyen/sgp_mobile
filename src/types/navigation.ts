// src/types/navigation.ts

export type RootStackParamList = {
    Loading: undefined;

    Home: undefined;
    Scanner: undefined;
    Devices: undefined;

    History: undefined;

    Tools: undefined;

    Info: undefined;

    WebViewer: {
        url: string;
        title?: string;
    };
    Me: undefined;
    Settings: undefined;
    Login: { prefillUsername?: string } | undefined;
    Register: undefined;
    AdminUsers: undefined;
    KpiDashboard: undefined;
};
