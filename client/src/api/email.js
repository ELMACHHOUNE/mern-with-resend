const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => localStorage.getItem("auth_token");

const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing in client environment");
  }

  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const listThreads = (folder = "inbox", page = 1, limit = 20) => {
  const params = new URLSearchParams({ folder, page, limit });
  return request(`/api/emails?${params}`, { method: "GET" });
};

export const searchThreads = (q, folder) => {
  const params = new URLSearchParams({ q });
  if (folder) params.set("folder", folder);
  return request(`/api/emails/search?${params}`, { method: "GET" });
};

export const getThread = (threadId) => {
  return request(`/api/emails/thread/${threadId}`, { method: "GET" });
};

export const updateThread = (threadId, updates) => {
  return request(`/api/emails/thread/${threadId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

export const deleteThread = (threadId) => {
  return request(`/api/emails/thread/${threadId}`, { method: "DELETE" });
};

export const sendEmail = (payload) => {
  return request("/api/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const saveDraft = (payload) => {
  return request("/api/email/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDraft = (id, payload) => {
  return request(`/api/email/draft/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const getAttachmentUrl = (messageId, attachmentId) => {
  const token = getToken();
  return `${API_BASE_URL}/api/emails/attachments/${messageId}/${attachmentId}?token=${token}`;
};
