
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { Sidebar } from '@/components/Sidebar'
import LaboratoriesPage, { SpecialistsPage } from '@/pages/LaboratoriesPage'


const DashboardLayout = () => (
  <div className="flex min-h-screen">
    {/* Sidebar ahora recibe el nombre de la clínica como prop */}
    <Sidebar />
    <main className="flex-1 bg-slate-50">
      <Outlet />
    </main>
  </div>
)

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        {/* Las rutas de laboratorios y especialistas se eliminan, ahora están en DashboardPage */}
        <Route path="patients" element={<div className="p-8 text-2xl font-semibold text-slate-700">Pacientes (próximamente)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
