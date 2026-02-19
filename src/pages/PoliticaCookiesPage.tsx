import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const PoliticaCookiesPage = () => {
    return (
        <LegalPageLayout title="Política de Cookies">
            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">¿Qué son las cookies?</h2>
                <p>
                    Son pequeños archivos que se instalan en tu navegador para que la web funcione correctamente.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Cookies utilizadas en Labtrack</h2>
                <p><span className="font-medium">Técnicas:</span> Necesarias para el inicio de sesión y el funcionamiento de la app.</p>
                <p>
                    <span className="font-medium">Pasarela de pago (Stripe):</span> Cookies necesarias para garantizar la seguridad de
                    las transacciones y prevenir fraudes.
                </p>
                <p>
                    Al no utilizar herramientas de marketing (como Facebook Pixel o Google Analytics), Labtrack solo utiliza cookies
                    exentas de consentimiento previo por ser necesarias para el servicio.
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default PoliticaCookiesPage
