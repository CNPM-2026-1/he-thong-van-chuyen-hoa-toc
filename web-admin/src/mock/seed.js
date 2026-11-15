// Dữ liệu giả, khớp với ví dụ trong docs/api-contract.md
export const seed = {
  stations: [
    { id: 1, code: 'HN01', name: 'Bến Mỹ Đình', type: 'STATION', address: '20 Phạm Hùng, Nam Từ Liêm', province: 'Hà Nội', phone: '0243111222', status: 'ACTIVE' },
    { id: 2, code: 'TQ01', name: 'Văn phòng Tuyên Quang', type: 'OFFICE', address: '12 Quang Trung, TP Tuyên Quang', province: 'Tuyên Quang', phone: '0207333444', status: 'ACTIVE' },
    { id: 3, code: 'HP01', name: 'Bến Niệm Nghĩa', type: 'STATION', address: '1 Tôn Đức Thắng, Lê Chân', province: 'Hải Phòng', phone: '0225555666', status: 'ACTIVE' },
    { id: 4, code: 'DN01', name: 'Văn phòng Đà Nẵng', type: 'OFFICE', address: '88 Nguyễn Văn Linh, Hải Châu', province: 'Đà Nẵng', phone: '0236777888', status: 'INACTIVE' },
    { id: 5, code: 'HCM01', name: 'Bến Miền Đông mới', type: 'STATION', address: 'Xa lộ Hà Nội, Thủ Đức', province: 'TP. Hồ Chí Minh', phone: '0283999000', status: 'ACTIVE' },
  ],
  routes: [
    { id: 1, code: 'HN-TQ', originStationId: 1, destinationStationId: 2, distanceKm: 165, estimatedHours: 3.5, status: 'ACTIVE' },
    { id: 2, code: 'HN-HP', originStationId: 1, destinationStationId: 3, distanceKm: 120, estimatedHours: 2.5, status: 'ACTIVE' },
    { id: 3, code: 'HN-HCM', originStationId: 1, destinationStationId: 5, distanceKm: 1700, estimatedHours: 32, status: 'ACTIVE' },
  ],
  vehicles: [
    { id: 1, plateNumber: '22C-123.45', type: 'TRUCK', capacityKg: 5000, status: 'ACTIVE' },
    { id: 2, plateNumber: '29H-678.90', type: 'VAN', capacityKg: 1500, status: 'ACTIVE' },
    { id: 3, plateNumber: '15C-246.80', type: 'TRUCK', capacityKg: 8000, status: 'MAINTENANCE' },
  ],
  drivers: [
    { id: 1, fullName: 'Nguyễn Văn An', phone: '0912345678', licenseNumber: '010123456789', licenseClass: 'C', defaultVehicleId: 1, status: 'ACTIVE' },
    { id: 2, fullName: 'Trần Quốc Bảo', phone: '0987654321', licenseNumber: '010987654321', licenseClass: 'B2', defaultVehicleId: 2, status: 'ACTIVE' },
    { id: 3, fullName: 'Lê Minh Cường', phone: '0933222111', licenseNumber: '020555666777', licenseClass: 'FC', defaultVehicleId: null, status: 'INACTIVE' },
  ],
  'price-rules': [
    { id: 1, routeId: 1, baseFee: 20000, pricePerKg: 3500, expressMultiplier: 1.5, codFee: 10000, status: 'ACTIVE' },
    { id: 2, routeId: 2, baseFee: 18000, pricePerKg: 3000, expressMultiplier: 1.5, codFee: 10000, status: 'ACTIVE' },
  ],
};
