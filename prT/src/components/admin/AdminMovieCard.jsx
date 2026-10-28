import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

function AdminMovieCard({ movie, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <h3 className="text-xl font-semibold">{movie.title}</h3>

      <p className="mt-2 text-sm text-slate-400">
        {movie.genre} · {movie.duration} мин. · {movie.age_rating}
      </p>

      <p className="mt-3 whitespace-pre-line text-slate-300">
        {movie.description}
      </p>

      {movie.release_date && (
        <p className="mt-2 text-sm text-slate-500">
          Дата выхода: {movie.release_date}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(movie)}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700"
        >
          <Pencil size={16} />
          Изменить
        </button>

        <button
          onClick={() => onDelete(movie)}
          className="flex items-center gap-2 rounded-lg bg-red-950 px-3 py-2 text-red-300 hover:bg-red-900"
        >
          <Trash2 size={16} />
          Удалить
        </button>
      </div>
    </article>
  )
}

export default memo(AdminMovieCard)