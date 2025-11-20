import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const token = localStorage.getItem("token");

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const UserService = {
  getMe: () => axios.get(`${API_URL}/api/users/me`, config),
  getAll: () => axios.get(`${API_URL}/api/users`, config),
  create: (data) => axios.post(`${API_URL}/api/users`, data, config),
  update: (id, data) => axios.put(`${API_URL}/api/users/${id}`, data, config),
  delete: (id) => axios.delete(`${API_URL}/api/users/${id}`, config),
};

export default UserService;
