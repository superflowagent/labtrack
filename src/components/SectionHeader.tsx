import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  newButton?: React.ReactNode;
}

/**
 * Header común para todas las secciones del dashboard.
 * Alinea icono, título y botón "Nuevo" con altura fija.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, newButton }) => (
  <div className="flex items-center justify-between mb-6 h-12 w-full">
    <div className="flex items-center gap-3">
      {icon}
      <h1 className="text-2xl font-semibold text-slate-700">{title}</h1>
    </div>
    {newButton && <div className="flex items-center gap-2">{newButton}</div>}
  </div>
);

export default SectionHeader;
