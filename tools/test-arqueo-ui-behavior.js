// Test minimal for arqueo UI behavior: filter and sort
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
const { window } = dom;
// expose minimal app and data used by arqueo module
window.app = window.app || {};
window.app.setCurrentDate = () => '2025-10-02';
window.app.empresaNombre = 'TestShop';
window.app.data = { registerData: [
    { fecha: '2025-10-02', tipo: 'VENTA', total: 50, metodosPago: [{metodo:'Efectivo', monto:30},{metodo:'Tarjeta', monto:20}] },
    { fecha: '2025-10-02', tipo: 'VENTA', total: 40, metodosPago: [{metodo:'Efectivo', monto:40}] }
] };

// Inject arqueo module script source directly so app.getArqueoHTML is available synchronously
try {
    const arqueoSrc = fs.readFileSync('js/modules/arqueo.js', 'utf8');
    const s = dom.window.document.createElement('script');
    s.textContent = arqueoSrc;
    dom.window.document.body.appendChild(s);
} catch (e) { console.warn('Could not inject arqueo.js for test', e); }

// wait for scripts to load and ensure the arqueo inputs exist
const waitFor = (selector, timeout = 3000) => new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
        const el = dom.window.document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for ' + selector));
        setTimeout(tick, 50);
    };
    tick();
});

(async ()=>{
    try {
        // wait until app.getArqueoHTML is available (scripts loaded)
        const waitForFunc = (name, timeout = 3000) => new Promise((res, rej) => {
            const start = Date.now();
            const tick = () => {
                if (window.app && typeof window.app.getArqueoHTML === 'function') return res(true);
                if (Date.now() - start > timeout) return rej(new Error('Timeout waiting for app.getArqueoHTML'));
                setTimeout(tick, 50);
            };
            tick();
        });
        await waitForFunc('getArqueoHTML', 3000);
        // ensure arqueo HTML is present: inject it into #arqueo
        const cont = dom.window.document.getElementById('arqueo');
        if (cont) cont.innerHTML = window.app.getArqueoHTML();
        // then initialize tab
        if (typeof window.app.initArqueoTab === 'function') window.app.initArqueoTab();
        const fechaEl = await waitFor('#arqueo-fecha');
        // set single-date input and trigger change so the module updates
        fechaEl.value = '2025-10-02';
        fechaEl.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        if (typeof window.app.calcularArqueoPorRango === 'function') await window.app.calcularArqueoPorRango('2025-10-02','2025-10-02',0);
        // wait for table
        await new Promise(r => setTimeout(r, 200));
        const tbody = dom.window.document.querySelector('#arqueo-table-medios tbody');
        if (!tbody) throw new Error('Tabla de medios no encontrada');
        let rows = Array.from(tbody.querySelectorAll('tr'));
        if (rows.length < 2) throw new Error('Se esperaban al menos 2 métodos en la tabla');
        // test filter
        const sel = dom.window.document.getElementById('arqueo-filtro-metodo');
        sel.value = 'Tarjeta';
        sel.dispatchEvent(new dom.window.Event('change'));
        await new Promise(r => setTimeout(r, 200));
        rows = Array.from(tbody.querySelectorAll('tr'));
        const visible = rows.filter(r => r.style.display !== 'none');
        if (visible.length !== 1) throw new Error('Filtro no funcionó (esperando 1 fila)');
        // test sort
        const ord = dom.window.document.getElementById('arqueo-orden-desc');
        ord.click();
        await new Promise(r => setTimeout(r, 200));
        const values = Array.from(dom.window.document.querySelectorAll('#arqueo-table-medios tbody tr')).map(r=> parseFloat(r.children[1].textContent.replace(/[S/\s]/g,'')) );
        if (!(values[0] >= values[1])) throw new Error('Orden descendente falló');
        console.log('UI behavior test passed');
        process.exit(0);
    } catch (e) {
        console.error('Error in test', e);
        process.exit(1);
    }
})();
