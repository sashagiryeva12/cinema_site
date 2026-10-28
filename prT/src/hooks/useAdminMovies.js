
import { useCallback, useState } from 'react'
import api from '../api/client'

export function getErrorMessage(error) {
  const data = error.response?.data

  if (typeof data === 'string') return data
  if (data?.detail) return data.detail

  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages)

        return `${field}: ${message}`
      })
      .join('\n')
  }

  return 'Не удалось выполнить операцию. Проверь соединение с сервером.'
}

export default function useAdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadMovies = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('movies/')
      const data = response.data

      setMovies(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = useCallback(async (movie) => {
    const confirmed = window.confirm(
      `Удалить фильм «${movie.title}»?`
    )

    if (!confirmed) return

    setError('')
    setNotice('')

    try {
      await api.delete(`movies/${movie.id}/`)

      setMovies((current) =>
        current.filter((item) => item.id !== movie.id)
      )

      setNotice(`Фильм «${movie.title}» удалён.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  return {
    movies,
    setMovies,
    loading,
    error,
    setError,
    notice,
    setNotice,
    loadMovies,
    handleDelete,
  }
}
