import React from 'react';

/**
 * Espaciador visual para igualar la altura del header (título + botón) en todas las secciones.
 * Usa la misma altura que el header real (48px = h-12).
 */
export const SectionHeaderSpacer: React.FC = () => (
  <div className="h-12" aria-hidden="true" />
);

export default SectionHeaderSpacer;
