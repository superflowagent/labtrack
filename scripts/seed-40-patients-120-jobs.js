import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Target clinic ID (from user request)
const CLINIC_ID = 'eecd15d7-aa78-477f-a9d7-97c598f19c39'
const NUM_PATIENTS = 40
const NUM_JOBS = 120
const BATCH_SIZE = 50
const STATUSES = [
  'En laboratorio',
  'En clinica (sin citar)',
  'En clinica (citado)',
  'Cerrado',
]

function loadEnvFile(envPath) {
  const txt = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  const obj = {}
  txt.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/)
    if (m) obj[m[1]] = m[2]
  })
  return obj
}

function randomDate(daysBack = 90, daysForward = 30) {
  const now = Date.now()
  const start = now - Math.floor(Math.random() * daysBack * 24 * 3600 * 1000)
  const end = now + Math.floor(Math.random() * daysForward * 24 * 3600 * 1000)
  return new Date(start + Math.floor(Math.random() * (end - start))).toISOString()
}

function sampleJob(i) {
  const samples = [
    'Prótesis fija',
    'Corona cerámica',
    'Puente anterior',
    'Incrustación',
    'Prótesis parcial',
    'Ortodoncia - retenedor',
    'Blanqueamiento',
    'Implante provisional',
    'Revisión oclusal',
    'Ajuste proximal'
  ]
  return `${samples[i % samples.length]} — trabajo demo #${i}`
}

function randomPhone() {
  const n = Math.floor(600000000 + Math.random() * 300000000)
  return String(n)
}

function makeEmail(name, idx) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '.')
  return `${slug}.${idx}@example.test`
}

function randomName(i) {
  const first = ['Ana', 'Luis', 'María', 'Javier', 'Sofía', 'Carlos', 'Lucía', 'Miguel', 'Elena', 'Pablo', 'Carmen', 'Diego', 'Marta', 'Raúl', 'Clara', 'Andrés', 'Isabel', 'Sergio', 'Noelia', 'Alberto']
  const last = ['García', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Diaz', 'Ramírez']
  return `${first[i % first.length]} ${last[i % last.length]}`
}

;(async () => {
  try {
    const env = loadEnvFile(path.resolve(process.cwd(), '.env.local'))
    const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl) throw new Error('No SUPABASE URL found in .env.local or env')
    if (!serviceRoleKey && !anonKey) throw new Error('No Supabase key found in .env.local or env')

    const keyToUse = serviceRoleKey || anonKey
    const supabase = createClient(supabaseUrl, keyToUse)

    console.log('Comprobando existencia de la clínica...', CLINIC_ID)
    const { data: existingClinic, error: clinicErr } = await supabase.from('clinics').select('id, user_id').eq('id', CLINIC_ID).maybeSingle()
    if (clinicErr) throw clinicErr
    if (!existingClinic) {
      throw new Error(`Clinic ${CLINIC_ID} no encontrada en la BBDD. Por favor, crea la clínica primero.`)
    }

    // --- Insert patients ---
    console.log(`Insertando ${NUM_PATIENTS} pacientes en clinic ${CLINIC_ID}...`)
    const patients = []
    for (let i = 1; i <= NUM_PATIENTS; i++) {
      const name = randomName(i)
      patients.push({
        clinic_id: CLINIC_ID,
        name,
        phone: randomPhone(),
        email: makeEmail(name, i),
        code: `P${String(i).padStart(3, '0')}`,
        created_at: new Date().toISOString()
      })
    }

    const { data: insertedPatients, error: insertPatientsErr } = await supabase.from('patients').insert(patients).select('id')
    if (insertPatientsErr) throw insertPatientsErr
    const patientIds = (insertedPatients || []).map(p => p.id)
    console.log(`Pacientes insertados: ${patientIds.length}`)

    if (patientIds.length === 0) throw new Error('No se insertaron pacientes; abortando.')

    // --- Insert jobs referencing patients ---
    console.log(`Insertando ${NUM_JOBS} trabajos en clinic ${CLINIC_ID}...`)
    let insertedJobs = 0
    for (let start = 1; start <= NUM_JOBS; start += BATCH_SIZE) {
      const batch = []
      const end = Math.min(start + BATCH_SIZE - 1, NUM_JOBS)
      for (let i = start; i <= end; i++) {
        const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
        batch.push({
          patient_id: patientId,
          job_description: sampleJob(i),
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
          clinic_id: CLINIC_ID,
          order_date: randomDate(120, 30),
          created_at: new Date().toISOString()
        })
      }
      const { data: res, error: insertErr } = await supabase.from('jobs').insert(batch).select('id')
      if (insertErr) throw insertErr
      insertedJobs += (res?.length || 0)
      process.stdout.write(`Inserted jobs: ${insertedJobs}/${NUM_JOBS}\r`)
    }
    console.log('\nInserción de trabajos completada.')

    const { data: jobsCount } = await supabase.from('jobs').select('id').eq('clinic_id', CLINIC_ID)
    console.log(`Total trabajos para clinic ${CLINIC_ID}: ${jobsCount?.length}`)

    console.log('Seed finalizado. Refresca el Dashboard para ver los nuevos datos.')
    process.exit(0)
  } catch (err) {
    console.error('Error durante el seed:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
})()
