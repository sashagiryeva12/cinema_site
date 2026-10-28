import { z } from 'zod'

export const emptyForm = {
  title: '',
  description: '',
  genre: '',
  duration: '',
  age_rating: '12+',
  poster_url: '',
  release_date: '',
}

export const movieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Введи название фильма.')
    .max(200, 'Название не должно превышать 200 символов.'),

  description: z
    .string()
    .trim()
    .min(1, 'Введи описание фильма.'),

  genre: z
    .string()
    .trim()
    .min(1, 'Введи жанр фильма.')
    .max(100, 'Жанр не должен превышать 100 символов.'),

  duration: z.coerce
    .number()
    .int('Длительность должна быть целым числом.')
    .min(1, 'Длительность должна быть не менее 1 минуты.'),

  age_rating: z.enum(
    ['0+', '6+', '12+', '16+', '18+'],
    { error: 'Выбери возрастной рейтинг.' }
  ),

  poster_url: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.url().safeParse(value).success,
      'Введи корректную ссылку на постер.'
    ),

  release_date: z.string(),
})