# API contract chung - bản dùng để đồng bộ Sprint 1

Tài liệu rút gọn này cụ thể hóa các quy ước chung trong kế hoạch Sprint 1. Chi tiết endpoint và schema được quản lý tập trung tại [openapi.yaml](openapi.yaml).

## 1. Quy ước chung

- Base path: `/api/v1`; dữ liệu gửi/nhận JSON.
- Vai trò: `CUSTOMER`, `STAFF`, `DRIVER`, `MANAGER`, `ADMIN`.
- Header xác thực: `Authorization: Bearer <accessToken>`.
- Danh sách trả về đúng cấu trúc `{ "items": [...], "page": 1, "total": 0 }`.
- Lỗi trả về `{ "code": "...", "message": "..." }`.
- Login trả về `{ "accessToken": "...", "refreshToken": "...", "user": {...} }`.
- ID dùng UUID; thời gian ISO-8601 UTC; tiền là số nguyên VND; khối lượng là gram.

## 2. Ví dụ đăng nhập

`POST /api/v1/auth/login`

Request:

```json
{
  "identifier": "customer@example.com",
  "password": "Password123!"
}
```

Response `200`:

```json
{
  "accessToken": "eyJhbGciOi...access",
  "refreshToken": "eyJhbGciOi...refresh",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "fullName": "Nguyen Van A",
    "email": "customer@example.com",
    "phone": "0900000001",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

## 3. Ví dụ danh sách bến

`GET /api/v1/stations?page=1&pageSize=20&search=Ha Noi`

Response `200`:

```json
{
  "items": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "code": "HN-01",
      "name": "Ben xe Ha Noi",
      "type": "BUS_STATION",
      "address": "Ben xe My Dinh, Ha Noi",
      "province": "Ha Noi",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

## 4. Ví dụ lỗi

Response `400`:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "weightGrams must be a positive integer"
}
```

## 5. Quy tắc tích hợp

- Không tự đặt tên field hoặc enum khác OpenAPI. Nếu cần thay đổi, cập nhật `openapi.yaml` trước rồi thông báo các cặp mobile/web/backend.
- Client không tự tính giá cuối cùng; backend tính lại từ `price_rules` có hiệu lực.
- Không cho client tự cập nhật trạng thái đơn bất kỳ. Dùng endpoint nghiệp vụ tương ứng (nhận tại quầy, điều phối chuyến, xác nhận giao hàng).
- `DELETE` trên danh mục là xóa mềm/vô hiệu hóa; đơn/chuyến đã tham chiếu không bị mất.
- Những ví dụ ở đây là dữ liệu giả để phát triển giao diện, không phải dữ liệu thật.


## 6. Ví dụ response cho toàn bộ endpoint

Mỗi operation dưới đây có một ví dụ response thành công. Đây là dữ liệu giả để mobile/web dựng giao diện; giá trị và schema chính thức nằm ở `openapi.yaml`. Response list giữ nguyên envelope `{ "items", "page", "total" }`.

### POST `/auth/login` - Đăng nhập

HTTP `200`

```json
{
  "accessToken": "<access-token>",
  "refreshToken": "<refresh-token>",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "fullName": "Nguyen Van A",
    "email": "customer@example.com",
    "phone": "0900000001",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2026-11-11T08:00:00Z"
  }
}
```

### POST `/auth/logout` - Đăng xuất / thu hồi refresh token

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### GET `/auth/me` - Lấy thông tin tài khoản hiện tại

HTTP `200`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0900000001",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### POST `/auth/refresh` - Làm mới access/refresh token

HTTP `200`

```json
{
  "accessToken": "<new-access-token>",
  "refreshToken": "<new-refresh-token>"
}
```

### POST `/auth/register` - Đăng ký tài khoản khách hàng

HTTP `201`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0900000001",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### POST `/cod/reconciliations` - Tạo phiếu đối soát COD

HTTP `201`

```json
{
  "id": "eeeeeeee-1111-4111-8111-111111111111",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "expectedAmountVnd": 500000,
  "countedAmountVnd": 500000,
  "differenceVnd": 0,
  "status": "MATCHED",
  "createdAt": "2026-11-11T10:00:00Z"
}
```

### GET `/cod/transactions` - Danh sách giao dịch COD

HTTP `200`

```json
{
  "items": [
    {
      "id": "dddddddd-1111-4111-8111-111111111111",
      "orderId": "99999999-9999-4999-8999-999999999999",
      "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
      "amountVnd": 500000,
      "status": "PENDING_REMITTANCE",
      "collectedAt": "2026-11-11T09:00:00Z"
    }
  ],
  "page": 1,
  "total": 1
}
```

### GET `/drivers` - Danh sách tài xế

HTTP `200`

```json
{
  "items": [
    {
      "id": "66666666-6666-4666-8666-666666666666",
      "userId": "77777777-7777-4777-8777-777777777777",
      "fullName": "Le Van C",
      "phone": "0900000003",
      "licenseNumber": "B2-123456",
      "defaultVehicleId": "55555555-5555-4555-8555-555555555555",
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/drivers` - Tạo tài xế

HTTP `201`

```json
{
  "id": "66666666-6666-4666-8666-666666666666",
  "userId": "77777777-7777-4777-8777-777777777777",
  "fullName": "Le Van C",
  "phone": "0900000003",
  "licenseNumber": "B2-123456",
  "defaultVehicleId": "55555555-5555-4555-8555-555555555555",
  "isActive": true
}
```

### GET `/drivers/{driverId}` - Chi tiết tài xế

HTTP `200`

```json
{
  "id": "66666666-6666-4666-8666-666666666666",
  "userId": "77777777-7777-4777-8777-777777777777",
  "fullName": "Le Van C",
  "phone": "0900000003",
  "licenseNumber": "B2-123456",
  "defaultVehicleId": "55555555-5555-4555-8555-555555555555",
  "isActive": true
}
```

### PATCH `/drivers/{driverId}` - Cập nhật tài xế

HTTP `200`

```json
{
  "id": "66666666-6666-4666-8666-666666666666",
  "userId": "77777777-7777-4777-8777-777777777777",
  "fullName": "Le Van C",
  "phone": "0900000003",
  "licenseNumber": "B2-123456",
  "defaultVehicleId": "55555555-5555-4555-8555-555555555555",
  "isActive": true
}
```

### DELETE `/drivers/{driverId}` - Xóa mềm tài xế

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### GET `/incidents` - Danh sách sự cố

HTTP `200`

```json
{
  "items": [
    {
      "id": "ffffffff-1111-4111-8111-111111111111",
      "type": "DAMAGED_PACKAGE",
      "severity": "MEDIUM",
      "status": "OPEN",
      "orderId": "99999999-9999-4999-8999-999999999999",
      "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
      "reportedBy": "66666666-6666-4666-8666-666666666666",
      "description": "Bao bi bi rach",
      "createdAt": "2026-11-11T09:20:00Z"
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/incidents` - Báo sự cố

HTTP `201`

```json
{
  "id": "ffffffff-1111-4111-8111-111111111111",
  "type": "DAMAGED_PACKAGE",
  "severity": "MEDIUM",
  "status": "OPEN",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "reportedBy": "66666666-6666-4666-8666-666666666666",
  "description": "Bao bi bi rach",
  "createdAt": "2026-11-11T09:20:00Z"
}
```

### GET `/incidents/{incidentId}` - Chi tiết sự cố

HTTP `200`

```json
{
  "id": "ffffffff-1111-4111-8111-111111111111",
  "type": "DAMAGED_PACKAGE",
  "severity": "MEDIUM",
  "status": "OPEN",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "reportedBy": "66666666-6666-4666-8666-666666666666",
  "description": "Bao bi bi rach",
  "createdAt": "2026-11-11T09:20:00Z"
}
```

### PATCH `/incidents/{incidentId}` - Cập nhật/xử lý sự cố

HTTP `200`

```json
{
  "id": "ffffffff-1111-4111-8111-111111111111",
  "type": "DAMAGED_PACKAGE",
  "severity": "MEDIUM",
  "status": "RESOLVED",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "reportedBy": "66666666-6666-4666-8666-666666666666",
  "description": "Bao bi bi rach",
  "createdAt": "2026-11-11T09:20:00Z",
  "resolution": "Da dong goi lai va xac nhan voi quan ly",
  "updatedAt": "2026-11-11T10:00:00Z"
}
```

### PATCH `/manifest/items/{itemId}` - Cập nhật trạng thái kiện trong manifest

HTTP `200`

```json
{
  "id": "bbbbbbbb-1111-4111-8111-111111111111",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "status": "PENDING_LOAD"
}
```

### POST `/media/presigned-uploads` - Cấp URL upload ảnh/chứng từ

HTTP `201`

```json
{
  "uploadUrl": "https://storage.example.com/presigned-upload",
  "objectKey": "delivery-proof/2026/11/random-id.jpg",
  "expiresInSeconds": 300,
  "requiredHeaders": {
    "Content-Type": "image/jpeg"
  }
}
```

### GET `/orders` - Danh sách đơn hàng

HTTP `200`

```json
{
  "items": [
    {
      "id": "99999999-9999-4999-8999-999999999999",
      "trackingCode": "HT202611110001",
      "customerId": "11111111-1111-4111-8111-111111111111",
      "recipientName": "Tran Thi D",
      "recipientPhone": "0900000004",
      "originStationId": "22222222-2222-4222-8222-222222222222",
      "destinationStationId": "44444444-4444-4444-8444-444444444444",
      "description": "Tai nghe khong day",
      "packageCount": 1,
      "weightGrams": 2000,
      "serviceLevel": "EXPRESS",
      "codAmountVnd": 500000,
      "shippingFeeVnd": 91000,
      "status": "PENDING_RECEIPT",
      "createdAt": "2026-11-11T08:00:00Z",
      "updatedAt": "2026-11-11T08:00:00Z"
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/orders` - Tạo đơn hàng

HTTP `201`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "PENDING_RECEIPT",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T08:00:00Z"
}
```

### GET `/orders/{orderId}` - Chi tiết đơn hàng

HTTP `200`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "PENDING_RECEIPT",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T08:00:00Z"
}
```

### POST `/orders/{orderId}/cancel` - Hủy đơn

HTTP `200`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "CANCELLED",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T09:00:00Z"
}
```

### POST `/orders/{orderId}/delivery/confirm` - Xác nhận giao hàng bằng OTP

HTTP `200`

```json
{
  "id": "cccccccc-1111-4111-8111-111111111111",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "status": "DELIVERED",
  "recipientName": "Tran Thi D",
  "deliveredAt": "2026-11-11T09:00:00Z",
  "codCollectedVnd": 500000,
  "photoObjectKeys": [
    "delivery-proof/2026/11/image-001.jpg"
  ]
}
```

### POST `/orders/{orderId}/delivery/failed` - Ghi nhận giao hàng thất bại

HTTP `200`

```json
{
  "id": "cccccccc-1111-4111-8111-111111111111",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "status": "FAILED",
  "recipientName": "Tran Thi D",
  "codCollectedVnd": 0,
  "photoObjectKeys": [
    "delivery-proof/2026/11/image-001.jpg"
  ]
}
```

### POST `/orders/{orderId}/delivery/otp` - Yêu cầu gửi OTP cho người nhận

HTTP `200`

```json
{
  "message": "OTP sent to recipient",
  "sentAt": "2026-11-11T08:30:00Z",
  "expiresAt": "2026-11-11T08:35:00Z"
}
```

### POST `/orders/{orderId}/delivery/start` - Bắt đầu giao hàng

HTTP `200`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "OUT_FOR_DELIVERY",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T09:00:00Z"
}
```

### POST `/orders/{orderId}/receipt` - Xác nhận tiếp nhận đơn tại quầy

HTTP `200`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "RECEIVED",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T09:00:00Z"
}
```

### POST `/orders/{orderId}/return` - Bắt đầu hoàn hàng

HTTP `200`

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "customerId": "11111111-1111-4111-8111-111111111111",
  "recipientName": "Tran Thi D",
  "recipientPhone": "0900000004",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "description": "Tai nghe khong day",
  "packageCount": 1,
  "weightGrams": 2000,
  "serviceLevel": "EXPRESS",
  "codAmountVnd": 500000,
  "shippingFeeVnd": 91000,
  "status": "RETURNING",
  "createdAt": "2026-11-11T08:00:00Z",
  "updatedAt": "2026-11-11T09:00:00Z"
}
```

### GET `/orders/{orderId}/tracking` - Theo dõi trạng thái và vị trí đơn

HTTP `200`

```json
{
  "orderId": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "currentStatus": "IN_TRANSIT",
  "events": [
    {
      "status": "IN_TRANSIT",
      "occurredAt": "2026-11-11T08:31:00Z",
      "stationName": "Tren duong van chuyen",
      "note": "Xe da roi ben"
    }
  ]
}
```

### GET `/price-rules` - Danh sách bảng giá

HTTP `200`

```json
{
  "items": [
    {
      "id": "88888888-8888-4888-8888-888888888888",
      "routeId": "33333333-3333-4333-8333-333333333333",
      "baseFeeVnd": 30000,
      "pricePerKgVnd": 12000,
      "expressMultiplier": 1.5,
      "codFeeVnd": 10000,
      "effectiveFrom": "2026-11-01T00:00:00Z",
      "effectiveTo": "2026-12-01T00:00:00Z",
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/price-rules` - Tạo bảng giá

HTTP `201`

```json
{
  "id": "88888888-8888-4888-8888-888888888888",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "baseFeeVnd": 30000,
  "pricePerKgVnd": 12000,
  "expressMultiplier": 1.5,
  "codFeeVnd": 10000,
  "effectiveFrom": "2026-11-01T00:00:00Z",
  "effectiveTo": "2026-12-01T00:00:00Z",
  "isActive": true
}
```

### GET `/price-rules/{priceRuleId}` - Chi tiết bảng giá

HTTP `200`

```json
{
  "id": "88888888-8888-4888-8888-888888888888",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "baseFeeVnd": 30000,
  "pricePerKgVnd": 12000,
  "expressMultiplier": 1.5,
  "codFeeVnd": 10000,
  "effectiveFrom": "2026-11-01T00:00:00Z",
  "effectiveTo": "2026-12-01T00:00:00Z",
  "isActive": true
}
```

### PATCH `/price-rules/{priceRuleId}` - Cập nhật bảng giá

HTTP `200`

```json
{
  "id": "88888888-8888-4888-8888-888888888888",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "baseFeeVnd": 30000,
  "pricePerKgVnd": 12000,
  "expressMultiplier": 1.5,
  "codFeeVnd": 10000,
  "effectiveFrom": "2026-11-01T00:00:00Z",
  "effectiveTo": "2026-12-01T00:00:00Z",
  "isActive": true
}
```

### DELETE `/price-rules/{priceRuleId}` - Xóa mềm bảng giá

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### POST `/pricing/quotes` - Tính cước vận chuyển

HTTP `200`

```json
{
  "currency": "VND",
  "baseFeeVnd": 30000,
  "weightFeeVnd": 24000,
  "expressFeeVnd": 27000,
  "codFeeVnd": 10000,
  "totalVnd": 91000,
  "ruleId": "88888888-8888-4888-8888-888888888888"
}
```

### GET `/routes` - Danh sách tuyến

HTTP `200`

```json
{
  "items": [
    {
      "id": "33333333-3333-4333-8333-333333333333",
      "code": "HN-HCM",
      "name": "Ha Noi - TP Ho Chi Minh",
      "originStationId": "22222222-2222-4222-8222-222222222222",
      "destinationStationId": "44444444-4444-4444-8444-444444444444",
      "distanceKm": 1700,
      "estimatedDurationMinutes": 1800,
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/routes` - Tạo tuyến

HTTP `201`

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "code": "HN-HCM",
  "name": "Ha Noi - TP Ho Chi Minh",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "distanceKm": 1700,
  "estimatedDurationMinutes": 1800,
  "isActive": true
}
```

### GET `/routes/{routeId}` - Chi tiết tuyến

HTTP `200`

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "code": "HN-HCM",
  "name": "Ha Noi - TP Ho Chi Minh",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "distanceKm": 1700,
  "estimatedDurationMinutes": 1800,
  "isActive": true
}
```

### PATCH `/routes/{routeId}` - Cập nhật tuyến

HTTP `200`

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "code": "HN-HCM",
  "name": "Ha Noi - TP Ho Chi Minh",
  "originStationId": "22222222-2222-4222-8222-222222222222",
  "destinationStationId": "44444444-4444-4444-8444-444444444444",
  "distanceKm": 1700,
  "estimatedDurationMinutes": 1800,
  "isActive": true
}
```

### DELETE `/routes/{routeId}` - Xóa mềm tuyến

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### GET `/stations` - Danh sách bến

HTTP `200`

```json
{
  "items": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "code": "HN-01",
      "name": "Ben xe Ha Noi",
      "type": "BUS_STATION",
      "address": "Ben xe My Dinh, Ha Noi",
      "province": "Ha Noi",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "phone": "02430000000",
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/stations` - Tạo bến

HTTP `201`

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "code": "HN-01",
  "name": "Ben xe Ha Noi",
  "type": "BUS_STATION",
  "address": "Ben xe My Dinh, Ha Noi",
  "province": "Ha Noi",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "phone": "02430000000",
  "isActive": true
}
```

### GET `/stations/{stationId}` - Chi tiết bến

HTTP `200`

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "code": "HN-01",
  "name": "Ben xe Ha Noi",
  "type": "BUS_STATION",
  "address": "Ben xe My Dinh, Ha Noi",
  "province": "Ha Noi",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "phone": "02430000000",
  "isActive": true
}
```

### PATCH `/stations/{stationId}` - Cập nhật bến

HTTP `200`

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "code": "HN-01",
  "name": "Ben xe Ha Noi",
  "type": "BUS_STATION",
  "address": "Ben xe My Dinh, Ha Noi",
  "province": "Ha Noi",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "phone": "02430000000",
  "isActive": true
}
```

### DELETE `/stations/{stationId}` - Xóa mềm bến

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### GET `/statistics/cod` - Thống kê COD

HTTP `200`

```json
{
  "from": "2026-11-01",
  "to": "2026-11-11",
  "collectedVnd": 125000000,
  "reconciledVnd": 120000000,
  "pendingVnd": 5000000
}
```

### GET `/statistics/orders` - Thống kê đơn hàng

HTTP `200`

```json
{
  "from": "2026-11-01",
  "to": "2026-11-11",
  "byStatus": {
    "IN_TRANSIT": 85,
    "DELIVERED": 980
  },
  "byServiceLevel": {
    "STANDARD": 700,
    "EXPRESS": 500
  }
}
```

### GET `/statistics/overview` - Thống kê tổng quan

HTTP `200`

```json
{
  "from": "2026-11-01",
  "to": "2026-11-11",
  "totalOrders": 1200,
  "ordersInTransit": 85,
  "deliveredOrders": 980,
  "returnedOrders": 12,
  "totalCodVnd": 125000000,
  "openIncidents": 3
}
```

### GET `/trips` - Danh sách chuyến xe

HTTP `200`

```json
{
  "items": [
    {
      "id": "aaaaaaaa-1111-4111-8111-111111111111",
      "code": "TRIP-HN-HCM-001",
      "routeId": "33333333-3333-4333-8333-333333333333",
      "vehicleId": "55555555-5555-4555-8555-555555555555",
      "driverId": "66666666-6666-4666-8666-666666666666",
      "plannedDepartureAt": "2026-11-12T08:00:00Z",
      "plannedArrivalAt": "2026-11-13T08:00:00Z",
      "status": "PLANNED"
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/trips` - Tạo chuyến xe

HTTP `201`

```json
{
  "id": "aaaaaaaa-1111-4111-8111-111111111111",
  "code": "TRIP-HN-HCM-001",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "vehicleId": "55555555-5555-4555-8555-555555555555",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "plannedDepartureAt": "2026-11-12T08:00:00Z",
  "plannedArrivalAt": "2026-11-13T08:00:00Z",
  "status": "PLANNED"
}
```

### GET `/trips/{tripId}` - Chi tiết chuyến xe

HTTP `200`

```json
{
  "id": "aaaaaaaa-1111-4111-8111-111111111111",
  "code": "TRIP-HN-HCM-001",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "vehicleId": "55555555-5555-4555-8555-555555555555",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "plannedDepartureAt": "2026-11-12T08:00:00Z",
  "plannedArrivalAt": "2026-11-13T08:00:00Z",
  "status": "PLANNED"
}
```

### POST `/trips/{tripId}/locations` - Gửi tọa độ GPS của chuyến

HTTP `201`

```json
{
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "vehicleId": "55555555-5555-4555-8555-555555555555",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "speedKph": 48.5,
  "headingDegrees": 135,
  "recordedAt": "2026-11-11T08:31:00Z"
}
```

### GET `/trips/{tripId}/locations/latest` - Lấy vị trí mới nhất của chuyến

HTTP `200`

```json
{
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "vehicleId": "55555555-5555-4555-8555-555555555555",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "speedKph": 48.5,
  "headingDegrees": 135,
  "recordedAt": "2026-11-11T08:31:00Z"
}
```

### GET `/trips/{tripId}/manifest` - Xem manifest chuyến

HTTP `200`

```json
{
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "items": [],
  "totalItems": 0,
  "loadedItems": 0
}
```

### POST `/trips/{tripId}/manifest/items` - Thêm đơn vào manifest

HTTP `201`

```json
{
  "id": "bbbbbbbb-1111-4111-8111-111111111111",
  "tripId": "aaaaaaaa-1111-4111-8111-111111111111",
  "orderId": "99999999-9999-4999-8999-999999999999",
  "trackingCode": "HT202611110001",
  "status": "PENDING_LOAD"
}
```

### PATCH `/trips/{tripId}/status` - Cập nhật trạng thái chuyến

HTTP `200`

```json
{
  "id": "aaaaaaaa-1111-4111-8111-111111111111",
  "code": "TRIP-HN-HCM-001",
  "routeId": "33333333-3333-4333-8333-333333333333",
  "vehicleId": "55555555-5555-4555-8555-555555555555",
  "driverId": "66666666-6666-4666-8666-666666666666",
  "plannedDepartureAt": "2026-11-12T08:00:00Z",
  "plannedArrivalAt": "2026-11-13T08:00:00Z",
  "status": "IN_TRANSIT",
  "actualDepartureAt": "2026-11-12T08:05:00Z"
}
```

### GET `/users` - Danh sách tài khoản

HTTP `200`

```json
{
  "items": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "fullName": "Nguyen Van A",
      "email": "customer@example.com",
      "phone": "0900000001",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "createdAt": "2026-11-11T08:00:00Z"
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/users` - Tạo tài khoản nhân viên/tài xế

HTTP `201`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Tran Thi B",
  "email": "staff@example.com",
  "phone": "0900000002",
  "role": "STAFF",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### GET `/users/{userId}` - Chi tiết tài khoản

HTTP `200`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0900000001",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### PATCH `/users/{userId}` - Cập nhật tài khoản

HTTP `200`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0900000001",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### DELETE `/users/{userId}` - Xóa mềm tài khoản

HTTP `200`

```json
{
  "message": "Operation completed"
}
```

### PATCH `/users/{userId}/status` - Khóa/mở khóa tài khoản

HTTP `200`

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0900000001",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2026-11-11T08:00:00Z"
}
```

### GET `/vehicles` - Danh sách xe

HTTP `200`

```json
{
  "items": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "plateNumber": "29H-12345",
      "vehicleType": "TRUCK",
      "capacityKg": 5000,
      "capacityVolumeM3": 25,
      "status": "AVAILABLE",
      "isActive": true
    }
  ],
  "page": 1,
  "total": 1
}
```

### POST `/vehicles` - Tạo xe

HTTP `201`

```json
{
  "id": "55555555-5555-4555-8555-555555555555",
  "plateNumber": "29H-12345",
  "vehicleType": "TRUCK",
  "capacityKg": 5000,
  "capacityVolumeM3": 25,
  "status": "AVAILABLE",
  "isActive": true
}
```

### GET `/vehicles/{vehicleId}` - Chi tiết xe

HTTP `200`

```json
{
  "id": "55555555-5555-4555-8555-555555555555",
  "plateNumber": "29H-12345",
  "vehicleType": "TRUCK",
  "capacityKg": 5000,
  "capacityVolumeM3": 25,
  "status": "AVAILABLE",
  "isActive": true
}
```

### PATCH `/vehicles/{vehicleId}` - Cập nhật xe

HTTP `200`

```json
{
  "id": "55555555-5555-4555-8555-555555555555",
  "plateNumber": "29H-12345",
  "vehicleType": "TRUCK",
  "capacityKg": 5000,
  "capacityVolumeM3": 25,
  "status": "AVAILABLE",
  "isActive": true
}
```

### DELETE `/vehicles/{vehicleId}` - Xóa mềm xe

HTTP `200`

```json
{
  "message": "Operation completed"
}
```
