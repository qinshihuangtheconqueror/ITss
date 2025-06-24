import { fetchApi, fileFetchApi } from '@/lib/fetchAPI';
export const api = {
  get: (endpoint: string) => fetchApi(endpoint),
  post: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchApi(endpoint, {
      method: 'DELETE',
    }),
};

export const fileApi = {
  post: (endpoint: string, data: any) =>
    fileFetchApi(endpoint, {
      method: 'POST',
      body: data,
    }),
};