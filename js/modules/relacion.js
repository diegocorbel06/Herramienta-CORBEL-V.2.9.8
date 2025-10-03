// =============================================
// ARCHIVO: js/modules/relacion.js
// Módulo de Relaciones entre registros
// =============================================

/**
 * Permite crear relaciones entre registros (por ejemplo, vincular factura a recibo,
 * o relacionar reparaciones múltiples a un trabajo principal).
 */

// Inicializar estructura de almacenamiento si no existe
if (!app.data.relacionData) app.data.relacionData = [];

// Inicializar proveedores y compras si no existen
if (!app.data.proveedores) app.data.proveedores = [];
if (!app.data.compras) app.data.compras = []; // cada compra: { id, proveedorId, fecha, items: [{id,name,qty,price}], total, estado: 'pendiente'|'pagada', deuda }

app.getRelacionHTML = function() {
    return `<div class="card">
        <div class="card-header">
            <h3><i class="fas fa-handshake"></i> Relaciones, Proveedores y Compras</h3>
        </div>
        <div id="relacion-notification" class="notification"></div>

        <h4>Relaciones entre registros</h4>
        <div class="form-row">
            <div class="form-group">
                <label for="relacion-origen">Registro origen (ID)</label>
                <input type="text" id="relacion-origen" placeholder="ID registro origen">
            </div>
            <div class="form-group">
                <label for="relacion-destino">Registro destino (ID)</label>
                <input type="text" id="relacion-destino" placeholder="ID registro destino">
            </div>
            <div class="form-group">
                <label for="relacion-tipo">Tipo de relación</label>
                <select id="relacion-tipo">
                    <option value="asociado">Asociado</option>
                    <option value="reemplazo">Reemplazo</option>
                    <option value="referencia">Referencia</option>
                </select>
            </div>
            <div class="form-group" style="align-self:flex-end;">
                <button class="btn btn-success" onclick="app.createRelacion()"><i class="fas fa-link"></i> Crear Relación</button>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h4>Listado de Relaciones</h4></div>
            <div class="table-container"><table id="relacion-table"><thead><tr><th>Origen</th><th>Destino</th><th>Tipo</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>
        </div>

        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="comp-prov">Proveedor</label>
                <select id="comp-prov"></select>
            </div>
            <div class="form-group">
                <label for="comp-fecha">Fecha</label>
                <input type="date" id="comp-fecha">
            </div>
            <div class="form-group form-group-end">
                <button class="btn btn-success" onclick="app.openCompraModal()"><i class="fas fa-plus"></i> Nueva Compra</button>
            </div>
        </div>
        </div>
        <div class="card">
            <div class="card-header"><h4>Listado de Proveedores</h4></div>
            <div class="table-container"><table id="proveedor-table"><thead><tr><th>Id</th><th>Nombre</th><th>Contacto</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>
        </div>

        <hr>
        <h4><i class="fas fa-shopping-cart"></i> Compras</h4>
        <div class="form-row">
            <div class="form-group">
                <label for="comp-prov">Proveedor</label>
                <select id="comp-prov"></select>
            </div>
            <div class="form-group">
                <label for="comp-fecha">Fecha</label>
                <input type="date" id="comp-fecha">
            </div>
            <div class="form-group" style="align-self:flex-end;">
                <button class="btn btn-success" onclick="app.openCompraModal()"><i class="fas fa-plus"></i> Nueva Compra</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h4>Listado de Compras</h4></div>
            <div class="table-container"><table id="compra-table"><thead><tr><th>Id</th><th>Proveedor</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>
        </div>
    </div>`;
};

app.initRelacionTab = function() {
    this.renderRelacionTable();
    this.renderProveedorTable();
    this.renderCompraTable();
    this.populateProveedorSelect();
};

app.createRelacion = function() {
    const origen = document.getElementById('relacion-origen').value.trim();
    const destino = document.getElementById('relacion-destino').value.trim();
    const tipo = document.getElementById('relacion-tipo').value;

    if (!origen || !destino) {
        app.showNotification('Complete origen y destino', 'error', 'relacion-notification');
        return;
    }

    // Verificar que los registros existan
    const regOrigen = app.data.registerData.find(r => r.id === origen);
    const regDestino = app.data.registerData.find(r => r.id === destino);
    if (!regOrigen || !regDestino) {
        app.showNotification('Uno o ambos registros no existen', 'error', 'relacion-notification');
        return;
    }

    const nueva = { origen, destino, tipo, fecha: app.setCurrentDate() };
    app.data.relacionData.push(nueva);
    app.forceSave();
    app.showNotification('Relación creada', 'success', 'relacion-notification');
    document.getElementById('relacion-origen').value = '';
    document.getElementById('relacion-destino').value = '';
    app.renderRelacionTable();
};

app.renderRelacionTable = function() {
    const tbody = document.querySelector('#relacion-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    app.data.relacionData.forEach((rel, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rel.origen}</td>
            <td>${rel.destino}</td>
            <td>${rel.tipo}</td>
            <td>${rel.fecha}</td>
            <td><button class="btn btn-danger" onclick="app.deleteRelacion(${idx})">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });
};

app.deleteRelacion = function(index) {
    if (!confirm('¿Eliminar relación?')) return;
    app.data.relacionData.splice(index, 1);
    app.forceSave();
    app.renderRelacionTable();
    app.showNotification('Relación eliminada', 'success', 'relacion-notification');
};
// =============================================
// ARCHIVO: js/modules/relacion.js
// Módulo de Relaciones (Placeholder)
// =============================================

// Función placeholder para relación
app.getRelacionHTML = function() {
    return `<div class="card">
        <div class="card-header">
            <h3><i class="fas fa-handshake"></i> Relaciones</h3>
        </div>
        <div class="notification warning">
            <i class="fas fa-tools"></i> Módulo en construcción - Próximamente
        </div>
    </div>`;
};

// Inicialización placeholder
app.initRelacionTab = function() {
    console.log('Pestaña de relación inicializada');
};

// Proveedores
app.createProveedor = function() {
    const nombre = document.getElementById('prov-nombre').value.trim();
    const contacto = document.getElementById('prov-contacto').value.trim();
    if (!nombre) {
        app.showNotification('Ingrese el nombre del proveedor', 'error', 'relacion-notification');
        return;
    }
    const id = `PRV-${Date.now()}`;
    app.data.proveedores.push({ id, nombre, contacto });
    app.forceSave();
    document.getElementById('prov-nombre').value = '';
    document.getElementById('prov-contacto').value = '';
    app.showNotification('Proveedor creado', 'success', 'relacion-notification');
    app.renderProveedorTable();
    app.populateProveedorSelect();
};

app.renderProveedorTable = function() {
    const tbody = document.querySelector('#proveedor-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    app.data.proveedores.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.id}</td><td>${p.nombre}</td><td>${p.contacto || ''}</td><td><button class="btn btn-danger" onclick="app.deleteProveedor('${p.id}')">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
};

app.deleteProveedor = function(id) {
    if (!confirm('Eliminar proveedor?')) return;
    app.data.proveedores = app.data.proveedores.filter(p => p.id !== id);
    app.forceSave();
    app.renderProveedorTable();
    app.populateProveedorSelect();
    app.showNotification('Proveedor eliminado', 'success', 'relacion-notification');
};

app.populateProveedorSelect = function() {
    const sel = document.getElementById('comp-prov');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccione proveedor</option>' + app.data.proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
};

// Compras
// Abrir modal de compra con tabla editable (reemplaza prompt)
app.openCompraModal = function(existingCompraId) {
    const proveedorSelect = document.getElementById('comp-prov');
    const fechaInput = document.getElementById('comp-fecha');
    const proveedorId = proveedorSelect ? proveedorSelect.value : '';
    const fecha = fechaInput && fechaInput.value ? fechaInput.value : app.setCurrentDate();
    if (!proveedorId) { app.showNotification('Seleccione proveedor', 'error', 'relacion-notification'); return; }

    // Crear backdrop y modal
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <h3>Nueva Compra</h3>
        <div class="form-row">
            <div class="form-group"><label>Proveedor</label><div>${(app.data.proveedores.find(p=>p.id===proveedorId)||{nombre:proveedorId}).nombre}</div></div>
            <div class="form-group"><label>Fecha</label><input type="date" id="modal-comp-fecha" value="${fecha}"></div>
        </div>
        <div class="mt-10">
            <table id="modal-comp-items" class="full-width">
                <thead><tr><th>Nombre</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Acciones</th></tr></thead>
                <tbody></tbody>
            </table>
            <button class="btn" id="modal-add-item">Agregar fila</button>
        </div>
        <div class="mt-10 d-flex space-between align-center">
            <div>
                <label>Abono (pago inicial)</label>
                <input type="number" id="modal-comp-abono" min="0" step="0.01" value="0" class="compact-input">
            </div>
            <div class="text-right">Total: S/ <span id="modal-comp-total">0.00</span></div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-success" id="modal-save-compra">Guardar Compra</button>
            <button class="btn btn-warning" id="modal-cancel-compra">Cancelar</button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const tbody = modal.querySelector('#modal-comp-items tbody');
    const addRowBtn = modal.querySelector('#modal-add-item');
    const totalEl = modal.querySelector('#modal-comp-total');
    const abonoInput = modal.querySelector('#modal-comp-abono');

    function recalc() {
        let total = 0;
        tbody.querySelectorAll('tr').forEach(r => {
            const qty = parseFloat(r.querySelector('.item-qty').value) || 0;
            const price = parseFloat(r.querySelector('.item-price').value) || 0;
            const sub = qty * price;
            r.querySelector('.item-sub').textContent = `S/ ${sub.toFixed(2)}`;
            total += sub;
        });
        totalEl.textContent = total.toFixed(2);
    }

    function addRow(item) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><input class="item-name" value="${item?.name||''}"/></td>
            <td><input class="item-qty compact-input" type="number" min="1" value="${item?.quantity||1}"></td>
            <td><input class="item-price compact-input" type="number" min="0" step="0.01" value="${item?.price?.toFixed?item.price.toFixed(2): (item?.price||0)}"></td>
            <td class="item-sub">S/ 0.00</td>
            <td><button class="btn btn-danger btn-sm modal-remove-item">Eliminar</button></td>`;
        tbody.appendChild(tr);
        tr.querySelector('.item-qty').addEventListener('input', recalc);
        tr.querySelector('.item-price').addEventListener('input', recalc);
        tr.querySelector('.modal-remove-item').addEventListener('click', () => { tr.remove(); recalc(); });
        recalc();
    }

    addRowBtn.addEventListener('click', () => addRow());

    // Si se edita una compra existente, poblar filas
    if (existingCompraId) {
        const ex = app.data.compras.find(c => c.id === existingCompraId);
        if (ex) {
            const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(ex.fecha) : (ex.fecha.split('/').reverse().join('-') || ex.fecha || fecha);
            modal.querySelector('#modal-comp-fecha').value = iso;
            ex.items.forEach(it => addRow(it));
            abonoInput.value = (ex.total - (ex.deuda||0)) || 0;
        }
    }

    abonoInput.addEventListener('input', () => {
        // no-op for now
    });

    modal.querySelector('#modal-cancel-compra').addEventListener('click', () => { backdrop.remove(); });

    modal.querySelector('#modal-save-compra').addEventListener('click', () => {
        // Validaciones
        const rows = Array.from(tbody.querySelectorAll('tr'));
        if (rows.length === 0) { app.showNotification('Agregue al menos un item', 'error', 'relacion-notification'); return; }
        const items = rows.map(r => ({
            id: `IT-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
            name: r.querySelector('.item-name').value.trim() || 'Sin nombre',
            quantity: parseInt(r.querySelector('.item-qty').value) || 1,
            price: parseFloat(r.querySelector('.item-price').value) || 0
        }));
        const total = items.reduce((s,i) => s + (i.quantity * i.price), 0);
        const abono = parseFloat(abonoInput.value) || 0;
        if (abono < 0) { app.showNotification('Abono no puede ser negativo', 'error', 'relacion-notification'); return; }
        if (abono > total) { app.showNotification('Abono mayor que total', 'error', 'relacion-notification'); return; }

        const id = existingCompraId || `CMP-${Date.now()}`;
        const fechaIso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(modal.querySelector('#modal-comp-fecha').value) : modal.querySelector('#modal-comp-fecha').value;
        const compra = {
            id,
            proveedorId,
            fecha: fechaIso,
            items,
            total,
            estado: abono >= total ? 'pagada' : 'pendiente',
            deuda: Math.max(0, total - abono)
        };

        if (existingCompraId) {
            app.data.compras = app.data.compras.map(c => c.id === id ? compra : c);
        } else {
            app.data.compras.push(compra);
        }

        // Si hay deuda, agregar como registro de gasto opcional o marcar en resumen
        app.forceSave();
        app.renderCompraTable();
        app.showNotification('Compra guardada', 'success', 'relacion-notification');
        backdrop.remove();
    });
};

app.renderCompraTable = function() {
    const tbody = document.querySelector('#compra-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    app.data.compras.forEach((c, idx) => {
        const prov = app.data.proveedores.find(p => p.id === c.proveedorId);
    const tr = document.createElement('tr');
    const fechaDisplay = (app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(c.fecha) : c.fecha;
    tr.innerHTML = `<td>${c.id}</td><td>${prov?prov.nombre:c.proveedorId}</td><td>${fechaDisplay}</td><td>S/ ${c.total.toFixed(2)}</td><td>${c.estado}</td><td><button class="btn" onclick="app.viewCompra('${c.id}')">Ver</button> <button class="btn" onclick="app.openAbonoModal('${c.id}')">Registrar Abono</button> <button class="btn btn-danger" onclick="app.deleteCompra('${c.id}')">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
};

// Registrar abono (modal simple)
app.openAbonoModal = function(compraId) {
    const compra = app.data.compras.find(c => c.id === compraId);
    if (!compra) { app.showNotification('Compra no encontrada', 'error', 'relacion-notification'); return; }
    const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
    const modal = document.createElement('div'); modal.className='modal';
    modal.innerHTML = `<h3>Registrar Abono - ${compra.id}</h3>
        <div><strong>Proveedor:</strong> ${(app.data.proveedores.find(p=>p.id===compra.proveedorId)||{nombre:compra.proveedorId}).nombre}</div>
        <div class="mt-10"><label>Monto a abonar</label><input id="abono-monto" type="number" min="0" step="0.01" value="0" class="compact-input"></div>
        <div class="modal-actions"><button class="btn btn-success" id="abono-save">Guardar</button><button class="btn btn-warning" id="abono-cancel">Cancelar</button></div>`;
    backdrop.appendChild(modal); document.body.appendChild(backdrop);
    modal.querySelector('#abono-cancel').addEventListener('click', ()=> backdrop.remove());
    modal.querySelector('#abono-save').addEventListener('click', ()=> {
        const monto = parseFloat(modal.querySelector('#abono-monto').value) || 0;
        if (monto <= 0) { app.showNotification('Ingrese monto válido', 'error', 'relacion-notification'); return; }
        compra.pagos = compra.pagos || [];
        compra.pagos.push({ fecha: app.setCurrentDate(), monto });
        compra.deuda = Math.max(0, (compra.deuda||compra.total) - monto);
        compra.estado = compra.deuda > 0 ? 'pendiente' : 'pagada';
        app.forceSave(); app.renderCompraTable(); app.showNotification('Abono registrado', 'success', 'relacion-notification'); backdrop.remove();
    });
};

// Ver historial de pagos
app.viewCompra = function(id) {
    const c = app.data.compras.find(x => x.id === id);
    if (!c) return;
    const fechaStr = (app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(c.fecha) : c.fecha;
    let msg = `Compra ${c.id} - Fecha ${fechaStr}\nProveedor: ${ (app.data.proveedores.find(p=>p.id===c.proveedorId)||{nombre:c.proveedorId}).nombre }\n\nItems:\n`;
    c.items.forEach(it => msg += `${it.name} x${it.quantity} - S/ ${it.price.toFixed(2)}\n`);
    msg += `\nTotal S/ ${c.total.toFixed(2)}\nEstado: ${c.estado}`;
    if (c.pagos && c.pagos.length) {
        msg += '\n\nPagos:\n'; c.pagos.forEach(p=> msg += `${p.fecha} - S/ ${p.monto.toFixed(2)}\n`);
    }
    alert(msg);
};

app.viewCompra = function(id) {
    const c = app.data.compras.find(x => x.id === id);
    if (!c) return;
    const fechaStr2 = (app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(c.fecha) : c.fecha;
    let msg = `Compra ${c.id} - Fecha ${fechaStr2}\nProveedor: ${ (app.data.proveedores.find(p=>p.id===c.proveedorId)||{nombre:c.proveedorId}).nombre }\n\nItems:\n`;
    c.items.forEach(it => msg += `${it.name} x${it.quantity} - S/ ${it.price.toFixed(2)}\n`);
    msg += `\nTotal S/ ${c.total.toFixed(2)}\nEstado: ${c.estado}`;
    alert(msg);
};

app.deleteCompra = function(id) {
    if (!confirm('Eliminar compra?')) return;
    app.data.compras = app.data.compras.filter(c => c.id !== id);
    app.forceSave();
    app.renderCompraTable();
    app.showNotification('Compra eliminada', 'success', 'relacion-notification');
};