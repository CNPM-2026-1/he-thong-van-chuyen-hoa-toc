import { useState } from 'react';
import { Card, Typography } from 'antd';
import { useCrud } from './useCrud';
import CrudTable from './CrudTable';
import CrudFormModal from './CrudFormModal';

// Một trang danh mục hoàn chỉnh chỉ cần khai báo: tên, resource, cột bảng, ô trong form
export default function CrudPage({ title, resource, entityLabel = 'mục', columns, fields, searchPlaceholder }) {
  const crud = useCrud(resource);
  const [modal, setModal] = useState({ open: false, record: null });
  const close = () => setModal({ open: false, record: null });

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Card>
        <CrudTable
          columns={columns}
          items={crud.items}
          total={crud.total}
          loading={crud.loading}
          query={crud.query}
          onPageChange={crud.setPage}
          onSearch={crud.setKeyword}
          onAdd={() => setModal({ open: true, record: null })}
          onEdit={(record) => setModal({ open: true, record })}
          onDelete={(record) => crud.remove(record.id)}
          searchPlaceholder={searchPlaceholder}
          addLabel={`Thêm ${entityLabel}`}
        />
      </Card>
      <CrudFormModal
        open={modal.open}
        title={modal.record ? `Sửa ${entityLabel}` : `Thêm ${entityLabel}`}
        fields={fields}
        record={modal.record}
        onCancel={close}
        onSubmit={async (values) => {
          await crud.save(modal.record?.id, values);
          close();
        }}
      />
    </>
  );
}
