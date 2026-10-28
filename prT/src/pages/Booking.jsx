
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

export default function Booking() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    try {
      setError('')

      const [sessionResponse, seatsResponse] = await Promise.all([
        api.get(`sessions/${sessionId}/`),
        api.get(`sessions/${sessionId}/occupied-seats/`),
      ])

      setSession(sessionResponse.data)
      setOccupiedSeats(seatsResponse.data.occupied_seats)
    } catch {
      setError('Не удалось загрузить сеанс. Проверь, существует ли он.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [sessionId])

  function toggleSeat(seat) {
    if (occupiedSeats.includes(seat)) return

    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat].sort((a, b) => a - b)
    )
  }

  async function handleBooking() {
    if (!selectedSeats.length) {
      setError('Сначала выбери хотя бы одно место.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.post('bookings/', {
        session: Number(sessionId),
        seats: selectedSeats,
      })

      setSelectedSeats([])
      await loadData()
      alert('Билеты успешно забронированы!')
      navigate('/my-bookings')
    } catch (err) {
      const data = err.response?.data
      const message =
        data?.seats?.[0] ||
        data?.non_field_errors?.[0] ||
        'Не удалось оформить бронь. Попробуй ещё раз.'

      setError(message)
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-center">Загружаем схему зала...</p>
  }

  if (!session) {
    return <p className="text-center text-red-400">{error || 'Сеанс не найден.'}</p>
  }

  const totalSeats = session.hall
    ? undefined
    : null

  const seatCount = 50
  const price = Number(session.price)

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold">Выбор мест</h1>
      <h2 className="text-xl">{session.movie_title}</h2>
      <p className="mb-6 text-slate-400">
        {session.hall_name} · {price} ₸ за место
      </p>

      <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-8 rounded-t-full bg-slate-600 py-2 text-center text-sm text-white">
          ЭКРАН
        </div>

        <div className="mx-auto grid max-w-xl grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: seatCount }, (_, index) => {
            const seat = index + 1
            const occupied = occupiedSeats.includes(seat)
            const selected = selectedSeats.includes(seat)

            return (
              <button
                key={seat}
                disabled={occupied}
                onClick={() => toggleSeat(seat)}
                className={`rounded-lg p-2 text-sm transition ${
                  occupied
                    ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                    : selected
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-600'
                }`}
                title={
                  occupied
                    ? `Место ${seat} занято`
                    : `Место ${seat}`
                }
              >
                {seat}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <span>🟩 Свободно</span>
          <span>🟥 Выбрано</span>
          <span>⬛ Занято</span>
        </div>
      </div>

      <p className="mb-4">
        Выбрано мест: <strong>{selectedSeats.length}</strong>
      </p>
      <p className="mb-6 text-xl font-bold">
        Итого: {(price * selectedSeats.length).toLocaleString('ru-RU')} ₸
      </p>

      {error && (
        <p className="mb-4 text-red-400">{error}</p>
      )}

      <button
        onClick={handleBooking}
        disabled={saving || selectedSeats.length === 0}
        className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Оформляем...' : 'Забронировать'}
      </button>
    </main>
  )
}
