import { useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space
} from "antd";

import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined
} from "@ant-design/icons";

import { catalogPages, catalogMenuItems } from "./pages/catalog";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function Dashboard({ user, onLogout }) {
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "accounts",
      icon: <UserOutlined />,
      label: "Quản lý tài khoản"
    },
    {
      type: "group",
      label: "Danh mục",
      children: catalogMenuItems
    }
  ];

  // Trang danh mục (TV4). Các mục khác (dashboard, accounts) vẫn hiện nội dung tổng quan.
  const catalogPage = catalogPages[selectedKey];

  return (
    <Layout className="admin-layout">
      <Sider width={230} theme="light">
        <div className="sidebar-title">
          <Title level={4}>WEB ADMIN</Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Title level={4}>Hệ thống quản lý vận chuyển</Title>

          <Space>
            <Text>{user.name}</Text>
            <Text type="secondary">({user.role})</Text>

            <Button
              icon={<LogoutOutlined />}
              onClick={onLogout}
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content className="dashboard-content">
          {catalogPage ? (
            catalogPage.element
          ) : (
            <>
              <Title level={3}>Dashboard</Title>
              <Text type="secondary">
                Tổng quan hoạt động của hệ thống
              </Text>

              <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Text type="secondary">Tổng tài khoản</Text>
                    <Title level={2}>120</Title>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Text type="secondary">Tổng tài xế</Text>
                    <Title level={2}>45</Title>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Text type="secondary">Phương tiện</Text>
                    <Title level={2}>32</Title>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Text type="secondary">Tuyến đường</Text>
                    <Title level={2}>18</Title>
                  </Card>
                </Col>
              </Row>

              <Card title="Thông tin hệ thống" className="system-card">
                <p>Chào mừng bạn đến với hệ thống quản lý vận chuyển.</p>
                <p>Tài khoản: {user.email}</p>
                <p>Vai trò: {user.role}</p>
                <p>Trạng thái: Đang hoạt động</p>
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
