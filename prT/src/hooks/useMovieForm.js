
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../api/client'
import { emptyForm, movieSchema } from '../schemas/movieSchema'
import { getErrorMessage } from './useAdminMovies'

export default function useMovieForm({
  loadMovies,
  setError,
  setNotice,
}) {
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors: formErrors, isSubmitting },
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: emptyForm,
  })

  const openCreateForm = useCallback(() => {
    setEditingId(null)
    reset({ ...emptyForm })
    clearErrors()
    setError('')
    setNotice('')
    setFormOpen(true)
  }, [reset, clearErrors, setError, setNotice])

  const openEditForm = useCallback((movie) => {
    setEditingId(movie.id)

    reset({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      duration: String(movie.duration ?? ''),
      age_rating: movie.age_rating || '12+',
      poster_url: movie.poster_url || '',
      release_date: movie.release_date || '',
    })

    clearErrors()
    setError('')
    setNotice('')
    setFormOpen(true)
  }, [reset, clearErrors, setError, setNotice])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingId(null)
    reset({ ...emptyForm })
    clearErrors()
  }, [reset, clearErrors])

  const onSubmit = async (form) => {
    setError('')
    setNotice('')
    clearErrors('root')

    const payload = {
      ...form,
      duration: Number(form.duration),
      poster_url: form.poster_url || '',
      release_date: form.release_date || null,
    }

    try {
      if (editingId !== null) {
        await api.patch(`movies/${editingId}/`, payload)
        setNotice('Фильм успешно обновлён.')
      } else {
        await api.post('movies/', payload)
        setNotice('Фильм успешно добавлен.')
      }

      closeForm()
      await loadMovies()
    } catch (err) {
      const data = err.response?.data
      const fields = [
        'title',
        'description',
        'genre',
        'duration',
        'age_rating',
        'poster_url',
        'release_date',
      ]

      let hasFieldError = false

      if (data && typeof data === 'object') {
        for (const field of fields) {
          if (data[field]) {
            const message = Array.isArray(data[field])
              ? data[field].join(', ')
              : String(data[field])

            setFormError(field, {
              type: 'server',
              message,
            })

            hasFieldError = true
          }
        }
      }

      if (hasFieldError) {
        setError(
          'Некоторые данные не приняты сервером. Проверь ошибки в форме.'
        )
      } else {
        setFormError('root.server', {
          type: 'server',
          message: getErrorMessage(err),
        })
      }
    }
  }

  return {
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
  }
}
