
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('auth/register/', form)

      navigate('/login', {
        state: {
          message: 'Регистрация успешна! Теперь войди в аккаунт.',
        },
      })
    } catch (err) {
      const data = err.response?.data

      setError(
        data
          ? Object.entries(data)
              .map(([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages)
                    ? messages.join(', ')
                    : messages
                }`
              )
              .join(' | ')
          : 'Не удалось подключиться к серверу.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Регистрация</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Имя пользователя"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Электронная почта"
          autoComplete="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Пароль"
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-red-400">
          Войти
        </Link>
      </p>
    </section>
  )
}
