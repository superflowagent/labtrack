import React from 'react'

export const LandingFooter: React.FC = () => {
    return (
        <footer className="mt-16 border-t border-slate-200 bg-transparent py-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Labtrack</div>
                        <a className="text-sm text-slate-500 hover:text-slate-700" href="/terms">Términos</a>
                        <a className="text-sm text-slate-500 hover:text-slate-700" href="/privacy">Privacidad</a>
                    </div>
                    <div className="text-sm text-slate-600">contacto@labtrack.example</div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter
