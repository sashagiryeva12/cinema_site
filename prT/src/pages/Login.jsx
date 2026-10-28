import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Введи имя пользователя.'),

  password: z
    .string()
    .min(1, 'Введи пароль.'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(form) {
    setServerError('')
    clearErrors('root')

    try {
      const response = await api.post('auth/login/', form)

      await login(response.data)
      navigate('/movies')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('root.server', {
          type: 'server',
          message: 'Неверное имя пользователя или пароль.',
        })
      } else {
        setServerError(
          'Не удалось выполнить вход. Проверь, запущен ли Django.'
        )
      }
    }
  }

  const errorMessage = errors.root?.server?.message || serverError

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Вход</h1>

      {location.state?.message && (
        <p className="mb-4 text-green-400">
          {location.state.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div>
          <input
            {...register('username')}
            placeholder="Имя пользователя"
            autoComplete="username"
            aria-invalid={!!errors.username}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
          />

          {errors.username && (
            <p className="mt-1 text-sm text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-red-400">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Входим...' : 'Войти'}
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