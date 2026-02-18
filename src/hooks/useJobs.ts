import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Job, Laboratory, NewJob, Patient, Specialist } from '@/types/domain'
import { createJob, fetchJobs, fetchLaboratories, fetchPatients, fetchSpecialists, getClinicIdForUser } from '@/services/supabase/queries'

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  // Permite actualizar el estado de un trabajo localmente (optimista)
  const updateLocalJobStatus = useCallback((jobId: string, status: Job["status"]) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status } : job
      )
    )
  }, [])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clinicId, setClinicId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const id = clinicId ?? (await getClinicIdForUser())
      setClinicId(id)
      const [jobsData, labsData, specialistsData, patientsData] = await Promise.all([
        fetchJobs(id),
        fetchLaboratories(id),
        fetchSpecialists(id),
        fetchPatients(id),
      ])
      setJobs(jobsData)
      setLabs(labsData)
      setSpecialists(specialistsData)
      setPatients(patientsData)
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
        throw new Error('Clínica no disponible')
      }
      const created = await createJob({ ...payload, clinic_id: clinicId })
      setJobs((prev) => [created, ...prev])
      return created
    },
    [clinicId],
  )


  return useMemo(
    () => ({ jobs, labs, specialists, patients, loading, error, reload: load, addJob, updateLocalJobStatus }),
    [jobs, labs, specialists, patients, loading, error, load, addJob, updateLocalJobStatus],
  )
}
