import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Job, Laboratory, NewJob, Specialist } from '@/types/domain'
import { createJob, fetchJobs, fetchLaboratories, fetchSpecialists, getClinicIdForUser } from '@/services/supabase/queries'

export type JobFilters = {
  paciente: string
  laboratorioId: string
  fecha: string
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clinicId, setClinicId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const id = clinicId ?? (await getClinicIdForUser())
      setClinicId(id)
      const [jobsData, labsData, specialistsData] = await Promise.all([
        fetchJobs(id),
        fetchLaboratories(id),
        fetchSpecialists(id),
      ])
      setJobs(jobsData)
      setLabs(labsData)
      setSpecialists(specialistsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => {
    load()
  }, [load])

  const addJob = useCallback(
    async (payload: Omit<NewJob, 'clinic_id'>) => {
      if (!clinicId) {
        throw new Error('Clinica no disponible')
      }
      const created = await createJob({ ...payload, clinic_id: clinicId })
      setJobs((prev) => [created, ...prev])
      return created
    },
    [clinicId],
  )

  return useMemo(
    () => ({ jobs, labs, specialists, loading, error, reload: load, addJob }),
    [jobs, labs, specialists, loading, error, load, addJob],
  )
}
