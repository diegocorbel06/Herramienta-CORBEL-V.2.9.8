// Simulación de DOM mínima para probar updateRegisterTable en Node
const path = require('path');
global.window = global.window || {};
global.app = global.app || {};

// Minimal DOM mock
global.document = {
  _elements: {},
  getElementById(id) {
    if (!this._elements[id]) {
      // create a simple container element
      this._elements[id] = this.createElement('div');
      this._elements[id].id = id;
    }
    return this._elements[id];
  },
  querySelector(selector) {
    if (selector === '#register-table tbody') {
      // ensure tbody exists
      if (!this._elements['register-tbody']) this._elements['register-tbody'] = this.createElement('tbody');
      return this._elements['register-tbody'];
    }
    return null;
  },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement(tag) {
    const el = {
      tagName: (tag||'').toUpperCase(),
      children: [],
      style: {},
      attributes: {},
      innerHTML: '',
      dataset: {},
      classList: {
        _list: new Set(),
        add(name) { this._list.add(name); },
        remove(name) { this._list.delete(name); },
        contains(name) { return this._list.has(name); }
      },
      setAttribute(k,v) { this.attributes[k]=v; },
      getAttribute(k) { return this.attributes[k]; },
      appendChild(child) { this.children.push(child); },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      scrollIntoView() {}
    };
    return el;
  }
};

try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'table.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js'));
} catch (e) {
  console.error('Error loading modules:', e);
  process.exit(2);
}

// Datos de prueba
app.data = app.data || {};
app.data.mecanicosData = app.data.mecanicosData || [{ id: 'M1', nombre: 'Ana' }];
app.data.registerData = [{ id:'T200', fecha:'2025-09-29', tipo:'VENTA', placa:'XYZ999', modelo:'Hilux', cliente:'Pedro', productos:[{name:'Filtro',quantity:1,price:20}], mecanicos: ['M1'], total:20, metodosPago:[{metodo:'Efectivo', monto:20}], descripcion:'Test' }];

// Ejecutar render
if (typeof app.updateRegisterTable === 'function') {
  try {
    app.updateRegisterTable();
    console.log('Simulación: updateRegisterTable ejecutada con éxito.');

    // Check selector '#register-table tbody'
    const tbody = document.querySelector('#register-table tbody');
    if (tbody) {
      const count = Array.isArray(tbody.children) ? tbody.children.length : (tbody.children && typeof tbody.children.length === 'number' ? tbody.children.length : 0);
      console.log('QuerySelector tbody children count:', count);
      if (count > 0 && tbody.children[0]) {
        console.log('QuerySelector first row innerHTML (tr simulated):', tbody.children[0].innerHTML ? String(tbody.children[0].innerHTML).slice(0,200) : '[no innerHTML]');
      }
    }

    // also check element with id 'register-table-body' which some code may use
    const byId = document.getElementById('register-table-body');
    if (byId) {
      const cnt = Array.isArray(byId.children) ? byId.children.length : (byId.children && typeof byId.children.length === 'number' ? byId.children.length : 0);
      console.log("getElementById('register-table-body') children count:", cnt);
      if (cnt > 0 && byId.children[0]) {
        console.log("getElementById first row innerHTML (tr simulated):", byId.children[0].innerHTML ? String(byId.children[0].innerHTML).slice(0,200) : '[no innerHTML]');
      }
    }

  } catch (e) {
    console.error('Error al ejecutar updateRegisterTable:', e);
    process.exit(2);
  }
} else {
  console.error('app.updateRegisterTable no está definida');
  process.exit(2);
}
