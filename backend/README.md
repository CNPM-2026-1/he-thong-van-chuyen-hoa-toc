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

- `prisma/schema.prisma` mới có các bảng của Sprint 1 theo hợp đồng chung. Cần đối chiếu với ERD đầy đủ của Đầu mục 3 rồi bổ sung bằng migration mới, không sửa migration đã có.
- Khi deploy, nhớ đổi `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` thành chuỗi ngẫu nhiên dài, và giới hạn `CORS_ORIGINS`.


## Sprint 2 – Chuyến xe và GPS (TV7)

Lưu ý tích hợp CSDL: `trips`, `trip_locations`, `trip_status_history` và `idempotency_records` là các bảng bổ sung ở Sprint 2 trên PostgreSQL. `trip_status_history` và `idempotency_records` là phần mở rộng kỹ thuật để audit/retry; cần gửi TV5 cập nhật ERD và từ điển dữ liệu trước khi chốt CSDL toàn nhóm.

Các endpoint đã được bổ sung trong nhánh `feature/tv7-trips-tracking`:

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/v1/trips` | DRIVER, MANAGER, ADMIN (STAFF đang khóa đến khi có phân công bến) |
| POST | `/api/v1/trips` | MANAGER, ADMIN + `Idempotency-Key` UUID |
| GET | `/api/v1/trips/:tripId` | DRIVER được phân công, MANAGER, ADMIN |
| PATCH | `/api/v1/trips/:tripId/status` | DRIVER được phân công, MANAGER, ADMIN |
| POST | `/api/v1/trips/:tripId/locations` | DRIVER được phân công + `Idempotency-Key` UUID |
| GET | `/api/v1/trips/:tripId/locations/latest` | DRIVER được phân công, MANAGER, ADMIN |

Các trạng thái chuyến được kiểm tra ở backend:
- `PLANNED -> BOARDING -> DISPATCHED -> IN_TRANSIT -> ARRIVED -> COMPLETED`.
- Chỉ cho phép hủy từ `PLANNED` hoặc `BOARDING`.
- Mọi thay đổi trạng thái và người thực hiện được lưu trong `trip_status_history`.
- Khi `DISPATCHED`, xe chuyển sang `IN_USE`; khi chuyến kết thúc/hủy, backend kiểm tra các chuyến đang hoạt động khác trước khi đưa xe về `AVAILABLE`.
- Khi tạo chuyến, backend kiểm tra tuyến, xe, tài xế, trạng thái hoạt động và xung đột lịch phân công.

GPS:
- Tài xế chỉ gửi vị trí cho chuyến được phân công và đang ở trạng thái `IN_TRANSIT`.
- Tọa độ được validate theo giới hạn vĩ độ/kinh độ; thời điểm GPS không được vượt quá 2 phút trong tương lai.
- Lịch sử tọa độ lưu trong `trip_locations`; endpoint latest lấy bản ghi mới nhất theo `recordedAt`.

### Chạy migration và kiểm tra

Từ thư mục `backend/`:

```bash
npx prisma format
npx prisma validate
npm run db:deploy
npm run prisma:generate
npm run build
npm run start:dev
```

Migration `20261127070000_add_trips_tracking` và `20261127080000_add_idempotency_records` đã được thêm vào nhánh này; lệnh `db:deploy` áp dụng migration có sẵn mà không tạo migration trùng.

### Giới hạn cần xử lý trước khi mở quyền đầy đủ

- Schema hiện chưa có bảng/quan hệ phân công STAFF theo bến, vì vậy API danh sách/chi tiết chuyến và vị trí tạm từ chối STAFF thay vì trả dữ liệu toàn hệ thống.
- Chưa có quan hệ Order–Trip/Manifest nên chưa thể xác minh CUSTOMER đang theo dõi chuyến có chứa đơn của mình; endpoint latest tạm từ chối CUSTOMER.
- Manifest/Package chưa được triển khai. Chờ nhóm thống nhất mỗi dòng manifest là đơn hàng hay từng kiện hàng.
- Socket.IO Gateway chưa được thêm vào phần này; sau khi thêm dependency `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`, cần cập nhật `package-lock.json`, rồi phát `trip:location_updated` sau khi lưu GPS thành công.
