import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export const LandingPricing: React.FC = () => {
    return (
        <section className="mt-16 bg-transparent">
            <h2 className="text-2xl font-semibold">Precio simple</h2>
            <p className="mt-2 text-slate-600">1 plan — 1 mes gratis, luego 19,99€/mes. Facturación mensual.</p>
            <Card className="mt-6 p-6 flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500">Plan único</div>
                    <div className="mt-2 text-3xl font-bold">19,99€ <span className="text-sm font-medium text-slate-500">/mes</span></div>
                    <div className="mt-1 text-sm text-slate-500">1er mes gratuito — cancela en cualquier momento</div>
                </div>
                <div>
                    <Button asChild className="bg-teal-600 text-white hover:bg-teal-500">
                        <Link to="/login?register=1">Probar gratis</Link>
                    </Button>
                </div>
            </Card>
        </section>
    )
}

export default LandingPricing
