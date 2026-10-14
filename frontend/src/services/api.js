import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Read the latest token for each protected request. Do not attach a stale
// Authorization header to public login/registration requests.
API.interceptors.request.use((config) => {
  const url = String(config.url || "").split("?")[0].replace(/\/+$/, "");
  const token = sessionStorage.getItem("lama_token");
  if (url === "/login" || url === "/register" || !token) {
    config.headers.delete("Authorization");
  } else {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url || "").split("?")[0].replace(/\/+$/, "");
      if (url !== "/login") {
        const sentAuthorization = error.config?.headers?.get?.("Authorization") ||
          error.config?.headers?.Authorization || "";
        const currentToken = sessionStorage.getItem("lama_token");

        // Important: a delayed 401 from an OLD request must not destroy
        // a NEW login session. Never clear a token for an anonymous 401.
        if (currentToken && sentAuthorization === `Bearer ${currentToken}`) {
          sessionStorage.removeItem("lama_token");
          sessionStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.replace("/login");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
