// Test directo de actualizarRegistro sin manipular DOM
const path = require('path');
global.app = global.app || {};

try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'table.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js'));
} catch (e) {
  console.error('Error cargando módulos:', e);
  process.exit(2);
}

app.data = app.data || {};
app.data.registerData = [{ id:'T200', fecha:'2025-09-29', tipo:'VENTA', placa:'XYZ999', modelo:'Hilux', cliente:'Pedro', productos:[{name:'Filtro',quantity:1,price:20}], mecanicos:['M1'], total:20, metodosPago:[{metodo:'Efectivo', monto:20}], descripcion:'Test' }];

// stubs necesarios
app.showNotification = app.showNotification || function(msg, type, id) { console.log('NOTIF', type, msg); };
app.forceSave = app.forceSave || function() { console.log('forceSave called'); };

// Stub obtenerDatosFormulario para devolver cambios
const originalObtener = app.obtenerDatosFormulario;
app.obtenerDatosFormulario = function(formId) {
  return {
    tipo: 'VENTA',
    placa: 'XYZ999',
    cliente: 'Pedro Mod',
    modelo: 'Hilux',
    productos: [{name:'Filtro',quantity:2,price:20}],
    mecanicosIds: ['M1'],
    total: 40,
    metodosPago: [{metodo:'Efectivo', monto:40}],
    descripcion: 'Actualizado'
  };
};

// Replace updateRegisterTable to capture calls
let updated = false;
const origUpdate = app.updateRegisterTable;
app.updateRegisterTable = function(){ updated = true; return origUpdate ? origUpdate.call(app) : 0; };

// Call actualizarRegistro
app.actualizarRegistro('T200', 1);

// Check results
const reg = app.data.registerData.find(r => r.id === 'T200');
console.log('Registro tras actualizar:', reg);
console.log('updateRegisterTable called:', updated);

// restore
app.obtenerDatosFormulario = originalObtener;
app.updateRegisterTable = origUpdate;

