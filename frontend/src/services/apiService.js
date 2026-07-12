import { API_BASE_URL } from "../constants/api";

const apiRequest = async (method, endpoint, data = null, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result.data || result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const api = {
  get: (endpoint, token) => apiRequest("GET", endpoint, null, token),
  post: (endpoint, data, token) => apiRequest("POST", endpoint, data, token),
  put: (endpoint, data, token) => apiRequest("PUT", endpoint, data, token),
  patch: (endpoint, data, token) => apiRequest("PATCH", endpoint, data, token),
  delete: (endpoint, token) => apiRequest("DELETE", endpoint, null, token),
};
