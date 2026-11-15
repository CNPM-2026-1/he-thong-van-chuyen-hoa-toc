import { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { crudApi } from '../../services/crudApi';

// Ô chọn nạp danh sách từ một resource (ví dụ chọn bến đi từ /stations).
// Chỉ lấy tối đa 100 mục đầu; nếu danh mục lớn hơn thì chuyển sang tìm kiếm phía server.
export default function RemoteSelect({ resource, getLabel, placeholder, ...rest }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    crudApi
      .list(resource, { page: 1, pageSize: 100 })
      .then((res) => alive && setOptions(res.items.map((i) => ({ value: i.id, label: getLabel(i) }))))
      .catch((e) => message.error(e.message || 'Không tải được danh sách'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return (
    <Select
      showSearch
      optionFilterProp="label"
      loading={loading}
      options={options}
      placeholder={placeholder || 'Chọn...'}
      {...rest}
    />
  );
}
