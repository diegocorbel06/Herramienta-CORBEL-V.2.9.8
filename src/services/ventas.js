// Servicio: Ventas
// Lógica de negocio para el registro y gestión de ventas
import storage from './storage.js';
import validaciones from '../utils/validaciones.js';

const STORAGE_KEY = 'ventasData';

const ventasService = {
  getAll() {
    return storage.get(STORAGE_KEY) || [];
  },
  add(venta) {
    const ventas = this.getAll();
    // Validar venta
    const valid = validaciones.validarRegistroVenta(venta);
    if (!valid.valido) throw new Error(valid.mensaje);
    ventas.push(venta);
    storage.set(STORAGE_KEY, ventas);
    return venta;
  },
  edit(id, ventaEditada) {
    const ventas = this.getAll();
    const idx = ventas.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Venta no encontrada');
    const valid = validaciones.validarRegistroVenta(ventaEditada);
    if (!valid.valido) throw new Error(valid.mensaje);
    ventas[idx] = { ...ventas[idx], ...ventaEditada };
    storage.set(STORAGE_KEY, ventas);
    return ventas[idx];
  },
  remove(id) {
    let ventas = this.getAll();
    ventas = ventas.filter(v => v.id !== id);
    storage.set(STORAGE_KEY, ventas);
  }
};

export default ventasService;
