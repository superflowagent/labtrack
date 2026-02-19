import React from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'

export const LandingFooter: React.FC = () => {
    return (
        <footer className="mt-16 border-t border-slate-200 bg-background py-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Labtrack</div>
                        <a className="text-sm text-slate-500 hover:text-slate-700" href="/terms">Términos</a>
                        <a className="text-sm text-slate-500 hover:text-slate-700" href="/privacy">Privacidad</a>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-sm text-slate-600 sm:items-end sm:text-right">
                        <a href="mailto:info@labtrack.es" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800">
                            <Mail className="h-4 w-4" />
                            <span>info@labtrack.es</span>
                        </a>
                        <div className="inline-flex items-center gap-2 text-slate-600">
                            <Phone className="h-4 w-4" />
                            <span>742072760</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>Valencia, España</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter
