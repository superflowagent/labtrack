import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchLaboratoryAccessByLaboratoryId, fetchLaboratoryJobs, fetchLaboratoryPatients } from '@/services/supabase/queries'
import { syncTenDayJobNotifications } from '@/services/supabase/notifications'
import type { Job, LaboratoryUser, Patient } from '@/types/domain'

const sortJobs = (items: Job[]) => {
    return items.slice().sort((left, right) => {
        const leftTime = left.order_date ? new Date(left.order_date).getTime() : 0
        const rightTime = right.order_date ? new Date(right.order_date).getTime() : 0
        return rightTime - leftTime
    })
}

export const useLaboratoryJobs = (laboratoryId: string, clinicName: string, laboratoryName: string) => {
    const [jobs, setJobs] = useState<Job[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [access, setAccess] = useState<LaboratoryUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [jobsData, patientsData, accessData] = await Promise.all([
                fetchLaboratoryJobs(laboratoryId),
                fetchLaboratoryPatients(laboratoryId),
                fetchLaboratoryAccessByLaboratoryId(laboratoryId),
            ])
            setJobs(sortJobs(jobsData))
            setPatients(patientsData)
            setAccess(accessData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudieron cargar los trabajos del laboratorio')
        } finally {
            setLoading(false)
        }
    }, [laboratoryId])

    useEffect(() => {
        void load()
    }, [load])

    useEffect(() => {
        if (!clinicName || !laboratoryName || jobs.length === 0) return

        const sync = () => {
            void syncTenDayJobNotifications({
                jobs,
                clinicName,
                laboratoryNamesById: { [laboratoryId]: laboratoryName },
            }).catch(() => { })
        }

        sync()
        const interval = window.setInterval(sync, 60000)
        return () => window.clearInterval(interval)
    }, [clinicName, jobs, laboratoryId, laboratoryName])

    const patientsById = useMemo(() => {
        const map: Record<string, Patient> = {}
        patients.forEach((patient) => {
            map[patient.id] = patient
        })
        return map
    }, [patients])

    const updateLocalJob = useCallback((job: Job) => {
        setJobs((current) => sortJobs([job, ...current.filter((item) => item.id !== job.id)]))
    }, [])

    return {
        jobs,
        patientsById,
        access,
        loading,
        error,
        reload: load,
        updateLocalJob,
    }
}