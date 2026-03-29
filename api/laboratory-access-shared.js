import { createClient } from '@supabase/supabase-js'

function parseBody(body) {
    if (!body) return {}
    if (typeof body === 'string') {
        try {
            return JSON.parse(body)
        } catch {
            return {}
        }
    }
    return body
}

function getToken(req) {
    const header = req.headers?.authorization || req.headers?.Authorization
    if (!header || Array.isArray(header)) return null
    const [scheme, token] = header.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null
    return token
}

function createAdminClient() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Server misconfigured')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

async function resolveClinicActor(supabase, token) {
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authData.user) {
        throw new Error('No autorizado')
    }

    const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name')
        .eq('user_id', authData.user.id)
        .single()

    if (clinicError || !clinic) {
        throw new Error('Solo una clínica puede gestionar accesos de laboratorio')
    }

    return clinic
}

async function requireLaboratoryForClinic(supabase, clinicId, laboratoryId) {
    const { data: laboratory, error } = await supabase
        .from('laboratories')
        .select('id, name, clinic_id')
        .eq('id', laboratoryId)
        .eq('clinic_id', clinicId)
        .single()

    if (error || !laboratory) {
        throw new Error('Laboratorio no encontrado')
    }

    return laboratory
}

async function getLaboratoryAccess(supabase, laboratoryId) {
    const { data, error } = await supabase
        .from('laboratory_users')
        .select('id, clinic_id, laboratory_id, user_id, email, is_active, created_at, updated_at')
        .eq('laboratory_id', laboratoryId)
        .maybeSingle()

    if (error) throw error
    return data
}

export async function handleLaboratoryAccessRequest(req, res) {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const token = getToken(req)
    if (!token) {
        return res.status(401).json({ error: 'Missing Authorization header' })
    }

    try {
        const supabase = createAdminClient()
        const clinic = await resolveClinicActor(supabase, token)
        const body = parseBody(req.body)
        const laboratoryId = typeof body.laboratoryId === 'string' ? body.laboratoryId : ''

        if (!laboratoryId) {
            return res.status(400).json({ error: 'laboratoryId is required' })
        }

        await requireLaboratoryForClinic(supabase, clinic.id, laboratoryId)

        if (req.method === 'POST') {
            const email = typeof body.email === 'string' ? body.email.trim() : ''
            const password = typeof body.password === 'string' ? body.password : ''

            if (!email) return res.status(400).json({ error: 'El email es obligatorio' })
            if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })

            const existingAccess = await getLaboratoryAccess(supabase, laboratoryId)
            if (existingAccess) {
                return res.status(409).json({ error: existingAccess.is_active ? 'Ese laboratorio ya tiene acceso.' : 'Ese laboratorio ya tiene un acceso creado. Reactívalo desde la clínica.' })
            }

            const { data: userData, error: createUserError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    app_role: 'laboratory',
                    clinic_id: clinic.id,
                    laboratory_id: laboratoryId,
                },
            })

            if (createUserError || !userData.user) {
                return res.status(400).json({ error: createUserError?.message || 'No se pudo crear el usuario del laboratorio' })
            }

            const { data: access, error: accessError } = await supabase
                .from('laboratory_users')
                .insert({
                    clinic_id: clinic.id,
                    laboratory_id: laboratoryId,
                    user_id: userData.user.id,
                    email,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                })
                .select('id, clinic_id, laboratory_id, user_id, email, is_active, created_at, updated_at')
                .single()

            if (accessError || !access) {
                await supabase.auth.admin.deleteUser(userData.user.id)
                return res.status(400).json({ error: accessError?.message || 'No se pudo guardar el acceso del laboratorio' })
            }

            return res.status(200).json({ access })
        }

        const isActive = Boolean(body.isActive)
        const existingAccess = await getLaboratoryAccess(supabase, laboratoryId)

        if (!existingAccess) {
            return res.status(404).json({ error: 'Ese laboratorio no tiene acceso creado todavía.' })
        }

        const { data: access, error: updateError } = await supabase
            .from('laboratory_users')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', existingAccess.id)
            .select('id, clinic_id, laboratory_id, user_id, email, is_active, created_at, updated_at')
            .single()

        if (updateError || !access) {
            return res.status(400).json({ error: updateError?.message || 'No se pudo actualizar el acceso del laboratorio' })
        }

        return res.status(200).json({ access })
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal error' })
    }
}