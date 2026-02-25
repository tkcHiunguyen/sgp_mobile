# C4 Component Index - QR3 Maintenance Platform

## System Components

### Mobile Application Components
- Description: App bootstrap, navigation, auth state, sync/history, OTA, notifications, local persistence
- Documentation: [c4-component-mobile-app.md](./c4-component-mobile-app.md)

### Auth Backend Components
- Description: Action routing, auth/session management, admin actions, password/account flows, avatar upload, Sheets/Drive integration
- Documentation: [c4-component-auth-backend.md](./c4-component-auth-backend.md)

## Component Relationships

```mermaid
flowchart LR
    subgraph Mobile["Mobile App Components"]
        Nav["Navigation Layer"]
        Auth["Auth State Manager"]
        Data["Device Data Sync Manager"]
        Hist["History Append Client"]
        OTA["OTA Update Manager"]
        Notify["Notification Adapter"]
        Store["Local Persistence Adapter"]
    end

    subgraph AuthBackend["Auth Web App Components"]
        Router["Action Router"]
        AuthSvc["Authentication Service"]
        AccountSvc["Account Lifecycle Service"]
        AdminSvc["Admin User Management Service"]
        AvatarSvc["Avatar Upload Service"]
        Storage["Sheet/Drive Access Layer"]
    end

    DataApi["Data Web App"]
    OtaApi["OTA API Server"]
    FCM["Firebase Cloud Messaging"]
    Sheets["Google Sheets"]
    Drive["Google Drive"]

    Nav --> Auth
    Nav --> Data
    Data --> Hist
    Auth --> Store
    Data --> Store
    OTA --> Store

    Auth --> Router
    Router --> AuthSvc
    Router --> AccountSvc
    Router --> AdminSvc
    Router --> AvatarSvc

    Data --> DataApi
    Hist --> DataApi
    OTA --> OtaApi
    Notify --> FCM

    AuthSvc --> Storage
    AccountSvc --> Storage
    AdminSvc --> Storage
    AvatarSvc --> Storage
    Storage --> Sheets
    AvatarSvc --> Drive
```

## Related
- [Context Diagram](./c4-context.md)
- [Container Diagram](./c4-container.md)
- [Code-Level Mobile](./c4-code-mobile-core.md)
- [Code-Level Auth Backend](./c4-code-auth-backend-apps-script.md)
