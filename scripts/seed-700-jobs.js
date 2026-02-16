import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const CLINIC_ID = '20f51198-db4c-444f-a49d-08438717f253'
const BATCH_SIZE = 100
const TOTAL = 700
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

; (async () => {
    try {
        const env = loadEnvFile(path.resolve(process.cwd(), '.env.local'))
        const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        const anonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl) throw new Error('No SUPABASE URL found in .env.local or env')
        if (!serviceRoleKey && !anonKey) throw new Error('No Supabase key found in .env.local or env')

        // use service role key when available so script can create clinic/user if needed
        const keyToUse = serviceRoleKey || anonKey
        const supabase = createClient(supabaseUrl, keyToUse)

        console.log('Comprobando existencia de la clínica...', CLINIC_ID)
        const { data: existingClinic, error: clinicErr } = await supabase.from('clinics').select('id, user_id').eq('id', CLINIC_ID).maybeSingle()
        if (clinicErr) throw clinicErr

        let userIdForClinic = null

        if (!existingClinic) {
            console.log('Clínica no encontrada — buscando un user_id válido para crearla...')
            // try to reuse an existing clinic's user_id
            const { data: anyClinic } = await supabase.from('clinics').select('user_id').limit(1).maybeSingle()
            if (anyClinic?.user_id) userIdForClinic = anyClinic.user_id

            // fallback: profiles
            if (!userIdForClinic) {
                const { data: anyProfile } = await supabase.from('profiles').select('user_id').limit(1).maybeSingle()
                if (anyProfile?.user_id) userIdForClinic = anyProfile.user_id
            }

            // fallback: list auth users (requires service role key)
            if (!userIdForClinic && supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.listUsers === 'function') {
                const listRes = await supabase.auth.admin.listUsers()
                if (listRes && listRes.data && listRes.data.length > 0) userIdForClinic = listRes.data[0].id
            }

            // last resort: create a test user (service role key required)
            if (!userIdForClinic && supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
                console.log('No se encontró user existente — creando un user de prueba...')
                const newUser = await supabase.auth.admin.createUser({ email: 'seed-local@example.test', password: 'Passw0rd!' })
                if (newUser && newUser.user && newUser.user.id) userIdForClinic = newUser.user.id
            }

            if (!userIdForClinic) throw new Error('No se pudo determinar/crear un user_id para asociar a la clínica (se requiere una fila válida en auth.users).')

            console.log('Creando la clínica local con user_id:', userIdForClinic)
            const { data: createdClinic, error: createClinicErr } = await supabase.from('clinics').insert({ id: CLINIC_ID, name: 'Clinica (seed)', user_id: userIdForClinic }).select('*').single()
            if (createClinicErr) throw createClinicErr
            console.log('Clínica creada:', createdClinic.id)
        } else {
            console.log('La clínica ya existe; usando user_id:', existingClinic.user_id)
        }

        // ahora insertar trabajos en lotes
        console.log(`Generando ${TOTAL} trabajos de prueba (lotes de ${BATCH_SIZE})...`)
        let inserted = 0
        for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
            const batch = []
            const end = Math.min(start + BATCH_SIZE - 1, TOTAL)
            for (let i = start; i <= end; i++) {
                batch.push({
                    job_description: randomText(i),
                    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
                    clinic_id: CLINIC_ID,
                    order_date: randomDate(120, 30),
                    created_at: new Date().toISOString()
                })
            }

            const { data: res, error: insertErr } = await supabase.from('jobs').insert(batch).select('id')
            if (insertErr) throw insertErr
            inserted += (res?.length || 0)
            process.stdout.write(`Inserted ${inserted}/${TOTAL}\r`)
        }

        console.log('\nInserción completada. Haciendo una lectura para medir latencia...')
        const t0 = Date.now()
        const { data: jobs, error: fetchErr } = await supabase.from('jobs').select('id').eq('clinic_id', CLINIC_ID)
        const t1 = Date.now()
        if (fetchErr) throw fetchErr

        console.log(`Registros para clinic ${CLINIC_ID}: ${jobs?.length} — lectura en ${t1 - t0} ms`)
        console.log('Listo — actualiza la UI (Dashboard) para ver el efecto en la aplicación.')
        process.exit(0)
    } catch (err) {
        console.error('Error durante el seed:', err instanceof Error ? err.message : err)
        process.exit(1)
    }
})()
