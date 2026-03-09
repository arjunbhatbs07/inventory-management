import axios from "axios";

const API_BASE_URL = "https://inventory-management-exvi.onrender.com/api";

export const authService = {

  login: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });

    const data = response.data;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  register: async (username, password, full_name) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      password,
      full_name
    });

    const data = response.data;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }

};
