import axios from "axios";

const API_BASE_URL = "https://inventory-management-exvi.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Dashboard
  getDashboard: () =>
    API.get("/dashboard").then((res) => ({ data: res.data })),

  // Products
  getProducts: () =>
    API.get("/products").then((res) => ({ data: res.data })),

  getProduct: (id) =>
    API.get(`/products/${id}`).then((res) => ({ data: res.data })),

  createProduct: (data) =>
    API.post("/products", data).then((res) => ({ data: res.data })),

  updateProduct: (id, data) =>
    API.put(`/products/${id}`, data).then((res) => ({ data: res.data })),

  deleteProduct: (id) =>
    API.delete(`/products/${id}`).then((res) => ({ data: res.data })),

  // Customers
  getCustomers: (search = "") =>
    API.get(`/customers?search=${search}`).then((res) => ({ data: res.data })),

  getCustomer: (id) =>
    API.get(`/customers/${id}`).then((res) => ({ data: res.data })),

  createCustomer: (data) =>
    API.post("/customers", data).then((res) => ({ data: res.data })),

  getCustomerByPhone: (phone) =>
    API.get(`/customers/phone/${phone}`).then((res) => ({ data: res.data })),

  getCustomerOrders: (customerId) =>
    API.get(`/customers/${customerId}/orders`).then((res) => ({ data: res.data })),

  // Orders
  createOrder: (data) =>
    API.post("/orders", data).then((res) => ({ data: res.data })),

  getOrders: () =>
    API.get("/orders").then((res) => ({ data: res.data })),

  // Inventory
  updateStock: (data) =>
    API.post("/inventory/update", data).then((res) => ({ data: res.data })),

  getStockHistory: (productId) =>
    API.get(`/inventory/${productId}`).then((res) => ({ data: res.data })),

  getInventoryValue: () =>
    API.get("/inventory/value").then((res) => ({ data: res.data })),

  // Reports
  getSalesReport: (period) =>
    API.get(`/reports/sales?period=${period}`).then((res) => ({ data: res.data })),

  getBestSellingProducts: () =>
    API.get("/reports/best-products").then((res) => ({ data: res.data })),

  exportCSV: () =>
    API.get("/reports/export").then((res) => ({ data: res.data })),
};
