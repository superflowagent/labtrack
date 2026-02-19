import React from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export const LandingFooter: React.FC = () => {
    return (
        <footer id="footer" className="mt-16 border-t border-slate-200 bg-background py-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Labtrack</div>
                        <Link className="text-sm text-slate-500 hover:text-slate-700" to="/aviso-legal">Aviso legal</Link>
                        <Link className="text-sm text-slate-500 hover:text-slate-700" to="/politica-privacidad">Privacidad</Link>
                        <Link className="text-sm text-slate-500 hover:text-slate-700" to="/condiciones-uso">Términos y condiciones</Link>
                        <Link className="text-sm text-slate-500 hover:text-slate-700" to="/politica-cookies">Cookies</Link>
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
