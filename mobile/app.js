/* ==========================================================================
   VietLogix TV6 — Design System, Mobile UI & Interactive Prototype
   ========================================================================== */

const ICONS = {
  package: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>`,
  truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  qr: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h4v4h-4z"/><path d="M14 20h1"/></svg>`,
  mapPin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  navigation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  cash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  station: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  zap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

const ORDER_STATUSES = {
  CREATED: { label: "Chờ tiếp nhận", cls: "status-CREATED", desc: "Khách đã tạo đơn, chờ mang ra bến hoặc lấy hàng" },
  RECEIVED_AT_STATION: { label: "Đã nhận tại bến", cls: "status-RECEIVED_AT_STATION", desc: "Nhân viên quầy đã cân đo & dán tem QR" },
  IN_TRANSIT: { label: "Đang vận chuyển", cls: "status-IN_TRANSIT", desc: "Kiện hàng đã xếp lên chuyến xe & đang di chuyển" },
  OUT_FOR_DELIVERY: { label: "Đang giao hàng", cls: "status-OUT_FOR_DELIVERY", desc: "Tài xế đang giao tận nơi / chờ OTP khách nhận" },
  DELIVERED: { label: "Giao thành công", cls: "status-DELIVERED", desc: "Đã xác thực OTP, chụp ảnh POD và thu COD" },
  DELIVERY_FAILED: { label: "Sự cố giao hàng", cls: "status-DELIVERY_FAILED", desc: "Gặp sự cố hoặc khách không nghe máy" },
  RETURNED: { label: "Hoàn hàng", cls: "status-RETURNED", desc: "Đang chuyển hoàn về bến gửi" },
  CANCELLED: { label: "Đã hủy", cls: "status-CANCELLED", desc: "Đơn đã hủy trước khi tiếp nhận" }
};

const STATIONS = [
  { id: "ST-HN", code: "HN-GP", name: "Bến xe Giáp Bát (Hà Nội)", address: "Km6 Giải Phóng, Hoàng Mai, Hà Nội", phone: "024 3864 1111" },
  { id: "ST-DN", code: "DN-TT", name: "Bến xe Trung Tâm (Đà Nẵng)", address: "185 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng", phone: "0236 376 2222" },
  { id: "ST-HCM", code: "HCM-MD", name: "Bến xe Miền Đông Mới (TP.HCM)", address: "501 Hoàng Hữu Nam, TP. Thủ Đức, TP.HCM", phone: "028 3899 3333" },
  { id: "ST-HP", code: "HP-NI", name: "Bến xe Vĩnh Niệm (Hải Phòng)", address: "15 Bùi Viện, Lê Chân, Hải Phòng", phone: "0225 385 4444" }
];

const PRICE_RULES = [
  { id: "PR-1", from: "ST-HN", to: "ST-DN", baseFee: 35000, perKg: 12000, expressFactor: 1.4, codRate: 0.01, minCodFee: 10000, eta: "14 - 18 giờ" },
  { id: "PR-2", from: "ST-HN", to: "ST-HCM", baseFee: 50000, perKg: 18000, expressFactor: 1.5, codRate: 0.01, minCodFee: 12000, eta: "24 - 30 giờ" },
  { id: "PR-3", from: "ST-HN", to: "ST-HP", baseFee: 25000, perKg: 8000, expressFactor: 1.3, codRate: 0.01, minCodFee: 8000, eta: "2 - 3 giờ" },
  { id: "PR-4", from: "ST-DN", to: "ST-HCM", baseFee: 40000, perKg: 15000, expressFactor: 1.4, codRate: 0.01, minCodFee: 10000, eta: "16 - 20 giờ" }
];

const INITIAL_STATE = () => ({
  workspaceMode: "design-system", // design-system | customer-app | ops-app | prototype
  customerScreen: "home", // auth | home | create | quote | orders | detail | track | otp | notifications | profile
  customerAuthTab: "login",
  customerFilter: "ALL",
  opsRole: "STAFF", // STAFF | DRIVER
  opsScreen: "receive", // receive | qr | catalog | trips | manifest | update-status | deliver | incident
  selectedOrderId: "VLX-2026-00841",
  selectedTripId: "CH-HN-DN-1411",
  trackInput: "VLX-2026-00841",
  qrLastScanned: null,
  podPhotoTaken: false,
  codCollected: true,
  codMethod: "CASH",
  otpCode: "482910",
  incidentSubmitted: false,
  draftOrder: {
    fromStation: "ST-HN",
    toStation: "ST-DN",
    senderName: "Trần Minh Anh",
    senderPhone: "0912 345 678",
    receiverName: "Lê Quốc Bảo",
    receiverPhone: "0988 221 900",
    receiverAddress: "24 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    itemDesc: "Linh kiện điện tử & phụ kiện",
    weightKg: 3.5,
    serviceType: "EXPRESS", // STANDARD | EXPRESS
    codAmount: 1250000,
    note: "Hàng dễ vỡ, gọi trước khi giao"
  },
  orders: [
    {
      id: "VLX-2026-00841",
      from: "ST-HN",
      to: "ST-DN",
      sender: "Trần Minh Anh",
      receiver: "Lê Quốc Bảo",
      receiverPhone: "0988 221 900",
      address: "24 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      itemDesc: "Máy quét mã vạch & phụ kiện",
      weightKg: 4.2,
      serviceType: "EXPRESS",
      shippingFee: 129800,
      codAmount: 1850000,
      status: "OUT_FOR_DELIVERY",
      tripId: "CH-HN-DN-1411",
      driverName: "Phạm Văn Hùng",
      driverPhone: "0905 778 990",
      vehiclePlate: "29B-482.19",
      gpsLabel: "16.0544° N, 108.2022° E (Q. Hải Châu, Đà Nẵng)",
      gpsProgress: 90,
      otp: "482910",
      loadedOnTrip: true,
      timeline: [
        { time: "14/11 15:40", title: "Đang giao hàng tới người nhận", detail: "Tài xế Phạm Văn Hùng đang trên đường giao", state: "current" },
        { time: "14/11 13:15", title: "Đã tới Bến xe Trung Tâm (Đà Nẵng)", detail: "Đã dỡ hàng khỏi xe 29B-482.19", state: "done" },
        { time: "13/11 21:00", title: "Đang vận chuyển tuyến HN → ĐN", detail: "Chuyến CH-HN-DN-1411 xuất bến Giáp Bát", state: "done" },
        { time: "13/11 17:20", title: "Đã tiếp nhận tại bến Giáp Bát", detail: "NV quầy Nguyễn Lan cân thực tế 4.2 kg & dán tem QR", state: "done" },
        { time: "13/11 16:05", title: "Khách tạo đơn trên App", detail: "Mã vận đơn VLX-2026-00841 được khởi tạo", state: "done" }
      ]
    },
    {
      id: "VLX-2026-00845",
      from: "ST-HN",
      to: "ST-DN",
      sender: "Nguyễn Hoàng Nam",
      receiver: "Võ Thị Thu Hà",
      receiverPhone: "0935 112 345",
      address: "88 Lê Duẩn, Thanh Khê, Đà Nẵng",
      itemDesc: "Hồ sơ & mẫu vải may mặc",
      weightKg: 2.0,
      serviceType: "STANDARD",
      shippingFee: 59000,
      codAmount: 0,
      status: "CREATED",
      tripId: "CH-HN-DN-1411",
      driverName: "Phạm Văn Hùng",
      driverPhone: "0905 778 990",
      vehiclePlate: "29B-482.19",
      gpsLabel: "20.9806° N, 105.8414° E (Bến xe Giáp Bát, Hà Nội)",
      gpsProgress: 8,
      otp: "190422",
      loadedOnTrip: false,
      timeline: [
        { time: "14/11 16:10", title: "Đơn mới tạo — Chờ tiếp nhận", detail: "Khách đang mang kiện hàng ra Bến Giáp Bát", state: "current" }
      ]
    },
    {
      id: "VLX-2026-00839",
      from: "ST-HN",
      to: "ST-HCM",
      sender: "Trần Minh Anh",
      receiver: "Đặng Hữu Phước",
      receiverPhone: "0977 889 102",
      address: "120 Điện Biên Phủ, Bình Thạnh, TP.HCM",
      itemDesc: "Thiết bị mạng Router Wi-Fi 6",
      weightKg: 6.0,
      serviceType: "STANDARD",
      shippingFee: 168000,
      codAmount: 2400000,
      status: "IN_TRANSIT",
      tripId: "CH-HN-HCM-1410",
      driverName: "Nguyễn Đức Thắng",
      driverPhone: "0918 334 556",
      vehiclePlate: "29H-771.05",
      gpsLabel: "14.0583° N, 109.0432° E (QL1A qua Bình Định)",
      gpsProgress: 62,
      otp: "774105",
      loadedOnTrip: true,
      timeline: [
        { time: "14/11 14:20", title: "Đang vận chuyển qua Bình Định", detail: "GPS xe 29H-771.05 cập nhật tự động", state: "current" },
        { time: "13/11 19:00", title: "Đã xếp lên chuyến CH-HN-HCM-1410", detail: "Xuất bến Giáp Bát đúng giờ", state: "done" },
        { time: "13/11 15:10", title: "Đã tiếp nhận tại bến", detail: "Xác nhận trọng lượng 6.0 kg", state: "done" }
      ]
    },
    {
      id: "VLX-2026-00830",
      from: "ST-HN",
      to: "ST-HP",
      sender: "Trần Minh Anh",
      receiver: "Bùi Quang Minh",
      receiverPhone: "0904 667 889",
      address: "42 Lạch Tray, Ngô Quyền, Hải Phòng",
      itemDesc: "Phụ tùng xe máy đóng hộp",
      weightKg: 5.0,
      serviceType: "STANDARD",
      shippingFee: 75000,
      codAmount: 950000,
      status: "DELIVERED",
      tripId: "CH-HN-HP-1308",
      driverName: "Lê Văn Dũng",
      driverPhone: "0903 221 678",
      vehiclePlate: "15B-209.44",
      gpsLabel: "20.8449° N, 106.6881° E (Ngô Quyền, Hải Phòng)",
      gpsProgress: 100,
      otp: "551209",
      loadedOnTrip: true,
      timeline: [
        { time: "13/11 16:45", title: "Giao thành công • Đã thu COD 950.000₫", detail: "Khách nhập OTP 551209 & có ảnh ký nhận POD", state: "done" },
        { time: "13/11 15:10", title: "Đang giao hàng", detail: "Tài xế Lê Văn Dũng liên hệ người nhận", state: "done" },
        { time: "13/11 12:00", title: "Đã tiếp nhận tại bến", detail: "Cân nặng 5.0 kg", state: "done" }
      ]
    }
  ],
  trips: [
    {
      id: "CH-HN-DN-1411",
      routeLabel: "Hà Nội (Giáp Bát) → Đà Nẵng (Trung Tâm)",
      vehiclePlate: "29B-482.19",
      driverName: "Phạm Văn Hùng",
      departure: "14/11 18:00",
      status: "Đang khai thác / Chuẩn bị xuất bến",
      totalCapacityKg: 1500
    },
    {
      id: "CH-HN-HCM-1410",
      routeLabel: "Hà Nội (Giáp Bát) → TP.HCM (Miền Đông)",
      vehiclePlate: "29H-771.05",
      driverName: "Nguyễn Đức Thắng",
      departure: "13/11 19:00",
      status: "Đang trên tuyến (QL1A)",
      totalCapacityKg: 2500
    }
  ],
  notifications: [
    { id: "N1", unread: true, time: "5 phút trước", title: "Đơn VLX-2026-00841 đang được giao!", body: "Tài xế Phạm Văn Hùng (0905 778 990) sắp tới. Mã OTP nhận hàng của bạn là 482910." },
    { id: "N2", unread: true, time: "2 giờ trước", title: "Xe 29H-771.05 đã qua Quảng Ngãi", body: "Đơn VLX-2026-00839 dự kiến tới TP.HCM vào sáng mai." },
    { id: "N3", unread: false, time: "Hôm qua", title: "Giao thành công đơn VLX-2026-00830", body: "Đã xác nhận OTP & thu hộ COD 950.000₫ tại Hải Phòng." }
  ],
  protoFlowId: "flow-send", // flow-send | flow-transit | flow-deliver
  protoStepIndex: 0
});

let state = INITIAL_STATE();

const PROTOTYPE_FLOWS = [
  {
    id: "flow-send",
    title: "Luồng 1: Gửi hàng (Khách → Nhân viên)",
    badge: "CUSTOMER → STAFF",
    summary: "Khách tạo đơn & xem báo giá trên app, sau đó nhân viên quầy quét QR tiếp nhận hàng tại bến.",
    steps: [
      {
        title: "Khách tạo đơn gửi hàng",
        actor: "CUSTOMER",
        mode: "customer-app",
        screen: "create",
        api: "POST /api/v1/price-rules/quote (Preview)",
        desc: "Khách chọn bến đi/bến đến, nhập thông tin người nhận, cân nặng (kg), dịch vụ Tiêu chuẩn/Hỏa tốc và tiền thu hộ COD."
      },
      {
        title: "Xem báo giá & xác nhận tạo đơn",
        actor: "CUSTOMER",
        mode: "customer-app",
        screen: "quote",
        api: "POST /api/v1/orders → 201 Created",
        desc: "Hệ thống hiển thị công thức cước minh bạch (Phí cơ bản + Đơn giá/kg × Hệ số hỏa tốc + Phí COD) và sinh mã vận đơn + tem QR."
      },
      {
        title: "Nhân viên quét QR tiếp nhận tại quầy",
        actor: "STAFF",
        mode: "ops-app",
        role: "STAFF",
        screen: "receive",
        api: "PATCH /api/v1/orders/:id/receive → RECEIVED_AT_STATION",
        desc: "Nhân viên quầy cân đo thực tế, quét QR vận đơn VLX-2026-00845 (hoặc đơn vừa tạo) và in tem dán kiện hàng."
      }
    ]
  },
  {
    id: "flow-transit",
    title: "Luồng 2: Vận chuyển (Xếp xe → GPS)",
    badge: "STAFF / DRIVER",
    summary: "Tài xế nhận chuyến, quét QR kiểm đếm kiện hàng trong Manifest và cập nhật trạng thái vận chuyển kèm GPS.",
    steps: [
      {
        title: "Tài xế xem Chuyến của tôi",
        actor: "DRIVER",
        mode: "ops-app",
        role: "DRIVER",
        screen: "trips",
        api: "GET /api/v1/trips/my-trips",
        desc: "Tài xế xem chuyến CH-HN-DN-1411, biển số xe 29B-482.19, giờ xuất bến và tổng số kiện cần xếp."
      },
      {
        title: "Mở Manifest & Quét QR xếp kiện lên xe",
        actor: "DRIVER",
        mode: "ops-app",
        role: "DRIVER",
        screen: "manifest",
        api: "POST /api/v1/trips/:id/manifest/scan",
        desc: "Kiểm đếm từng kiện hàng trong bảng kê Manifest; bấm quét QR hoặc đánh dấu đã xếp lên xe."
      },
      {
        title: "Cập nhật trạng thái & phát tọa độ GPS",
        actor: "DRIVER",
        mode: "ops-app",
        role: "DRIVER",
        screen: "update-status",
        api: "PATCH /api/v1/orders/:id/status + Socket location:update",
        desc: "Chuyển trạng thái sang Đang vận chuyển / Đang giao hàng kèm tọa độ GPS để Khách theo dõi trực tiếp trên bản đồ."
      },
      {
        title: "Khách theo dõi hành trình trên bản đồ",
        actor: "CUSTOMER",
        mode: "customer-app",
        screen: "detail",
        api: "GET /api/v1/orders/:id + Socket order:status",
        desc: "Khách mở Chi tiết đơn để xem bản đồ lộ trình trực quan, vị trí GPS xe hiện tại và timeline trạng thái."
      }
    ]
  },
  {
    id: "flow-deliver",
    title: "Luồng 3: Giao hàng & Sự cố",
    badge: "DRIVER ↔ CUSTOMER",
    summary: "Tài xế xác thực OTP từ khách, chụp ảnh bằng chứng POD, xác nhận thu COD (hoặc báo sự cố nếu giao thất bại).",
    steps: [
      {
        title: "Tài xế giao hàng: OTP + Ảnh POD + Thu COD",
        actor: "DRIVER",
        mode: "ops-app",
        role: "DRIVER",
        screen: "deliver",
        api: "POST /api/v1/deliveries/:orderId/complete",
        desc: "Nhập OTP 482910 từ người nhận, chụp ảnh bàn giao POD và xác nhận đã thu đủ tiền COD."
      },
      {
        title: "Khách xác nhận nhận hàng bằng OTP",
        actor: "CUSTOMER",
        mode: "customer-app",
        screen: "otp",
        api: "POST /api/v1/orders/:id/confirm-otp",
        desc: "Khách kiểm tra kiện hàng, đối chiếu mã OTP và xác nhận đã nhận hàng thành công trên App Khách."
      },
      {
        title: "Nhánh ngoại lệ: Báo sự cố giao nhận",
        actor: "DRIVER / STAFF",
        mode: "ops-app",
        role: "DRIVER",
        screen: "incident",
        api: "POST /api/v1/incidents → DELIVERY_FAILED",
        desc: "Nếu khách không nghe máy hoặc hàng hư hỏng, tài xế/nhân viên chọn lý do, chụp ảnh & gửi báo cáo sự cố về Web Admin."
      }
    ]
  }
];

/* ==========================================================================
   Helpers
   ========================================================================== */
function formatVND(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "₫";
}

function getStation(id) {
  return STATIONS.find((s) => s.id === id) || STATIONS[0];
}

function getOrder(id) {
  return state.orders.find((o) => o.id === id) || state.orders[0];
}

function calculateQuote(draft) {
  const rule =
    PRICE_RULES.find((r) => r.from === draft.fromStation && r.to === draft.toStation) ||
    PRICE_RULES[0];
  const weight = Math.max(0.5, Number(draft.weightKg) || 1);
  const weightFee = Math.round(weight * rule.perKg);
  const subtotal = rule.baseFee + weightFee;
  const expressExtra =
    draft.serviceType === "EXPRESS" ? Math.round(subtotal * (rule.expressFactor - 1)) : 0;
  const codAmount = Number(draft.codAmount) || 0;
  const codFee = codAmount > 0 ? Math.max(rule.minCodFee, Math.round(codAmount * rule.codRate)) : 0;
  const total = subtotal + expressExtra + codFee;
  return { rule, weight, weightFee, subtotal, expressExtra, codFee, total };
}

function renderStatusBadge(statusKey) {
  const s = ORDER_STATUSES[statusKey] || ORDER_STATUSES.CREATED;
  return `<span class="status-badge ${s.cls}">${s.label}</span>`;
}

function renderQRGraphic(code, size = 86) {
  // Deterministic crisp SVG QR pattern representing a tracking barcode/QR
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 42 42" style="background:#fff;padding:4px;border-radius:8px;border:1px solid #e2e8f0">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <rect x="5.5" y="5.5" width="5" height="5" fill="#0f172a"/>
      <rect x="28" y="2" width="12" height="12" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <rect x="31.5" y="5.5" width="5" height="5" fill="#0f172a"/>
      <rect x="2" y="28" width="12" height="12" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <rect x="5.5" y="31.5" width="5" height="5" fill="#0f172a"/>
      <rect x="17" y="4" width="3" height="3" fill="#0f172a"/>
      <rect x="22" y="4" width="3" height="3" fill="#0f172a"/>
      <rect x="17" y="10" width="8" height="3" fill="#0f172a"/>
      <rect x="4" y="17" width="4" height="3" fill="#0f172a"/>
      <rect x="11" y="17" width="6" height="3" fill="#0f4c81"/>
      <rect x="20" y="17" width="5" height="5" fill="#0f4c81"/>
      <rect x="28" y="17" width="4" height="3" fill="#0f172a"/>
      <rect x="35" y="17" width="5" height="5" fill="#0f172a"/>
      <rect x="4" y="22" width="8" height="3" fill="#0f172a"/>
      <rect x="17" y="24" width="4" height="4" fill="#f97316"/>
      <rect x="24" y="24" width="6" height="3" fill="#0f172a"/>
      <rect x="33" y="25" width="7" height="4" fill="#0f172a"/>
      <rect x="17" y="31" width="5" height="3" fill="#0f172a"/>
      <rect x="25" y="31" width="4" height="7" fill="#0f172a"/>
      <rect x="32" y="33" width="8" height="6" fill="#0f4c81"/>
      <rect x="18" y="37" width="4" height="3" fill="#0f172a"/>
    </svg>
  `;
}

function renderMapGraphic(order) {
  const fromSt = getStation(order.from);
  const toSt = getStation(order.to);
  const pct = Math.min(96, Math.max(8, order.gpsProgress || 50));
  const truckX = 28 + (284 * pct) / 100;
  const truckY = pct < 50 ? 96 - pct * 0.65 : 64 + (pct - 50) * 0.45;
  return `
    <div style="border-radius:12px;overflow:hidden;border:1px solid #cbd5e1;background:#e0f2fe;position:relative">
      <svg viewBox="0 0 340 140" width="100%" style="display:block">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#bae6fd" stroke-width="0.8"/>
          </pattern>
        </defs>
        <rect width="340" height="140" fill="#f0f9ff"/>
        <rect width="340" height="140" fill="url(#grid)"/>
        <!-- Highway route -->
        <path d="M 28 96 Q 170 30 312 86" fill="none" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <path d="M 28 96 Q 170 30 312 86" fill="none" stroke="#0f4c81" stroke-width="3.5" stroke-dasharray="6 4" stroke-linecap="round"/>
        <!-- Origin -->
        <circle cx="28" cy="96" r="7" fill="#0f4c81" stroke="#fff" stroke-width="2"/>
        <text x="16" y="120" font-size="10" font-weight="700" fill="#0f172a">${fromSt.code}</text>
        <!-- Destination -->
        <circle cx="312" cy="86" r="7" fill="#15803d" stroke="#fff" stroke-width="2"/>
        <text x="292" y="112" font-size="10" font-weight="700" fill="#0f172a">${toSt.code}</text>
        <!-- Live Vehicle Marker -->
        <circle cx="${truckX}" cy="${truckY}" r="13" fill="rgba(249,115,22,0.22)"/>
        <circle cx="${truckX}" cy="${truckY}" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
        <text x="${Math.min(240, Math.max(12, truckX - 24))}" y="${Math.max(18, truckY - 14)}" font-size="9.5" font-weight="800" fill="#c2410c">${order.vehiclePlate}</text>
      </svg>
      <div style="background:#ffffff;padding:8px 10px;border-top:1px solid #e2e8f0;font-size:11px;display:flex;align-items:center;justify-content:space-between;gap:6px">
        <span style="color:#0f172a;font-weight:600">${order.gpsLabel}</span>
        <span class="badge-pill badge-pill--accent">${pct}%</span>
      </div>
    </div>
  `;
}

function showToast(message) {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span style="color:#4ade80">${ICONS.check}</span><span>${message}</span>`;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ==========================================================================
   View 1: Design System Showcase (Bộ thiết kế chung Mobile + Web Admin)
   ========================================================================== */
function renderDesignSystemView() {
  const brandSwatches = [
    { name: "Brand Primary", hex: "#0F4C81", token: "--color-brand-primary" },
    { name: "Brand Hover", hex: "#0A365C", token: "--color-brand-primary-hover" },
    { name: "Brand Secondary", hex: "#1D4ED8", token: "--color-brand-secondary" },
    { name: "Express Accent", hex: "#F97316", token: "--color-brand-accent" },
    { name: "Surface White", hex: "#FFFFFF", token: "--color-bg-surface" },
    { name: "Canvas Slate", hex: "#F1F5F9", token: "--color-bg-canvas" },
    { name: "Text Primary", hex: "#0F172A", token: "--color-text-primary" },
    { name: "Border Slate", hex: "#E2E8F0", token: "--color-border" }
  ];

  const iconEntries = [
    ["package", "Kiện hàng"],
    ["truck", "Chuyến xe"],
    ["qr", "Quét QR"],
    ["mapPin", "Bến / Điểm"],
    ["navigation", "GPS Live"],
    ["search", "Tra cứu"],
    ["plus", "Tạo đơn"],
    ["cash", "Thu COD"],
    ["camera", "Ảnh POD"],
    ["shield", "Xác thực OTP"],
    ["alert", "Sự cố"],
    ["bell", "Thông báo"],
    ["station", "Văn phòng"],
    ["user", "Tài khoản"],
    ["clock", "Lịch sử"],
    ["check", "Hoàn tất"]
  ];

  return `
    <section class="ds-hero">
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <span class="badge-pill" style="background:rgba(255,255,255,0.18);color:#fff">TV6 • Design System</span>
          <span class="badge-pill" style="background:#f97316;color:#fff">Mobile + Web Admin</span>
        </div>
        <h1>Bộ thiết kế chung VietLogix (Design Tokens & UI Kit)</h1>
        <p>Hệ thống màu sắc, typography, icon, nút bấm, ô nhập, thẻ dữ liệu, bảng quản trị và hệ thống badge trạng thái đơn hàng dùng chung cho App Mobile (TV2/TV6) và Web Admin (TV3/TV4/TV5).</p>
      </div>
      <div class="ds-hero-stats">
        <div class="ds-hero-stat"><strong>8</strong><span>Trạng thái đơn</span></div>
        <div class="ds-hero-stat"><strong>16+</strong><span>Icon nghiệp vụ</span></div>
        <div class="ds-hero-stat"><strong>18+</strong><span>Màn Mobile</span></div>
        <div class="ds-hero-stat"><strong>3</strong><span>Luồng Prototype</span></div>
      </div>
    </section>

    <div class="ds-grid">
      <!-- 1. Colors -->
      <article class="ds-card span-6">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">1. Bảng màu thương hiệu & trung tính (Color Tokens)</h2>
            <p class="ds-card-sub">Dùng chung cho cả React Native (Mobile) và Ant Design theme (Web Admin)</p>
          </div>
        </div>
        <div class="swatch-grid">
          ${brandSwatches
            .map(
              (s) => `
            <div class="swatch-item">
              <div class="swatch-color" style="background:${s.hex};border-bottom:1px solid #e2e8f0"></div>
              <div class="swatch-meta">
                <div class="swatch-name">${s.name}</div>
                <div class="swatch-hex">${s.hex}</div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </article>

      <!-- 2. Typography -->
      <article class="ds-card span-6">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">2. Hệ thống chữ (Typography Scale)</h2>
            <p class="ds-card-sub">Font chính: Inter / Plus Jakarta Sans • Monospace cho mã vận đơn & OTP</p>
          </div>
        </div>
        <div class="type-list">
          <div class="type-row">
            <span style="font-size:24px;font-weight:800;letter-spacing:-0.02em">Display 24px / Bold</span>
            <span class="mono" style="font-size:12px;color:#64748b">Hero / Tổng doanh thu COD</span>
          </div>
          <div class="type-row">
            <span style="font-size:18px;font-weight:800">Heading H1 18px / ExtraBold</span>
            <span class="mono" style="font-size:12px;color:#64748b">Tiêu đề màn hình Mobile</span>
          </div>
          <div class="type-row">
            <span style="font-size:15px;font-weight:700">Heading H2 15px / Bold</span>
            <span class="mono" style="font-size:12px;color:#64748b">Card title / Section header</span>
          </div>
          <div class="type-row">
            <span style="font-size:13px;font-weight:400">Body 13px / Regular — Theo dõi hành trình kiện hàng liên tỉnh theo thời gian thực.</span>
            <span class="mono" style="font-size:12px;color:#64748b">Nội dung chính</span>
          </div>
          <div class="type-row">
            <span class="mono" style="font-size:13px;font-weight:700;color:#0f4c81">VLX-2026-00841 • 29B-482.19 • OTP 482910</span>
            <span class="mono" style="font-size:12px;color:#64748b">Mono 13px / Tabular</span>
          </div>
        </div>
      </article>

      <!-- 3. Order Status Badges -->
      <article class="ds-card span-12">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">3. Trạng thái đơn hàng (Màu chuẩn theo vòng đời đơn)</h2>
            <p class="ds-card-sub">Đồng bộ màu badge trên App Khách, App Nhân viên/Tài xế và Web Admin</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px">
          ${Object.entries(ORDER_STATUSES)
            .map(
              ([key, val]) => `
            <div style="border:1px solid var(--color-border);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:var(--color-bg-subtle)">
              <div class="m-row-between">
                ${renderStatusBadge(key)}
                <span class="mono" style="font-size:11px;color:#64748b">${key}</span>
              </div>
              <div style="font-size:12px;color:var(--color-text-secondary)">${val.desc}</div>
            </div>`
            )
            .join("")}
        </div>
      </article>

      <!-- 4. Icons -->
      <article class="ds-card span-6">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">4. Bộ Icon nghiệp vụ (2px Stroke Vector)</h2>
            <p class="ds-card-sub">Kích thước chuẩn 18px / 20px / 24px</p>
          </div>
        </div>
        <div class="icon-grid">
          ${iconEntries
            .map(
              ([k, label]) => `
            <div class="icon-tile">
              ${ICONS[k]}
              <span>${label}</span>
            </div>`
            )
            .join("")}
        </div>
      </article>

      <!-- 5. Buttons & Inputs -->
      <article class="ds-card span-6">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">5. Nút bấm (Buttons) & Ô nhập (Inputs)</h2>
            <p class="ds-card-sub">Hỗ trợ nhiều biến thể, kích thước và trạng thái kiểm tra dữ liệu</p>
          </div>
        </div>
        <div class="btn-showcase-row">
          <button class="btn btn-primary" data-toast="Clicked Primary Button">${ICONS.plus} Tạo đơn mới</button>
          <button class="btn btn-accent" data-toast="Clicked Accent CTA">${ICONS.qr} Quét QR</button>
          <button class="btn btn-secondary">Xem chi tiết</button>
          <button class="btn btn-outline">Hủy</button>
          <button class="btn btn-success btn-sm">${ICONS.check} Hoàn tất</button>
          <button class="btn btn-danger btn-sm">${ICONS.alert} Báo sự cố</button>
          <button class="btn btn-primary" disabled>Disabled</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
          <div class="field-group">
            <label class="field-label">Mã vận đơn (Input + Icon)</label>
            <div class="input-wrap">
              <span class="input-icon-left">${ICONS.search}</span>
              <input class="input-control input-with-icon-left mono" value="VLX-2026-00841" readonly />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Trọng lượng thực tế</label>
            <div class="input-wrap">
              <input class="input-control" value="4.2" readonly />
              <span class="input-suffix">kg</span>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Số điện thoại (Validation lỗi)</label>
            <input class="input-control is-error" value="0912" readonly />
            <span class="field-error">Số điện thoại phải đủ 10 chữ số</span>
          </div>
          <div class="field-group">
            <label class="field-label">Bến nhận hàng (Select)</label>
            <select class="select-control">
              <option>Bến xe Trung Tâm (Đà Nẵng)</option>
              <option>Bến xe Miền Đông (TP.HCM)</option>
            </select>
          </div>
        </div>
      </article>

      <!-- 6. Cards & Web Admin Shared Table -->
      <article class="ds-card span-12">
        <div class="ds-card-header">
          <div>
            <h2 class="ds-card-title">6. Thẻ (Cards) & Bảng dữ liệu dùng chung Web Admin (Table Component)</h2>
            <p class="ds-card-sub">Theo hợp đồng API <code>/api/v1/orders → { items, page, total }</code></p>
          </div>
          <span class="badge-pill badge-pill--brand">Total: ${state.orders.length} items</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:16px">
          <div class="m-card" style="border-left:4px solid var(--color-brand-primary)">
            <div style="font-size:12px;color:var(--color-text-secondary)">Tổng đơn đang xử lý</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">${state.orders.length} đơn</div>
          </div>
          <div class="m-card" style="border-left:4px solid var(--color-brand-accent)">
            <div style="font-size:12px;color:var(--color-text-secondary)">Đang vận chuyển / Giao</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">${state.orders.filter((o) => o.status === "IN_TRANSIT" || o.status === "OUT_FOR_DELIVERY").length} kiện</div>
          </div>
          <div class="m-card" style="border-left:4px solid var(--color-success)">
            <div style="font-size:12px;color:var(--color-text-secondary)">Tổng COD dự kiến thu</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">${formatVND(state.orders.reduce((s, o) => s + o.codAmount, 0))}</div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="ds-table">
            <thead>
              <tr>
                <th>Mã vận đơn</th>
                <th>Tuyến bến</th>
                <th>Người nhận</th>
                <th>Cân nặng</th>
                <th>Cước phí</th>
                <th>Thu hộ (COD)</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.orders
                .map(
                  (o) => `
                <tr>
                  <td class="mono" style="font-weight:700;color:var(--color-brand-primary)">${o.id}</td>
                  <td>${getStation(o.from).code} → ${getStation(o.to).code}</td>
                  <td><strong>${o.receiver}</strong><br/><span style="font-size:11px;color:#64748b">${o.receiverPhone}</span></td>
                  <td>${o.weightKg} kg</td>
                  <td>${formatVND(o.shippingFee)}</td>
                  <td class="mono">${formatVND(o.codAmount)}</td>
                  <td>${renderStatusBadge(o.status)}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" data-open-order-customer="${o.id}">Xem trên App</button>
                  </td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  `;
}

/* ==========================================================================
   View 2: App Khách (CUSTOMER) — 10 Interactive Screens
   ========================================================================== */
const CUSTOMER_SCREENS = [
  { id: "auth", label: "Đăng nhập / Đăng ký" },
  { id: "home", label: "Trang chủ" },
  { id: "create", label: "Tạo đơn hàng" },
  { id: "quote", label: "Báo giá cước" },
  { id: "orders", label: "Danh sách đơn" },
  { id: "detail", label: "Chi tiết + Bản đồ GPS" },
  { id: "track", label: "Tra cứu mã vận đơn" },
  { id: "otp", label: "Xác nhận nhận hàng (OTP)" },
  { id: "notifications", label: "Thông báo" },
  { id: "profile", label: "Hồ sơ tài khoản" }
];

function renderCustomerPhoneContent() {
  const scr = state.customerScreen;
  const order = getOrder(state.selectedOrderId);
  const unreadCount = state.notifications.filter((n) => n.unread).length;

  let headerTitle = "VietLogix";
  let showBack = false;
  let backTarget = "home";
  const titles = {
    auth: "Đăng nhập / Đăng ký",
    home: "Xin chào, Minh Anh",
    create: "Tạo đơn gửi hàng",
    quote: "Chi tiết báo giá",
    orders: "Đơn hàng của tôi",
    detail: `Đơn ${order.id}`,
    track: "Tra cứu vận đơn",
    otp: "Xác nhận nhận hàng (OTP)",
    notifications: "Thông báo",
    profile: "Hồ sơ cá nhân"
  };
  headerTitle = titles[scr] || "VietLogix";
  if (["create", "quote", "detail", "otp", "notifications"].includes(scr)) {
    showBack = true;
    backTarget = scr === "quote" ? "create" : scr === "otp" ? "detail" : "home";
  }

  let bodyHtml = "";

  if (scr === "auth") {
    const isLogin = state.customerAuthTab === "login";
    bodyHtml = `
      <div class="m-hero-card" style="text-align:center;padding:20px 16px">
        <div style="display:inline-flex;padding:10px;border-radius:14px;background:rgba(255,255,255,0.16);margin-bottom:8px">${ICONS.package}</div>
        <h2 style="margin:0;font-size:18px;font-weight:800">VietLogix Express</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.9">Gửi hàng liên tỉnh nhanh chóng • Minh bạch cước</p>
      </div>

      <div class="role-segmented" style="margin-bottom:4px">
        <button class="role-seg-btn ${isLogin ? "active" : ""}" data-c-auth="login">Đăng nhập</button>
        <button class="role-seg-btn ${!isLogin ? "active" : ""}" data-c-auth="register">Đăng ký Khách</button>
      </div>

      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        ${
          !isLogin
            ? `<div class="field-group"><label class="field-label">Họ và tên</label><input class="input-control" value="Trần Minh Anh" /></div>`
            : ""
        }
        <div class="field-group">
          <label class="field-label">Số điện thoại / Email</label>
          <input class="input-control" value="0912 345 678" />
        </div>
        <div class="field-group">
          <label class="field-label">Mật khẩu</label>
          <input class="input-control" type="password" value="12345678" />
        </div>
        ${
          !isLogin
            ? `<div class="field-group"><label class="field-label">Địa chỉ mặc định</label><input class="input-control" value="120 Giải Phóng, Hoàng Mai, Hà Nội" /></div>`
            : ""
        }
        <button class="btn btn-primary btn-block" data-c-nav="home" data-toast="${isLogin ? "Đăng nhập thành công (CUSTOMER)" : "Đăng ký tài khoản CUSTOMER thành công"}">
          ${isLogin ? "Đăng nhập ngay" : "Tạo tài khoản Khách hàng"}
        </button>
      </div>

      <div class="m-card" style="text-align:center">
        <div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:8px">Hoặc chuyển sang giao diện nội bộ</div>
        <button class="btn btn-outline btn-sm btn-block" data-switch-mode="ops-app">Mở App Nhân viên / Tài xế</button>
      </div>
    `;
  } else if (scr === "home") {
    const activeOrder = state.orders[0];
    bodyHtml = `
      <div class="m-hero-card">
        <div class="m-row-between">
          <div>
            <div style="font-size:11px;opacity:.85">Tra cứu nhanh vận đơn</div>
            <div style="font-size:16px;font-weight:800;margin-top:2px">Gửi hàng toàn quốc 24/7</div>
          </div>
          <span class="badge-pill" style="background:rgba(255,255,255,0.2);color:#fff">CUSTOMER</span>
        </div>
        <div style="display:flex;gap:6px;margin-top:12px">
          <input id="home-quick-track" class="input-control mono" style="font-size:12px;border:none" value="${state.trackInput}" placeholder="Nhập mã VLX-..." />
          <button class="btn btn-accent btn-sm" data-quick-track="true">Tìm</button>
        </div>
      </div>

      <div class="m-quick-grid">
        <button class="m-quick-btn" data-c-nav="create">
          <span class="m-quick-icon">${ICONS.plus}</span>
          <span>Tạo đơn</span>
        </button>
        <button class="m-quick-btn" data-c-nav="quote">
          <span class="m-quick-icon" style="background:#fff7ed;color:#ea580c">${ICONS.cash}</span>
          <span>Báo giá</span>
        </button>
        <button class="m-quick-btn" data-c-nav="track">
          <span class="m-quick-icon" style="background:#e0f2fe;color:#0369a1">${ICONS.search}</span>
          <span>Tra cứu</span>
        </button>
        <button class="m-quick-btn" data-c-nav="otp">
          <span class="m-quick-icon" style="background:#dcfce7;color:#15803d">${ICONS.shield}</span>
          <span>Nhận OTP</span>
        </button>
      </div>

      <div class="m-card">
        <div class="m-row-between" style="margin-bottom:8px">
          <strong style="font-size:13px">Đơn đang hoạt động</strong>
          <button class="btn btn-ghost btn-sm" style="padding:2px 6px" data-c-nav="orders">Tất cả (${state.orders.length})</button>
        </div>
        <div style="border:1px solid var(--color-border);border-radius:11px;padding:10px;background:var(--color-bg-subtle);cursor:pointer" data-c-open-order="${activeOrder.id}">
          <div class="m-row-between">
            <span class="mono" style="font-weight:800;font-size:12px;color:var(--color-brand-primary)">${activeOrder.id}</span>
            ${renderStatusBadge(activeOrder.status)}
          </div>
          <div style="font-size:12px;font-weight:700;margin-top:6px">${getStation(activeOrder.from).code} → ${getStation(activeOrder.to).code} • ${activeOrder.receiver}</div>
          <div style="font-size:11px;color:var(--color-text-secondary);margin-top:3px">${activeOrder.gpsLabel}</div>
        </div>
      </div>

      <div class="m-card" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-color:#fed7aa">
        <div class="m-row-between">
          <div>
            <div style="font-size:12px;font-weight:800;color:#9a3412">Dịch vụ Hỏa tốc liên bến</div>
            <div style="font-size:11px;color:#c2410c;margin-top:2px">Hà Nội ↔ Đà Nẵng chỉ từ 14h • Hệ số 1.4x</div>
          </div>
          <button class="btn btn-accent btn-sm" data-c-nav="create">Gửi ngay</button>
        </div>
      </div>
    `;
  } else if (scr === "create") {
    const d = state.draftOrder;
    bodyHtml = `
      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        <div class="field-group">
          <label class="field-label">Bến gửi hàng</label>
          <select id="draft-from" class="select-control">
            ${STATIONS.map((s) => `<option value="${s.id}" ${s.id === d.fromStation ? "selected" : ""}>${s.name}</option>`).join("")}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Bến nhận hàng</label>
          <select id="draft-to" class="select-control">
            ${STATIONS.filter((s) => s.id !== d.fromStation)
              .map((s) => `<option value="${s.id}" ${s.id === d.toStation ? "selected" : ""}>${s.name}</option>`)
              .join("")}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Người nhận & SĐT</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <input id="draft-rname" class="input-control" value="${d.receiverName}" placeholder="Tên người nhận" />
            <input id="draft-rphone" class="input-control" value="${d.receiverPhone}" placeholder="Số ĐT" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Địa chỉ giao chi tiết</label>
          <input id="draft-raddr" class="input-control" value="${d.receiverAddress}" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="field-group">
            <label class="field-label">Cân nặng</label>
            <div class="input-wrap">
              <input id="draft-weight" type="number" step="0.5" min="0.5" class="input-control" value="${d.weightKg}" />
              <span class="input-suffix">kg</span>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Thu hộ COD</label>
            <div class="input-wrap">
              <input id="draft-cod" type="number" step="50000" min="0" class="input-control" value="${d.codAmount}" />
              <span class="input-suffix">₫</span>
            </div>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Gói dịch vụ</label>
          <div class="role-segmented" style="margin-bottom:0">
            <button class="role-seg-btn ${d.serviceType === "STANDARD" ? "active" : ""}" data-draft-service="STANDARD">Tiêu chuẩn (1.0x)</button>
            <button class="role-seg-btn ${d.serviceType === "EXPRESS" ? "active" : ""}" data-draft-service="EXPRESS">Hỏa tốc (1.4x)</button>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Mô tả kiện hàng</label>
          <input id="draft-desc" class="input-control" value="${d.itemDesc}" />
        </div>
        <button class="btn btn-primary btn-block" data-save-draft-to-quote="true">
          Xem báo giá cước ${ICONS.arrowRight}
        </button>
      </div>
    `;
  } else if (scr === "quote") {
    const d = state.draftOrder;
    const q = calculateQuote(d);
    bodyHtml = `
      <div class="m-card" style="background:var(--color-brand-primary-soft);border-color:#bfdbfe">
        <div style="font-size:12px;font-weight:700;color:var(--color-brand-primary)">Tuyến vận chuyển dự kiến</div>
        <div style="font-size:14px;font-weight:800;margin-top:4px">${getStation(d.fromStation).code} → ${getStation(d.toStation).code}</div>
        <div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px">Thời gian dự kiến: <strong>${q.rule.eta}</strong> • Gói: <strong>${d.serviceType === "EXPRESS" ? "Hỏa tốc" : "Tiêu chuẩn"}</strong></div>
      </div>

      <div class="m-card" style="display:flex;flex-direction:column;gap:9px;font-size:13px">
        <strong style="font-size:13px">Chi tiết công thức tính cước (Price Rule)</strong>
        <div class="m-row-between"><span>Phí cơ bản tuyến</span><span class="mono">${formatVND(q.rule.baseFee)}</span></div>
        <div class="m-row-between"><span>Cước trọng lượng (${q.weight} kg × ${formatVND(q.rule.perKg)})</span><span class="mono">${formatVND(q.weightFee)}</span></div>
        <div class="m-row-between"><span>Phụ phí hỏa tốc (${d.serviceType === "EXPRESS" ? `×${q.rule.expressFactor}` : "Không"})</span><span class="mono">${formatVND(q.expressExtra)}</span></div>
        <div class="m-row-between"><span>Phí dịch vụ thu hộ COD (${formatVND(d.codAmount)})</span><span class="mono">${formatVND(q.codFee)}</span></div>
        <hr style="border:none;border-top:1px dashed var(--color-border);margin:2px 0" />
        <div class="m-row-between" style="font-size:16px;font-weight:800;color:var(--color-brand-primary)">
          <span>Tổng cước ước tính</span>
          <span class="mono">${formatVND(q.total)}</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-accent btn-lg btn-block" data-confirm-create-order="true">
          ${ICONS.check} Xác nhận tạo đơn & sinh mã QR
        </button>
        <button class="btn btn-outline btn-block" data-c-nav="create">Chỉnh sửa thông tin đơn</button>
      </div>
    `;
  } else if (scr === "orders") {
    const filters = [
      ["ALL", "Tất cả"],
      ["CREATED", "Chờ nhận"],
      ["IN_TRANSIT", "Đang đi"],
      ["OUT_FOR_DELIVERY", "Đang giao"],
      ["DELIVERED", "Đã giao"]
    ];
    const filtered =
      state.customerFilter === "ALL"
        ? state.orders
        : state.orders.filter((o) => o.status === state.customerFilter);
    bodyHtml = `
      <div class="m-chip-row">
        ${filters
          .map(
            ([k, lbl]) => `
          <button class="m-chip ${state.customerFilter === k ? "active" : ""}" data-c-filter="${k}">${lbl}</button>`
          )
          .join("")}
      </div>
      ${filtered
        .map(
          (o) => `
        <div class="m-card" style="cursor:pointer" data-c-open-order="${o.id}">
          <div class="m-row-between">
            <span class="mono" style="font-weight:800;font-size:13px;color:var(--color-brand-primary)">${o.id}</span>
            ${renderStatusBadge(o.status)}
          </div>
          <div style="font-size:13px;font-weight:700;margin-top:6px">${getStation(o.from).code} → ${getStation(o.to).code} • ${o.receiver}</div>
          <div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px">${o.itemDesc} (${o.weightKg} kg)</div>
          <div class="m-row-between" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--color-border);font-size:12px">
            <span>Cước: <strong>${formatVND(o.shippingFee)}</strong></span>
            <span>COD: <strong style="color:var(--color-brand-accent-hover)">${formatVND(o.codAmount)}</strong></span>
          </div>
        </div>`
        )
        .join("")}
    `;
  } else if (scr === "detail") {
    bodyHtml = `
      <div class="m-card">
        <div class="m-row-between">
          <div>
            <div class="mono" style="font-size:15px;font-weight:800;color:var(--color-brand-primary)">${order.id}</div>
            <div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px">${order.itemDesc} • ${order.weightKg} kg</div>
            <div style="margin-top:6px">${renderStatusBadge(order.status)}</div>
          </div>
          ${renderQRGraphic(order.id, 72)}
        </div>
      </div>

      ${renderMapGraphic(order)}

      <div class="m-card">
        <div class="m-row-between">
          <div>
            <div style="font-size:11px;color:var(--color-text-muted)">Tài xế phụ trách • Xe ${order.vehiclePlate}</div>
            <div style="font-size:13px;font-weight:700;margin-top:2px">${order.driverName} (${order.driverPhone})</div>
          </div>
          <button class="btn btn-secondary btn-sm" data-toast="Đang gọi tài xế ${order.driverPhone}">${ICONS.phone} Gọi</button>
        </div>
        ${
          order.status === "OUT_FOR_DELIVERY"
            ? `<button class="btn btn-success btn-block" style="margin-top:10px" data-c-nav="otp">${ICONS.shield} Xác nhận nhận hàng (OTP: ${order.otp})</button>`
            : ""
        }
      </div>

      <div class="m-card">
        <strong style="font-size:13px;display:block;margin-bottom:10px">Lịch sử hành trình</strong>
        <div class="timeline">
          ${order.timeline
            .map(
              (t) => `
            <div class="timeline-item ${t.state}">
              <div class="timeline-dot"></div>
              <div>
                <div style="font-size:12px;font-weight:700">${t.title}</div>
                <div style="font-size:11px;color:var(--color-text-secondary)">${t.detail}</div>
                <div class="mono" style="font-size:10px;color:var(--color-text-muted);margin-top:2px">${t.time}</div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;
  } else if (scr === "track") {
    const found = state.orders.find((o) => o.id.toUpperCase() === state.trackInput.trim().toUpperCase());
    bodyHtml = `
      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        <label class="field-label">Nhập mã vận đơn để tra cứu</label>
        <div style="display:flex;gap:6px">
          <input id="track-page-input" class="input-control mono" value="${state.trackInput}" placeholder="VD: VLX-2026-00841" />
          <button class="btn btn-primary" data-do-track="true">Tra cứu</button>
        </div>
        <div class="m-chip-row">
          ${state.orders
            .slice(0, 3)
            .map((o) => `<button class="m-chip" data-pick-track="${o.id}">${o.id}</button>`)
            .join("")}
        </div>
      </div>
      ${
        found
          ? `<div class="m-card">
              <div class="m-row-between">
                <strong class="mono" style="color:var(--color-brand-primary)">${found.id}</strong>
                ${renderStatusBadge(found.status)}
              </div>
              <div style="font-size:13px;font-weight:700;margin-top:6px">${getStation(found.from).name} → ${getStation(found.to).name}</div>
              <div style="font-size:12px;color:var(--color-text-secondary);margin-top:4px">Vị trí hiện tại: ${found.gpsLabel}</div>
              <button class="btn btn-secondary btn-sm btn-block" style="margin-top:10px" data-c-open-order="${found.id}">Mở bản đồ & chi tiết đầy đủ</button>
            </div>`
          : `<div class="m-card" style="text-align:center;color:var(--color-danger)">Không tìm thấy mã vận đơn <strong>${state.trackInput}</strong></div>`
      }
    `;
  } else if (scr === "otp") {
    const digits = (order.otp || "482910").split("");
    bodyHtml = `
      <div class="m-card" style="text-align:center">
        <div style="display:inline-flex;padding:12px;border-radius:16px;background:var(--color-success-bg);color:var(--color-success);margin-bottom:8px">${ICONS.shield}</div>
        <h3 style="margin:0;font-size:15px;font-weight:800">Xác nhận nhận hàng bằng OTP</h3>
        <p style="margin:4px 0 0;font-size:12px;color:var(--color-text-secondary)">Đọc hoặc nhập mã 6 số để xác nhận đã nhận đủ kiện hàng <strong>${order.id}</strong></p>
      </div>
      <div class="m-card">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px">Mã OTP xác thực</div>
        <div class="otp-grid">
          ${digits.map((d) => `<input class="otp-box" maxlength="1" value="${d}" />`).join("")}
        </div>
        <div style="margin-top:12px;padding:10px;border-radius:10px;background:var(--color-bg-subtle);font-size:12px">
          <div class="m-row-between"><span>Người nhận:</span><strong>${order.receiver}</strong></div>
          <div class="m-row-between" style="margin-top:4px"><span>Tiền thu hộ COD cần thanh toán:</span><strong class="mono" style="color:var(--color-brand-accent-hover)">${formatVND(order.codAmount)}</strong></div>
        </div>
        <button class="btn btn-success btn-lg btn-block" style="margin-top:12px" data-customer-confirm-otp="${order.id}">
          ${ICONS.check} Xác nhận đã nhận hàng
        </button>
      </div>
    `;
  } else if (scr === "notifications") {
    bodyHtml = `
      <div class="m-row-between">
        <strong style="font-size:13px">Cập nhật đơn hàng (${unreadCount} chưa đọc)</strong>
        <button class="btn btn-ghost btn-sm" data-mark-all-read="true">Đọc tất cả</button>
      </div>
      ${state.notifications
        .map(
          (n) => `
        <div class="m-card" style="${n.unread ? "border-left:4px solid var(--color-brand-accent);background:#fffbeb" : ""}">
          <div class="m-row-between">
            <strong style="font-size:12.5px">${n.title}</strong>
            <span style="font-size:10px;color:var(--color-text-muted)">${n.time}</span>
          </div>
          <p style="margin:5px 0 0;font-size:12px;color:var(--color-text-secondary)">${n.body}</p>
        </div>`
        )
        .join("")}
    `;
  } else if (scr === "profile") {
    bodyHtml = `
      <div class="m-card" style="display:flex;align-items:center;gap:12px">
        <div style="width:48px;height:48px;border-radius:999px;background:var(--color-brand-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px">MA</div>
        <div>
          <div style="font-size:15px;font-weight:800">Trần Minh Anh</div>
          <div style="font-size:12px;color:var(--color-text-secondary)">0912 345 678 • Vai trò: CUSTOMER</div>
        </div>
      </div>
      <div class="m-card" style="display:flex;flex-direction:column;gap:10px;font-size:13px">
        <div class="m-row-between"><span>Địa chỉ gửi mặc định</span><strong>Hoàng Mai, Hà Nội</strong></div>
        <div class="m-row-between"><span>Tổng đơn đã gửi</span><strong>${state.orders.length} đơn</strong></div>
        <div class="m-row-between"><span>Phiên bản API</span><strong class="mono">/api/v1</strong></div>
      </div>
      <button class="btn btn-secondary btn-block" data-switch-mode="ops-app">Chuyển sang App Nhân viên / Tài xế</button>
      <button class="btn btn-outline btn-block" data-c-nav="auth">Đăng xuất</button>
    `;
  }

  const bottomTabs = [
    { id: "home", label: "Trang chủ", icon: ICONS.home },
    { id: "orders", label: "Đơn hàng", icon: ICONS.package },
    { id: "track", label: "Tra cứu", icon: ICONS.search },
    { id: "profile", label: "Tài khoản", icon: ICONS.user }
  ];

  return `
    <div class="phone-bezel">
      <div class="phone-screen">
        <div class="phone-statusbar">
          <span>16:40</span>
          <div class="phone-island"></div>
          <span>5G • 98%</span>
        </div>
        <div class="phone-app-header">
          <div style="display:flex;align-items:center;gap:8px">
            ${showBack ? `<button class="btn btn-ghost btn-sm" style="padding:4px" data-c-nav="${backTarget}">${ICONS.arrowLeft}</button>` : ""}
            <h3 class="phone-app-title">${headerTitle}</h3>
          </div>
          <button class="btn btn-ghost btn-sm" style="position:relative;padding:5px" data-c-nav="notifications" aria-label="Thông báo">
            ${ICONS.bell}
            ${unreadCount > 0 ? `<span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:99px;background:#f97316"></span>` : ""}
          </button>
        </div>
        <div class="phone-body">${bodyHtml}</div>
        ${
          scr !== "auth"
            ? `<div class="phone-tabbar">
                ${bottomTabs
                  .map(
                    (t) => `
                  <button class="phone-tab-item ${scr === t.id ? "active" : ""}" data-c-nav="${t.id}">
                    ${t.icon}
                    <span>${t.label}</span>
                  </button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderCustomerView() {
  return `
    <div class="mobile-studio">
      <aside class="panel-card">
        <h3 class="panel-title">App Khách (CUSTOMER) — 10 Màn</h3>
        <p style="font-size:12px;color:var(--color-text-secondary);margin:0 0 12px">Bấm trực tiếp trên điện thoại hoặc chọn nhanh từng màn hình bên dưới:</p>
        <div class="screen-nav-list">
          ${CUSTOMER_SCREENS.map(
            (s, i) => `
            <button class="screen-nav-btn ${state.customerScreen === s.id ? "active" : ""}" data-c-nav="${s.id}">
              <span>${s.label}</span>
              <span class="screen-nav-num">${String(i + 1).padStart(2, "0")}</span>
            </button>`
          ).join("")}
        </div>
      </aside>

      <div class="phone-stage">${renderCustomerPhoneContent()}</div>

      <aside class="panel-card inspector-panel">
        <h3 class="panel-title">Ghi chú màn hình & Hợp đồng API</h3>
        <div style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.55">
          <p style="margin-top:0"><strong>Điều hướng chuẩn TV2/TV6:</strong> Bottom Tab gồm 4 mục chính <code>Trang chủ</code>, <code>Đơn hàng</code>, <code>Tra cứu</code>, <code>Tài khoản</code>.</p>
          <p><strong>Tính năng tương tác thật:</strong> Bạn có thể vào <em>Tạo đơn → Báo giá → Xác nhận tạo đơn</em>; đơn mới sẽ xuất hiện ngay trong danh sách và đồng bộ sang App Nhân viên/Tài xế.</p>
        </div>
        <div class="api-box" style="margin-top:10px">
// Active Screen: ${state.customerScreen}<br/>
// Selected Order: ${state.selectedOrderId}<br/>
// Base: /api/v1
        </div>
      </aside>
    </div>
  `;
}

/* ==========================================================================
   View 3: App Nhân viên / Tài xế (STAFF & DRIVER)
   ========================================================================== */
const OPS_SCREENS = [
  { id: "receive", label: "Tiếp nhận hàng", role: "STAFF" },
  { id: "qr", label: "Quét mã QR", role: "STAFF / DRIVER" },
  { id: "catalog", label: "Danh mục Bến & Tuyến", role: "STAFF" },
  { id: "trips", label: "Chuyến của tôi", role: "DRIVER" },
  { id: "manifest", label: "Manifest (Bảng kê)", role: "DRIVER" },
  { id: "update-status", label: "Cập nhật trạng thái", role: "DRIVER" },
  { id: "deliver", label: "Giao hàng (OTP, Ảnh, COD)", role: "DRIVER" },
  { id: "incident", label: "Báo sự cố", role: "STAFF / DRIVER" }
];

function renderOpsPhoneContent() {
  const scr = state.opsScreen;
  const order = getOrder(state.selectedOrderId);
  const trip = state.trips.find((t) => t.id === state.selectedTripId) || state.trips[0];
  const tripOrders = state.orders.filter((o) => o.tripId === trip.id);
  const titleMap = {
    receive: "Tiếp nhận hàng tại quầy",
    qr: "Quét mã QR kiện hàng",
    catalog: "Danh mục Bến & Tuyến",
    trips: "Chuyến xe của tôi",
    manifest: `Manifest • ${trip.id}`,
    "update-status": "Cập nhật trạng thái & GPS",
    deliver: "Giao hàng (POD & COD)",
    incident: "Báo cáo sự cố"
  };

  let bodyHtml = "";

  if (scr === "receive") {
    const waitingOrders = state.orders.filter((o) => o.status === "CREATED");
    bodyHtml = `
      <div class="m-card" style="background:var(--color-brand-primary-soft);border-color:#bfdbfe">
        <div class="m-row-between">
          <div>
            <div style="font-size:11px;color:var(--color-brand-primary);font-weight:700">NHÂN VIÊN QUẦY • BẾN GIÁP BÁT</div>
            <div style="font-size:14px;font-weight:800;margin-top:2px">Đơn chờ tiếp nhận: ${waitingOrders.length}</div>
          </div>
          <button class="btn btn-accent btn-sm" data-o-nav="qr">${ICONS.qr} Quét QR</button>
        </div>
      </div>

      ${(waitingOrders.length ? waitingOrders : [state.orders[1]]).map(
        (o) => `
        <div class="m-card" style="display:flex;flex-direction:column;gap:8px">
          <div class="m-row-between">
            <span class="mono" style="font-weight:800;color:var(--color-brand-primary)">${o.id}</span>
            ${renderStatusBadge(o.status)}
          </div>
          <div style="font-size:12px">Khách gửi: <strong>${o.sender}</strong> → Nhận: <strong>${o.receiver}</strong></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="field-group">
              <label class="field-label">Cân đo thực tế</label>
              <div class="input-wrap">
                <input id="recv-weight-${o.id}" class="input-control" type="number" step="0.1" value="${o.weightKg}" />
                <span class="input-suffix">kg</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Gán chuyến</label>
              <select class="select-control">
                <option>CH-HN-DN-1411</option>
                <option>CH-HN-HCM-1410</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" style="flex:1" data-staff-receive="${o.id}">${ICONS.check} Tiếp nhận & In tem QR</button>
          </div>
        </div>`
      ).join("")}
    `;
  } else if (scr === "qr") {
    bodyHtml = `
      <div class="qr-viewfinder">
        <div class="qr-reticle">
          <div class="qr-laser"></div>
          <span style="opacity:.45">${ICONS.qr}</span>
        </div>
        <div style="font-size:11px;margin-top:12px;color:#cbd5e1">Đưa mã QR trên tem kiện hàng vào khung</div>
      </div>

      <div class="m-card">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px">Mô phỏng quét nhanh mã vận đơn</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <button class="btn btn-outline btn-sm btn-block" data-scan-qr="VLX-2026-00845">Quét mã VLX-2026-00845 (Tiếp nhận tại bến)</button>
          <button class="btn btn-outline btn-sm btn-block" data-scan-qr="VLX-2026-00841">Quét mã VLX-2026-00841 (Đang giao / Xác thực)</button>
        </div>
      </div>

      ${
        state.qrLastScanned
          ? `<div class="m-card" style="border-left:4px solid var(--color-success)">
              <div style="font-size:11px;color:var(--color-success);font-weight:700">ĐÃ QUÉT THÀNH CÔNG</div>
              <div class="mono" style="font-size:14px;font-weight:800;margin-top:2px">${state.qrLastScanned}</div>
              <div style="display:flex;gap:6px;margin-top:8px">
                <button class="btn btn-primary btn-sm" data-o-nav="receive">Tiếp nhận</button>
                <button class="btn btn-secondary btn-sm" data-o-nav="manifest">Vào Manifest</button>
                <button class="btn btn-success btn-sm" data-o-nav="deliver">Giao hàng</button>
              </div>
            </div>`
          : ""
      }
    `;
  } else if (scr === "catalog") {
    bodyHtml = `
      <div class="m-card">
        <strong style="font-size:13px">Danh sách Bến / Văn phòng (Chỉ đọc)</strong>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
          ${STATIONS.map(
            (s) => `
            <div style="padding:8px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg-subtle)">
              <div class="m-row-between">
                <strong style="font-size:12px">${s.name}</strong>
                <span class="badge-pill badge-pill--brand">${s.code}</span>
              </div>
              <div style="font-size:11px;color:var(--color-text-secondary);margin-top:3px">${s.address}</div>
            </div>`
          ).join("")}
        </div>
      </div>
    `;
  } else if (scr === "trips") {
    bodyHtml = `
      <div class="m-card" style="background:linear-gradient(135deg,#0f4c81,#0369a1);color:#fff">
        <div class="m-row-between">
          <div>
            <div style="font-size:11px;opacity:.85">TÀI XẾ • PHẠM VĂN HÙNG</div>
            <div style="font-size:15px;font-weight:800;margin-top:2px">GPS Đang phát trực tuyến</div>
          </div>
          <span class="badge-pill" style="background:#dcfce7;color:#15803d">LIVE GPS</span>
        </div>
      </div>

      ${state.trips
        .map((t) => {
          const count = state.orders.filter((o) => o.tripId === t.id).length;
          const loaded = state.orders.filter((o) => o.tripId === t.id && o.loadedOnTrip).length;
          return `
          <div class="m-card">
            <div class="m-row-between">
              <span class="mono" style="font-weight:800;color:var(--color-brand-primary)">${t.id}</span>
              <span class="badge-pill badge-pill--accent">${t.vehiclePlate}</span>
            </div>
            <div style="font-size:13px;font-weight:700;margin-top:6px">${t.routeLabel}</div>
            <div style="font-size:12px;color:var(--color-text-secondary);margin-top:3px">Xuất bến: ${t.departure} • Đã xếp: <strong>${loaded}/${count} kiện</strong></div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button class="btn btn-primary btn-sm" style="flex:1" data-open-manifest="${t.id}">Mở Manifest</button>
              <button class="btn btn-outline btn-sm" data-o-nav="update-status">Cập nhật TT</button>
            </div>
          </div>`;
        })
        .join("")}
    `;
  } else if (scr === "manifest") {
    const totalWeight = tripOrders.reduce((s, o) => s + Number(o.weightKg), 0);
    const totalCod = tripOrders.reduce((s, o) => s + Number(o.codAmount), 0);
    bodyHtml = `
      <div class="m-card">
        <div class="m-row-between">
          <div>
            <div class="mono" style="font-weight:800;color:var(--color-brand-primary)">${trip.id}</div>
            <div style="font-size:12px;color:var(--color-text-secondary)">${trip.vehiclePlate} • ${tripOrders.length} kiện • ${totalWeight.toFixed(1)} kg</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:var(--color-text-muted)">Tổng COD chuyến</div>
            <div class="mono" style="font-size:13px;font-weight:800;color:var(--color-brand-accent-hover)">${formatVND(totalCod)}</div>
          </div>
        </div>
      </div>

      ${tripOrders
        .map(
          (o) => `
        <div class="m-card">
          <div class="m-row-between">
            <span class="mono" style="font-weight:800;font-size:12.5px">${o.id}</span>
            ${renderStatusBadge(o.status)}
          </div>
          <div style="font-size:12px;margin-top:5px"><strong>${o.receiver}</strong> • ${o.weightKg} kg • COD ${formatVND(o.codAmount)}</div>
          <div class="m-row-between" style="margin-top:8px">
            <span style="font-size:11px;font-weight:700;color:${o.loadedOnTrip ? "var(--color-success)" : "var(--color-warning)"}">
              ${o.loadedOnTrip ? "✓ Đã xếp lên xe" : "○ Chưa xếp lên xe"}
            </span>
            <div style="display:flex;gap:6px">
              ${
                !o.loadedOnTrip
                  ? `<button class="btn btn-primary btn-sm" data-toggle-load="${o.id}">Quét xếp xe</button>`
                  : `<button class="btn btn-success btn-sm" data-open-deliver="${o.id}">Giao hàng</button>`
              }
            </div>
          </div>
        </div>`
        )
        .join("")}
    `;
  } else if (scr === "update-status") {
    bodyHtml = `
      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        <div class="field-group">
          <label class="field-label">Chọn kiện hàng cập nhật</label>
          <select id="ops-status-order" class="select-control mono">
            ${state.orders.map((o) => `<option value="${o.id}" ${o.id === order.id ? "selected" : ""}>${o.id} (${ORDER_STATUSES[o.status].label})</option>`).join("")}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Tọa độ GPS tự động đính kèm</label>
          <input class="input-control mono" style="font-size:11.5px" value="16.0544° N, 108.2022° E (Đà Nẵng)" readonly />
        </div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <button class="btn btn-secondary btn-block" data-set-order-status="IN_TRANSIT">Chuyển → Đang vận chuyển (IN_TRANSIT)</button>
          <button class="btn btn-accent btn-block" data-set-order-status="OUT_FOR_DELIVERY">Chuyển → Đang giao hàng (OUT_FOR_DELIVERY)</button>
          <button class="btn btn-outline btn-block" data-o-nav="incident">Chuyển → Báo sự cố (DELIVERY_FAILED)</button>
        </div>
      </div>
      ${renderMapGraphic(order)}
    `;
  } else if (scr === "deliver") {
    bodyHtml = `
      <div class="m-card">
        <div class="m-row-between">
          <strong class="mono" style="color:var(--color-brand-primary)">${order.id}</strong>
          ${renderStatusBadge(order.status)}
        </div>
        <div style="font-size:12.5px;font-weight:700;margin-top:6px">Người nhận: ${order.receiver} (${order.receiverPhone})</div>
        <div style="font-size:11.5px;color:var(--color-text-secondary);margin-top:2px">${order.address}</div>
      </div>

      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        <div class="field-group">
          <label class="field-label">1. Nhập mã OTP từ khách (Mẫu: ${order.otp})</label>
          <input id="driver-otp-input" class="input-control mono" style="font-size:16px;font-weight:800;letter-spacing:4px;text-align:center" value="${state.otpCode}" maxlength="6" />
        </div>

        <div class="field-group">
          <label class="field-label">2. Chụp ảnh bằng chứng giao hàng (POD)</label>
          ${
            state.podPhotoTaken
              ? `<div style="border:1px solid #86efac;background:#f0fdf4;border-radius:10px;padding:10px;display:flex;align-items:center;justify-content:space-between">
                  <span style="font-size:12px;font-weight:700;color:#15803d">✓ Đã chụp ảnh POD_VLX841.jpg</span>
                  <button class="btn btn-ghost btn-sm" data-take-pod="false">Chụp lại</button>
                </div>`
              : `<button class="btn btn-outline btn-block" data-take-pod="true">${ICONS.camera} Chụp ảnh kiện hàng & chữ ký</button>`
          }
        </div>

        <div class="field-group">
          <label class="field-label">3. Thu hộ COD: <strong class="mono" style="color:var(--color-brand-accent-hover)">${formatVND(order.codAmount)}</strong></label>
          <div class="role-segmented" style="margin-bottom:0">
            <button class="role-seg-btn ${state.codMethod === "CASH" ? "active" : ""}" data-cod-method="CASH">Tiền mặt</button>
            <button class="role-seg-btn ${state.codMethod === "QR" ? "active" : ""}" data-cod-method="QR">Chuyển khoản QR</button>
          </div>
        </div>

        <button class="btn btn-success btn-lg btn-block" data-driver-complete="${order.id}">
          ${ICONS.check} Hoàn tất giao hàng & Thu COD
        </button>
        <button class="btn btn-ghost btn-sm btn-block" style="color:var(--color-danger)" data-o-nav="incident">Không giao được? Báo sự cố</button>
      </div>
    `;
  } else if (scr === "incident") {
    bodyHtml = `
      <div class="m-card" style="border-left:4px solid var(--color-danger)">
        <strong style="font-size:13px;color:var(--color-danger)">Báo cáo sự cố vận chuyển / giao hàng</strong>
        <p style="margin:4px 0 0;font-size:12px;color:var(--color-text-secondary)">Thông tin sự cố sẽ gửi ngay tới Quản lý trên Web Admin và thông báo cho Khách hàng.</p>
      </div>
      <div class="m-card" style="display:flex;flex-direction:column;gap:10px">
        <div class="field-group">
          <label class="field-label">Đơn hàng / Chuyến liên quan</label>
          <input class="input-control mono" value="${order.id} • ${order.tripId}" readonly />
        </div>
        <div class="field-group">
          <label class="field-label">Loại sự cố</label>
          <select class="select-control">
            <option>Khách không nghe máy (Giao lại sau)</option>
            <option>Kiện hàng móp méo / hư hỏng</option>
            <option>Sai địa chỉ / Khách từ chối nhận</option>
            <option>Xe gặp sự cố kỹ thuật giữa đường</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Mô tả chi tiết</label>
          <textarea class="textarea-control" rows="3">Đã gọi 3 lần không liên lạc được, hẹn giao lại khung 17:00.</textarea>
        </div>
        <button class="btn btn-danger btn-block" data-submit-incident="${order.id}">
          ${ICONS.alert} Gửi báo cáo sự cố
        </button>
      </div>
    `;
  }

  const tabs =
    state.opsRole === "STAFF"
      ? [
          { id: "receive", label: "Tiếp nhận", icon: ICONS.package },
          { id: "qr", label: "Quét QR", icon: ICONS.qr },
          { id: "catalog", label: "Danh mục", icon: ICONS.station },
          { id: "incident", label: "Sự cố", icon: ICONS.alert }
        ]
      : [
          { id: "trips", label: "Chuyến của tôi", icon: ICONS.truck },
          { id: "manifest", label: "Manifest", icon: ICONS.list },
          { id: "qr", label: "Quét QR", icon: ICONS.qr },
          { id: "deliver", label: "Giao hàng", icon: ICONS.cash }
        ];

  return `
    <div class="phone-bezel">
      <div class="phone-screen">
        <div class="phone-statusbar">
          <span>16:40</span>
          <div class="phone-island"></div>
          <span>GPS ON</span>
        </div>
        <div class="phone-app-header">
          <h3 class="phone-app-title">${titleMap[scr] || "VietLogix Ops"}</h3>
          <span class="badge-pill badge-pill--brand">${state.opsRole}</span>
        </div>
        <div class="phone-body">${bodyHtml}</div>
        <div class="phone-tabbar">
          ${tabs
            .map(
              (t) => `
            <button class="phone-tab-item ${scr === t.id ? "active" : ""}" data-o-nav="${t.id}">
              ${t.icon}
              <span>${t.label}</span>
            </button>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderOpsView() {
  return `
    <div class="mobile-studio">
      <aside class="panel-card">
        <h3 class="panel-title">App Nhân viên / Tài xế</h3>
        <div class="role-segmented">
          <button class="role-seg-btn ${state.opsRole === "STAFF" ? "active" : ""}" data-ops-role="STAFF">STAFF (Quầy/Bến)</button>
          <button class="role-seg-btn ${state.opsRole === "DRIVER" ? "active" : ""}" data-ops-role="DRIVER">DRIVER (Tài xế)</button>
        </div>
        <div class="screen-nav-list">
          ${OPS_SCREENS.map(
            (s, i) => `
            <button class="screen-nav-btn ${state.opsScreen === s.id ? "active" : ""}" data-o-nav="${s.id}">
              <span>${s.label}</span>
              <span class="screen-nav-num">${s.role}</span>
            </button>`
          ).join("")}
        </div>
      </aside>

      <div class="phone-stage">${renderOpsPhoneContent()}</div>

      <aside class="panel-card inspector-panel">
        <h3 class="panel-title">Phân quyền & Luồng nghiệp vụ</h3>
        <div style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.55">
          <p style="margin-top:0"><strong>Một app chung đổi giao diện theo vai trò</strong> (đúng thiết kế TV2): Bottom menu tự động thay đổi giữa <code>STAFF</code> và <code>DRIVER</code>.</p>
          <p><strong>Kiểm thử trực tiếp:</strong> Bạn có thể quét QR tiếp nhận đơn <code>VLX-2026-00845</code>, xếp lên chuyến, cập nhật trạng thái GPS và hoàn tất giao hàng (OTP + POD + COD).</p>
        </div>
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:8px" data-switch-mode="customer-app">Kiểm tra đồng bộ sang App Khách</button>
      </aside>
    </div>
  `;
}

/* ==========================================================================
   View 4: Interactive Prototype (3 End-to-End Flows)
   ========================================================================== */
function renderPrototypeView() {
  const flow = PROTOTYPE_FLOWS.find((f) => f.id === state.protoFlowId) || PROTOTYPE_FLOWS[0];
  const step = flow.steps[state.protoStepIndex] || flow.steps[0];
  const phoneMarkup =
    step.mode === "customer-app" ? renderCustomerPhoneContent() : renderOpsPhoneContent();

  return `
    <div class="proto-layout">
      <aside class="panel-card">
        <h3 class="panel-title">Chọn luồng Prototype Demo</h3>
        <div class="flow-pill-list">
          ${PROTOTYPE_FLOWS.map(
            (f) => `
            <button class="flow-pill ${f.id === flow.id ? "active" : ""}" data-proto-flow="${f.id}">
              <div class="m-row-between">
                <strong style="font-size:13px">${f.title}</strong>
              </div>
              <div style="font-size:11.5px;color:var(--color-text-secondary);margin-top:4px">${f.summary}</div>
            </button>`
          ).join("")}
        </div>

        <h3 class="panel-title">Các bước trong luồng</h3>
        <div class="step-list">
          ${flow.steps
            .map(
              (st, idx) => `
            <button class="step-btn ${idx === state.protoStepIndex ? "active" : ""}" data-proto-step="${idx}">
              <span class="step-index">${idx + 1}</span>
              <div>
                <div style="font-size:12.5px;font-weight:700">${st.title}</div>
                <div style="font-size:11px;color:var(--color-text-secondary);margin-top:2px">Vai trò: ${st.actor}</div>
              </div>
            </button>`
            )
            .join("")}
        </div>

        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn-outline btn-sm" style="flex:1" ${state.protoStepIndex === 0 ? "disabled" : ""} data-proto-prev="true">← Bước trước</button>
          <button class="btn btn-primary btn-sm" style="flex:1" ${state.protoStepIndex >= flow.steps.length - 1 ? "disabled" : ""} data-proto-next="true">Bước tiếp →</button>
        </div>
      </aside>

      <div class="phone-stage">${phoneMarkup}</div>

      <aside class="panel-card proto-notes">
        <span class="badge-pill badge-pill--accent" style="margin-bottom:8px">Bước ${state.protoStepIndex + 1}/${flow.steps.length} • ${step.actor}</span>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:800">${step.title}</h3>
        <p style="margin:0 0 14px;font-size:13px;color:var(--color-text-secondary);line-height:1.55">${step.desc}</p>
        <div style="font-size:12px;font-weight:700;margin-bottom:6px">Endpoint liên kết (/api/v1)</div>
        <div class="api-box">${step.api}</div>

        <div style="margin-top:16px;padding:12px;border-radius:12px;background:var(--color-bg-subtle);border:1px solid var(--color-border)">
          <div style="font-size:12px;font-weight:700;margin-bottom:6px">Trạng thái đơn đang demo</div>
          <div class="m-row-between">
            <span class="mono" style="font-weight:800;font-size:12px">${state.selectedOrderId}</span>
            ${renderStatusBadge(getOrder(state.selectedOrderId).status)}
          </div>
        </div>
      </aside>
    </div>
  `;
}

/* ==========================================================================
   Main Render & Event Handling
   ========================================================================== */
function syncProtoStepToScreen() {
  const flow = PROTOTYPE_FLOWS.find((f) => f.id === state.protoFlowId) || PROTOTYPE_FLOWS[0];
  const step = flow.steps[state.protoStepIndex] || flow.steps[0];
  if (step.mode === "customer-app") {
    state.customerScreen = step.screen;
  } else {
    state.opsRole = step.role || "DRIVER";
    state.opsScreen = step.screen;
  }
}

function render() {
  document.querySelectorAll(".mode-tab").forEach((btn) => {
    const active = btn.dataset.mode === state.workspaceMode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  const main = document.getElementById("workspace-main");
  if (!main) return;
  if (state.workspaceMode === "design-system") main.innerHTML = renderDesignSystemView();
  else if (state.workspaceMode === "customer-app") main.innerHTML = renderCustomerView();
  else if (state.workspaceMode === "ops-app") main.innerHTML = renderOpsView();
  else main.innerHTML = renderPrototypeView();
}

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-mode], [data-switch-mode], [data-c-nav], [data-c-auth], [data-c-filter], [data-c-open-order], [data-open-order-customer], [data-save-draft-to-quote], [data-draft-service], [data-confirm-create-order], [data-quick-track], [data-do-track], [data-pick-track], [data-customer-confirm-otp], [data-mark-all-read], [data-ops-role], [data-o-nav], [data-staff-receive], [data-scan-qr], [data-open-manifest], [data-toggle-load], [data-open-deliver], [data-set-order-status], [data-take-pod], [data-cod-method], [data-driver-complete], [data-submit-incident], [data-proto-flow], [data-proto-step], [data-proto-prev], [data-proto-next], [data-toast], #btn-reset-demo");
  if (!target) return;

  if (target.id === "btn-reset-demo") {
    state = INITIAL_STATE();
    showToast("Đã khôi phục dữ liệu mẫu ban đầu");
    render();
    return;
  }

  if (target.dataset.toast && !target.dataset.cNav) {
    showToast(target.dataset.toast);
  }

  if (target.dataset.mode) {
    state.workspaceMode = target.dataset.mode;
    if (state.workspaceMode === "prototype") syncProtoStepToScreen();
    render();
    return;
  }

  if (target.dataset.switchMode) {
    state.workspaceMode = target.dataset.switchMode;
    render();
    return;
  }

  if (target.dataset.cNav) {
    state.customerScreen = target.dataset.cNav;
    if (target.dataset.toast) showToast(target.dataset.toast);
    render();
    return;
  }

  if (target.dataset.cAuth) {
    state.customerAuthTab = target.dataset.cAuth;
    render();
    return;
  }

  if (target.dataset.cFilter) {
    state.customerFilter = target.dataset.cFilter;
    render();
    return;
  }

  if (target.dataset.cOpenOrder) {
    state.selectedOrderId = target.dataset.cOpenOrder;
    state.customerScreen = "detail";
    render();
    return;
  }

  if (target.dataset.openOrderCustomer) {
    state.selectedOrderId = target.dataset.openOrderCustomer;
    state.workspaceMode = "customer-app";
    state.customerScreen = "detail";
    render();
    return;
  }

  if (target.dataset.draftService) {
    state.draftOrder.serviceType = target.dataset.draftService;
    render();
    return;
  }

  if (target.dataset.saveDraftToQuote) {
    const fromEl = document.getElementById("draft-from");
    const toEl = document.getElementById("draft-to");
    const rnameEl = document.getElementById("draft-rname");
    const rphoneEl = document.getElementById("draft-rphone");
    const raddrEl = document.getElementById("draft-raddr");
    const wEl = document.getElementById("draft-weight");
    const codEl = document.getElementById("draft-cod");
    const descEl = document.getElementById("draft-desc");
    if (fromEl) state.draftOrder.fromStation = fromEl.value;
    if (toEl) state.draftOrder.toStation = toEl.value;
    if (rnameEl) state.draftOrder.receiverName = rnameEl.value;
    if (rphoneEl) state.draftOrder.receiverPhone = rphoneEl.value;
    if (raddrEl) state.draftOrder.receiverAddress = raddrEl.value;
    if (wEl) state.draftOrder.weightKg = Number(wEl.value) || 1;
    if (codEl) state.draftOrder.codAmount = Number(codEl.value) || 0;
    if (descEl) state.draftOrder.itemDesc = descEl.value;
    state.customerScreen = "quote";
    render();
    return;
  }

  if (target.dataset.confirmCreateOrder) {
    const d = state.draftOrder;
    const q = calculateQuote(d);
    const newId = `VLX-2026-00${846 + state.orders.length}`;
    const newOrder = {
      id: newId,
      from: d.fromStation,
      to: d.toStation,
      sender: d.senderName,
      receiver: d.receiverName,
      receiverPhone: d.receiverPhone,
      address: d.receiverAddress,
      itemDesc: d.itemDesc,
      weightKg: q.weight,
      serviceType: d.serviceType,
      shippingFee: q.total,
      codAmount: Number(d.codAmount) || 0,
      status: "CREATED",
      tripId: "CH-HN-DN-1411",
      driverName: "Phạm Văn Hùng",
      driverPhone: "0905 778 990",
      vehiclePlate: "29B-482.19",
      gpsLabel: `${getStation(d.fromStation).name} (Chờ tiếp nhận)`,
      gpsProgress: 5,
      otp: "638291",
      loadedOnTrip: false,
      timeline: [
        { time: "Vừa xong", title: "Khách tạo đơn trên App", detail: `Tổng cước ${formatVND(q.total)} • Mã QR đã sẵn sàng`, state: "current" }
      ]
    };
    state.orders.unshift(newOrder);
    state.selectedOrderId = newId;
    state.customerScreen = "detail";
    showToast(`Đã tạo đơn ${newId} thành công`);
    render();
    return;
  }

  if (target.dataset.quickTrack) {
    const inp = document.getElementById("home-quick-track");
    if (inp) state.trackInput = inp.value;
    state.customerScreen = "track";
    render();
    return;
  }

  if (target.dataset.doTrack) {
    const inp = document.getElementById("track-page-input");
    if (inp) state.trackInput = inp.value;
    render();
    return;
  }

  if (target.dataset.pickTrack) {
    state.trackInput = target.dataset.pickTrack;
    render();
    return;
  }

  if (target.dataset.customerConfirmOtp) {
    const o = getOrder(target.dataset.customerConfirmOtp);
    o.status = "DELIVERED";
    o.gpsProgress = 100;
    o.timeline.unshift({
      time: "Vừa xong",
      title: "Khách xác nhận đã nhận hàng (OTP)",
      detail: `Xác thực thành công mã OTP ${o.otp}`,
      state: "done"
    });
    showToast(`Đã xác nhận nhận đơn ${o.id}`);
    state.customerScreen = "detail";
    render();
    return;
  }

  if (target.dataset.markAllRead) {
    state.notifications.forEach((n) => (n.unread = false));
    showToast("Đã đánh dấu tất cả thông báo đã đọc");
    render();
    return;
  }

  if (target.dataset.opsRole) {
    state.opsRole = target.dataset.opsRole;
    state.opsScreen = state.opsRole === "STAFF" ? "receive" : "trips";
    render();
    return;
  }

  if (target.dataset.oNav) {
    state.opsScreen = target.dataset.oNav;
    render();
    return;
  }

  if (target.dataset.staffReceive) {
    const o = getOrder(target.dataset.staffReceive);
    const wEl = document.getElementById(`recv-weight-${o.id}`);
    if (wEl) o.weightKg = Number(wEl.value) || o.weightKg;
    o.status = "RECEIVED_AT_STATION";
    o.gpsProgress = 18;
    o.timeline.unshift({
      time: "Vừa xong",
      title: "Đã tiếp nhận tại bến & In tem QR",
      detail: `NV quầy xác nhận trọng lượng ${o.weightKg} kg`,
      state: "current"
    });
    state.selectedOrderId = o.id;
    showToast(`Đã tiếp nhận đơn ${o.id} tại bến`);
    render();
    return;
  }

  if (target.dataset.scanQr) {
    state.qrLastScanned = target.dataset.scanQr;
    state.selectedOrderId = target.dataset.scanQr;
    showToast(`Quét thành công QR: ${target.dataset.scanQr}`);
    render();
    return;
  }

  if (target.dataset.openManifest) {
    state.selectedTripId = target.dataset.openManifest;
    state.opsScreen = "manifest";
    render();
    return;
  }

  if (target.dataset.toggleLoad) {
    const o = getOrder(target.dataset.toggleLoad);
    o.loadedOnTrip = true;
    o.status = "IN_TRANSIT";
    o.gpsProgress = 45;
    o.timeline.unshift({
      time: "Vừa xong",
      title: `Đã xếp lên chuyến ${o.tripId}`,
      detail: `Xe ${o.vehiclePlate} bắt đầu vận chuyển`,
      state: "current"
    });
    showToast(`Đã xếp kiện ${o.id} lên xe`);
    render();
    return;
  }

  if (target.dataset.openDeliver) {
    state.selectedOrderId = target.dataset.openDeliver;
    state.otpCode = getOrder(target.dataset.openDeliver).otp;
    state.opsScreen = "deliver";
    render();
    return;
  }

  if (target.dataset.setOrderStatus) {
    const sel = document.getElementById("ops-status-order");
    const oid = sel ? sel.value : state.selectedOrderId;
    const o = getOrder(oid);
    const nextStatus = target.dataset.setOrderStatus;
    o.status = nextStatus;
    o.gpsProgress = nextStatus === "IN_TRANSIT" ? 65 : 90;
    o.timeline.unshift({
      time: "Vừa xong",
      title: `Cập nhật: ${ORDER_STATUSES[nextStatus].label}`,
      detail: "Đồng bộ tọa độ GPS realtime",
      state: "current"
    });
    state.selectedOrderId = o.id;
    showToast(`Đã cập nhật ${o.id} → ${ORDER_STATUSES[nextStatus].label}`);
    render();
    return;
  }

  if (target.dataset.takePod) {
    state.podPhotoTaken = target.dataset.takePod === "true";
    if (state.podPhotoTaken) showToast("Đã chụp ảnh bằng chứng POD");
    render();
    return;
  }

  if (target.dataset.codMethod) {
    state.codMethod = target.dataset.codMethod;
    render();
    return;
  }

  if (target.dataset.driverComplete) {
    const o = getOrder(target.dataset.driverComplete);
    const otpEl = document.getElementById("driver-otp-input");
    const entered = otpEl ? otpEl.value.trim() : state.otpCode;
    if (entered !== o.otp) {
      showToast(`Sai mã OTP (mã đúng là ${o.otp})`);
      return;
    }
    o.status = "DELIVERED";
    o.gpsProgress = 100;
    o.timeline.unshift({
      time: "Vừa xong",
      title: `Giao thành công • Thu COD ${formatVND(o.codAmount)} (${state.codMethod})`,
      detail: `Xác thực OTP ${entered} + Ảnh POD`,
      state: "done"
    });
    state.notifications.unshift({
      id: `N-${Date.now()}`,
      unread: true,
      time: "Vừa xong",
      title: `Đơn ${o.id} đã giao thành công!`,
      body: `Tài xế đã hoàn tất giao hàng & thu COD ${formatVND(o.codAmount)}.`
    });
    showToast(`Hoàn tất giao đơn ${o.id} thành công!`);
    render();
    return;
  }

  if (target.dataset.submitIncident) {
    const o = getOrder(target.dataset.submitIncident);
    o.status = "DELIVERY_FAILED";
    o.timeline.unshift({
      time: "Vừa xong",
      title: "Đã ghi nhận sự cố giao hàng",
      detail: "Đã gửi báo cáo & ảnh hiện trường tới Web Admin",
      state: "current"
    });
    showToast(`Đã gửi báo cáo sự cố cho đơn ${o.id}`);
    render();
    return;
  }

  if (target.dataset.protoFlow) {
    state.protoFlowId = target.dataset.protoFlow;
    state.protoStepIndex = 0;
    syncProtoStepToScreen();
    render();
    return;
  }

  if (target.dataset.protoStep !== undefined) {
    state.protoStepIndex = Number(target.dataset.protoStep) || 0;
    syncProtoStepToScreen();
    render();
    return;
  }

  if (target.dataset.protoPrev) {
    state.protoStepIndex = Math.max(0, state.protoStepIndex - 1);
    syncProtoStepToScreen();
    render();
    return;
  }

  if (target.dataset.protoNext) {
    const flow = PROTOTYPE_FLOWS.find((f) => f.id === state.protoFlowId) || PROTOTYPE_FLOWS[0];
    state.protoStepIndex = Math.min(flow.steps.length - 1, state.protoStepIndex + 1);
    syncProtoStepToScreen();
    render();
    return;
  }
});

render();
