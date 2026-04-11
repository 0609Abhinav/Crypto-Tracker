const BASE = process.env.REACT_APP_API_URL;

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);
    return handle(res);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to server. Make sure the backend is running.");
    }
    throw err;
  }
};

export const authAPI = {
  signup: (body) =>
    safeFetch(`${BASE}/auth/signup`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  login: (body) =>
    safeFetch(`${BASE}/auth/login`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  getMe: () =>
    safeFetch(`${BASE}/auth/me`, { headers: authHeaders() }),
  updateProfile: (body) =>
    safeFetch(`${BASE}/auth/profile`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) }),
};

export const watchlistAPI = {
  get: () =>
    safeFetch(`${BASE}/watchlist`, { headers: authHeaders() }),
  add: (coinId) =>
    safeFetch(`${BASE}/watchlist`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ coinId }) }),
  remove: (coinId) =>
    safeFetch(`${BASE}/watchlist/${coinId}`, { method: "DELETE", headers: authHeaders() }),
};

export const portfolioAPI = {
  get: () =>
    safeFetch(`${BASE}/portfolio`, { headers: authHeaders() }),
  add: (body) =>
    safeFetch(`${BASE}/portfolio`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  update: (holdingId, body) =>
    safeFetch(`${BASE}/portfolio/${holdingId}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) }),
  remove: (holdingId) =>
    safeFetch(`${BASE}/portfolio/${holdingId}`, { method: "DELETE", headers: authHeaders() }),
};

export const alertsAPI = {
  get: () =>
    safeFetch(`${BASE}/alerts`, { headers: authHeaders() }),
  create: (body) =>
    safeFetch(`${BASE}/alerts`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  delete: (alertId) =>
    safeFetch(`${BASE}/alerts/${alertId}`, { method: "DELETE", headers: authHeaders() }),
  toggle: (alertId) =>
    safeFetch(`${BASE}/alerts/${alertId}/toggle`, { method: "PATCH", headers: authHeaders() }),
};

export const authExtAPI = {
  forgotPassword: (email) =>
    safeFetch(`${BASE}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    safeFetch(`${BASE}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }),
};

export const prefsAPI = {
  get: () =>
    safeFetch(`${BASE}/prefs`, { headers: authHeaders() }),
  update: (body) =>
    safeFetch(`${BASE}/prefs`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) }),
  addRecent: (coin) =>
    safeFetch(`${BASE}/prefs/recent`, { method: "POST", headers: authHeaders(), body: JSON.stringify(coin) }),
  clearRecent: () =>
    safeFetch(`${BASE}/prefs/recent`, { method: "DELETE", headers: authHeaders() }),
};
