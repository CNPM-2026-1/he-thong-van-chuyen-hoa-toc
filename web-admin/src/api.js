import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Tự động thêm token vào request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Đăng nhập
export async function loginApi(email, password) {
  const useMock = import.meta.env.VITE_USE_MOCK === "true";

  if (useMock) {
    const accounts = [
      {
        email: "admin@transit.vn",
        password: "123456",
        role: "ADMIN",
        name: "Quản trị viên"
      },
      {
        email: "manager@transit.vn",
        password: "123456",
        role: "MANAGER",
        name: "Quản lý"
      }
    ];

    const account = accounts.find(
      (item) => item.email === email && item.password === password
    );

    if (!account) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    return {
      accessToken: "mock-access-token",
      user: {
        email: account.email,
        name: account.name,
        role: account.role
      }
    };
  }

  // Endpoint tạm thời, sẽ điều chỉnh theo API Contract của nhóm
  const response = await api.post("/auth/login", {
    email,
    password
  });

  return response.data;
}

export default api;