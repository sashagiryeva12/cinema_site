
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('auth/login/', form)

      await login(response.data)
      navigate('/movies')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Неверное имя пользователя или пароль.')
      } else {
        setError('Не удалось выполнить вход. Проверь, запущен ли Django.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Вход</h1>

      {location.state?.message && (
        <p className="mb-4 text-green-400">{location.state.message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          value={form.username}
          onChange={(event) =>
            setForm({ ...form, username: event.target.value })
          }
          placeholder="Имя пользователя"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
          placeholder="Пароль"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        {error && (
          <p role="alert" className="text-sm text-red-400">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-red-400">
          Зарегистрироваться
        </Link>
      </p>
    </section>
  )
}
