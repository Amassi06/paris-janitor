import { API_URL } from '../types/booking';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token');

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', 
    });

    if (!refreshResponse.ok) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return response;
    }

    const data = await refreshResponse.json();
    localStorage.setItem('token', data.token);

    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.token}`,
      },
    });
  }

  return response;
}
