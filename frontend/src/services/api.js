import axios from "axios";
import VITE_API_URL from meta.env // Ensure the environment variable is loaded
import.meta.env.VITE_WEBSOCKET_URL; // Ensure the environment variable is loaded

const API = axios.create({
  baseURL: VITE_API_URL,
});

export default API;

