import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../api/client'

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Введи имя пользователя.')
    .min(3, 'Имя пользователя должно содержать минимум 3 символа.')
    .max(150, 'Имя пользователя слишком длинное.'),

  email: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Введи корректный адрес электронной почты.'
    ),

  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов.'),
})

export default function Register() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(form) {
    setServerError('')
    clearErrors('root')

    const data = {
      username: form.username,
      email: form.email,
      password: form.password,
    }

    
    if (!data.email) {
      delete data.email
    }

    try {
      await api.post('auth/register/', data)

      navigate('/login', {
        state: {
          message: 'Регистрация успешна! Теперь войди в аккаунт.',
        },
      })
    } catch (err) {
      const responseData = err.response?.data

      if (responseData && typeof responseData === 'object') {
        const fieldNames = ['username', 'email', 'password']

        for (const field of fieldNames) {
          if (responseData[field]) {
            const messages = Array.isArray(responseData[field])
              ? responseData[field].join(', ')
              : String(responseData[field])

            setError(field, {
              type: 'server',
              message: messages,
            })
          }
        }

        const otherErrors = Object.entries(responseData)
          .filter(([field]) => !fieldNames.includes(field))
          .map(([field, messages]) => {
            const message = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            return `${field}: ${message}`
          })

        if (otherErrors.length > 0) {
          setServerError(otherErrors.join(' | '))
        }

        if (
          !fieldNames.some((field) => responseData[field]) &&
          otherErrors.length === 0
        ) {
          setServerError('Не удалось зарегистрироваться. Проверь данные.')
        }
      } else {
        setServerError('Не удалось подключиться к серверу.')
      }
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Регистрация</h1>

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
            {...register('email')}
            type="email"
            placeholder="Электронная почта (необязательно)"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Пароль"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {(serverError || errors.root?.server) && (
          <p role="alert" className="text-sm text-red-400">
            {serverError || errors.root.server.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт'}
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