import {
  CarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import StationsPage from './StationsPage';
import RoutesPage from './RoutesPage';
import VehiclesPage from './VehiclesPage';
import DriversPage from './DriversPage';
import PriceRulesPage from './PriceRulesPage';

// Khóa (key) trùng với key của mục menu trong Dashboard
export const catalogPages = {
  stations: { label: 'Quản lý bến', icon: <ShopOutlined />, element: <StationsPage /> },
  routes: { label: 'Quản lý tuyến đường', icon: <EnvironmentOutlined />, element: <RoutesPage /> },
  vehicles: { label: 'Quản lý phương tiện', icon: <CarOutlined />, element: <VehiclesPage /> },
  drivers: { label: 'Quản lý tài xế', icon: <IdcardOutlined />, element: <DriversPage /> },
  'price-rules': { label: 'Quản lý bảng giá', icon: <DollarOutlined />, element: <PriceRulesPage /> },
};

export const catalogMenuItems = Object.entries(catalogPages).map(([key, p]) => ({
  key,
  icon: p.icon,
  label: p.label,
}));
