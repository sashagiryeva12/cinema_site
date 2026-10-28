import AdminMovieCard from '../components/AdminMovieCard'
import AdminSessions from '../components/AdminSessions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Film,
  PlusCircle,
  X,
  RefreshCw,
} from 'lucide-react'
import api from '../api/client'

const emptyForm = {
  title: '',
  description: '',
  genre: '',
  duration: '',
  age_rating: '12+',
  poster_url: '',
  release_date: '',
}

const movieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Введи название фильма.')
    .max(200, 'Название не должно превышать 200 символов.'),

  description: z
    .string()
    .trim()
    .min(1, 'Введи описание фильма.'),

  genre: z
    .string()
    .trim()
    .min(1, 'Введи жанр фильма.')
    .max(100, 'Жанр не должен превышать 100 символов.'),

  duration: z.coerce
    .number()
    .int('Длительность должна быть целым числом.')
    .min(1, 'Длительность должна быть не менее 1 минуты.'),

  age_rating: z.enum(
    ['0+', '6+', '12+', '16+', '18+'],
    { error: 'Выбери возрастной рейтинг.' }
  ),

  poster_url: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.url().safeParse(value).success,
      'Введи корректную ссылку на постер.'
    ),

  release_date: z.string(),
})

function getErrorMessage(error) {
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

export default function Admin() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors: formErrors, isSubmitting },
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: emptyForm,
  })

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase()

    return movies.filter((movie) =>
      (movie.title || '').toLowerCase().includes(query)
    )
  }, [movies, search])

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

  useEffect(() => {
    loadMovies()
  }, [loadMovies])

  function openCreateForm() {
    setEditingId(null)
    reset({ ...emptyForm })
    clearErrors()
    setError('')
    setNotice('')
    setFormOpen(true)
  }

  const openEditForm = useCallback((movie) => {
    setEditingId(movie.id)

    reset({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      duration: String(movie.duration ?? ''),
      age_rating: movie.age_rating || '12+',
      poster_url: movie.poster_url || '',
      release_date: movie.release_date || '',
    })

    clearErrors()
    setError('')
    setNotice('')
    setFormOpen(true)
  }, [reset, clearErrors])

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    reset({ ...emptyForm })
    clearErrors()
  }

  async function onSubmit(form) {
    setError('')
    setNotice('')
    clearErrors('root')

    const payload = {
      ...form,
      duration: Number(form.duration),
      poster_url: form.poster_url || '',
      release_date: form.release_date || null,
    }

    try {
      if (editingId !== null) {
        await api.patch(`movies/${editingId}/`, payload)
        setNotice('Фильм успешно обновлён.')
      } else {
        await api.post('movies/', payload)
        setNotice('Фильм успешно добавлен.')
      }

      closeForm()
      await loadMovies()
    } catch (err) {
      const data = err.response?.data
      const fields = [
        'title',
        'description',
        'genre',
        'duration',
        'age_rating',
        'poster_url',
        'release_date',
      ]

      let hasFieldError = false

      if (data && typeof data === 'object') {
        for (const field of fields) {
          if (data[field]) {
            const message = Array.isArray(data[field])
              ? data[field].join(', ')
              : String(data[field])

            setFormError(field, {
              type: 'server',
              message,
            })

            hasFieldError = true
          }
        }
      }

      if (hasFieldError) {
        setError('Некоторые данные не приняты сервером. Проверь ошибки в форме.')
      } else {
        setFormError('root.server', {
          type: 'server',
          message: getErrorMessage(err),
        })
      }
    }
  }

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

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Панель администратора
          </h1>

          <p className="mt-2 text-slate-400">
            Управление фильмами Cinema Booking
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-500"
        >
          <PlusCircle size={18} />
          Добавить фильм
        </button>
      </div>

      {notice && (
        <p className="mt-5 whitespace-pre-line rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-emerald-300">
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 whitespace-pre-line rounded-lg border border-red-800 bg-red-950 p-3 text-red-300"
        >
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {editingId !== null
                ? 'Редактирование фильма'
                : 'Новый фильм'}
            </h2>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Закрыть форму"
              className="rounded-lg p-2 hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Название *
              </span>
              <input
                {...register('title')}
                maxLength={200}
                aria-invalid={!!formErrors.title}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="Например, Интерстеллар"
              />
              {formErrors.title && (
                <p className="text-sm text-red-400">
                  {formErrors.title.message}
                </p>
              )}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Жанр *
              </span>
              <input
                {...register('genre')}
                maxLength={100}
                aria-invalid={!!formErrors.genre}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="Фантастика"
              />
              {formErrors.genre && (
                <p className="text-sm text-red-400">
                  {formErrors.genre.message}
                </p>
              )}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Длительность (минуты) *
              </span>
              <input
                {...register('duration')}
                type="number"
                min="1"
                step="1"
                aria-invalid={!!formErrors.duration}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="169"
              />
              {formErrors.duration && (
                <p className="text-sm text-red-400">
                  {formErrors.duration.message}
                </p>
              )}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Возрастной рейтинг *
              </span>
              <select
                {...register('age_rating')}
                aria-invalid={!!formErrors.age_rating}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
              >
                <option value="0+">0+</option>
                <option value="6+">6+</option>
                <option value="12+">12+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
              </select>
              {formErrors.age_rating && (
                <p className="text-sm text-red-400">
                  {formErrors.age_rating.message}
                </p>
              )}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Дата выхода
              </span>
              <input
                {...register('release_date')}
                type="date"
                aria-invalid={!!formErrors.release_date}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
              />
              {formErrors.release_date && (
                <p className="text-sm text-red-400">
                  {formErrors.release_date.message}
                </p>
              )}
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">
                Ссылка на постер
              </span>
              <input
                {...register('poster_url')}
                type="url"
                aria-invalid={!!formErrors.poster_url}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="https://..."
              />
              {formErrors.poster_url && (
                <p className="text-sm text-red-400">
                  {formErrors.poster_url.message}
                </p>
              )}
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-slate-300">
              Описание *
            </span>
            <textarea
              {...register('description')}
              rows={4}
              aria-invalid={!!formErrors.description}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
              placeholder="Краткое описание фильма"
            />
            {formErrors.description && (
              <p className="text-sm text-red-400">
                {formErrors.description.message}
              </p>
            )}
          </label>

          {formErrors.root?.server && (
            <p role="alert" className="whitespace-pre-line text-sm text-red-400">
              {formErrors.root.server.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Сохраняем...'
              : editingId !== null
                ? 'Сохранить изменения'
                : 'Добавить фильм'}
          </button>
        </form>
      )}

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Найти фильм по названию..."
        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
      />

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          <Film className="mr-2 inline" size={22} />
          Список фильмов ({filteredMovies.length})
        </h2>

        <button
          type="button"
          onClick={loadMovies}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Обновить
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-400">
          Загружаем фильмы...
        </p>
      ) : filteredMovies.length === 0 ? (
        <p className="mt-6 rounded-xl border border-slate-700 p-6 text-slate-400">
          Фильмов пока нет. Добавь первый фильм.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filteredMovies.map((movie) => (
            <AdminMovieCard
              key={movie.id}
              movie={movie}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <AdminSessions />
    </main>
  )
}