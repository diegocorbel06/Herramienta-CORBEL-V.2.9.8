const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadCode(dom, relPath) {
  const full = path.join(__dirname, '..', relPath);
  const code = fs.readFileSync(full, 'utf8');
  dom.window.eval(code);
}

(async () => {
  const htmlPath = path.resolve(__dirname, '..', 'index.html');
  const baseHtml = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8').replace(/<script[\s\S]*?<\/script>/gi,'') : '<html><body><div id="registro"></div></body></html>';
  const dom = new JSDOM(baseHtml, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom; global.window = window; global.document = window.document; global.navigator = window.navigator; global.app = window.app = window.app || {};

  // Load minimal helpers and registro modules
  loadCode(dom, 'js/utils/helpers.js');
  loadCode(dom, 'js/modules/Registro/validation.js');
  loadCode(dom, 'js/modules/Registro/registro.js');

  // Wait
  await new Promise(r => setTimeout(r, 50));

  // Prepare environment
  app.data = app.data || {};
  app.data.mecanicosData = [{id:'M1', nombre:'Ana'}];
  app.data.catalogData = [{id:'P1', name:'Filtro', price:10}];
  app.data.registerData = [];
  app.data.currentRegisterForms = 1;

  // Render UI
  const regContainer = document.getElementById('registro') || (function(){ const d = document.createElement('div'); d.id='registro'; document.body.appendChild(d); return d; })();
  if (typeof app.getRegistroHTML === 'function') regContainer.innerHTML = app.getRegistroHTML();
  if (typeof app.initRegistroTab === 'function') app.initRegistroTab();

  // Ensure elements for form 1
  const fecha = document.getElementById('reg-fecha-1'); if (fecha) fecha.value = app.setCurrentDate ? app.setCurrentDate() : new Date().toISOString().split('T')[0];
  const tipo = document.getElementById('reg-tipo-1'); if (tipo) tipo.value = 'VENTA';
  const cliente = document.getElementById('reg-cliente-1'); if (cliente) cliente.value = '';
  const placa = document.getElementById('reg-placa-1'); if (placa) placa.value = '%%%INVALID';

  // Create product and payment so validation passes except placa
  const prodList = document.getElementById('productos-seleccionados-list-1');
  if (prodList) {
    const item = document.createElement('div'); item.className='producto-item'; item.setAttribute('data-name','Filtro'); item.setAttribute('data-quantity','1'); item.setAttribute('data-price','10'); item.innerHTML = '<div class="producto-display">Filtro x1 S/ 10</div>'; prodList.appendChild(item);
    document.getElementById('productos-seleccionados-container-1').classList.remove('hidden');
  }
  const pagos = document.getElementById('metodos-pago-1'); if (pagos) pagos.innerHTML = '<div class="payment-method"><select class="pago-metodo"><option>Efectivo</option></select><input class="pago-monto" value="10"></div>';

  // Call addRegister
  if (typeof app.addRegister !== 'function') { console.error('addRegister not found'); process.exit(2); }
  const result = app.addRegister(1);

  // Assert registro saved despite placa invalid
  const created = Array.isArray(app.data.registerData) && app.data.registerData.length === 1;
  console.log('placa-warning: registro creado?', created);
  if (!created) { console.error('Expected registro to be created despite invalid plate.'); process.exit(3); }

  // Check that placa input has class input-warning OR that a badge was appended
  const placaEl = document.getElementById('reg-placa-1');
  const hasClass = placaEl && placaEl.classList && placaEl.classList.contains('input-warning');
  const badge = placaEl && placaEl.nextElementSibling && placaEl.nextElementSibling.classList && placaEl.nextElementSibling.classList.contains('placa-warning-badge');
  console.log('placa-warning: hasClass?', !!hasClass, 'hasBadge?', !!badge);
  if (!hasClass && !badge) { console.error('Expected visual warning (class or badge) for placa'); process.exit(4); }

  console.log('test-placa-warning-jsdom passed'); process.exit(0);
})().catch(e=>{ console.error(e && e.stack?e.stack:e); process.exit(1); });
