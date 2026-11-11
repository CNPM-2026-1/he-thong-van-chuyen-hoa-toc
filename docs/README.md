# Tài liệu thiết kế hệ thống & đặc tả API

Phạm vi: Đầu mục 4 - TV7 và TV8, dự án **Hệ thống quản lý quy trình vận chuyển hàng hóa hỏa tốc liên tỉnh cho nhà xe**.

## Danh mục tài liệu

| Tài liệu | Nội dung | Phụ trách |
|---|---|---|
| [architecture.md](architecture.md) | Kiến trúc logic, thành phần, luồng kết nối và các quyết định thiết kế | TV7 |
| [diagrams/](diagrams/) | PlantUML: kiến trúc, 2 deployment, use case tổng quát + từng actor, state đơn hàng, 5 sequence | TV7 |
| [openapi.yaml](openapi.yaml) | Hợp đồng REST API cho Sprint 1 và các sprint nghiệp vụ tiếp theo | TV8 |
| [realtime-events.md](realtime-events.md) | Quy ước Socket.IO, rooms, event name, payload, lỗi và reconnect | TV8 |
| [mock-server/README.md](mock-server/README.md) | Cài đặt/chạy Prism mock server | TV8 |
| [postman/](postman/) | Collection và 2 environment local/server | TV8 |
| [api-contract.md](api-contract.md) | Quy ước dùng chung và ví dụ response cơ bản cho app/web/backend | TV7 + TV8 đề xuất chia sẻ |

## Cách xem sơ đồ

Các file `.puml` là mã nguồn PlantUML. Có thể mở bằng PlantUML extension trong VS Code hoặc dán vào PlantUML server. Không chỉnh ảnh xuất ra thay cho file `.puml`; cần giữ file nguồn để nhóm cập nhật.

## Thứ tự triển khai đề xuất

1. Nhóm thống nhất `api-contract.md`, `openapi.yaml`, enum trạng thái và role.
2. TV1 đối chiếu schema Prisma với các resource trong OpenAPI; TV2/TV3 dùng Postman/Prism để tích hợp giao diện.
3. Backend triển khai REST trước; Socket.IO dùng cùng access token và authorization theo resource.
4. Khi backend có endpoint thật, chuyển environment Postman từ mock URL sang API local/server và kiểm tra contract.

## Phạm vi và giả định

- Các vai trò `CUSTOMER`, `STAFF`, `DRIVER`, `MANAGER`, `ADMIN`, tiền tố `/api/v1`, JSON, phân trang `{ items, page, total }`, lỗi `{ code, message }` và login `{ accessToken, refreshToken, user }` được lấy từ kế hoạch Sprint 1.
- API nghiệp vụ, enum, payload và quy tắc chuyển trạng thái trong tài liệu là **đề xuất thiết kế** để hoàn thành đầu mục TV7/TV8; nhóm cần review với TV1/TV5 trước khi xem là hợp đồng cuối cùng.
- `localhost:3000` là cổng backend NestJS giả định theo kiến trúc đề xuất; `localhost:4010` là Prism mock. Thay URL server mẫu bằng hạ tầng thật của nhóm.
