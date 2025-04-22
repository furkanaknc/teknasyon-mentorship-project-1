import axios from "axios";

const AUTH_API_URL = "http://localhost:3001";
const LIST_SERVICE_URL = "http://localhost:3002";
const PROFILE_API_URL = "http://localhost:3003";

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const listApi = axios.create({
  baseURL: LIST_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const profileApi = axios.create({
  baseURL: PROFILE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const addAuthToken = (config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken);
listApi.interceptors.request.use(addAuthToken);
profileApi.interceptors.request.use(addAuthToken);

// Request interceptor for debugging
listApi.interceptors.request.use(
  (config) => {
    console.log("Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
listApi.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);
