# Project Structure Summary

├─ .bundle/
│   └─ config
├─ .gitignore
├─ .watchmanconfig
├─ App.tsx
    - - hooks: useFirebaseNotifications – khởi tạo và lắng nghe thông báo từ Firebase.
    - - components: App – gốc của ứng dụng, chạy hook và render AppNavigator.
    - - components: ThemeProvider – cung cấp theme cho toàn app.
    - - components: AuthProvider – quản lý xác thực người dùng.
    - - components: DeviceGroupProvider – quản lý trạng thái và nhóm thiết bị.
    - - components: OtaProvider – quản lý cập nhật OTA.
    - - components: AppNavigator – điều phối điều hướng của ứng dụng.
├─ Gemfile
├─ PROJECT_STRUCTURE_SUMMARY.md
├─ README.md
├─ __mocks__/
│   └─ react-native-mmkv.js
│       - - functions: createMMKV - Hàm tạo và trả về instance của MMKVMock.
│       - - classes: MMKVMock - Lớp lưu trữ key-value bằng Map, cung cấp set/getString/getBoolean/getNumber/delete/clearAll.
├─ app.json
├─ babel.config.js
    - - Babel preset cho React Native: module:@react-native/babel-preset
    - - Plugin cho worklets trong React Native: react-native-worklets/plugin
├─ database.ts
    - - openDatabase: Mở kết nối SQLite và đảm bảo database được tạo sẵn, khởi tạo bảng nếu chưa có.
    - - createTables: Xóa dữ liệu cũ và tạo mới các bảng systems, devices và maintenance với schema tương ứng.
    - - syncDataToDB: Đồng bộ dữ liệu từ server vào DB bằng cách xóa dữ liệu hiện có và chèn lại các bản ghi mới.
├─ export.py
    - - functions
    -   - clean_frontend_code: Loại bỏ CSS, comment và style khỏi nội dung frontend để rút ngắn mã nguồn.
    -   - summarize_file_with_gpt: Gọi API OpenAI để tạo tóm tắt kỹ thuật cho nội dung file thành bullet points.
    -   - walk_dir: Duyệt thư mục, lọc thư mục nhất định và thu thập tóm tắt cho các file mã nguồn.
├─ index.js
    - - getApp (functions): Lấy instance Firebase App để dùng với các dịch vụ.
    - - getMessaging (functions): Lấy Messaging instance liên kết với Firebase App.
    - - setBackgroundMessageHandler (functions): Đăng ký handler cho tin nhắn FCM ở chế độ nền.
    - - registerComponent (functions): Đăng ký component gốc của ứng dụng với AppRegistry.
    - - App (components): Component React Native gốc của ứng dụng.
├─ jest.config.js
    - - Cấu hình Jest cho dự án React Native: preset "react-native", setupFilesAfterEnv, transformIgnorePatterns và testMatch để nhận diện các file test.
├─ jest.setup.js
    - - functions: Thiết lập môi trường Jest bằng cách mở rộng expect cho React Native và mock module react-native-mmkv.  
    - - hooks: Không có  
    - - components: Không có  
    - - classes: Không có
├─ metro.config.js
    - - getDefaultConfig: Lấy cấu hình Metro mặc định cho dự án tại thư mục hiện tại (__dirname).
    - - mergeConfig: Ghép cấu hình tùy chỉnh với cấu hình mặc định.
├─ node_modules.rar
├─ package-lock.json
├─ package.json
├─ scratch.js
├─ src/
│   ├─ assets/
│   │   └─ fonts/
│   │       └─ Ionicons.ttf
│   ├─ components/
│   │   ├─ DataSyncIndicator.tsx
│   │       - - components: DataSyncIndicator - Component hiển thị chỉ báo đồng bộ dữ liệu và cho phép tải dữ liệu mới, hỗ trợ inline hoặc ở góc màn hình theo prop. 
│   │       - - hooks: useEffect - Tự động đồng bộ dữ liệu khi dữ liệu từ cache và chưa đang đồng bộ. 
│   │       - - hooks: useDeviceGroup - Lấy trạng thái isDataFromCache, isSyncing và hàm refreshAllData từ context. 
│   │       - - functions: renderIcon - Hàm trả về biểu tượng hoặc indicator tùy trạng thái đồng bộ.
│   │   ├─ DateRangeFilter.tsx
│   │       - - functions
│   │       -   - pad2: Đảm bảo chuỗi số có hai chữ số bằng cách thêm 0 ở前 khi cần.
│   │       -   - ymdToDdMmYy: Chuyển đổi ngày từ yyyy-MM-dd sang dd-MM-yy.
│   │       -   - ddMmYyToYmd: Chuyển đổi ngày từ dd-MM-yy sang yyyy-MM-dd.
│   │       -   - todayYmd: Lấy ngày hiện tại ở định dạng yyyy-MM-dd.
│   │       - - hooks
│   │       -   - useState: Quản lý trạng thái mở modal và ngày tạm thời (tempFrom/tempTo).
│   │       -   - useMemo: Tối ưu hóa tính toán markedDates dựa trên tempFrom/tempTo.
│   │       - - components
│   │       -   - DateRangeFilter: Thành phần cho phép chọn khoảng thời gian và áp dụng/đặt lại.
│   │   ├─ DateRangeFilterIOSDark.tsx
│   │       - - Functions
│   │       -   - pad2: đệm số nguyên thành chuỗi 2 chữ số.
│   │       -   - dmyToDate: chuyển chuỗi ngày-tháng-năm định dạng dd-mm-yy sang Date.
│   │       -   - dateToDmy: chuyển Date về chuỗi dd-mm-yy.
│   │       -   - clamp: giới hạn Date giữa minDate và maxDate.
│   │       -   - startOfMonth: lấy ngày đầu tiên của tháng của một ngày cho trước.
│   │       -   - addDays: cộng số ngày cho một ngày cho trước.
│   │       - 
│   │       - - Hooks
│   │       -   - useMemo: tối ưu hóa tính toán minDate/maxDate và giá trị ngày hiện tại cho mục tiêu được chọn.
│   │       -   - useState: quản lý các trạng thái target, showAndroidPicker, iosPickerOpen, iosDraft, mounted.
│   │       -   - useEffect: điều phối hiệu ứng hoạt ảnh mở/đóng dropdown dựa trên prop open.
│   │       -   - useRef: giữ tham chiếu cho Animated.Value dùng cho animation dropdown.
│   │       - 
│   │       - - Components
│   │       -   - DateRangeNativePicker: component chọn và hiển thị phạm vi ngày với hỗ trợ iOS/Android.
│   │       -   - PresetChip: nút preset ngày để nhanh chọn các khoảng ngày ngắn gọn.
│   │       - 
│   │       - - Classes
│   │       -   - (Không có)
│   │   ├─ SingleDatePickerIOSDark.tsx
│   │       - - Functions
│   │       -   - pad2: chuyển số thành chuỗi hai chữ số với đệm 0 ở trước.
│   │       -   - dmyToDate: chuyển chuỗi ngày-tháng-năm định dạng DD-MM-YY sang đối tượng Date.
│   │       -   - dateToDmy: chuyển Date thành chuỗi DD-MM-YY.
│   │       -   - clamp: giới hạn ngày ở giữa minDate và maxDate.
│   │       - 
│   │       - - Hooks
│   │       -   - useMemo: tối ưu hoá các giá trị tính toán (min/max date, current value, vị trí anchor/dropdown).
│   │       -   - useRef: giữ tham chiếu đến phần tử icon để đo vị trí và vị trí hiển thị dropdown.
│   │       -   - useState: quản lý trạng thái UI (mở popover, anchor, picker Android và iOS modal, draft ngày).
│   │       - 
│   │       - - Components
│   │       -   - SingleDatePickerIOSDark: component picker ngày hỗ trợ iOS/Android với dropdown và modals.
│   │   ├─ addButton.tsx
│   │       - - Components
│   │       -   - AddButton: Component React Native hiển thị nút tròn với icon "add", nhận props onPress và style để xử lý nhấn và tuỳ chỉnh giao diện.
│   │   ├─ backButton.tsx
│   │       - - hooks
│   │       -   - useRef: Quản lý tham chiếu giá trị scale cho animation.
│   │       - 
│   │       - - functions
│   │       -   - pressIn: Thực thi animation spring để giảm scale khi nhấn.
│   │       -   - pressOut: Thực thi animation spring để trả scale về 1 khi thả.
│   │       - 
│   │       - - components
│   │       -   - BackButton: Nút quay lại có animation scale và ikon chevron-back.
│   │   ├─ maintenance/
│   │   │   └─ AddHistoryButton.tsx
│   │   │       - - components: AddHistoryAction — React Native component cung cấp nút "+" và modal để thêm lịch sử cho thiết bị và gửi lên Apps Script.
│   │   │       - - hooks: useMemo — tính ngày hiện tại dạng dd-MM-yy làm ngày mặc định; hooks useState — quản lý open, date, content, touched, submitting và error; useEffect — reset trạng thái form khi mở modal.
│   │   │       - - functions: handleSave — xử lý lưu lịch sử, validate và gửi POST, xử lý kết quả và gọi onPosted khi thành công; postAppendHistoryToAppScript (được import) — hàm gửi dữ liệu lịch sử lên Apps Script.
│   │   └─ ui/
│   │       ├─ AppButton.tsx
│   │           - - components: AppButton - Thành phần nút UI trong React Native với props title, onPress, variant (primary/danger/secondary) và disabled, áp dụng style tùy biến.
│   │       ├─ AppCard.tsx
│   │           - - functions: AppCard — Trả về một View chứa nội dung con và áp dụng kết hợp style từ styles.card và prop style.
│   │           - - components: AppCard — Component React Native hiển thị nội dung dưới dạng thẻ (card) với padding, border và shadow.
│   │       ├─ AppScreen.tsx
│   │           - - Component: AppScreen — Thành phần React Native nhận (children) và style, bọc nội dung bằng SafeAreaView và View với padding tùy chỉnh và topPadding.
│   │       ├─ BaseModal.tsx
│   │           - - components
│   │           -   - BaseModal: component modal tùy biến với overlay và hiệu ứng animation.
│   │           - 
│   │           - - hooks
│   │           -   - useState: quản lý trạng thái mounted để điều khiển hiển thị modal.
│   │           -   - useRef: lưu Animated.Value cho animation.
│   │           -   - useEffect: đồng bộ lifecycle animation khi prop visible thay đổi.
│   │           - 
│   │           - - functions
│   │           -   - handleClose: hàm đóng modal nhất quán dựa trên onClose hoặc onRequestClose.
│   │       ├─ EmptyState.tsx
│   │           - - components: EmptyState - React Native component hiển thị trạng thái trống với tiêu đề tùy chọn và thông báo ở giữa màn hình.
│   │       ├─ HeaderBar.tsx
│   │           - - Component HeaderBar — Hiển thị header với nút Back, chỉ báo đồng bộ và tiêu đề từ props title/onBack.  
│   │           - - Function handleBack — Xử lý sự kiện quay lại bằng cách gọi onBack hoặc hàm rỗng nếu không có.
│   │       └─ ScreenTitle.tsx
│   │           - - functions: ScreenTitle - Hàm component React Native hiển thị tiêu đề văn bản với style tùy chỉnh qua prop style.
│   │           - - components: ScreenTitle - Component React Native hiển thị Text tiêu đề với style cố định và ghép với prop style.
│   ├─ config/
│   │   └─ apiConfig.ts
│   │       - - functions:
│   │       -   - getApiBase: Lấy api base từ storage hoặc trả về giá trị mặc định.
│   │       -   - getSheetId: Lấy sheet id từ storage hoặc trả về giá trị mặc định.
│   │       -   - resetConfig: Đặt lại config (apiBase, sheetId, allData) về giá trị mặc định trong MMKV.
│   │       -   - setApiBase: Lưu api base mới vào storage, hoặc mặc định khi null/rỗng.
│   │       -   - setSheetId: Lưu sheet id mới vào storage, hoặc mặc định khi null/rỗng.
│   ├─ context/
│   │   ├─ AuthContext.tsx
│   │       - - Component: AuthProvider - Cung cấp AuthContext cho ứng dụng và quản lý trạng thái xác thực.
│   │       - - Hook: useAuth - Truy cập và sử dụng AuthContext trong các component.
│   │       - - Function: safeJsonParse - Phân tích chuỗi JSON một cách an toàn, trả null khi lỗi.
│   │       - - Function: isExpired - Kiểm tra token đã hết hạn hay chưa.
│   │       - - Function: isSessionInvalidByServerMessage - Xử lý thông báo từ server để nhận diện session hết hạn hoặc hợp lệ.
│   │       - - Function: fetchJsonText - Thực thi fetch và trả về text/json kèm xử lý lỗi JSON.
│   │       - - Function: postActionJson - Gửi yêu cầu POST cho server Apps Script và trả json, ẩn trường mật khẩu trong log.
│   │       - - Function: getActionJson - Gửi yêu cầu GET cho server và trả json dựa trên trường ok.
│   │       - - Function: hydrate - Khởi tạo và đồng bộ trạng thái từ storage, xác thực token với server.
│   │       - - Function: clearLocal - Xóa thông tin đăng nhập khỏi state và storage.
│   │       - - Function: handleSessionExpired - Xử lý hết hạn phiên: có thể đóng modal hoặc vô hiệu hóa token.
│   │       - - Function: logout - Đăng xuất khỏi client, có thể gọi server để đăng xuất.
│   │       - - Function: ackSessionExpiredNotice - Đóng thông báo hết hạn và tiến hành đăng xuất.
│   │       - - Function: login - Đăng nhập, lưu token, user và thời hạn, trả kết quả ok/pending.
│   │       - - Function: register - Đăng ký người dùng mới và trả thông tin người dùng.
│   │       - - Function: verifyReset - Xác thực mã reset và trả token mã reset cùng expiresAt nếu có.
│   │       - - Function: resetPassword - Đặt lại mật khẩu bằng resetToken.
│   │       - - Function: refreshMe - Làm mới thông tin người dùng từ server và cập nhật token/người dùng.
│   │       - - Function: authedFetchJson - Gửi yêu cầu có xác thực (TOKEN) và xử lý timeout/ hết hạn theo mode.
│   │   ├─ DeviceGroupContext.tsx
│   │       - - DeviceGroupContext: Context quản lý dữ liệu nhóm thiết bị và các hành động liên quan.  
│   │       - - useDeviceGroup: Hook để truy cập DeviceGroupContext và bắt buộc dùng bên trong Provider.  
│   │       - - DeviceGroupProvider: Component cung cấp context và quản lý state deviceGroups, isDataFromCache, isSyncing.  
│   │       - - DeviceGroupContextType: Định nghĩa kiểu dữ liệu cho context (dữ liệu và hàm xử lý).  
│   │       - - deviceGroups state: Lưu trữ danh sách các nhóm thiết bị hiện có.  
│   │       - - isDataFromCache và isSyncing state: Quản lý nguồn dữ liệu và trạng thái đồng bộ.  
│   │       - - refreshAllData: Hàm đồng bộ dữ liệu từ API, cập nhật cache và trạng thái.  
│   │       - - appendHistoryAndSync: Hàm cập nhật lịch sử ngay trên UI rồi đồng bộ với server.  
│   │       - - Các hành động và phụ thuộc: dùng storage, KEY_ALL_DATA và API để đồng bộ dữ liệu.
│   │   ├─ OtaContext.tsx
│   │       - - components
│   │       -   - OtaProvider: Component React cung cấp trạng thái OTA và chức năng tải xuống cho các component con thông qua context.
│   │       - - hooks
│   │       -   - useOta: Hook trả về giá trị OTA từ context và đảm bảo được gọi trong OtaProvider.
│   │       - - functions
│   │       -   - startDownload: Hàm xử lý tải xuống và cài đặt OTA, cập nhật tiến độ và phiên bản sau khi thành công.
│   │   └─ ThemeContext.tsx
│   │       - - components
│   │       -   - ThemeProvider: Cung cấp ThemeContext và quản lý trạng thái chế độ màu (mode) và màu sắc cho app.
│   │       - - hooks
│   │       -   - useTheme: Lấy ThemeContext và bắt buộc nằm trong ThemeProvider.
│   │       - - functions
│   │       -   - ThemeContext: Tạo Context chia sẻ thông tin theme giữa các component.
│   │       -   - setMode: Lưu và cập nhật chế độ theme (dark/light) và cập nhật storage.
│   │       -   - toggleTheme: Đảo giữa dark và light mode.
│   ├─ declarations.d.ts
│       - - Định nghĩa module cho các file hình ảnh (*.png, *.jpg, *.jpeg, *.svg) cho phép import hình ảnh như một giá trị bất kỳ trong TypeScript.
│   ├─ generate_logo.py
│       - - functions
│       -   - main: Đọc nguồn logo.png, tạo thư mục output, sinh các icon Android có kích thước 48–192px và lưu ic_launcher.png ở từng thư mục.
│       - - hooks
│       -   - Không có hooks trong file.
│       - - components
│       -   - Không có components (Python script).
│       - - classes
│       -   - Không có classes (Python script).
│   ├─ hooks/
│   │   └─ useFirebaseNotifications.ts
│   │       - - functions: Không có hàm độc lập được export ngoài hook.
│   │       - - hooks: useFirebaseNotifications - Thiết lập xin quyền, đăng ký topic, lấy token và xử lý tin nhắn foreground qua Firebase Messaging và hiển thị thông báo.
│   ├─ logo.png
│   ├─ navigation/
│   │   └─ AppNavigator.tsx
│   │       - - Type: RootStackParamList — định nghĩa tham số cho Stack Navigator.
│   │       - - Component: AppNavigator — quản lý điều hướng ứng dụng dựa trên trạng thái xác thực.
│   │       - - Hook: useAuth — lấy trạng thái xác thực (isAuthed) để chọn stack.
│   │       - - Component: NavigationContainer — cung cấp ngữ cảnh điều hướng cho toàn app.
│   │       - - Component: Stack.Navigator — thiết lập ngăn xếp điều hướng với header ẩn.
│   │       - - Screen (auth): Login — màn hình đăng nhập.
│   │       - - Screen (auth): Register — màn hình đăng ký.
│   │       - - Screen (app): Loading — màn hình đang tải.
│   │       - - Screen (app): Home — màn hình trang chủ.
│   │       - - Screen (app): Scanner — màn hình quét.
│   │       - - Screen (app): Devices — màn hình quản lý thiết bị.
│   │       - - Screen (app): History — màn hình lịch sử.
│   │       - - Screen (app): Tools — màn hình công cụ.
│   │       - - Screen (app): Info — màn hình thông tin.
│   │       - - Screen (app): WebViewer — màn hình xem nội dung web.
│   │       - - Screen (app): Settings — màn hình cài đặt.
│   │       - - Screen (app): AdminUsers — màn hình quản trị người dùng.
│   │       - - Screen (app): Me — màn hình hồ sơ người dùng.
│   ├─ output/
│   │   ├─ mipmap-hdpi/
│   │   │   └─ ic_launcher.png
│   │   ├─ mipmap-mdpi/
│   │   │   └─ ic_launcher.png
│   │   ├─ mipmap-xhdpi/
│   │   │   └─ ic_launcher.png
│   │   ├─ mipmap-xxhdpi/
│   │   │   └─ ic_launcher.png
│   │   └─ mipmap-xxxhdpi/
│   │       └─ ic_launcher.png
│   ├─ screens/
│   │   ├─ AdminUsers.tsx
│   │       - - pad2: Chuyển số thành chuỗi hai chữ số để format thời gian.
│   │       - - formatIsoToVn: Chuyển date ISO sang định dạng ngày/tháng/năm giờ:phút ở VN hoặc dấu "-".
│   │       - - isSessionExpiredMessage: Kiểm tra chuỗi thông báo có chứa từ khóa hết phiên/unauthorized liên quan tới phiên làm việc.
│   │       - - postAdminAction: Gửi hành động quản trị và payload tới API và xử lý lỗi liên quan đến phiên.
│   │       - - fetchUsers: Lấy danh sách người dùng từ backend và cập nhật trạng thái UI.
│   │       - - AdminUsersScreen: Màn hình quản trị người dùng cho admin với tìm kiếm, danh sách và thao tác quản trị.
│   │       - - ConfirmModal: Modal xác nhận hành động với tiêu đề, thông báo và hai nút xác nhận/hủy.
│   │       - - SessionExpiredModal: Modal thông báo hết phiên và cho phép đăng nhập lại.
│   │       - - useEffect: Gọi fetchUsers khi người dùng có vai trò admin.
│   │       - - useMemo: Phân loại danh sách người dùng thành active/pending và lọc theo tab và từ khóa.
│   │       - - useState: Quản lý các state UI chính (loading, lỗi, danh sách, tìm kiếm, tab, modal và session).
│   │   ├─ Devices.tsx
│   │       - - Functions
│   │       -   - parseDate: chuyển chuỗi ngày dd-MM-yy thành Date để sắp xếp và so sánh.
│   │       -   - parseDeviceCode: tách fullCode thành group/kind/code để lấy các trường riêng.
│   │       -   - highlightText: trả về Text với phần chữ được highlight theo query.
│   │       - 
│   │       - - Hooks
│   │       -   - Quản lý trạng thái UI và hiệu ứng: dùng useState, useEffect, useMemo, useCallback, useRef và useFocusEffect để điều phối danh sách nhóm, modal, lọc và tìm kiếm.
│   │       - 
│   │       - - Components
│   │       -   - AppScreen, HeaderBar, BaseModal, EmptyState, AppButton và AddHistoryAction để xây dựng giao diện và chức năng chính.
│   │   ├─ History.tsx
│   │       - - Functions
│   │       -   - parseDate: Chuyển chuỗi ngày dd-mm-yy thành Date.
│   │       -   - parseDeviceCode: Phân tách mã thiết bị thành group, kind và code.
│   │       -   - highlightText: Tạo văn bản có phần được làm nổi dựa trên query tìm kiếm.
│   │       -   - handleSelectGroup: Xử lý chọn nhóm thiết bị và nạp dữ liệu lịch sử vào trạng thái.
│   │       -   - renderHistoryItem: render một mục lịch sử (thiết bị, ngày, nội dung).
│   │       -   - renderContent: Hiển thị nội dung lịch sử theo trạng thái đã chọn nhóm và dữ liệu.
│   │       - - Hooks
│   │       -   - useDeviceGroup: Lấy danh sách nhóm thiết bị từ context.
│   │       -   - useState: Quản lý trạng thái UI (modalVisible, selectedGroup, groupHistory, groupDevices, searchText, selectedDevices, deviceFilterOpen, fromDate, toDate, dateFilterOpen, topDeviceModalVisible).
│   │       -   - useMemo: Tối ưu hoá tính toán và tránh lặp lại các phép lọc và sắp xếp (các biến như groupNames, deviceMap, deviceNamesInGroup, filteredHistory, sections, summary, topDevicesDetail).
│   │       - - Components
│   │       -   - HistoryScreen: Màn hình hiển thị lịch sử bảo trì với chức năng chọn nhóm, tìm kiếm và lọc.
│   │   ├─ Info.tsx
│   │       - - Component: InfoScreen - Màn hình Thông tin hiển thị header, danh sách thẻ và nút thêm lịch sử.
│   │       - - Hook: useState - Quản lý biến lastPosted để hiển thị lịch sử mới nhất được đăng.
│   │       - - Component: AppScreen - Khung bố cục cho màn hình (container chính).
│   │       - - Component: HeaderBar - Thanh tiêu đề "Thông tin" có chức năng quay lại.
│   │       - - Component: AddHistoryAction - Nút hành động thêm lịch sử, mở modal và gửi dữ liệu.
│   │       - - Function: onPosted - Callback cập nhật lastPosted khi có lịch sử được đăng.
│   │   ├─ LoadingScreen.tsx
│   │       - - Component: LoadingScreen — hiển thị màn hình tải dữ liệu và điều hướng đến Home khi hoàn tất.
│   │       - - Hook: useNavigation — điều hướng giữa màn hình hiện tại và trang Home.
│   │       - - Hook: useDeviceGroup — truy cập và cập nhật dữ liệu device groups từ context.
│   │       - - Hook: useState — quản lý trạng thái, có dữ liệu cục bộ và meta dữ liệu.
│   │       - - Hook: useRef — lưu tham chiếu cho opacity và timeout.
│   │       - - Hook: useEffect — bootstrap dữ liệu khi mount và xử lý chuyển trang khi trạng thái ready.
│   │       - - Function: fetchAllData — gọi API lấy toàn bộ dữ liệu bảng, cập nhật meta và lưu cache.
│   │       - - Function: renderTitle — trả tiêu đề UI dựa trên trạng thái hiện tại.
│   │   ├─ Login.tsx
│   │       - - Components
│   │       -   - LoginScreen: Màn hình đăng nhập React Native tích hợp xác thực và quản lý quên mật khẩu.
│   │       - 
│   │       - - Hooks
│   │       -   - useState: Quản lý trạng thái UI và dữ liệu người dùng (username, password, rememberMe, v.v.).
│   │       -   - useEffect: Xử lý các side effects như prefill từ route và load dữ liệu remember me.
│   │       -   - useMemo: Tối ưu hóa và kiểm tra điều kiện submit.
│   │       -   - useRef: Quản lý tham chiếu tới TextInput để tập trung hoặc thao tác UI.
│   │       -   - useAuth: Cung cấp chức năng xác thực đăng nhập và quên mật khẩu từ context.
│   │       - 
│   │       - - Functions
│   │       -   - onSubmit: Xử lý đăng nhập khi người dùng nhấn đăng nhập.
│   │       -   - persistRemember: Lưu trữ trạng thái nhớ mật khẩu và dữ liệu đăng nhập nếu được chọn.
│   │       -   - onToggleRemember: Đổi trạng thái remember me và cập nhật lưu trữ ngay lập tức.
│   │       -   - openForgot: Mở tiến trình quên mật khẩu (bước 1) và chuẩn bị dữ liệu.
│   │       -   - submitVerify: Xác minh username và mã trong bước 1 quên mật khẩu.
│   │       -   - submitReset: Đặt lại mật khẩu sau khi có resetToken (bước 2).
│   │       -   - animStyle: Tạo phong cách/hiệu ứng cho animation của các phần UI.
│   │       -   - toggleShowPass: Ẩn/hiện mật khẩu và giữ tiêu điểm.
│   │   ├─ Me.tsx
│   │       - - Components
│   │       -   - MeScreen: Màn hình hồ sơ tài khoản hiển thị thông tin người dùng và các tác vụ Quick Actions.
│   │       -   - ConfirmModal: Thành phần modal xác nhận dùng chung cho các hành động cần xác nhận.
│   │       - 
│   │       - - Functions
│   │       -   - postAuthAction: Gửi hành động xác thực tới AUTH_WEBAPP_URL kèm token và payload và trả dữ liệu.
│   │       - 
│   │       - - Hooks
│   │       -   - useNavigation: Điều hướng giữa các màn hình bằng React Navigation.
│   │       -   - useAuth: Lấy người dùng, token và hàm logout từ AuthContext.
│   │       -   - useMemo: Tính displayName và badgeRole từ dữ liệu người dùng.
│   │       -   - useState: Quản lý trạng thái các modal và các trường mật khẩu và lỗi liên quan.
│   │   ├─ Register.tsx
│   │       - - RegisterScreen: màn hình đăng ký tài khoản nội bộ với form và xử lý xác thực người dùng.
│   │       - - Field: thành phần nhập liệu tùy chỉnh cho các trường trong form.
│   │       - - AppScreen: khung bố cục chung cho màn hình.
│   │       - - BaseModal: modal hiển thị trạng thái thành công sau đăng ký.
│   │       - - BackButton: nút quay về màn hình trước.
│   │       - - useAuth: hook xác thực cung cấp hàm đăng ký người dùng.
│   │       - - onSubmit: xử lý gửi yêu cầu đăng ký và quản lý trạng thái submit.
│   │       - - gotoLogin: điều hướng đến màn hình đăng nhập sau khi đăng ký thành công.
│   │       - - toggleShowPass: bật/tắt hiển thị mật khẩu và tập trung trường tương ứng.
│   │       - - toggleShowConfirm: bật/tắt hiển thị xác nhận mật khẩu và tập trung trường tương ứng.
│   │       - - canSubmit: điều kiện cho phép người dùng gửi đăng ký.
│   │       - - passwordMismatch: cảnh báo khi mật khẩu nhập lại không khớp.
│   │       - - useMemo: tối ưu hóa đánh giá điều kiện canSubmit dựa trên trạng thái form.
│   │       - - useRef: tham chiếu cho ScrollView và các TextInput để điều hướng nhanh.
│   │   ├─ Scanner.tsx
│   │       - - Functions
│   │       -   - parseDate: Chuyển đổi chuỗi ngày dd-MM-yy thành Date.
│   │       -   - parseDeviceCode: Phân tách fullCode thành group, kind và code.
│   │       -   - isProbablyUrl: Nhận diện chuỗi có thể là URL.
│   │       -   - findDeviceInfo: Tìm thiết bị và lịch sử tương ứng trong deviceGroups.
│   │       -   - resetPopupState: Đặt lại trạng thái popup và các trạng thái liên quan.
│   │       -   - processScannedValue: Phân tích giá trị quét để hiển thị popup tương ứng (device/url/text).
│   │       - 
│   │       - - Hooks
│   │       -   - useCameraDevice: Lấy thiết bị camera để dùng cho camera view.
│   │       -   - useCameraPermission: Kiểm tra và xin quyền truy cập camera.
│   │       -   - useCodeScanner: Cấu hình quét mã QR và xử lý sự kiện quét.
│   │       -   - useDeviceGroup: Truy xuất và cập nhật dữ liệu deviceGroups và lịch sử.
│   │       -   - useState: Quản lý trạng thái UI và dữ liệu như scannedValue, showPopup, flashOn, etc.
│   │       -   - useEffect: Quản lý các tác vụ phụ như cấp quyền, bật/tắt quét và hoạt ảnh capture.
│   │       - 
│   │       - - Components
│   │       -   - ScannerScreen: Màn hình quét QR với camera, chế độ flash, và popup hiển thị kết quả (thiết bị, URL hoặc nội dung văn bản).
│   │   ├─ Settings.tsx
│   │       - - components
│   │       -   - SettingsScreen: màn hình cài đặt cho API Base URL, Sheet ID và OTA, kèm quản lý lock/unlock và hiển thị modal.
│   │       - 
│   │       - - hooks
│   │       -   - useEffect: khởi tạo và đồng bộ giá trị API Base/Sheet ID từ storage khi màn hình được mount.
│   │       -   - useState: quản lý các trạng thái giao diện (giá trị input, trạng thái khóa, modal và OTA).
│   │       -   - useOta: cung cấp thông tin OTA và hành động tải xuống/cài đặt.
│   │       -   - useTheme: cung cấp chế độ giao diện và khả năng chuyển theme.
│   │       - 
│   │       - - functions
│   │       -   - handleSave: lưu cấu hình API Base và Sheet ID, dọn cache khi sheetId thay đổi, show thông báo thành công/ lỗi.
│   │       -   - handleResetToDefault: mở modal xác nhận reset về mặc định.
│   │       -   - handleConfirmReset: reset cấu hình về giá trị mặc định và hiển thị thông báo hoàn tất.
│   │       -   - handleGoToLoadingAfterReset: điều hướng tới màn hình Loading sau reset.
│   │       -   - requestUnlockField: xử lý yêu cầu mở khóa trường nhập và cảnh báo khi còn khóa.
│   │       -   - handleAfterSaveOk: đóng modal lưu và có thể chuyển đến Loading nếu cần.
│   │       -   - confirmUnlockDangerField: mở khóa trường được chọn sau xác nhận.
│   │       -   - cancelUnlockDangerField: hủy mở khóa và đóng cảnh báo.
│   │       -   - openOtaModal: hiển thị modal OTA với loại, tiêu đề và thông điệp.
│   │       -   - handleCheckOta: kiểm tra cập nhật OTA và xử lý các trường hợp có/không có bản mới hoặc lỗi.
│   │       -   - handleConfirmDownloadUpdate: tải xuống và cài đặt OTA, xử lý lỗi liên quan.
│   │       -   - handleCloseOtaModal: đóng modal OTA.
│   │   ├─ Tools.tsx
│   │       - - Component: ToolsScreen — Hiển thị giao diện màn hình Tools với icon và văn bản tiêu đề/chú thích.
│   │   ├─ WebViewerScreen.tsx
│   │       - - functions: Định nghĩa và export WebViewerScreen, nhận URL từ route và điều hướng quay lại.
│   │       - - hooks: Không có hook được sử dụng trong file.
│   │       - - components: WebViewerScreen — component React Native hiển thị WebView và BackButton.
│   │       - - classes: Không có.
│   │   └─ index.tsx
│   │       - - functions
│   │       -   - triggerTestNotification: hàm gửi thông báo thử nghiệm bằng Notifee.
│   │       -   - getFeatures: trả về danh sách chức năng dựa trên vai trò người dùng (admin hay không).
│   │       - - hooks
│   │       -   - useNavigation: điều hướng giữa các màn hình.
│   │       -   - useAuth: lấy thông tin người dùng từ AuthContext.
│   │       -   - useRef: quản lý tham chiếu cho Animated.Value scale.
│   │       -   - useMemo: tối ưu danh sách features dựa trên isAdmin.
│   │       - - components
│   │       -   - FeatureTile: component hiển thị tile chức năng với hiệu ứng nhấn và trạng thái sẵn sàng.
│   │       -   - IndexScreen: component màn hình chính hiển thị lưới chức năng và tiêu đề.
│   │       - - classes
│   │       -   - Không có lớp Python trong file.
│   ├─ services/
│   │   └─ otaService.ts
│   │       - - fetchLatestOta: Lấy thông tin OTA mới nhất từ server và trả về OtaInfo hoặc null.
│   │       - - isNewerVersion: So sánh phiên bản server với phiên bản hiện tại để xác định bản cập nhật có mới hơn hay không.
│   │       - - downloadAndInstallApk: Tải xuống và mở file APK trên Android, đồng thời dọn dẹp APK cũ trước khi tải.
│   │       - - OtaError: Lớp lỗi tùy chỉnh cho các loại lỗi OTA (NETWORK, HTTP, PLATFORM, DOWNLOAD, UNKNOWN).
│   ├─ theme/
│   │   └─ theme.ts
│   │       - - colors: định nghĩa bảng màu chủ đạo cho giao diện (background, surface, text các trạng thái như success/danger/warning).
│   │       - - spacing: định nghĩa các giá trị khoảng cách chuẩn cho layout (xs, sm, md, lg, xl).
│   │       - - radius: định nghĩa các bán kính bo cạnh chuẩn cho thành phần (sm, md, lg, pill).
│   ├─ types/
│   │   ├─ maintenance.ts
│   │       - - Định nghĩa các giá trị hành động bảo trì: Kiểm tra, Vệ sinh, Sửa chữa, Thay thế, Hiệu chuẩn.
│   │       - - Mô tả cấu trúc một mục lịch sử bảo trì của thiết bị.
│   │       - - Định nghĩa payload để thêm bản ghi bảo trì cho một thiết bị.
│   │   ├─ navigation.ts
│   │       - - Type RootStackParamList: Định nghĩa tham số cho các màn hình trong navigation (Loading, Home, Scanner, Devices, History với deviceId và deviceName, Tools, Info với url, WebViewer với url và title?, Me, Settings, Login với prefillUsername?, Register, AdminUsers).
│   │   ├─ react-native-vector-icons.d.ts
│   │       - - Định nghĩa module 'react-native-vector-icons/Ionicons' và export một component type cho Ionicons.
│   │       - - Định nghĩa component type Ionicons nhận TextProps và các prop name, size, color (export default).
│   │   └─ roles.ts
│   │       - - functions
│   │       -   - normalizeRoleId(value: any): RoleId — chuyển đổi và chuẩn hóa giá trị đầu vào thành RoleId, có xử lý alias và fallback
│   │       - - types
│   │       -   - RoleId — định danh các vai trò theo chuỗi cố định
│   │       -   - RoleOption — cấu trúc dữ liệu cho option vai trò gồm id, label, shortLabel và group
│   │       - - constants
│   │       -   - ROLE_OPTIONS — danh sách các vai trò với thông tin hiển thị và nhóm
│   │       -   - ROLE_LABEL — ánh xạ RoleId sang nhãn ngắn hoặc đầy đủ
│   └─ utils/
│       ├─ historyAdd.ts
│           - - HistoryRow: Định nghĩa kiểu dữ liệu lịch sử với deviceName, date (dd-MM-yy), content.  
│           - - pad2: Đệm số thành chuỗi hai chữ số nếu nhỏ hơn 10.  
│           - - todayDdMmYy: Trả về ngày hiện tại ở định dạng dd-mm-yy.  
│           - - isValidDdMmYy: Kiểm tra chuỗi ngày tháng ở định dạng dd-mm-yy có hợp lệ hay không.  
│           - - postAppendHistoryToAppScript: Gửi payload ghi lịch sử lên Google Apps Script và xử lý kết quả trả về.
│       └─ notifications.ts
│           - - Functions: ensureChannel — Tạo kênh thông báo Android với id "server-status-channel" và mức độ HIGH.
│           - - Functions: showServerStatusNotification — Hiển thị thông báo server status với tiêu đề và nội dung, đảm bảo kênh đã được tạo.
├─ test
├─ test2
└─ tsconfig.json