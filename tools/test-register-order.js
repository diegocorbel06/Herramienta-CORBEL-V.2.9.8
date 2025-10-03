// Test jsdom: verificar que la tabla muestra registros en orden descendente por createdAt
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadScript(dom, scriptPath) {
  const code = fs.readFileSync(scriptPath, 'utf8');
  try { dom.window.eval(code); } catch (e) { console.error('Error ejecutando', scriptPath, e && e.stack ? e.stack : e); }
}

(async () => {
  const baseHtmlPath = path.resolve(__dirname, '..', 'index.html');
  const baseHtml = fs.existsSync(baseHtmlPath) ? fs.readFileSync(baseHtmlPath, 'utf8') : `<html><body><table id="register-table"><tbody></tbody></table></body></html>`;

  const dom = new JSDOM(baseHtml, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window; global.document = window.document; global.navigator = window.navigator; global.app = window.app = window.app || {};

  // cargar módulos necesarios
  const registroScript = path.resolve(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js');
  const tableScript = path.resolve(__dirname, '..', 'js', 'modules', 'Registro', 'table.js');
  if (fs.existsSync(registroScript)) loadScript(dom, registroScript);
  if (fs.existsSync(tableScript)) loadScript(dom, tableScript);

  // Asegurar que exista una tabla de registros en el DOM para que la función de render la llene
  if (!document.querySelector('#register-table')) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="table-container">
        <table id="register-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>ID</th></tr></thead><tbody></tbody></table>
      </div>`;
    document.body.appendChild(wrap);
  }

  // preparar datos: tres registros con distintos createdAt
  window.app.data = window.app.data || {};
  window.app.data.mecanicosData = [ { id: 'MEC-001', nombre: 'Pedro' } ];
  window.app.data.registerData = [
    { id: 'R1', fecha: '2025-09-30', createdAt: '2025-09-30T09:00:00Z', mecanicos: ['MEC-001'], total: 10 },
    { id: 'R2', fecha: '2025-10-01', createdAt: '2025-10-01T10:00:00Z', mecanicos: ['MEC-001'], total: 20 },
    { id: 'R3', fecha: '2025-10-02', createdAt: '2025-10-02T12:00:00Z', mecanicos: ['MEC-001'], total: 30 }
  ];

  // Ejecutar render
  try {
    if (typeof window.app.updateRegisterTable === 'function') window.app.updateRegisterTable();
    else if (typeof window.app.updateRegisterTableFiltered === 'function') window.app.updateRegisterTableFiltered(window.app.data.registerData);
  } catch (e) { console.error('update render error', e); process.exit(2); }

  // Inspeccionar primer <tr>
  const tbody = document.querySelector('#register-table tbody');
  if (!tbody) { console.error('No se encontró tbody'); process.exit(3); }
  const firstRow = tbody.querySelector('tr');
  if (!firstRow) { console.error('No se generaron filas'); process.exit(4); }
  const idCell = firstRow.querySelector('td:nth-child(3)');
  const firstId = idCell ? idCell.textContent.trim() : null;
  console.log('first row id:', firstId);
  if (firstId !== 'R3') { console.error('Orden incorrecto: se esperaba R3 en la primera fila'); process.exit(5); }
  console.log('Orden de tabla verificado: newest→oldest (por createdAt)');

  // Ahora togglear la preferencia y re-renderizar para comprobar ascendiente
  window.app.data.registerSortDesc = false;
  try { if (typeof window.app.updateRegisterTable === 'function') window.app.updateRegisterTable(); else if (typeof window.app.updateRegisterTableFiltered === 'function') window.app.updateRegisterTableFiltered(window.app.data.registerData); } catch(e) { console.error('re-render after toggle failed', e); process.exit(6); }
  const firstRowAsc = document.querySelector('#register-table tbody tr');
  const firstIdAsc = firstRowAsc ? (firstRowAsc.querySelector('td:nth-child(3)') && firstRowAsc.querySelector('td:nth-child(3)').textContent.trim()) : null;
  console.log('first row id after toggle (asc):', firstIdAsc);
  if (firstIdAsc !== 'R1') { console.error('Orden ascendente incorrecto: se esperaba R1 en la primera fila'); process.exit(7); }

  console.log('Orden de tabla verificado: ascendente tras toggle');
  process.exit(0);
})();
