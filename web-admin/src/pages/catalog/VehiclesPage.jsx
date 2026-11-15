import { InputNumber, Select } from 'antd';
import { CrudPage, statusColumn, statusOptions } from '../../components/crud';

const TYPES = [
  { value: 'TRUCK', label: 'Xe tải' },
  { value: 'VAN', label: 'Xe van' },
  { value: 'PICKUP', label: 'Xe bán tải' },
];

const columns = [
  { title: 'Biển số', dataIndex: 'plateNumber', width: 140 },
  { title: 'Loại xe', dataIndex: 'type', width: 130, render: (v) => TYPES.find((t) => t.value === v)?.label ?? v },
  { title: 'Tải trọng (kg)', dataIndex: 'capacityKg', width: 140, align: 'right', render: (v) => v?.toLocaleString('vi-VN') },
  statusColumn,
];

const fields = [
  { name: 'plateNumber', label: 'Biển số', rules: [{ required: true, message: 'Nhập biển số' }] },
  { name: 'type', label: 'Loại xe', initialValue: 'TRUCK', rules: [{ required: true }], input: <Select options={TYPES} /> },
  { name: 'capacityKg', label: 'Tải trọng (kg)', rules: [{ required: true, message: 'Nhập tải trọng' }], input: <InputNumber min={1} style={{ width: '100%' }} /> },
  { name: 'status', label: 'Trạng thái', initialValue: 'ACTIVE', input: <Select options={statusOptions(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])} /> },
];

export default function VehiclesPage() {
  return (
    <CrudPage
      title="Xe"
      resource="vehicles"
      entityLabel="xe"
      columns={columns}
      fields={fields}
      searchPlaceholder="Tìm theo biển số"
    />
  );
}
