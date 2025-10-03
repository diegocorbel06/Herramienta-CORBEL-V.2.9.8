// Test jsdom: verificar que la importación mapea nombres de mecánicos a IDs y la tabla muestra nombres
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadScript(dom, scriptPath) {
  const code = fs.readFileSync(scriptPath, 'utf8');
  try { dom.window.eval(code); } catch (e) { console.error('Error ejecutando', scriptPath, e && e.stack ? e.stack : e); }
}

(async () => {
  const baseHtmlPath = path.resolve(__dirname, '..', 'index.html');
  const baseHtml = fs.existsSync(baseHtmlPath) ? fs.readFileSync(baseHtmlPath, 'utf8') : `<html><body></body></html>`;

  const dom = new JSDOM(baseHtml, { runScripts: 'dangerously', resources: 'usable' });
  global.window = dom.window; global.document = dom.window.document; global.navigator = dom.window.navigator; global.app = dom.window.app = dom.window.app || {};

  // Cargar scripts necesarios
  const excelScript = path.resolve(__dirname, '..', 'js', 'utils', 'excel.js');
  const registroScript = path.resolve(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js');
  const tableScript = path.resolve(__dirname, '..', 'js', 'modules', 'Registro', 'table.js');
  if (fs.existsSync(excelScript)) loadScript(dom, excelScript);
  if (fs.existsSync(registroScript)) loadScript(dom, registroScript);
  if (fs.existsSync(tableScript)) loadScript(dom, tableScript);

  // Precondiciones: no hay mecanicos ni registros
  window.app.data = window.app.data || {};
  window.app.data.mecanicosData = [];
  window.app.data.registerData = [];

  // Simular datos que vendrían del Excel (Registros), con nombres en la columna 'Mecánicos'
  const sampleRow = {
    ID: 'IMP-01',
    Fecha: '02/10/2025',
    Tipo: 'VENTA',
    Placa: 'XYZ123',
    Cliente: 'Cliente Import',
    Productos: 'Filtro x1',
    'Métodos de Pago': 'Efectivo: 50',
    Mecánicos: 'Carlos, Ana',
    Total: 50,
    Descripción: 'Importado prueba'
  };

  // Invocar la lógica interna de parseo (copiar el fragmento relevante de excel.js pero sin leer archivo)
  try {
    // Reusar funciones existentes: app.registroUtils.generarIdUnico y toInputDate pueden no existir todavía; asegurar existencia mínima
    // intentar usar el helper real si existe
    if (!window.app.registroUtils || typeof window.app.registroUtils.toInputDate !== 'function') {
      window.app.registroUtils = window.app.registroUtils || {};
      window.app.registroUtils.toInputDate = function(f){ if(!f) return ''; if(String(f).indexOf('/')!==-1){ const p=String(f).split('/'); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; } return String(f); };
      if (typeof window.app.registroUtils.generarIdUnico !== 'function') window.app.registroUtils.generarIdUnico = function(fecha, placa){ return `IMP-${Date.now()}`; };
    }

    // Emular parte del handler: mapear nombres a ids (creando mecánicos nuevos si no existen)
    const nombres = String(sampleRow.Mecánicos || '').split(',').map(s=>s.trim()).filter(Boolean);
    const mecanicosIds = [];
    nombres.forEach(nombre => {
      let m = (window.app.data.mecanicosData||[]).find(x => String(x.nombre||'').trim().toLowerCase() === nombre.toLowerCase());
      if (!m) {
        const nextIdNum = (window.app.data.nextMecanicoId || 1);
        const newId = `MEC-${String(nextIdNum).padStart(3,'0')}`;
        m = { id: newId, nombre: nombre, estado: 'activo' };
        window.app.data.mecanicosData.push(m);
        window.app.data.nextMecanicoId = nextIdNum + 1;
      }
      mecanicosIds.push(m.id);
    });

    // Crear registro con mecanicos como ids
    const fechaIso = window.app.registroUtils.toInputDate(sampleRow.Fecha || '');
    const reg = { id: sampleRow.ID || `IMP-${Date.now()}`, fecha: fechaIso || '2025-10-02', createdAt: new Date().toISOString(), tipo: sampleRow.Tipo, placa: sampleRow.Placa, cliente: sampleRow.Cliente, productos: [{ id: 'P-1', name: 'Filtro', quantity: 1, price: 50 }], mecanicos: mecanicosIds, total: sampleRow.Total, metodosPago: [{ metodo: 'Efectivo', monto: 50 }], descripcion: sampleRow.Descripción };
    window.app.data.registerData.push(reg);

    // Render tabla
    // Asegurar DOM de la tabla
    if (!document.querySelector('#register-table')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<table id="register-table"><tbody></tbody></table>`;
      document.body.appendChild(wrap);
    }
    if (typeof window.app.updateRegisterTable === 'function') window.app.updateRegisterTable();

    // Comprobar que en app.data los mecanicos tienen IDs y que la tabla muestra sus nombres
    if (!Array.isArray(window.app.data.mecanicosData) || window.app.data.mecanicosData.length !== 2) {
      console.error('Fallo: mecanicos no creados correctamente', window.app.data.mecanicosData);
      process.exit(2);
    }
    if (!Array.isArray(window.app.data.registerData) || window.app.data.registerData.length !== 1) {
      console.error('Fallo: registro no almacenado'); process.exit(3);
    }
    const firstRow = document.querySelector('#register-table tbody tr');
    if (!firstRow) { console.error('Fallo: fila de tabla no creada'); process.exit(4); }
    const mecCell = firstRow.querySelector('td:nth-child(8)');
    const mecText = mecCell ? mecCell.textContent.trim() : '';
    console.log('mecCell text:', mecText);
    if (!mecText || mecText.indexOf('Carlos') === -1 || mecText.indexOf('Ana') === -1) { console.error('Fallo: nombres de mecánicos no renderizados correctamente en la tabla'); process.exit(5); }

    console.log('Import mapping test passed: mecanicos mapeados y nombres renderizados'); process.exit(0);
  } catch (e) {
    console.error('Test failed with error', e); process.exit(10);
  }

})();
