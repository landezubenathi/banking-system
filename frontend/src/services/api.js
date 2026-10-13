import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("lama_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // A failed login is not evidence an existing session expired.
    if (error.response?.status === 401 &&
        !String(error.config?.url || "").endsWith("/login")) {
      sessionStorage.removeItem("lama_token");
      sessionStorage.removeItem("user");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default API;
