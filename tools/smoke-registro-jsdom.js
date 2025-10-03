// Smoke test usando jsdom para simular UI básica
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
// Remove script tags to avoid executing page scripts automatically in jsdom
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

async function run() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  // Ensure window.confirm exists in jsdom window
  try { Object.defineProperty(window, 'confirm', { value: () => true, configurable: true }); global.confirm = window.confirm; } catch (e) {}
  // provide minimal globals expected by modules
  window.app = window.app || {};
  global.app = window.app;

  // Load app scripts (helpers, registro modules)
  const load = (p) => {
    const full = path.join(__dirname, '..', p);
    const code = fs.readFileSync(full, 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  };

  // Load utilities and registro module
  load('js/utils/helpers.js');
  load('js/modules/Registro/validation.js');
  load('js/modules/Registro/registro.js');

  // Wait small time for any onload wiring
  await new Promise(r => setTimeout(r, 200));

  // Initialize data for test
  if (!app.data) app.data = {};
  app.data.mecanicosData = [{id:'M1', nombre:'Ana'},{id:'M2',nombre:'Luis'}];
  app.data.catalogData = [{id:'P1', name:'Filtro', price:20}];
  app.data.registerData = [];

  // Initialize UI
  // Render registro HTML into page and initialize
  if (typeof app.getRegistroHTML === 'function') {
    const regContainer = document.getElementById('registro');
    if (regContainer) regContainer.innerHTML = app.getRegistroHTML();
  }
  if (typeof app.initRegistroTab === 'function') app.initRegistroTab();

  // Stubs for jsdom environment
  if (typeof window.confirm !== 'function') window.confirm = () => true;
  if (typeof app.saveToLocalStorage !== 'function') app.saveToLocalStorage = () => {};

  // Simulate filling form 1 for Venta sin vehículo
  const sinVeh = document.getElementById('reg-sin-vehiculo-1');
  if (sinVeh) sinVeh.checked = true;
  if (typeof app.handleSinVehiculoChange === 'function') app.handleSinVehiculoChange(1);
  const cliente = document.getElementById('reg-cliente-1'); if (cliente) cliente.value = 'Cliente Test';
  // add product via modal substitute (call submitProductModal directly)
  if (typeof app.submitProductModal === 'function') {
    // set modal inputs by creating them temporarily
    const body = document.body;
    const mn = document.createElement('input'); mn.id='modal-product-name'; mn.value='Filtro'; body.appendChild(mn);
    const mq = document.createElement('input'); mq.id='modal-product-qty'; mq.value='2'; body.appendChild(mq);
    const mp = document.createElement('input'); mp.id='modal-product-price'; mp.value='20'; body.appendChild(mp);
    app.submitProductModal(1);
  }
  // Add a payment method element manually
  const pagos = document.getElementById('metodos-pago-1');
  if (pagos) {
    pagos.innerHTML = `<div class="payment-method"><select class="pago-metodo"><option value="Efectivo">Efectivo</option></select><input class="pago-monto" value="40"></div>`;
  }
  // Trigger addRegister
  if (typeof app.addRegister === 'function') app.addRegister(1);

  // Check register created
  const created = app.data.registerData && app.data.registerData.length > 0;
  console.log('Venta sin vehículo created:', created);

  // Now create a GASTO using the gasto inputs
  const tipo = document.getElementById('reg-tipo-1'); if (tipo) tipo.value='GASTO';
  if (typeof app.handleTipoChange === 'function') app.handleTipoChange(1);
  const gname = document.getElementById('reg-gasto-nombre-1'); if (gname) gname.value = 'Compra Aceite';
  const gunits = document.getElementById('reg-gasto-unidades-1'); if (gunits) gunits.value='3';
  const gprice = document.getElementById('reg-gasto-precio-1'); if (gprice) gprice.value='15';
  // add gasto to selection
  if (typeof app.addGastoToSelection === 'function') app.addGastoToSelection(1);
  // add payment
  if (pagos) pagos.innerHTML = `<div class="payment-method"><select class="pago-metodo"><option value="Efectivo">Efectivo</option></select><input class="pago-monto" value="45"></div>`;
  if (typeof app.addRegister === 'function') app.addRegister(1);

  console.log('Total registros tras gasto:', app.data.registerData.length);

  // Check receipt preview generation for first registro
  if (typeof app.previewReceiptFromRegistro === 'function') {
    const id = app.data.registerData[0] && app.data.registerData[0].id;
    if (id) {
      app.previewReceiptFromRegistro(id);
      const preview = document.getElementById('receipt-preview');
      console.log('Receipt preview exists:', !!(preview && preview.innerHTML && preview.innerHTML.length>0));
    }
  }

  // Finish
  console.log('Smoke test finished');
}

run().catch(e=>{ console.error('Smoke failed', e); process.exit(2); });
