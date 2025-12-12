# Project Structure Summary

├─ .bundle/
│   └─ config
├─ .gitignore
├─ .watchmanconfig
├─ App.tsx
    - - Functions: App — Hàm chính khởi tạo ứng dụng và trả về cây component với providers và navigator.
    - - Hooks: useFirebaseNotifications — Thiết lập lắng nghe thông báo Firebase khi ứng dụng chạy.
    - - Components: DeviceGroupProvider — Cung cấp context nhóm thiết bị cho toàn app.
    - - Components: OtaProvider — Cung cấp context OTA cho toàn app.
    - - Components: LoadingScreen — Màn hình tải dữ liệu ban đầu.
    - - Components: IndexScreen — Màn hình chính của ứng dụng.
    - - Components: ScannerScreen — Màn hình quét thiết bị.
    - - Components: DevicesScreen — Màn hình danh sách thiết bị.
    - - Components: HistoryScreen — Màn hình lịch sử.
    - - Components: ToolsScreen — Màn hình công cụ.
    - - Components: InfoScreen — Màn hình thông tin.
    - - Components: WebViewerScreen — Màn hình xem nội dung web.
    - - Components: SettingsScreen — Màn hình cài đặt.
├─ Gemfile
├─ README.md
├─ app.json
├─ babel.config.js
    - - presets: Cung cấp preset Babel cho React Native.
    - - plugins: Thêm plugin react-native-worklets để hỗ trợ worklets.
├─ database.ts
    - - Functions
    -   - openDatabase: Mở kết nối SQLite và khởi tạo bảng, trả về đối tượng DB.
    -   - createTables: Thiết lập cấu trúc bảng cho DB (systems, devices, maintenance).
    -   - syncDataToDB: Đồng bộ dữ liệu từ nguồn lên DB bằng cách xóa và chèn lại dữ liệu của các bảng tương ứng.
├─ export.py
    - - functions
    -   - clean_frontend_code: Loại bỏ CSS, class và style cùng các comment để làm sạch nội dung frontend trước khi tóm tắt.
    -   - summarize_file_with_gpt: Gửi nội dung file tới OpenAI để tạo bản tóm tắt kỹ thuật dạng bullet points.
    -   - walk_dir: Dò cây thư mục, loại bỏ thư mục/tệp không cần thiết và thu thập danh sách file có thể tóm tắt.
├─ index.js
    - - getApp: Lấy instance Firebase app đang sử dụng.
    - - getMessaging: Lấy dịch vụ Messaging từ ứng dụng Firebase.
    - - setBackgroundMessageHandler: Đăng ký trình xử lý tin nhắn nhận ở nền/thoát.
    - - App: Component React Native chính của ứng dụng.
    - - AppRegistry.registerComponent: Đăng ký component gốc của ứng dụng với React Native để khởi chạy.
├─ jest.config.js
    - - functions: Không có hàm được định nghĩa trong file.
    - - hooks: Không có hook được định nghĩa trong file.
    - - components: Không có component React Native được định nghĩa trong file.
    - - classes: Không có lớp Python được định nghĩa trong file.
├─ metro.config.js
    - - functions
    -   - getDefaultConfig: Lấy cấu hình Metro mặc định cho dự án React Native.
    -   - mergeConfig: Hợp nhất cấu hình tùy chỉnh với cấu hình mặc định.
├─ package-lock.json
├─ package.json
├─ src/
│   ├─ assets/
│   │   └─ fonts/
│   │       └─ Ionicons.ttf
│   ├─ components/
│   │   ├─ DataSyncIndicator.tsx
│   │       - - components
│   │       -   - DataSyncIndicator: Hiển thị trạng thái đồng bộ dữ liệu và cho phép làm mới bằng nút nhấn.
│   │       - - hooks
│   │       -   - useEffect: Theo dõi thay đổi dữ liệu và tự động đồng bộ khi dữ liệu từ cache và không đang đồng bộ.
│   │       -   - useDeviceGroup: Lấy trạng thái và hàm refreshAllData từ DeviceGroupContext.
│   │       - - functions
│   │       -   - renderIcon: Trả về icon phù hợp với trạng thái đồng bộ (đang đồng bộ, từ cache, hoặc đã đồng bộ).
│   │   ├─ addButton.tsx
│   │       - - functions: AddButton - Hàm/component React Native nhận onPress và style để hiển thị nút thêm.
│   │       - - hooks: Không có hook được sử dụng.
│   │       - - components: AddButton - Nút FAB hiển thị biểu tượng "add" từ Ionicons và xử lý nhấn.
│   │       - - classes: Không có.
│   │   └─ backButton.tsx
│   │       - - components: BackButton - Thành phần React Native hiển thị nút quay lại có icon chevron, nhận onPress và style tùy chọn.
│   ├─ config/
│   │   └─ apiConfig.ts
│   │       - - functions
│   │       -   - getApiBase: Lấy api_base từ storage, nếu rỗng dùng DEFAULT_API_BASE.
│   │       -   - getSheetId: Lấy sheet_id từ storage, nếu rỗng dùng DEFAULT_SHEET_ID.
│   │       -   - resetConfig: Đặt lại api_base, sheet_id và allData về giá trị mặc định trong storage.
│   │       -   - setApiBase: Lưu api_base vào storage, với fallback DEFAULT_API_BASE khi giá trị rỗng hoặc null.
│   │       -   - setSheetId: Lưu sheet_id vào storage, với fallback DEFAULT_SHEET_ID khi giá trị rỗng hoặc null.
│   ├─ context/
│   │   ├─ DeviceGroupContext.tsx
│   │       - - Hooks
│   │       -   - useDeviceGroup: trả về context DeviceGroupContext và ném lỗi nếu dùng ngoài Provider.
│   │       - 
│   │       - - Components
│   │       -   - DeviceGroupProvider: component React.FC cung cấp DeviceGroupContext và quản lý state đồng bộ dữ liệu.
│   │       - 
│   │       - - Functions
│   │       -   - refreshAllData: hàm bất đồng bộ tải dữ liệu từ API, lưu cache và cập nhật state nội bộ.
│   │   └─ OtaContext.tsx
│   │       - - OtaContext: Context lưu trạng thái OTA và hàm bắt đầu tải.  
│   │       - - OtaProvider: Component provider cho OtaContext, quản lý trạng thái tải và bản build.  
│   │       - - useOta: Hook để truy cập OtaContext từ các component khác.  
│   │       - - startDownload: Hàm bắt đầu tải và cài đặt OTA, bỏ qua khi đang tải và cập nhật tiến độ/phiên bản.
│   ├─ generate_logo.py
│       - - functions: main – điều phối toàn bộ quá trình chạy script: kiểm tra nguồn ảnh, tạo thư mục output, mở và chuẩn hóa ảnh, resize và lưu ic_launcher.png cho từng kích thước đã định.
│   ├─ hooks/
│   │   └─ useFirebaseNotifications.ts
│   │       - - Functions: Không có hàm độc lập (ngoài hook export).
│   │       - - Hooks: useFirebaseNotifications — Thiết lập quyền nhận thông báo, đăng ký topic, lấy token, và xử lý tin nhắn ở foreground để hiển thị thông báo.
│   │       - - Components: Không có.
│   │       - - Classes: Không có.
│   ├─ logo.png
│   ├─ navigation/
│   │   └─ AppNavigation.tsx
│   │       - - Function: AppNavigator — Định nghĩa component điều hướng chính cho ứng dụng bằng NavigationContainer và Stack.Navigator.
│   │       - - Function: createNativeStackNavigator — Hàm tạo Stack Navigator để điều phối màn hình.
│   │       - - Component: NavigationContainer — Cung cấp ngữ cảnh điều hướng cho toàn bộ ứng dụng.
│   │       - - Component: Stack.Navigator — Quản lý danh sách màn hình theo cấu trúc stack.
│   │       - - Component: Stack.Screen — Định nghĩa một màn hình cụ thể đăng ký trong navigator với tên và component.
│   │       - - Component: IndexScreen — Màn hình Index được đưa vào navigator.
│   │       - - Component: Scanner — Màn hình Scanner được đưa vào navigator.
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
│   │       - - Functions
│   │       -   - parseDate: Hàm chuyển đổi chuỗi ngày từ định dạng dd-MM-yy thành ngày Date.
│   │       - 
│   │       - - Hooks
│   │       -   - useDeviceGroup: Lấy danh sách nhóm thiết bị từ DeviceGroupContext.
│   │       -   - useFocusEffect: Reset trạng thái giao diện khi rời khỏi màn hình Devices.
│   │       -   - useMemo: Tính toán nhóm được chọn và danh sách thiết bị trong nhóm.
│   │       -   - useState: Quản lý trạng thái UI như nhóm chọn, modal hiển thị và lịch sử.
│   │       - 
│   │       - - Components
│   │       -   - DevicesScreen: Thành phần màn hình quản lý danh sách nhóm và các modal thiết bị, lịch sử.
│   │       -   - BackButton: Thành phần tùy chỉnh để quay lại.
│   │       -   - DataSyncIndicator: Thành phần hiển thị trạng thái đồng bộ dữ liệu.
│   │       -   - SafeAreaView: Thành phần bố trí giao diện an toàn cho màn hình.
│   │       -   - View: Thành phần container để bố trí các phần UI.
│   │       -   - Text: Thành phần hiển thị văn bản.
│   │       -   - FlatList: Hiển thị danh sách nhóm dưới dạng lưới 2 cột.
│   │       -   - Modal: Hiển thị hộp thoại cho danh sách thiết bị và lịch sử.
│   │       -   - ScrollView: Khu vực cuộn cho nội dung trong modal.
│   │       -   - TouchableOpacity: Nút nhấn cho tương tác (mở nhóm, xem lịch sử, đóng modal).
│   │   ├─ History.tsx
│   │       - - functions: parseDate — Chuyển đổi chuỗi ngày định dạng "dd-MM-yy" thành Date.
│   │       - - functions: HistoryScreen — Thành phần màn hình hiển thị lịch sử bảo trì và xử lý lựa chọn nhóm.
│   │       - - hooks: useState — Quản lý trạng thái modalVisible, selectedGroup và historyData.
│   │       - - hooks: useMemo — Tối ưu danh sách groupNames từ deviceGroups.
│   │       - - hooks: useDeviceGroup — Truy cập danh sách deviceGroups từ context.
│   │       - - components: HistoryScreen — Hài hòa giao diện và logic hiển thị lịch sử cho người dùng.
│   │       - - components: BackButton — Thành phần trở về (nút quay lại) được dùng trong màn hình.
│   │       - - components: DataSyncIndicator — Thành phần hiển thị trạng thái đồng bộ dữ liệu.
│   │   ├─ Info.tsx
│   │       - - Functions
│   │       -   - InfoScreen: component/function chính để hiển thị màn hình Thông tin với header và danh sách thẻ.
│   │       - 
│   │       - - Hooks
│   │       -   - Không có.
│   │       - 
│   │       - - Components
│   │       -   - BackButton: nút quay về ở góc trái được dùng trong InfoScreen.
│   │       -   - DataSyncIndicator: chỉ thị đồng bộ dữ liệu ở góc phải được dùng trong InfoScreen.
│   │       -   - InfoScreen: component chính của màn hình Thông tin. 
│   │       - 
│   │       - - Classes
│   │       -   - Không có.
│   │   ├─ LoadingScreen.tsx
│   │       - - Component: LoadingScreen — Màn hình tải dữ liệu, hiển thị trạng thái và tự động điều hướng đến Home khi hoàn tất.
│   │       - - Hooks:
│   │       -   - useNavigation — Lấy đối tượng điều hướng để chuyển màn hình.
│   │       -   - useDeviceGroup — Kết nối với context DeviceGroup để đọc/ghi nhóm thiết bị.
│   │       -   - useState (status) — Quản lý trạng thái chu trình tải (checking/loadingNew/ready).
│   │       -   - useState (hasLocalData) — Theo dõi có dữ liệu từ bộ nhớ hay không.
│   │       -   - useState (totalTable/validTable/errTable) — Quản lý meta dữ liệu từ API.
│   │       -   - useRef (opacity) — Lưu tham chiếu Animated.Value cho hiệu ứng mờ dần.
│   │       -   - useRef (timeoutRef) — Lưu tham chiếu timeout để điều khiển chuyển màn hình.
│   │       -   - useEffect (bootstrap) — Khởi động bootstrap dữ liệu và đồng bộ cache/local storage.
│   │       -   - useEffect (status ready) — Khi trạng thái ready, kích hoạt mờ dần và điều hướng.
│   │       - - Functions:
│   │       -   - fetchAllData — Gọi API lấy toàn bộ dữ liệu, cập nhật cache và context.
│   │       -   - bootstrap — Khởi động dữ liệu từ local storage hoặc tải dữ liệu mới.
│   │       -   - renderTitle — Sinh tiêu đề UI dựa trên trạng thái hiện tại.
│   │   ├─ Scanner.tsx
│   │       - - useCameraDevice: chọn thiết bị camera phía sau cho quét mã.  
│   │       - - useCameraPermission: quản lý quyền truy cập camera và yêu cầu khi cần.  
│   │       - - useCodeScanner: cấu hình quét QR và xử lý khi có mã được quét.  
│   │       - - useEffect: quản lý các side effect như yêu cầu quyền và đợi camera ổn định.  
│   │       - - useRef: nắm giữ tham chiếu tới giá trị Animated cho hiệu ứng bắt mã.  
│   │       - - useState: quản lý nhiều trạng thái như scannedValue, showPopup, flashOn, scanType, deviceGroupName, deviceHistory, scanReady, isCapturing, pendingValue.  
│   │       - - ScannerScreen: component React Native hiển thị camera, khung quét, và popup kết quả.  
│   │       - - parseDate: chuyển đổi chuỗi ngày dd-MM-yy thành Date.  
│   │       - - isProbablyUrl: xác định chuỗi có phải URL hoặc domain hay không.  
│   │       - - findDeviceInfo: tìm thông tin thiết bị trong deviceGroups dựa trên tên quét.  
│   │       - - resetPopupState: reset trạng thái popup và trạng thái quét sau khi đóng.  
│   │       - - processScannedValue: phân loại giá trị quét thành device/url/text rồi hiện popup.  
│   │       - - handleOpenUrl: mở liên kết đã quét trong WebViewer.  
│   │       - - renderPopupContent: sinh nội dung popup dựa trên loại quét.
│   │   ├─ Settings.tsx
│   │       - - Component: SettingsScreen — màn hình Cài đặt cho API Base URL, Sheet ID và OTA cùng quản lý modal/nhắc nhở. 
│   │       - - Hook: useState (nhiều biến) — quản lý trạng thái các trường nhập, khóa, modal và OTA. 
│   │       - - Hook: useEffect — khởi tạo và tải giá trị cấu hình ban đầu từ config. 
│   │       - - Hook: useOta — tích hợp OTA để theo dõi phiên bản, trạng thái tải và bắt đầu tải. 
│   │       - - Function: handleSave — lưu API Base URL và Sheet ID, dọn cache khi Sheet ID thay đổi. 
│   │       - - Function: handleResetToDefault — hiện modal xác nhận đặt lại mặc định. 
│   │       - - Function: handleConfirmReset — reset cấu hình về mặc định và thông báo 완료. 
│   │       - - Function: handleGoToLoadingAfterReset — điều hướng đến màn hình Loading sau reset. 
│   │       - - Function: requestUnlockField — xử lý mở khóa trường hoặc hiển thị cảnh báo trước khi unlock. 
│   │       - - Function: handleAfterSaveOk — đóng modal lưu thành công và có thể trở về Loading. 
│   │       - - Function: confirmUnlockDangerField — cấp quyền chỉnh sửa trường đã được xác nhận. 
│   │       - - Function: cancelUnlockDangerField — hủy bỏ cấp quyền chỉnh sửa. 
│   │       - - Function: openOtaModal — hiển thị modal OTA với loại, tiêu đề và thông báo tương ứng. 
│   │       - - Function: handleCheckOta — kiểm tra bản cập nhật OTA và xử lý các trường hợp có/hông có cập nhật. 
│   │       - - Function: handleConfirmDownloadUpdate — tải và cài đặt OTA hoặc hiển thị lỗi. 
│   │       - - Function: handleCloseOtaModal — đóng modal OTA. 
│   │       - - Imported Component: BackButton — nút quay lại màn hình trước. 
│   │       - - Imported Component: DataSyncIndicator — chỉ báo đồng bộ dữ liệu trong màn hình Cài đặt. 
│   │       - - Embedded UI Component: TextInput API Base URL — trường nhập API Base URL với tính năng khóa/mở khóa. 
│   │       - - Embedded UI Component: TextInput Sheet ID — trường nhập Sheet ID với tính năng khóa/mở khóa. 
│   │       - - Embedded UI Component: OTA progress UI — hiển thị trạng thái và thanh tiến trình tải OTA. 
│   │       - - Modal: OTA confirmation/error/info dialogs — hiển thị trạng thái và tùy chọn người dùng khi OTA. 
│   │       - - Modal: Reset confirmation — xác nhận đặt lại cấu hình về mặc định. 
│   │       - - Modal: Reset thành công — thông báo hoàn tất và yêu cầu tải lại dữ liệu. 
│   │       - - Modal: Lỗi lưu/khác — thông báo khi lưu thất bại hoặc lỗi xảy ra.
│   │   ├─ Tools.tsx
│   │       - - components: ToolsScreen - hiển thị màn hình Tools với icon, tiêu đề và chú thích.
│   │       - - functions: StyleSheet.create - tạo stylesheet cho ToolsScreen.
│   │   ├─ WebViewerScreen.tsx
│   │       - - components: WebViewerScreen — Màn hình hiển thị WebView theo URL và hỗ trợ quay về.
│   │       - - components: BackButton — Nút quay lại điều khiển navigation.goBack().
│   │       - - hooks: Không có hook nào được sử dụng trong file.
│   │       - - functions: Không có hàm độc lập ngoài component.
│   │       - - classes: Không có lớp Python.
│   │   └─ index.tsx
│   │       - - functions
│   │       -   - triggerTestNotification — Hàm bất đồng bộ phát thông báo thử bằng Notifee và cấp quyền/tạo channel.
│   │       - - hooks
│   │       -   - useNavigation — Hook dùng để điều hướng giữa các màn hình.
│   │       -   - useRef — Hook để tạo và duy trì Animated.Value cho hiệu ứng scale.
│   │       - - components
│   │       -   - FeatureTile — Thành phần tile hiển thị chức năng với hiệu ứng nhấn và trạng thái sẵn sàng.
│   │       -   - IndexScreen — Màn hình chính hiển thị DataSyncIndicator, tiêu đề và danh sách các tile.
│   ├─ services/
│   │   └─ otaService.ts
│   │       - - fetchLatestOta: Lấy thông tin OTA mới nhất từ server và trả về OtaInfo hoặc null. 
│   │       - - isNewerVersion: So sánh phiên bản server và hiện tại để xác định có bản cập nhật mới hay không.
│   │       - - downloadAndInstallApk: Tải xuống APK OTA, dọn dẹp APK cũ trong Downloads và mở APK bằng FileViewer.
│   │       - - OtaError: Lớp lỗi tùy biến đại diện cho các loại lỗi OTA (network, http, platform, download, unknown).
│   ├─ types/
│   │   ├─ maintenance.ts
│   │       - - MaintenanceActionType: Định nghĩa tập hợp các loại hành động bảo trì ở dạng chuỗi ký tự (Kiểm tra, Vệ sinh, Sửa chữa, Thay thế, Hiệu chuẩn).
│   │       - - MaintenanceHistoryItem: Mô hình dữ liệu ghi nhận lịch sử bảo trì cho một thiết bị.
│   │       - - AddMaintenancePayload: Mô hình dữ liệu payload dùng để thêm một bản ghi bảo trì cho một thiết bị.
│   │   ├─ navigation.ts
│   │       - - Home: Màn hình chính của ứng dụng.
│   │       - // Note: The instruction says one-line per item; using a comment-like line may violate. I'll remove the comment line.
│   │       - 
│   │       - - Home: Màn hình chính của ứng dụng.
│   │       - - Scanner: Màn hình quét.
│   │       - - Devices: Danh sách thiết bị.
│   │       - - History: Lịch sử cho thiết bị (có deviceId và deviceName).
│   │       - - Tools: Công cụ.
│   │       - - Info: Hiển thị thông tin từ URL.
│   │       - - WebViewer: Xem nội dung từ URL.
│   │       - - SystemManager: Quản lý hệ thống (id và tên).
│   │       - - Data: Dữ liệu.
│   │       - - Settings: Cài đặt.
│   │       - - Loading: Màn hình tải.
│   │   └─ react-native-vector-icons.d.ts
│   │       - - components:
│   │       -   - Ionicons content component: một component React Native nhận props TextProps cùng name, size, color để hiển thị icon Ionicons.
│   └─ utils/
│       └─ notifications.ts
│           - - functions: Định nghĩa các hàm để quản lý kênh thông báo Android và hiển thị thông báo trạng thái máy chủ.
│           - - hooks: Không có hook trong file.
│           - - components: Không có component trong file.
│           - - classes: Không có class trong file.
├─ test.js
├─ tree
└─ tsconfig.json