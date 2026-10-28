
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Sessions from './pages/Sessions'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
export default function App() {
  return (
    
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Публичные страницы */}
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
            <Route path="booking/:sessionId" element={<Booking />} />
          </Route>
          <Route path="sessions" element={<Sessions />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Страницы для вошедших пользователей */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Только для зрителя */}
          <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
            <Route path="my-bookings" element={<MyBookings />} />
          </Route>

          {/* Только для администратора */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="admin" element={<Admin />} />
            <Route path="admin/statistics" element={<AdminDashboard />} />
          </Route>

          <Route
            path="*"
            element={<h1 className="text-3xl font-bold">404 — Страница не найдена</h1>}
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>

  )
}
