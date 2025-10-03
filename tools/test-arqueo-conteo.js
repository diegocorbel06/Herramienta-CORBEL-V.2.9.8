// Test para validar redistribución de conteo y sugerencia
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

async function run() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window; global.document = window.document; global.app = window.app = window.app || {};

  const load = (p) => {
    const full = path.join(__dirname, '..', p);
    const code = fs.readFileSync(full, 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  };

  load('js/utils/helpers.js');
  load('js/modules/arqueo.js');

  await new Promise(r => setTimeout(r,200));

  // Prepare DOM elements expected
  document.body.innerHTML += '<div id="arqueo-resumen"></div>';
  document.body.innerHTML += '<input id="arqueo-fecha" value="2025-10-01" />';
  document.body.innerHTML += '<input id="arqueo-saldo-inicial" value="0" />';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="100" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="50" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="20" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="10" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="5" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="2" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="1" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="0.5" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="0.2" /></div>';
  document.body.innerHTML += '<div class="den-row"><input class="den-input" data-den="0.1" /></div>';
  document.body.innerHTML += '<span id="total-efectivo-contado">0.00</span>';
  document.body.innerHTML += '<input id="total-efectivo-contado-input" value="0.00" />';

  // Setup sample data
  if (!app.data) app.data = {};
  app.data.registerData = [{ id:'T1', fecha:'2025-10-01', tipo:'VENTA', total: 75.3, metodosPago:[{metodo:'Efectivo', monto:75.3}] }];
  app.registroUtils = { toInputDate:(d)=>d, toDisplayDate:(d)=>d };

  // Call calcularArqueoCaja to set efectivoRegistrado
  app.calcularArqueoCaja();
  await new Promise(r=>setTimeout(r,50));
  console.log('efectivoRegistrado:', app.arqueoData.efectivoRegistrado, 'efectivoContado:', app.arqueoData.efectivoContado);

  // Now test distribute
  app.distributeAmountToDenoms(75.3);
  await new Promise(r=>setTimeout(r,50));
  const inputs = Array.from(document.querySelectorAll('.den-input'));
  const total = inputs.reduce((acc,i)=> acc + (parseFloat(i.getAttribute('data-den'))||0) * (parseFloat(i.value)||0), 0);
  console.log('distributed total:', total.toFixed(2));

  // Test manual override input
  const tin = document.getElementById('total-efectivo-contado-input'); tin.value = '40.00';
  tin.dispatchEvent(new window.Event('input'));
  await new Promise(r=>setTimeout(r,50));
  console.log('after manual override total span:', document.getElementById('total-efectivo-contado').textContent);

  console.log('Conteo test finished');
}

run().catch(e=>{ console.error('Test failed', e); process.exit(2); });
