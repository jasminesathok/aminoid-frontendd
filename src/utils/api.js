import { emitToast } from '../context/ToastContext';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (path, options = {}, { silent = false } = {}) => {
  const token = localStorage.getItem('token');

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    if (!silent) emitToast('error', 'Cannot reach the server. Check your connection.');
    throw new Error('Network error');
  }

  const data = await res.json();

  if (!res.ok) {
  const msg = data.message || 'Something went wrong.';
  // On 401: clear stale token and redirect to login
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Only redirect if not already on the login page to avoid endless reloads or hiding login errors
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(msg);
  }
  if (!silent) emitToast('error', msg);
  throw new Error(msg);
}

  return data;
};

export const api = {
  get:    (path, opts)        => request(path, { method: 'GET' }, opts),
  post:   (path, body, opts)  => request(path, { method: 'POST',   body: JSON.stringify(body) }, opts),
  put:    (path, body, opts)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }, opts),
  patch:  (path, body, opts)  => request(path, { method: 'PATCH',  body: JSON.stringify(body) }, opts),
  delete: (path, opts)        => request(path, { method: 'DELETE' }, opts),
};