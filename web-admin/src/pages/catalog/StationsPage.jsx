import { Input, Select } from 'antd';
import { CrudPage, PHONE_RULE, statusColumn, statusOptions } from '../../components/crud';

const TYPES = [
  { value: 'STATION', label: 'Bến' },
  { value: 'OFFICE', label: 'Văn phòng' },
];
const typeLabel = (v) => TYPES.find((t) => t.value === v)?.label ?? v;

const columns = [
  { title: 'Mã', dataIndex: 'code', width: 100 },
  { title: 'Tên', dataIndex: 'name' },
  { title: 'Loại', dataIndex: 'type', width: 120, render: typeLabel },
  { title: 'Tỉnh/thành', dataIndex: 'province', width: 160 },
  { title: 'Địa chỉ', dataIndex: 'address' },
  { title: 'Điện thoại', dataIndex: 'phone', width: 130 },
  statusColumn,
];

const fields = [
  { name: 'code', label: 'Mã bến', rules: [{ required: true, message: 'Nhập mã bến' }, { max: 20, message: 'Tối đa 20 ký tự' }] },
  { name: 'name', label: 'Tên bến / văn phòng', rules: [{ required: true, message: 'Nhập tên' }] },
  { name: 'type', label: 'Loại', initialValue: 'STATION', rules: [{ required: true }], input: <Select options={TYPES} /> },
  { name: 'province', label: 'Tỉnh/thành', rules: [{ required: true, message: 'Nhập tỉnh/thành' }] },
  { name: 'address', label: 'Địa chỉ', rules: [{ required: true, message: 'Nhập địa chỉ' }], input: <Input.TextArea rows={2} /> },
  { name: 'phone', label: 'Điện thoại', rules: [PHONE_RULE] },
  { name: 'status', label: 'Trạng thái', initialValue: 'ACTIVE', input: <Select options={statusOptions()} /> },
];

export default function StationsPage() {
  return (
    <CrudPage
      title="Bến / Văn phòng"
      resource="stations"
      entityLabel="bến"
      columns={columns}
      fields={fields}
      searchPlaceholder="Tìm theo mã, tên, địa chỉ"
    />
  );
}
