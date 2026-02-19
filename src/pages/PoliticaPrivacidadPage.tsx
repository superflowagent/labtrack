import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const PoliticaPrivacidadPage = () => {
    return (
        <LegalPageLayout title="Política de Privacidad">
            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Responsable del tratamiento</h2>
                <p>
                    <span className="font-medium">Finalidad:</span> Gestión de servicios de logística y seguimiento de pedidos para
                    clínicas dentales.
                </p>
                <p>
                    <span className="font-medium">Datos tratados:</span> Nombres de pacientes y números de teléfono (introducidos por
                    la clínica).
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Legitimación</h2>
                <p>
                    El tratamiento de los datos se basa en la ejecución de un contrato (la prestación del servicio de Labtrack) y el
                    consentimiento del usuario al registrarse.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Destinatarios y almacenamiento</h2>
                <p>
                    Los datos se alojan de forma segura en Supabase. No se cederán datos a terceros, salvo obligación legal. El
                    laboratorio externo no tiene acceso a estos datos a través de la plataforma.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Derechos</h2>
                <p>
                    Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad enviando un email a
                    info@labtrack.es. Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos
                    (AEPD).
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default PoliticaPrivacidadPage
