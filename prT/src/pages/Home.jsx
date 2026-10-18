
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="py-20 text-center">
      <p className="mb-4 font-semibold uppercase tracking-widest text-red-400">
        Твой кинотеатр онлайн
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold md:text-6xl">
        Выбирай фильм. Бронируй место. Наслаждайся кино.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-slate-400">
        Изучай афишу, выбирай сеанс и бронируй билеты в несколько кликов.
      </p>
      <Link
        to="/movies"
        className="mt-8 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
      >
        Смотреть фильмы
      </Link>
    </section>
  )
}
