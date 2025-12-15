# Project Structure Summary

├─ .bundle/
│   └─ config
├─ .gitignore
├─ .watchmanconfig
├─ App.tsx
    - - App: hàm chính khởi tạo app, bao bọc providers và navigator; gọi useFirebaseNotifications.
    - - useFirebaseNotifications: hook đăng ký và xử lý thông báo Firebase khi app hoạt động.
    - - ThemeProvider: cung cấp ngữ cảnh chủ đề cho toàn app.
    - - DeviceGroupProvider: cung cấp ngữ cảnh nhóm thiết bị.
    - - OtaProvider: cung cấp ngữ cảnh OTA (cập nhật).
    - - NavigationContainer: khung điều hướng cho ứng dụng.
    - - Stack.Navigator: định nghĩa stack các màn hình với cấu hình header ẩn.
    - - LoadingScreen: màn hình tải lần đầu của ứng dụng.
    - - IndexScreen: màn hình chính (Home).
    - - ScannerScreen: màn hình quét thiết bị.
    - - DevicesScreen: màn hình danh sách thiết bị.
    - - HistoryScreen: màn hình lịch sử hoạt động.
    - - ToolsScreen: màn hình công cụ.
    - - InfoScreen: màn hình thông tin.
    - - WebViewerScreen: màn hình xem nội dung web.
    - - SettingsScreen: màn hình cài đặt.
├─ Gemfile
├─ PROJECT_STRUCTURE_SUMMARY.md
├─ README.md
├─ app.json
├─ babel.config.js
    - - Cấu hình Babel cho dự án React Native với preset "module:@react-native/babel-preset" và plugin "react-native-worklets/plugin".
├─ database.ts
    - - openDatabase: Mở kết nối SQLite và khởi tạo bảng nếu chưa có.
    - - createTables: Tạo/khởi tạo các bảng dữ liệu (systems, devices, maintenance).
    - - syncDataToDB: Đồng bộ dữ liệu từ server vào DB và ghi nhận log đồng bộ.
├─ export.py
    - - functions
    -   - clean_frontend_code: Loại bỏ CSS, inline styles và comment để làm sạch nội dung frontend trước khi tóm tắt.
    -   - summarize_file_with_gpt: Gọi OpenAI API để tạo bản tóm tắt kỹ thuật cho nội dung file theo prompt đã cho.
    -   - walk_dir: Duyệt thư mục, loại bỏ các thư mục loại trừ, đọc file mã nguồn và gắn tóm tắt cho mỗi file vào cấu trúc cây.
├─ index.js
    - - functions: getApp — Lấy instance Firebase App.
    - - functions: getMessaging — Lấy instance Messaging cho app.
    - - functions: setBackgroundMessageHandler — Đăng ký hàm xử lý tin nhắn FCM ở chế độ nền/quá trình thoát.
    - - functions: AppRegistry.registerComponent — Đăng ký component gốc của ứng dụng với AppRegistry.
    - - components: App — Component chính của ứng dụng.
├─ jest.config.js
    - - functions: Xuất module cấu hình chứa thuộc tính preset với giá trị 'react-native'.
    - - hooks: không có hooks.
    - - components: không có components (React/React Native).
    - - classes: không có classes (Python).
├─ metro.config.js
    - - functions
    -   - getDefaultConfig: Lấy cấu hình Metro mặc định cho dự án ở __dirname.
    -   - mergeConfig: Hợp nhất cấu hình tùy chỉnh với cấu hình Metro mặc định.
├─ package-lock.json
├─ package.json
├─ src/
│   ├─ assets/
│   │   └─ fonts/
│   │       └─ Ionicons.ttf
│   ├─ components/
│   │   ├─ DataSyncIndicator.tsx
│   │       - - components
│   │       -   - DataSyncIndicator - Thành phần React Native hiển thị trạng thái đồng bộ dữ liệu và cho phép tải lại dữ liệu, có tùy chọn vị trí inline hoặc cố định ở góc màn hình.
│   │       - 
│   │       - - hooks
│   │       -   - useDeviceGroup - Hook tùy chỉnh từ DeviceGroupContext cung cấp trạng thái đồng bộ và hàm làm mới dữ liệu.
│   │       -   - useEffect - Hook React dùng để tự động đồng bộ khi dữ liệu từ cache có sẵn và không đang đồng bộ.
│   │       - 
│   │       - - functions
│   │       -   - renderIcon - Hàm trả về icon tương ứng với trạng thái đồng bộ (đang đồng bộ, có dữ liệu từ cache, hoặc đã xong).
│   │   ├─ DateRangeFilter.tsx
│   │       - - functions
│   │       -   - pad2: chuyển số thành chuỗi 2 chữ số để định dạng ngày tháng
│   │       -   - ymdToDdMmYy: chuyển đổi ngày từ yyyy-MM-dd sang dd-MM-yy
│   │       -   - ddMmYyToYmd: chuyển đổi ngày từ dd-MM-yy sang yyyy-MM-dd
│   │       -   - todayYmd: trả về ngày hôm nay ở định dạng yyyy-MM-dd
│   │       - 
│   │       - - hooks
│   │       -   - useState: quản lý trạng thái mở modal và lưu tạm từ/đến ngày chọn
│   │       -   - useMemo: tối ưu hóa việc tính toán markedDates cho CalendarList dựa trên tempFrom/tempTo
│   │       - 
│   │       - - components
│   │       -   - DateRangeFilter: component lọc và hiển thị khoảng thời gian bằng calendar và modal
│   │       - 
│   │       - - classes
│   │       -   - (không có)
│   │   ├─ DateRangeFilterIOSDark.tsx
│   │       - - DateRangeNativePicker: Thành phần React Native cung cấp chọn ngày theo phạm vi từ-date đến đến-date với presets và hỗ trợ iOS/Android. 
│   │       - - PresetChip: Nút nhãn preset để nhanh chóng thiết lập phạm vi ngày. 
│   │       - - pad2: Hàm đệm số ngày thành chuỗi hai chữ số. 
│   │       - - dmyToDate: Hàm chuyển chuỗi ngày-tháng-năm định dạng dd-mm-yy sang Date. 
│   │       - - dateToDmy: Hàm chuyển Date sang chuỗi dd-mm-yy. 
│   │       - - clamp: Hàm giới hạn ngày trong phạm vi minDate maxDate. 
│   │       - - startOfMonth: Hàm lấy ngày đầu tháng của một ngày cho trước. 
│   │       - - addDays: Hàm cộng số ngày cho một ngày cho trước. 
│   │       - - useRef: Giữ tham chiếu cho Animated.Value phục vụ hiệu ứng hiển thị dropdown. 
│   │       - - useMemo: Tính toán minDate, maxDate và giá trị ngày hiện tại cho picker. 
│   │       - - useState: Quản lý trạng thái target (from hoặc to), trạng thái hiển thị Android picker, trạng thái mở iOS modal, và draft ngày iOS. 
│   │       - - useEffect: Quản lý hiệu ứng mở/đóng dropdown bằng hoạt ảnh khi prop open thay đổi. 
│   │       - - openPicker: Mở picker cho trường từ hoặc đến và chuyển đổi giao diện iOS/Android tương ứng. 
│   │       - - onAndroidPick: Xử lý kết quả chọn ngày trên Android và áp dụng ngày đã chọn. 
│   │       - - onClearOne: Xóa giá trị ngày cho một trong hai trường từ/đến. 
│   │       - - onReset: Đặt lại từ và đến về rỗng và đóng picker. 
│   │       - - setToday: Thiết lập phạm vi ngày bằng hôm nay cho cả từ và đến. 
│   │       - - setLastNDays: Thiết lập phạm vi ngày cho N ngày gần nhất đến today. 
│   │       - - setThisMonth: Thiết lập phạm vi từ đầu tháng đến ngày hôm nay. 
│   │       - - applyPicked: Áp dụng ngày được chọn cho trường đang active, với hoán đổi tự động nếu từ > đến.
│   │   ├─ addButton.tsx
│   │       - - functions: AddButton function trả về một component React Native hiển thị nút thêm và xử lý onPress.
│   │       - - components: AddButton component nút FAB cố định ở góc dưới bên phải, hiển thị icon thêm và nhận onPress.
│   │   ├─ backButton.tsx
│   │       - - components: BackButton - Nút quay lại hiển thị icon chevron và gọi onPress khi nhấn.
│   │   └─ ui/
│   │       ├─ AppButton.tsx
│   │           - - Component: AppButton - React Native button component with variant styling (primary/danger/secondary) and optional disabled state.
│   │       ├─ AppCard.tsx
│   │           - - components: AppCard — Component Card tùy chỉnh cho React Native nhận children và style và render trong một View.
│   │       ├─ AppScreen.tsx
│   │           - - components
│   │           -   - AppScreen: Functional React Native component cung cấp khung màn hình bằng SafeAreaView và container chứa nội dung với padding tùy chỉnh.
│   │       ├─ BaseModal.tsx
│   │           - - components: BaseModal - Thành phần modal tùy biến cho React Native, hiển thị nội dung (children) với backdrop mờ và cho phép đóng khi nhấn ngoài, kèm tuỳ chỉnh width và style.
│   │       ├─ EmptyState.tsx
│   │           - - functions: EmptyState — hàm component React Native hiển thị tiêu đề (nếu có) và thông báo ở giữa màn hình.
│   │           - - hooks: Không sử dụng hook trong file.
│   │           - - components: EmptyState — component UI hiển thị nội dung thông báo và tiêu đề tùy chọn từ props.
│   │           - - classes: Không có lớp (class) được định nghĩa trong file.
│   │       ├─ HeaderBar.tsx
│   │           - - components: HeaderBar — Component React Native hiển thị header gồm hàng trên có nút Back và DataSyncIndicator, hàng dưới hiển thị tiêu đề từ prop title.
│   │           - - functions: handleBack — Hàm xử lý sự kiện Back, gọi onBack nếu có được truyền vào.
│   │       └─ ScreenTitle.tsx
│   │           - - Component: ScreenTitle — Hiển thị tiêu đề màn hình bằng Text với style mặc định và cho phép tùy biến qua prop style.
│   ├─ config/
│   │   └─ apiConfig.ts
│   │       - - functions
│   │       -   - getApiBase: Lấy API base từ storage MMKV hoặc trả về DEFAULT_API_BASE.
│   │       -   - getSheetId: Lấy Sheet ID từ storage MMKV hoặc trả về DEFAULT_SHEET_ID.
│   │       -   - resetConfig: Đặt lại các cấu hình về giá trị mặc định trong MMKV và trả về boolean thành công.
│   │       -   - setApiBase: Lưu API base vào MMKV; nếu null hoặc rỗng, đặt về DEFAULT_API_BASE.
│   │       -   - setSheetId: Lưu Sheet ID vào MMKV; nếu null hoặc rỗng, đặt về DEFAULT_SHEET_ID.
│   ├─ context/
│   │   ├─ DeviceGroupContext.tsx
│   │       - - Hook: useDeviceGroup — truy cập và bắt buộc dùng trong DeviceGroupProvider để làm việc với DeviceGroupContext.
│   │       - - Component: DeviceGroupProvider — cung cấp DeviceGroupContext cho cây React và quản lý trạng thái deviceGroups, isDataFromCache, isSyncing.
│   │       - - Function: refreshAllData — đồng bộ dữ liệu từ API, cập nhật dữ liệu và trạng thái, lưu dữ liệu vào storage và ghi log.
│   │   ├─ OtaContext.tsx
│   │       - - Component: OtaProvider — React component cung cấp OtaContext và quản lý trạng thái OTA.
│   │       - - Hook: useOta — Custom hook để truy cập OtaContext.
│   │       - - Function: startDownload — Hàm bắt đầu tải và cài đặt OTA, cập nhật tiến độ và phiên bản.
│   │   └─ ThemeContext.tsx
│   │       - - components: ThemeProvider — component React quản lý trạng thái theme và cung cấp ThemeContext cho ứng dụng.
│   │       - - hooks: useTheme — hook tùy biến để truy cập ThemeContext và đảm bảo dùng trong ThemeProvider.
│   │       - - functions: setMode, toggleTheme — xử lý cập nhật và lưu trữ chế độ theme.
│   ├─ generate_logo.py
│       - - functions
│       -   - main: Đọc ảnh nguồn, tạo thư mục output và các thư mục con cho từng kích thước, resize ảnh thành các icon Android và lưu vào thư mục tương ứng.
│   ├─ hooks/
│   │   └─ useFirebaseNotifications.ts
│   │       - - hooks: useFirebaseNotifications — Thiết lập và xử lý thông báo đẩy Firebase trong ứng dụng (xin quyền, đăng ký topic, lấy token, lắng nghe tin nhắn ở foreground và hiển thị thông báo).
│   ├─ logo.png
│   ├─ navigation/
│   │   └─ AppNavigation.tsx
│   │       - - functions: AppNavigator - Định nghĩa component điều hướng chính sử dụng NavigationContainer và Stack.Navigator.
│   │       - - hooks: Không có hooks được sử dụng trong file.
│   │       - - components: AppNavigator - Định nghĩa NavigationContainer và Stack.Navigator chứa các màn hình; IndexScreen - Màn hình Index được đăng ký trong navigator; Scanner - Màn hình Scanner được đăng ký trong navigator.
│   │       - - classes: Không có.
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
│   │   ├─ Devices.tsx
│   │       - - parseDate: Chuyển chuỗi ngày dạng "dd-MM-yy" thành đối tượng Date.
│   │       - - parseDeviceCode: Phân tích mã thiết bị thành group, kind và code.
│   │       - - highlightText: Sinh và trả về phần văn bản được làm nổi bật theo truy vấn tìm kiếm.
│   │       - - useMemo: Tối ưu hoá tính toán danh sách nhóm, loại và thiết bị sau lọc.
│   │       - - useState: Quản lý trạng thái giao diện như nhóm được chọn, modal hiển thị, tìm kiếm và lọc.
│   │       - - useCallback: Tăn cường hiệu suất cho các hàm callback liên quan đến lifecycle/hiệu ứng.
│   │       - - useEffect: Điều khiển hoạt ảnh dropdown và reset trạng thái khi rời màn hình.
│   │       - - useRef: Giữ tham chiếu tới Animated.Value cho hiệu ứng dropdown.
│   │       - - useFocusEffect: Reset trạng thái UI khi rời khỏi màn hình Devices.
│   │       - - DevicesScreen: Màn hình hiển thị danh sách nhóm thiết bị với grid và hai modal (thiết bị trong nhóm, lịch sử bảo trì).
│   │   ├─ History.tsx
│   │       - - parseDate: chuyển chuỗi ngày dd-MM-yy thành Date để so sánh thời gian.
│   │       - - parseDeviceCode: phân tách mã thiết bị thành group, kind, code từ chuỗi như PM5-VFD-61-27002.
│   │       - - highlightText: ghép nổi bật phần khớp với truy vấn trong chuỗi hiển thị.
│   │       - - HistoryScreen: màn hình hiển thị lịch sử bảo trì với chọn nhóm, lọc theo thiết bị và ngày, và tìm kiếm.
│   │       - - useDeviceGroup: lấy danh sách nhóm thiết bị từ context để dựng danh sách nhóm và bảng devices.
│   │       - - useState: quản lý trạng thái UI như modal chọn nhóm, filter và các filter khác.
│   │       - - useMemo: tối ưu hóa tính toán và lọc dữ liệu lịch sử theo trạng thái người dùng.
│   │   ├─ Info.tsx
│   │       - - components
│   │       -   - InfoScreen: Hiển thị màn hình Thông tin với header và danh sách thẻ thông tin
│   │       -   - AppScreen: Khung bố cục màn hình cho ứng dụng
│   │       -   - HeaderBar: Thanh tiêu đề với nút quay lại
│   │   ├─ LoadingScreen.tsx
│   │       - - Component: LoadingScreen – hiển thị màn hình loading, quản lý trạng thái dữ liệu và điều hướng đến Home khi xong.
│   │       - - Hook: useState – quản lý trạng thái (status, hasLocalData) và metadata dữ liệu (totalTable, validTable, errTable).
│   │       - - Hook: useEffect – thực thi bootstrap tải dữ liệu và xử lý chuyển trang khi hoàn tất.
│   │       - - Hook: useRef – lưu tham chiếu cho Animated.Value và timeout để điều khiển hiệu ứng và dọn dẹp.
│   │       - - Hook: useNavigation – cung cấp điều hướng để chuyển sang màn hình Home.
│   │       - - Hook: useDeviceGroup – cập nhật danh sách deviceGroups và trạng thái nguồn dữ liệu (cache hay tải mới).
│   │       - - Function: fetchAllData – gọi API, phân tích kết quả, cập nhật trạng thái và lưu cache dữ liệu.
│   │       - - Function: renderTitle – trả về tiêu đề giao diện dựa trên trạng thái và dữ liệu.
│   │       - - Ghi chú: phần UI và style được dùng để hiển thị trạng thái loading và thông tin meta, không nằm ngoài danh mục trên.
│   │   ├─ Scanner.tsx
│   │       - - parseDate: Hàm phân tích chuỗi ngày ở định dạng dd-MM-yy thành đối tượng Date để phục vụ sắp xếp lịch sử.
│   │       - - isProbablyUrl: Hàm nhận diện chuỗi có thể là URL hoặc tên miền ngắn dựa trên cú pháp và ký tự.
│   │       - - findDeviceInfo: Hàm duyệt qua danh sách deviceGroups để lấy thông tin nhóm và lịch sử liên quan của một thiết bị.
│   │       - - resetPopupState: Hàm reset toàn bộ trạng thái popup và các trường liên quan sau khi đóng hoặc kết thúc xử lý.
│   │       - - processScannedValue: Hàm phân loại giá trị quét thành thiết bị/url/text và kích hoạt popup tương ứng.
│   │       - - handleOpenUrl: Hàm mở liên kết được quét trong WebViewer.
│   │       - - ScannerScreen: Component màn hình quét QR với camera, overlay và popup hiển thị kết quả.
│   │       - - useCameraDevice: Hook lấy thiết bị camera để dùng (ví dụ phía sau).
│   │       - - useCameraPermission: Hook kiểm tra và yêu cầu quyền truy cập camera.
│   │       - - useCodeScanner: Hook quét mã QR và kích hoạt chu trình bắt mã.
│   │   ├─ Settings.tsx
│   │       - - Component: SettingsScreen — Màn hình Settings hiển thị tùy chọn cấu hình và OTA, điều hướng và hiển thị modals.  
│   │       - - Hook: useEffect — Khởi tạo và đồng bộ API Base URL và Sheet ID từ cấu hình khi màn hình được mount.  
│   │       - - Hook: useState (nhóm trạng thái giao diện) — Quản lý các trạng thái input, khóa trường, modal và trạng thái OTA.  
│   │       - - Hook: useOta — Lấy thông tin OTA và điều khiển quá trình tải cập nhật.  
│   │       - - Hook: useTheme — Lấy chủ đề giao diện và cho phép chuyển đổi theme.  
│   │       - - Function: handleSave — Lưu API Base URL và Sheet ID, làm sạch cache nếu sheetId thay đổi, hiển thị kết quả lưu.  
│   │       - - Function: handleResetToDefault — Mở modal xác nhận đặt lại về mặc định.  
│   │       - - Function: handleConfirmReset — Đặt lại cấu hình về mặc định và cập nhật trạng thái hiển thị.  
│   │       - - Function: handleGoToLoadingAfterReset — Điều hướng tới màn hình Loading sau khi reset thành công.  
│   │       - - Function: requestUnlockField — Yêu cầu mở khóa trường và hiện cảnh báo nếu đang khóa.  
│   │       - - Function: handleAfterSaveOk — Xử lý sau khi lưu thành công và có thể điều hướng sau lưu.  
│   │       - - Function: confirmUnlockDangerField — Mật khóa trường được xác nhận mở khóa và đóng modal cảnh báo.  
│   │       - - Function: cancelUnlockDangerField — Hủy bỏ việc mở khóa và đóng modal cảnh báo.  
│   │       - - Function: openOtaModal — Mở modal OTA với loại, tiêu đề và thông báo tuỳ biến.  
│   │       - - Function: handleCheckOta — Kiểm tra cập nhật OTA, xử lý có bản cập nhật mới hoặc lỗi kết nối/HTTP.  
│   │       - - Function: handleConfirmDownloadUpdate — Bắt đầu tải và cài đặt OTA hoặc hiển thị lỗi khi gặp sự cố.  
│   │       - - Function: handleCloseOtaModal — Đóng modal OTA.
│   │   ├─ Tools.tsx
│   │       - - functions: ToolsScreen là hàm React Native trả về UI màn hình Tools.
│   │       - - components: ToolsScreen hiển thị icon, tiêu đề và chú thích trên màn hình Tools.
│   │   ├─ WebViewerScreen.tsx
│   │       - - components: WebViewerScreen — màn hình React Native hiển thị WebView cho URL từ route và nút quay lại.
│   │       - - hooks: Không có hook React nào được sử dụng trong file.
│   │       - - functions: Không có hàm độc lập được định nghĩa (chỉ có component function).
│   │       - - classes: Không có lớp Python được định nghĩa.
│   │   └─ index.tsx
│   │       - - triggerTestNotification: Phát thông báo thử nghiệm bằng Notifee với channel và mức độ HIGH trên Android.
│   │       - - useNavigation: Hook để điều hướng giữa các màn hình trong component.
│   │       - - useRef: Hook lưu trữ tham chiếu Animated.Value cho hiệu ứng phóng/thu nhỏ tile.
│   │       - - FeatureTile: Thành phần tile hiển thị chức năng với icon, tiêu đề, trạng thái sẵn sàng và hiệu ứng nhấn.
│   │       - - IndexScreen: Màn hình chính hiển thị header và danh sách lưới các tile chức năng.
│   ├─ services/
│   │   └─ otaService.ts
│   │       - - functions
│   │       -   - fetchLatestOta: Lấy OTA mới nhất từ server, trả về OtaInfo hoặc null.
│   │       -   - isNewerVersion: So sánh serverVersion và currentVersion để xác định bản cập nhật có mới hay không.
│   │       -   - downloadAndInstallApk: Tải APK OTA, dọn dẹp APK cũ trong Downloads, lưu file và mở trình cài đặt.
│   │       - - classes
│   │       -   - OtaError: Lỗi tùy biến cho OTA với loại lỗi và trạng thái HTTP (nếu có).
│   ├─ theme/
│   │   └─ theme.ts
│   │       - - colors: Định nghĩa bảng màu giao diện cho nền, surface, văn bản và trạng thái.
│   │       - - spacing: Định nghĩa hệ thống khoảng cách chuẩn cho layout (xs–xl).
│   │       - - radius: Định nghĩa bán kính bo góc chuẩn cho các thành phần (sm–pill).
│   ├─ types/
│   │   ├─ maintenance.ts
│   │       - - MaintenanceActionType: định nghĩa union type cho các hành động bảo trì (Kiểm tra, Vệ sinh, Sửa chữa, Thay thế, Hiệu chuẩn).
│   │       - - MaintenanceHistoryItem: định nghĩa interface cho mục lưu trữ lịch sử bảo trì với các trường id, device_id, action_type, action_desc, performed_by, action_date, created_at.
│   │       - - AddMaintenancePayload: định nghĩa interface cho payload thêm bảo trì cho thiết bị với các trường device_id, action_type, action_desc, performed_by, action_date.
│   │       - - File chứa định nghĩa kiểu dữ liệu cho bảo trì; không có chức năng (functions/hooks/components/classes).
│   │   ├─ navigation.ts
│   │       - - RootStackParamList là kiểu (type) dùng cho React Navigation, định nghĩa các route và tham số tương ứng.
│   │       - - Home: route không tham số.
│   │       - - Scanner: route không tham số.
│   │       - - Devices: route không tham số.
│   │       - - History: route có tham số deviceId và deviceName.
│   │       - - Tools: route không tham số.
│   │       - - Info: route có tham số url.
│   │       - - WebViewer: route có tham số url.
│   │       - - SystemManager: route có tham số id và name.
│   │       - - Data: route không tham số.
│   │       - - Settings: route không tham số.
│   │       - - Loading: route không tham số.
│   │   └─ react-native-vector-icons.d.ts
│   │       - - Component: Ionicons (default export) - React component type rendering Ionicons, nhận props name, size, color và kế thừa TextProps.
│   └─ utils/
│       └─ notifications.ts
│           - - functions
│           -   - ensureChannel: Đảm bảo channel thông báo Android có id 'server-status-channel' được tạo.
│           -   - showServerStatusNotification: Hiển thị thông báo server status với tiêu đề và nội dung, dùng channel Android đã được đảm bảo.
├─ test
├─ test.js
├─ test2
└─ tsconfig.json