import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { supabase } from '@/services/supabase/client'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

        const { error: clinicError } = await supabase.from('clinics').insert({
          name: clinicName,
          user_id: data.user.id,
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
      setError(err instanceof Error ? err.message : 'Error de autenticacion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-background dark:text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <Logo />
        <Card className="mt-8 w-full max-w-lg border-slate-200 bg-white/80 p-8 text-slate-900 shadow-xl dark:bg-card dark:border-border dark:text-foreground">
          <h1 className="text-2xl font-semibold">{isRegister ? 'Crear cuenta' : 'Acceso'}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {isRegister && 'Registra tu clinica y empieza a gestionar tus trabajos.'}
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
                placeholder="nombre@clinica.com"
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
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="clinic" className="text-slate-700 dark:text-slate-200">
                  Nombre de la clinica
                </Label>
                <Input
                  id="clinic"
                  autoComplete="organization"
                  value={clinicName}
                  onChange={(event) => setClinicName(event.target.value)}
                  placeholder="Clinica Central"
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
            {isRegister ? 'Ya tienes cuenta?' : 'Aun no tienes cuenta?'}{' '}
            <button
              type="button"
              className="text-teal-700 hover:text-teal-500 dark:text-teal-300 dark:hover:text-teal-200"
              onClick={() => setIsRegister((prev) => !prev)}
            >
              {isRegister ? 'Iniciar sesion' : 'Crear cuenta'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
