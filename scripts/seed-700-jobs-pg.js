import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const CLINIC_ID = '20f51198-db4c-444f-a49d-08438717f253'
const TOTAL = 700
const BATCH_SIZE = 100
const STATUSES = [
    'En laboratorio',
    'En clinica (sin citar)',
    'En clinica (citado)',
    'Cerrado'
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

function randomText(i) {
    const samples = [
        'Analítica rutinaria',
        'PCR COVID',
        'Hemograma completo',
        'Prueba hormonal',
        'Perfil lipídico',
        'Cultivo bacteriológico',
        'Biometría',
        'Prueba rápida',
        'Electroforesis',
        'Control post-operatorio'
    ]
    return `${samples[i % samples.length]} — trabajo de prueba #${i}`
}

async function ensureClinicAndUser(client) {
    // check clinic
    const clinicRes = await client.query('SELECT id, user_id FROM clinics WHERE id = $1', [CLINIC_ID])
    if (clinicRes.rows.length > 0) return { exists: true }

    // try to reuse an existing user_id from clinics
    const anyClinic = await client.query('SELECT user_id FROM clinics LIMIT 1')
    if (anyClinic.rows.length > 0 && anyClinic.rows[0].user_id) {
        const userId = anyClinic.rows[0].user_id
        await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
        return { created: true, user_id: userId }
    }

    // try profiles
    const prof = await client.query('SELECT user_id FROM profiles LIMIT 1')
    if (prof.rows.length > 0 && prof.rows[0].user_id) {
        const userId = prof.rows[0].user_id
        await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
        return { created: true, user_id: userId }
    }

    // try auth.users
    const au = await client.query('SELECT id FROM auth.users LIMIT 1')
    if (au.rows.length > 0 && au.rows[0].id) {
        const userId = au.rows[0].id
        await client.query('INSERT INTO clinics (id, name, user_id, created_at) VALUES ($1, $2, $3, now())', [CLINIC_ID, 'Clinica (seed)', userId])
        return { created: true, user_id: userId }
    }

    // no user found — create a minimal auth.users row
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

    // sanity check table exists
    const tableCheck = await client.query("SELECT to_regclass('public.jobs') as jobs_tbl")
    if (!tableCheck.rows[0].jobs_tbl) throw new Error('Tabla public.jobs no encontrada en la BD local')

    // ensure clinic + possible user
    const clinicInfo = await ensureClinicAndUser(client)
    console.log('Clinic ensured:', clinicInfo)

    // insert jobs in batches using parameterized queries
    console.log(`Insertando ${TOTAL} trabajos (lotes de ${BATCH_SIZE})...`)
    let inserted = 0
    for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
        const rows = []
        const params = []
        let paramIdx = 1
        const end = Math.min(start + BATCH_SIZE - 1, TOTAL)
        for (let i = start; i <= end; i++) {
            const desc = randomText(i)
            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
            const orderDate = randomDate(120, 30)
            // push values for one row
            params.push(desc, status, CLINIC_ID, orderDate, new Date().toISOString())
            rows.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`)
        }

        const sql = `INSERT INTO jobs (job_description, status, clinic_id, order_date, created_at) VALUES ${rows.join(',')}`
        await client.query(sql, params)
        inserted += (end - start + 1)
        process.stdout.write(`Inserted ${inserted}/${TOTAL}\r`)
    }

    console.log('\nInsert completo. Midiendo lectura...')
    const t0 = Date.now()
    const res = await client.query('SELECT COUNT(*) FROM jobs WHERE clinic_id = $1', [CLINIC_ID])
    const t1 = Date.now()
    console.log(`Registros para clinic ${CLINIC_ID}: ${res.rows[0].count} — consulta COUNT en ${t1 - t0} ms`)

    // sample read latency retrieving rows
    const t2 = Date.now()
    const read = await client.query('SELECT id, order_date, status FROM jobs WHERE clinic_id = $1 ORDER BY order_date DESC LIMIT 1000', [CLINIC_ID])
    const t3 = Date.now()
    console.log(`SELECT 1000 rows (o fewer) en ${t3 - t2} ms — filas devueltas: ${read.rows.length}`)

    await client.end()
    console.log('Seed terminado. Actualiza el Dashboard para ver el efecto.')
}

run().catch((err) => {
    console.error('Error during PG seed:', err instanceof Error ? err.message : err)
    process.exit(1)
})
