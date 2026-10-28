
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadBookings() {
      try {
        const response = await api.get('bookings/')

        if (!cancelled) {
          setBookings(response.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 401
              ? 'Войди в аккаунт, чтобы посмотреть свои билеты.'
              : 'Не удалось загрузить бронирования.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBookings()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-center">Загружаем билеты...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Мои билеты</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-700 p-6">
          <p className="text-slate-400">
            У тебя пока нет забронированных билетов.
          </p>
          <Link
            to="/sessions"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
          >
            Выбрать сеанс
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <h2 className="text-xl font-semibold">
                Билет №{booking.id}
              </h2>

              <p className="mt-3 text-slate-300">
                Сеанс №{booking.session}
              </p>

              <p className="mt-2 text-slate-400">
                Места: {booking.seats.join(', ')}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Забронировано:{' '}
                {dayjs(booking.created_at).format('D MMMM YYYY, HH:mm')}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
