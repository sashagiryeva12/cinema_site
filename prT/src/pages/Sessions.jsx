
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchSessions() {
      try {
        const response = await api.get('sessions/')
        if (!cancelled) setSessions(response.data)
      } catch {
        if (!cancelled) setError('Не удалось загрузить сеансы.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSessions()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="p-6 text-center">Загружаем сеансы...</p>
  }

  if (error) {
    return <p className="p-6 text-center text-red-400">{error}</p>
  }

  if (sessions.length === 0) {
    return <p className="p-6 text-center">Пока нет доступных сеансов.</p>
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Сеансы</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            <h2 className="text-xl font-semibold">
              {session.movie_title}
            </h2>

            <p className="mt-2 text-slate-400">
              Зал: {session.hall_name}
            </p>

            <p className="mt-1 text-slate-400">
              {dayjs(session.starts_at).format('D MMMM YYYY, HH:mm')}
            </p>

            <p className="mt-3 font-semibold">
              Цена: {session.price}
            </p>

            <Link
              to={`/booking/${session.id}`}
              className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
            >
              Выбрать места
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
