# Tài liệu thiết kế hệ thống & đặc tả API

Phạm vi: Đầu mục 4 - TV7 và TV8, dự án **Hệ thống quản lý quy trình vận chuyển hàng hóa hỏa tốc liên tỉnh cho nhà xe**.

## Danh mục tài liệu

| Tài liệu | Nội dung | Phụ trách |
|---|---|---|
| [architecture.md](architecture.md) | Kiến trúc logic, thành phần, luồng kết nối và các quyết định thiết kế | TV7 |
| [diagrams/](diagrams/) | Đủ 15 file PlantUML: kiến trúc, 2 deployment, use case tổng quát + 5 tác nhân, state đơn hàng, 5 sequence | TV7 |
| [openapi.yaml](openapi.yaml) | OpenAPI 3.1; hiện có 47 paths / 69 operations (gồm 2 route Notifications bổ sung) | TV8 |
| [realtime-events.md](realtime-events.md) | Quy ước Socket.IO, rooms, event name, payload, lỗi và reconnect | TV8 |
| [mock-server/README.md](mock-server/README.md) | Cài đặt/chạy Prism mock server | TV8 |
| [postman/](postman/) | Collection 69 requests và 2 environments local/server | TV8 |
| [api-contract.md](api-contract.md) | Quy ước dùng chung và ví dụ response cơ bản cho app/web/backend | TV7 + TV8 đề xuất chia sẻ |

## Cách xem sơ đồ

Các file `.puml` là mã nguồn PlantUML. Có thể mở bằng PlantUML extension trong VS Code hoặc dán vào PlantUML server. Không chỉnh ảnh xuất ra thay cho file `.puml`; cần giữ file nguồn để nhóm cập nhật.

## Thứ tự triển khai đề xuất

1. Nhóm thống nhất `api-contract.md`, `openapi.yaml`, enum trạng thái và role.
2. TV1 đối chiếu schema Prisma với các resource trong OpenAPI; TV2/TV3 dùng Postman/Prism để tích hợp giao diện.
3. Backend triển khai REST trước; Socket.IO dùng cùng access token và authorization theo resource.
4. Khi backend có endpoint thật, chuyển environment Postman từ mock URL sang API local/server và kiểm tra contract.

## Trạng thái tài liệu và kiểm tra

- Bộ PlantUML: 15 file nguồn đã được đưa vào `docs/diagrams/`.\n- OpenAPI: 47 paths / 69 operations; 2 route Notifications được bổ sung cho backend Sprint 2.\n- Postman: 69 requests; bổ sung danh mục Notifications (list + mark-read).\n- Prism mock: cấu hình tại `docs/mock-server/`; dùng chung `docs/openapi.yaml`.\n- CI tài liệu: `.github/workflows/design-contract-ci.yml` kiểm tra Prism/OpenAPI, số lượng sơ đồ, JSON Postman và environments. CI backend riêng tại `.github/workflows/backend-ci.yml`.\n\n## Kiểm tra trước khi mở PR

- Chạy `npm install` rồi `npm run validate` tại `docs/mock-server`; script khởi chạy Prism mock tạm thời và gọi thử `GET /api/v1/stations` để xác nhận OpenAPI parse được.
- Chạy `npm run mock` tại `docs/mock-server`, sau đó thử tối thiểu các luồng login, báo giá/tạo đơn, tiếp nhận, manifest, giao OTP và tracking bằng Postman.
- Preview toàn bộ file `.puml`; giữ mã nguồn PlantUML trong repository cùng ảnh xuất cho báo cáo nếu cần.
- Đối chiếu các role, phạm vi dữ liệu theo resource, enum trạng thái và schema Prisma với TV1/TV5 trước khi merge.

## Phạm vi và giả định

- Các vai trò `CUSTOMER`, `STAFF`, `DRIVER`, `MANAGER`, `ADMIN`, tiền tố `/api/v1`, JSON, phân trang `{ items, page, total }`, lỗi `{ code, message }` và login `{ accessToken, refreshToken, user }` được lấy từ kế hoạch Sprint 1.
- API nghiệp vụ, enum, payload và quy tắc chuyển trạng thái trong tài liệu là **đề xuất thiết kế** để hoàn thành đầu mục TV7/TV8; nhóm cần review với TV1/TV5 trước khi xem là hợp đồng cuối cùng.
- `localhost:3000` là cổng backend NestJS giả định theo kiến trúc đề xuất; `localhost:4010` là Prism mock. Thay URL server mẫu bằng hạ tầng thật của nhóm.


## Sprint 2 – Bộ 2

Bản tổng hợp triển khai backend của TV7 (Linh) và TV8 (Kiên): [sprint2-bo2-implementation.md](sprint2-bo2-implementation.md).

OpenAPI và realtime events đã được cập nhật cùng nhánh `feature/sprint2-bo2-backend`. Mô hình Manifest hiện dùng một `ManifestItem` cho mỗi `Package`; cần TV5/nhóm xác nhận và cập nhật ERD/data dictionary trước khi merge.
