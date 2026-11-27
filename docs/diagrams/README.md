# PlantUML diagrams

Mỗi file `.puml` là source diagram có thể review bằng Git diff.

| File | Nội dung |
|---|---|
| `architecture.puml` | Sơ đồ thành phần và kết nối hệ thống |
| `deployment-local.puml` | Chạy local trên máy dev + Docker |
| `deployment-server.puml` | Triển khai server đề xuất |
| `use-cases-general.puml` | Use case tổng quát |
| `use-cases-customer.puml` | Use case CUSTOMER |
| `use-cases-staff.puml` | Use case STAFF |
| `use-cases-driver.puml` | Use case DRIVER |
| `use-cases-manager.puml` | Use case MANAGER |
| `use-cases-admin.puml` | Use case ADMIN |
| `order-state.puml` | Vòng đời đơn hàng, hủy, sự cố và hoàn hàng |
| `sequence-login.puml` | Đăng nhập |
| `sequence-create-order.puml` | Báo giá và tạo đơn |
| `sequence-counter-receive.puml` | Tiếp nhận tại quầy |
| `sequence-dispatch-trip.puml` | Lập manifest và xuất bến |
| `sequence-delivery-otp.puml` | Giao hàng bằng OTP và chứng từ |

Có thể cài extension PlantUML trong VS Code, mở file `.puml`, sau đó dùng lệnh **PlantUML: Preview Current Diagram**. Nếu export ảnh để đưa vào báo cáo, giữ cả file `.puml` trong repository để nhóm còn sửa được.
