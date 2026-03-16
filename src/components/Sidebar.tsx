import {
    FlaskConical,
    LayoutList,
    LogOut,
    Stethoscope,
    Users as UsersRound,
    Settings,
    Menu,
    X,
} from "lucide-react"
import { useEffect, useState } from "react"

import { signOut } from "@/services/supabase/auth"

const navItems: {
    label: string
    tab: "trabajos" | "laboratorios" | "especialistas" | "pacientes" | "ajustes"
    icon: React.ComponentType<{ className?: string }>
}[] = [
        { label: "Trabajos", tab: "trabajos", icon: LayoutList },
        { label: "Laboratorios", tab: "laboratorios", icon: FlaskConical },
        { label: "Especialistas", tab: "especialistas", icon: Stethoscope },
        { label: "Pacientes", tab: "pacientes", icon: UsersRound },
        { label: "Ajustes", tab: "ajustes", icon: Settings },
    ]

export function Sidebar() {
    const [clinicName, setClinicName] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes'>(window.dashboardSection ?? 'trabajos')
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        // Escuchar cambios en window.clinicName mediante un evento personalizado
        const updateClinicName = () => setClinicName(window.clinicName || null);
        updateClinicName();
        window.addEventListener('clinicNameChanged', updateClinicName);
        return () => {
            window.removeEventListener('clinicNameChanged', updateClinicName);
        };
    }, []);

    useEffect(() => {
        const update = () => setActiveSection(window.dashboardSection ?? 'trabajos')
        update()
        window.addEventListener('dashboardSectionChanged', update)
        return () => window.removeEventListener('dashboardSectionChanged', update)
    }, [])

    return (
        <>
            {/* Mobile Header */}
            <div className="flex md:hidden items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-40 shadow-sm">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="text-xl font-bold mt-1">
                    <span style={{ color: '#545454' }}>Lab</span>
                    <span style={{ color: '#14b8a6' }}>track</span>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 md:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[280px] flex-col border-r border-slate-200 bg-white px-3 py-6 shadow-xl 
                transition-transform duration-300 ease-in-out md:static md:w-[10vw] md:min-w-[230px] md:translate-x-0 md:shadow-sm
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="mb-8 flex items-center justify-between" style={{ marginLeft: 4 }}>
                    <div className="text-2xl font-bold">
                        <span style={{ color: '#545454' }}>Lab</span>
                        <span style={{ color: '#14b8a6' }}>track</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-md"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
                    {navItems.map(({ label, tab, icon: Icon }) => {
                        const isActive = activeSection === tab
                        return (
                            <div key={tab} className="flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveSection(tab)
                                        if (typeof window.setDashboardSection === 'function') window.setDashboardSection(tab)
                                        setIsMobileOpen(false)
                                    }}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transform transition duration-150 ease-out active:scale-95 active:translate-y-px ${isActive ? 'border-l-4 border-b-2 border-teal-600 bg-transparent text-teal-700' : 'hover:bg-teal-50 hover:text-teal-700 text-slate-700'}`}
                                    style={isActive ? { boxShadow: '0 -6px 12px rgba(16,185,129,0.08)' } : undefined}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : ''}`} />
                                    {label}
                                </button>
                            </div>
                        )
                    })}
                </nav>
                <div className="flex items-center mt-auto pt-6 pb-2 gap-3 shrink-0 px-2 overflow-hidden border-t border-slate-100">
                    <button
                        onClick={signOut}
                        title="Cerrar sesión"
                        className="flex items-center rounded-full p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                        <LogOut className="h-6 w-6" />
                    </button>
                    {clinicName && (
                        <span className="text-base font-semibold text-teal-700 truncate max-w-[180px] text-left" title={clinicName}>{clinicName}</span>
                    )}
                </div>
            </aside>
        </>
    )
}
