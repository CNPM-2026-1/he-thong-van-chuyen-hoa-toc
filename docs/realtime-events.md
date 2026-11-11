# Quy ước sự kiện realtime - Socket.IO

## 1. Kết nối

- Transport: Socket.IO, namespace mặc định `/`.
- URL local đề xuất: `http://localhost:3000`; production dùng `https://<api-domain>`.
- Client gửi access token trong handshake `auth`:

```javascript
const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling'],
  auth: { token: accessToken }
});
```

- Server xác thực JWT và trạng thái tài khoản trước khi cho kết nối. Không gửi refresh token qua Socket.IO.
- Khi access token hết hạn, server ngắt kết nối với mã lỗi `TOKEN_EXPIRED`; client refresh bằng REST rồi kết nối lại.

## 2. Quy tắc đặt tên và envelope

- Event dùng `domain:action`, chữ thường, snake_case cho từ ghép: `order:status_changed`, `trip:location_updated`.
- Event do server phát có envelope chung:

```json
{
  "eventId": "uuid",
  "occurredAt": "2026-11-11T08:30:00.000Z",
  "data": {}
}
```

- `eventId` duy nhất để client loại bỏ event trùng khi reconnect. `occurredAt` là UTC.
- Không gửi access token, refresh token, OTP, mật khẩu hoặc dữ liệu cá nhân không cần thiết trong payload.

## 3. Rooms và quyền tham gia

| Room | Ai được tham gia | Mục đích |
|---|---|---|
| `user:{userId}` | Chính user đó; ADMIN theo chính sách audit | Thông báo cá nhân |
| `order:{orderId}` | CUSTOMER sở hữu đơn, STAFF/MANAGER liên quan, DRIVER được phân công | Trạng thái và tiến trình đơn |
| `trip:{tripId}` | DRIVER được phân công, STAFF/MANAGER vận hành, CUSTOMER của các đơn thuộc chuyến theo policy | Vị trí xe, manifest/chuyến |
| `station:{stationId}` | STAFF/MANAGER được phân công tại bến | Đơn chờ tiếp nhận và hoạt động ở bến |

Client không tự chọn room tùy ý. Dùng event client-to-server `room:join` với `{ "resourceType": "order", "resourceId": "uuid" }`; server phải kiểm tra quyền. Khi rời màn hình, client gửi `room:leave` cùng payload.

## 4. Danh sách event

### 4.1 Server -> client

| Event | Khi phát | Payload `data` |
|---|---|---|
| `order:status_changed` | Đơn đổi trạng thái sau khi transaction thành công | `orderId`, `trackingCode`, `fromStatus`, `toStatus`, `actorId`, `stationId?`, `reason?` |
| `trip:location_updated` | Có tọa độ mới hợp lệ từ tài xế | `tripId`, `vehicleId`, `driverId`, `latitude`, `longitude`, `speedKph?`, `headingDegrees?`, `recordedAt` |
| `manifest:item_scanned` | Kiện được scan khi xếp/dỡ chuyến | `tripId`, `manifestItemId`, `orderId`, `trackingCode`, `action` (`LOADED`/`UNLOADED`), `scannedBy`, `scannedAt` |
| `delivery:completed` | Xác nhận OTP và giao hàng thành công | `orderId`, `trackingCode`, `deliveredAt`, `recipientName`, `codCollectedVnd` |
| `incident:created` | Sự cố được tạo | `incidentId`, `orderId?`, `tripId?`, `type`, `severity`, `reportedBy`, `createdAt` |
| `incident:updated` | Sự cố đổi trạng thái/được xử lý | `incidentId`, `status`, `resolution?`, `updatedAt`, `updatedBy` |
| `notification:new` | Có thông báo cá nhân | `notificationId`, `type`, `title`, `body`, `resourceType?`, `resourceId?`, `createdAt` |

Ví dụ `order:status_changed`:

```json
{
  "eventId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "occurredAt": "2026-11-11T08:30:00.000Z",
  "data": {
    "orderId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "trackingCode": "HT202611110001",
    "fromStatus": "RECEIVED",
    "toStatus": "WAITING_FOR_DISPATCH",
    "actorId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    "stationId": "dddddddd-dddd-4ddd-8ddd-dddddddddddd"
  }
}
```

Ví dụ `trip:location_updated`:

```json
{
  "eventId": "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  "occurredAt": "2026-11-11T08:31:00.000Z",
  "data": {
    "tripId": "ffffffff-ffff-4fff-8fff-ffffffffffff",
    "vehicleId": "11111111-1111-4111-8111-111111111112",
    "driverId": "22222222-2222-4222-8222-222222222223",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "speedKph": 48.5,
    "headingDegrees": 135,
    "recordedAt": "2026-11-11T08:31:00.000Z"
  }
}
```

### 4.2 Client -> server

| Event | Payload | Server xử lý |
|---|---|---|
| `room:join` | `{ resourceType, resourceId }` | Kiểm tra quyền và join room; trả ack `{ ok: true }` hoặc lỗi |
| `room:leave` | `{ resourceType, resourceId }` | Rời room tương ứng |
| `ping:client` | `{ sentAt }` | Trả `pong:server` để đo kết nối (không dùng thay heartbeat Socket.IO) |

Client không phát `order:status_changed`, `trip:location_updated` hay `delivery:completed`; đây là event server-authoritative. Vị trí được gửi bằng REST `POST /trips/{tripId}/locations`, sau khi backend lưu/validate thì backend phát event.

## 5. Lỗi và reconnect

- Ack lỗi chuẩn: `{ "ok": false, "error": { "code": "FORBIDDEN", "message": "Not allowed to join this room" } }`.
- Mất kết nối: dùng reconnect có backoff; sau reconnect xác thực lại và join lại room cần thiết.
- Event realtime không thay thế REST source of truth. Sau reconnect hoặc khi nghi ngờ mất event, client gọi REST để đồng bộ trạng thái hiện tại.
- `eventId` dùng deduplicate; client không giả định event đến đúng thứ tự tuyệt đối. So sánh `occurredAt` và tải lại resource nếu có xung đột.
- Vị trí xe có thể gửi mỗi 5-15 giây khi đang di chuyển (giá trị cấu hình đề xuất); chỉ phát khi tọa độ hợp lệ và trip còn hoạt động.

## 6. Chính sách bảo mật/riêng tư

- Chỉ phát vị trí xe cho người có quyền xem chuyến/đơn liên quan.
- Không đưa OTP vào event; chỉ thông báo OTP đã gửi hoặc giao hàng hoàn tất.
- Giới hạn tần suất cập nhật vị trí, kiểm tra quyền DRIVER và trip được phân công.
- Với nhiều backend instance, dùng Socket.IO adapter (ví dụ Redis) để đồng bộ room/event; local một instance chưa cần Redis.
