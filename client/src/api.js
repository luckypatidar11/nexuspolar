const apiOrigin = (import.meta.env.client_key_ || import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiFetch = (path, options) => fetch(`${apiOrigin}${path}`, options);