# Đặc tả UI Figma & Prototype — VietLogix (TV6)

- **Link Figma Make (Interactive Design System & Prototype):** https://www.figma.com/make/5G3UJbpvPi5ZvPYRMPJfMx
- **Phạm vi TV6:** Bộ thiết kế chung, App Khách (`CUSTOMER`), App Nhân viên/Tài xế (`STAFF` / `DRIVER`), Prototype 3 luồng bấm thử.
- **Mã nguồn giao diện tĩnh (đã import vào Figma Make):** `figma-make-app/` (`index.html`, `styles.css`, `app.js`).

---

## 1. Cấu trúc App Khách (`CUSTOMER`) — 10 Màn hình

Điều hướng Bottom Tab chuẩn (khớp TV2): **Trang chủ** | **Đơn hàng** | **Tra cứu** | **Tài khoản**.

| STT | Màn hình | Thành phần chính | API liên kết (`/api/v1`) |
|---|---|---|---|
| 01 | **Đăng nhập / Đăng ký** | Chuyển tab Đăng nhập ↔ Đăng ký khách, nhập SĐT/Email + mật khẩu, nút chuyển nhanh sang App Nội bộ | `POST /auth/login`, `POST /auth/register` |
| 02 | **Trang chủ** | Ô tra cứu nhanh mã vận đơn, 4 nút tác vụ nhanh (Tạo đơn, Báo giá, Tra cứu, Nhận OTP), card đơn đang hoạt động, banner Hỏa tốc | `GET /orders?limit=1` |
| 03 | **Tạo đơn hàng** | Chọn Bến gửi/Bến nhận, thông tin người nhận, cân nặng (`kg`), tiền thu hộ `COD`, chọn gói Tiêu chuẩn (`1.0x`) / Hỏa tốc (`1.4x`), mô tả hàng | `GET /stations`, `GET /routes` |
| 04 | **Báo giá cước** | Hiển thị công thức: `Phí cơ bản + (Cân nặng × Đơn giá/kg) + Phụ phí hỏa tốc + Phí COD`, thời gian dự kiến, nút Xác nhận tạo đơn & sinh QR | `POST /price-rules/quote`, `POST /orders` |
| 05 | **Danh sách đơn** | Chip lọc trạng thái (`Tất cả`, `Chờ nhận`, `Đang đi`, `Đang giao`, `Đã giao`), danh sách thẻ đơn hàng | `GET /orders` (`{ items, page, total }`) |
| 06 | **Chi tiết + Theo dõi bản đồ** | Mã vận đơn + Tem QR, **Bản đồ lộ trình GPS trực quan**, thông tin tài xế & biển số xe, nút gọi tài xế, nút xác nhận OTP, Timeline trạng thái | `GET /orders/:id`, Socket `location:update` |
| 07 | **Tra cứu mã vận đơn** | Nhập mã hoặc chọn mã gợi ý để kiểm tra trạng thái & vị trí hiện tại | `GET /orders/track/:code` |
| 08 | **Xác nhận nhận hàng (OTP)** | 6 ô nhập mã OTP, đối chiếu người nhận & tiền COD phải trả, nút xác nhận đã nhận hàng | `POST /orders/:id/confirm-otp` |
| 09 | **Thông báo** | Danh sách thông báo cập nhật trạng thái đơn, mã OTP, đánh dấu đã đọc | `GET /notifications` |
| 10 | **Hồ sơ tài khoản** | Thông tin khách hàng, địa chỉ mặc định, thống kê đơn, chuyển chế độ xem & đăng xuất | `GET /auth/me`, `POST /auth/logout` |

---

## 2. Cấu trúc App Nhân viên / Tài xế (`STAFF` & `DRIVER`)

Một ứng dụng chung tự động đổi Bottom Tab theo vai trò (khớp TV2):
- **`STAFF`**: Tiếp nhận | Quét QR | Danh mục | Sự cố
- **`DRIVER`**: Chuyến của tôi | Manifest | Quét QR | Giao hàng

| STT | Màn hình | Vai trò | Thành phần chính | API liên kết (`/api/v1`) |
|---|---|---|---|---|
| 01 | **Tiếp nhận hàng** | `STAFF` | Danh sách đơn `CREATED` chờ tiếp nhận, nhập cân đo thực tế (`kg`), gán chuyến, xác nhận & in tem QR (`RECEIVED_AT_STATION`) | `PATCH /orders/:id/receive` |
| 02 | **Quét mã QR** | `STAFF` / `DRIVER` | Khung camera quét QR với tia laser, mô phỏng quét mã kiện hàng và điều hướng nhanh sang Tiếp nhận / Manifest / Giao hàng | `GET /orders/qr/:code` |
| 03 | **Danh mục Bến & Tuyến** | `STAFF` | Xem danh sách bến/văn phòng và tuyến (chỉ đọc) | `GET /stations`, `GET /routes` |
| 04 | **Chuyến của tôi** | `DRIVER` | Trạng thái GPS Live, danh sách chuyến xe được giao (`CH-HN-DN-1411`, biển số, giờ xuất bến, số kiện đã xếp) | `GET /trips/my-trips` |
| 05 | **Manifest (Bảng kê)** | `DRIVER` | Tổng trọng lượng, tổng COD của chuyến, danh sách từng kiện hàng kèm nút **Quét xếp xe** (`IN_TRANSIT`) hoặc **Giao hàng** | `GET /trips/:id/manifest` |
| 06 | **Cập nhật trạng thái** | `DRIVER` | Chọn đơn hàng, tự động gắn tọa độ GPS hiện tại, chuyển trạng thái `IN_TRANSIT` / `OUT_FOR_DELIVERY` | `PATCH /orders/:id/status` |
| 07 | **Giao hàng (OTP, Ảnh, COD)** | `DRIVER` | 3 bước: (1) Nhập OTP 6 số từ khách, (2) Chụp ảnh bằng chứng POD, (3) Xác nhận thu COD (Tiền mặt / Chuyển khoản QR) → `DELIVERED` | `POST /deliveries/:orderId/complete` |
| 08 | **Báo sự cố** | `STAFF` / `DRIVER` | Chọn đơn/chuyến, chọn loại sự cố (khách không nghe máy, hư hỏng, sai địa chỉ, sự cố xe), mô tả & gửi báo cáo (`DELIVERY_FAILED`) | `POST /incidents` |

---

## 3. Prototype — 3 Luồng Bấm Thử End-to-End

1. **Luồng 1 — Gửi hàng (`CUSTOMER` → `STAFF`)**:
   `Tạo đơn hàng` → `Xem báo giá & Xác nhận tạo đơn` → `NV Quầy quét QR & tiếp nhận tại bến` (`CREATED` → `RECEIVED_AT_STATION`).
2. **Luồng 2 — Vận chuyển (`DRIVER` → `CUSTOMER`)**:
   `Chuyến của tôi` → `Manifest (Quét xếp xe)` → `Cập nhật trạng thái & GPS` → `Khách theo dõi đơn trên bản đồ` (`RECEIVED_AT_STATION` → `IN_TRANSIT` → `OUT_FOR_DELIVERY`).
3. **Luồng 3 — Giao hàng & Sự cố (`DRIVER` ↔ `CUSTOMER`)**:
   `Tài xế giao hàng (OTP + Ảnh POD + Thu COD)` → `Khách xác nhận OTP` (`DELIVERED`), kèm nhánh ngoại lệ `Báo sự cố` (`DELIVERY_FAILED`).
