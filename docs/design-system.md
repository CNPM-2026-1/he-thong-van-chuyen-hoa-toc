# Bộ Thiết Kế Chung (Design System) — VietLogix (TV6)

Tài liệu đặc tả hệ thống giao diện dùng chung cho **App Mobile (React Native / Expo — TV2)** và **Web Admin (React + Ant Design — TV3, TV4, TV5)**.

---

## 1. Bảng màu (Color Tokens)

### 1.1 Màu thương hiệu & Trung tính

| Token | Hex | Mục đích sử dụng |
|---|---|---|
| `color.brand.primary` | `#0F4C81` | Màu chủ đạo (Header, nút chính, link, icon active) |
| `color.brand.primaryHover` | `#0A365C` | Trạng thái hover / pressed nút chính |
| `color.brand.primarySoft` | `#EFF6FF` | Nền badge, tab active, highlight card |
| `color.brand.secondary` | `#1D4ED8` | Gradient nhấn, thông tin phụ trợ |
| `color.brand.accent` | `#F97316` | CTA nổi bật (Quét QR, Hỏa tốc, Đang giao, Pin xe) |
| `color.brand.accentSoft` | `#FFF7ED` | Nền banner hỏa tốc / cảnh báo nhẹ |
| `color.bg.canvas` | `#F1F5F9` | Màu nền tổng thể (App & Web Admin) |
| `color.bg.surface` | `#FFFFFF` | Nền thẻ Card, Table, Bottom Tab, Modal |
| `color.bg.subtle` | `#F8FAFC` | Nền hàng table header, sub-card |
| `color.border.default` | `#E2E8F0` | Viền card, đường kẻ bảng |
| `color.border.strong` | `#CBD5E1` | Viền input, select |
| `color.text.primary` | `#0F172A` | Tiêu đề, nội dung chính |
| `color.text.secondary` | `#475569` | Mô tả phụ, nhãn form |
| `color.text.muted` | `#94A3B8` | Placeholder, timestamp |

### 1.2 Màu ngữ nghĩa (Semantic)

| Token | Foreground | Background | Dùng cho |
|---|---|---|---|
| `success` | `#15803D` | `#DCFCE7` | Giao thành công, OTP hợp lệ, GPS online |
| `warning` | `#B45309` | `#FEF3C7` | Chờ xử lý, hoàn hàng, cảnh báo chậm |
| `danger` | `#B91C1C` | `#FEE2E2` | Báo sự cố, giao thất bại, lỗi validate form |
| `info` | `#0369A1` | `#E0F2FE` | Đã nhận tại bến, thông tin tuyến |

---

## 2. Trạng thái đơn hàng & Quy ước màu (Order Status Badges)

Dùng thống nhất giữa Backend enum, App Khách, App Nhân viên/Tài xế và Web Admin:

| Mã trạng thái | Nhãn tiếng Việt | Màu chữ | Màu nền | Ý nghĩa |
|---|---|---|---|---|
| `CREATED` | Chờ tiếp nhận | `#475569` | `#F1F5F9` | Khách vừa tạo đơn, chờ mang ra bến |
| `RECEIVED_AT_STATION` | Đã nhận tại bến | `#0369A1` | `#E0F2FE` | NV quầy đã cân đo, dán tem QR |
| `IN_TRANSIT` | Đang vận chuyển | `#4338CA` | `#E0E7FF` | Đã xếp lên chuyến xe & đang chạy tuyến |
| `OUT_FOR_DELIVERY` | Đang giao hàng | `#C2410C` | `#FFEDD5` | Tài xế đang giao tận nơi / chờ OTP |
| `DELIVERED` | Giao thành công | `#15803D` | `#DCFCE7` | Đã xác thực OTP, chụp ảnh POD & thu COD |
| `DELIVERY_FAILED` | Sự cố giao hàng | `#B91C1C` | `#FEE2E2` | Khách không nghe máy / hư hỏng / từ chối |
| `RETURNED` | Hoàn hàng | `#92400E` | `#FEF3C7` | Đang chuyển hoàn về bến gửi |
| `CANCELLED` | Đã hủy | `#64748B` | `#F8FAFC` | Hủy trước khi tiếp nhận |

---

## 3. Typography (Hệ thống chữ)

- **Font chính (`sans`)**: `Inter`, `Plus Jakarta Sans`, fallback hệ thống (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Font kỹ thuật (`mono`)**: `JetBrains Mono`, `Fira Code`, `ui-monospace` — bắt buộc dùng cho **mã vận đơn (`VLX-2026-00841`)**, **biển số xe (`29B-482.19`)**, **mã OTP (`482910`)**, **tọa độ GPS** và **số tiền COD**.

| Style | Size / Weight | Line Height | Ứng dụng |
|---|---|---|---|
| `Display` | `24px / 800` | `1.2` | KPI Dashboard, tổng tiền cước |
| `Heading H1` | `18px / 800` | `1.3` | Tiêu đề trang Web / Modal |
| `Heading H2` | `15–16px / 700` | `1.35` | Header App Mobile, Card Header |
| `Body` | `13–14px / 400` | `1.5` | Nội dung danh sách, mô tả |
| `Label` | `12px / 600` | `1.3` | Nhãn input, tiêu đề cột bảng |
| `Caption / Badge` | `11px / 700` | `1.2` | Status badge, bottom tab label |

---

## 4. Khoảng cách, Bo góc & Đổ bóng

- **Spacing scale**: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.
- **Border Radius**: `sm: 6px`, `md: 10px` (Input, Button), `lg: 14px` (Card Mobile, Panel), `xl: 20px` (Hero Banner), `full: 9999px` (Badge, Chip).
- **Elevation**: `shadow-xs` cho card phẳng có viền `1px solid #E2E8F0`; `shadow-md` cho dropdown/toast.

---

## 5. Thành phần UI chuẩn (Components)

1. **Icon**: Bộ 16+ vector SVG nét `2px`, kích thước chuẩn `18px` (button/tab) và `24px` (quick actions): `package`, `truck`, `qr`, `mapPin`, `navigation`, `search`, `plus`, `cash`, `camera`, `shield`, `alert`, `bell`, `station`, `user`, `clock`, `check`.
2. **Button**:
   - Biến thể: `Primary` (`#0F4C81`), `Accent` (`#F97316`), `Secondary` (`#EFF6FF`), `Outline`, `Ghost`, `Success`, `Danger`.
   - Kích thước: `sm` (`6px 11px`), `md` (`9px 16px`), `lg` (`12px 20px`), `block` (full width trên mobile).
3. **Input & Form Controls**:
   - Text Input, Password, Search Input (icon trái), Numeric Input có hậu tố đơn vị (`kg`, `₫`), Select dropdown, Textarea, **OTP 6-box grid**, trạng thái lỗi `.is-error` (`#B91C1C`) kèm thông báo validate.
4. **Card**:
   - `Order Card`: Mã vận đơn mono + Status badge + Tuyến bến + Người nhận + Cước/COD.
   - `Trip / Manifest Card`: Mã chuyến + Biển số + Tiến độ xếp hàng (`loaded/total`).
   - `KPI Card`: Viền trái màu nhấn 4px + số liệu lớn.
5. **Table (Dùng chung Web Admin)**:
   - Đồng bộ schema phân trang `{ items, page, total }`, hỗ trợ tìm kiếm, badge trạng thái màu, cột thao tác nhanh.
