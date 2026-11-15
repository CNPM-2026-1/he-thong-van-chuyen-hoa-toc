import { InputNumber, Select } from 'antd';
import { CrudPage, RemoteSelect, statusColumn, statusOptions } from '../../components/crud';

const stationLabel = (s) => `${s.code} – ${s.name}`;

const columns = [
  { title: 'Mã tuyến', dataIndex: 'code', width: 120 },
  { title: 'Bến đi', render: (_, r) => r.originStation?.name },
  { title: 'Bến đến', render: (_, r) => r.destinationStation?.name },
  { title: 'Quãng đường (km)', dataIndex: 'distanceKm', width: 150, align: 'right' },
  { title: 'Thời gian (giờ)', dataIndex: 'estimatedHours', width: 130, align: 'right' },
  statusColumn,
];

// Bến đi và bến đến không được trùng nhau
const differentFrom = (other, message) => ({ getFieldValue }) => ({
  validator: (_, value) =>
    value && value === getFieldValue(other) ? Promise.reject(new Error(message)) : Promise.resolve(),
});

const fields = [
  { name: 'code', label: 'Mã tuyến', rules: [{ required: true, message: 'Nhập mã tuyến' }] },
  {
    name: 'originStationId',
    label: 'Bến đi',
    rules: [{ required: true, message: 'Chọn bến đi' }, differentFrom('destinationStationId', 'Bến đi phải khác bến đến')],
    input: <RemoteSelect resource="stations" getLabel={stationLabel} placeholder="Chọn bến đi" />,
  },
  {
    name: 'destinationStationId',
    label: 'Bến đến',
    rules: [{ required: true, message: 'Chọn bến đến' }, differentFrom('originStationId', 'Bến đến phải khác bến đi')],
    input: <RemoteSelect resource="stations" getLabel={stationLabel} placeholder="Chọn bến đến" />,
  },
  { name: 'distanceKm', label: 'Quãng đường (km)', rules: [{ required: true, message: 'Nhập quãng đường' }], input: <InputNumber min={1} style={{ width: '100%' }} /> },
  { name: 'estimatedHours', label: 'Thời gian dự kiến (giờ)', rules: [{ required: true, message: 'Nhập thời gian' }], input: <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} /> },
  { name: 'status', label: 'Trạng thái', initialValue: 'ACTIVE', input: <Select options={statusOptions()} /> },
];

export default function RoutesPage() {
  return (
    <CrudPage
      title="Tuyến"
      resource="routes"
      entityLabel="tuyến"
      columns={columns}
      fields={fields}
      searchPlaceholder="Tìm theo mã tuyến hoặc tên bến"
    />
  );
}
