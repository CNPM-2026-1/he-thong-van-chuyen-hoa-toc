import { InputNumber, Tag } from 'antd';

export const STATUS = {
  ACTIVE: { label: 'Đang hoạt động', color: 'green' },
  MAINTENANCE: { label: 'Bảo trì', color: 'orange' },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'default' },
};

export const statusOptions = (keys = ['ACTIVE', 'INACTIVE']) =>
  keys.map((k) => ({ value: k, label: STATUS[k].label }));

export const StatusTag = ({ value }) => {
  const s = STATUS[value];
  return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{value}</Tag>;
};

export const statusColumn = {
  title: 'Trạng thái',
  dataIndex: 'status',
  width: 150,
  render: (v) => <StatusTag value={v} />,
};

export const formatVND = (n) => (n == null ? '' : `${Number(n).toLocaleString('vi-VN')} đ`);

// Ô nhập tiền: hiện dấu chấm phân cách nghìn, giá trị gửi đi vẫn là số
export const MoneyInput = (props) => (
  <InputNumber
    min={0}
    step={1000}
    precision={0}
    style={{ width: '100%' }}
    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
    parser={(v) => v?.replace(/\./g, '')}
    {...props}
  />
);

export const PHONE_RULE = {
  pattern: /^(0|\+84)\d{9}$/,
  message: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0 hoặc +84',
};
