// Lớp gọi API cho các trang danh mục (TV4).
// Dùng axios instance của TV3 (src/api.js): đã tự gắn token và lấy baseURL từ VITE_API_BASE_URL.
// Cùng quy ước với TV3: chỉ dùng dữ liệu giả khi VITE_USE_MOCK=true.
import api from '../api';
import { mockApi } from '../mock/mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Lỗi theo hợp đồng chung: { code, message }
async function call(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (e) {
    const data = e.response?.data;
    throw Object.assign(new Error(data?.message || e.message || 'Có lỗi xảy ra'), { code: data?.code });
  }
}

const real = {
  list: (resource, { page, pageSize, q }) =>
    call(api.get(`/${resource}`, { params: { page, pageSize, q: q || undefined } })),
  create: (resource, values) => call(api.post(`/${resource}`, values)),
  update: (resource, id, values) => call(api.patch(`/${resource}/${id}`, values)),
  remove: (resource, id) => call(api.delete(`/${resource}/${id}`)),
};

export const crudApi = USE_MOCK ? mockApi : real;
