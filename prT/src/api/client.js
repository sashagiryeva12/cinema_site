
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access')

  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }

  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      /auth\/(login|register|refresh)\//.test(originalRequest.url ?? '')
    ) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem('refresh')

    if (!refresh) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${import.meta.env.VITE_API_URL}/auth/refresh/`,
            { refresh },
          )
          .then((response) => response.data.access)
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccess = await refreshPromise
      localStorage.setItem('access', newAccess)

      originalRequest.headers.Authorization = `Bearer ${newAccess}`
      return api(originalRequest)
    } catch (refreshError) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    }
  },
)

export default api
