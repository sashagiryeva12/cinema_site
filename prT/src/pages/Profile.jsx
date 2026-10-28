
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
const { user } = useAuth()

return (
<section className="mx-auto max-w-2xl">
<div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
<h1 className="text-3xl font-bold">Профиль</h1>

    <p className="mt-2 text-slate-400">
      Информация о твоём аккаунте
    </p>

    {user ? (
      <div className="mt-8 space-y-5">
        <div>
          <p className="text-sm text-slate-400">Имя пользователя</p>
          <p className="mt-1 text-lg font-medium">
            {user.username || user.name || 'Не указано'}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">Email</p>
          <p className="mt-1 text-lg">
            {user.email || 'Не указан'}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">Роль</p>
          <span className="mt-2 inline-block rounded-lg bg-red-600/20 px-3 py-1 text-sm text-red-400">
            {user.role === 'admin' ? 'Администратор' : 'Зритель'}
          </span>
        </div>
      </div>
    ) : (
      <p className="mt-6 text-slate-400">
        Войди в аккаунт, чтобы увидеть информацию профиля.
      </p>
    )}
  </div>
</section>

)
}