# Coverage Gap - Screenshot & Interaction Audit (2026-02-27)

> Legacy note (updated 2026-02-28): cấu trúc cũ trong file này đã được archive tại `docs/screenshots/_legacy/`.
> Pipeline hiện tại dùng:
> - Flow: `docs/screenshots/flows/capture-all/`
> - Entrypoint: `docs/screenshots/capture.sh`
> - Output: `docs/screenshots/output/latest/` và `docs/screenshots/output/archive/`

## 1) Đã có trong bộ hiện tại
- `index` (top + mid)
- `device` (top + mid + bottom)
- `history` (top)
- `info` (top + mid + bottom)
- `setting` (top + mid + bottom)
- `register` (top + mid + bottom)

Nguồn ảnh:
- `docs/screenshots/ios/screenshots/`
- `docs/screenshots/ios/screenshots-scrolled/`

## 2) Màn hình còn bỏ sót (theo navigation)
Từ `src/navigation/AppNavigator.tsx`:
- [ ] `Login` (màn chính + trạng thái lỗi)
- [ ] `Loading` (checking/loading/error/ready)
- [ ] `Scanner`
- [ ] `Tools`
- [ ] `WebViewer`
- [ ] `Me`
- [ ] `AdminUsers`
- [ ] `KpiDashboard` (admin only)

## 3) Interaction còn bỏ sót (modal/picker/dropdown)

### Login
- [ ] Forgot password Step 1 modal (verify username + employee code)
- [ ] Forgot password Step 2 modal (new password + confirm)
- [ ] Forgot password success modal

### Register
- [ ] Success modal sau khi tạo tài khoản

### Scanner
- [ ] Popup khi scan ra `device` (có lịch sử + nút AddHistory)
- [ ] Popup khi scan ra `url` (nút mở WebViewer)
- [ ] Popup khi scan ra `text`
- [ ] Toggle flash on/off
- [ ] State không có quyền camera

### Devices
- [ ] Modal danh sách thiết bị trong nhóm
- [ ] Search trong modal
- [ ] Filter loại thiết bị (dropdown + chọn all/individual)
- [ ] Mở lịch sử theo thiết bị (sub-modal view)
- [ ] Add history modal (form)
- [ ] Date picker trong Add history (`SingleDatePickerIOSDark`)

### History
- [ ] Modal chọn nhóm thiết bị
- [ ] Device filter dropdown
- [ ] Date range picker (`DateRangeNativePicker`)
- [ ] Preset date: Hôm nay / 7 ngày / 30 ngày / Tháng này
- [ ] Modal “Thiết bị sửa nhiều nhất” (khi có nhiều thiết bị đồng hạng)

### Settings
- [ ] Modal cảnh báo mở khóa field nhạy cảm
- [ ] Modal xác nhận reset
- [ ] Modal reset xong + điều hướng Loading
- [ ] Modal save thành công
- [ ] Modal save lỗi
- [ ] OTA modal loại info/error/confirm
- [ ] Download progress UI khi OTA

### Me
- [ ] Change password modal
- [ ] Permission modal (gallery permission)
- [ ] Logout confirm modal
- [ ] Chuyển sang `AdminUsers` từ quick action (admin)

### AdminUsers
- [ ] Tab Active / Pending
- [ ] Role picker modal
- [ ] Confirm modal đổi role
- [ ] Confirm modal khóa/mở user
- [ ] Session expired modal

### KpiDashboard
- [ ] Refresh
- [ ] Modal xác nhận “Xóa dữ liệu KPI”

## 4) State-based coverage nên có thêm
- [ ] Empty state (History chưa chọn group)
- [ ] Empty state (Devices nhóm chưa có thiết bị)
- [ ] Empty state (KPI chưa có dữ liệu)
- [ ] Error state Loading (retry / dùng dữ liệu cũ)
- [ ] Non-admin Home (không có tile AdminUsers/KPI)

## 5) Gợi ý thứ tự chụp bổ sung (ưu tiên cao -> thấp)
1. Scanner + popup device/url/text + WebViewer.
2. Devices modal flow + AddHistory + date picker.
3. History filter flow (device/date/preset) + top-device modal.
4. Settings toàn bộ modal.
5. Me + AdminUsers + KPI.
6. Loading/login edge states.
