import { Select } from 'antd';
import { CrudPage, PHONE_RULE, RemoteSelect, statusColumn, statusOptions } from '../../components/crud';

const LICENSE_CLASSES = ['B2', 'C', 'D', 'E', 'FC'].map((v) => ({ value: v, label: `Hạng ${v}` }));

const columns = [
  { title: 'Họ tên', dataIndex: 'fullName' },
  { title: 'Điện thoại', dataIndex: 'phone', width: 130 },
  { title: 'Số GPLX', dataIndex: 'licenseNumber', width: 150 },
  { title: 'Hạng', dataIndex: 'licenseClass', width: 80 },
  { title: 'Xe mặc định', width: 140, render: (_, r) => r.defaultVehicle?.plateNumber ?? '—' },
  statusColumn,
];

const fields = [
  { name: 'fullName', label: 'Họ tên', rules: [{ required: true, message: 'Nhập họ tên' }] },
  { name: 'phone', label: 'Điện thoại', rules: [{ required: true, message: 'Nhập số điện thoại' }, PHONE_RULE] },
  { name: 'licenseNumber', label: 'Số GPLX', rules: [{ required: true, message: 'Nhập số GPLX' }] },
  { name: 'licenseClass', label: 'Hạng GPLX', rules: [{ required: true, message: 'Chọn hạng' }], input: <Select options={LICENSE_CLASSES} /> },
  {
    name: 'defaultVehicleId',
    label: 'Xe mặc định',
    extra: 'Có thể để trống và gán sau.',
    input: <RemoteSelect resource="vehicles" getLabel={(v) => v.plateNumber} placeholder="Chọn xe" allowClear />,
  },
  { name: 'status', label: 'Trạng thái', initialValue: 'ACTIVE', input: <Select options={statusOptions()} /> },
];

export default function DriversPage() {
  return (
    <CrudPage
      title="Tài xế"
      resource="drivers"
      entityLabel="tài xế"
      columns={columns}
      fields={fields}
      searchPlaceholder="Tìm theo tên, điện thoại, số GPLX"
    />
  );
}
