import { X } from 'lucide-react'
export default function MovieForm({
  register,
  handleSubmit,
  onSubmit,
  editingId,
  closeForm,
  formErrors,
  isSubmitting,
}) {
  return (
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
          <span className="text-sm text-slate-300">Название *</span>
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
          <span className="text-sm text-slate-300">Жанр *</span>
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
          <span className="text-sm text-slate-300">Дата выхода</span>
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
          <span className="text-sm text-slate-300">Ссылка на постер</span>
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
        <span className="text-sm text-slate-300">Описание *</span>
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
  )
}
