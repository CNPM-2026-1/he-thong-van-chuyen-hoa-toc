# Web Admin – Hệ thống vận chuyển hỏa tốc

## 1. Giới thiệu

Web Admin là giao diện quản trị của hệ thống vận chuyển hỏa tốc, được xây dựng nhằm hỗ trợ quản trị viên quản lý và theo dõi các dữ liệu trong hệ thống.

Các chức năng chính bao gồm đăng nhập, quản lý thông tin trạm, tuyến đường, phương tiện, tài xế và quy tắc giá.

## 2. Công nghệ sử dụng

- React 18: Xây dựng giao diện người dùng.
- Vite: Công cụ khởi tạo và chạy project.
- Ant Design: Thư viện giao diện.
- Axios: Gửi và xử lý các yêu cầu HTTP.
- JavaScript (JSX): Ngôn ngữ lập trình chính.

## 3. Cấu trúc thư mục

```text
web-admin/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── Dashboard.jsx
    ├── Login.jsx
    ├── api.js
    ├── style.css
    ├── components/
    │   └── crud/
    │       ├── CrudFormModal.jsx
    │       ├── CrudPage.jsx
    │       ├── CrudTable.jsx
    │       ├── RemoteSelect.jsx
    │       ├── helpers.jsx
    │       ├── index.js
    │       └── useCrud.js
    ├── mock/
    │   ├── mockApi.js
    │   └── seed.js
    ├── pages/
    │   └── catalog/
    │       ├── DriversPage.jsx
    │       ├── PriceRulesPage.jsx
    │       ├── RoutesPage.jsx
    │       ├── StationsPage.jsx
    │       ├── VehiclesPage.jsx
    │       └── index.jsx
    └── services/
        └── crudApi.js
