declare global {
    interface Window {
        clinicName?: string;
        dashboardSection?: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes';
        setDashboardSection?: (section: 'trabajos' | 'laboratorios' | 'especialistas' | 'pacientes' | 'ajustes') => void;
    }
}

export { };
