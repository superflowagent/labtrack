import {
    FlaskConical,
    LayoutList,
    LogOut,
    Stethoscope,
    Users as UsersRound,
    Settings,
} from "lucide-react"
import { useEffect, useState } from "react"

import { signOut } from "@/services/supabase/auth"

import { Logo } from "./Logo"

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
        <aside className="hidden md:flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-6 shadow-sm w-[10vw] min-w-[230px]">
            <div className="mb-8 flex items-center" style={{ marginLeft: 4 }}>
                <Logo />
            </div>
            <nav className="flex flex-1 flex-col gap-2">
                {navItems.map(({ label, tab, icon: Icon }) => {
                    const isActive = activeSection === tab
                    return (
                        <div key={tab} className="flex flex-col">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveSection(tab)
                                    if (typeof window.setDashboardSection === 'function') window.setDashboardSection(tab)
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
            <div className="flex items-center mt-8 mb-2 gap-3">
                <button
                    onClick={signOut}
                    title="Cerrar sesión"
                    className="flex items-center rounded-full p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <LogOut className="h-6 w-6" />
                </button>
                {clinicName && (
                    <span className="text-base font-semibold text-teal-700 truncate max-w-[180px] ml-2 text-left" title={clinicName}>{clinicName}</span>
                )}
            </div>
        </aside>
    )
}
