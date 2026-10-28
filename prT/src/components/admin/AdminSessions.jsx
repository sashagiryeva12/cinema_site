
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, PlusCircle, Trash2, X } from 'lucide-react'
import api from '../../api/client'

const schema = z.object({
  movie: z.coerce.number().int().positive('Выбери фильм'),
  hall: z.coerce.number().int().positive('Выбери зал'),
  starts_at: z.string().min(1, 'Укажи дату и время'),
  price: z.coerce.number().positive('Цена должна быть больше нуля'),
})

const emptyForm = {
  movie: '',
  hall: '',
  starts_at: '',
  price: '',
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function errorMessage(error) {
  const data = error.response?.data
  if (data?.detail) return data.detail
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n')
  }
  return 'Не удалось выполнить запрос к серверу.'
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [movies, setMovies] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionResponse, movieResponse, hallResponse] = await Promise.all([
        api.get('sessions/'),
        api.get('movies/'),
        api.get('halls/'),
      ])

      const unwrap = (response) =>
        Array.isArray(response.data) ? response.data : response.data.results || []

      setSessions(unwrap(sessionResponse))
      setMovies(unwrap(movieResponse))
      setHalls(unwrap(hallResponse))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openCreate() {
    setEditingId(null)
    reset({ ...emptyForm })
    setError('')
    setNotice('')
    setFormOpen(true)
  }

  function openEdit(session) {
    setEditingId(session.id)
    reset({
      movie: String(session.movie),
      hall: String(session.hall),
      starts_at: toLocalDateTime(session.starts_at),
      price: String(session.price),
    })
    setError('')
    setNotice('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    reset({ ...emptyForm })
  }

  async function onSubmit(values) {
    setError('')
    setNotice('')

    const payload = {
      movie: Number(values.movie),
      hall: Number(values.hall),
      starts_at: new Date(values.starts_at).toISOString(),
      price: Number(values.price),
    }

    try {
      if (editingId !== null) {
        await api.patch(`sessions/${editingId}/`, payload)
        setNotice('Сеанс успешно обновлён.')
      } else {
        await api.post('sessions/', payload)
        setNotice('Сеанс успешно добавлен.')
      }
      closeForm()
      await loadData()
    } catch (err) {
      setFormError('root.server', {
        type: 'server',
        message: errorMessage(err),
      })
    }
  }

  async function handleDelete(session) {
    if (!window.confirm(`Удалить сеанс «${session.movie_title}»?`)) return

    setError('')
    setNotice('')
    try {
      await api.delete(`sessions/${session.id}/`)
      setSessions((current) => current.filter((item) => item.id !== session.id))
      setNotice('Сеанс удалён.')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Управление сеансами</h2>
          <p className="mt-1 text-sm text-slate-400">
            Добавление, изменение и удаление показов
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500"
        >
          <PlusCircle size={18} />
          Добавить сеанс
        </button>
      </div>

      {notice && (
        <p className="mt-4 whitespace-pre-line rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-emerald-300">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 whitespace-pre-line rounded-lg border border-red-800 bg-red-950 p-3 text-red-300">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
          noValidate
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {editingId !== null ? 'Редактирование сеанса' : 'Новый сеанс'}
            </h3>
            <button type="button" onClick={closeForm} aria-label="Закрыть форму">
              <X size={20} />
            </button>
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-slate-300">Фильм</span>
            <select {...register('movie')} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              <option value="">Выбери фильм</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>
            {errors.movie && <p className="text-sm text-red-400">{errors.movie.message}</p>}
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-300">Кинозал</span>
            <select {...register('hall')} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              <option value="">Выбери зал</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>{hall.name}</option>
              ))}
            </select>
            {errors.hall && <p className="text-sm text-red-400">{errors.hall.message}</p>}
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-300">Дата и время начала</span>
            <input type="datetime-local" {...register('starts_at')} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
            {errors.starts_at && <p className="text-sm text-red-400">{errors.starts_at.message}</p>}
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-300">Цена билета</span>
            <input type="number" min="0.01" step="0.01" {...register('price')} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
            {errors.price && <p className="text-sm text-red-400">{errors.price.message}</p>}
          </label>

          {errors.root?.server && (
            <p role="alert" className="whitespace-pre-line text-sm text-red-400">
              {errors.root.server.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-orange-600 px-5 py-3 font-semibold hover:bg-orange-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Сохраняем...' : editingId !== null ? 'Сохранить изменения' : 'Добавить сеанс'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-5 text-slate-400">Загружаем сеансы...</p>
      ) : sessions.length === 0 ? (
        <p className="mt-5 rounded-xl border border-slate-700 p-5 text-slate-400">
          Сеансов пока нет. Добавь первый сеанс.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">{session.movie_title}</h3>
              <p className="mt-2 text-sm text-slate-400">Зал: {session.hall_name}</p>
              <p className="mt-1 text-sm text-slate-400">
                Начало: {new Date(session.starts_at).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-300">Цена: {session.price}</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(session)}
                  className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700"
                >
                  <Pencil size={16} /> Изменить
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(session)}
                  className="flex items-center gap-2 rounded-lg bg-red-950 px-3 py-2 text-red-300 hover:bg-red-900"
                >
                  <Trash2 size={16} /> Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
