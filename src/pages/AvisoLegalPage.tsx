import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const AvisoLegalPage = () => {
    return (
        <LegalPageLayout title="Aviso Legal">
            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Titular de la web</h2>
                <p><span className="font-medium">Responsable:</span> Superflow SL</p>
                <p><span className="font-medium">Domicilio:</span> Valencia, España.</p>
                <p><span className="font-medium">Email de contacto:</span> info@labtrack.es</p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Objeto</h2>
                <p>
                    Este Aviso Legal regula el uso de la plataforma Labtrack. El acceso y uso de la misma te atribuye la condición
                    de usuario, aceptando desde este momento las condiciones aquí expuestas.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Propiedad intelectual</h2>
                <p>
                    Superflow SL es titular de todos los derechos de propiedad intelectual e industrial de Labtrack (código fuente,
                    diseño, logotipos, etc.). Queda prohibida la reproducción o distribución total o parcial de los mismos sin
                    autorización expresa.
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default AvisoLegalPage
