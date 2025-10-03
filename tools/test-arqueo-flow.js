// Test para flujo de arqueo: calcular -> crear cierre -> editar -> eliminar
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

async function run() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;
  global.window = window; global.document = window.document; global.navigator = window.navigator; global.app = window.app = window.app || {};

  // Load app scripts used by arqueo
  const load = (p) => {
    const full = path.join(__dirname, '..', p);
    const code = fs.readFileSync(full, 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  };

  // Load helpers and arqueo module
  load('js/utils/helpers.js');
  load('js/modules/arqueo.js');

  // Wait a bit
  await new Promise(r => setTimeout(r, 200));

  // Prepare minimal app.data and registroUtils
  if (!app.data) app.data = {};
  app.data.registerData = [];
  app.registroUtils = app.registroUtils || {};
  app.registroUtils.toInputDate = (d) => d; // pass-through
  app.registroUtils.toDisplayDate = (d) => d;

  // Create sample registros inside app.data
  app.data.registerData.push({ id: 'T1', fecha: '2025-10-01', tipo: 'VENTA', total: 100, metodosPago: [{ metodo: 'Efectivo', monto: 60 }, { metodo: 'Tarjeta', monto: 40 }] });
  app.data.registerData.push({ id: 'T2', fecha: '2025-10-01', tipo: 'GASTO', total: 20, metodosPago: [{ metodo: 'Efectivo', monto: 20 }] });

  // Set input elements expected by calcularArqueoPorRango
  const container = document.createElement('div');
  container.innerHTML = '<input id="arqueo-fecha" value="2025-10-01" /><input id="arqueo-saldo-inicial" value="0" />';
  document.body.appendChild(container);

  // Call calcularArqueoCaja and verificar estado
  if (typeof app.calcularArqueoCaja === 'function') app.calcularArqueoCaja();
  await new Promise(r=>setTimeout(r,50));
  console.log('Ingresos:', app.arqueoData.ingresos, 'Egresos:', app.arqueoData.egresos, 'TotalesPorMetodo:', app.arqueoData.totalesPorMetodo);

  // Realizar cierre
  if (typeof app.realizarCierreCaja === 'function') app.realizarCierreCaja();
  console.log('RegistrosArqueo length after cierre:', app.arqueoData.registrosArqueo.length);

  // If service exists, test editarCierre and eliminarCierre
  if (window.arqueoCajaService && typeof window.arqueoCajaService.getHistorial === 'function') {
    const hist = window.arqueoCajaService.getHistorial();
    console.log('Service historial length:', hist.length);
    const id = hist[hist.length-1] && hist[hist.length-1].id;
    if (id && window.arqueoCajaService.editarCierre) {
      window.arqueoCajaService.editarCierre(id, { ingresos: 200 });
      const updated = window.arqueoCajaService.getHistorial().find(h=>h.id===id);
      console.log('Edited ingreso:', updated.ingresos);
      // delete
      window.arqueoCajaService.eliminarCierre(id);
      const afterDel = window.arqueoCajaService.getHistorial().find(h=>h.id===id);
      console.log('After delete exists:', !!afterDel);
    }
  }

  console.log('Arqueo flow test finished');
}

run().catch(e=>{ console.error('Test failed', e); process.exit(2); });
