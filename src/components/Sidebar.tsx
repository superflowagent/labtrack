import {
    FlaskConical,
    LayoutList,
    LogOut,
    Stethoscope,
    UserRound,
} from "lucide-react"
import { useEffect, useState } from "react"

import { signOut } from "@/services/supabase/auth"

import { Logo } from "./Logo"

const navItems: {
    label: string
    tab: "trabajos" | "laboratorios" | "especialistas" | "pacientes"
    icon: React.ComponentType<{ className?: string }>
}[] = [
        { label: "Trabajos", tab: "trabajos", icon: LayoutList },
        { label: "Laboratorios", tab: "laboratorios", icon: FlaskConical },
        { label: "Especialistas", tab: "especialistas", icon: Stethoscope },
        { label: "Pacientes", tab: "pacientes", icon: UserRound },
    ]

export function Sidebar() {
    const [clinicName, setClinicName] = useState<string | null>(null);
    useEffect(() => {
        // Escuchar cambios en window.clinicName mediante un evento personalizado
        const updateClinicName = () => setClinicName(window.clinicName || null);
        updateClinicName();
        window.addEventListener('clinicNameChanged', updateClinicName);
        return () => {
            window.removeEventListener('clinicNameChanged', updateClinicName);
        };
    }, []);
    return (
        <aside className="hidden md:flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-6 shadow-sm w-[10vw] min-w-[230px]">
            <div className="mb-8 flex items-center" style={{ marginLeft: 4 }}>
                <Logo />
            </div>
            <nav className="flex flex-1 flex-col gap-2">
                {navItems.map(({ label, tab, icon: Icon }) => (
                    <button
                        key={tab}
                        onClick={() => typeof window.setDashboardSection === 'function' && window.setDashboardSection(tab)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-teal-50 hover:text-teal-700 text-slate-700`}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </button>
                ))}
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
