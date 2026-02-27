# Audit + Roadmap Nâng Cấp App (6 Tuần)

## 1) Tóm tắt audit hiện trạng

- `MFRI` ước tính: `-5` (rủi ro cao), cần ưu tiên giảm rủi ro UX/perf/reliability.
- Reliability: luồng Loading có nhánh `return` sớm khi lỗi HTTP/parse, dễ kẹt màn hình.
- Security: còn log auth/raw response nhiều; đang lưu remembered password; OTA signature chưa bắt buộc.
- UX/A11y: nhiều touch target nhỏ hơn chuẩn 44/48.
- Perf/Maintainability: nhiều màn hình rất lớn (900-1400 dòng), list có chỗ dùng key theo index và map trong scroll.
- Quality gate: test còn mỏng, lint chưa chạy được do thiếu config ESLint.

---

## 2) Roadmap 6 tuần

## Quick Wins (Tuần 1-2)

- [x] Sửa Loading flow: thêm state lỗi rõ ràng + nút retry + fallback cache an toàn.
- [x] Giảm log production (auth/data/ota), chuẩn hóa logger theo env. *(đã thêm `src/utils/logger.ts`, chuyển các log auth/data/ota sang logger theo env; production chỉ giữ error)*.
- [x] Chuẩn hóa touch target chính >= 44pt iOS / 48dp Android. *(đã chuẩn hóa qua token `MIN_TOUCH_TARGET_SIZE` và áp vào các nút chính: AppButton/BackButton/Login/Register/Settings/Devices/DateRange/AddHistory)*.
- [x] Bổ sung cấu hình ESLint tối thiểu để `pnpm lint` chạy được. *(đã thêm `.eslintrc.cjs` + `.eslintignore`, lệnh `pnpm lint` chạy pass)*.

## Medium (Tuần 3-4)

- [x] Refactor các màn hình lớn: `Devices`, `Scanner`, `Me`, `AdminUsers` theo module + hooks.
- [x] Hợp nhất tầng API (tránh lặp logic auth/admin/profile). *(đã dùng `authedFetchJson` + `createUserApi` cho flow admin/profile: list users, đổi role/active, upload avatar, đổi mật khẩu)*.
- [x] Chuyển list nặng sang `FlatList/FlashList`, bỏ key theo index. *(đã chuyển các list nặng ở `Devices/Scanner/History/Home` sang `FlatList/SectionList` và bỏ key theo index ở các màn chính)*.
- [x] Siết type navigation, giảm `useNavigation<any>` ở các luồng chính. *(đã typed route params + navigation ở các màn chính; loại bỏ `useNavigation<any>` ở flow trọng điểm)*.
- [x] Thêm analytics tối thiểu: login success, time-to-home, scan success, add-history success/fail.

## Long-term (Tuần 5-6)

- [x] Security hardening: token vào secure storage; bật bắt buộc OTA signature verification trước release. *(đã chuyển auth token sang encrypted MMKV; release build bắt buộc verify signature OTA, cần thay `OTA_PUBLIC_KEY_DEFAULT` bằng public key production trước khi phát hành)*.
- [x] Thiết lập CI baseline: typecheck + lint + test + android debug build. *(đã thêm workflow `.github/workflows/ci.yml`)*.
- [x] Viết E2E cho critical path: đăng nhập -> tải dữ liệu -> quét -> xem lịch sử. *(đã thêm test integration `__tests__/critical-path.e2e.test.tsx`)*.
- [x] Bổ sung dashboard KPI usage để ưu tiên vòng roadmap kế tiếp. *(đã thêm màn `KpiDashboard`, route nav và entry từ Home cho admin)*.

---

## 3) Thứ tự ưu tiên thực thi (đề xuất)

- [x] P1: Loading + retry + fallback.
- [x] P1: Loại log nhạy cảm (logger theo env).
- [ ] P1: Chuẩn hóa touch target + accessibility cơ bản. *(partial)*.
- [x] P2: Refactor `Devices/Scanner` + tối ưu list.
- [x] P2: CI + E2E smoke path.

---

## 4) Đã làm nhưng trước đó chưa phản ánh trong checklist

- [x] Refactor theme dùng context + token màu + `useThemedStyles` cho nhiều màn hình/components.
- [x] Tách cụm date picker iOS thành module riêng (`src/components/datePicker/*`) và dùng lại trong filter.
- [x] Bổ sung checklist QA giao diện iOS theo theme tại `docs/theme-ios-qa-checklist.md`.
- [x] Tuần 3-4 đợt 1: siết navigation type cho luồng chính + bỏ key theo index ở các màn list trọng điểm (`Devices/History/Scanner/Info`).

---

## 5) KPI theo dõi sau nâng cấp

- Crash-free sessions (%)
- Thời gian vào Home (cold start)
- Tỷ lệ login thành công
- Tỷ lệ scan thành công
- Tỷ lệ lỗi API theo màn
- Tỷ lệ hoàn thành luồng chính
