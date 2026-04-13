import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Job, Laboratory, NewJob, Patient, Specialist } from '@/types/domain'
import { createJob, fetchJobs, fetchLaboratories, fetchPatients, fetchSpecialists, getClinicIdForUser } from '@/services/supabase/queries'
import { syncTenDayJobNotifications } from '@/services/supabase/notifications'

const sortJobs = (items: Job[]) => {
  return items.slice().sort((left, right) => {
    const leftTime = left.order_date ? new Date(left.order_date).getTime() : 0
    const rightTime = right.order_date ? new Date(right.order_date).getTime() : 0
    return rightTime - leftTime
  })
}

const sortPatients = (items: Patient[]) => {
  return items.slice().sort((left, right) => {
    const lastNameCompare = (left.lastname || '').localeCompare(right.lastname || '', 'es', { sensitivity: 'base' })
    if (lastNameCompare !== 0) return lastNameCompare
    return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' })
  })
}

const sortByName = <T extends { name: string }>(items: T[]) => {
  return items.slice().sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }))
}

export const useJobs = (clinicName: string) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clinicIdRef = useRef<string | null>(null)

  const resolveClinicId = useCallback(async () => {
    if (clinicIdRef.current) return clinicIdRef.current
    const clinicId = await getClinicIdForUser()
    clinicIdRef.current = clinicId
    return clinicId
  }, [])

  const updateLocalJob = useCallback((job: Job) => {
    setJobs((prevJobs) => sortJobs([job, ...prevJobs.filter((currentJob) => currentJob.id !== job.id)]))
  }, [])

  const upsertLocalJob = useCallback((job: Job) => {
    setJobs((prevJobs) => sortJobs([job, ...prevJobs.filter((currentJob) => currentJob.id !== job.id)]))
  }, [])

  const removeLocalJob = useCallback((jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))
  }, [])

  const upsertLocalLaboratory = useCallback((lab: Laboratory) => {
    setLabs((prevLabs) => sortByName([lab, ...prevLabs.filter((currentLab) => currentLab.id !== lab.id)]))
  }, [])

  const upsertLocalSpecialist = useCallback((specialist: Specialist) => {
    setSpecialists((prevSpecialists) => sortByName([specialist, ...prevSpecialists.filter((currentSpecialist) => currentSpecialist.id !== specialist.id)]))
  }, [])

  const upsertLocalPatient = useCallback((patient: Patient) => {
    setPatients((prevPatients) => sortPatients([patient, ...prevPatients.filter((currentPatient) => currentPatient.id !== patient.id)]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const id = await resolveClinicId()
      const [jobsData, labsData, specialistsData, patientsData] = await Promise.all([
        fetchJobs(id),
        fetchLaboratories(id),
        fetchSpecialists(id),
        fetchPatients(id),
      ])
      setJobs(sortJobs(jobsData))
      setLabs(sortByName(labsData))
      setSpecialists(sortByName(specialistsData))
      setPatients(sortPatients(patientsData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [resolveClinicId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!clinicName || jobs.length === 0 || labs.length === 0) return

    const laboratoryNamesById = Object.fromEntries(labs.map((lab) => [lab.id, lab.name]))

    const sync = () => {
      void syncTenDayJobNotifications({ jobs, clinicName, laboratoryNamesById }).catch(() => { })
    }

    sync()
    const interval = window.setInterval(sync, 60000)
    return () => window.clearInterval(interval)
  }, [clinicName, jobs, labs])

  const addJob = useCallback(
    async (payload: Omit<NewJob, 'clinic_id'>) => {
      const clinicId = await resolveClinicId()
      const created = await createJob({ ...payload, clinic_id: clinicId })
      upsertLocalJob(created)
      return created
    },
    [resolveClinicId, upsertLocalJob],
  )

  return useMemo(
    () => ({
      jobs,
      labs,
      specialists,
      patients,
      loading,
      error,
      reload: load,
      addJob,
      updateLocalJob,
      upsertLocalJob,
      removeLocalJob,
      upsertLocalLaboratory,
      upsertLocalSpecialist,
      upsertLocalPatient,
    }),
    [
      jobs,
      labs,
      specialists,
      patients,
      loading,
      error,
      load,
      addJob,
      updateLocalJob,
      upsertLocalJob,
      removeLocalJob,
      upsertLocalLaboratory,
      upsertLocalSpecialist,
      upsertLocalPatient,
    ],
  )
}
