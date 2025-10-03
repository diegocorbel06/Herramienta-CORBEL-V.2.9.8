// Script de prueba: invoca editarRegistro y actualizarRegistro en el entorno mock
const path = require('path');
global.window = global.window || {};
global.app = global.app || {};
// crear un mock simple de document si no existe
if (!global.document) {
  global.document = { _elements: {}, createElement: () => ({ children: [], appendChild(c){ this.children.push(c); }, innerHTML: '', setAttribute(){}, getAttribute(){}, querySelector(){return null}, querySelectorAll(){return []} }) };
}
try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'table.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js'));
} catch (e) {
  console.error('Error loading modules:', e);
  process.exit(2);
}
// preparar dato de prueba
app.data = app.data || {};
app.data.mecanicosData = app.data.mecanicosData || [{ id: 'M1', nombre: 'Ana' }];
app.data.registerData = [{ id:'T200', fecha:'2025-09-29', tipo:'VENTA', placa:'XYZ999', modelo:'Hilux', cliente:'Pedro', productos:[{name:'Filtro',quantity:1,price:20}], mecanicos: ['M1'], total:20, metodosPago:[{metodo:'Efectivo', monto:20}], descripcion:'Test' }];
// Asegurarnos que la tabla existe en mock
const table = document.createElement('table'); table.id = 'register-table';
const thead = document.createElement('thead'); table.appendChild(thead);
const tbody = document.createElement('tbody'); table.appendChild(tbody);
if (document.body && typeof document.body.appendChild === 'function') document.body.appendChild(table); else if (document._elements) document._elements['register-table'] = table;

// Directamente probar actualizarRegistro sin invocar editarRegistro (evita crear formularios en mock)
try {
  const formId = 1;
  const edited = Object.assign({}, app.data.registerData[0], { cliente: 'Juan' });
  const orig = app.obtenerDatosFormulario;
  app.obtenerDatosFormulario = function(fid){ return edited; };
  app.actualizarRegistro('T200', formId);
  console.log('actualizarRegistro called');
  console.log('Registro actualizado:', app.data.registerData[0]);
  app.obtenerDatosFormulario = orig;
} catch (e) {
  console.error('Error durante test edit/update:', e);
}
