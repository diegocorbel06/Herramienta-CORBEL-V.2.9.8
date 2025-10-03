// Test simple de flujo de edición en Node (mock DOM)
const path = require('path');
global.window = global.window || {};
global.app = global.app || {};

// minimal mock similar to simulate_render
global.document = global.document || {
  _elements: {},
  getElementById(id) {
    if (!this._elements[id]) this._elements[id] = this.createElement('div');
    return this._elements[id];
  },
  querySelector(selector) {
    if (selector === '#register-table tbody') {
      if (!this._elements['register-tbody']) this._elements['register-tbody'] = this.createElement('tbody');
      return this._elements['register-tbody'];
    }
    // try direct id selector
    if (selector && selector.startsWith('#')) {
      const id = selector.slice(1);
      if (!this._elements[id]) this._elements[id] = this.createElement('div');
      return this._elements[id];
    }
    return null;
  },
  createElement(tag) {
    const el = {
      tagName: (tag||'').toUpperCase(),
      children: [],
      style: {},
      attributes: {},
      innerHTML: '',
      dataset: {},
      classList: { _list: new Set(), add(n){this._list.add(n)}, remove(n){this._list.delete(n)}, contains(n){return this._list.has(n)} },
      setAttribute(k,v){ this.attributes[k]=v; },
      getAttribute(k){ return this.attributes[k]; },
      appendChild(c){ this.children.push(c); c.parentNode = this; },
      removeChild(c){ this.children = this.children.filter(x=>x!==c); },
      insertBefore(newNode, refNode){
        const idx = this.children.indexOf(refNode);
        if (idx === -1) this.children.push(newNode); else this.children.splice(idx,0,newNode);
        newNode.parentNode = this;
      },
      querySelector(s){
        // support id selector '#id' and class selector '.class'
        if (!s) return null;
        if (s.startsWith('#')) {
          const id = s.slice(1);
          return this.children.find(c => c.id === id) || null;
        }
        if (s.startsWith('.')) {
          const cls = s.slice(1);
          return this.children.find(c => c.classList && c.classList.contains && c.classList.contains(cls)) || null;
        }
        return this.children[0] || null;
      },
      querySelectorAll(){ return this.children.slice(); },
      addEventListener(){}
    };
    return el;
  }
};

try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'table.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'forms.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js'));
} catch (e) {
  console.error('Error cargando módulos:', e);
  process.exit(2);
}

// preparar datos
app.data = app.data || {};
app.data.mecanicosData = app.data.mecanicosData || [{id:'M1', nombre:'Ana'}];
app.data.registerData = [{ id:'T200', fecha:'2025-09-29', tipo:'VENTA', placa:'XYZ999', modelo:'Hilux', cliente:'Pedro', productos:[{name:'Filtro',quantity:1,price:20}], mecanicos: ['M1'], total:20, metodosPago:[{metodo:'Efectivo', monto:20}], descripcion:'Test' }];
app.data.currentRegisterForms = 1;

// ensure basic form elements exist in the mock for form-1
const form = document.getElementById('register-form-1');
form.className = 'register-form active';
form.id = 'register-form-1';
form.innerHTML = `
  <h4>Registro 1</h4>
  <input id="reg-fecha-1" />
  <select id="reg-tipo-1"><option value="VENTA">VENTA</option><option value="GASTO">GASTO</option></select>
  <input id="reg-placa-1" />
  <input id="reg-cliente-1" />
  <select id="reg-modelo-1"></select>
  <div id="mecanicos-seleccionados-1"></div>
  <div id="productos-seleccionados-list-1"></div>
  <div id="productos-seleccionados-container-1" class="hidden"></div>
  <div id="metodos-pago-1"></div>
  <textarea id="reg-descripcion-1"></textarea>
  <div id="gasto-row-1" style="display:none;"></div>
  <button data-role="save-register" id="save-register-1">Guardar Registro</button>
`;

// Ejecutar editarRegistro
try {
  app.editarRegistro('T200');
  const formEl = document.getElementById('register-form-1');
  console.log('Form classes:', formEl.className);
  const saveBtn = document.getElementById('save-register-1');
  console.log('Save button text after edit:', saveBtn && saveBtn.textContent);
  const cancelBtn = formEl.querySelector && formEl.querySelector('.btn-cancel-edit');
  console.log('Cancel button exists:', !!cancelBtn);
  process.exit(0);
} catch (e) {
  console.error('editarRegistro lanzò error:', e);
  process.exit(2);
}
