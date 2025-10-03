// Servicio: Gastos
// Lógica de negocio para el registro y gestión de gastos
import storage from './storage.js';
import validaciones from '../utils/validaciones.js';

const STORAGE_KEY = 'gastosData';

const gastosService = {
  getAll() {
    return storage.get(STORAGE_KEY) || [];
  },
  add(gasto) {
    const gastos = this.getAll();
    // Validar gasto
    const valid = validaciones.validarRegistroGasto(gasto);
    if (!valid.valido) throw new Error(valid.mensaje);
    gastos.push(gasto);
    storage.set(STORAGE_KEY, gastos);
    return gasto;
  },
  edit(id, gastoEditado) {
    const gastos = this.getAll();
    const idx = gastos.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Gasto no encontrado');
    const valid = validaciones.validarRegistroGasto(gastoEditado);
    if (!valid.valido) throw new Error(valid.mensaje);
    gastos[idx] = { ...gastos[idx], ...gastoEditado };
    storage.set(STORAGE_KEY, gastos);
    return gastos[idx];
  },
  remove(id) {
    let gastos = this.getAll();
    gastos = gastos.filter(g => g.id !== id);
    storage.set(STORAGE_KEY, gastos);
  }
};

export default gastosService;
