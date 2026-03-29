
import { useEffect } from 'react'
import { Navigate, Route, Routes, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import OgPreview from '@/pages/OgPreview'
import DashboardPage from '@/pages/DashboardPage'
import LaboratoryDashboardPage from '@/pages/LaboratoryDashboardPage'
import { Sidebar } from '@/components/Sidebar'
import AvisoLegalPage from '@/pages/AvisoLegalPage'
import PoliticaPrivacidadPage from '@/pages/PoliticaPrivacidadPage'
import CondicionesUsoPage from '@/pages/CondicionesUsoPage'
import PoliticaCookiesPage from '@/pages/PoliticaCookiesPage'
import { supabase } from '@/services/supabase/client'
import { useCurrentActor } from '@/hooks/useCurrentActor'
import { ActorContext } from '@/contexts/ActorContext'
import { Button } from '@/components/ui/button'
import { signOut } from '@/services/supabase/auth'


const DashboardHome = () => {
  const actor = useCurrentActor()

  useEffect(() => {
    if (!actor.actor) return
    window.actorDisplayName = actor.actor.displayName
    window.clinicName = actor.actor.displayName
    window.dispatchEvent(new Event('clinicNameChanged'))
  }, [actor.actor])

  if (actor.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Cargando acceso...</div>
  }

  if (actor.error || !actor.actor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">No se pudo abrir el dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">{actor.error || 'No tienes acceso disponible.'}</p>
          <Button className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-500" onClick={() => void signOut()}>
            Volver al acceso
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ActorContext.Provider value={actor.actor}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-slate-50 min-w-0 flex flex-col">
          {actor.actor.role === 'clinic' ? <DashboardPage /> : <LaboratoryDashboardPage />}
        </main>
      </div>
    </ActorContext.Provider>
  )
}

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
        <Route path="/dashboard" element={<DashboardHome />}>
          <Route index element={<Outlet />} />
          <Route path="patients" element={<Navigate to="/dashboard" replace />} />
          <Route path="patients/ajustes" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
