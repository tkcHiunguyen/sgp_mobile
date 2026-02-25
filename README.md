# QR3 Mobile App

Ung dung React Native cho quan ly va quet QR. Tai lieu nay tap trung vao cach van hanh du an va workflow dua len GitHub.

## Yeu cau
- Node.js >= 20
- pnpm >= 10
- Android Studio (Android) hoac Xcode (iOS)
- JDK va SDK theo huong dan React Native

## Cai dat
```sh
corepack enable
pnpm install
```

## Cau hinh
Du an co su dung `export.py` de tao tom tat cau truc du an. File nay doc khoa tu `.env`.

Tao file `.env` (da bi ignore khi push):
```env
OPENAI_API_KEY=your_key_here
```

## Chay ung dung
```sh
# Mo Metro
pnpm start

# Android
pnpm android

# iOS
pnpm ios
```

## Test va lint
```sh
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm lint
```

## Cau truc thu muc
- `App.tsx`: entry point
- `src/components`: UI components
- `src/screens`: man hinh chinh
- `src/navigation`: dieu huong
- `src/context`: app context (auth, device group, ...)
- `src/utils`: helper va test
- `src/config`: config (api, ...)
- `src/types`: type definitions
- `__tests__`: test files
- `android/`, `ios/`: native projects
- `PROJECT_STRUCTURE_SUMMARY.md`: tom tat cau truc tu `export.py`

## Workflow GitHub (de dua len repo)
1. Kiem tra thay doi
```sh
git status -sb
```

2. Them file vao stage
```sh
git add -A
```

3. Tao commit
```sh
git commit -m "Your message"
```

4. Day len GitHub
```sh
git push origin main
```

## Luu y ve secret
- Khong commit `.env` hoac API key.
- Neu push bi chan do secret, xoa key khoi code va commit lai.

## Tool migrate app Windows -> macOS
Script moi: `tools/windows_to_macos_migration.ps1`

1. Tao inventory + chon app + sinh Brewfile
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\windows_to_macos_migration.ps1
```

2. Chay nhanh khong can prompt (tu dong lay cac app da map)
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\windows_to_macos_migration.ps1 -NonInteractive
```

3. Neu can, edit file `apps_selected.csv` roi tao lai Brewfile
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\windows_to_macos_migration.ps1 `
  -BuildBrewfileFromCsv `
  -SelectedCsvPath .\migration-output\apps_selected.csv
```

4. Copy `migration-output/Brewfile.generated` sang Mac va chay:
```bash
brew bundle --file ./Brewfile.generated
```
