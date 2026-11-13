/**
 * Dữ liệu mẫu Sprint 1. Chạy: npm run db:seed (chạy lại nhiều lần vẫn an toàn - dùng upsert).
 * ID của các bản ghi chính trùng với ví dụ trong docs/api-contract.md để app/web chuyển
 * từ dữ liệu giả sang API thật không bị lệch.
 * Mật khẩu chung cho mọi tài khoản mẫu: Password123!
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';

const USERS: { id: string; fullName: string; email: string; phone: string; role: Role }[] = [
  { id: '11111111-1111-4111-8111-111111111111', fullName: 'Nguyen Van A', email: 'customer@example.com', phone: '0900000001', role: 'CUSTOMER' },
  { id: '12121212-1212-4121-8121-121212121212', fullName: 'Tran Thi B', email: 'staff@example.com', phone: '0900000002', role: 'STAFF' },
  { id: '77777777-7777-4777-8777-777777777777', fullName: 'Le Van C', email: 'driver@example.com', phone: '0900000003', role: 'DRIVER' },
  { id: '13131313-1313-4131-8131-131313131313', fullName: 'Pham Van D', email: 'manager@example.com', phone: '0900000004', role: 'MANAGER' },
  { id: '14141414-1414-4141-8141-141414141414', fullName: 'Quan Tri Vien', email: 'admin@example.com', phone: '0900000005', role: 'ADMIN' },
  { id: '15151515-1515-4151-8151-151515151515', fullName: 'Hoang Van E', email: 'driver2@example.com', phone: '0900000006', role: 'DRIVER' },
];

const STATIONS = [
  { id: '22222222-2222-4222-8222-222222222222', code: 'HN-01', name: 'Ben xe Ha Noi', type: 'BUS_STATION', address: 'Ben xe My Dinh, Ha Noi', province: 'Ha Noi', latitude: 21.0285, longitude: 105.8542, phone: '02430000000' },
  { id: '44444444-4444-4444-8444-444444444444', code: 'HCM-01', name: 'Ben xe Mien Dong', type: 'BUS_STATION', address: '292 Dinh Bo Linh, Binh Thanh, TP Ho Chi Minh', province: 'TP Ho Chi Minh', latitude: 10.8142, longitude: 106.7106, phone: '02830000000' },
  { id: '23232323-2323-4232-8232-232323232323', code: 'HP-01', name: 'Ben xe Lac Long', type: 'BUS_STATION', address: '2 Cu Chinh Lan, Hong Bang, Hai Phong', province: 'Hai Phong', latitude: 20.8616, longitude: 106.6825, phone: '02253000000' },
  { id: '24242424-2424-4242-8242-242424242424', code: 'DN-01', name: 'Ben xe Trung tam Da Nang', type: 'BUS_STATION', address: 'Ton Duc Thang, Lien Chieu, Da Nang', province: 'Da Nang', latitude: 16.0544, longitude: 108.1717, phone: '02363000000' },
  { id: '25252525-2525-4252-8252-252525252525', code: 'HN-KHO', name: 'Kho trung chuyen Ha Noi', type: 'WAREHOUSE', address: 'KCN Quang Minh, Me Linh, Ha Noi', province: 'Ha Noi', latitude: 21.1872, longitude: 105.7703 },
  { id: '26262626-2626-4262-8262-262626262626', code: 'HN-VP', name: 'Van phong Cau Giay', type: 'OFFICE', address: '144 Xuan Thuy, Cau Giay, Ha Noi', province: 'Ha Noi', latitude: 21.0368, longitude: 105.7826, phone: '02437000000' },
] as const;

const ROUTES = [
  { id: '33333333-3333-4333-8333-333333333333', code: 'HN-HCM', name: 'Ha Noi - TP Ho Chi Minh', originStationId: '22222222-2222-4222-8222-222222222222', destinationStationId: '44444444-4444-4444-8444-444444444444', distanceKm: 1700, estimatedDurationMinutes: 1800 },
  { id: '34343434-3434-4343-8343-343434343434', code: 'HN-HP', name: 'Ha Noi - Hai Phong', originStationId: '22222222-2222-4222-8222-222222222222', destinationStationId: '23232323-2323-4232-8232-232323232323', distanceKm: 120, estimatedDurationMinutes: 150 },
  { id: '35353535-3535-4353-8353-353535353535', code: 'HN-DN', name: 'Ha Noi - Da Nang', originStationId: '22222222-2222-4222-8222-222222222222', destinationStationId: '24242424-2424-4242-8242-242424242424', distanceKm: 770, estimatedDurationMinutes: 840 },
  { id: '36363636-3636-4363-8363-363636363636', code: 'DN-HCM', name: 'Da Nang - TP Ho Chi Minh', originStationId: '24242424-2424-4242-8242-242424242424', destinationStationId: '44444444-4444-4444-8444-444444444444', distanceKm: 960, estimatedDurationMinutes: 1020 },
];

const VEHICLES = [
  { id: '55555555-5555-4555-8555-555555555555', plateNumber: '29H-12345', vehicleType: 'TRUCK', capacityKg: 5000, capacityVolumeM3: 25 },
  { id: '56565656-5656-4565-8565-565656565656', plateNumber: '29B-678.90', vehicleType: 'BUS', capacityKg: 1500, capacityVolumeM3: 8 },
  { id: '57575757-5757-4575-8575-575757575757', plateNumber: '30F-246.80', vehicleType: 'VAN', capacityKg: 900, capacityVolumeM3: 5 },
] as const;

const DRIVERS = [
  { id: '66666666-6666-4666-8666-666666666666', userId: '77777777-7777-4777-8777-777777777777', licenseNumber: 'B2-123456', defaultVehicleId: '55555555-5555-4555-8555-555555555555' },
  { id: '67676767-6767-4676-8676-676767676767', userId: '15151515-1515-4151-8151-151515151515', licenseNumber: 'C-654321', defaultVehicleId: '56565656-5656-4565-8565-565656565656' },
];

const PRICE_RULES = [
  { id: '88888888-8888-4888-8888-888888888888', routeId: '33333333-3333-4333-8333-333333333333', baseFeeVnd: 30000, pricePerKgVnd: 12000, expressMultiplier: 1.5, codFeeVnd: 10000, effectiveFrom: new Date('2026-11-01T00:00:00Z'), effectiveTo: new Date('2026-12-01T00:00:00Z') },
  { id: '89898989-8989-4898-8898-898989898989', routeId: '34343434-3434-4343-8343-343434343434', baseFeeVnd: 20000, pricePerKgVnd: 5000, expressMultiplier: 1.3, codFeeVnd: 8000, effectiveFrom: new Date('2026-11-01T00:00:00Z'), effectiveTo: null },
  { id: '8a8a8a8a-8a8a-48a8-88a8-8a8a8a8a8a8a', routeId: '35353535-3535-4353-8353-353535353535', baseFeeVnd: 25000, pricePerKgVnd: 9000, expressMultiplier: 1.5, codFeeVnd: 10000, effectiveFrom: new Date('2026-11-01T00:00:00Z'), effectiveTo: null },
  { id: '8b8b8b8b-8b8b-48b8-88b8-8b8b8b8b8b8b', routeId: '36363636-3636-4363-8363-363636363636', baseFeeVnd: 25000, pricePerKgVnd: 10000, expressMultiplier: 1.5, codFeeVnd: 10000, effectiveFrom: new Date('2026-11-01T00:00:00Z'), effectiveTo: null },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  for (const u of USERS) {
    await prisma.user.upsert({ where: { id: u.id }, update: { ...u, status: 'ACTIVE', deletedAt: null }, create: { ...u, passwordHash } });
  }
  for (const s of STATIONS) await prisma.station.upsert({ where: { id: s.id }, update: s, create: s });
  for (const r of ROUTES) await prisma.route.upsert({ where: { id: r.id }, update: r, create: r });
  for (const v of VEHICLES) await prisma.vehicle.upsert({ where: { id: v.id }, update: v, create: v });
  for (const d of DRIVERS) await prisma.driver.upsert({ where: { id: d.id }, update: d, create: d });
  for (const p of PRICE_RULES) await prisma.priceRule.upsert({ where: { id: p.id }, update: p, create: p });

  console.log('Seed xong. Tài khoản mẫu (mật khẩu: %s):', PASSWORD);
  console.table(USERS.map(({ email, phone, role }) => ({ role, email, phone })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
