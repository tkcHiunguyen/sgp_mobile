# QR3 Mobile App

Ung dung React Native cho quan ly va quet QR. Tai lieu nay tap trung vao cach van hanh du an va workflow dua len GitHub.

## Yeu cau
- Node.js >= 20
- Android Studio (Android) hoac Xcode (iOS)
- JDK va SDK theo huong dan React Native

## Cai dat
```sh
npm install
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
npm start

# Android
npm run android

# iOS
npm run ios
```

## Test va lint
```sh
npm test
npm run test:watch
npm run test:coverage
npm run lint
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
