import { useEffect, useState } from 'react';
import { Button, Input, Popconfirm, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

export default function CrudTable({
  columns,
  items,
  total,
  loading,
  query,
  onPageChange,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = 'Tìm kiếm',
  addLabel = 'Thêm mới',
  rowKey = 'id',
}) {
  // Gõ xong 400ms mới gửi tìm kiếm
  const [text, setText] = useState(query.q);
  useEffect(() => {
    const t = setTimeout(() => {
      if (text !== query.q) onSearch(text);
    }, 400);
    return () => clearTimeout(t);
  }, [text, query.q, onSearch]);

  const actionColumn = {
    title: 'Thao tác',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (_, record) => (
      <Space size={0}>
        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
          Sửa
        </Button>
        <Popconfirm
          title="Xóa mục này?"
          description="Mục đã xóa sẽ không còn hiện trong danh sách."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          allowClear
          style={{ maxWidth: 320 }}
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
      <Table
        rowKey={rowKey}
        columns={[...columns, actionColumn]}
        dataSource={items}
        loading={loading}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: query.q ? 'Không có kết quả phù hợp' : 'Chưa có dữ liệu. Chọn "Thêm mới" để tạo mục đầu tiên.' }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `${t} mục`,
          onChange: onPageChange,
        }}
      />
    </>
  );
}
