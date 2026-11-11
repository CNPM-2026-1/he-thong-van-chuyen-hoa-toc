# Thiết kế kiến trúc hệ thống

## 1. Mục tiêu và phạm vi

Hệ thống hỗ trợ nhà xe quản lý quy trình nhận - vận chuyển - giao hàng hỏa tốc liên tỉnh. Có ba nhóm client: ứng dụng mobile dùng chung cho khách hàng/nhân viên/tài xế, Web Admin cho quản lý/quản trị, và các dịch vụ backend. Kiến trúc phải hỗ trợ REST API, cập nhật realtime vị trí xe/trạng thái đơn, lưu ảnh chứng từ và tích hợp dịch vụ bên ngoài.

Tài liệu này là thiết kế logic cho Sprint 1 và các sprint nghiệp vụ tiếp theo, không khẳng định toàn bộ thành phần đã được triển khai.

## 2. Các thành phần

| Thành phần | Trách nhiệm | Giao tiếp |
|---|---|---|
| Mobile App (React Native/Expo) | Khách tạo đơn, báo giá, tra cứu; STAFF tiếp nhận/quét QR; DRIVER xem chuyến, cập nhật vị trí và giao hàng | HTTPS REST; Socket.IO; upload ảnh theo presigned URL |
| Web Admin (React/Vite/Ant Design) | Quản lý tài khoản/danh mục, chuyến xe, manifest, COD, sự cố và thống kê | HTTPS REST; Socket.IO cho màn hình vận hành |
| Backend (NestJS) | Xác thực, phân quyền, nghiệp vụ, validation, điều phối API và phát sự kiện | REST `/api/v1`; Socket.IO; Prisma |
| PostgreSQL | Lưu tài khoản, danh mục, đơn, chuyến, manifest, lịch sử trạng thái, giao nhận, COD, sự cố | Chỉ backend được truy cập trực tiếp |
| Realtime Gateway | Socket.IO namespace mặc định; xác thực access token, quản lý room, phát event | Socket.IO qua WebSocket, fallback polling nếu client hỗ trợ |
| Object Storage | Lưu ảnh giao nhận, ảnh sự cố và chứng từ | Presigned upload/download URL; không đẩy file lớn qua REST API |
| Dịch vụ ngoài | SMS/OTP, push notification, bản đồ/geocoding (và dịch vụ khác nếu nhóm chọn) | HTTPS API hoặc SDK, gọi từ backend/client theo chính sách bảo mật |
| Redis (tùy chọn khi scale) | Socket.IO adapter/pub-sub, cache/rate limit nếu cần nhiều instance backend | Backend nội bộ; không bắt buộc khi chạy local một instance |

## 3. Kiến trúc logic và luồng kết nối

1. Mobile/Web gọi REST API qua HTTPS với access token dạng Bearer. Backend xác thực JWT, kiểm tra role và quyền trên từng resource.
2. Backend xử lý nghiệp vụ và đọc/ghi PostgreSQL qua Prisma. Client không kết nối trực tiếp tới database.
3. Khi có thay đổi quan trọng (trạng thái đơn, vị trí xe, giao hàng, sự cố), backend ghi dữ liệu trước, sau đó phát sự kiện Socket.IO tới các room được phép nhận.
4. Với ảnh/chứng từ, backend cấp presigned URL; client upload trực tiếp object storage. Backend chỉ lưu object key và metadata, tránh lưu binary trong PostgreSQL.
5. Backend tích hợp SMS/OTP, notification và bản đồ. Secret/API key của nhà cung cấp chỉ đặt phía server, không nhúng trong mobile/web.

## 4. Phân quyền theo vai trò (đề xuất)

| Vai trò | Phạm vi chính |
|---|---|
| CUSTOMER | Đăng ký/đăng nhập; tạo đơn; xem đơn của mình; báo giá; theo dõi hành trình; cung cấp OTP khi nhận hàng |
| STAFF | Tiếp nhận hàng tại bến được phân công; quét QR; cập nhật thông tin cân/nhận; thao tác manifest theo quyền được giao |
| DRIVER | Xem chuyến được phân công; quét nhận/trả kiện; gửi vị trí; thực hiện giao hàng, OTP, ảnh chứng minh, COD; báo sự cố |
| MANAGER | Quản lý vận hành; phân xe/tài xế; điều phối chuyến; xử lý sự cố; đối soát COD; xem thống kê; quản lý danh mục/tài khoản theo phân quyền |
| ADMIN | Quản trị toàn hệ thống, tài khoản và cấu hình; có quyền quản lý cao nhất |

Mọi API phải kiểm tra quyền ở backend, không chỉ ẩn nút/menu ở client. CUSTOMER chỉ được truy cập đơn thuộc tài khoản của mình; DRIVER chỉ thao tác chuyến được phân công. Phạm vi theo chi nhánh/bến cần được thống nhất cùng nhóm nếu nghiệp vụ yêu cầu.

## 5. Quy ước kỹ thuật

- REST base path: `/api/v1`; request/response JSON, UTF-8.
- Authentication: access token JWT ở header `Authorization: Bearer <accessToken>`; refresh token gửi trong body của endpoint refresh/logout.
- Role enum: `CUSTOMER`, `STAFF`, `DRIVER`, `MANAGER`, `ADMIN`.
- Danh sách: `{ "items": [], "page": 1, "total": 0 }`; `page` bắt đầu từ 1. Query hỗ trợ `page`, `pageSize`, `search` khi phù hợp.
- Lỗi: `{ "code": "ERROR_CODE", "message": "Mô tả lỗi" }`.
- ID: UUID dạng string. Thời gian: ISO-8601 UTC. Tiền: số nguyên VND, không dùng floating point. Khối lượng: gram (`weightGrams`) để tránh nhập nhằng đơn vị.
- Xóa danh mục/tài khoản nên là soft delete/deactivate; không xóa vật lý bản ghi đã được đơn hàng/chuyến tham chiếu.
- API cập nhật trạng thái phải kiểm tra transition hợp lệ và ghi lịch sử trạng thái trong cùng transaction.

## 6. Các luồng nghiệp vụ chính

### 6.1 Đăng nhập

Client gửi email/số điện thoại và mật khẩu tới `POST /auth/login`. Backend kiểm tra thông tin, trả `accessToken`, `refreshToken`, `user`. Client lưu token an toàn (mobile dùng secure storage), gắn access token vào request. Khi nhận 401 do access token hết hạn, client gọi `/auth/refresh`; nếu refresh thất bại thì xóa phiên và yêu cầu đăng nhập lại.

### 6.2 Tạo đơn và báo giá

CUSTOMER lấy báo giá bằng tuyến, khối lượng, dịch vụ và COD (`POST /pricing/quotes`), sau đó gửi `POST /orders`. Backend tính lại giá từ bảng giá có hiệu lực, không tin tổng tiền do client gửi. Đơn được tạo ở trạng thái `PENDING_RECEIPT` và phát `order:status_changed` tới room liên quan.

### 6.3 Tiếp nhận tại quầy

STAFF quét QR/mã vận đơn, lấy chi tiết đơn, kiểm tra kiện và cân thực tế, sau đó gọi `POST /orders/{orderId}/receipt`. Backend kiểm tra đơn chưa được nhận, cập nhật bến nhận/khối lượng/thời điểm, chuyển trạng thái `RECEIVED` và ghi lịch sử.

### 6.4 Xếp chuyến và vận chuyển

MANAGER tạo chuyến, gán xe/tài xế, thêm các đơn vào manifest. STAFF/DRIVER đánh dấu kiện đã xếp. Chỉ chuyến đủ điều kiện mới được chuyển `DISPATCHED`/`IN_TRANSIT`; backend cập nhật đơn tương ứng sang `IN_TRANSIT`. DRIVER gửi vị trí định kỳ qua `POST /trips/{tripId}/locations`; backend phát `trip:location_updated`.

### 6.5 Giao hàng

DRIVER xem manifest, chuyển đơn sang `OUT_FOR_DELIVERY`, yêu cầu gửi OTP tới người nhận. Khi người nhận cung cấp OTP, DRIVER gọi endpoint xác nhận; backend xác thực OTP, lưu ảnh/chứng từ (nếu có), đánh dấu `DELIVERED`, ghi COD và phát sự kiện giao thành công. Không cho client tự gửi `status=DELIVERED` qua API cập nhật chung.

## 7. Yêu cầu phi chức năng và bảo mật

- Tất cả môi trường chia sẻ phải dùng HTTPS; không commit `.env`, JWT secret hay API key.
- Password hash bằng bcrypt theo kế hoạch Sprint 1; refresh token cần có cơ chế thu hồi khi logout.
- Validate dữ liệu ở backend; kiểm tra role và quyền sở hữu dữ liệu ở từng endpoint.
- Giới hạn tần suất login/OTP; không ghi mật khẩu, access token, refresh token hoặc OTP vào log.
- Upload ảnh giới hạn loại file/kích thước; dùng presigned URL thời hạn ngắn và object key không đoán được.
- Ghi audit/history cho đổi trạng thái đơn, phân công chuyến, đối soát COD và xử lý sự cố.
- Socket.IO cần xác thực handshake, kiểm tra quyền khi join room, không cho client tự join room tùy ý.

## 8. Quyết định cần nhóm xác nhận

1. Có cần tách backend REST và realtime thành hai tiến trình hay dùng một NestJS app với Socket.IO gateway (đề xuất: cùng app ở giai đoạn đầu).
2. Object storage production dùng S3-compatible provider nào; local có thể dùng MinIO hoặc mock.
3. Nhà cung cấp OTP/SMS, push notification, bản đồ/geocoding.
4. Quy tắc hủy đơn theo mốc vận hành; chính sách giao lại/hoàn hàng; cách đối soát COD.
5. Scope dữ liệu theo bến/chi nhánh và quyền cụ thể của STAFF/MANAGER.
