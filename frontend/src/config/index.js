/**
 * Backend API base URL resolved from VITE_API_BASE_URL (falls back to local Express server).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api";

export { API_BASE_URL };
