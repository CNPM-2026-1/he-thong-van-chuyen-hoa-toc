// API giả lập trong bộ nhớ: cùng giao diện với crudApi thật, trả về { items, page, total }
import { seed } from './seed';

const db = structuredClone(seed);
let nextId = 1000;
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Trường không được trùng (giống ràng buộc unique ở backend)
const UNIQUE = {
  stations: { field: 'code', message: 'Mã bến đã tồn tại' },
  routes: { field: 'code', message: 'Mã tuyến đã tồn tại' },
  vehicles: { field: 'plateNumber', message: 'Biển số đã tồn tại' },
  drivers: { field: 'licenseNumber', message: 'Số GPLX đã tồn tại' },
  'price-rules': { field: 'routeId', message: 'Tuyến này đã có bảng giá' },
};

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const live = (resource) => db[resource].filter((r) => !r.deletedAt);
const brief = (list, id, fields) => {
  const row = list.find((r) => r.id === id);
  return row ? Object.fromEntries(fields.map((f) => [f, row[f]])) : null;
};

// Ghép thêm thông tin liên kết như backend sẽ trả về
function decorate(resource, row) {
  switch (resource) {
    case 'routes':
      return {
        ...row,
        originStation: brief(db.stations, row.originStationId, ['id', 'name']),
        destinationStation: brief(db.stations, row.destinationStationId, ['id', 'name']),
      };
    case 'drivers':
      return { ...row, defaultVehicle: brief(db.vehicles, row.defaultVehicleId, ['id', 'plateNumber']) };
    case 'price-rules':
      return { ...row, route: brief(db.routes, row.routeId, ['id', 'code']) };
    default:
      return row;
  }
}

function assertUnique(resource, values, selfId) {
  const rule = UNIQUE[resource];
  if (!rule) return;
  const dup = live(resource).some((r) => r.id !== selfId && norm(r[rule.field]) === norm(values[rule.field]));
  if (dup) throw Object.assign(new Error(rule.message), { code: 'DUPLICATE' });
}

export const mockApi = {
  async list(resource, { page = 1, pageSize = 10, q = '' } = {}) {
    await wait();
    const keyword = norm(q).trim();
    const rows = live(resource)
      .map((r) => decorate(resource, r))
      .filter((r) => !keyword || norm(JSON.stringify(Object.values(r))).includes(keyword));
    const start = (page - 1) * pageSize;
    return { items: rows.slice(start, start + pageSize), page, total: rows.length };
  },

  async create(resource, values) {
    await wait();
    assertUnique(resource, values);
    const row = { id: nextId++, ...values };
    db[resource].push(row);
    return decorate(resource, row);
  },

  async update(resource, id, values) {
    await wait();
    const row = live(resource).find((r) => r.id === id);
    if (!row) throw Object.assign(new Error('Không tìm thấy bản ghi'), { code: 'NOT_FOUND' });
    assertUnique(resource, { ...row, ...values }, id);
    Object.assign(row, values);
    return decorate(resource, row);
  },

  // Xóa mềm
  async remove(resource, id) {
    await wait();
    const row = live(resource).find((r) => r.id === id);
    if (!row) throw Object.assign(new Error('Không tìm thấy bản ghi'), { code: 'NOT_FOUND' });
    row.deletedAt = new Date().toISOString();
    return null;
  },
};
