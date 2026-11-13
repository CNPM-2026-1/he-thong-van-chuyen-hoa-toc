# Chạy mock API bằng Prism

Mock server đọc trực tiếp `../openapi.yaml`, không cần backend hoặc PostgreSQL.

## Yêu cầu

- Node.js `>=18.20.1` (Prism CLI 5.x).
- npm.

## Chạy lần đầu

Mở terminal tại thư mục `docs/mock-server`:

```bash
npm install
npm run mock
```

Kiểm tra OpenAPI trước khi mở pull request:

```bash
npm run validate
```

Lệnh này chỉ kiểm tra hợp đồng OpenAPI; Prism mock vẫn không thực hiện nghiệp vụ hay lưu dữ liệu.

Prism lắng nghe tại `http://localhost:4010`. API base URL cho Postman/mobile/web là:

```text
http://localhost:4010/api/v1
```

Prism mock sinh response dựa trên schema/example trong `openapi.yaml`. Dữ liệu mock không được lưu lâu dài và không thay thế backend thật.

## Kiểm tra nhanh

```bash
curl http://localhost:4010/api/v1/stations
```

Để dừng server nhấn `Ctrl+C`.

## Dùng trên điện thoại thật

Khi điện thoại chạy Expo Go, `localhost` trỏ về điện thoại chứ không phải máy tính. Đổi `baseUrl` sang IP LAN của máy tính, ví dụ `http://192.168.1.10:4010/api/v1`; bảo đảm máy tính và điện thoại cùng mạng Wi-Fi và firewall cho phép cổng 4010.

## Chuyển từ mock sang backend

Chọn environment `Local - Backend` trong Postman hoặc sửa `baseUrl` thành `http://localhost:3000/api/v1` sau khi NestJS chạy. Không thay đổi path `/api/v1` hoặc tự sửa field khi chưa cập nhật OpenAPI.
