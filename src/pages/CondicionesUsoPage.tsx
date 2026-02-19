import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const CondicionesUsoPage = () => {
    return (
        <LegalPageLayout title="Condiciones de Uso y Contratación (T&C)">
            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">El servicio</h2>
                <p>
                    Labtrack es una herramienta de gestión logística. No interviene en la relación médica entre clínica y paciente,
                    ni en la relación comercial entre clínica y laboratorio.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Prueba gratuita y suscripción</h2>
                <p>
                    <span className="font-medium">Prueba:</span> El periodo gratuito es de 30 días. Tras este periodo, el acceso se
                    suspenderá automáticamente salvo que el usuario contrate una suscripción de pago.
                </p>
                <p>
                    <span className="font-medium">Pagos:</span> Los pagos se gestionan de forma segura a través de la pasarela Stripe.
                    Labtrack no almacena datos de tarjetas bancarias.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Exención de responsabilidad</h2>
                <p>Labtrack no se hace responsable de:</p>
                <ul className="list-disc space-y-2 pl-6">
                    <li>Errores médicos, diagnósticos o mala praxis por parte de la clínica.</li>
                    <li>Retrasos, errores o roturas por parte del laboratorio dental.</li>
                    <li>Caídas puntuales del servicio o pérdida de datos por mal uso del usuario.</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Prohibición de datos sensibles</h2>
                <p>
                    El usuario se compromete a no introducir datos de salud (historiales clínicos, patologías) en campos de texto
                    libre, limitándose al nombre y teléfono necesarios para la logística.
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default CondicionesUsoPage
