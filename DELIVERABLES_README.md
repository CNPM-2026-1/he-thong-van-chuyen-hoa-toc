# Bộ deliverables TV7 + TV8 - Sprint 1

Bộ tài liệu dành cho **Đầu mục 4 – Thiết kế hệ thống & đặc tả API** trong kế hoạch Sprint 1.

## TV7 - Thiết kế hệ thống

- Sơ đồ kiến trúc tổng thể: `docs/diagrams/architecture.puml`.
- Hai deployment diagram: `deployment-local.puml`, `deployment-server.puml`.
- Use case tổng quát và use case chi tiết cho CUSTOMER, STAFF, DRIVER, MANAGER, ADMIN.
- State diagram vòng đời đơn hàng, gồm hủy, sự cố và hoàn hàng.
- Năm sequence diagram: đăng nhập, tạo đơn, tiếp nhận quầy, lập manifest/xuất bến, giao hàng OTP.
- Thuyết minh: `docs/architecture.md`.

## TV8 - Đặc tả API

- OpenAPI 3.1: `docs/openapi.yaml` (45 path, 67 operations).
- Quy ước Socket.IO và payload: `docs/realtime-events.md`.
- Prism mock server: `docs/mock-server/`.
- Postman collection 67 request và environment local/server: `docs/postman/`.
- Ví dụ response theo từng operation: `docs/api-contract.md`.

## Chạy mock server

```bash
cd docs/mock-server
npm install
npm run mock
```

Base URL mock: `http://localhost:4010/api/v1`.

Kiểm tra hợp đồng OpenAPI trước khi mở PR:

```bash
cd docs/mock-server
npm install
npm run validate
```

Các request `PATCH` trong OpenAPI là cập nhật một phần; không cần gửi lại các trường không thay đổi.

## Trước khi merge

Các role, tiền tố API, envelope list/error và hình dạng login được giữ theo kế hoạch. Endpoint nghiệp vụ sau Sprint 1, enum trạng thái, quyền chi tiết và các quyết định triển khai là đề xuất thiết kế; cần TV1/TV5/nhóm trưởng review trước khi chốt.

Hướng dẫn tạo branch, commit, push và mở PR: [BRANCH_SETUP.md](BRANCH_SETUP.md).
