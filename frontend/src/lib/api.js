import axios from "axios";

const API_BASE_URL = "https://inventory-management-exvi.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export const api = {

  // ================= DASHBOARD =================
  getDashboard: async () => {
    const res = await API.get("/dashboard");
    return { data: res.data };
  },


  // ================= PRODUCTS =================
  getProducts: async () => {
    const res = await API.get("/products");
    return { data: res.data };
  },

  createProduct: async (data) => {
    const res = await API.post("/products", data);
    return { data: res.data };
  },

  updateProduct: async (id, data) => {
    const res = await API.put(`/products/${id}`, data);
    return { data: res.data };
  },

  deleteProduct: async (id) => {
    const res = await API.delete(`/products/${id}`);
    return { data: res.data };
  },


  // ================= CUSTOMERS =================
  getCustomers: async (search = "") => {
    const res = await API.get(`/customers?search=${search}`);
    return { data: res.data };
  },

  createCustomer: async (data) => {
    const res = await API.post("/customers", data);
    return { data: res.data };
  },

  getCustomerOrders: async (customerId) => {
    const res = await API.get(`/orders/customer/${customerId}`);
    return { data: res.data };
  },


  // ================= ORDERS =================
  createOrder: async (data) => {
    const res = await API.post("/orders", data);
    return { data: res.data };
  },

  getOrders: async () => {
    const res = await API.get("/orders");
    return { data: res.data };
  },

  getOrderHistory: async (orderId) => {
  const res = await API.get(`/orders/${orderId}/history`);
  return { data: res.data };
 },

// ================= INVOICE =================
downloadInvoice: async (orderId) => {
  const res = await API.get(`/orders/${orderId}/invoice`, {
    responseType: "blob"
  });

  return res.data;
},

  // ================= INVENTORY =================
  updateStock: async (data) => {
    const res = await API.post("/inventory/update-stock", data);
    return { data: res.data };
  },

  getStockHistory: async () => {
    const res = await API.get("/inventory/history");
    return { data: res.data };
  },

  getInventoryValue: async () => {
    const res = await API.get("/inventory/value");
    return { data: res.data };
  },


  // ================= REPORTS =================
  getSalesReport: async (period) => {
    const res = await API.get(`/reports/sales?period=${period}`);
    return { data: res.data };
  },

  getBestSellingProducts: async () => {
    const res = await API.get("/reports/best-selling");
    return { data: res.data };
  },

  exportCSV: async () => {
    const res = await API.get("/reports/export-csv");
    return { data: res.data };
  }

};
