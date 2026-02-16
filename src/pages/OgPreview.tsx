import React from 'react'
import { LandingDashboardPreview } from '@/components/landing/LandingDashboardPreview'

const OgPreview: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="og-screenshot-root w-[1200px] h-[630px] flex items-center justify-center">
                <div className="rounded-3xl bg-white p-12 shadow-2xl w-[1100px] h-[500px]">
                    <h1 className="text-4xl font-semibold">Control total del flujo entre clínica y laboratorio</h1>
                    <p className="mt-4 text-lg text-slate-600">Digitaliza tus trabajos odontológicos — 1 mes gratis</p>
                    <div className="mt-8">
                        <LandingDashboardPreview />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OgPreview
