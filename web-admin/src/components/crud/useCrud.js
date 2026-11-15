import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { crudApi } from '../../services/crudApi';

// Quản lý danh sách + phân trang + tìm kiếm + thêm/sửa/xóa cho một resource
export function useCrud(resource, { pageSize = 10 } = {}) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ page: 1, pageSize, q: '' });
  const reqId = useRef(0); // bỏ qua kết quả của request cũ khi người dùng gõ nhanh

  const reload = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const res = await crudApi.list(resource, query);
      if (id !== reqId.current) return;
      setData({ items: res.items ?? [], total: res.total ?? 0 });
    } catch (e) {
      if (id === reqId.current) message.error(e.message || 'Không tải được dữ liệu');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [resource, query]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setPage = useCallback(
    (page, size) => setQuery((s) => ({ ...s, page, pageSize: size ?? s.pageSize })),
    [],
  );
  const setKeyword = useCallback((q) => setQuery((s) => ({ ...s, q, page: 1 })), []);

  // Ném lỗi lên để form giữ nguyên và hiện thông báo
  const save = async (id, values) => {
    if (id) await crudApi.update(resource, id, values);
    else await crudApi.create(resource, values);
    message.success(id ? 'Đã lưu thay đổi' : 'Đã thêm mới');
    await reload();
  };

  const remove = async (id) => {
    try {
      await crudApi.remove(resource, id);
      message.success('Đã xóa');
      // Xóa mục cuối của trang thì lùi về trang trước
      if (data.items.length === 1 && query.page > 1) setPage(query.page - 1);
      else await reload();
    } catch (e) {
      message.error(e.message || 'Không xóa được');
    }
  };

  return { ...data, loading, query, setPage, setKeyword, save, remove, reload };
}
