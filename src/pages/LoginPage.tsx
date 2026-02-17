import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { supabase } from '@/services/supabase/client'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === '1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translateAuthError = (msg: string) => {
    if (!msg) return 'Error de autenticación'
    const m = msg.toLowerCase()

    if (m.includes('invalid login') || m.includes('invalid email') || m.includes('invalid credentials') || m.includes('invalid password')) {
      return 'Credenciales inválidas'
    }

    if (m.includes('password') && (m.includes('at least') || m.includes('minimum') || m.includes('min') || m.includes('should be at least'))) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }

    if (m.includes('already registered') || m.includes('user exists') || m.includes('email already in use')) {
      return 'El usuario ya está registrado'
    }

    if (m.includes('user not found') || m.includes('no user') || m.includes('not found')) {
      return 'Usuario no encontrado'
    }

    if (m.includes('email not confirmed') || m.includes('confirm')) {
      return 'Email no confirmado'
    }

    if (m.includes('invalid token') || m.includes('expired token') || m.includes('token is')) {
      return 'Token inválido o expirado'
    }

    if (m.includes('too many requests') || m.includes('rate limit')) {
      return 'Demasiadas solicitudes, inténtalo más tarde'
    }

    if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
      return 'Error de red. Revisa tu conexión.'
    }

    if (m.includes('unauthorized') || m.includes('not authorized')) {
      return 'No autorizado'
    }

    if (m.includes('forbidden')) {
      return 'Acceso denegado'
    }

    if (m.includes('session has expired') || m.includes('expired')) {
      return 'Sesión expirada, vuelve a iniciar sesión'
    }

    if (m.includes('invalid input') || m.includes('validation') || m.includes('bad request')) {
      return 'Datos inválidos'
    }

    return msg
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        if (!data.user) throw new Error('No se pudo crear el usuario')

        // create clinic and start a local 30-day trial immediately (Stripe remains source-of-truth for paid subs)
        const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const { error: clinicError } = await supabase.from('clinics').insert({
          name: clinicName,
          user_id: data.user.id,
          subscription_status: 'trialing',
          stripe_trial_end: trialEnd,
        })
        if (clinicError) throw clinicError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }

      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(translateAuthError(message) || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-background dark:text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <Logo centered />
        <Card className="relative mt-8 w-full max-w-lg border-slate-200 bg-white/80 p-8 text-slate-900 shadow-xl dark:bg-card dark:border-border dark:text-foreground">
          <Button asChild variant="ghost" size="sm" className="absolute right-4 top-4 text-slate-600 dark:text-slate-300">
            <Link to="/" className="flex items-center gap-2 justify-end">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isRegister ? 'Crear cuenta' : 'Acceso'}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {isRegister && 'Registra tu clínica y empieza a trackear órdenes de trabajo.'}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@clínica.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? 'Mínimo 6 caracteres' : '******'}
                required
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="clinic" className="text-slate-700 dark:text-slate-200">
                  Nombre de la clínica
                </Label>
                <Input
                  id="clinic"
                  autoComplete="organization"
                  value={clinicName}
                  onChange={(event) => setClinicName(event.target.value)}
                  placeholder="Clínica Central"
                  required
                />
              </div>
            )}

            {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}

            <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-500" disabled={loading}>
              {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Tu clínica aún no está registrada?'}{' '}
            <button
              type="button"
              className="text-teal-700 hover:text-teal-500 dark:text-teal-300 dark:hover:text-teal-200"
              onClick={() => setIsRegister((prev) => !prev)}
            >
              {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
