import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

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

function randomPhone() {
  const n = Math.floor(600000000 + Math.random() * 300000000)
  return String(n)
}

function randomName(i) {
  const first = ['Ana', 'Luis', 'María', 'Javier', 'Sofía', 'Carlos', 'Lucía', 'Miguel', 'Elena', 'Pablo', 'Carmen', 'Diego', 'Marta', 'Raúl', 'Clara', 'Andrés', 'Isabel', 'Sergio', 'Noelia', 'Alberto']
  const last = ['García', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Diaz', 'Ramírez']
  return `${first[i % first.length]} ${last[i % last.length]}`
}

async function ensureClinicAndUser(client) {
  const clinicRes = await client.query('SELECT id, user_id FROM clinics WHERE id = $1', [CLINIC_ID])
  if (clinicRes.rows.length > 0) return { exists: true }

  const anyClinic = await client.query('SELECT user_id FROM clinics LIMIT 1')
  if (anyClinic.rows.length > 0 && anyClinic.rows[0].user_id) {
    const userId = anyClinic.rows[0].user_id
    await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
    return { created: true, user_id: userId }
  }

  const prof = await client.query('SELECT user_id FROM profiles LIMIT 1')
  if (prof.rows.length > 0 && prof.rows[0].user_id) {
    const userId = prof.rows[0].user_id
    await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
    return { created: true, user_id: userId }
  }

  const au = await client.query('SELECT id FROM auth.users LIMIT 1')
  if (au.rows.length > 0 && au.rows[0].id) {
    const userId = au.rows[0].id
    await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
    return { created: true, user_id: userId }
  }

  const newUserId = randomUUID()
  try {
    await client.query(
      `INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data, created_at)
       VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, now())`,
      [newUserId, 'seed-local@example.test']
    )
    await client.query('INSERT INTO profiles (user_id, name, created_at) VALUES ($1, $2, now())', [newUserId, 'Seed user'])
    await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', newUserId])
    return { created: true, user_id: newUserId, created_user: true }
  } catch (err) {
    throw new Error('No existen usuarios y la creación automática de auth.users falló. Crea un usuario o usa otra clínica.')
  }
}

async function run() {
  const env = loadEnvFile(path.resolve(process.cwd(), '.env.local'))
  const POSTGRES_URL = process.env.POSTGRES_URL || env.POSTGRES_URL || 'postgres://postgres:postgres@127.0.0.1:54330/postgres'

  const client = new Client({ connectionString: POSTGRES_URL })
  await client.connect()
  console.log('Conectado a Postgres:', POSTGRES_URL)

  // sanity check tables
  const tJobs = await client.query("SELECT to_regclass('public.jobs') as jobs_tbl")
  const tPatients = await client.query("SELECT to_regclass('public.patients') as patients_tbl")
  if (!tJobs.rows[0].jobs_tbl) throw new Error('Tabla public.jobs no encontrada')
  if (!tPatients.rows[0].patients_tbl) throw new Error('Tabla public.patients no encontrada')

  // ensure clinic exists
  const clinicInfo = await ensureClinicAndUser(client)
  console.log('Clinic ensured:', clinicInfo)

  // Insert patients in one batch
  console.log(`Insertando ${NUM_PATIENTS} pacientes en clinic ${CLINIC_ID}...`)
  const patientParams = []
  const patientRows = []
  let pIdx = 1
  for (let i = 1; i <= NUM_PATIENTS; i++) {
    const name = randomName(i)
    const phone = randomPhone()
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '.')}.${i}@example.test`
    const code = `P${String(i).padStart(3, '0')}`
    patientParams.push(CLINIC_ID, name, phone, email, code, new Date().toISOString())
    patientRows.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`)
  }
  const patientSql = `INSERT INTO patients (clinic_id, name, phone, email, code, created_at) VALUES ${patientRows.join(',')} RETURNING id` 
  const patientRes = await client.query(patientSql, patientParams)
  const patientIds = patientRes.rows.map(r => r.id)
  console.log(`Pacientes insertados: ${patientIds.length}`)

  if (patientIds.length === 0) throw new Error('No se insertaron pacientes; abortando')

  // Insert jobs referencing the new patients
  console.log(`Insertando ${NUM_JOBS} trabajos para clinic ${CLINIC_ID}...`)
  let inserted = 0
  for (let start = 1; start <= NUM_JOBS; start += BATCH_SIZE) {
    const rows = []
    const params = []
    let idx = 1
    const end = Math.min(start + BATCH_SIZE - 1, NUM_JOBS)
    for (let i = start; i <= end; i++) {
      const desc = `Trabajo demo #${i} - ${['Prótesis','Corona','Puente','Incrustación','Ortodoncia'][i % 5]}`
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
      const orderDate = randomDate(120, 30)
      const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
      params.push(desc, status, CLINIC_ID, orderDate, patientId, new Date().toISOString())
      rows.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`)
    }
    const sql = `INSERT INTO jobs (job_description, status, clinic_id, order_date, patient_id, created_at) VALUES ${rows.join(',')}`
    await client.query(sql, params)
    inserted += (end - start + 1)
    process.stdout.write(`Inserted jobs: ${inserted}/${NUM_JOBS}\r`)
  }

  console.log('\nInserción completada.')
  const res = await client.query('SELECT COUNT(*)::int FROM jobs WHERE clinic_id = $1', [CLINIC_ID])
  console.log(`Total trabajos para clinic ${CLINIC_ID}: ${res.rows[0].count}`)

  await client.end()
  console.log('Seed finalizado. Refresca el Dashboard.')
}

run().catch((err) => {
  console.error('Error during PG seed:', err instanceof Error ? err.message : err)
  process.exit(1)
})