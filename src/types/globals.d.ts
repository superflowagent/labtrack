declare global {
    interface Window {
        clinicName?: string;
        setDashboardSection?: (section: 'trabajos' | 'laboratorios' | 'especialistas') => void;
    }
}

export { };
