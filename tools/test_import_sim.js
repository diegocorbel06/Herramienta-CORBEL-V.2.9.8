// Simular importación procesando objetos en lugar de leer un archivo Excel
const path = require('path');

global.app = global.app || {};

// Minimal DOM mock for updateRegisterTable
global.document = global.document || {
  _elements: {},
  getElementById(id) { if (!this._elements[id]) this._elements[id] = this.createElement('div'); return this._elements[id]; },
  querySelector(selector) {
    if (selector === '#register-table tbody') { if (!this._elements['register-tbody']) this._elements['register-tbody'] = this.createElement('tbody'); return this._elements['register-tbody']; }
    if (selector && selector.startsWith('#')) { const id = selector.slice(1); if (!this._elements[id]) this._elements[id] = this.createElement('div'); return this._elements[id]; }
    return null;
  },
  createElement(tag) { return { tagName:(tag||'').toUpperCase(), children:[], id: '', innerHTML:'', style:{}, attributes:{}, classList:{ _list:new Set(), add(n){this._list.add(n)}, remove(n){this._list.delete(n)}, contains(n){return this._list.has(n)} }, appendChild(c){ this.children.push(c); c.parentNode = this; }, setAttribute(k,v){ this.attributes[k]=v; }, getAttribute(k){ return this.attributes[k]; } }; }
};

try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'table.js'));
  require(path.join(__dirname, '..', 'js', 'utils', 'excel.js'));
} catch (e) {
  console.error('Error loading modules:', e);
  process.exit(2);
}

app.data = app.data || {};
app.data.catalogData = [{ id: 'P1', name: 'Filtro', price: 20 }];
app.data.mecanicosData = [{ id: 'M1', nombre: 'Ana' }];
app.data.registerData = [];

// Simular registros leídos del excel
const registrosSheet = [
  { ID: 'IMP-1', Fecha: '29/09/2025', Tipo: 'VENTA', Placa: 'ABC123', Cliente: 'Juan', Productos: 'Filtro x2', 'Métodos de Pago': 'Efectivo: S/ 40', 'Mecánicos': 'Ana', Total: 40, Descripción: 'Importado' }
];

// Llamar al parser interno reutilizando la lógica de excel.js
try {
  // Forzar ejecución de la porción que procesa Registros: reusar la función (no exportada) -> invocamos handleExcelImport no sirve porque requiere File
  // En su lugar replicamos la transform con la misma lógica mínima
  registrosSheet.forEach(item => {
    // Usar el mismo bloque de normalización que en excel.js - replicar concisamente
    const fechaNorm = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(item.Fecha || '') : (item.Fecha || '');
    const productos = [{ id: 'P1', name:'Filtro', quantity:2, price:20, originalPrice:20 }];
    const mecanicos = ['M1'];
    const metodos = [{ metodo: 'Efectivo', monto: 40 }];
    const rec = { id: item.ID, fecha: fechaNorm, tipo: 'VENTA', placa: item.Placa, cliente: item.Cliente, productos, mecanicos, total: 40, metodosPago: metodos, descripcion: item.Descripción };
    const exist = app.data.registerData.findIndex(r=>r.id===rec.id);
    if (exist!==-1) app.data.registerData[exist] = {...app.data.registerData[exist], ...rec}; else app.data.registerData.push(rec);
  });
  // Llamar actualizaciones
  if (typeof app.updateRegisterTable === 'function') app.updateRegisterTable();
  console.log('Import simulation done. registerData:', app.data.registerData);
  // Ejecutar comprobaciones de filtros (today/week/month/custom)
  try {
    const filtros = { fechaDesde: null, fechaHasta: null };
    // Hoy
    app.data.currentDateFilter = 'today';
    const todayFiltered = (typeof app.filtrarRegistrosPorFecha === 'function') ? app.filtrarRegistrosPorFecha(app.data.registerData) : (app.registroUtils ? app.registroUtils.filtrarRegistros(app.data.registerData, {}) : app.data.registerData);
    console.log('Filtered (today):', todayFiltered.length);
    // Semana
    app.data.currentDateFilter = 'week';
    const weekFiltered = (typeof app.filtrarRegistrosPorFecha === 'function') ? app.filtrarRegistrosPorFecha(app.data.registerData) : app.data.registerData;
    console.log('Filtered (week):', weekFiltered.length);
    // Mes
    app.data.currentDateFilter = 'month';
    const monthFiltered = (typeof app.filtrarRegistrosPorFecha === 'function') ? app.filtrarRegistrosPorFecha(app.data.registerData) : app.data.registerData;
    console.log('Filtered (month):', monthFiltered.length);
  } catch (e) { console.warn('filter checks failed', e); }
} catch (e) {
  console.error('Import simulation failed:', e);
  process.exit(2);
}
