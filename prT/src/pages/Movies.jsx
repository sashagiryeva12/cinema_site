
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../api/client'
import MovieCard from '../components/MovieCard'
import { setSearch, setGenre } from '../store/filtersSlice'

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dispatch = useDispatch()
  const { search, genre } = useSelector((state) => state.filters)

  useEffect(() => {
    let active = true

    api.get('movies/')
      .then((response) => {
        if (!active) return
        const data = response.data
        setMovies(Array.isArray(data) ? data : data.results ?? [])
      })
      .catch(() => {
        if (active) {
          setError('Не удалось загрузить фильмы. Проверь, запущен ли Django.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const genres = useMemo(() => {
    return [...new Set(movies.map((movie) => movie.genre).filter(Boolean))]
  }, [movies])

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase()

    return movies.filter((movie) => {
      const matchesSearch = (movie.title || '')
        .toLowerCase()
        .includes(query)

      const matchesGenre =
        genre === 'all' || movie.genre === genre

      return matchesSearch && matchesGenre
    })
  }, [movies, search, genre])

  if (loading) {
    return <p className="text-slate-400">Загружаем фильмы...</p>
  }

  if (error) {
    return <p role="alert" className="text-red-400">{error}</p>
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Фильмы</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <input
          type="search"
          value={search}
          onChange={(event) => dispatch(setSearch(event.target.value))}
          placeholder="Поиск по названию..."
          aria-label="Поиск фильмов"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        />

        <select
          value={genre}
          onChange={(event) => dispatch(setGenre(event.target.value))}
          aria-label="Фильтр по жанру"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"
        >
          <option value="all">Все жанры</option>
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {filteredMovies.length === 0 ? (
        <p className="text-slate-400">
          {movies.length === 0
            ? 'Фильмов пока нет.'
            : 'По выбранным фильтрам фильмы не найдены.'}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}
