
import { useEffect } from 'react'
import { Navigate, Route, Routes, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import OgPreview from '@/pages/OgPreview'
import DashboardPage from '@/pages/DashboardPage'
import { Sidebar } from '@/components/Sidebar'
import AvisoLegalPage from '@/pages/AvisoLegalPage'
import PoliticaPrivacidadPage from '@/pages/PoliticaPrivacidadPage'
import CondicionesUsoPage from '@/pages/CondicionesUsoPage'
import PoliticaCookiesPage from '@/pages/PoliticaCookiesPage'
import { supabase } from '@/services/supabase/client'


const DashboardLayout = () => (
  <div className="flex flex-col md:flex-row min-h-screen">
    {/* Sidebar ahora recibe el nombre de la clínica como prop */}
    <Sidebar />
    <main className="flex-1 bg-slate-50 min-w-0 flex flex-col">
      <Outlet />
    </main>
  </div>
)

const AuthRecoveryHandler = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
    if (!hash) return

    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const errorDescription = params.get('error_description')

    if (type !== 'recovery') return

    if (errorDescription) {
      navigate(`/login?recovery=1&error=${encodeURIComponent(errorDescription)}`, { replace: true })
      return
    }

    if (!accessToken || !refreshToken) {
      navigate('/login?recovery=1&error=Enlace%20de%20recuperaci%C3%B3n%20inv%C3%A1lido', { replace: true })
      return
    }

    void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          navigate(`/login?recovery=1&error=${encodeURIComponent(error.message)}`, { replace: true })
          return
        }

        navigate('/login?recovery=1', { replace: true })
      })
  }, [location.hash, navigate])

  return null
}

const App = () => {
  return (
    <>
      <AuthRecoveryHandler />
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
    </>
  )
}

export default App
