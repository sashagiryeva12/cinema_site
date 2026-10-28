import { useEffect, useState } from 'react'
import api from '../api/client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = ['#f97316', '#475569']

function ChartCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-5 text-lg font-semibold text-white">
        {title}
      </h2>
      <div className="h-72 w-full">
        {children}
      </div>
    </section>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadStatistics() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('admin/statistics/')

        if (active) {
          setStats(response.data)
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.detail ||
              'Не удалось загрузить статистику. Проверь авторизацию и API.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStatistics()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="py-10 text-center text-slate-400">
        Загружаем статистику...
      </section>
    )
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-300"
      >
        {error}
      </section>
    )
  }

  if (!stats) return null

  const tickets = stats.tickets_by_movie ?? []
  const revenue = stats.revenue_by_day ?? []
  const occupancy = stats.seat_occupancy ?? []

  const totalTickets = tickets.reduce(
    (sum, movie) => sum + movie.tickets,
    0
  )

  const totalRevenue = revenue.reduce(
    (sum, day) => sum + day.revenue,
    0
  )

  const totalOccupied = occupancy.find(
    (item) => item.name === 'Занятые места'
  )?.value ?? 0

  const totalFree = occupancy.find(
    (item) => item.name === 'Свободные места'
  )?.value ?? 0

  const money = (value) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Аналитика кинотеатра
        </h1>
        <p className="mt-2 text-slate-400">
          Статистика продаж и загрузки залов
        </p>
      </div>

      {/* Краткие показатели */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Всего забронировано билетов
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {totalTickets}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Стоимость бронирований за 7 дней
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {money(totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Занятые места
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {totalOccupied}
          </p>
        </div>
      </div>

      {/* График 1: столбчатый */}
      <ChartCard title="Продажи билетов по фильмам">
        {tickets.length === 0 ? (
          <p className="text-slate-400">
            Пока нет бронирований.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tickets}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
              />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="tickets"
                name="Билеты"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* График 2: линейный */}
      <ChartCard title="Стоимость бронирований по дням">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenue}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              formatter={(value) => [money(Number(value)), 'Стоимость']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Стоимость бронирований"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* График 3: круговой */}
      <ChartCard title="Занятость мест">
        {totalOccupied + totalFree === 0 ? (
          <p className="text-slate-400">
            Нет данных о местах в сеансах.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={occupancy}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {occupancy.map((item, index) => (
                  <Cell
                    key={item.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}