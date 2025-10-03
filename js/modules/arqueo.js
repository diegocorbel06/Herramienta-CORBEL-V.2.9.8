// =============================================
// ARCHIVO: js/modules/arqueo.js
// Módulo de Arqueo de Caja
// =============================================

/**
 * Módulo de Arqueo de Caja
 * Permite visualizar y controlar ingresos, egresos, saldo inicial/final y cierre de caja.
 * Integra registros de ventas y gastos.
 */

app.arqueoData = {
    saldoInicial: 0,
    saldoFinal: 0,
    ingresos: 0,
    egresos: 0,
    cierreRealizado: false,
    fechaCierre: null,
    efectivoContado: 0,
    totalesPorMetodo: {},
    registrosArqueo: [] // Historial de arqueos
};

// =============================================
// ARCHIVO: js/modules/arqueo.js
// Módulo de Arqueo de Caja
// =============================================

/**
 * Módulo de Arqueo de Caja
 * Permite visualizar y controlar ingresos, egresos, saldo inicial/final y cierre de caja.
 * Integra registros de ventas y gastos.
 */

app.arqueoData = {
    saldoInicial: 0,
    saldoFinal: 0,
    ingresos: 0,
    egresos: 0,
    cierreRealizado: false,
    fechaCierre: null,
    efectivoContado: 0,
    totalesPorMetodo: {},
    registrosArqueo: [] // Historial de arqueos
};

/**
 * Genera el HTML principal del módulo de arqueo
 */
app.getArqueoHTML = function() {
    return `
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-calculator"></i> Arqueo de Caja</h3>
        </div>
        <div id="arqueo-notification" class="notification"></div>

        <!-- Fecha de Arqueo única -->
        <div class="form-row compact-form">
            <div class="form-group">
                <label for="arqueo-fecha"><i class="fas fa-calendar"></i> Fecha de Arqueo</label>
                <input type="date" id="arqueo-fecha" value="${app.setCurrentDate()}" aria-label="Fecha de Arqueo" aria-describedby="arqueo-fecha-help" required />
                <small id="arqueo-fecha-help" class="text-muted">Selecciona la fecha para el arqueo (solo un arqueo por día).</small>
            </div>
            <div class="form-group">
                <label for="arqueo-saldo-inicial"><i class="fas fa-money-bill-wave"></i> Saldo Inicial</label>
                <input type="number" id="arqueo-saldo-inicial" min="0" step="0.01" value="${app.arqueoData.saldoInicial}" />
            </div>
            <div class="form-group" style="align-self:end;">
                <button class="btn btn-primary" id="btn-calcular-rango" title="Calcular Arqueo para la fecha seleccionada" aria-label="Calcular Arqueo"> 
                    <i class="fas fa-search"></i> Calcular Arqueo
                </button>
            </div>
        </div>

        <!-- Grid lateral: conteo (izq) + resumen (der) -->
        <div class="arqueo-grid">
            <div class="arqueo-conteo arqueo-block" id="arqueo-conteo" aria-label="Conteo de billetes y monedas">
                <h4 class="no-margin">Conteo (S/)</h4>
                <div class="conteo-vertical">
                <div class="den-row"><label>S/ 200</label><input type="number" min="0" class="den-input" data-den="200" id="billete-200" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad billete 200" /><span class="den-subtotal" data-den="200">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 100</label><input type="number" min="0" class="den-input" data-den="100" id="billete-100" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad billete 100" /><span class="den-subtotal" data-den="100">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 50</label><input type="number" min="0" class="den-input" data-den="50" id="billete-50" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad billete 50" /><span class="den-subtotal" data-den="50">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 20</label><input type="number" min="0" class="den-input" data-den="20" id="billete-20" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad billete 20" /><span class="den-subtotal" data-den="20">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 10</label><input type="number" min="0" class="den-input" data-den="10" id="billete-10" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad billete 10" /><span class="den-subtotal" data-den="10">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 5</label><input type="number" min="0" class="den-input" data-den="5" id="moneda-5" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 5" /><span class="den-subtotal" data-den="5">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 2</label><input type="number" min="0" class="den-input" data-den="2" id="moneda-2" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 2" /><span class="den-subtotal" data-den="2">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 1</label><input type="number" min="0" class="den-input" data-den="1" id="moneda-1" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 1" /><span class="den-subtotal" data-den="1">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 0.50</label><input type="number" min="0" class="den-input" data-den="0.5" id="moneda-050" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 0.5" /><span class="den-subtotal" data-den="0.5">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 0.20</label><input type="number" min="0" class="den-input" data-den="0.2" id="moneda-020" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 0.2" /><span class="den-subtotal" data-den="0.2">S/ 0.00</span></div>
                <div class="den-row"><label>S/ 0.10</label><input type="number" min="0" class="den-input" data-den="0.1" id="moneda-010" value="0" oninput="app.calcularConteoEfectivo()" aria-label="Cantidad moneda 0.1" /><span class="den-subtotal" data-den="0.1">S/ 0.00</span></div>
                </div>
                <!-- Botones de acción colocados por debajo del conteo, con etiquetas más intuitivas -->
                <div class="mt-8 conteo-actions conteo-actions-bottom">
                    <div class="large-text">
                        <strong>Total Efectivo Contado: S/ <span id="total-efectivo-contado">0.00</span></strong>
                        <div style="display:inline-block; margin-left:12px;"><input id="total-efectivo-contado-input" type="number" step="0.01" style="width:110px" value="0.00" aria-label="Total efectivo contado" /></div>
                        <small id="arqueo-override-note" style="margin-left:8px; color:#666; display:none;">(Override)</small>
                    </div>
                        <div class="d-flex gap-8 actions-row">
                            <button class="btn small" id="arqueo-clear-denoms" title="Limpiar todas las cantidades del conteo" aria-label="Limpiar conteo"> <i class="fas fa-broom"></i> Limpiar conteo</button>
                            <button class="btn small" id="arqueo-fill-from-total" title="Distribuir el monto del input Total a las denominaciones" aria-label="Distribuir desde total"> <i class="fas fa-sync-alt"></i> Distribuir desde total</button>
                            <button class="btn small" id="arqueo-fill-from-registered" title="Usar el efectivo registrado como sugerencia para el conteo" aria-label="Usar efectivo registrado"> <i class="fas fa-money-bill-wave"></i> Usar efectivo registrado</button>
                            <span id="arqueo-action-badge" class="action-badge" aria-hidden="true" style="display:none;">✔</span>
                        </div>
                    <div class="d-flex gap-8 actions-row" style="margin-top:8px;">
                        <button class="btn btn-warning small" id="btn-guardar-borrador" title="Guardar un borrador local del conteo" aria-label="Guardar borrador"><i class="fas fa-save"></i> Guardar Borrador</button>
                        <button class="btn btn-success" id="btn-cierre-caja"><i class="fas fa-lock"></i> Confirmar Cierre</button>
                    </div>
                </div>
            </div>

            <!-- Resumen a la derecha del conteo -->
            <aside class="arqueo-resumen" id="arqueo-resumen" role="complementary" aria-label="Resumen de arqueo"></aside>
        </div>

        <div class="arqueo-historial" id="arqueo-historial"></div>
    </div>`;
};

// Calcula el total de efectivo contado en arqueo
app.calcularConteoEfectivo = function() {
    const inputs = Array.from(document.querySelectorAll('.den-input'));
    let total = 0;
    inputs.forEach(i => {
        const den = parseFloat(i.getAttribute('data-den')) || 0;
        let qty = parseFloat(i.value) || 0;
        if (qty < 0) { qty = 0; i.value = '0'; }
        const subtotal = +(den * qty);
        total += subtotal;
        // actualizar subtotal visual para esta denominación
        try {
            const span = document.querySelector('.den-subtotal[data-den="' + i.getAttribute('data-den') + '"]');
            if (span) span.textContent = 'S/ ' + subtotal.toFixed(2);
        } catch (e) {}
    });
    total = +total.toFixed(2);
    const totalSpan = document.getElementById('total-efectivo-contado');
    if (totalSpan) totalSpan.textContent = total.toFixed(2);
    // guardar en el estado y refrescar resumen para mantener coherencia
    app.arqueoData.efectivoContado = total;
    // si ya hay una fecha seleccionada, recalcular resumen para mostrar diferencias
    try { app.renderArqueoResumen(); } catch (e) {}
    return total;
};

// bandera interna para evitar loops al actualizar inputs programáticamente
app._arqueoProgrammaticUpdate = false;

// cuando el usuario modifica el total manualmente, redistribuir a denominaciones
app.initArqueoTotalInput = function() {
    const totalInput = document.getElementById('total-efectivo-contado-input');
    if (!totalInput) return;
    totalInput.addEventListener('input', (e)=>{
        if (app._arqueoProgrammaticUpdate) return;
        const val = Math.max(0, parseFloat(e.target.value) || 0);
        app._arqueoProgrammaticUpdate = true;
        app.distributeAmountToDenoms(val);
        // set span and state
        const span = document.getElementById('total-efectivo-contado'); if (span) span.textContent = val.toFixed(2);
        app.arqueoData.efectivoContado = val;
        document.getElementById('arqueo-override-note').style.display = 'inline-block';
        app._arqueoProgrammaticUpdate = false;
    });
};

// Distribuir un monto a las denominaciones mostrando los inputs
app.distributeAmountToDenoms = function(amount) {
    // distribuir priorizando billetes y dejando menos de 1 sol para monedas
    let remaining = Math.round(amount * 100) / 100;
    const denoms = [100,50,20,10,5,2,1,0.5,0.2,0.1];
    denoms.forEach(d => {
        const inp = document.querySelector('.den-input[data-den="' + d + '"]');
        if (!inp) return;
        // usar integer math para evitar problemas con floats
        const d100 = Math.round(d * 100);
        const rem100 = Math.round(remaining * 100);
        const qty = Math.floor(rem100 / d100);
        inp.value = qty;
        remaining = Math.round((rem100 - qty * d100)) / 100;
    });
    // sincronizar input manual si existe
    const tin = document.getElementById('total-efectivo-contado-input');
    if (tin) { app._arqueoProgrammaticUpdate = true; tin.value = (amount||0).toFixed(2); const note = document.getElementById('arqueo-override-note'); if (note) note.style.display='none'; app._arqueoProgrammaticUpdate = false; }
    app.calcularConteoEfectivo();
};

/**
 * Inicializa la pestaña de arqueo y carga datos
 */
app.initArqueoTab = function() {
    // evitar inicializar más de una vez
    if (app._arqueoInitialized) {
        // pero refrescar el render
        try { app.renderArqueoResumen(); app.renderArqueoHistorial(); } catch (e){}
        return;
    }
    app._arqueoInitialized = true;
    console.log('Pestaña de arqueo inicializada');
    app.renderArqueoResumen();
    app.renderArqueoHistorial();
    // cargar settings guardados (umbral) desde localStorage
    try {
        const saved = localStorage.getItem('arqueoSettings');
        if (saved) {
            app.arqueoSettings = JSON.parse(saved);
        }
    } catch (e) { app.arqueoSettings = app.arqueoSettings || {}; }
    // enlazar inputs de denominaciones y botones
    setTimeout(() => {
        document.querySelectorAll('.den-input').forEach(inp => inp.addEventListener('input', () => app.calcularConteoEfectivo()));
        const clearBtn = document.getElementById('arqueo-clear-denoms');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.den-input').forEach(i => i.value = '0');
            app.calcularConteoEfectivo();
        });
        const fillBtn = document.getElementById('arqueo-fill-from-total');
        if (fillBtn) fillBtn.addEventListener('click', () => {
            // tomar total calculado y llenarlo por prioridad de billetes
            const total = app.calcularConteoEfectivo();
            // usar total calculado como efectivo contado (sugerencia)
            app.arqueoData.efectivoContado = total;
            // reflect in manual input
            const tin = document.getElementById('total-efectivo-contado-input');
            if (tin) { app._arqueoProgrammaticUpdate = true; tin.value = total.toFixed(2); document.getElementById('arqueo-override-note').style.display='none'; app._arqueoProgrammaticUpdate = false; }
            app.showNotification('Total usado como efectivo contado', 'info', 'arqueo-notification');
            let remaining = Math.round(total * 100) / 100;
            const denoms = [100,50,20,10,5,2,1,0.5,0.2,0.1];
            denoms.forEach(d => {
                const inp = document.querySelector('.den-input[data-den="' + d + '"]');
                if (!inp) return;
                const qty = Math.floor(remaining / d);
                inp.value = qty;
                remaining = +(remaining - qty * d).toFixed(2);
            });
            app.calcularConteoEfectivo();
            // mostrar badge de confirmación breve
            try { app._showArqueoActionBadge('Distribuido'); } catch(e){}
        });
    // Escuchar cambio de fecha única para recalcular arqueo automáticamente
    const fechaArqueoInp = document.getElementById('arqueo-fecha');
    if (fechaArqueoInp) fechaArqueoInp.addEventListener('change', () => app.calcularArqueoCaja());
    // botón de cálculo explícito y actualización en tiempo real desde saldo
    const calcBtn = document.getElementById('btn-calcular-rango');
    if (calcBtn && !calcBtn.dataset.listenerAttached) { calcBtn.addEventListener('click', () => app.calcularArqueoCaja()); calcBtn.dataset.listenerAttached = '1'; }
    const saldoInp = document.getElementById('arqueo-saldo-inicial');
    if (saldoInp && !saldoInp.dataset.listenerAttached) { saldoInp.addEventListener('input', () => app.calcularArqueoCaja()); saldoInp.dataset.listenerAttached='1'; }
    // Export CSV quick button (si existe en UI)
    const exportCsvBtnQuick = document.getElementById('btn-exportar-csv');
    if (exportCsvBtnQuick && !exportCsvBtnQuick.dataset.listenerAttached) { exportCsvBtnQuick.addEventListener('click', () => {
    const fecha = document.getElementById('arqueo-fecha')?.value;
    if (fecha) app.exportArqueoCSV(fecha);
    }); exportCsvBtnQuick.dataset.listenerAttached='1'; }

        const fillRegisteredBtn = document.getElementById('arqueo-fill-from-registered');
        if (fillRegisteredBtn) fillRegisteredBtn.addEventListener('click', () => {
            // usar el efectivo registrado en totales por metodo como sugerencia
            const totales = app.arqueoData.totalesPorMetodo || {};
            const efectivo = totales['Efectivo'] || 0;
            if (efectivo <= 0) {
                app.showNotification('No hay efectivo registrado en el rango seleccionado', 'warning', 'arqueo-notification');
                return;
            }
            app.arqueoData.efectivoContado = efectivo;
            // reflect in manual input
            const tin = document.getElementById('total-efectivo-contado-input');
            if (tin) { app._arqueoProgrammaticUpdate = true; tin.value = efectivo.toFixed(2); document.getElementById('arqueo-override-note').style.display='none'; app._arqueoProgrammaticUpdate = false; }
            app.distributeAmountToDenoms(efectivo);
            app.showNotification('Efectivo registrado usado para sugerir conteo', 'info', 'arqueo-notification');
            try { app._showArqueoActionBadge('Registrado'); } catch(e){}
        });

        // inicializar input total
        app.initArqueoTotalInput();

        // Guardar borrador
        const guardarBtn = document.getElementById('btn-guardar-borrador');
        if (guardarBtn) guardarBtn.addEventListener('click', () => {
            try {
                const draft = {
                    fechaArqueo: document.getElementById('arqueo-fecha')?.value || null,
                    saldoInicial: parseFloat(document.getElementById('arqueo-saldo-inicial')?.value) || 0,
                    denoms: Array.from(document.querySelectorAll('.den-input')).map(i => ({den: i.getAttribute('data-den'), qty: parseInt(i.value)||0})),
                    efectivoContado: parseFloat(document.getElementById('total-efectivo-contado')?.textContent) || 0,
                    totalesPorMetodo: app.arqueoData.totalesPorMetodo || {}
                };
                localStorage.setItem('arqueoDraft', JSON.stringify(draft));
                app.showNotification('Borrador guardado localmente', 'success', 'arqueo-notification');
            } catch (e) { console.warn('Error guardando borrador', e); }
        });

        // Restaurar borrador si existe
        try {
            const savedDraft = localStorage.getItem('arqueoDraft');
            if (savedDraft) {
                const d = JSON.parse(savedDraft);
                // popular campos básicos
                if (d.fechaArqueo) {
                    const el = document.getElementById('arqueo-fecha'); if (el) el.value = d.fechaArqueo;
                }
                if (typeof d.saldoInicial !== 'undefined') document.getElementById('arqueo-saldo-inicial').value = d.saldoInicial;
                if (Array.isArray(d.denoms)) {
                    d.denoms.forEach(item => {
                        const el = document.querySelector('.den-input[data-den="' + item.den + '"]');
                        if (el) el.value = item.qty;
                    });
                }
                if (typeof d.efectivoContado !== 'undefined') {
                    const span = document.getElementById('total-efectivo-contado'); if (span) span.textContent = (d.efectivoContado||0).toFixed(2);
                    const tin = document.getElementById('total-efectivo-contado-input'); if (tin) { app._arqueoProgrammaticUpdate = true; tin.value = (d.efectivoContado||0).toFixed(2); app._arqueoProgrammaticUpdate = false; }
                }
                app.showNotification('Borrador restaurado automáticamente', 'info', 'arqueo-notification');
                app.calcularConteoEfectivo();
            }
        } catch (e) { /* no bloquear inicio */ }

        // listeners para ordenar/filtrar la tabla de medios (si están presentes)
        setTimeout(()=>{
            const filtro = document.getElementById('arqueo-filtro-metodo');
            const ordDesc = document.getElementById('arqueo-orden-desc');
            const ordAsc = document.getElementById('arqueo-orden-asc');
            if (filtro && !filtro.dataset.listenerAttached) { filtro.addEventListener('change', (e)=> app.renderArqueoResumen()); filtro.dataset.listenerAttached = '1'; }
            if (ordDesc && !ordDesc.dataset.listenerAttached) { ordDesc.addEventListener('click', ()=> { app.sortArqueoMedios('desc'); ordDesc.style.display='none'; if (ordAsc) ordAsc.style.display='inline-block'; }); ordDesc.dataset.listenerAttached='1'; }
            if (ordAsc && !ordAsc.dataset.listenerAttached) { ordAsc.addEventListener('click', ()=> { app.sortArqueoMedios('asc'); ordAsc.style.display='none'; if (ordDesc) ordDesc.style.display='inline-block'; }); ordAsc.dataset.listenerAttached='1'; }
        }, 50);
        // guardar settings cuando el usuario cambie el umbral en el modal (si existe)
        document.addEventListener('change', (ev)=>{
            if (ev.target && ev.target.id === 'arqueo-threshold') {
                const v = parseFloat(ev.target.value) || 0;
                app.arqueoSettings = app.arqueoSettings || {};
                app.arqueoSettings.diffThreshold = v;
                try { localStorage.setItem('arqueoSettings', JSON.stringify(app.arqueoSettings)); } catch(e){}
            }
        });

    // Delegación para botones Editar/Eliminar en historial
    const historialDiv = document.getElementById('arqueo-historial');
        if (historialDiv) {
            historialDiv.addEventListener('click', (ev) => {
                const target = ev.target;
                const idx = parseInt(target.getAttribute('data-index'));
                if (target.matches('[data-action="export"]')) {
                    if (!Number.isNaN(idx)) {
                        const r = app.arqueoData.registrosArqueo[idx];
                        // export single cierre to CSV
                        const headers = ['id','fecha','fechaArqueo','saldoInicial','ingresos','egresos','saldoFinal','efectivoContado'];
                        const row = [r.id||'', r.fecha||'', r.fechaArqueo || r.fechaInicio || r.fechaFin || '', (r.saldoInicial||0).toFixed(2), (r.ingresos||0).toFixed(2), (r.egresos||0).toFixed(2), (r.saldoFinal||0).toFixed(2), (r.efectivoContado||0).toFixed(2)];
                        const csv = [headers.join(','), row.join(',')].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'cierre_' + (r.id||'') + '.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
                    }
                    return;
                }
                if (target.matches('.btn-arqueo-delete')) {
                    if (!Number.isNaN(idx)) {
                        const reg = app.arqueoData.registrosArqueo[idx];
                        const proceed = confirm('¿Eliminar cierre de caja del ' + ((app.registroUtils && app.registroUtils.toDisplayDate) ? app.registroUtils.toDisplayDate(reg.fecha) : reg.fecha) + '? Esta acción no se puede deshacer.');
                        if (!proceed) return;
                        if (window && window.arqueoCajaService && typeof window.arqueoCajaService.eliminarCierre === 'function' && reg.id) {
                            try {
                                window.arqueoCajaService.eliminarCierre(reg.id);
                                app.arqueoData.registrosArqueo = window.arqueoCajaService.getHistorial() || [];
                                app.showNotification('Registro eliminado', 'success', 'arqueo-notification');
                                app.renderArqueoHistorial();
                                return;
                            } catch (e) { /* fallback */ }
                        }
                        app.arqueoData.registrosArqueo.splice(idx,1);
                        app.renderArqueoHistorial();
                        app.showNotification('Registro eliminado', 'success', 'arqueo-notification');
                    }
                    return;
                }
                if (target.matches('.btn-arqueo-edit')) {
                    if (!Number.isNaN(idx)) {
                        const reg = app.arqueoData.registrosArqueo[idx];
                        // construir modal de edición completo
                        const modal = document.createElement('div'); modal.className='modal-overlay';
                        // crear campos para totalesPorMetodo
                        let metodoFields = '';
                        const totales = reg.totalesPorMetodo || {};
                        Object.keys(totales).forEach(k=> {
                            metodoFields += '<div class="form-group metodo-row"><label>' + k + '</label><input class="edit-metodo-monto" data-metodo="' + k + '" type="number" step="0.01" value="' + (totales[k]||0).toFixed(2) + '" /></div>';
                        });
                        // allow adding a new metodo
                        metodoFields += '<div class="form-group"><label>Agregar medio</label><input id="new-metodo-name" placeholder="Nombre" /> <input id="new-metodo-monto" type="number" step="0.01" placeholder="Monto" /></div>';
                        modal.innerHTML = '<div class="modal-card">'
                            + '<h4>Editar Cierre - ' + ((app.registroUtils && app.registroUtils.toDisplayDate) ? app.registroUtils.toDisplayDate(reg.fecha) : reg.fecha) + '</h4>'
                            + '<div class="form-group"><label>Saldo Inicial</label><input id="edit-saldo-inicial" type="number" step="0.01" value="' + ((reg.saldoInicial||0).toFixed(2)) + '" /></div>'
                            + '<div class="form-group"><label>Ingresos</label><input id="edit-ingresos" type="number" step="0.01" value="' + ((reg.ingresos||0).toFixed(2)) + '" /></div>'
                            + '<div class="form-group"><label>Egresos</label><input id="edit-egresos" type="number" step="0.01" value="' + ((reg.egresos||0).toFixed(2)) + '" /></div>'
                            + '<div class="form-group"><label>Efectivo Contado</label><input id="edit-efectivo-contado" type="number" step="0.01" value="' + ((reg.efectivoContado||0).toFixed(2)) + '" /></div>'
                            + '<div class="metodo-list">' + metodoFields + '</div>'
                            + '<div class="mt-12 d-flex gap-8"><button id="save-edit" class="btn btn-success">Guardar</button><button id="cancel-edit" class="btn">Cancelar</button></div>'
                            + '</div>';
                        document.body.appendChild(modal);
                        document.getElementById('cancel-edit').addEventListener('click', () => { document.body.removeChild(modal); });
                        document.getElementById('save-edit').addEventListener('click', () => {
                            // leer y validar
                            const nuevoSaldoInicial = Math.max(0, parseFloat(document.getElementById('edit-saldo-inicial').value) || 0);
                            const nuevosIngresos = Math.max(0, parseFloat(document.getElementById('edit-ingresos').value) || 0);
                            const nuevosEgresos = Math.max(0, parseFloat(document.getElementById('edit-egresos').value) || 0);
                            const nuevoEfectivoContado = Math.max(0, parseFloat(document.getElementById('edit-efectivo-contado').value) || 0);
                            // recolectar totalesPorMetodo
                            const metodoInputs = Array.from(modal.querySelectorAll('.edit-metodo-monto'));
                            const nuevosTotales = {};
                            metodoInputs.forEach(mi => { const m = mi.getAttribute('data-metodo'); nuevosTotales[m] = parseFloat(mi.value) || 0; });
                            const newName = (document.getElementById('new-metodo-name') || {value:''}).value;
                            const newMonto = parseFloat((document.getElementById('new-metodo-monto') || {value:0}).value) || 0;
                            if (newName && newMonto) nuevosTotales[newName] = newMonto;
                            const actualizado = {
                                saldoInicial: nuevoSaldoInicial,
                                ingresos: nuevosIngresos,
                                egresos: nuevosEgresos,
                                saldoFinal: +(nuevoSaldoInicial + nuevosIngresos - nuevosEgresos).toFixed(2),
                                totalesPorMetodo: nuevosTotales,
                                efectivoContado: nuevoEfectivoContado
                            };
                            // persistir via servicio si posible
                            if (window && window.arqueoCajaService && typeof window.arqueoCajaService.editarCierre === 'function' && reg.id) {
                                try {
                                    window.arqueoCajaService.editarCierre(reg.id, actualizado);
                                    app.arqueoData.registrosArqueo = window.arqueoCajaService.getHistorial() || [];
                                    app.showNotification('Registro actualizado', 'success', 'arqueo-notification');
                                    app.renderArqueoHistorial();
                                    document.body.removeChild(modal);
                                    return;
                                } catch (e) { /* fallback */ }
                            }
                            // fallback local
                            reg.saldoInicial = actualizado.saldoInicial;
                            reg.ingresos = actualizado.ingresos;
                            reg.egresos = actualizado.egresos;
                            reg.saldoFinal = actualizado.saldoFinal;
                            reg.totalesPorMetodo = actualizado.totalesPorMetodo;
                            reg.efectivoContado = actualizado.efectivoContado;
                            app.renderArqueoHistorial();
                            app.showNotification('Registro actualizado', 'success', 'arqueo-notification');
                            document.body.removeChild(modal);
                        });
                    }
                    return;
                }
            });
        }
        // accesibilidad: asegurar que el contenedor de notificaciones tenga aria-live
        const notif = document.getElementById('arqueo-notification'); if (notif) notif.setAttribute('aria-live','polite');

        // Atajos de teclado: Enter para calcular, Ctrl/Cmd+S para guardar borrador
        if (!app._arqueoKeyHandlersAttached) {
            document.addEventListener('keydown', (ev) => {
                // sólo actuar si la pestaña de arqueo está activa
                if (!app._isArqueoActive()) return;
                const active = document.activeElement;
                if (ev.key === 'Enter' && active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) {
                    ev.preventDefault();
                    app.calcularArqueoCaja();
                }
                if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') {
                    ev.preventDefault();
                    const guardarBtn = document.getElementById('btn-guardar-borrador'); if (guardarBtn) guardarBtn.click();
                }
            });
            app._arqueoKeyHandlersAttached = true;
        }

        // Guardar umbral (cuando exista el modal de confirmación se guarda); también enlazar guardar borrador por JS
        const _guardarBtn = document.getElementById('btn-guardar-borrador');
        if (_guardarBtn && !_guardarBtn.dataset.listenerAttached) {
            // el listener real ya guarda el borrador; aquí solo nos aseguramos de marcar que existe
            _guardarBtn.dataset.listenerAttached = '1';
        }

        // boton de cierre ahora abre resumen de confirmacion
        const cierreBtn = document.getElementById('btn-cierre-caja');
    if (cierreBtn) cierreBtn.addEventListener('click', () => app.preConfirmarCierre());

        // Añadir filtro de historial (input simple) solo si no existe
        const historialContainer = document.getElementById('arqueo-historial');
        if (historialContainer && !document.getElementById('arqueo-historial-search')) {
            const filterHtml = '<div class="arqueo-historial-filters"><input id="arqueo-historial-search" placeholder="Buscar por fecha, id o texto" /><button id="arqueo-historial-clear" class="btn">Limpiar</button></div>';
            historialContainer.insertAdjacentHTML('beforebegin', filterHtml);
            const searchInp = document.getElementById('arqueo-historial-search');
            const clearBtn = document.getElementById('arqueo-historial-clear');
            if (searchInp) searchInp.addEventListener('input', (e) => app.renderArqueoHistorial(e.target.value));
            if (clearBtn) clearBtn.addEventListener('click', () => { if (searchInp) { searchInp.value=''; app.renderArqueoHistorial(''); } });
        }
    }, 0);
};

// Mostrar un pequeño badge/confirmación en la UI junto a las acciones
app._showArqueoActionBadge = function(text) {
    const badge = document.getElementById('arqueo-action-badge');
    if (!badge) return;
    badge.textContent = text || '✔';
    badge.style.display = 'inline-flex';
    badge.classList.remove('badge-pop');
    // reflow para reiniciar anim
    void badge.offsetWidth;
    badge.classList.add('badge-pop');
    // ocultar luego de 1.6s
    setTimeout(() => { try { badge.classList.remove('badge-pop'); badge.style.display = 'none'; } catch(e){} }, 1600);
};

/**
 * Pre-confirmación: mostrar resumen detallado antes de guardar
 */
app.preConfirmarCierre = function() {
    // construir HTML del resumen y pedir confirmación
    const resumen = document.getElementById('arqueo-resumen');
    if (!resumen) return;
    const detalle = resumen.innerHTML;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    // incluir control para tolerancia (umbral) y botón de exportar a PDF
    modal.innerHTML = '<div class="modal-card">'
        + '<h4>Resumen de Arqueo</h4>'
        + detalle
        + '<div style="margin-top:8px; display:flex; gap:8px; align-items:center;">'
            + '<label style="font-size:13px; color:var(--muted);">Tolerancia (S/):</label>'
            + '<input id="arqueo-threshold" type="number" step="0.01" value="' + (app.arqueoSettings && app.arqueoSettings.diffThreshold ? app.arqueoSettings.diffThreshold.toFixed(2) : '5.00') + '" style="width:100px" />'
        + '</div>'
        + '<div class="print-preview" id="arqueo-print-preview" style="display:none; margin-top:12px; border-top:1px solid var(--border); padding-top:8px"></div>'
        + '<div class="mt-12 d-flex gap-8">'
            + '<button id="preview-cierre" class="btn">Vista previa</button>'
            + '<button id="print-cierre" class="btn-print">Imprimir</button>'
            + '<button id="exportar-pdf" class="btn">Exportar PDF</button>'
            + '<button id="exportar-csv" class="btn">Exportar CSV</button>'
            + '<button id="confirmar-cierre" class="btn btn-success">Confirmar Cierre</button>'
            + '<button id="cancelar-cierre" class="btn">Cancelar</button>'
        + '</div></div>';
    document.body.appendChild(modal);
    document.getElementById('cancelar-cierre').addEventListener('click', () => { document.body.removeChild(modal); });
    // accesibilidad: poner foco inicial en imprimir
    const printBtn = document.getElementById('print-cierre'); if (printBtn) { printBtn.focus(); }
    if (printBtn) printBtn.addEventListener('click', () => { window.print(); });
    const previewBtn = document.getElementById('preview-cierre');
    if (previewBtn) previewBtn.addEventListener('click', () => {
        const preview = document.getElementById('arqueo-print-preview');
        if (!preview) return;
        if (preview.style.display === 'none' || preview.style.display === '') {
            // clonar el detalle HTML y mostrarlo en la preview, con encabezado de marca
            const brand = (app && app.empresaNombre) ? app.empresaNombre : 'Mi Comercio';
            const header = '<div class="print-header"><h3>' + brand + '</h3><div class="print-sub">Resumen de Arqueo</div><hr/></div>';
            preview.innerHTML = header + '<div class="print-card">' + detalle + '</div>';
                preview.style.display = 'block';
                previewBtn.textContent = 'Ocultar vista previa';
            } else {
                preview.style.display = 'none';
                previewBtn.textContent = 'Vista previa';
            }
        });
    // Exportar a PDF (intenta usar jsPDF/html2pdf si están disponibles, si no fallback a abrir nueva ventana e imprimir)
    const exportPdfBtn = document.getElementById('exportar-pdf');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => {
        app.exportArqueoPDF();
    });
    document.getElementById('confirmar-cierre').addEventListener('click', () => {
        // leer umbral desde input (si existe) y persistir en settings
        const threshInput = document.getElementById('arqueo-threshold');
        const THRESHOLD = threshInput ? (parseFloat(threshInput.value) || 0) : (app.arqueoSettings && app.arqueoSettings.diffThreshold ? app.arqueoSettings.diffThreshold : 5.00);
    // persistir configuración localmente y en localStorage
    if (!app.arqueoSettings) app.arqueoSettings = {};
    app.arqueoSettings.diffThreshold = THRESHOLD;
    try { localStorage.setItem('arqueoThreshold', THRESHOLD.toString()); } catch(e) {}
        document.body.removeChild(modal);
        // validar diferencia de efectivo
        const totales = app.arqueoData.totalesPorMetodo || {};
        const efectivoRegistrado = totales['Efectivo'] || 0;
        const efectivoContado = app.arqueoData.efectivoContado || 0;
        const diff = +(efectivoContado - efectivoRegistrado).toFixed(2);
        if (Math.abs(diff) > THRESHOLD) {
            const proceed = confirm('La diferencia de efectivo es S/ ' + diff.toFixed(2) + '. Esto excede la tolerancia de S/ ' + THRESHOLD.toFixed(2) + '. ¿Desea continuar?');
            if (!proceed) return;
        }
        app.realizarCierreCaja();
    });
    document.getElementById('exportar-csv').addEventListener('click', () => {
        const fecha = document.getElementById('arqueo-fecha')?.value;
        if (fecha) app.exportArqueoCSV(fecha);
    });
};

// Exportar arqueo actual a CSV (registros del rango si existen en app.data.registerData)
app.exportArqueoCSV = function(fecha) {
    if (!app.data || !Array.isArray(app.data.registerData)) return;
    const start = fecha;
    const end = fecha;
    const registros = app.data.registerData.filter(r => r.fecha >= start && r.fecha <= end);
    if (!registros.length) return;
    const headers = ['id','fecha','tipo','total','metodosPago'];
    const rows = registros.map(r => {
        const pagos = (r.metodosPago||[]).map(p=> p.metodo + ':' + (p.monto||0)).join('|');
        return [r.id||'', r.fecha||'', r.tipo||'', (r.total||0).toFixed(2), '"' + pagos + '"'];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'arqueo_' + start + '_' + end + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Calcula el arqueo de caja para la fecha seleccionada
 */
app.calcularArqueoCaja = function() {
    // Usar la fecha única de arqueo y delegar a calcularArqueoPorRango con la misma fecha como inicio/fin
    const fecha = document.getElementById('arqueo-fecha')?.value;
    const saldoInicial = parseFloat(document.getElementById('arqueo-saldo-inicial').value) || 0;
    if (!fecha) { app.showNotification('Selecciona la Fecha de Arqueo.', 'warning', 'arqueo-notification'); return; }
    app.calcularArqueoPorRango(fecha, fecha, saldoInicial);
};

/**
 * Calcula arqueo en un rango de fechas (inclusive)
 */
app.calcularArqueoPorRango = function(fechaInicio, fechaFin, saldoInicial = 0) {
    // permitir que se pase una sola fecha (fechaInicio) y considerarla como rango de un día
    if (!fechaInicio) {
        app.showNotification('Selecciona una fecha válida para el arqueo.', 'warning', 'arqueo-notification');
        return;
    }
    if (!fechaFin) fechaFin = fechaInicio;
    // preferir servicio si está disponible
    if (window && window.arqueoCajaService && typeof window.arqueoCajaService.calcularArqueoPorRango === 'function' && app.data && Array.isArray(app.data.registerData)) {
        const start = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(fechaInicio) : fechaInicio;
        const end = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(fechaFin) : fechaFin;
        const resultado = window.arqueoCajaService.calcularArqueoPorRango(app.data.registerData, start, end);
        app.arqueoData = {
            ...app.arqueoData,
            saldoInicial,
            ingresos: resultado.ingresos || 0,
            egresos: resultado.egresos || 0,
            totalesPorMetodo: resultado.totalesPorMetodo || {},
            efectivoRegistrado: (resultado.totalesPorMetodo && (resultado.totalesPorMetodo['Efectivo'] || 0)) || 0,
            saldoFinal: +(saldoInicial + (resultado.ingresos || 0) - (resultado.egresos || 0)).toFixed(2),
            cierreRealizado: false,
            fechaCierre: null
        };
        // si no hay conteo manual, sugerir el efectivo registrado
        if ((!app.arqueoData.efectivoContado || app.arqueoData.efectivoContado === 0) && app.arqueoData.efectivoRegistrado > 0) {
            app.arqueoData.efectivoContado = app.arqueoData.efectivoRegistrado;
        }
        app.renderArqueoResumen();
        return;
    }
    // fallback: sin servicio, hacer cálculo local
    // convertir a ISO comparables (asumimos que los registros usan YYYY-MM-DD)
    const start = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(fechaInicio) : fechaInicio;
    const end = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(fechaFin) : fechaFin;

    const registros = (app.data && Array.isArray(app.data.registerData)) ? app.data.registerData.filter(r => {
        const rf = r.fecha;
        return rf >= start && rf <= end;
    }) : [];

    let ingresos = 0, egresos = 0;
    const totalesPorMetodo = {};
    registros.forEach(r => {
        if (r.tipo === 'VENTA') {
            ingresos += r.total || 0;
            if (Array.isArray(r.metodosPago)) {
                r.metodosPago.forEach(m => {
                    const metodo = m.metodo || 'Otros';
                    totalesPorMetodo[metodo] = (totalesPorMetodo[metodo] || 0) + (m.monto || 0);
                });
            }
        }
        if (r.tipo === 'GASTO') {
            egresos += r.total || 0;
            if (Array.isArray(r.metodosPago)) {
                r.metodosPago.forEach(m => {
                    const metodo = m.metodo || 'Otros';
                    totalesPorMetodo[metodo] = (totalesPorMetodo[metodo] || 0) - (m.monto || 0);
                });
            }
        }
    });

    const saldoFinal = +(saldoInicial + ingresos - egresos).toFixed(2);
    app.arqueoData = {
        ...app.arqueoData,
        saldoInicial,
        ingresos,
        egresos,
        totalesPorMetodo,
        efectivoRegistrado: (totalesPorMetodo && (totalesPorMetodo['Efectivo'] || 0)) || 0,
        saldoFinal,
        cierreRealizado: false,
        fechaCierre: null
    };
    // sugerir el efectivo registrado si no se ha ingresado conteo
    if ((!app.arqueoData.efectivoContado || app.arqueoData.efectivoContado === 0) && app.arqueoData.efectivoRegistrado > 0) {
        app.arqueoData.efectivoContado = app.arqueoData.efectivoRegistrado;
    }
    app.renderArqueoResumen();
};

/**
 * Renderiza el resumen de arqueo en la interfaz
 */
app.renderArqueoResumen = function() {
    const resumenDiv = document.getElementById('arqueo-resumen');
    if (!resumenDiv) return;
    // Mostrar gastos diarios detallados
    let gastosHTML = '';
    const fecha = document.getElementById('arqueo-fecha')?.value;
    let pagosHTML = '';
    if (fecha && typeof app.getGastosPorFecha === 'function') {
        const gastos = app.getGastosPorFecha(fecha) || [];
        if (gastos.length) {
            // Agrupar gastos por tipo
            const gastosPorTipo = {};
            gastos.forEach(g => {
                const tipo = g.tipoGasto || g.categoria || 'Otros';
                if (!gastosPorTipo[tipo]) gastosPorTipo[tipo] = [];
                gastosPorTipo[tipo].push(g);
            });
            gastosHTML = '<div class="gastos-diarios"><strong>Gastos del día agrupados:</strong>';
            Object.keys(gastosPorTipo).forEach(tipo => {
                gastosHTML += '<div class="gastos-tipo"><span class="gastos-tipo-nombre">' + tipo + ':</span><ul class="list-compact">';
                gastosPorTipo[tipo].forEach(g => {
                    const desc = g.descripcion || (g.productos ? g.productos.map(p=>p.name).join(', ') : '') || 'Sin descripción';
                    gastosHTML += '<li>' + desc + ' <span class="text-danger">(S/ ' + ((g.total||0).toFixed(2)) + ')</span></li>';
                });
                gastosHTML += '</ul></div>';
            });
            gastosHTML += '</div>';
        }
    }

    const totales = app.arqueoData.totalesPorMetodo || {};
    // construir tabla clara de totales por método con controles de orden y filtro
    const metodKeys = Object.keys(totales).sort((a,b) => (''+a).localeCompare(b));
    // filtro por método (select) y botón ordenar
    let filterHtml = '<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;"><label style="font-size:13px; color:var(--muted);">Filtrar:</label><select id="arqueo-filtro-metodo"><option value="__all__">Todos</option>';
    metodKeys.forEach(k => { filterHtml += '<option value="' + k + '">' + k + '</option>'; });
    filterHtml += '</select><button id="arqueo-orden-desc" class="btn" style="margin-left:6px;">Ordenar por monto ↓</button><button id="arqueo-orden-asc" class="btn" style="display:none;">Ordenar por monto ↑</button></div>';
    let tablaMedios = '<div class="arqueo-card"><h5>Totales por Medio de Pago</h5>' + filterHtml + '<table class="arqueo-table-medios" id="arqueo-table-medios"><thead><tr><th>Medio</th><th class="text-right">Monto (S/)</th></tr></thead><tbody>';
    let totalMedios = 0;
    metodKeys.forEach(k => {
        const monto = +(totales[k]||0);
        tablaMedios += '<tr><td>' + k + '</td><td class="text-right">' + monto.toFixed(2) + '</td></tr>';
        totalMedios += monto;
    });
    if (metodKeys.length === 0) tablaMedios += '<tr><td colspan="2" class="text-muted">No hay movimientos en el rango.</td></tr>';
    tablaMedios += '</tbody><tfoot><tr><th>Total</th><th class="text-right">' + totalMedios.toFixed(2) + '</th></tr></tfoot></table></div>';
    // attach event listeners after HTML is rendered (delegated later in init)

    const efectivoRegistrado = +(totales['Efectivo'] || 0);
    const efectivoContado = +(app.arqueoData.efectivoContado || 0);
    const diferenciaEfectivo = +(efectivoContado - efectivoRegistrado).toFixed(2);

    // indicadores visuales
    const indicatorOK = Math.abs(diferenciaEfectivo) <= 0.01;
    const indicatorWarn = Math.abs(diferenciaEfectivo) > 5.00; // umbral para advertencia
    const indicadorHTML = '<div class="indicadores-grid">'
        + '<div class="ind-card ind-saldo" title="Total de ventas en el rango seleccionado"><div class="ind-title">Ingresos</div><div class="ind-value">S/ ' + app.arqueoData.ingresos.toFixed(2) + '</div></div>'
        + '<div class="ind-card ind-saldo" title="Total de gastos en el rango seleccionado"><div class="ind-title">Egresos</div><div class="ind-value">S/ ' + app.arqueoData.egresos.toFixed(2) + '</div></div>'
        + '<div class="ind-card ind-efectivo" title="Total de efectivo según registros en el rango"><div class="ind-title">Efectivo registrado</div><div class="ind-value">S/ ' + efectivoRegistrado.toFixed(2) + '</div></div>'
        + '<div class="ind-card ind-efectivo" title="Total de efectivo según conteo manual"><div class="ind-title">Efectivo contado</div><div class="ind-value">S/ ' + efectivoContado.toFixed(2) + '</div></div>'
        + '<div class="ind-card ind-diff ' + (indicatorOK ? 'ok' : (indicatorWarn ? 'danger' : 'warning')) + '" title="Diferencia entre efectivo contado y registrado"><div class="ind-title">Diferencia</div><div class="ind-value">S/ ' + diferenciaEfectivo.toFixed(2) + '</div></div>'
        + '</div>';

    // construir mini-gráfica SVG ingresos vs egresos
    const total = Math.max(1, (app.arqueoData.ingresos || 0) + (app.arqueoData.egresos || 0));
    const ancho = 200;
    const anchoIngreso = Math.min(ancho, Math.round(((app.arqueoData.ingresos||0)/total) * ancho));
    const anchoEgreso = Math.min(ancho, Math.round(((app.arqueoData.egresos||0)/total) * ancho));
    const graficaHTML = '<div class="arqueo-grafica" id="arqueo-grafica" aria-hidden="false" style="margin-top:8px;">'
        + '<svg width="220" height="80" role="img" aria-label="Ingresos vs Egresos"><defs><linearGradient id="gIngreso" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4caf50" /><stop offset="100%" stop-color="#2e7d32" /></linearGradient><linearGradient id="gEgreso" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f44336" /><stop offset="100%" stop-color="#c62828" /></linearGradient></defs>'
        + '<rect x="10" y="10" width="200" height="24" fill="#f3f3f3" rx="4"></rect>'
        + '<rect x="10" y="12" width="' + anchoIngreso + '" height="20" fill="url(#gIngreso)"></rect>'
        + '<rect x="10" y="44" width="200" height="24" fill="#f3f3f3" rx="4"></rect>'
        + '<rect x="10" y="46" width="' + anchoEgreso + '" height="20" fill="url(#gEgreso)"></rect>'
        + '<text x="12" y="28" font-size="12" fill="#222">Ingresos: S/ ' + app.arqueoData.ingresos.toFixed(2) + '</text>'
        + '<text x="12" y="62" font-size="12" fill="#222">Egresos: S/ ' + app.arqueoData.egresos.toFixed(2) + '</text>'
        + '</svg></div>';

    resumenDiv.innerHTML = ''
        + '<div class="resumen-grid">'
            + '<div class="resumen-left">'
                + '<div class="resumen-card"><strong>Resumen General</strong>'
                    + '<div class="resumen-row"><span>Ingresos:</span><span>S/ ' + app.arqueoData.ingresos.toFixed(2) + '</span></div>'
                    + '<div class="resumen-row"><span>Egresos:</span><span>S/ ' + app.arqueoData.egresos.toFixed(2) + '</span></div>'
                    + '<div class="resumen-row"><span>Saldo Final:</span><span>S/ ' + app.arqueoData.saldoFinal.toFixed(2) + '</span></div>'
                + '</div>'
                + tablaMedios
                + graficaHTML
            + '</div>'
            + '<div class="resumen-right">' + indicadorHTML + gastosHTML + '</div>'
        + '</div>';
    // conservar estado de orden entre renders (por defecto none)
    if (!app._arqueoSort) app._arqueoSort = 'none';

    // aplicar filtro y orden luego de insertar el HTML
    try {
        // attach listeners to new elements
        const filtro = document.getElementById('arqueo-filtro-metodo');
        const ordDesc = document.getElementById('arqueo-orden-desc');
        const ordAsc = document.getElementById('arqueo-orden-asc');
        if (filtro) {
            filtro.addEventListener('change', () => { app.filterArqueoMedios(); });
        }
        if (ordDesc) {
            ordDesc.addEventListener('click', () => { app._arqueoSort = 'desc'; app.sortArqueoMedios('desc'); ordDesc.style.display='none'; if (ordAsc) ordAsc.style.display='inline-block'; });
        }
        if (ordAsc) {
            ordAsc.addEventListener('click', () => { app._arqueoSort = 'asc'; app.sortArqueoMedios('asc'); ordAsc.style.display='none'; if (ordDesc) ordDesc.style.display='inline-block'; });
        }
        // if a sort was previously applied, re-apply it
        if (app._arqueoSort === 'desc' && document.getElementById('arqueo-orden-desc')) {
            app.sortArqueoMedios('desc');
            if (ordDesc) ordDesc.style.display='none'; if (ordAsc) ordAsc.style.display='inline-block';
        } else if (app._arqueoSort === 'asc' && document.getElementById('arqueo-orden-asc')) {
            app.sortArqueoMedios('asc');
            if (ordAsc) ordAsc.style.display='none'; if (ordDesc) ordDesc.style.display='inline-block';
        }
        // apply filter after render
        app.filterArqueoMedios();
    } catch (e) { console.warn('Error applying filtros/orden en resumen', e); }
};

/**
 * Realiza el cierre de caja y guarda el arqueo
 */
app.realizarCierreCaja = function() {
    if (!app.userCanCloseCaja()) {
        app.showNotification('No tienes permisos para realizar cierres de caja.', 'danger', 'arqueo-notification');
        return;
    }
    if (app.arqueoData.cierreRealizado) {
        app.showNotification('El cierre de caja ya fue realizado para esta fecha.', 'warning', 'arqueo-notification');
        return;
    }
    app.arqueoData.cierreRealizado = true;
    app.arqueoData.fechaCierre = app.setCurrentDate();
    // Guardar en historial (si existe servicio, persistir allí)
    const cierre = {
        fecha: app.arqueoData.fechaCierre,
        fechaArqueo: document.getElementById('arqueo-fecha')?.value || null,
        saldoInicial: app.arqueoData.saldoInicial,
        ingresos: app.arqueoData.ingresos,
        egresos: app.arqueoData.egresos,
        saldoFinal: app.arqueoData.saldoFinal,
        totalesPorMetodo: app.arqueoData.totalesPorMetodo,
        efectivoContado: app.arqueoData.efectivoContado
    };
    if (window && window.arqueoCajaService && typeof window.arqueoCajaService.agregarCierre === 'function') {
        try {
            const saved = window.arqueoCajaService.agregarCierre(cierre);
            // refrescar historial desde servicio
            app.arqueoData.registrosArqueo = window.arqueoCajaService.getHistorial() || [];
        } catch (e) {
            // fallback local
            app.arqueoData.registrosArqueo.push(cierre);
        }
    } else {
        app.arqueoData.registrosArqueo.push(cierre);
    }
    app.renderArqueoHistorial();
    app.showNotification('Cierre de caja realizado correctamente.', 'success', 'arqueo-notification');
};

// Pre-check permisos y abrir modal de confirmación (usar por el botón)
app.preConfirmarCierre = function() {
    if (!app.userCanCloseCaja()) {
        app.showNotification('No tienes permisos para realizar cierres de caja.', 'danger', 'arqueo-notification');
        return;
    }
    // abrir modal de confirmación (reutilizar el flujo existente que muestra el detalle)
    try {
        const btn = document.getElementById('btn-cierre-caja');
        if (btn) btn.click();
    } catch (e) {}
};

// Mejorar export a PDF prefiriendo html2pdf si está cargado
app.exportArqueoPDF = function() {
    const preview = document.getElementById('arqueo-print-preview');
    const contentNode = preview && preview.innerHTML.trim() ? preview : document.getElementById('arqueo-resumen');
    if (!contentNode) return;
    if (window && window.html2pdf) {
        try { window.html2pdf().from(contentNode).save('arqueo.pdf'); return; } catch (e) { console.warn('html2pdf fallo, fallback', e); }
    }
    // fallback
    const w = window.open('','_blank');
    w.document.write('<html><head><title>Arqueo</title><style>body{font-family: Arial, Helvetica, sans-serif; padding:20px;}</style></head><body>' + contentNode.innerHTML + '</body></html>');
    w.document.close();
    w.focus();
    w.print();
};

// Control simple de permisos: sólo usuarios con role 'admin' o permiso 'can_close_caja' pueden cerrar
app.userCanCloseCaja = function() {
    try {
        if (app.userPermissions && Array.isArray(app.userPermissions)) return app.userPermissions.includes('can_close_caja');
        if (app.currentUser && app.currentUser.role) return (app.currentUser.role === 'admin' || app.currentUser.role === 'supervisor');
    } catch (e) {}
    return false;
};

// Determina si la pestaña de arqueo está activa (visibilidad y flag init)
app._isArqueoActive = function() {
    const cont = document.getElementById('arqueo-resumen');
    if (!cont) return false;
    return !!(app._arqueoInitialized && cont.offsetParent !== null);
};

/**
 * Renderiza el historial de arqueos
 */
app.renderArqueoHistorial = function(searchTerm) {
    const historialDiv = document.getElementById('arqueo-historial');
    if (!historialDiv) return;
    // Si existe servicio, obtener historial persistido
    if (window && window.arqueoCajaService && typeof window.arqueoCajaService.getHistorial === 'function') {
        app.arqueoData.registrosArqueo = window.arqueoCajaService.getHistorial() || [];
    }
    let registros = app.arqueoData.registrosArqueo || [];
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        registros = registros.filter(r => {
            return (r.id && String(r.id).toLowerCase().includes(q)) ||
                   (r.fecha && String(r.fecha).toLowerCase().includes(q)) ||
                   (r.descripcion && String(r.descripcion).toLowerCase().includes(q));
        });
    }
    if (!registros.length) {
        historialDiv.innerHTML = '<p>No hay cierres de caja registrados.</p>';
        return;
    }
    let html = '<h4>Historial de Cierres de Caja</h4><table class="arqueo-table"><thead><tr><th>Fecha</th><th>ID</th><th>Saldo Inicial</th><th>Ingresos</th><th>Egresos</th><th>Saldo Final</th><th>Acciones</th></tr></thead><tbody>';
    registros.forEach((r, idx) => {
        const fechaDisplay = (app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(r.fecha) : r.fecha;
        html += '<tr>'
            + '<td>' + fechaDisplay + '</td>'
            + '<td>' + (r.id || '-') + '</td>'
            + '<td>S/ ' + (r.saldoInicial||0).toFixed(2) + '</td>'
            + '<td>S/ ' + (r.ingresos||0).toFixed(2) + '</td>'
            + '<td>S/ ' + (r.egresos||0).toFixed(2) + '</td>'
            + '<td>S/ ' + (r.saldoFinal||0).toFixed(2) + '</td>'
            + '<td><button class="btn btn-small btn-arqueo-edit" data-index="' + idx + '">Editar</button> <button class="btn btn-small btn-danger btn-arqueo-delete" data-index="' + idx + '">Eliminar</button> <button class="btn btn-small" data-index="' + idx + '" data-action="export">Export</button></td>'
            + '</tr>';
    });
    html += '</tbody></table>';
    historialDiv.innerHTML = html;
};

// Ordenar la tabla de medios por monto asc/desc
app.sortArqueoMedios = function(direction) {
    const tbody = document.querySelector('#arqueo-table-medios tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a,b)=>{
        const aVal = parseFloat(a.children[1].textContent.replace(/[S\/\s,]/g,'')) || 0;
        const bVal = parseFloat(b.children[1].textContent.replace(/[S\/\s,]/g,'')) || 0;
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    rows.forEach(r => tbody.appendChild(r));
};

// Filtrar la tabla por medio seleccionado
app.filterArqueoMedios = function() {
    const sel = document.getElementById('arqueo-filtro-metodo');
    if (!sel) return;
    const val = sel.value;
    const tbody = document.querySelector('#arqueo-table-medios tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r => {
        const medio = r.children[0].textContent.trim();
        if (val === '__all__' || medio === val) r.style.display = '';
        else r.style.display = 'none';
    });
};