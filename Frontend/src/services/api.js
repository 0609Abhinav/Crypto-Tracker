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
