import { InputNumber, Select } from 'antd';
import { CrudPage, MoneyInput, RemoteSelect, formatVND, statusColumn, statusOptions } from '../../components/crud';

const routeLabel = (r) => `${r.code}: ${r.originStation?.name ?? '?'} – ${r.destinationStation?.name ?? '?'}`;

const columns = [
  { title: 'Tuyến', render: (_, r) => r.route?.code },
  { title: 'Phí cơ bản', dataIndex: 'baseFee', align: 'right', render: formatVND },
  { title: 'Đơn giá/kg', dataIndex: 'pricePerKg', align: 'right', render: formatVND },
  { title: 'Hệ số hỏa tốc', dataIndex: 'expressMultiplier', width: 130, align: 'right', render: (v) => `× ${v}` },
  { title: 'Phí COD', dataIndex: 'codFee', align: 'right', render: formatVND },
  statusColumn,
];

const fields = [
  {
    name: 'routeId',
    label: 'Tuyến',
    rules: [{ required: true, message: 'Chọn tuyến' }],
    input: <RemoteSelect resource="routes" getLabel={routeLabel} placeholder="Chọn tuyến" />,
  },
  { name: 'baseFee', label: 'Phí cơ bản (đ)', rules: [{ required: true, message: 'Nhập phí cơ bản' }], input: <MoneyInput /> },
  { name: 'pricePerKg', label: 'Đơn giá theo kg (đ/kg)', rules: [{ required: true, message: 'Nhập đơn giá' }], input: <MoneyInput /> },
  {
    name: 'expressMultiplier',
    label: 'Hệ số hỏa tốc',
    initialValue: 1.5,
    extra: 'Cước hỏa tốc = cước thường × hệ số. Tối thiểu 1.',
    rules: [{ required: true, message: 'Nhập hệ số' }],
    input: <InputNumber min={1} step={0.1} style={{ width: '100%' }} />,
  },
  { name: 'codFee', label: 'Phí COD (đ)', initialValue: 0, rules: [{ required: true, message: 'Nhập phí COD' }], input: <MoneyInput /> },
  { name: 'status', label: 'Trạng thái', initialValue: 'ACTIVE', input: <Select options={statusOptions()} /> },
];

export default function PriceRulesPage() {
  return (
    <CrudPage
      title="Bảng giá"
      resource="price-rules"
      entityLabel="bảng giá"
      columns={columns}
      fields={fields}
      searchPlaceholder="Tìm theo tuyến"
    />
  );
}
