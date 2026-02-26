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

- [ ] Refactor các màn hình lớn: `Devices`, `Scanner`, `Me`, `AdminUsers` theo module + hooks.
- [ ] Hợp nhất tầng API (tránh lặp logic auth/admin/profile).
- [ ] Chuyển list nặng sang `FlatList/FlashList`, bỏ key theo index. *(partial: Home đã dùng FlatList + key ổn; Devices/Scanner/History vẫn còn key theo index/map trong scroll)*.
- [ ] Siết type navigation, giảm `useNavigation<any>` ở các luồng chính. *(partial: đã có `RootStackParamList`, nhưng còn nhiều `useNavigation<any>`/`as any`)*.
- [ ] Thêm analytics tối thiểu: login success, time-to-home, scan success, add-history success/fail.

## Long-term (Tuần 5-6)

- [ ] Security hardening: token vào secure storage; bật bắt buộc OTA signature verification trước release.
- [ ] Thiết lập CI baseline: typecheck + lint + test + android debug build.
- [ ] Viết E2E cho critical path: đăng nhập -> tải dữ liệu -> quét -> xem lịch sử.
- [ ] Bổ sung dashboard KPI usage để ưu tiên vòng roadmap kế tiếp.

---

## 3) Thứ tự ưu tiên thực thi (đề xuất)

- [x] P1: Loading + retry + fallback.
- [x] P1: Loại log nhạy cảm (logger theo env).
- [ ] P1: Chuẩn hóa touch target + accessibility cơ bản. *(partial)*.
- [ ] P2: Refactor `Devices/Scanner` + tối ưu list.
- [ ] P2: CI + E2E smoke path.

---

## 4) Đã làm nhưng trước đó chưa phản ánh trong checklist

- [x] Refactor theme dùng context + token màu + `useThemedStyles` cho nhiều màn hình/components.
- [x] Tách cụm date picker iOS thành module riêng (`src/components/datePicker/*`) và dùng lại trong filter.
- [x] Bổ sung checklist QA giao diện iOS theo theme tại `docs/theme-ios-qa-checklist.md`.

---

## 5) KPI theo dõi sau nâng cấp

- Crash-free sessions (%)
- Thời gian vào Home (cold start)
- Tỷ lệ login thành công
- Tỷ lệ scan thành công
- Tỷ lệ lỗi API theo màn
- Tỷ lệ hoàn thành luồng chính
