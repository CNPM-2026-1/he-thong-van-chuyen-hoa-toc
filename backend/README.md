# Backend – Hệ thống vận chuyển hỏa tốc

NestJS 10 + Prisma 5 + PostgreSQL 16. Sprint 1 có: xác thực JWT, phân quyền theo vai trò, quản lý tài khoản và các danh mục (bến, tuyến, xe, tài xế, bảng giá).

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
