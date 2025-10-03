// Servicio: Proveedores
// Lógica de negocio para el registro y gestión de proveedores
import storage from './storage.js';

const STORAGE_KEY = 'proveedoresData';

const proveedoresService = {
  getAll() {
    return storage.get(STORAGE_KEY) || [];
  },
  add(proveedor) {
    const proveedores = this.getAll();
    proveedor.id = 'PROV-' + Date.now();
    proveedores.push(proveedor);
    storage.set(STORAGE_KEY, proveedores);
    return proveedor;
  },
  edit(id, proveedorEditado) {
    const proveedores = this.getAll();
    const idx = proveedores.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Proveedor no encontrado');
    proveedores[idx] = { ...proveedores[idx], ...proveedorEditado };
    storage.set(STORAGE_KEY, proveedores);
    return proveedores[idx];
  },
  remove(id) {
    let proveedores = this.getAll();
    proveedores = proveedores.filter(p => p.id !== id);
    storage.set(STORAGE_KEY, proveedores);
  }
};

export default proveedoresService;
