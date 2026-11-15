import { useState } from 'react';
import { Form, Input, Modal, message } from 'antd';

// fields: [{ name, label, rules, input (phần tử React, mặc định <Input/>), initialValue, extra }]
export default function CrudFormModal({ open, title, fields, record, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const initialValues = record ?? Object.fromEntries(fields.filter((f) => f.initialValue !== undefined).map((f) => [f.name, f.initialValue]));

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // lỗi nhập liệu đã hiện dưới từng ô
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (e) {
      // Lỗi từ API ({ code, message }): giữ form mở để sửa lại
      message.error(e.message || 'Không lưu được');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
      maskClosable={false}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} preserve={false} style={{ marginTop: 16 }}>
        {fields.map((f) => (
          <Form.Item key={f.name} name={f.name} label={f.label} rules={f.rules} extra={f.extra}>
            {f.input ?? <Input />}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
