declare global {
    interface Window {
        clinicName?: string;
        dashboardSection?: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes';
        setDashboardSection?: (section: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes') => void;
    }
}

export { };
