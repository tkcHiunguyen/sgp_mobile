# C4 Component - Auth Web App Container

## Overview
- Name: Auth Web App Components
- Type: API Service Components
- Technology: Google Apps Script
- Primary source: `BACKEND_AUTH.gs`

## Components

### Action Router
- Purpose: Route `doGet/doPost` requests by `action` to specific handlers
- Key entrypoints:
  - `doGet(e)`
  - `doPost(e)`

### Authentication Service
- Purpose: Credential verification, token issuance, logout, session checks
- Key handlers:
  - `authLogin_`
  - `authLogout_`
  - `authMeByToken_`
  - `verifyToken_`

### Account Lifecycle Service
- Purpose: Registration and password flows
- Key handlers:
  - `authRegister_`
  - `authVerifyReset_`
  - `authResetPassword_`
  - `authChangePassword_`

### Admin User Management Service
- Purpose: User list, role updates, active-state toggling
- Key handlers:
  - `adminListUsersByToken_`
  - `adminSetUserRoleAction_`
  - `adminSetUserActiveAction_`
  - `adminCreateUserAction_`

### Avatar Upload Service
- Purpose: Validate and upload avatar file, update user avatar metadata
- Key handlers:
  - `handleUploadAvatar_`
  - `updateUserAvatar_`

### Sheet/Storage Access Layer
- Purpose: Read/write structured data from Google Sheets and Drive
- Key helpers:
  - `getSheet_`
  - `readTable_`
  - `appendRow_`
  - `writeCell_`

### Security Helpers
- Purpose: Hashing, token and time helpers, cleanups
- Key behavior:
  - Password hash checks with salt
  - Session cleanup and revocation
  - Token TTL enforcement

## Interfaces

### Auth Action API
- Protocol: HTTPS JSON action-based
- Actions:
  - `auth_login`, `auth_logout`, `auth_me`
  - `auth_register`, `auth_verify_reset`, `auth_reset_password`, `auth_change_password`
  - `auth_upload_avatar`

### Admin Action API
- Protocol: HTTPS JSON action-based
- Actions:
  - `admin_list_users`
  - `admin_set_user_role`
  - `admin_set_user_active`
  - `admin_create_user`

## Dependencies
- Google Sheets (`users`, `sessions`)
- Google Drive (avatar folder/file operations)

## Component Diagram

```mermaid
C4Component
    title Components - Auth Web App Container

    Container_Boundary(authApi, "Auth Web App (Apps Script)") {
        Component(router, "Action Router", "doGet/doPost", "Routes incoming action requests")
        Component(authSvc, "Authentication Service", "authLogin/authLogout/authMe/verifyToken", "Session lifecycle and token checks")
        Component(accountSvc, "Account Lifecycle Service", "register/reset/change password", "Account creation and credential updates")
        Component(adminSvc, "Admin User Management Service", "admin_list/admin_set_role/admin_set_active", "Admin controls over users")
        Component(avatarSvc, "Avatar Upload Service", "auth_upload_avatar", "Avatar validation/upload/update")
        Component(storage, "Sheet/Drive Access Layer", "sheet and drive helpers", "Read/write users, sessions, and files")
        Component(sec, "Security Helpers", "hash/token/time helpers", "Password hashing and token/session controls")
    }

    System_Ext(sheets, "Google Sheets", "users and sessions data")
    System_Ext(drive, "Google Drive", "Avatar storage")

    Rel(router, authSvc, "Routes auth actions")
    Rel(router, accountSvc, "Routes account actions")
    Rel(router, adminSvc, "Routes admin actions")
    Rel(router, avatarSvc, "Routes avatar actions")

    Rel(authSvc, sec, "Uses")
    Rel(accountSvc, sec, "Uses")
    Rel(authSvc, storage, "Reads/Writes")
    Rel(accountSvc, storage, "Reads/Writes")
    Rel(adminSvc, storage, "Reads/Writes")
    Rel(avatarSvc, storage, "Reads/Writes")

    Rel(storage, sheets, "Reads/Writes")
    Rel(avatarSvc, drive, "Stores files")
```

## Related
- [Component Index](./c4-component.md)
- [Container Diagram](./c4-container.md)
