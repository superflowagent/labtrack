// Quick test of DashboardPage jobs filtering logic
const patients = [
    { id: 'p1', name: 'Galiera', code: '00-01' },
    { id: 'p2', name: 'a', code: null },
]

const jobs = [
    { id: 'j1', patient_id: 'p2', job_description: 'asd', laboratory_id: null, specialist_id: null, order_date: null, status: 'En laboratorio' },
    { id: 'j2', patient_id: 'p1', job_description: 'corona', laboratory_id: 'lab1', specialist_id: 's1', order_date: '2026-02-15', status: 'En clinica (citado)' },
]

function filterJobs(filters) {
    return jobs.filter((job) => {
        const patient = patients.find((p) => p.id === job.patient_id)
        const query = filters.paciente?.toLowerCase() ?? ''
        const matchPaciente = query
            ? ((patient?.name?.toLowerCase() || '').includes(query) || (patient?.code?.toLowerCase() || '').includes(query))
            : true
        const matchLab = filters.laboratorioId !== 'all' ? job.laboratory_id === filters.laboratorioId : true
        const matchEstado = filters.estado !== 'all' ? job.status === filters.estado : job.status !== 'Cerrado'
        return matchPaciente && matchLab && matchEstado
    })
}

console.log('--- test: exact code "00-01"')
console.log(filterJobs({ paciente: '00-01', laboratorioId: 'all', estado: 'all' }))

console.log('\n--- test: partial code "00"')
console.log(filterJobs({ paciente: '00', laboratorioId: 'all', estado: 'all' }))

console.log('\n--- test: name match "galiera"')
console.log(filterJobs({ paciente: 'galiera', laboratorioId: 'all', estado: 'all' }))

console.log('\n--- test: name mismatch with different estado (Cerrado)')
console.log(filterJobs({ paciente: 'galiera', laboratorioId: 'all', estado: 'Cerrado' }))
