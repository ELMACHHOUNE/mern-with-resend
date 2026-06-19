const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing in client environment");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const signup = (payload) => {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const signin = (payload) => {
  return request("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const logout = () => {
  return request("/api/auth/logout", {
    method: "POST",
  });
};

export const getCurrentUser = (token) => {
  return request("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
