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
  const baseHtml = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8').replace(/<script[\s\S]*?<\/script>/gi,'') : '<html><body><div id="registro"></div><div id="register-table-wrapper"></div></body></html>';
  const dom = new JSDOM(baseHtml, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom; global.window = window; global.document = window.document; global.navigator = window.navigator; global.app = window.app = window.app || {};

  loadCode(dom, 'js/utils/helpers.js');
  loadCode(dom, 'js/modules/Registro/validation.js');
  loadCode(dom, 'js/modules/Registro/registro.js');
  loadCode(dom, 'js/modules/Registro/table.js');

  await new Promise(r => setTimeout(r, 50));

  app.data = app.data || {};
  app.data.mecanicosData = [];
  app.data.catalogData = [];
  // Build sample records: one without createdAt (older), one with recent createdAt
  const older = { id:'R1', fecha: '2025-09-28', placa:'AAA111', cliente:'X', productos:[], mecanicos:[], total:0 };
  const newer = { id:'R2', fecha: '2025-09-29', placa:'BBB222', cliente:'Y', productos:[], mecanicos:[], total:0, createdAt: new Date(Date.now()+1000).toISOString() };
  const middle = { id:'R3', fecha: '2025-09-29', placa:'CCC333', cliente:'Z', productos:[], mecanicos:[], total:0, createdAt: new Date(Date.now()-1000).toISOString() };
  app.data.registerData = [older, middle, newer];

  // Prepare table DOM
  const wrapper = document.createElement('div'); wrapper.id='register-table-wrapper'; wrapper.innerHTML = '<table id="register-table"><thead><tr><th>Fecha</th></tr></thead><tbody></tbody></table>';
  document.body.appendChild(wrapper);

  // Call update
  if (typeof app.updateRegisterTable === 'function') app.updateRegisterTable(); else { console.error('updateRegisterTable not found'); process.exit(2); }

  // Inspect first row: should be 'R2' (newer)
  const tbody = document.querySelector('#register-table tbody');
  const firstRowId = tbody && tbody.querySelector('tr') && tbody.querySelector('tr').getAttribute('data-registro-id');
  console.log('first row id:', firstRowId);
  if (firstRowId !== 'R2') { console.error('Expected first row R2 (most recent), got', firstRowId); process.exit(3); }

  // Also test fallback: remove createdAt from newer, set fecha newer to newest
  app.data.registerData = [{...older, fecha:'2025-09-28'}, {...middle, createdAt:undefined, fecha:'2025-09-30', id:'R4'}, {...newer, createdAt:undefined}];
  app.updateRegisterTable();
  const firstRowId2 = document.querySelector('#register-table tbody tr').getAttribute('data-registro-id');
  console.log('first row id after fallback:', firstRowId2);
  if (firstRowId2 !== 'R4') { console.error('Expected first row R4 by fecha fallback, got', firstRowId2); process.exit(4); }

  console.log('test-orden-registros-jsdom passed'); process.exit(0);
})().catch(e=>{ console.error(e && e.stack?e.stack:e); process.exit(1); });
