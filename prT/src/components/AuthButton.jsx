
import { useNavigate } from 'react-router-dom'

export default function AuthButton() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('access'))

  function handleLogout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login', { replace: true })
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-slate-700 px-4 py-2 hover:border-red-500 hover:text-red-400"
    >
      Выйти
    </button>
  )
}
