import AdminMovieCard from '../components/admin/AdminMovieCard'
import AdminSessions from '../components/admin/AdminSessions'
import MovieForm from '../components/admin/MovieForm'
import useAdminMovies from '../hooks/useAdminMovies'
import useMovieForm from '../hooks/useMovieForm'
import { useEffect, useMemo, useState } from 'react'
import {
  Film,
  PlusCircle,
  RefreshCw,
} from 'lucide-react'


export default function Admin() {
  const {
      movies,
      loading,
      error,
      setError,
      notice,
      setNotice,
      loadMovies,
      handleDelete,
    } = useAdminMovies()
    
  const {
      editingId,
      formOpen,
      register,
      handleSubmit,
      formErrors,
      isSubmitting,
      openCreateForm,
      openEditForm,
      closeForm,
      onSubmit,
    } = useMovieForm({loadMovies,setError,setNotice,})

    const [search, setSearch] = useState('')
    const filteredMovies = useMemo(() => {
      const query = search.trim().toLowerCase()

      return movies.filter((movie) =>
        (movie.title || '').toLowerCase().includes(query)
      )
    }, [movies, search])

    useEffect(() => {
      loadMovies()
    }, [loadMovies])

  
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
          <MovieForm
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            editingId={editingId}
            closeForm={closeForm}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
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