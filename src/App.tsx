
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import OgPreview from '@/pages/OgPreview'
import DashboardPage from '@/pages/DashboardPage'
import { Sidebar } from '@/components/Sidebar'
import AvisoLegalPage from '@/pages/AvisoLegalPage'
import PoliticaPrivacidadPage from '@/pages/PoliticaPrivacidadPage'
import CondicionesUsoPage from '@/pages/CondicionesUsoPage'
import PoliticaCookiesPage from '@/pages/PoliticaCookiesPage'


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
      <Route path="/og" element={<OgPreview />} />
      <Route path="/aviso-legal" element={<AvisoLegalPage />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />
      <Route path="/condiciones-uso" element={<CondicionesUsoPage />} />
      <Route path="/politica-cookies" element={<PoliticaCookiesPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<Navigate to="/dashboard" replace />} />
        <Route path="patients/ajustes" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
