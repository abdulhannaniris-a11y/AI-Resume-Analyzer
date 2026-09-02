/**
 * Thin fetch wrapper for talking to the FastAPI backend.
 *
 * Every function returns parsed JSON on success and throws an Error
 * with a readable message on failure, so pages can just try/catch.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("auth_token");
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      "Could not reach the server. Make sure the backend is running at " + API_URL
    );
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getMe: () => request("/users/me"),

  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/resumes/upload", { method: "POST", body: formData, isFormData: true });
  },

  analyze: (payload) => request("/analyze", { method: "POST", body: payload }),

  getDashboardSummary: () => request("/dashboard/summary"),
  getAnalyses: () => request("/analyses"),
  getAnalysis: (id) => request(`/analyses/${id}`),
};
