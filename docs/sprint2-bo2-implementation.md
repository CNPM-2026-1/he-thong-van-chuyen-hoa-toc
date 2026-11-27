# Sprint 2 – Bộ 2: triển khai backend vận hành

Nhánh: `feature/sprint2-bo2-backend`  
Nền: `feature/tv7-trips-tracking` (đã kế thừa backend TV1 trên NestJS/Prisma/PostgreSQL).

## Phạm vi đã bổ sung

### TV7 – Linh
- Trip, TripLocation, TripStatusHistory và PostgreSQL migrations.
- Trips REST API: list/create/detail/update status.
- Package-level Manifest: add all packages of an order, list manifest, scan/load/unload packages, mark missing/damaged.
- GPS REST API: driver assignment validation, coordinate/time validation, latest location.
- Socket.IO Gateway: JWT handshake, rooms and server-side realtime events.

### TV8 – Kiên
- Delivery start, OTP request, confirm delivery, failure, manager-approved retry, return initiation and return completion APIs.
- OTP hash + AES-GCM ciphertext, expiry, attempt count and SMS adapter.
- DeliveryAttempt, COD transactions and reconciliation.
- Incident report/resolution, customer and manager notifications.
- Dashboard metrics for overview, orders and COD.
- Presigned upload endpoint with S3-compatible SigV4 URLs and MediaObject metadata.

## Mô hình dữ liệu Manifest

Một dòng `ManifestItem` đại diện cho một Package vật lý; `POST /trips/{tripId}/manifest/items` vẫn nhận `orderId`, backend tạo item cho tất cả Package thuộc Order. Quyết định này bám cặp `KienHang`–`ChiTietPhieuKe` trong tài liệu ERD/SQL Server của nhánh `database`.

**Cần TV5/nhóm duyệt trước khi merge:** SQL Server script phải được đối chiếu/chuyển đổi thành PostgreSQL/Prisma; không chạy script SQL Server trên PostgreSQL.

## Danh sách dữ liệu Sprint 2

Các bảng thêm mới hoặc mở rộng:
- `trips.version`
- `orders`, `packages`
- `manifests`, `manifest_items`
- `order_status_history`
- `delivery_otps`, `delivery_attempts`
- `cod_transactions`, `cod_reconciliations`, `cod_reconciliation_items`
- `incidents`, `notifications`, `media_objects`

Migrations:
- `20261127070000_add_trips_tracking`
- `20261127080000_add_idempotency_records`
- `20261127100000_add_sprint2_operations`

## Điều kiện bảo mật

- Client không tự đặt trạng thái Order/Trip; backend kiểm tra transition và ghi history.
- DRIVER chỉ thao tác Trip được phân công.
- CUSTOMER chỉ xem vị trí xe nếu có Order của mình trên Trip và Order đang IN_TRANSIT.
- STAFF chưa có bảng phân công theo bến trong schema; một số endpoint/rooms STAFF bị từ chối đến khi có mô hình assignment.
- Write operations có Idempotency-Key UUID và lưu request hash/response trong 24 giờ.
- Không đưa OTP vào response hay Socket.IO event.
- Giao lại chỉ cho đơn DELIVERY_FAILED sau khi toàn bộ kiện đã dỡ; OTP của lần giao cũ bị vô hiệu.
- Hoàn trực tiếp chỉ từ DELIVERY_FAILED; đơn INCIDENT_HOLD phải qua quy trình Incident. Xác nhận RETURNED ghi returnedAt và history.
- Ảnh upload thông qua presigned URL; backend kiểm tra quyền sở hữu objectKey/purpose khi tham chiếu, nhưng bước kiểm tra object đã thực sự được upload cần được xác nhận ở tích hợp storage cuối cùng.

## Việc cần hoàn tất trước khi merge

1. Chạy `npm install` trong `backend/` để cập nhật `package-lock.json` vì nhánh có thêm Socket.IO dependencies.
2. Chạy `npx prisma format`, `npx prisma validate`, `npm run prisma:generate`, `npm run db:deploy`, `npm run build`.
3. Kiểm thử các luồng: tạo Trip → thêm Order vào manifest → load packages → DISPATCHED → IN_TRANSIT → GPS realtime → ARRIVED → unload → delivery OTP → COD reconciliation.
4. Test OTP local qua log backend; test ảnh qua MinIO.
5. TV1/TV5 cần chốt Order/Package creation, mapping DonHang/KienHang, ERD, enum và phân công STAFF theo bến.
6. Lưu ý: nhánh này chưa có OrdersModule/PricingModule; POST /orders, POST /pricing/quotes và POST /orders/{orderId}/receipt hiện chỉ là OpenAPI/Prism/Postman contract, chưa phải backend endpoint chạy thật.
