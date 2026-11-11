# Postman

Import ba file JSON trong Postman theo thứ tự: collection `express-delivery-api.postman_collection.json`, sau đó environment local hoặc server.

- **Local - Prism Mock**: `baseUrl=http://localhost:4010/api/v1`; chạy `npm install && npm run mock` tại `docs/mock-server` trước.
- **Server - Staging (replace URL)**: thay `https://api.example.com/api/v1` bằng domain staging thật, sau đó login để lấy token. Không commit token thật vào repository.
- Request Login và Refresh tự lưu `accessToken`/`refreshToken` từ response vào environment.
- Collection chứa endpoint Auth, Users, danh mục Sprint 1, Pricing, Orders, Trips, Manifest, Tracking, Delivery, COD, Incidents, Statistics và Media.
- Một số endpoint nghiệp vụ ở OpenAPI là thiết kế đề xuất cho sprint sau; Prism tạo response giả từ schema, không thực hiện nghiệp vụ hay lưu dữ liệu.
