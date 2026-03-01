# Video -> Flow Replay Workflow

## Mục tiêu
Từ video thao tác thật của bạn, tạo lại flow tự động (Maestro) gần giống 1:1.

## Bạn chuẩn bị
- Video quay dọc, full màn hình, 30fps (hoặc 60fps).
- Mỗi thao tác nên có nhịp rõ ràng (tap/chờ/scroll), tránh quá nhanh.
- Nếu có login, dùng tài khoản test.

## Pipeline mình sẽ làm
1. Trích frame theo thời gian từ video.
2. Dò các điểm thay đổi màn hình lớn (screen transition).
3. Xác định hành động chính giữa các mốc (tap/scroll/back/open modal/close modal).
4. Sinh YAML flow Maestro draft.
5. Chạy flow trên simulator, sửa tọa độ/selector cho ổn định.
6. Xuất flow final + bộ screenshot đối chiếu.

## Output bạn nhận
- `docs/screenshots/flows/replay/<name>.yaml`
- `docs/screenshots/ios/replay/<name>/*.png`
- `docs/screenshots/ios/replay/<name>/analysis.md` (timeline hành động)

## Cách gửi cho mình
- Chỉ cần đưa path file video, ví dụ:
  - `/Users/ruby/sgp_mobile/docs/videos/session-01.mp4`

Mình sẽ phân tích và trả lại flow tái tạo tương ứng.
