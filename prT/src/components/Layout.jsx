

import { Link, Outlet, useNavigate } from 'react-router-dom'
import AuthButton from './AuthButton'
import { useAuth } from '../hooks/useAuth'
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="text-2xl font-bold text-red-500">
            Cinema
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-sm">
            <Link to="/" className="hover:text-red-400">Главная</Link>
            <Link to="/movies" className="hover:text-red-400">Фильмы</Link>
            <Link to="/sessions" className="hover:text-red-400">
              Сеансы
            </Link>
            {user?.role === 'viewer' && (
            <Link to="/my-bookings" className="hover:text-red-400">
              Мои билеты
            </Link>
            )}
            <Link to="/profile" className="hover:text-red-400">Профиль</Link>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="hover:text-red-400">
                  Админ-панель
                </Link>

                <Link
                  to="/admin/statistics"
                  className="hover:text-orange-400"
                >
                  Статистика
                </Link>
              </>
            )}
            {user ? (
              <button onClick={async () => {
                 await logout()
                  navigate('/login')
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 hover:border-red-500 hover:text-red-400">
                Выйти
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                Войти
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-800 px-6 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Cinema. Бронируй кино онлайн.
      </footer>
    </div>
  )
}
