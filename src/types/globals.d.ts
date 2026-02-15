declare global {
    interface Window {
        clinicName?: string;
        setDashboardSection?: (section: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes') => void;
    }
}

export { };
