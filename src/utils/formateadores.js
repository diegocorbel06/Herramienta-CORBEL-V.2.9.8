// Utilidad: Formateadores
// Funciones para formatear datos (fechas, montos, etc.)

const formateadores = {
  formatFecha(fecha) {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE');
  },
  formatMonto(monto) {
    return 'S/ ' + (typeof monto === 'number' ? monto.toFixed(2) : '0.00');
  },
  formatDescripcion(desc) {
    return desc ? desc.trim() : '-';
  }
};

export default formateadores;
