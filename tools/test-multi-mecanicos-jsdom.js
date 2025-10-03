// Test jsdom: seleccionar múltiples mecánicos -> guardar registro -> assert en data y DOM
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadScript(dom, scriptPath) {
  const code = fs.readFileSync(scriptPath, 'utf8');
  try {
    // Ejecutar el código explícitamente en el contexto de la ventana
    dom.window.eval(code);
  } catch (e) {
    console.error('Error al ejecutar', scriptPath, e && e.stack ? e.stack : e);
  }
}

(async () => {
  // Cargar HTML mínimo (usar index si existe)
  const htmlPath = path.resolve(__dirname, '..', 'index.html');
  const baseHtml = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : `<html><body></body></html>`;

  const dom = new JSDOM(baseHtml, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window; global.document = window.document; global.navigator = window.navigator;

  // Capturar errores en el contexto de la ventana para diagnosticar fallos al ejecutar scripts
  window.onerror = function(msg, src, line, col, err) {
    console.error('window.onerror:', msg, 'at', src + ':' + line + ':' + col);
    if (err && err.stack) console.error(err.stack);
  };
  window.addEventListener && window.addEventListener('unhandledrejection', function(e) { console.error('unhandledrejection:', e && e.reason); });

  // Crear elementos mínimos requeridos por registro.js
  const container = document.createElement('div');
  container.innerHTML = `
    <div id="register-form-container"></div>
    <div id="register-tabs"></div>
    <table id="register-table"><tbody></tbody></table>
    <div id="receipt-preview-container" class="hidden"><div id="receipt-preview"></div></div>
  `;
  document.body.appendChild(container);

  // Simular app global
  window.app = window.app || {};
  // Asegurar que también exista la referencia en el scope de node (global) como hace el smoke test
  global.app = window.app;
  
  // Cargar helpers y validaciones (registro.js espera algunas utilidades disponibles)
  const utilsPath = path.resolve(__dirname, '..', 'js', 'utils', 'helpers.js');
  const valPath = path.resolve(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js');
  if (fs.existsSync(utilsPath)) loadScript(dom, utilsPath);
  if (fs.existsSync(valPath)) loadScript(dom, valPath);
  // Cargar módulos necesarios: registro.js y sus dependencias en orden aproximado
  const scriptDir = path.resolve(__dirname, '..', 'js', 'modules', 'Registro');
  const registroScript = path.join(scriptDir, 'registro.js');
  if (!fs.existsSync(registroScript)) {
    console.error('registro.js not found at', registroScript);
    process.exit(2);
  }
  // Cargar script
  loadScript(dom, registroScript);

  // Esperar un breve periodo para que el script se ejecute en el contexto de jsdom
  await new Promise(r => setTimeout(r, 50));

  // Diagnóstico extra: comprobar typeof app dentro de la ventana y por eval
  try {
    console.log('typeof window.app:', typeof window.app);
    console.log('window.app === global.app:', window.app === global.app);
    try { console.log('eval typeof app:', dom.window.eval("typeof app")); } catch (e) { console.log('eval app error', e && e.message); }
  } catch (e) { console.error('diagnostic logging failed', e); }

  // Diagnóstico: listar keys de app
  console.log('app keys after loading registro.js:', Object.keys(window.app).sort());

  // Inicializar data mínimos
  window.app.data = window.app.data || {};
  window.app.data.mecanicosData = [
    { id: 'MEC-001', nombre: 'Pedro' },
    { id: 'MEC-002', nombre: 'Luis' },
    { id: 'MEC-003', nombre: 'Ana' }
  ];
  window.app.data.catalogData = [ { id: 'P-1', name: 'Filtro', price: 10.0 } ];
  window.app.data.registerData = [];
  window.app.data.currentRegisterForms = 1;
  window.app.data.nextFormId = 2;

  // Crear un formulario 1 mínimo con select multiple y contenedores
  const formsContainer = document.getElementById('register-form-container');
  const formHtml = `
    <div class="register-form active" id="register-form-1">
      <input id="reg-fecha-1" type="date" value="2025-10-01">
      <select id="reg-tipo-1" class="reg-tipo"><option>VENTA</option></select>
      <input id="reg-placa-1" />
      <input id="reg-cliente-1" />
      <select id="reg-modelo-1" class="reg-modelo"><option>ModeloA</option></select>

      <div id="row-mecanicos-1">
        <select id="reg-mecanico-1" multiple>
          <option value="MEC-001">Pedro</option>
          <option value="MEC-002">Luis</option>
          <option value="MEC-003">Ana</option>
        </select>
        <button id="add-mec-btn-1">Agregar Mecánicos</button>
      </div>
      <div id="row-mecanicos-asignados-1">
        <div id="mecanicos-seleccionados-1"><p>No hay mecánicos asignados</p></div>
      </div>

      <div id="productos-seleccionados-container-1" class="hidden">
        <div id="productos-seleccionados-list-1"></div>
      </div>

      <div id="metodos-pago-1"></div>
      <div id="pago-total-1">Total: S/ 0.00</div>

      <button id="save-register-1" class="btn-success">Guardar</button>
    </div>
  `;
  formsContainer.innerHTML = formHtml;

  // Asegurar contenedor de notificaciones que usa app.showNotification
  if (!document.getElementById('register-notification')) {
    const rn = document.createElement('div'); rn.id = 'register-notification'; rn.className = 'notification'; document.body.appendChild(rn);
  }

  // Inicializar listeners desde el script (si existe la función)
  if (typeof window.app.initializeRegisterForm === 'function') {
    window.app.initializeRegisterForm(1);
  }

  // Hook add-mec button to call app.addMecanicoToSelection
  const addMecBtn = document.getElementById('add-mec-btn-1');
  addMecBtn.addEventListener('click', () => {
    if (typeof window.app.addMecanicoToSelection === 'function') window.app.addMecanicoToSelection(1);
  });

  // Hook save button to call addRegister
  const saveBtn = document.getElementById('save-register-1');
  saveBtn.addEventListener('click', () => {
    if (typeof window.app.addRegister === 'function') window.app.addRegister(1);
  });

  // Simular seleccionar múltiples mecánicos en el select
  const sel = document.getElementById('reg-mecanico-1');
  // marcar MEC-001 y MEC-003
  Array.from(sel.options).forEach(opt => { opt.selected = (opt.value === 'MEC-001' || opt.value === 'MEC-003'); });

  // Diagnóstico: comprobar que la función exista y el select tenga opciones seleccionadas
  console.log('has addMecanicoToSelection:', typeof window.app.addMecanicoToSelection === 'function');
  const selBefore = Array.from(sel.selectedOptions).map(o=>o.value);
  console.log('selected options before add:', selBefore);

  // Llamar al botón agregar
  addMecBtn.click();

  // Asegurar que inputs mínimos existen antes de guardar (evitar nulls en obtenerDatosFormulario)
  const ensureInput = (id, type='text', value='') => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(type === 'select' ? 'select' : 'input');
      el.id = id;
      if (type === 'date') el.type = 'date';
      document.getElementById('register-form-1').appendChild(el);
    }
    if (value) el.value = value;
    return el;
  };
  ensureInput('reg-fecha-1', 'date', '2025-10-01');
  ensureInput('reg-tipo-1', 'select', 'VENTA');
  ensureInput('reg-cliente-1', 'text', 'Cliente Test');
  ensureInput('reg-placa-1', 'text', 'ABC123');
  ensureInput('reg-modelo-1', 'text', 'ModeloA');
  ensureInput('reg-descripcion-1', 'text', 'Descripción prueba');

  // Verificar que los tags se añadieron
  const containerSelected = document.getElementById('mecanicos-seleccionados-1');
  const tags = containerSelected.querySelectorAll('.mecanico-tag');
  if (tags.length !== 2) {
    console.error('Expected 2 mecanico tags, got', tags.length);
    // adicional: volcar innerHTML para inspección
    console.error('mecanicos container html:', containerSelected.innerHTML);
    process.exit(3);
  }

  // Agregar un producto mínimo para pasar validación
  const prodList = document.getElementById('productos-seleccionados-list-1');
  const prodItem = document.createElement('div');
  prodItem.className = 'producto-item';
  prodItem.setAttribute('data-producto-id', 'P-1');
  prodItem.setAttribute('data-name', 'Filtro');
  prodItem.setAttribute('data-quantity', '1');
  prodItem.setAttribute('data-price', '10');
  prodItem.innerHTML = ` <div class="producto-display">Filtro x1 S/ 10.00</div>`;
  prodList.appendChild(prodItem);
  document.getElementById('productos-seleccionados-container-1').classList.remove('hidden');

  // Agregar un método de pago mínimo
  const pagoContainer = document.getElementById('metodos-pago-1');
  const div = document.createElement('div');
  div.className = 'payment-method';
  div.innerHTML = `<select class="pago-metodo"><option value="Efectivo">Efectivo</option></select><input class="pago-monto" value="10">`;
  pagoContainer.appendChild(div);

  // Click en guardar
  // Diagnostics: ensure required elements exist in DOM before clicking save
  ['reg-fecha-1','reg-tipo-1','reg-placa-1','reg-cliente-1','reg-modelo-1','metodos-pago-1','productos-seleccionados-list-1'].forEach(id => {
    const el = document.getElementById(id);
    console.log('diag element', id, 'exists?', !!el, el && el.ownerDocument === document, el && el.tagName);
  });
  console.log('form html snippet:', document.getElementById('register-form-1') && document.getElementById('register-form-1').innerHTML.slice(0,200));
  saveBtn.click();

  // Validar que se creó el registro en app.data
  const regs = window.app.data.registerData || [];
  if (regs.length !== 1) {
    console.error('Expected 1 registro, got', regs.length);
    process.exit(4);
  }
  const r = regs[0];
  if (!Array.isArray(r.mecanicos) || r.mecanicos.length !== 2) {
    console.error('Expected registro.mecanicos length 2, got', r.mecanicos);
    process.exit(5);
  }

  // Validar que la tabla tiene una fila
  const tbody = document.querySelector('#register-table tbody');
  const rows = tbody.querySelectorAll('tr').length;
  if (rows < 1) {
    console.error('Expected at least 1 row in table, got', rows);
    process.exit(6);
  }

  console.log('Multi-mecánicos test passed');
  process.exit(0);
})();
