# React Native UI/UX Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Nâng cấp UI/UX app theo phong cách hiện đại, rõ ràng, chuyên nghiệp cho iOS + Android, giữ nguyên business logic và API flow hiện có.

**Architecture:** Giữ nguyên flow hiện tại, chỉ tái cấu trúc lớp UI theo hướng token-driven design + shared component primitives. Ưu tiên thay đổi nhỏ theo phase, mỗi phase có verify bắt buộc để tránh regression. Tách UI state khỏi business state, giảm inline style và đồng bộ behavior giữa các màn.

**Tech Stack:** React Native, TypeScript, React Navigation, `useTheme` + `useThemedStyles`, `spacing`/`radius`/`textStyle`, app components hiện có.

---

## 1) Audit nhanh hiện trạng + pain points

### Pain points đã thấy từ codebase hiện tại

1. `Login.tsx` quá lớn (đang chứa cả login + forgot password verify/reset/success + animation + style), khó bảo trì và khó tối ưu re-render.
2. `Scanner.tsx`, `History.tsx`, `Me.tsx` đang dùng nhiều pattern UI khác nhau (modal/button/card không đồng nhất).
3. Chưa có `AppInput` dùng chung nên input style/validation state đang duplicate ở nhiều màn.
4. Loading/empty/error states chưa có mẫu thống nhất nên UX giữa màn không đồng đều.
5. Theme token đang còn mỏng (màu semantic, trạng thái disabled/border/elevation chưa đầy đủ).
6. Một số touch area cần chuẩn hóa rõ theo mobile-first (>=44pt iOS / >=48dp Android).

### Output bắt buộc sau audit

- Tài liệu mapping: màn hình -> component nào tái sử dụng được.
- Danh sách style trùng lặp cần gom vào shared component.
- Baseline screenshot (light/dark) cho 5 khu vực ưu tiên để đối chiếu regression.

---

## 2) Design direction + mini design system

### Visual direction

- Tone: clean, professional, high-contrast, ưu tiên readability.
- Surface hierarchy rõ: `background` -> `surface` -> `surfaceAlt`.
- CTA mạnh và nhất quán (primary / secondary / ghost / danger).

### Token mở rộng (không phá API/theme cũ)

Mở rộng trong [theme.ts](/Users/ruby/sgp_mobile/src/theme/theme.ts):

- Color semantic bổ sung:
  - `borderSubtle`, `borderStrong`
  - `info`, `successSoft`, `dangerSoft`, `warningSoft`
  - `overlay`, `backdrop`
  - `buttonDisabledBg`, `buttonDisabledText`
- Spacing scale mở rộng: `xxs`, `2xl`
- Radius mở rộng: `xl`
- Motion token nhẹ (duration/easing) để đồng bộ animation màn hình

### Component primitives bắt buộc

Trong `src/components/ui`:

- `AppButton`: variants + loading + disabled + icon slot
- `AppInput` (mới): label, helper, error, secure toggle, left/right icon
- `AppCard`: header/body/footer variants
- `BaseModal`: chuẩn hóa header/body/footer + close behavior
- `FeedbackState` (mới): loading/empty/error/success
- `EmptyState`: đồng bộ icon/title/description/actions

---

## 3) Kế hoạch triển khai theo phase (ưu tiên đúng thứ tự)

## Phase 0 - Baseline & guardrails

**Files:**
- Modify: [src/theme/theme.ts](/Users/ruby/sgp_mobile/src/theme/theme.ts)
- Modify: [src/theme/typography.ts](/Users/ruby/sgp_mobile/src/theme/typography.ts) (nếu cần token typography bổ sung)
- Optional: tạo `docs/ui-baseline/` lưu checklist + screenshot

**Mục tiêu:**
- Chốt token tối thiểu cho toàn bộ phase sau.
- Không đổi contract API / auth / secure storage.

**Checklist:**
1. Bổ sung token, không đổi tên token cũ đang được dùng rộng.
2. Kiểm tra contrast tối thiểu cho text chính/phụ ở light + dark.
3. Chốt kích thước touch target chuẩn cho component tương tác.

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 1 - Shared components foundation

**Files:**
- Modify: [src/components/ui/AppButton.tsx](/Users/ruby/sgp_mobile/src/components/ui/AppButton.tsx)
- Create: [src/components/ui/AppInput.tsx](/Users/ruby/sgp_mobile/src/components/ui/AppInput.tsx)
- Modify: [src/components/ui/AppCard.tsx](/Users/ruby/sgp_mobile/src/components/ui/AppCard.tsx)
- Modify: [src/components/ui/BaseModal.tsx](/Users/ruby/sgp_mobile/src/components/ui/BaseModal.tsx)
- Modify: [src/components/ui/EmptyState.tsx](/Users/ruby/sgp_mobile/src/components/ui/EmptyState.tsx)
- Create: [src/components/ui/FeedbackState.tsx](/Users/ruby/sgp_mobile/src/components/ui/FeedbackState.tsx)

**Mục tiêu:**
- Có bộ component chung đủ dùng cho 4 màn ưu tiên.
- Giảm duplicate UI logic ở màn hình.

**Checklist:**
1. `AppInput` hỗ trợ secure text, error state, helper text.
2. `AppButton` có size/variant/loading chuẩn.
3. `BaseModal` chuẩn hóa layout + close action + backdrop.
4. Tất cả component dùng `useTheme`/`useThemedStyles`.

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 2 - Login + forgot password flow

**Files:**
- Modify: [src/screens/Login.tsx](/Users/ruby/sgp_mobile/src/screens/Login.tsx)
- Optional extract:
  - `src/screens/login/components/LoginForm.tsx`
  - `src/screens/login/components/ForgotVerifyModal.tsx`
  - `src/screens/login/components/ForgotResetModal.tsx`
  - `src/screens/login/components/ForgotSuccessModal.tsx`

**Mục tiêu:**
- Refactor UI theo component chung, không đổi behavior verify/reset hiện có.

**Checklist:**
1. Giữ nguyên các hàm gọi `login`, `verifyReset`, `resetPassword`.
2. Tách UI lớn thành subcomponents để giảm file size và re-render.
3. Dùng `AppInput`, `AppButton`, `BaseModal` cho toàn flow.
4. Trạng thái loading/error rõ ràng ở từng bước verify/reset.

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 3 - Home/Dashboard chính

**Files:**
- Xác định file home thực tế trong app (nếu là `Tools.tsx`, `Devices.tsx`, hoặc màn khác trong stack)
- Modify các file home/dashboard tương ứng
- Optional: [src/components/ui/HeaderBar.tsx](/Users/ruby/sgp_mobile/src/components/ui/HeaderBar.tsx)

**Mục tiêu:**
- Nâng hierarchy thông tin + card layout + quick actions rõ ràng.

**Checklist:**
1. Dùng `AppCard` thống nhất cho block thông tin.
2. Tối ưu spacing/section rhythm theo token.
3. Bổ sung empty/loading/error state nhất quán.

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 4 - Scanner + History

**Files:**
- Modify: [src/screens/Scanner.tsx](/Users/ruby/sgp_mobile/src/screens/Scanner.tsx)
- Modify: [src/screens/History.tsx](/Users/ruby/sgp_mobile/src/screens/History.tsx)

**Mục tiêu:**
- Scanner popup/history list rõ ràng hơn, thao tác nhanh hơn, không giảm hiệu năng quét.

**Checklist:**
1. Popup scan dùng modal/pattern thống nhất với phần còn lại.
2. History item/card tối ưu readability, trạng thái filter rõ.
3. Không làm nặng luồng camera hoặc parse scan.
4. Danh sách dài dùng render tối ưu (memoized row, key ổn định, tránh render dư).

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 5 - Me/Profile (avatar + đổi mật khẩu)

**Files:**
- Modify: [src/screens/Me.tsx](/Users/ruby/sgp_mobile/src/screens/Me.tsx)
- Optional extract:
  - `src/screens/me/components/ProfileHeaderCard.tsx`
  - `src/screens/me/components/ChangePasswordSheet.tsx`

**Mục tiêu:**
- Chuẩn hóa profile card + action area + modal xác nhận.

**Checklist:**
1. Tách block avatar/profile/actions để dễ bảo trì.
2. Modal xác nhận thống nhất ngôn ngữ thiết kế.
3. Luồng đổi mật khẩu vẫn giữ nguyên API và xử lý lỗi hiện có.
4. Permission/avatar UX rõ hơn (trạng thái denied/loading/success).

**Verify bắt buộc:**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## Phase 6 - Polish, QA, performance

**Files:**
- Rà soát toàn bộ file đã sửa trong phase 1-5

**Mục tiêu:**
- Chốt chất lượng trước khi merge.

**Checklist:**
1. Cross-check light/dark mode cho 5 khu vực ưu tiên.
2. Kiểm tra touch target cho toàn bộ CTA chính.
3. Kiểm tra không phát sinh regression luồng auth/scanner/profile.
4. Rà soát render path: tránh callback/function inline không cần thiết.

**Verify bắt buộc (full run):**
- `pnpm -s typecheck`
- `pnpm -s test --runInBand`

---

## 4) Quy tắc an toàn bắt buộc trong toàn bộ lộ trình

1. Không thay đổi contract API backend.
2. Không chạm logic bảo mật (secure token storage, env config, OTA/security logic) trừ khi chỉ thay UI thuần.
3. Mọi thay đổi theme/component phải tương thích dark/light mode.
4. Mỗi phase phải merge độc lập được (small PR, dễ rollback).

---

## 5) Kết quả bàn giao sau mỗi phase

Sau mỗi phase, ghi lại trong checklist cá nhân:

1. Danh sách file đã đổi.
2. Cải tiến UI/UX chính đạt được.
3. Kết quả `typecheck` + `test`.
4. Rủi ro còn lại và việc cần theo dõi ở phase tiếp theo.

