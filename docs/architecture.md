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

## 4. Phân quyền theo vai trò (đề xuất độc lập của TV7/TV8)

| Vai trò | Phạm vi chính |
|---|---|
| CUSTOMER | Đăng ký/đăng nhập; tạo đơn; xem đơn của mình; báo giá; theo dõi hành trình; cung cấp OTP khi nhận hàng |
| STAFF | Tiếp nhận hàng tại bến được phân công; quét QR; cập nhật thông tin cân/nhận; thao tác manifest theo quyền được giao |
| DRIVER | Xem chuyến được phân công; quét nhận/trả kiện; gửi vị trí; thực hiện giao hàng, OTP, ảnh chứng minh, COD; báo sự cố |
| MANAGER | Quản lý vận hành; phân xe/tài xế; điều phối chuyến; xử lý sự cố; đối soát COD; xem thống kê; quản lý danh mục/tài khoản theo phân quyền |
| ADMIN | Quản trị toàn hệ thống, tài khoản và cấu hình; có quyền quản lý cao nhất |

Mọi API phải kiểm tra quyền ở backend, không chỉ ẩn nút/menu ở client. Ma trận dưới đây là mặc định đề xuất để các đầu mục khác có thể tiếp tục làm độc lập; đây không phải xác nhận của TV1/TV5 hay quyết định toàn nhóm.

| Tài nguyên/thao tác | CUSTOMER | STAFF | DRIVER | MANAGER | ADMIN |
|---|---|---|---|---|---|
| Tài khoản | Đọc/cập nhật hồ sơ của mình | Không quản trị | Không quản trị | Tạo/khóa STAFF, DRIVER trong phạm vi được giao | Toàn quyền |
| Danh mục (bến, tuyến, xe, tài xế, bảng giá) | Chỉ đọc dữ liệu đang hoạt động cần cho gửi hàng | Chỉ đọc; ghi nhận tiếp nhận tại bến được phân công | Chỉ đọc dữ liệu chuyến được giao | Đọc/ghi trong phạm vi nhà xe | Toàn quyền |
| Đơn hàng | Tạo; chỉ đọc/hủy đơn của mình khi còn trước tiếp nhận | Đọc và tiếp nhận tại bến được phân công | Đọc đơn trong chuyến được phân công; cập nhật các bước giao | Đọc/điều phối/xử lý ngoại lệ | Toàn quyền, có audit |
| Chuyến/manifest/vị trí | Chỉ xem tiến trình chuyến gắn với đơn của mình; vị trí chỉ khi đơn đang vận chuyển | Đọc chuyến liên quan bến; xác nhận xếp/dỡ theo phân công | Đọc chuyến được gán; cập nhật vị trí và thao tác kiện | Tạo, phân công, điều phối và xem chuyến trong phạm vi quản lý | Toàn quyền |
| Giao hàng/COD | Cung cấp OTP; xem kết quả đơn của mình | Không xác nhận giao/COD thay tài xế | Ghi nhận giao thất bại/thành công và COD của chuyến được gán | Đối soát và xử lý chênh lệch | Toàn quyền, có audit |
| Sự cố/thống kê | Chỉ xem thông báo/kết quả liên quan đơn của mình | Tạo sự cố tại bến liên quan | Tạo sự cố trên chuyến được gán | Xử lý sự cố và xem thống kê theo phạm vi | Toàn quyền |

Quy tắc kiểm tra bắt buộc: CUSTOMER bị giới hạn theo `customerId`; STAFF theo bến được phân công; DRIVER theo chuyến đang/được phân công; MANAGER theo phạm vi nhà xe hoặc bến được giao. Khi chưa có trường phân công/phạm vi tương ứng trong mô hình dữ liệu, endpoint ghi phải từ chối thay vì mặc định mở quyền. ADMIN không bỏ qua audit log. Các phạm vi này cần được TV1/TV5 đối chiếu với schema, không cản trở việc mỗi đầu mục tiếp tục làm độc lập.

## 5. Quy ước kỹ thuật

- REST base path: `/api/v1`; request/response JSON, UTF-8.
- Authentication: access token JWT ở header `Authorization: Bearer <accessToken>`; refresh token gửi trong body của endpoint refresh/logout.
- Role enum: `CUSTOMER`, `STAFF`, `DRIVER`, `MANAGER`, `ADMIN`.
- Danh sách: `{ "items": [], "page": 1, "total": 0 }`; `page` bắt đầu từ 1. Query hỗ trợ `page`, `pageSize`, `search` khi phù hợp.
- Lỗi: `{ "code": "ERROR_CODE", "message": "Mô tả lỗi" }`.
- Mã lỗi chuẩn đề xuất: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `UNPROCESSABLE_ENTITY` (422), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500). Không trả chi tiết nội bộ hoặc bí mật trong `message`.
- Client chỉ tự refresh khi nhận 401; không tự retry request ghi nếu không có `Idempotency-Key`. Với timeout hoặc 5xx, client có thể gửi lại thao tác có key đó; cùng key và cùng nội dung phải nhận lại kết quả cũ, cùng key nhưng nội dung khác trả 409.
- ID: UUID dạng string. Thời gian: ISO-8601 UTC. Tiền: số nguyên VND, không dùng floating point. Khối lượng: gram (`weightGrams`) để tránh nhập nhằng đơn vị.
- Xóa danh mục/tài khoản nên là soft delete/deactivate; không xóa vật lý bản ghi đã được đơn hàng/chuyến tham chiếu.
- API cập nhật trạng thái phải kiểm tra transition hợp lệ và ghi lịch sử trạng thái trong cùng transaction.

## 6. Các luồng nghiệp vụ chính

### 6.1 Đăng nhập

Client gửi email/số điện thoại và mật khẩu tới `POST /auth/login`. Backend kiểm tra thông tin, trả `accessToken`, `refreshToken`, `user`. Client lưu token an toàn (mobile dùng secure storage), gắn access token vào request. Khi nhận 401 do access token hết hạn, client gọi `/auth/refresh`; nếu refresh thất bại thì xóa phiên và yêu cầu đăng nhập lại.

### 6.2 Tạo đơn và báo giá

CUSTOMER lấy báo giá bằng tuyến, khối lượng, dịch vụ và COD (`POST /pricing/quotes`), sau đó gửi `POST /orders`. Backend tính lại giá từ bảng giá có hiệu lực, không tin tổng tiền do client gửi. Đơn được tạo ở trạng thái `PENDING_RECEIPT` và phát `order:status_changed` tới room liên quan.

Quy tắc tính tạm dùng để các bên tích hợp nhất quán: `weightKg = weightGrams / 1000`; `weightFee = ceil(weightKg * pricePerKgVnd)`; `subTotal = baseFeeVnd + weightFee`; nếu EXPRESS thì `expressFee = ceil(subTotal * (expressMultiplier - 1))`, nếu STANDARD thì bằng 0; nếu COD dương thì cộng `codFeeVnd`, ngược lại bằng 0. `totalVnd` là tổng các khoản trên. Chỉ dùng một price rule đang hoạt động, đúng tuyến và có hiệu lực tại thời điểm tạo báo giá; nếu không có hoặc có nhiều rule phù hợp, trả `409 CONFLICT` để xử lý dữ liệu bảng giá. Đây là công thức đề xuất, chưa phải quyết định nghiệp vụ của cả nhóm.

`Idempotency-Key` (UUID do client tạo) được đề xuất cho thao tác tạo đơn, xác nhận tiếp nhận/giao hàng, tạo đối soát và các thao tác POST có thể bị gửi lại do timeout. Server lưu key theo actor + operation; với request public chưa có actor thì key được scope theo operation. Cùng key và request hash trả lại kết quả ban đầu; payload khác nhau với cùng key trả `409 CONFLICT`. Thời hạn lưu key đề xuất là 24 giờ.

### 6.3 Tiếp nhận tại quầy

STAFF quét QR/mã vận đơn, lấy chi tiết đơn, kiểm tra kiện và cân thực tế, sau đó gọi `POST /orders/{orderId}/receipt`. Backend kiểm tra đơn chưa được nhận, cập nhật bến nhận/khối lượng/thời điểm, chuyển trạng thái `RECEIVED` và ghi lịch sử.

### 6.4 Xếp chuyến và vận chuyển

MANAGER tạo chuyến, gán xe/tài xế, thêm các đơn vào manifest. STAFF/DRIVER đánh dấu kiện đã xếp. Chỉ chuyến đủ điều kiện mới được chuyển `DISPATCHED`/`IN_TRANSIT`; backend cập nhật đơn tương ứng sang `IN_TRANSIT`. DRIVER gửi vị trí định kỳ qua `POST /trips/{tripId}/locations`; backend phát `trip:location_updated`.

### 6.5 Giao hàng

DRIVER xem manifest, chuyển đơn sang `OUT_FOR_DELIVERY`, yêu cầu gửi OTP tới người nhận. Khi người nhận cung cấp OTP, DRIVER gọi endpoint xác nhận; backend xác thực OTP, lưu ảnh/chứng từ (nếu có), đánh dấu `DELIVERED`, ghi COD và phát sự kiện giao thành công. Không cho client tự gửi `status=DELIVERED` qua API cập nhật chung.

### 6.6 Bảng chuyển trạng thái đề xuất

| Trạng thái hiện tại | Trạng thái tiếp theo | Điều kiện tối thiểu |
|---|---|---|
| `PENDING_RECEIPT` | `RECEIVED` | STAFF được phân công xác nhận cân/nhận tại bến gửi |
| `PENDING_RECEIPT` | `CANCELLED` | CUSTOMER chủ đơn hoặc MANAGER hủy; lưu actor và lý do |
| `RECEIVED` | `WAITING_FOR_DISPATCH` | Đã cân, có tuyến và bến đích hợp lệ |
| `RECEIVED`, `WAITING_FOR_DISPATCH` | `CANCELLED` | MANAGER hủy trước khi đơn vào chuyến đã xuất bến |
| `WAITING_FOR_DISPATCH` | `IN_TRANSIT` | Đơn nằm trong manifest của chuyến; kiện đã LOADED; chuyến xuất bến hợp lệ |
| `IN_TRANSIT` | `AT_DESTINATION` | Chuyến đến bến đích và kiện được xác nhận dỡ |
| `AT_DESTINATION` | `OUT_FOR_DELIVERY` | Có tài xế giao được phân công và đơn thuộc manifest giao |
| `OUT_FOR_DELIVERY` | `DELIVERED` | OTP hợp lệ, số tiền COD thu khớp chính sách và chứng từ hợp lệ nếu bắt buộc |
| `OUT_FOR_DELIVERY` | `DELIVERY_FAILED` | Lưu mã lý do và lần giao; retry count chưa vượt chính sách |
| `DELIVERY_FAILED` | `OUT_FOR_DELIVERY` | MANAGER lên lịch giao lại và có tài xế/khung giao hợp lệ |
| `DELIVERY_FAILED` | `RETURNING` | MANAGER quyết định hoàn và ghi lý do |
| `IN_TRANSIT`, `OUT_FOR_DELIVERY` | `INCIDENT_HOLD` | Sự cố liên quan đã được tạo; lưu trạng thái trước sự cố |
| `INCIDENT_HOLD` | trạng thái trước sự cố | Sự cố được xử lý, quyết định tiếp tục và trạng thái trước đó được giữ |
| `INCIDENT_HOLD` | `RETURNING` | MANAGER quyết định hoàn và ghi lý do |
| `RETURNING` | `RETURNED` | Hàng được xác nhận về bến gửi và bàn giao |

Mọi chuyển trạng thái ngoài bảng bị từ chối `409 CONFLICT`. Mỗi lần đổi trạng thái ghi actor, thời gian, trạng thái cũ/mới, lý do và resource liên quan trong cùng transaction. Hủy sau khi xuất bến không thuộc luồng thường; cần nghiệp vụ ngoại lệ riêng, không tái sử dụng endpoint hủy cơ bản. Số lần giao lại, thời hạn OTP, COD thiếu/thừa và chứng từ bắt buộc là chính sách cần nhóm xác nhận.

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
6. Công thức tính cước, cách làm tròn, phí tối thiểu/tối đa và thời điểm khóa giá vào đơn.
7. Mức retention của OTP, lịch sử vị trí, audit và thời hạn idempotency key.

Các đề xuất ở mục 4–7 là default có thể dùng để dựng API/mock độc lập; cần người phụ trách dữ liệu/nghiệp vụ xác nhận trước khi backend dùng như quy tắc chính thức.
