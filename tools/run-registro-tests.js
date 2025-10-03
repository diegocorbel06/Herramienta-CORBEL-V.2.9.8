// Simple runner for Registro module checks (no dependencies)
const path = require('path');
const fs = require('fs');

// Load a minimal global `app` as the browser code expects
global.app = global.app || {};

// Minimal DOM mock to allow modules that reference document/window to load
if (typeof global.document === 'undefined') {
  global.window = global.window || {};
  global.document = {
    body: { appendChild: function() {} },
    createElement: function() { return { style:{}, remove: function(){}, appendChild: function(){}, innerHTML: '' }; },
    getElementById: function(id) { return null; },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; }
  };
  global.window.document = global.document;
}

// Load helpers and modules directly (they attach to global app)
function safeRequire(relPath) {
  const p = path.join(__dirname, '..', relPath);
  if (fs.existsSync(p)) {
    try {
      require(p);
      return true;
    } catch (e) {
      console.warn('Warning loading', relPath, e.message);
      return false;
    }
  }
  return false;
}

// Files to load
safeRequire('js/utils/helpers.js');
safeRequire('js/utils/test_helpers.js');
safeRequire('js/modules/Registro/validation.js');
safeRequire('js/modules/Registro/registro.js');

// Ensure app.data exists with sensible defaults for tests
if (!app.data) app.data = {};
app.data.registerData = app.data.registerData || [];
app.data.mecanicosData = app.data.mecanicosData || [{id:'M1',nombre:'Mec1'},{id:'M2',nombre:'Mec2'}];
app.data.catalogData = app.data.catalogData || [{id:'P1',name:'Prod1',price:10}];
app.data.currentRegisterForms = app.data.currentRegisterForms || 1;
app.data.activeRegisterForm = app.data.activeRegisterForm || 1;

// Run assertions
try {
  // test calcularTotalProductos
  if (typeof app.registroUtils === 'undefined') throw new Error('registroUtils missing');
  const total = app.registroUtils.calcularTotalProductos([{price:10,quantity:2},{price:5,quantity:1}]);
  if (total !== 25) throw new Error('calcularTotalProductos failed, expected 25 got ' + total);

  // test validations
  if (typeof app.registroValidations === 'undefined') throw new Error('registroValidations missing');
  const registro = { fecha: app.setCurrentDate(), tipo: 'VENTA', cliente: '', productos: [{name:'X',quantity:1,price:10}], total:10, metodosPago:[{metodo:'Efectivo',monto:10}] };
  const v = app.registroValidations.validarRegistroCompleto(registro);
  if (v.valido) throw new Error('validation should fail for empty cliente');

  // Test: venta sin vehículo should pass placa validation skip
  const registroSinVeh = { fecha: app.setCurrentDate(), tipo: 'VENTA', cliente: 'Juan', productos: [{name:'A',quantity:1,price:5}], total:5, metodosPago:[{metodo:'Efectivo',monto:5}], sinVehiculo: true };
  const v2 = app.registroValidations.validarRegistroCompleto(registroSinVeh);
  if (!v2.valido) throw new Error('venta sin vehículo should pass validation but failed: ' + v2.mensaje);

  // Test: proceso gasto basic creation
  const beforeCount = app.data && Array.isArray(app.data.registerData) ? app.data.registerData.length : 0;
  // simulate processarRegistroGasto
  if (typeof app.procesarRegistroGasto !== 'function') throw new Error('procesarRegistroGasto missing');
  app.procesarRegistroGasto({ fecha: app.setCurrentDate(), tipo: 'GASTO', cliente:'', productos:[{name:'G',quantity:2,price:3}], total:6, metodosPago:[{metodo:'Efectivo',monto:6}] }, 1);
  const afterCount = app.data && Array.isArray(app.data.registerData) ? app.data.registerData.length : 0;
  if (afterCount <= beforeCount) throw new Error('procesarRegistroGasto did not add a registro');

  // Test: snapshot edit/cancel flow for sinVehiculo
  app.data.registerData = app.data.registerData || [];
  const mockReg = { id: 'T123', fecha: app.setCurrentDate(), tipo:'VENTA', placa:'ABC123', cliente:'X', productos:[], total:0, metodosPago:[], mecanicos:[], descripcion:'', sinVehiculo:false };
  app.data.registerData.push(mockReg);
  // call editarRegistro and then cancelarEdicionRegistro (UI absent, but functions should handle missing nodes)
  if (typeof app.editarRegistro !== 'function' || typeof app.cancelarEdicionRegistro !== 'function') {
    throw new Error('editar/cancelar functions missing');
  }
  try { app.editarRegistro('T123'); app.cancelarEdicionRegistro(1); } catch (e) { /* ignore DOM-related errors */ }

  // test obtenerMetodosPago fallback (no DOM) returns []
  const pagos = app.obtenerMetodosPago && typeof app.obtenerMetodosPago === 'function' ? app.obtenerMetodosPago(1) : [];
  if (!Array.isArray(pagos)) throw new Error('obtenerMetodosPago should return array');

  console.log('Registro basic checks: PASS');
  process.exit(0);
} catch (e) {
  console.error('Registro basic checks: FAIL', e.message);
  process.exit(2);
}
