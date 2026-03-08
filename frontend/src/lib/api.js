import axios from "axios";

const API_BASE_URL = "https://inventory-management-exvi.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const api = {
  getDashboard: () =>
    API.get("/dashboard").then((res) => ({ data: res.data })),

  getProducts: () =>
    API.get("/products").then((res) => ({ data: res.data })),

  createProduct: (data) =>
    API.post("/products", data).then((res) => ({ data: res.data })),

  updateProduct: (id, data) =>
    API.put(`/products/${id}`, data).then((res) => ({ data: res.data })),

  deleteProduct: (id) =>
    API.delete(`/products/${id}`).then((res) => ({ data: res.data })),

  getCustomers: (search = "") =>
    API.get(`/customers?search=${search}`).then((res) => ({ data: res.data })),

  createCustomer: (data) =>
    API.post("/customers", data).then((res) => ({ data: res.data })),

  getCustomerOrders: (customerId) =>
    API.get(`/orders/customer/${customerId}`).then((res) => ({ data: res.data })),

  createOrder: (data) =>
    API.post("/orders", data).then((res) => ({ data: res.data })),

  getOrders: () =>
    API.get("/orders").then((res) => ({ data: res.data })),

  updateStock: (data) =>
    API.post("/inventory/update-stock", data).then((res) => ({ data: res.data })),

  getStockHistory: () =>
    API.get("/inventory/history").then((res) => ({ data: res.data })),

  getInventoryValue: () =>
    API.get("/inventory/value").then((res) => ({ data: res.data })),

  getSalesReport: (period) =>
    API.get(`/reports/sales?period=${period}`).then((res) => ({ data: res.data })),
};
