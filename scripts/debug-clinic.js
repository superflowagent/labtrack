import pg from 'pg'

const client = new pg.Client({
    host: '127.0.0.1',
    port: 54330,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
})

await client.connect()

const clinicId = 'de6f743f-9fed-4b4d-9b89-fc63ac440e0e'
const res = await client.query(
    'SELECT id, name, stripe_customer_id, stripe_subscription_id, subscription_status, stripe_trial_end FROM clinics WHERE id = $1',
    [clinicId]
)

console.log('📋 Clinic status:')
if (res.rows.length === 0) {
    console.log('❌ Clinic not found')
} else {
    console.log(JSON.stringify(res.rows[0], null, 2))
}

await client.end()
