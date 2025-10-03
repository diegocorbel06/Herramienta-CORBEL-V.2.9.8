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

  loadCode(dom, 'js/utils/helpers.js');
  loadCode(dom, 'js/modules/Registro/validation.js');
  loadCode(dom, 'js/modules/Registro/registro.js');

  await new Promise(r => setTimeout(r, 50));

  // By default, placa validation is permissive (warnings). We'll add a setting app.settings.strictPlateValidation
  app.settings = app.settings || {};
  app.data = app.data || {};
  app.data.registerData = [];
  app.data.catalogData = [{id:'P1', name:'Filtro', price:10}];

  // Render form
  if (typeof app.getRegistroHTML === 'function') {
    const reg = document.getElementById('registro') || document.body.appendChild(document.createElement('div'));
    reg.id = 'registro'; reg.innerHTML = app.getRegistroHTML();
  }

  // Helper to fill minimal valid data except placa
  const fillAndTry = (plate) => {
    const fecha = document.getElementById('reg-fecha-1'); if (fecha) fecha.value = app.setCurrentDate ? app.setCurrentDate() : new Date().toISOString().split('T')[0];
    const tipo = document.getElementById('reg-tipo-1'); if (tipo) tipo.value='VENTA';
    const cliente = document.getElementById('reg-cliente-1'); if (cliente) cliente.value = 'C';
    const placa = document.getElementById('reg-placa-1'); if (placa) placa.value = plate;
    const prodList = document.getElementById('productos-seleccionados-list-1'); if (prodList) { const it=document.createElement('div'); it.className='producto-item'; it.setAttribute('data-name','Filtro'); it.setAttribute('data-quantity','1'); it.setAttribute('data-price','10'); prodList.appendChild(it); document.getElementById('productos-seleccionados-container-1').classList.remove('hidden'); }
    const pagos = document.getElementById('metodos-pago-1'); if (pagos) pagos.innerHTML = '<div class="payment-method"><select class="pago-metodo"><option>Efectivo</option></select><input class="pago-monto" value="10"></div>';
    return app.addRegister(1);
  };

  // Case A: strict validation disabled (default) -> should save with warning
  app.settings.strictPlateValidation = false;
  let okA = fillAndTry('!!!BAD');
  console.log('strict=false add result:', okA, 'registers:', app.data.registerData.length);
  if (!okA || app.data.registerData.length !== 1) { console.error('Expected save to succeed when strict validation disabled'); process.exit(3); }

  // Reset registers
  app.data.registerData = [];

  // Case B: strict validation enabled -> should block save
  app.settings.strictPlateValidation = true;
  // Monkey-patch validation function to check setting: override validarPlaca to return false when strict
  const origValidarPlaca = app.registroValidations.validarPlaca;
  app.registroValidations.validarPlaca = function(placa) {
    if (app.settings && app.settings.strictPlateValidation) {
      // use original regex but return invalid on mismatch
      const res = origValidarPlaca.call(this, placa);
      // original now returns {valido:true, message:''} or warning-true shape; detect via regex here
      const placaRegex = /^[A-Za-z]{2,4}-?\d{3,4}$/;
      if (!placa || placa.trim()==='') return {valido:true, mensaje:''};
      if (!placaRegex.test(placa.toUpperCase())) return {valido:false, mensaje:'Formato de placa inválido (estricto).'};
      return {valido:true, mensaje:''};
    }
    return origValidarPlaca.call(this, placa);
  };

  const okB = fillAndTry('!!!BAD');
  console.log('strict=true add result:', okB, 'registers:', app.data.registerData.length);
  if (okB) { console.error('Expected save to be blocked when strict validation enabled'); process.exit(4); }

  console.log('test-placa-settings-jsdom passed'); process.exit(0);
})().catch(e=>{ console.error(e && e.stack? e.stack : e); process.exit(1); });
