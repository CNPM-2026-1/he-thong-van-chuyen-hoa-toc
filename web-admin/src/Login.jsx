
import React from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { loginApi } from "./api";

const { Title, Text } = Typography;

export default function Login({ onLogin }) {
  const [loading, setLoading] = React.useState(false);

  async function handleLogin(values) {
    try {
      setLoading(true);

      const result = await loginApi(values.email, values.password);

      if (!["ADMIN", "MANAGER"].includes(result.user?.role)) {
        throw new Error("Tài khoản không có quyền truy cập");
      }

      localStorage.setItem("accessToken", result.accessToken);
      onLogin(result.user);

      message.success("Đăng nhập thành công");
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-heading">
          <Title level={3}>WEB ADMIN</Title>
          <Text type="secondary">
            Hệ thống quản lý vận chuyển
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" }
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form>

        <div className="demo-account">
          <Text type="secondary">Tài khoản chạy thử:</Text>
          <p>ADMIN: admin@transit.vn / 123456</p>
          <p>MANAGER: manager@transit.vn / 123456</p>
        </div>
      </Card>
    </div>
  );
}


