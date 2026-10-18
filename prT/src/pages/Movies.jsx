
import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('movies/')
      .then((response) => {
        const data = response.data
        setMovies(Array.isArray(data) ? data : data.results ?? [])
      })
      .catch(() => {
        setError('Не удалось загрузить фильмы. Проверь, запущен ли Django.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-slate-400">Загружаем фильмы...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Фильмы</h1>

      {movies.length === 0 ? (
        <p className="text-slate-400">Фильмов пока нет.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <article
              key={movie.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <h2 className="text-xl font-semibold">
                {movie.title ?? movie.name ?? `Фильм №${movie.id}`}
              </h2>

              {movie.description && (
                <p className="mt-3 text-sm text-slate-400">
                  {movie.description}
                </p>
              )}

              {movie.duration && (
                <p className="mt-3 text-sm text-slate-300">
                  Продолжительность: {movie.duration} мин.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
