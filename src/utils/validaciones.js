// Utilidad: Validaciones
// Funciones para validar formularios y datos

const validaciones = {
  isMontoValido(monto) {
    return typeof monto === 'number' && monto >= 0;
  },
  isFechaObligatoria(fecha) {
    return !!fecha && !isNaN(new Date(fecha).getTime());
  },
  isCategoriaValida(cat) {
    return typeof cat === 'string' && cat.length > 0;
  },
  validarRegistroVenta(venta) {
    if (!venta) return { valido: false, mensaje: 'Datos de venta requeridos' };
    if (!venta.fecha) return { valido: false, mensaje: 'La fecha es obligatoria' };
    // Cliente opcional: no bloquear si está vacío
    if (typeof venta.cliente !== 'undefined' && venta.cliente !== null && String(venta.cliente).trim() !== '') {
      if (String(venta.cliente).trim().length < 2) return { valido: false, mensaje: 'El nombre del cliente es muy corto' };
    }
    if (!Array.isArray(venta.productos) || venta.productos.length === 0) return { valido: false, mensaje: 'Debe agregar al menos un producto' };
    if (!Array.isArray(venta.metodosPago) || venta.metodosPago.length === 0) return { valido: false, mensaje: 'Debe agregar al menos un método de pago' };
    if (!Array.isArray(venta.mecanicos) || venta.mecanicos.length === 0) return { valido: false, mensaje: 'Debe seleccionar al menos un mecánico' };
    for (const p of venta.productos) {
      if (!this.isMontoValido(p.price)) return { valido: false, mensaje: 'Precio de producto inválido' };
      if (!p.name) return { valido: false, mensaje: 'Nombre de producto requerido' };
    }
    return { valido: true, mensaje: 'OK' };
  },
  validarRegistroGasto(gasto) {
    if (!gasto) return { valido: false, mensaje: 'Datos de gasto requeridos' };
    if (!gasto.fecha) return { valido: false, mensaje: 'La fecha es obligatoria' };
    if (!gasto.categoria) return { valido: false, mensaje: 'La categoría es obligatoria' };
    if (!gasto.descripcion) return { valido: false, mensaje: 'La descripción es obligatoria' };
    if (!this.isMontoValido(gasto.precio)) return { valido: false, mensaje: 'Precio inválido' };
    if (!Number.isInteger(gasto.unidades) || gasto.unidades < 1) return { valido: false, mensaje: 'Unidades inválidas' };
    if (!this.isMontoValido(gasto.total)) return { valido: false, mensaje: 'Total inválido' };
    return { valido: true, mensaje: 'OK' };
  }
};

export default validaciones;
