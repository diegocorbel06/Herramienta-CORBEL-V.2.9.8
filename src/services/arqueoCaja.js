// Servicio: Arqueo de Caja
// Lógica de negocio para arqueo de caja y cierre
import storage from './storage.js';

const STORAGE_KEY = 'arqueoCajaData';

const arqueoCajaService = {
  getHistorial() {
    return storage.get(STORAGE_KEY) || [];
  },
  agregarCierre(cierre) {
    const historial = this.getHistorial();
    cierre.id = 'ARQ-' + Date.now();
    historial.push(cierre);
    storage.set(STORAGE_KEY, historial);
    return cierre;
  },
  editarCierre(id, cierreEditado) {
    const historial = this.getHistorial();
    const idx = historial.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Cierre no encontrado');
    historial[idx] = { ...historial[idx], ...cierreEditado };
    storage.set(STORAGE_KEY, historial);
    return historial[idx];
  },
  eliminarCierre(id) {
    let historial = this.getHistorial();
    historial = historial.filter(c => c.id !== id);
    storage.set(STORAGE_KEY, historial);
  },
  calcularArqueo(registros) {
    // registros: array de ventas y gastos
    let ingresos = 0, egresos = 0, efectivo = 0, otros = 0;
    registros.forEach(r => {
      if (r.tipo === 'VENTA') {
        ingresos += r.total;
        r.metodosPago.forEach(m => {
          if (m.metodo === 'Efectivo') efectivo += m.monto;
          else otros += m.monto;
        });
      } else if (r.tipo === 'GASTO') {
        egresos += r.total;
      }
    });
    return { ingresos, egresos, efectivo, otros, saldo: ingresos - egresos };
  }
  ,
  calcularArqueoPorRango(registros, fechaInicio, fechaFin) {
    if (!Array.isArray(registros)) return { ingresos:0, egresos:0, totalesPorMetodo:{}, saldo:0 };
    // asumimos fechas en formato ISO 'YYYY-MM-DD'
    const start = fechaInicio;
    const end = fechaFin;
    const totalesPorMetodo = {};
    let ingresos = 0, egresos = 0;
    registros.forEach(r => {
      const rf = r.fecha;
      if (rf < start || rf > end) return;
      if (r.tipo === 'VENTA') {
        ingresos += r.total || 0;
        if (Array.isArray(r.metodosPago)) {
          r.metodosPago.forEach(m => {
            const metodo = m.metodo || 'Otros';
            totalesPorMetodo[metodo] = (totalesPorMetodo[metodo] || 0) + (m.monto || 0);
          });
        }
      }
      if (r.tipo === 'GASTO') {
        egresos += r.total || 0;
        if (Array.isArray(r.metodosPago)) {
          r.metodosPago.forEach(m => {
            const metodo = m.metodo || 'Otros';
            totalesPorMetodo[metodo] = (totalesPorMetodo[metodo] || 0) - (m.monto || 0);
          });
        }
      }
    });
    const saldo = ingresos - egresos;
    return { ingresos, egresos, totalesPorMetodo, saldo };
  }
};

export default arqueoCajaService;
