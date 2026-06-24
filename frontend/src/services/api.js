import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL,
});

export default API;
/*
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

export default API;*/