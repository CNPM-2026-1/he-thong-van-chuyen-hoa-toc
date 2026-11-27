# Backend – Hệ thống vận chuyển hỏa tốc

NestJS 10 + Prisma 5 + PostgreSQL 16. Sprint 1: xác thực JWT, phân quyền theo vai trò, quản lý tài khoản và danh mục. Sprint 2 (TV7, phần nền đã triển khai): quản lý chuyến xe, lịch sử trạng thái chuyến và ghi nhận GPS bằng REST API.

## Chạy lần đầu

Yêu cầu: Node.js 20 trở lên, Docker.

1. Chạy PostgreSQL bằng Docker (chọn một trong hai cách):

   ```bash
   docker run -d --name hoatoc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hoatoc -p 5432:5432 -v hoatoc-pgdata:/var/lib/postgresql/data postgres:16
   ```

   ```bash
   docker compose up -d
   ```

2. Cài thư viện và tạo file cấu hình:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. Tạo bảng và dữ liệu mẫu:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

4. Chạy server (tự khởi động lại khi sửa code):

   ```bash
   npm run start:dev
   ```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs (bấm **Authorize**, dán `accessToken` lấy từ `POST /auth/login`)

## Tài khoản mẫu

Mật khẩu chung: `Password123!`. Đăng nhập bằng email hoặc số điện thoại.

| Vai trò | Email | SĐT |
|---|---|---|
| CUSTOMER | customer@example.com | 0900000001 |
| STAFF | staff@example.com | 0900000002 |
| DRIVER | driver@example.com | 0900000003 |
| MANAGER | manager@example.com | 0900000004 |
| ADMIN | admin@example.com | 0900000005 |
| DRIVER | driver2@example.com | 0900000006 |

ID của dữ liệu mẫu trùng với ví dụ trong `docs/api-contract.md`, nên app/web chuyển từ dữ liệu giả sang API thật vẫn khớp.

## Các lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run start:dev` | Chạy server, tự reload khi sửa code |
| `npm run build` / `npm run start:prod` | Build rồi chạy bản production |
| `npm run db:migrate -- --name <ten>` | Sửa `prisma/schema.prisma` xong thì chạy lệnh này để tạo migration mới |
| `npm run db:deploy` | Áp các migration có sẵn (dùng sau khi pull code) |
| `npm run db:seed` | Nạp dữ liệu mẫu (chạy lại nhiều lần vẫn an toàn) |
| `npm run db:reset` | Xóa sạch DB, tạo lại bảng và seed |
| `npm run db:studio` | Mở Prisma Studio để xem/sửa dữ liệu |

## Quy ước API (theo hợp đồng chung)

- Tiền tố `/api/v1`, dữ liệu JSON, ID dạng UUID, tiền là số nguyên VND.
- Danh sách: `GET /resource?page=1&pageSize=20&search=...` trả về `{ items, page, total }` (`pageSize` tối đa 100).
- Lỗi luôn có dạng `{ code, message }`, ví dụ `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `TOKEN_INVALID`, `ACCOUNT_LOCKED`, `FORBIDDEN`, `NOT_FOUND`, `DUPLICATE`, `STATION_IN_USE`.
- Gửi field không có trong đặc tả sẽ bị từ chối (400).
- `DELETE` trên danh mục là **xóa mềm**: bản ghi được đánh dấu `deleted_at`, `isActive = false` và không còn hiện trong danh sách.

### Xác thực

| Endpoint | Ghi chú |
|---|---|
| `POST /auth/register` | Chỉ tạo tài khoản CUSTOMER |
| `POST /auth/login` | `{ identifier, password }` → `{ accessToken, refreshToken, user }` |
| `POST /auth/refresh` | `{ refreshToken }` → cặp token mới. Refresh token cũ bị thu hồi (mỗi token chỉ dùng được một lần) |
| `POST /auth/logout` | `{ refreshToken }`, thu hồi refresh token |
| `GET /auth/me` | Thông tin tài khoản đang đăng nhập |

- Access token sống 15 phút, refresh token 7 ngày (chỉnh trong `.env`).
- Mật khẩu được mã hóa bằng bcrypt. Refresh token lưu dạng hash trong bảng `refresh_tokens`.
- Tài khoản bị khóa sẽ không đăng nhập được, và mọi refresh token của nó bị thu hồi ngay.

### Phân quyền

Mọi route mặc định đều cần đăng nhập. Muốn mở cho khách vãng lai thì gắn `@Public()`. Giới hạn vai trò bằng `@Roles(...)`:

```ts
@Roles('MANAGER', 'ADMIN')
@Post()
create(@CurrentUser() user: User, @Body() dto: CreateXDto) { ... }
```

| Resource | Xem | Thêm/sửa/xóa |
|---|---|---|
| `/users` | MANAGER, ADMIN | MANAGER, ADMIN (*) |
| `/stations`, `/routes` | mọi vai trò đã đăng nhập | MANAGER, ADMIN |
| `/vehicles`, `/drivers`, `/price-rules` | MANAGER, ADMIN | MANAGER, ADMIN |

(*) MANAGER chỉ quản lý được tài khoản STAFF/DRIVER/CUSTOMER. Chỉ ADMIN tạo được MANAGER. Không ai tự khóa, tự xóa hay tự đổi vai trò của chính mình.

### Tài khoản và danh mục

- `/users`: tạo tài khoản nhân viên/tài xế/quản lý, sửa, xóa mềm, `PATCH /users/:id/status` để khóa (`LOCKED`) hoặc mở khóa (`ACTIVE`). Lọc được theo `role` và `status`.
- `/drivers`: hồ sơ tài xế gắn với một tài khoản có role `DRIVER`, gồm số GPLX và xe mặc định (`defaultVehicleId`, gửi `null` để bỏ gán). Cách tạo: `POST /users` với role DRIVER, rồi `POST /drivers`.
- `/routes`: bến đi phải khác bến đến, và cả hai bến phải còn tồn tại.
- `/stations`: không xóa được bến khi còn tuyến đang dùng (409 `STATION_IN_USE`).
- `/price-rules`: `effectiveTo` phải sau `effectiveFrom`. Lọc được theo `routeId`, tìm theo mã/tên tuyến.

## Cấu trúc thư mục

```
backend/
├── prisma/
│   ├── schema.prisma        # Bảng: users, refresh_tokens, stations, routes, vehicles, drivers, price_rules
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── main.ts              # Prefix /api/v1, CORS, ValidationPipe, Swagger
    ├── app.module.ts        # Đăng ký guard JWT + Roles cho toàn app
    ├── common/              # Guard, decorator, filter lỗi { code, message }, phân trang
    ├── prisma/              # PrismaService
    ├── auth/                # Đăng ký, đăng nhập, refresh, logout, me
    ├── users/
    ├── stations/  routes/  vehicles/  drivers/  price-rules/
```

Mỗi module gồm `*.controller.ts` (route + Swagger), `*.service.ts` (nghiệp vụ, Prisma) và `dto/` (kiểm tra dữ liệu nhập bằng class-validator).

## Ghi chú

- `prisma/schema.prisma` hiện gồm mô hình Sprint 1, chuyến/GPS và các bảng vận hành Sprint 2. Tuy nhiên mô hình `Order` vẫn là projection tạm, chưa khớp đầy đủ bảng `DonHang` của TV5 (thiếu thông tin người gửi/địa chỉ nhận và khóa tuyến/bảng giá); xem mục tích hợp CSDL bên dưới trước khi merge.
- Khi deploy, nhớ đổi `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` thành chuỗi ngẫu nhiên dài, và giới hạn `CORS_ORIGINS`.


## Sprint 2 – Bộ 2 (TV7 Linh + TV8 Kiên)

Nhánh triển khai: `feature/sprint2-bo2-backend`, tạo trên nền `feature/tv7-trips-tracking` (backend TV1). Không merge thẳng vào `develop` khi nhánh nền backend của TV1 chưa được tích hợp vào nhánh chính.

### Quyết định dữ liệu Manifest tạm thời

Mỗi dòng manifest đại diện cho **một kiện Package**. Một request `POST /trips/:tripId/manifest/items` nhận `orderId`; backend tìm toàn bộ Package thuộc Order và tạo một ManifestItem cho từng kiện. Cách này bám mô hình `KienHang` và `ChiTietPhieuKe` trong ERD/SQL của nhánh `database`.

Đây là quyết định triển khai tạm của Bộ 2, cần TV5/nhóm xác nhận trước khi merge. Bộ 1 phải tạo đủ Package khi tạo Order; nếu `packages.length` khác `packageCount`, backend từ chối thêm đơn vào manifest.

### Đối chiếu với SQL TV5 – còn chờ xác nhận

SQL Server script ở nhánh `database` mô tả `DonHang` với các trường `MaTuyenDuong`, `MaBangGia`, `TenNguoiGui`, `SDTNguoiGui`, `DiaChiNguoiGui`, `DiaChiNguoiNhan`, cùng `TenNguoiNhan`, `SDTNguoiNhan`, `TongCuoc`, `TienCOD`. Model Prisma `Order` hiện dùng `originStationId`/`destinationStationId`, tên/ngày/địa chỉ người nhận chưa đầy đủ và không lưu riêng người gửi, địa chỉ nhận, routeId/priceRuleId. `packageCount`/`weightGrams` trong Prisma cũng cần thống nhất là dữ liệu tổng hợp hay dữ liệu lưu tại đơn, vì SQL TV5 đặt khối lượng ở `KienHang`.

Do PR #2 của TV5 chưa được nhóm xác nhận/merge, Bộ 2 chưa tự đổi các trường này để tránh chốt sai mô hình. Cần TV5/TV1 quyết định mapping chính thức và sau đó tạo migration PostgreSQL bổ sung; không chạy SQL Server script trực tiếp trên PostgreSQL.

### TV7 – Chuyến xe, manifest, GPS và realtime

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/v1/trips` | DRIVER được phân công, MANAGER, ADMIN |
| POST | `/api/v1/trips` | MANAGER, ADMIN + `Idempotency-Key` |
| GET | `/api/v1/trips/:tripId` | DRIVER được phân công, MANAGER, ADMIN |
| PATCH | `/api/v1/trips/:tripId/status` | DRIVER được phân công, MANAGER, ADMIN |
| GET | `/api/v1/trips/:tripId/manifest` | DRIVER được phân công, MANAGER, ADMIN |
| POST | `/api/v1/trips/:tripId/manifest/items` | MANAGER, ADMIN + `Idempotency-Key`; body `{ orderId }` |
| PATCH | `/api/v1/manifest/items/:itemId` | DRIVER được phân công, MANAGER, ADMIN |
| POST | `/api/v1/trips/:tripId/locations` | DRIVER được phân công + `Idempotency-Key` |
| GET | `/api/v1/trips/:tripId/locations/latest` | DRIVER được phân công, MANAGER, ADMIN; CUSTOMER chỉ khi có Order của mình trên chuyến IN_TRANSIT |

Quy tắc nghiệp vụ:
- Chuyển trạng thái chuyến theo chuỗi `PLANNED → BOARDING → DISPATCHED → IN_TRANSIT → ARRIVED → COMPLETED`; chỉ hủy từ PLANNED/BOARDING.
- Không xuất bến nếu manifest rỗng hoặc còn kiện chưa LOADED.
- Khi chuyến chuyển sang IN_TRANSIT, các Order trên manifest chuyển sang IN_TRANSIT và được ghi OrderStatusHistory.
- Chỉ cho dỡ kiện khi trip ARRIVED; Order chuyển AT_DESTINATION khi toàn bộ kiện của Order đã UNLOADED.
- Kiện MISSING/DAMAGED được ghi sự cố và đưa Order vào INCIDENT_HOLD.
- GPS chỉ nhận từ tài xế được phân công khi chuyến IN_TRANSIT; backend lưu tọa độ trước khi phát `trip:location_updated`.
- REST write operations quan trọng yêu cầu `Idempotency-Key` UUID; cùng actor/operation/key/payload trong 24 giờ sẽ nhận response cũ, dùng key với payload khác trả 409.

### TV8 – Giao hàng, OTP, COD, sự cố và Dashboard

| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/api/v1/orders/:orderId/delivery/start` | DRIVER được phân công + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/delivery/otp` | DRIVER được phân công + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/delivery/confirm` | DRIVER được phân công + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/delivery/failed` | DRIVER được phân công + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/return` | MANAGER, ADMIN + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/delivery/retry` | MANAGER, ADMIN + `Idempotency-Key` |
| POST | `/api/v1/orders/:orderId/return/complete` | MANAGER, ADMIN + `Idempotency-Key` |
| GET | `/api/v1/cod/transactions` | MANAGER, ADMIN |
| POST | `/api/v1/cod/reconciliations` | MANAGER, ADMIN + `Idempotency-Key` |
| GET/POST | `/api/v1/incidents` | DRIVER, MANAGER, ADMIN (POST yêu cầu `Idempotency-Key`) |
| GET/PATCH | `/api/v1/incidents/:incidentId` | GET: DRIVER, MANAGER, ADMIN; PATCH: MANAGER, ADMIN |
| GET | `/api/v1/statistics/overview` | MANAGER, ADMIN |
| GET | `/api/v1/statistics/orders` | MANAGER, ADMIN |
| GET | `/api/v1/statistics/cod` | MANAGER, ADMIN |
| POST | `/api/v1/media/presigned-uploads` | Người dùng đã đăng nhập + `Idempotency-Key` |
| GET | `/api/v1/notifications` | Tài khoản hiện tại |
| PATCH | `/api/v1/notifications/:notificationId/read` | Chủ sở hữu thông báo |

Luồng giao hàng:
- DRIVER chỉ bắt đầu giao sau khi chuyến ARRIVED và toàn bộ kiện của Order đã UNLOADED.
- OTP 6 chữ số, hiệu lực 5 phút, tối đa 5 lần thử; DB lưu HMAC hash và AES-256-GCM ciphertext. OTP không trả trong response.
- Local development không cấu hình SMS provider sẽ ghi OTP vào log backend; production sẽ trả 503 nếu thiếu SMS provider.
- Giao thành công cần OTP hợp lệ; nếu Order có COD, `codCollectedVnd` phải khớp `codAmountVnd`. Backend tạo DeliveryAttempt, COD transaction, cập nhật Order DELIVERED và phát event.
- Quản lý có thể duyệt giao lại đơn `DELIVERY_FAILED` khi chuyến đã `ARRIVED` và toàn bộ kiện đã `UNLOADED`; sau khi duyệt, DRIVER tiếp tục yêu cầu OTP.
- Hoàn trực tiếp chỉ bắt đầu từ `DELIVERY_FAILED`. Đơn `INCIDENT_HOLD` phải được giải quyết qua Incident; quản lý chọn `RETURN` ở bước xử lý cuối cùng. Khi hàng thực sự về bến gửi, quản lý xác nhận `RETURNED`, cập nhật `returnedAt` và ghi OrderStatusHistory.
- Ảnh chứng minh/ảnh sự cố dùng presigned PUT URL lên MinIO/S3-compatible storage; API chỉ lưu object key và metadata.

COD:
- Expected amount được tính từ các transaction được chọn thuộc đúng chuyến và còn PENDING_REMITTANCE.
- Chênh lệch bằng 0: MATCHED và transaction được chuyển RECONCILED.
- Có chênh lệch: MISMATCH_PENDING_REVIEW; transaction vẫn pending để có thể tạo lần đối soát tiếp theo sau khi rà soát.

Sự cố:
- Khi sự cố gắn với Order được tạo, Order chuyển INCIDENT_HOLD và ghi trạng thái trước đó.
- Khi RESOLVED, quản lý chọn RESUME hoặc RETURN; Order chỉ rời INCIDENT_HOLD khi không còn sự cố OPEN/IN_PROGRESS khác.

### Realtime events

Gateway dùng Socket.IO namespace mặc định, handshake `auth.token` là access JWT. Các event được phát sau khi dữ liệu REST/DB được lưu:
- `trip:location_updated`, `trip:status_changed`
- `manifest:updated`, `manifest:item_scanned`
- `order:status_changed`, `delivery:completed`
- `incident:created`, `incident:updated`
- `cod:reconciled`, `notification:new`

Envelope: `{ eventId, occurredAt, resourceVersion, data }`. Client không được tự phát các event server-authoritative.

### Migration, môi trường và kiểm tra

Các migration Sprint 2:
- `20261127070000_add_trips_tracking`
- `20261127080000_add_idempotency_records`
- `20261127100000_add_sprint2_operations`

Chạy local từ thư mục `backend/`:

```bash
docker compose up -d
npm install
npx prisma format
npx prisma validate
npm run db:deploy
npm run prisma:generate
npm run db:seed
npm run build
npm run start:dev
```

- PostgreSQL: `localhost:5432`.
- MinIO S3 API: `http://localhost:9000`; Console: `http://localhost:9001`; bucket `hoatoc-media`; local credentials mặc định `minioadmin/minioadmin`.
- Swagger: `http://localhost:3000/api/docs`.
- Cấu hình OTP và storage trong `.env.example`. Thay toàn bộ secret/credentials mặc định trước khi triển khai thật.
- `npm install` phải được chạy sau khi pull nhánh này để cập nhật `package-lock.json`, vì nhánh đã bổ sung Socket.IO dependencies. Commit file lock được sinh trước khi dùng `npm ci`.
- Workflow `.github/workflows/backend-ci.yml` được thêm để chạy Prisma format/validate/generate và NestJS build trên GitHub Actions.

### Các giới hạn tích hợp còn lại cần nhóm xác nhận

- Mô hình mỗi ManifestItem là một Package cần TV5/nhóm duyệt; ERD, data dictionary và tài liệu SQL Server của nhánh `database` cần cập nhật đồng bộ với PostgreSQL/Prisma.
- Schema hiện chưa có bảng phân công STAFF theo bến. Vì vậy, một số API và room vận hành từ chối STAFF thay vì cấp quyền xem rộng. Cần bổ sung bảng assignment nếu nhóm muốn STAFF thao tác manifest/sự cố theo bến.
- SMS provider cần cấu hình URL/API key thật; local chỉ log OTP để demo.
- Media metadata được xác minh theo user/purpose/objectKey; cần kiểm tra object thực tế trên storage trong bước tích hợp cuối cùng trước khi coi ảnh đã upload hợp lệ.
- Chưa chạy xác nhận `npm run build`/Prisma validate trực tiếp từ máy phát triển trong phiên này; cần xem GitHub Actions hoặc chạy các lệnh trên máy local trước khi merge.
