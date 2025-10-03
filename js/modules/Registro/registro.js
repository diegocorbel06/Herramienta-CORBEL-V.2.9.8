// Polyfill/defensas mínimas para entornos de test (Node sin DOM completo)
if (typeof document === 'undefined') {
    global.document = {};
}
if (typeof window === 'undefined') {
    global.window = {};
}

// Asegurar que exista el objeto global `app` para que las asignaciones posteriores funcionen
try {
    if (typeof window !== 'undefined') window.app = window.app || {};
} catch (e) {}
try {
    if (typeof global !== 'undefined' && !global.app) global.app = (typeof window !== 'undefined' ? window.app : {});
} catch (e) {}
// Fallback para showNotification en entornos de test sin UI
try { if (!app.showNotification || typeof app.showNotification !== 'function') app.showNotification = function(msg, type){ if (typeof console !== 'undefined') console.log((type||'info')+': '+(msg||'')); }; } catch(e) {}
if (typeof document.querySelectorAll !== 'function') {
    document.querySelectorAll = function() { return []; };
}
if (typeof document.querySelector !== 'function') {
    document.querySelector = function() { return null; };
}
if (typeof document.getElementById !== 'function') {
    document.getElementById = function() { return null; };
}
if (typeof document.addEventListener !== 'function') {
    document.addEventListener = function() {};
}
if (typeof document.createElement !== 'function') {
    document.createElement = function() { return { style:{}, appendChild: function(){}, innerHTML: '', querySelectorAll: function(){ return []; }, querySelector: function(){ return null; }, addEventListener: function(){} }; };
}
// Actualizar total de productos seleccionados
app.updateProductosTotal = function(formId) {
    const productosList = document.getElementById(`productos-seleccionados-list-${formId}`);
    let total = 0;
    if (productosList) {
        productosList.querySelectorAll('.producto-item').forEach(item => {
            const qtyInput = item.querySelector('.producto-qty');
            const priceInput = item.querySelector('.producto-price');
            const qty = qtyInput ? parseFloat(qtyInput.value) || 0 : parseFloat(item.getAttribute('data-quantity')) || 0;
            const price = priceInput ? parseFloat(priceInput.value) || 0 : parseFloat(item.getAttribute('data-price')) || 0;
            const line = qty * price;
            total += line;
            // actualizar visual
            const display = item.querySelector('.producto-display');
            if (display) display.textContent = `${item.getAttribute('data-name')} x${qty} S/ ${line.toFixed(2)}`;
            // actualizar atributos
            item.setAttribute('data-quantity', qty);
            item.setAttribute('data-price', price);
        });
    }
    const totalEl = document.getElementById(`productos-total-${formId}`);
    if (totalEl) totalEl.textContent = `Total: S/ ${total.toFixed(2)}`;
}
// Quitar producto de la selección
app.removeProductoItem = function(button, formId) {
    const item = button.closest('.producto-item');
    if (item) item.remove();
    app.updateProductosTotal(formId);
}
// Quitar mecánico de la selección
app.removeMecanicoTag = function(button, formId) {
    const tag = button.closest('.mecanico-tag');
    if (tag) tag.remove();
}
// =============================================
// ARCHIVO: js/modules/registro/registro.js
// Devuelve un array de gastos para una fecha dada (ISO)
app.getGastosPorFecha = function(fechaISO) {
    if (!app.data || !Array.isArray(app.data.registerData)) return [];
    return app.data.registerData.filter(r => r.tipo === 'GASTO' && r.fecha === fechaISO);
};
// Módulo principal de registro - VERSIÓN OPTIMIZADA
// =============================================

// Función para obtener el HTML de la pestaña de registro
app.getRegistroHTML = function() {
    const today = this.setCurrentDate();
    // Cambios de dimensiones: reducir paddings, max-width y márgenes para edición rápida
    return `<div class="card compact-form" style="max-width: calc(100% - 12px); margin: 4px auto; box-shadow: 0 2px 8px #0002; border-radius: 10px; padding: 8px 6px;">
        <div class="card-header" style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:8px 0;">
            <h3 style="margin:0;font-size:1.1rem;"><i class="fas fa-plus-circle"></i> Agregar Nuevo Registro</h3>
            <button class="btn btn-success" id="add-register-btn" style="padding:4px 10px;font-size:0.95em;">
                <i class="fas fa-plus"></i> Agregar Otro Registro
            </button>
        </div>
        <div id="register-notification" class="notification"></div>
        <div class="multi-register-tabs" id="register-tabs" style="margin-bottom:6px;">
            <div class="register-tab active" data-form-id="1" onclick="app.activarPestañaRegistro(1)" style="padding:4px 10px;font-size:0.95em;">
                <span>Registro 1</span>
                <span class="close-tab" onclick="event.stopPropagation();app.closeRegisterTab(1)">×</span>
            </div>
        </div>
    <div class="register-form-container" id="register-form-container" style="display:flex;flex-direction:row;flex-wrap:nowrap;gap:0.5rem;justify-content:flex-start;padding:0.2rem;overflow-x:auto;">
            <div class="register-form active" id="register-form-1" data-form-id="1" style="background:var(--card-bg);border-radius:8px;padding:0.7rem;box-shadow:0 1px 6px #0001;max-width:320px;min-width:220px;width:100%;margin:0;flex:1 1 220px;">
                <h4 style="margin-top:0;font-size:1em;margin-bottom:8px;">Registro 1</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="reg-fecha-1"><i class="fas fa-calendar"></i> Fecha</label>
                        <input type="date" id="reg-fecha-1" class="reg-fecha" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label for="reg-tipo-1"><i class="fas fa-tag"></i> Tipo</label>
                        <select id="reg-tipo-1" class="reg-tipo" required>
                            <option value="VENTA">VENTA</option>
                            <option value="GASTO">GASTO</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row" id="row-cliente-1">
                    <div class="form-group">
                        <label for="reg-cliente-1"><i class="fas fa-user"></i> Cliente</label>
                        <input type="text" id="reg-cliente-1" class="reg-cliente" placeholder="Nombre del cliente">
                    </div>
                    <div class="form-group" style="display:flex;align-items:center;">
                        <label for="reg-sin-vehiculo-1" style="margin-right:8px"><i class="fas fa-ban"></i> Sin vehículo</label>
                        <input type="checkbox" id="reg-sin-vehiculo-1" class="reg-sin-vehiculo" onchange="app.handleSinVehiculoChange(1)">
                    </div>
                    <div class="form-group">
                        <label for="reg-placa-1"><i class="fas fa-car"></i> Placa</label>
                        <input type="text" id="reg-placa-1" class="reg-placa" placeholder="Ej: ABC123">
                    </div>
                </div>
                <div class="form-row" id="row-modelo-1">
                    <div class="form-group">
                        <label for="reg-modelo-1"><i class="fas fa-car-side"></i> Modelo de Auto</label>
                        <select id="reg-modelo-1" class="reg-modelo" onchange="app.handleModeloChange(1)">
                            <option value="">Seleccionar modelo</option>
                            <option value="Toyota Corolla">Toyota Corolla</option>
                            <option value="Toyota Hilux">Toyota Hilux</option>
                            <option value="Nissan Sentra">Nissan Sentra</option>
                            <option value="Nissan Frontier">Nissan Frontier</option>
                            <option value="Hyundai Tucson">Hyundai Tucson</option>
                            <option value="Hyundai Accent">Hyundai Accent</option>
                            <option value="Kia Rio">Kia Rio</option>
                            <option value="Kia Sportage">Kia Sportage</option>
                            <option value="Suzuki Swift">Suzuki Swift</option>
                            <option value="Suzuki Vitara">Suzuki Vitara</option>
                            <option value="Volkswagen Gol">Volkswagen Gol</option>
                            <option value="Volkswagen Amarok">Volkswagen Amarok</option>
                            <option value="Chevrolet Spark">Chevrolet Spark</option>
                            <option value="Chevrolet Onix">Chevrolet Onix</option>
                            <option value="Mitsubishi L200">Mitsubishi L200</option>
                            <option value="Mitsubishi Outlander">Mitsubishi Outlander</option>
                            <option value="Ford Ranger">Ford Ranger</option>
                            <option value="Ford Fiesta">Ford Fiesta</option>
                            <option value="Honda Civic">Honda Civic</option>
                            <option value="Honda CR-V">Honda CR-V</option>
                            <option value="Otro">Otro (especificar)</option>
                        </select>
                    </div>
                    <div class="form-group modelo-otro-container" id="modelo-otro-container-1" style="display: none;">
                        <label for="reg-modelo-otro-1"><i class="fas fa-pen"></i> Especificar Modelo</label>
                        <input type="text" id="reg-modelo-otro-1" class="reg-modelo-otro" placeholder="Modelo del vehículo">
                    </div>
                </div>
                <div class="form-row" id="row-mecanicos-1">
                    <div class="form-group searchable-select">
                        <label for="reg-mecanico-search-1"><i class="fas fa-user-cog"></i> Mecánico(s)</label>
                        <input type="text" id="reg-mecanico-search-1" class="reg-mecanico-search" placeholder="Buscar mecánico..." oninput="app.filterMecanicoOptions(1)">
                        <div id="reg-mecanico-options-1" class="searchable-options"></div>
                    </div>
                        <!-- Se removió la lista select de mecánicos; la selección se realiza desde el campo de búsqueda -->
                </div>
                <div class="form-row" id="row-mecanicos-asignados-1">
                    <div class="form-group">
                        <label><i class="fas fa-users"></i> Mecánicos asignados</label>
                        <div id="mecanicos-seleccionados-1" class="mecanicos-seleccionados">
                            <p>No hay mecánicos asignados</p>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group searchable-select">
                        <label for="reg-producto-search-1"><i class="fas fa-box"></i> Buscar Producto/Servicio</label>
                        <input type="text" id="reg-producto-search-1" class="reg-producto-search" placeholder="Escribe para buscar..." oninput="app.filterProductOptions(1)">
                        <div id="reg-producto-options-1" class="searchable-options"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-cantidad-1"><i class="fas fa-hashtag"></i> Cantidad</label>
                        <input type="number" id="reg-cantidad-1" class="reg-cantidad" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label style="visibility: hidden;">Agregar</label>
                        <button class="btn btn-success" onclick="app.addProductToSelection(1)">
                            <i class="fas fa-plus"></i> Agregar Producto
                        </button>
                    </div>
                    <div class="form-group">
                        <label style="visibility: hidden;">Agregar Personal</label>
                        <button class="btn" onclick="app.addProductoPersonalizado(1)">
                            <i class="fas fa-pen"></i> Agregar personalizado
                        </button>
                    </div>
                </div>
                <!-- Campos específicos para GASTO -->
                <div class="form-row gasto-row" id="gasto-row-1" style="display:none; margin-top:8px;">
                    <div class="form-group">
                        <label for="reg-gasto-nombre-1">Nombre gasto</label>
                        <input type="text" id="reg-gasto-nombre-1" class="reg-gasto-nombre" placeholder="Ej: Compra de repuestos">
                    </div>
                    <div class="form-group">
                        <label for="reg-gasto-unidades-1">Unidades</label>
                        <input type="number" id="reg-gasto-unidades-1" class="reg-gasto-unidades" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label for="reg-gasto-precio-1">Precio unitario (S/)</label>
                        <input type="number" id="reg-gasto-precio-1" class="reg-gasto-precio" min="0" step="0.01" value="0.00">
                    </div>
                    <div class="form-group">
                        <label style="visibility:hidden">Agregar</label>
                        <button class="btn btn-success" onclick="app.addGastoToSelection(1)"><i class="fas fa-plus"></i> Agregar Gasto</button>
                    </div>
                </div>
                
                <div id="productos-seleccionados-container-1" class="productos-seleccionados hidden">
                    <h4><i class="fas fa-list"></i> Productos/Servicios seleccionados:</h4>
                    <div id="productos-seleccionados-list-1"></div>
                    <div id="productos-total-1" style="margin-top: 10px; font-weight: bold; text-align: right;"></div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-credit-card"></i> Métodos de Pago</label>
                        <div id="metodos-pago-1" class="payment-methods">
                            <div class="payment-method">
                                <select class="pago-metodo">
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Yape">Yape</option>
                                    <option value="Otros">Otros</option>
                                </select>
                                <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" oninput="app.calcularTotalPagos(1)">
                                <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, 1)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <button class="btn btn-success" onclick="app.addPaymentMethod(1)" style="margin-top: 10px;">
                            <i class="fas fa-plus"></i> Agregar Método de Pago
                        </button>
                        <div class="payment-total" id="pago-total-1">Total: S/ 0.00</div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="reg-descripcion-1"><i class="fas fa-file-alt"></i> Descripción adicional</label>
                        <textarea id="reg-descripcion-1" class="reg-descripcion" rows="2" placeholder="Detalles adicionales..."></textarea>
                    </div>
                </div>
                
                <button class="btn btn-success" data-role="save-register" id="save-register-1">
                    <i class="fas fa-check"></i> Guardar Registro
                </button>
                <button class="btn" onclick="app.generateReceiptPreview(1)">
                    <i class="fas fa-receipt"></i> Vista Previa Recibo
                </button>
                <button class="btn btn-warning" onclick="app.registroUtils.limpiarFormulario(1)">
                    <i class="fas fa-times"></i> Limpiar
                </button>
            </div>
        </div>
    </div>
    
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-history"></i> Historial de Registros</h3>
            <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn small" id="toggle-sort-order-btn" title="Alternar orden fecha">
                    <i class="fas fa-sort-amount-down"></i> Orden: Más reciente
                </button>
            </div>
        </div>
        <div class="date-filters">
            <div class="date-filter active" data-filter="all">Todos</div>
            <div class="date-filter" data-filter="custom">Personalizado</div>
        </div>
        <div id="custom-date-filter" class="hidden mt-10">
            <div class="form-row">
                <div class="form-group">
                    <label for="filter-fecha-desde">Desde</label>
                    <input type="date" id="filter-fecha-desde">
                </div>
                <div class="form-group">
                    <label for="filter-fecha-hasta">Hasta</label>
                    <input type="date" id="filter-fecha-hasta">
                </div>
                <div class="form-group">
                    <label class="visually-hidden">Filtrar</label>
                    <button class="btn" id="apply-custom-date-filter-btn">
                        <i class="fas fa-filter"></i> Filtrar
                    </button>
                </div>
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
                <span style="font-size:0.9rem;color:var(--text-muted);">Atajos:</span>
                <button class="btn small" id="quick-today-btn">Hoy</button>
                <button class="btn small" id="quick-week-btn">Esta semana</button>
                <button class="btn small" id="quick-month-btn">Este mes</button>
            </div>
        </div>
        <div class="search-box">
            <input type="text" id="search-register" placeholder="Buscar en registros...">
            <button class="btn" id="search-register-btn">
                <i class="fas fa-search"></i> Buscar
            </button>
            <button class="btn btn-warning" id="clear-search-btn">
                <i class="fas fa-times"></i> Limpiar
            </button>
            <div style="display:flex;align-items:center;gap:8px;margin-left:8px;">
                <label for="filter-tipo" style="margin:0;font-size:0.95rem;opacity:0.85;">Tipo:</label>
                <select id="filter-tipo" style="padding:4px 6px;font-size:0.95rem;">
                    <option value="all">Todos</option>
                    <option value="VENTA">VENTA</option>
                    <option value="GASTO">GASTO</option>
                </select>
            </div>
        </div>
        <div class="table-container">
            <div id="register-table-wrapper">
                <table id="register-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>ID Único</th>
                        <th>Placa</th>
                        <th>Modelo</th>
                        <th>Cliente</th>
                        <th>Productos/Servicios</th>
                        <th>Mecánicos</th>
                        <th>Cantidad</th>
                        <th>Total (PEN)</th>
                        <th>Métodos de Pago</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="card hidden" id="receipt-preview-container">
        <div class="card-header">
            <h3><i class="fas fa-receipt"></i> Vista Previa de Recibo</h3>
            <button class="btn" onclick="app.printReceipt()">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <button class="btn btn-warning" onclick="app.clearReceiptPreview()">
                <i class="fas fa-times"></i> Limpiar
            </button>
        </div>
        <div id="receipt-preview" class="receipt-preview"></div>
    </div>
    `;
};

// Modal JS para agregar producto personalizado
app.openProductModal = function(formId) {
    // crear overlay si no existe
    let overlay = document.getElementById('product-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'product-modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">Agregar Producto/Servicio personalizado</div>
                <div class="modal-body">
                    <label>Nombre</label>
                    <input id="modal-product-name" type="text">
                    <label style="margin-top:8px">Cantidad</label>
                    <input id="modal-product-qty" type="number" min="1" value="1">
                    <label style="margin-top:8px">Precio unitario (S/)</label>
                    <input id="modal-product-price" type="number" min="0" step="0.01" value="0.00">
                </div>
                <div class="modal-actions">
                    <button class="btn" id="modal-cancel">Cancelar</button>
                    <button class="btn btn-success" id="modal-add">Agregar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        // conectar eventos
        document.getElementById('modal-cancel').addEventListener('click', app.closeProductModal);
        document.getElementById('modal-add').addEventListener('click', () => app.submitProductModal(formId));
        // conectar campo nombre a catálogo: autocompletado básico usando app.data.catalogoData si existe
        try {
            const nameInput = document.getElementById('modal-product-name');
            const dropId = `modal-product-suggestions-${formId}`;
            let suggest = document.getElementById(dropId);
            if (!suggest) {
                suggest = document.createElement('div');
                suggest.id = dropId;
                suggest.className = 'searchable-options';
                suggest.style.position = 'absolute';
                suggest.style.zIndex = '11000';
                suggest.style.maxHeight = '120px';
                suggest.style.overflowY = 'auto';
                suggest.style.background = 'var(--surface, #fff)';
                suggest.style.border = '1px solid #ddd';
                suggest.style.width = '92%';
                const body = overlay.querySelector('.modal-body');
                if (body) body.appendChild(suggest);
            }
            nameInput.addEventListener('input', function() {
                const q = this.value.trim().toLowerCase();
                suggest.innerHTML = '';
                if (!q) return;
                const catalog = (app.data && app.data.catalogoData) ? app.data.catalogoData : [];
                const matches = catalog.filter(c => (c.nombre || '').toLowerCase().includes(q)).slice(0,8);
                matches.forEach(m => {
                    const item = document.createElement('div');
                    item.className = 'searchable-option';
                    item.style.padding = '6px 8px';
                    item.style.cursor = 'pointer';
                    item.textContent = m.nombre + (m.precio ? ` — S/ ${m.precio.toFixed(2)}` : '');
                    item.addEventListener('click', () => {
                        nameInput.value = m.nombre;
                        const price = document.getElementById('modal-product-price');
                        if (price && m.precio) price.value = m.precio.toFixed(2);
                        suggest.innerHTML = '';
                    });
                    suggest.appendChild(item);
                });
            });
        } catch(e) { /* no bloquear si no existe catálogo */ }
    }
    overlay.classList.remove('hidden'); overlay.style.display = 'flex';
    // Resetear campos del modal cada vez que se abre
    try {
        const name = document.getElementById('modal-product-name');
        const qty = document.getElementById('modal-product-qty');
        const price = document.getElementById('modal-product-price');
        if (name) name.value = '';
        if (qty) qty.value = '1';
        if (price) price.value = '0.00';
    } catch(e) {}
};

app.closeProductModal = function() {
    const overlay = document.getElementById('product-modal-overlay');
    if (overlay) {
        // remover para limpiar listeners y evitar fugas
        overlay.remove();
    }
};

app.submitProductModal = function(formId) {
    const name = document.getElementById('modal-product-name');
    const qty = document.getElementById('modal-product-qty');
    const price = document.getElementById('modal-product-price');
    if (!name || !qty || !price) return;
    const n = name.value.trim();
    const q = parseInt(qty.value) || 1;
    const p = parseFloat(price.value) || 0;
    // reutilizar validación tipo advertencia (input-warning) para campos obligatorios dentro del modal
    if (!n) {
        name.classList.add('input-warning');
        app.showNotification('Ingrese nombre del producto', 'error', 'register-notification');
        return;
    } else {
        name.classList.remove('input-warning');
    }
    const productosList = document.getElementById(`productos-seleccionados-list-${formId}`);
    if (!productosList) return;
    const id = `OTRO-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const item = document.createElement('div');
    item.className = 'producto-item';
    item.setAttribute('data-producto-id', id);
    item.setAttribute('data-name', n);
    item.setAttribute('data-quantity', q);
    item.setAttribute('data-price', p);
    item.innerHTML = `
        <div class="producto-display">${n} x${q} S/ ${(p * q).toFixed(2)}</div>
        <div style="margin-top:6px;">
            Cant: <input type="number" class="producto-qty" value="${q}" min="1" style="width:70px;margin-right:8px;"> 
            Precio: S/ <input type="number" class="producto-price" value="${p.toFixed(2)}" min="0" step="0.01" style="width:100px;margin-right:8px;"> 
            <button class="btn btn-danger btn-icon" onclick="app.removeProductoItem(this, ${formId})"><i class='fas fa-times'></i></button>
        </div>
    `;
    productosList.appendChild(item);
    const qtyInput = item.querySelector('.producto-qty');
    const priceInput = item.querySelector('.producto-price');
    if (qtyInput) qtyInput.addEventListener('input', () => app.updateProductosTotal(formId));
    if (priceInput) priceInput.addEventListener('input', () => app.updateProductosTotal(formId));
    document.getElementById(`productos-seleccionados-container-${formId}`).classList.remove('hidden');
    app.updateProductosTotal(formId);
    // Cerrar modal y mantener UX: scroll suave hacia el formulario y foco en el listado
    app.closeProductModal();
    try {
        const container = document.getElementById('register-form-container');
        const formEl = document.getElementById(`register-form-${formId}`);
        if (container && formEl) {
            // smooth scroll para mostrar pestañas/controles
            formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    } catch(e) {}
};

// Inicializar la pestaña de registro
app.initRegistroTab = function() {
    console.log('Inicializando módulo de registro optimizado');
    
    // Cargar opciones de mecánicos para el primer formulario
    this.loadMecanicoOptionsForForm(1);
    // Inicializar listeners específicos del formulario 1
    this.initializeRegisterForm(1);
    // Asegurar binding del botón guardar del formulario 1
    try { if (typeof app.bindSaveButton === 'function') app.bindSaveButton(1); } catch(e) {}
    // Asegurar que el título del formulario 1 coincide con su data-form-id
    const f1 = document.getElementById('register-form-1');
    if (f1) {
        const id = f1.getAttribute('data-form-id') || '1';
        const h4 = f1.querySelector('h4'); if (h4) h4.textContent = `Registro ${id}`;
    }
    
    // Configurar event listeners
    this.setupRegistroEventListeners();
    // Configurar botones de atajos de fecha (hoy/semana/mes) dentro del filtro personalizado
    try { if (typeof this.setupRegistroQuickDateButtons === 'function') this.setupRegistroQuickDateButtons(); } catch(e) {}
    // Inicializar orden de tabla (true = desc: más reciente primero)
    try {
        if (!this.data) this.data = {};
        if (typeof this.data.registerSortDesc === 'undefined') this.data.registerSortDesc = true;
        const toggleBtn = document.getElementById('toggle-sort-order-btn');
        const updateToggleLabel = () => {
            if (!toggleBtn) return;
            try {
                toggleBtn.innerHTML = `${this.data.registerSortDesc ? "<i class=\"fas fa-sort-amount-down\"></i> Orden: Más reciente" : "<i class=\"fas fa-sort-amount-up\"></i> Orden: Más antiguo"}`;
            } catch(e){}
        };
        if (toggleBtn && !toggleBtn._bound) {
            toggleBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.data.registerSortDesc = !this.data.registerSortDesc;
                updateToggleLabel();
                if (typeof this.updateRegisterTable === 'function') this.updateRegisterTable();
            });
            toggleBtn._bound = true;
        }
        updateToggleLabel();
    } catch(e) { console.warn('initRegistroTab - sort toggle init failed', e); }
    
    // Inicializar tabla de registros
    this.updateRegisterTable();
    // Mejoras de scroll: evitar que el contenedor horizontal de formularios capture scroll vertical
    try { if (typeof this.makeFormContainerScrollFriendly === 'function') this.makeFormContainerScrollFriendly(); } catch(e) { console.warn('makeFormContainerScrollFriendly failed', e); }
    // Asegurarse de que la vista previa esté oculta al iniciar
    try {
        const previewCard = document.getElementById('receipt-preview-container');
        const preview = document.getElementById('receipt-preview');
        if (preview) preview.innerHTML = '';
        if (previewCard && !previewCard.classList.contains('hidden')) previewCard.classList.add('hidden');
    } catch (e) {
        console.warn('No fue posible forzar ocultamiento de preview al iniciar:', e);
    }
};
// Cargar opciones de mecánicos para un formulario
app.loadMecanicoOptionsForForm = function(formId) {
    const searchInput = document.getElementById(`reg-mecanico-search-${formId}`);
    const optionsContainer = document.getElementById(`reg-mecanico-options-${formId}`);
    const selectEl = document.getElementById(`reg-mecanico-${formId}`);
    if (!optionsContainer || !searchInput) return;
    optionsContainer.innerHTML = '';
    // Hacer el contenedor desplazable y accesible como listbox
    try {
        optionsContainer.setAttribute('role', 'listbox');
        optionsContainer.style.maxHeight = '160px';
        optionsContainer.style.overflowY = 'auto';
        optionsContainer.style.padding = '4px';
        optionsContainer.style.border = '1px solid #ddd';
        optionsContainer.style.borderRadius = '6px';
        optionsContainer.style.background = 'var(--card-bg, #fff)';
    } catch(e) {}
    // Tomar la lista global de mecánicos y mostrar sólo los activos por defecto
    const mecanicosRaw = (this.data && this.data.mecanicosData) || [];
    const mecanicos = mecanicosRaw.filter(m => !m.estado || String(m.estado).toLowerCase() === 'activo');
    if (!mecanicos.length) {
        // Si no hay mecánicos activos, mostrar los inactivos también para permitir selección manual
        if (mecanicosRaw && mecanicosRaw.length) {
            optionsContainer.innerHTML = '';
            mecanicosRaw.forEach(mecanico => {
                    const item = document.createElement('div');
                    item.className = 'mecanico-option searchable-option inactive-option';
                    item.setAttribute('data-mecanico-id', mecanico.id);
                    item.setAttribute('tabindex', '0');
                    item.setAttribute('role', 'option');
                    item.textContent = mecanico.nombre + (mecanico.especialidad ? ` — ${mecanico.especialidad}` : '') + (mecanico.estado ? ` (${mecanico.estado})` : '');
                    item.style.padding = '6px 8px';
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', (ev) => { ev.stopPropagation(); app.selectMecanicoOption(formId, mecanico.id); });
                    item.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') item.click(); });
                    // hover styling
                    item.addEventListener('mouseover', () => { try { item.style.background = '#f0f0f0'; } catch(e){} });
                    item.addEventListener('mouseout', () => { try { item.style.background = ''; } catch(e){} });
                    optionsContainer.appendChild(item);
                    if (selectEl) { const opt = document.createElement('option'); opt.value = mecanico.id; opt.textContent = mecanico.nombre; selectEl.appendChild(opt); }
                });
            // indicar visualmente que no hay activos
            const note = document.createElement('div'); note.className = 'small muted'; note.textContent = 'No hay mecánicos activos; mostrando todos'; optionsContainer.insertBefore(note, optionsContainer.firstChild);
        } else {
            optionsContainer.innerHTML = '<div class="empty">No hay mecánicos disponibles</div>';
            if (selectEl) selectEl.innerHTML = '';
        }
        optionsContainer.classList.remove('hidden'); optionsContainer.style.display = 'block';
        return;
    }
    // poblar select si existe (mantenemos compatibilidad con versiones antiguas)
    if (selectEl) {
        selectEl.innerHTML = '';
    }
    mecanicos.forEach((mecanico, index) => {
        const item = document.createElement('div');
        item.className = 'mecanico-option searchable-option';
        item.setAttribute('data-mecanico-id', mecanico.id);
        item.setAttribute('data-index', String(index));
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.setAttribute('tabindex', '0');
        item.innerHTML = `<span class="mec-nombre">${mecanico.nombre}</span>${mecanico.especialidad ? `<span class="mec-especialidad" style="opacity:0.7;margin-left:8px;font-size:0.9em;">${mecanico.especialidad}</span>` : ''}`;
        item.style.padding = '6px 8px';
        item.style.cursor = 'pointer';
        // usar listener en vez de atributo inline
        item.addEventListener('click', (ev) => {
            ev.stopPropagation();
            app.selectMecanicoOption(formId, mecanico.id);
        });
        // permitir selección con Enter
        item.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') item.click(); });
        // hover/focus mejora UX: marcar opción activa
        item.addEventListener('mouseover', () => {
            optionsContainer.querySelectorAll('.mecanico-option').forEach(o => o.classList.remove('active-option'));
            item.classList.add('active-option');
            try { item.setAttribute('aria-selected', 'true'); } catch(e){}
            try { item.style.background = '#f0f0f0'; } catch(e){}
        });
        item.addEventListener('mouseout', () => { item.classList.remove('active-option'); try { item.setAttribute('aria-selected', 'false'); } catch(e){}; try { item.style.background = ''; } catch(e){} });
        // manejo de foco para navegación por teclado (marcar opción activa)
        item.addEventListener('focus', () => { optionsContainer.querySelectorAll('.mecanico-option').forEach(o => o.classList.remove('active-option')); item.classList.add('active-option'); try { item.setAttribute('aria-selected', 'true'); } catch(e){}; try { item.style.background = '#f0f0f0'; } catch(e){} });
        item.addEventListener('blur', () => { item.classList.remove('active-option'); try { item.setAttribute('aria-selected', 'false'); } catch(e){}; try { item.style.background = ''; } catch(e){} });
        // asegurar visibilidad por defecto
        item.classList.remove('hidden');
        item.style.display = '';
        optionsContainer.appendChild(item);
        if (selectEl) {
            const opt = document.createElement('option'); opt.value = mecanico.id; opt.textContent = mecanico.nombre; selectEl.appendChild(opt);
        }
    });
    // render existing selected tags if any
    app.renderMecanicoTagsForForm(formId);
    // aplicar filtro inicial según el input actual
    try { app.filterMecanicoOptions(formId); } catch (e) {}
    optionsContainer.classList.remove('hidden'); optionsContainer.style.display = 'block';
};

// Filtra las opciones de mecánicos según el texto del input
app.filterMecanicoOptions = function (formId) {
    const input = document.getElementById(`reg-mecanico-search-${formId}`);
    const container = document.getElementById(`reg-mecanico-options-${formId}`);
    if (!input || !container) return;
    const q = input.value.trim().toLowerCase();
    Array.from(container.children).forEach(btn => {
        const text = (btn.textContent || '').trim().toLowerCase();
        const shouldHide = !(q === '' || text.includes(q));
        if (shouldHide) { btn.classList.add('hidden'); btn.style.display = 'none'; } else { btn.classList.remove('hidden'); btn.style.display = ''; }
    });
};

// Añade un mecánico seleccionado (como tag) al formulario
app.selectMecanicoOption = function (formId, mecanicoId) {
    const mecanicos = (app.data && app.data.mecanicosData) || [];
    const m = mecanicos.find(x => String(x.id) === String(mecanicoId));
    if (!m) return;
    const mecContainer = document.getElementById(`mecanicos-seleccionados-${formId}`);
    if (!mecContainer) return;
    // limpiar 'no hay mecánicos' placeholder
    if (mecContainer.querySelector('p')) mecContainer.innerHTML = '';
    // evitar duplicados
    if (mecContainer.querySelector(`[data-mecanico-id='${m.id}']`)) {
        const existing = mecContainer.querySelector(`[data-mecanico-id='${m.id}']`);
        existing.classList.add('highlight');
        setTimeout(() => existing.classList.remove('highlight'), 400);
        return;
    }
    const tag = document.createElement('span');
    tag.className = 'mecanico-tag';
    tag.setAttribute('data-mecanico-id', m.id);
    const txt = document.createElement('span'); txt.textContent = m.nombre;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mecanico-remove';
    btn.innerHTML = "<i class='fas fa-times'></i>";
    btn.addEventListener('click', () => app.removeMecanicoTag(btn, formId));
    tag.appendChild(txt); tag.appendChild(btn);
    mecContainer.appendChild(tag);
    // limpiar input y refinar opciones
    const searchInput = document.getElementById(`reg-mecanico-search-${formId}`);
    if (searchInput) { searchInput.value = ''; app.filterMecanicoOptions(formId); }
    // sincronizar con select multiple si existe
    try {
        const selectEl = document.getElementById(`reg-mecanico-${formId}`);
        if (selectEl) {
            const opt = Array.from(selectEl.options).find(o => String(o.value) === String(m.id));
            if (opt) opt.selected = true;
        }
    } catch (e) { console.warn('sync select on selectMecanicoOption failed', e); }
};

app.renderMecanicoTagsForForm = function(formId) {
    // For now tags are stored only in DOM; this can be used to hydrate from model later
    const mecContainer = document.getElementById(`mecanicos-seleccionados-${formId}`);
    if (!mecContainer) return;
    // if empty, show placeholder
    if (!mecContainer.children.length) {
        mecContainer.innerHTML = '<p>No hay mecánicos asignados</p>';
    } else {
        // asegurar que cada tag tenga botón funcional si vienen del DOM
        mecContainer.querySelectorAll('.mecanico-tag').forEach(tag => {
            const btn = tag.querySelector('.mecanico-remove');
            if (btn && !btn._bound) { btn.addEventListener('click', () => app.removeMecanicoTag(btn, formId)); btn._bound = true; }
        });
    }
};
// La lógica de render de la tabla fue extraída a js/modules/Registro/table.js
// table.js define app.updateRegisterTable, app.updateRegisterTableFiltered y app.highlightRowById.
// Si por compatibilidad faltara, delegar a implementaciones internas (no sobreescribir si ya existe)
if (typeof app.updateRegisterTable !== 'function') {
    app.updateRegisterTable = function() {
        try {
            // Delegar a la versión filtrada si está disponible
            const registros = (app && app.data && Array.isArray(app.data.registerData)) ? app.data.registerData : [];
            if (typeof app.updateRegisterTableFiltered === 'function') {
                app.updateRegisterTableFiltered(registros);
                return;
            }

            // Fallback: renderizar tabla básica
            const tbody = document.querySelector('#register-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            registros.forEach(registro => {
                const row = document.createElement('tr');
                const nombresMecanicos = (typeof app.obtenerNombresMecanicos === 'function') ? app.obtenerNombresMecanicos(registro.mecanicos || []) : [];
                const productosTexto = (registro.productos || []).map(p => `${p.name} x${p.quantity}`).join(', ');
                row.innerHTML = `
                    <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registro.fecha) : registro.fecha}</td>
                    <td>${registro.tipo || ''}</td>
                    <td>${registro.id || ''}</td>
                    <td>${registro.placa || ''}</td>
                    <td>${registro.modelo || ''}</td>
                    <td>${registro.cliente || ''}</td>
                    <td>${productosTexto}</td>
                    <td>${nombresMecanicos.join(', ')}</td>
                    <td>${(registro.productos||[]).reduce((sum, p) => sum + (p.quantity||0), 0)}</td>
                    <td>S/ ${Number(registro.total||0).toFixed(2)}</td>
                    <td>${(registro.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
                    <td>
                        <button class="btn btn-icon" onclick="app.editarRegistro('${registro.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${registro.id}')"><i class="fas fa-receipt"></i></button>
                        <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${registro.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (e) {
            console.error('updateRegisterTable fallback error', e);
        }
    };
}

// Filtrar registros por fecha
// Filtrado de registros por fecha (queda aquí por la lógica de negocio), se puede reutilizar desde table.js
app.filtrarRegistrosPorFecha = function(registros) {
    try {
        const ahora = new Date();
        // normalizar inicio/finales de rango
        const inicioHoy = new Date(ahora); inicioHoy.setHours(0,0,0,0);
        const finHoy = new Date(ahora); finHoy.setHours(23,59,59,999);

        switch(this.data.currentDateFilter) {
            case 'today':
                return registros.filter(registro => {
                    const raw = registro.createdAt || registro.fecha;
                    const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(raw) : raw;
                    const registroDate = new Date(iso);
                    return registroDate >= inicioHoy && registroDate <= finHoy;
                });
            case 'week': {
                // calcular inicio de semana (lunes) y fin de semana
                const inicioSemana = new Date(inicioHoy);
                const dia = inicioSemana.getDay();
                const diffToMonday = (dia === 0) ? -6 : (1 - dia);
                inicioSemana.setDate(inicioSemana.getDate() + diffToMonday);
                inicioSemana.setHours(0,0,0,0);
                const finSemana = new Date(inicioSemana); finSemana.setDate(inicioSemana.getDate() + 6); finSemana.setHours(23,59,59,999);
                return registros.filter(registro => {
                    const raw = registro.createdAt || registro.fecha;
                    const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(raw) : raw;
                    const registroDate = new Date(iso);
                    return registroDate >= inicioSemana && registroDate <= finSemana;
                });
            }
            case 'month':
                return registros.filter(registro => {
                    const raw = registro.createdAt || registro.fecha;
                    const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(raw) : raw;
                    const registroDate = new Date(iso);
                    return registroDate.getMonth() === ahora.getMonth() && registroDate.getFullYear() === ahora.getFullYear();
                });
            default:
                return registros;
        }
    } catch (e) { console.warn('filtrarRegistrosPorFecha error', e); return registros; }
};

// Helper: renderizar una lista de registros en la tabla (usado como fallback)
app.renderRegisterTableFromList = function(registros) {
    try {
        const tbody = document.querySelector('#register-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        (registros||[]).forEach(registro => {
            const row = document.createElement('tr');
            const nombresMecanicos = (typeof app.obtenerNombresMecanicos === 'function') ? app.obtenerNombresMecanicos(registro.mecanicos || []) : [];
            const productosTexto = (registro.productos || []).map(p => `${p.name} x${p.quantity}`).join(', ');
            row.innerHTML = `
                <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registro.fecha) : registro.fecha}</td>
                <td>${registro.tipo || ''}</td>
                <td>${registro.id || ''}</td>
                <td>${registro.placa || ''}</td>
                <td>${registro.modelo || ''}</td>
                <td>${registro.cliente || ''}</td>
                <td>${productosTexto}</td>
                <td>${nombresMecanicos.join(', ')}</td>
                <td>${(registro.productos||[]).reduce((sum, p) => sum + (p.quantity||0), 0)}</td>
                <td>S/ ${Number(registro.total||0).toFixed(2)}</td>
                <td>${(registro.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
                <td>
                    <button class="btn btn-icon" onclick="app.editarRegistro('${registro.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${registro.id}')"><i class="fas fa-receipt"></i></button>
                    <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${registro.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) { console.error('renderRegisterTableFromList error', e); }
};
// Editar registro existente
app.editarRegistro = function(registroId) {
    console.log('Editando registro:', registroId);
    // Buscar el registro
    const registro = this.data.registerData.find(r => r.id === registroId);
    if (!registro) {
        if (typeof this.showNotification === 'function') this.showNotification('Registro no encontrado', 'error', 'register-notification'); else console.error('Registro no encontrado');
        return;
    }

    // Buscar un formulario libre o crear uno nuevo
    let formId = null;
    for (let i = 1; i <= this.data.currentRegisterForms; i++) {
        const form = document.getElementById(`register-form-${i}`);
        if (form && !form.classList.contains('editing')) {
            formId = i;
            break;
        }
    }
    if (!formId) {
        this.addRegisterForm();
        formId = this.data.currentRegisterForms;
    }

    // Evitar editar el mismo registro en otro formulario
    const alreadyEditing = document.querySelectorAll('.register-form.editing');
    for (const ef of alreadyEditing) {
        if (ef.dataset.editingRegistroId === registroId) {
            if (typeof this.showNotification === 'function') this.showNotification('Este registro ya está en edición en otra pestaña', 'warning', 'register-notification'); else console.warn('Este registro ya está en edición en otra pestaña');
            return;
        }
    }

    // Activar la pestaña y marcar como edición
    this.activarPestañaRegistro(formId);
    const form = document.getElementById(`register-form-${formId}`);
    // Guardar snapshot del estado anterior para permitir cancelación
    if (!this._editingSnapshots) this._editingSnapshots = {};
    this._editingSnapshots[formId] = JSON.parse(JSON.stringify(registro));

    if (form) {
        form.classList.add('editing');
        form.dataset.editingRegistroId = registroId;
        // Banner visual
        if (!form.querySelector('.edit-banner')) {
            const banner = document.createElement('div');
            banner.className = 'edit-banner';
            banner.innerHTML = `<strong style="margin-right:10px;color:#fff">Modo edición</strong> Editando ID: ${registroId}`;
            form.insertBefore(banner, form.firstChild);
        }
    }

    // Cargar datos en el formulario
    const fechaInputEl = document.getElementById(`reg-fecha-${formId}`);
    if (fechaInputEl) fechaInputEl.value = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(registro.fecha) : registro.fecha;
    document.getElementById(`reg-tipo-${formId}`).value = registro.tipo;
    // Ajustar la UI según el tipo (VENTA/GASTO)
    if (typeof app.handleTipoChange === 'function') {
        try { app.handleTipoChange(formId); } catch (e) { console.warn('handleTipoChange failed', e); }
    }
    document.getElementById(`reg-placa-${formId}`).value = registro.placa;
    document.getElementById(`reg-cliente-${formId}`).value = registro.cliente;
    document.getElementById(`reg-modelo-${formId}`).value = registro.modelo;
    // Restaurar flag sinVehiculo si existe
    const sinVehiculoEl = document.getElementById(`reg-sin-vehiculo-${formId}`);
    if (sinVehiculoEl) {
        sinVehiculoEl.checked = !!registro.sinVehiculo;
        // Aplicar UI changes
        if (typeof app.handleSinVehiculoChange === 'function') app.handleSinVehiculoChange(formId);
    }
    if (registro.modelo === 'Otro') {
        const moc = document.getElementById(`modelo-otro-container-${formId}`);
        if (moc) moc.classList.remove('hidden');
        const moInput = document.getElementById(`reg-modelo-otro-${formId}`);
        if (moInput) moInput.value = registro.modelo;
    }
    document.getElementById(`reg-descripcion-${formId}`).value = registro.descripcion;

    // Mecánicos
    const mecContainer = document.getElementById(`mecanicos-seleccionados-${formId}`);
    mecContainer.innerHTML = '';
    registro.mecanicos.forEach(mId => {
        const mecanico = this.data.mecanicosData.find(m => m.id === mId);
        if (mecanico) {
            const tag = document.createElement('span');
            tag.className = 'mecanico-tag';
            tag.setAttribute('data-mecanico-id', mId);
            tag.innerHTML = `${mecanico.nombre} <button onclick="app.removeMecanicoTag(this, ${formId})"><i class='fas fa-times'></i></button>`;
            mecContainer.appendChild(tag);
        }
    });

    // Productos: restaurar usando la misma estructura que agregadores para que obtenerProductosSeleccionados los lea
    const prodList = document.getElementById(`productos-seleccionados-list-${formId}`);
    if (prodList) {
        prodList.innerHTML = '';
        (registro.productos||[]).forEach(p => {
            try {
                const item = document.createElement('div');
                item.className = 'producto-item';
                item.setAttribute('data-producto-id', p.id);
                item.setAttribute('data-name', p.name);
                item.setAttribute('data-quantity', p.quantity);
                item.setAttribute('data-price', p.price);
                item.innerHTML = `
                    <div class="producto-display">${p.name} x${p.quantity} S/ ${(p.price * p.quantity).toFixed(2)}</div>
                    <div style="margin-top:6px;">
                        Cant: <input type="number" class="producto-qty" value="${p.quantity}" min="1" style="width:70px;margin-right:8px;"> 
                        Precio: S/ <input type="number" class="producto-price" value="${Number(p.price).toFixed(2)}" min="0" step="0.01" style="width:100px;margin-right:8px;"> 
                        <button class="btn btn-danger btn-icon" onclick="app.removeProductoItem(this, ${formId})"><i class='fas fa-times'></i></button>
                    </div>
                `;
                prodList.appendChild(item);
                const qtyInput = item.querySelector('.producto-qty');
                const priceInput = item.querySelector('.producto-price');
                if (qtyInput) qtyInput.addEventListener('input', () => app.updateProductosTotal(formId));
                if (priceInput) priceInput.addEventListener('input', () => app.updateProductosTotal(formId));
            } catch (e) { console.warn('restore product to edit form failed', e); }
        });
        const prodContainer = document.getElementById(`productos-seleccionados-container-${formId}`);
        if (prodContainer) prodContainer.classList.remove('hidden');
        this.updateProductosTotal(formId);
    }

    // Si es GASTO, rellenar campos específicos
    if (registro.tipo === 'GASTO') {
        const gastoNombre = document.getElementById(`reg-gasto-nombre-${formId}`);
        const gastoUnidades = document.getElementById(`reg-gasto-unidades-${formId}`);
        const gastoPrecio = document.getElementById(`reg-gasto-precio-${formId}`);
        if (gastoNombre) gastoNombre.value = registro.descripcion || (registro.productos && registro.productos[0] && registro.productos[0].name) || '';
        if (gastoUnidades) gastoUnidades.value = registro.productos && registro.productos[0] ? registro.productos[0].quantity : 1;
        if (gastoPrecio) gastoPrecio.value = registro.productos && registro.productos[0] ? Number(registro.productos[0].price).toFixed(2) : '0.00';
        // mostrar la fila de gasto
        const gastoRow = document.getElementById(`gasto-row-${formId}`);
        if (gastoRow) gastoRow.classList.remove('hidden');
    }

    // Métodos de pago
    const pagoContainer = document.getElementById(`metodos-pago-${formId}`);
    pagoContainer.innerHTML = '';
    registro.metodosPago.forEach(m => {
        const div = document.createElement('div');
        div.className = 'payment-method';
        div.innerHTML = `<select class="pago-metodo">
            <option value="Efectivo"${m.metodo==='Efectivo'?' selected':''}>Efectivo</option>
            <option value="Tarjeta"${m.metodo==='Tarjeta'?' selected':''}>Tarjeta</option>
            <option value="Yape"${m.metodo==='Yape'?' selected':''}>Yape</option>
            <option value="Otros"${m.metodo==='Otros'?' selected':''}>Otros</option>
        </select>
        <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" value="${m.monto}" oninput="app.calcularTotalPagos(${formId})">
        <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, ${formId})"><i class="fas fa-times"></i></button>`;
        pagoContainer.appendChild(div);
    });
    this.calcularTotalPagos(formId);

    // Cambiar el botón de guardar (identificado por id) para actualizar el registro
    const saveBtnId = `save-register-${formId}`;
    let saveBtn = document.getElementById(saveBtnId) || form.querySelector(`[data-role='save-register']`);
    if (saveBtn) {
        // actualizar texto
        try { saveBtn.textContent = 'Actualizar Registro'; } catch (e) {}
        // quitar handlers existentes si el método existe (tests pueden usar objetos simples)
        try { if (typeof saveBtn.removeAttribute === 'function') saveBtn.removeAttribute('onclick'); } catch (e) {}
        try {
            if (typeof saveBtn.cloneNode === 'function' && saveBtn.parentNode && typeof saveBtn.parentNode.replaceChild === 'function') {
                const clone = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(clone, saveBtn);
                saveBtn = clone;
            }
        } catch (e) {}
        // asegurarse de que el id y data-role se mantienen para futuras restauraciones
        try { if (typeof saveBtn.id !== 'undefined') saveBtn.id = saveBtn.id || `save-register-${formId}`; if (typeof saveBtn.setAttribute === 'function') saveBtn.setAttribute('data-role', 'save-register'); } catch (e) {}
        try { if (typeof saveBtn.addEventListener === 'function') saveBtn.addEventListener('click', function onUpdateClick(ev) { ev.preventDefault(); app.actualizarRegistro(registroId, formId); }); else saveBtn.onclick = () => app.actualizarRegistro(registroId, formId); } catch (e) {}
    }
    // Añadir botón cancelar si no existe
    let cancelBtn = form.querySelector('.btn-cancel-edit');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-warning btn-cancel-edit';
        cancelBtn.textContent = 'Cancelar edición';
        cancelBtn.onclick = () => app.cancelarEdicionRegistro(formId);
        try { if (saveBtn && typeof saveBtn.insertAdjacentElement === 'function') saveBtn.insertAdjacentElement('afterend', cancelBtn); else if (form && typeof form.appendChild === 'function') form.appendChild(cancelBtn); } catch (e) { try { if (form && typeof form.appendChild === 'function') form.appendChild(cancelBtn); } catch (e2) {} }
    }

    if (typeof this.showNotification === 'function') this.showNotification('Edite el registro y guarde los cambios', 'info', 'register-notification'); else console.info('Edite el registro y guarde los cambios');
};
// Actualizar registro existente
app.actualizarRegistro = function(registroId, formId) {
    try {
        // Obtener datos editados
        const registroEditado = this.obtenerDatosFormulario(formId);
        // Buscar y actualizar en el array (necesitamos fecha existente antes de validar)
        const idx = this.data.registerData.findIndex(r => r.id === registroId);
        if (idx === -1) {
            this.showNotification('Registro no encontrado', 'error', 'register-notification');
            return;
        }
        // Mantener el mismo ID y forzar la fecha almacenada para validar correctamente
        registroEditado.id = registroId;
        registroEditado.fecha = this.data.registerData[idx].fecha;

        // Validar una vez la fecha y otros campos normalizados
        const validacion = app.registroValidations.validarRegistroCompleto(registroEditado);
        if (!validacion.valido) {
            this.showNotification(validacion.mensaje, 'error', 'register-notification');
            return false;
        }
        // Validaciones estrictas: precios no negativos y cantidad > 0 solo para productos válidos
        for (const p of (registroEditado.productos || [])) {
            if (!p.name || typeof p.quantity === 'undefined' || typeof p.price === 'undefined') continue;
            if (p.price < 0) { this.showNotification('Precio no puede ser negativo', 'error', 'register-notification'); return; }
            if (p.quantity <= 0) { this.showNotification(`La cantidad de ${p.name} debe ser mayor a 0.`, 'error', 'register-notification'); return; }
        }
        // Normalizar campos: mecanicosIds -> mecanicos
        if (registroEditado.mecanicosIds) {
            registroEditado.mecanicos = registroEditado.mecanicosIds;
            delete registroEditado.mecanicosIds;
        }
        // Guardar cambios fusionando con el registro existente
        this.data.registerData[idx] = {
            ...this.data.registerData[idx],
            ...registroEditado,
        };
        // Actualizar interfaz
        this.updateRegisterTable();
        this.updateResumenTable();
        this.updateMecanicosTable();
        // Limpiar modo edición
        const form = document.getElementById(`register-form-${formId}`);
        if (form) {
            form.classList.remove('editing');
            delete form.dataset.editingRegistroId;
            const banner = form.querySelector('.edit-banner'); if (banner) banner.remove();
            const cancel = form.querySelector('.btn-cancel-edit'); if (cancel) cancel.remove();
            // Restaurar botón (buscar por id o data-role)
            let saveBtn = document.getElementById(`save-register-${formId}`) || form.querySelector(`[data-role='save-register']`) || form.querySelector('.btn-success');
            if (saveBtn) {
                try { saveBtn.textContent = 'Guardar Registro'; } catch (e) {}
                // quitar listeners previos y reasignar addRegister
                try { saveBtn.removeAttribute('onclick'); const clone = saveBtn.cloneNode(true); saveBtn.parentNode.replaceChild(clone, saveBtn); saveBtn = clone; } catch (e) {}
                try { saveBtn.addEventListener('click', () => app.addRegister(formId)); } catch (e) { saveBtn.onclick = () => app.addRegister(formId); }
                try { saveBtn.id = `save-register-${formId}`; saveBtn.setAttribute('data-role', 'save-register'); } catch (e) {}
            }
        }
        app.registroUtils.limpiarFormulario(formId);
        // Resaltar la fila actualizada
        try { if (typeof app.highlightRowById === 'function') app.highlightRowById(registroId); } catch (e) { console.warn('highlightRowById error', e); }
        // Limpieza automática tras actualizar
        if (typeof app.onAfterEditOrCancel === 'function') app.onAfterEditOrCancel(formId);
        this.showNotification('Registro actualizado correctamente', 'success', 'register-notification');
        try {
            if (typeof this.forceSave === 'function') this.forceSave();
            else if (typeof app !== 'undefined' && typeof app.forceSave === 'function') app.forceSave();
        } catch (e) { console.warn('[diag] forceSave unavailable', e); }
    } catch (error) {
        console.error('Error al actualizar registro:', error);
        this.showNotification('Error inesperado al actualizar el registro', 'error', 'register-notification');
    }
}

// Cancelar edición y restaurar snapshot
app.cancelarEdicionRegistro = function(formId) {
    try {
        const snapshot = this._editingSnapshots && this._editingSnapshots[formId];
        const form = document.getElementById(`register-form-${formId}`);
        if (!snapshot || !form) {
            if (form) form.classList.remove('editing');
            return;
        }
        // Restaurar los campos
    const fechaInputEl2 = document.getElementById(`reg-fecha-${formId}`);
    if (fechaInputEl2) fechaInputEl2.value = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(snapshot.fecha || this.setCurrentDate()) : (snapshot.fecha || this.setCurrentDate());
        document.getElementById(`reg-tipo-${formId}`).value = snapshot.tipo || '';
        document.getElementById(`reg-placa-${formId}`).value = snapshot.placa || '';
        document.getElementById(`reg-cliente-${formId}`).value = snapshot.cliente || '';
        document.getElementById(`reg-modelo-${formId}`).value = snapshot.modelo || '';
        if (snapshot.modelo === 'Otro') {
            const moc = document.getElementById(`modelo-otro-container-${formId}`);
            if (moc) moc.classList.remove('hidden');
            document.getElementById(`reg-modelo-otro-${formId}`).value = snapshot.modelo || '';
        } else {
            const moc = document.getElementById(`modelo-otro-container-${formId}`);
            if (moc) moc.classList.add('hidden');
        }
        document.getElementById(`reg-descripcion-${formId}`).value = snapshot.descripcion || '';
    // Restaurar sinVehiculo
    // Limpieza automática tras cancelar edición
    if (typeof app.onAfterEditOrCancel === 'function') app.onAfterEditOrCancel(formId);
        const sinVehiculoEl2 = document.getElementById(`reg-sin-vehiculo-${formId}`);
        if (sinVehiculoEl2) {
            sinVehiculoEl2.checked = !!snapshot.sinVehiculo;
            if (typeof app.handleSinVehiculoChange === 'function') app.handleSinVehiculoChange(formId);
        }

        // mecánicos
        const mecContainer = document.getElementById(`mecanicos-seleccionados-${formId}`);
        mecContainer.innerHTML = '';
        (snapshot.mecanicos||[]).forEach(mId => {
            const mecanico = this.data.mecanicosData.find(m => m.id === mId);
            if (mecanico) {
                const tag = document.createElement('span');
                tag.className = 'mecanico-tag';
                tag.setAttribute('data-mecanico-id', mId);
                tag.innerHTML = `${mecanico.nombre} <button onclick="app.removeMecanicoTag(this, ${formId})"><i class='fas fa-times'></i></button>`;
                mecContainer.appendChild(tag);
            }
        });

        // productos
        const prodList = document.getElementById(`productos-seleccionados-list-${formId}`);
        prodList.innerHTML = '';
        (snapshot.productos||[]).forEach(p => {
            const item = document.createElement('div');
            item.className = 'producto-item';
            item.setAttribute('data-producto-id', p.id);
            item.setAttribute('data-name', p.name);
            item.innerHTML = `
                <div class="producto-display">${p.name} x${p.quantity} S/ ${(p.price * p.quantity).toFixed(2)}</div>
                <div class="producto-meta" style="margin-top:6px;">
                    Cant: <input type="number" class="producto-qty" value="${p.quantity}" min="1" style="width:70px;margin-right:8px;"> 
                    Precio: S/ <input type="number" class="producto-price" value="${p.price.toFixed(2)}" min="0" step="0.01" style="width:100px;margin-right:8px;"> 
                    <button class="btn btn-danger btn-icon" onclick="app.removeProductoItem(this, ${formId})"><i class='fas fa-times'></i></button>
                </div>
            `;
            prodList.appendChild(item);
            const qtyInput = item.querySelector('.producto-qty');
            const priceInput = item.querySelector('.producto-price');
            qtyInput.addEventListener('input', () => app.updateProductosTotal(formId));
            priceInput.addEventListener('input', () => app.updateProductosTotal(formId));
        });
    const prodContainerEl = document.getElementById(`productos-seleccionados-container-${formId}`);
    if (prodContainerEl) { if (!(snapshot.productos && snapshot.productos.length)) prodContainerEl.classList.add('hidden'); else prodContainerEl.classList.remove('hidden'); }
        this.updateProductosTotal(formId);

        // pagos
        const pagoContainer = document.getElementById(`metodos-pago-${formId}`);
        pagoContainer.innerHTML = '';
        (snapshot.metodosPago||[]).forEach(m => {
            const div = document.createElement('div');
            div.className = 'payment-method';
            div.innerHTML = `<select class="pago-metodo">
                <option value="Efectivo"${m.metodo==='Efectivo'?' selected':''}>Efectivo</option>
                <option value="Tarjeta"${m.metodo==='Tarjeta'?' selected':''}>Tarjeta</option>
                <option value="Yape"${m.metodo==='Yape'?' selected':''}>Yape</option>
                <option value="Otros"${m.metodo==='Otros'?' selected':''}>Otros</option>
            </select>
            <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" value="${m.monto}" oninput="app.calcularTotalPagos(${formId})">
            <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, ${formId})"><i class="fas fa-times"></i></button>`;
            pagoContainer.appendChild(div);
        });
        this.calcularTotalPagos(formId);

        // Restaurar botón guardar identificado por id
        const saveBtnId = `save-register-${formId}`;
        let saveBtn = document.getElementById(saveBtnId) || form.querySelector(`[data-role='save-register']`);
        if (saveBtn) {
            try { saveBtn.textContent = 'Guardar Registro'; } catch (e) {}
            saveBtn.removeAttribute('onclick');
            try { const clone = saveBtn.cloneNode(true); saveBtn.parentNode.replaceChild(clone, saveBtn); saveBtn = clone; } catch (e) {}
            saveBtn.addEventListener('click', () => app.addRegister(formId));
        }
        // Quitar boton cancelar
        const cancel = form.querySelector('.btn-cancel-edit');
        if (cancel) cancel.remove();

    form.classList.remove('editing');
    delete form.dataset.editingRegistroId;
    const banner = form.querySelector('.edit-banner'); if (banner) banner.remove();
        delete this._editingSnapshots[formId];
        this.showNotification('Edición cancelada', 'info', 'register-notification');
    } catch (e) {
        console.error('Error al cancelar edición:', e);
    }
};

// Eliminar registro
app.eliminarRegistro = function(registroId) {
    if (!confirm('¿Está seguro de eliminar este registro?')) {
        return;
    }
    
    // Buscar el índice del registro
    const index = this.data.registerData.findIndex(r => r.id === registroId);
    if (index === -1) {
        this.showNotification('Registro no encontrado', 'error', 'register-notification');
        return;
    }
    
    // Eliminar el registro
    this.data.registerData.splice(index, 1);
    
    // Actualizar interfaces
    this.updateRegisterTable();
    this.updateResumenTable();
    this.updateMecanicosTable();
    
    // Guardar cambios
    this.forceSave();
    
    this.showNotification('Registro eliminado correctamente', 'success', 'register-notification');
};

app.updateResumenTable = function() {
    // Esta función debería estar en resumen.js
    console.log('Actualizando tabla de resumen...');
    // Si existe el módulo de resumen, llamar a su función
    if (typeof app.initResumenTab === 'function') {
        // Podemos llamar a una función que actualice la tabla de resumen
        // Por ahora, si no hay error, asumimos que se actualiza correctamente.
    }
};
// Actualizar tabla de mecánicos (placeholder - debe estar en mecanicos.js)
app.updateMecanicosTable = function() {
    console.log('Actualizando tabla de mecánicos...');
    // Esta función debería estar implementada en mecanicos.js
    // Por ahora es un placeholder para evitar errores
};
// Cerrar pestaña de registro
app.closeRegisterTab = function(formId) {
    // Nunca permitir cerrar el primer formulario (id=1)
    if (Number(formId) === 1) {
        this.showNotification('El primer formulario no puede cerrarse', 'warning', 'register-notification');
        return;
    }
    if (this.data.currentRegisterForms <= 1) {
        this.showNotification('Debe haber al menos un formulario de registro', 'warning', 'register-notification');
        return;
    }
    
    // Eliminar la pestaña y el formulario
    const tab = document.querySelector(`.register-tab[data-form-id="${formId}"]`);
    const form = document.getElementById(`register-form-${formId}`);
    
    if (tab) tab.remove();
    if (form) form.remove();
    
    // Actualizar contador (no renumerar pestañas para preservar IDs únicos)
    const tabs = document.querySelectorAll('.register-tab');
    this.data.currentRegisterForms = tabs.length;
    // Si la pestaña activa fue eliminada, activar la primera disponible
    if (parseInt(this.data.activeRegisterForm) === formId) {
        const firstTab = document.querySelector('.register-tab');
        if (firstTab) {
            const newFormId = firstTab.getAttribute('data-form-id');
            this.activarPestañaRegistro(newFormId);
        }
    }
};

// Activar pestaña de registro
app.activarPestañaRegistro = function(formId) {
    // Desactivar todas las pestañas y formularios
    document.querySelectorAll('.register-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.register-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Activar la pestaña y formulario seleccionados
    const tab = document.querySelector(`.register-tab[data-form-id="${formId}"]`);
    const form = document.getElementById(`register-form-${formId}`);
    if (tab) tab.classList.add('active');
    if (form) form.classList.add('active');
    // Scroll automático para que la pestaña activa sea visible (llevar formulario a la parte superior)
    if (tab && tab.scrollIntoView) tab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    // Scroll el contenedor para mostrar pestañas y algo del formulario (no arrancar la vista)
    try {
        const tabsContainer = document.getElementById('register-tabs');
        if (tabsContainer && tab) {
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            // desplazar el contenedor horizontalmente si aplica
            tabsContainer.scrollLeft = Math.max(0, tab.offsetLeft - 20);
        }
        if (form && form.scrollIntoView) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch(e) {}
    this.data.activeRegisterForm = Number(formId);
};

// Obtener nombres de mecánicos por IDs
app.obtenerNombresMecanicos = function(mecanicosIds) {
    return mecanicosIds.map(id => {
        const mecanico = this.data.mecanicosData.find(m => m.id === id);
        return mecanico ? mecanico.nombre : 'Desconocido';
    }).filter(nombre => nombre !== 'Desconocido');
};

// Función para agregar formulario de registro (ya debería existir, pero por si acaso)
app.addRegisterForm = function() {
    // Usar contador único para evitar repetir '1' al cerrar/abrir pestañas
    const newFormId = this.data.nextFormId || (this.data.currentRegisterForms + 1);

    // Crear nueva pestaña
    const tabsContainer = document.getElementById('register-tabs');
    const newTab = document.createElement('div');
    newTab.className = 'register-tab';
    newTab.setAttribute('data-form-id', newFormId);
    newTab.innerHTML = `
        <span>Registro ${newFormId}</span>
        <span class="close-tab" onclick="event.stopPropagation();app.closeRegisterTab(${newFormId})">×</span>
    `;
    // Activar pestaña al hacer click
    newTab.addEventListener('click', () => this.activarPestañaRegistro(newFormId));
    tabsContainer.appendChild(newTab);

    // Clonar el formulario 1 y adaptar IDs/funciones
    const formsContainer = document.getElementById('register-form-container');
    const templateForm = document.getElementById('register-form-1');
    const newForm = document.createElement('div');
    newForm.className = 'register-form';
    newForm.id = `register-form-${newFormId}`;

    if (templateForm) {
        // Clonar nodo para mantener elementos y luego actualizar ids/atributos
        const clone = templateForm.cloneNode(true);
        // limpiar clase active en clone
        clone.classList.remove('active');
        clone.id = `register-form-${newFormId}`;

        // Actualizar cualquier atributo id que termine en -1 a -{newFormId}
        clone.querySelectorAll('[id]').forEach(el => {
            if (el.id && el.id.endsWith('-1')) {
                el.id = el.id.replace(/-1$/, `-${newFormId}`);
            }
        });
        // Actualizar labels 'for'
        clone.querySelectorAll('label[for]').forEach(l => {
            if (l.getAttribute('for') && l.getAttribute('for').endsWith('-1')) {
                l.setAttribute('for', l.getAttribute('for').replace(/-1$/, `-${newFormId}`));
            }
        });

        // Actualizar atributos inline que referencian al formId, ej: (1) -> (newFormId)
        const attrsToFix = ['onclick','oninput','onchange','onblur','onkeydown'];
        clone.querySelectorAll('*').forEach(el => {
            attrsToFix.forEach(attr => {
                const v = el.getAttribute && el.getAttribute(attr);
                if (v && typeof v === 'string' && v.includes('(1)')) {
                    el.setAttribute(attr, v.replace(/\(1\)/g, `(${newFormId})`));
                }
                // también reemplazar referencias con -1
                if (v && typeof v === 'string' && v.includes('-1')) {
                    el.setAttribute(attr, v.replace(/-1/g, `-${newFormId}`));
                }
            });
        });

        // Finalmente, colocar el innerHTML del clone dentro de newForm
        newForm.innerHTML = clone.innerHTML;
        // Actualizar título visible dentro del formulario clonado
        const tempTitleMatch = newForm.querySelector('h4');
        if (tempTitleMatch) tempTitleMatch.textContent = `Registro ${newFormId}`;
    } else {
        newForm.innerHTML = `<p>Formulario ${newFormId} - plantilla no encontrada</p>`;
    }

    formsContainer.appendChild(newForm);

    // Inicializar opciones y estados del nuevo formulario
    this.data.currentRegisterForms = (this.data.currentRegisterForms || 0) + 1;
    this.data.nextFormId = newFormId + 1;
    setTimeout(() => this.loadMecanicoOptionsForForm(newFormId), 0);
    // Inicializar listeners programáticamente para evitar referencias cruzadas
    setTimeout(() => this.initializeRegisterForm(newFormId), 0);
    // Asegurar binding del botón guardar en el nuevo formulario
    setTimeout(() => { try { if (typeof app.bindSaveButton === 'function') app.bindSaveButton(newFormId); } catch(e) {} }, 50);
    // Asegurar que el contenedor de productos y pago exista
    const prodContainer = document.getElementById(`productos-seleccionados-container-${newFormId}`);
    if (prodContainer) prodContainer.classList.add('hidden');
    const pagoTotal = document.getElementById(`pago-total-${newFormId}`);
    if (pagoTotal) pagoTotal.textContent = 'Total: S/ 0.00';

    // Activar la nueva pestaña y desplazar con un scroll suave mostrando pestañas y parte del formulario
    this.activarPestañaRegistro(newFormId);
    try {
        const tabsContainer = document.getElementById('register-tabs');
        if (tabsContainer) tabsContainer.scrollLeft = tabsContainer.scrollWidth; // llevar al final
        const formEl = document.getElementById(`register-form-${newFormId}`);
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch(e) {}
};

// Inicializar listeners y comportamientos específicos de un formulario dado
app.initializeRegisterForm = function(formId) {
    const form = document.getElementById(`register-form-${formId}`);
    if (!form) return;

    // Producto: input búsqueda
    const prodSearch = document.getElementById(`reg-producto-search-${formId}`);
    const prodOptions = document.getElementById(`reg-producto-options-${formId}`);
    if (prodSearch) {
        // enlazar oninput de forma segura
        prodSearch.oninput = () => app.filterProductOptions(formId);
        // asegurar que Enter / flechas se manejen por la función central
        prodSearch.addEventListener('focus', () => { if (prodOptions) prodOptions.classList.remove('hidden'); });
    }

    // Botón agregar producto (buscar por atributo onclick existente o por texto)
    try {
        const addButtons = Array.from(form.querySelectorAll('button'));
        addButtons.forEach(btn => {
            const onclickAttr = btn.getAttribute && btn.getAttribute('onclick');
            const txt = (btn.textContent || '').trim();
            if (onclickAttr && onclickAttr.includes('addProductToSelection')) {
                btn.onclick = null;
                btn.addEventListener('click', () => app.addProductToSelection(formId));
            }
            if (onclickAttr && onclickAttr.includes('addProductoPersonalizado')) {
                btn.onclick = null;
                btn.addEventListener('click', () => app.addProductoPersonalizado(formId));
            }
            if (onclickAttr && onclickAttr.includes('addGastoToSelection')) {
                btn.onclick = null;
                btn.addEventListener('click', () => app.addGastoToSelection(formId));
            }
            if (onclickAttr && onclickAttr.includes('addPaymentMethod')) {
                btn.onclick = null;
                btn.addEventListener('click', () => app.addPaymentMethod(formId));
            }
            // botón de búsqueda de mecánicos que enfoca input
            if (onclickAttr && onclickAttr.includes("document.getElementById('reg-mecanico-search-")) {
                btn.onclick = null;
                btn.addEventListener('click', () => {
                    const inp = document.getElementById(`reg-mecanico-search-${formId}`);
                    if (inp) inp.focus();
                });
            }
        });
    } catch (e) {
        console.warn('initializeRegisterForm - error al enlazar botones', e);
    }

    // Mecánico: input búsqueda
    const mecSearch = document.getElementById(`reg-mecanico-search-${formId}`);
    const mecOptions = document.getElementById(`reg-mecanico-options-${formId}`);
    if (mecSearch) {
        mecSearch.oninput = () => { app.filterMecanicoOptions(formId); if (mecOptions) { mecOptions.classList.remove('hidden'); mecOptions.style.display = 'block'; } };
        mecSearch.addEventListener('focus', () => { if (mecOptions) { mecOptions.classList.remove('hidden'); mecOptions.style.display = 'block'; } });
        // Manejo de teclado: flechas para navegar, Enter para seleccionar, Escape para cerrar
        mecSearch.addEventListener('keydown', (e) => {
            if (!mecOptions) return;
            const items = Array.from(mecOptions.querySelectorAll('.mecanico-option')).filter(i => !i.classList.contains('hidden'));
            if (!items.length) return;
            const activeIdx = items.findIndex(i => i.classList.contains('active-option'));
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = (activeIdx < 0) ? 0 : Math.min(items.length - 1, activeIdx + 1);
                items.forEach(i => i.classList.remove('active-option'));
                items[next].classList.add('active-option');
                try { items[next].focus(); } catch (e) {}
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = (activeIdx <= 0) ? 0 : Math.max(0, activeIdx - 1);
                items.forEach(i => i.classList.remove('active-option'));
                items[prev].classList.add('active-option');
                try { items[prev].focus(); } catch (e) {}
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // si hay opción activa, clickarla; sino usar addMecanicoToSelection fallback
                const active = mecOptions.querySelector('.active-option');
                if (active) active.click(); else app.addMecanicoToSelection(formId);
            } else if (e.key === 'Escape') {
                mecOptions.classList.add('hidden'); mecOptions.style.display = 'none';
                try { mecSearch.blur(); } catch(e){}
            }
        });
    }

    // Asegurar que las listas iniciales estén ocultas hasta usar
    if (prodOptions) prodOptions.classList.add('hidden');
    if (mecOptions) mecOptions.classList.add('hidden');
    // Inicializar autocomplete para gastos (datalist conectado al catálogo)
    try { app.initGastoAutocompleteForForm(formId); } catch (e) { /* no crítico */ }
};
// Funciones llamadas desde HTML
// Nota: se usa la vista previa inline (`#receipt-preview`) en lugar de un modal flotante.
app.handleModeloChange = function(formId) {
    console.log('handleModeloChange llamado para formulario:', formId);
    // Mostrar/ocultar campo "Otro modelo"
    const otroContainer = document.getElementById(`modelo-otro-container-${formId}`);
    const modeloSelect = document.getElementById(`reg-modelo-${formId}`);
    if (!otroContainer || !modeloSelect) return;
    if (modeloSelect.value === 'Otro') {
        otroContainer.classList.remove('hidden');
        try { otroContainer.style.display = ''; } catch(e) {}
    } else {
        otroContainer.classList.add('hidden');
        try { otroContainer.style.display = 'none'; } catch(e) {}
        try { const mo = document.getElementById(`reg-modelo-otro-${formId}`); if (mo) mo.value = ''; } catch(e) {}
    }
};

// Manejar la casilla "Sin vehículo": ocultar/limpiar placa y modelo
app.handleSinVehiculoChange = function(formId) {
    const checkbox = document.getElementById(`reg-sin-vehiculo-${formId}`);
    const placaEl = document.getElementById(`reg-placa-${formId}`);
    const modeloSelect = document.getElementById(`reg-modelo-${formId}`);
    const modeloOtroContainer = document.getElementById(`modelo-otro-container-${formId}`);
    if (!checkbox) return;
    const checked = !!checkbox.checked;
    // Ocultar o mostrar placa y modelo contenedores si existen
    if (placaEl && placaEl.parentElement) { if (checked) placaEl.parentElement.classList.add('hidden'); else placaEl.parentElement.classList.remove('hidden'); }
    if (modeloSelect && modeloSelect.parentElement) { if (checked) modeloSelect.parentElement.classList.add('hidden'); else modeloSelect.parentElement.classList.remove('hidden'); }
    if (modeloOtroContainer) {
        const shouldHide = checked || !modeloOtherDisplayFallback(formId);
        if (shouldHide) modeloOtroContainer.classList.add('hidden'); else modeloOtroContainer.classList.remove('hidden');
    }

    // Si está marcado, limpiar valores relevantes y ocultar mecánicos
    if (checked) {
        if (placaEl) placaEl.value = '';
        if (modeloSelect) modeloSelect.value = '';
        if (modeloOtroContainer) {
            const inp = document.getElementById(`reg-modelo-otro-${formId}`);
            if (inp) inp.value = '';
        }
        // ocultar mecánicos asignados y opciones cuando no hay vehículo
        const rowMecanicos = document.getElementById(`row-mecanicos-${formId}`);
        const rowMecanicosAsignados = document.getElementById(`row-mecanicos-asignados-${formId}`);
    if (rowMecanicos) rowMecanicos.classList.add('hidden');
    if (rowMecanicosAsignados) rowMecanicosAsignados.classList.add('hidden');
    }
};

function modeloOtherDisplayFallback(formId) {
    try {
        const sel = document.getElementById(`reg-modelo-${formId}`);
        return (sel && sel.value === 'Otro') ? 'block' : 'none';
    } catch (e) {
        return 'none';
    }
}

app.addMecanicoToSelection = function(formId) {
    // Ahora la selección se hace desde el campo de búsqueda. Si existe el select antiguo, lo usamos como fallback.
    const select = document.getElementById(`reg-mecanico-${formId}`);
    const container = document.getElementById(`mecanicos-seleccionados-${formId}`);
    if (!container) return;
    let mecanicosToAdd = [];
    if (select) {
        mecanicosToAdd = Array.from(select.selectedOptions).map(o => o.value).filter(Boolean);
    } else {
        // Buscar en el listado de opciones visibles dentro de reg-mecanico-options-{formId}
        const optionsDiv = document.getElementById(`reg-mecanico-options-${formId}`);
        if (!optionsDiv) {
            app.showNotification('No hay opciones de mecánicos disponibles', 'error', `register-notification`);
            return;
        }
        // Tomar las opciones activas/visibles marcadas con .active-option o el primer visible
        const active = optionsDiv.querySelector('.active-option');
        if (active) mecanicosToAdd.push(active.getAttribute('data-mecanico-id'));
        else {
            const firstVisible = Array.from(optionsDiv.querySelectorAll('.mecanico-option')).find(b => !b.classList.contains('hidden'));
            if (firstVisible) mecanicosToAdd.push(firstVisible.getAttribute('data-mecanico-id'));
        }
    }

    if (!mecanicosToAdd.length) {
        app.showNotification('Seleccione al menos un mecánico', 'error', `register-notification`);
        return;
    }
    if (container.querySelector('p')) container.innerHTML = '';
    mecanicosToAdd.forEach(mecanicoId => {
        // Evitar duplicados
        if (container.querySelector(`[data-mecanico-id="${mecanicoId}"]`)) return;
        const mecanico = (app.data && app.data.mecanicosData) ? app.data.mecanicosData.find(m => String(m.id) === String(mecanicoId)) : null;
        if (!mecanico) return;
        const tag = document.createElement('span');
        tag.className = 'mecanico-tag';
        tag.setAttribute('data-mecanico-id', mecanicoId);
        const txt = document.createElement('span'); txt.textContent = mecanico.nombre;
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mecanico-remove'; btn.innerHTML = "<i class='fas fa-times'></i>";
        btn.addEventListener('click', () => app.removeMecanicoTag(btn, formId));
        tag.appendChild(txt); tag.appendChild(btn);
        container.appendChild(tag);
    });
    // Limpiar input de búsqueda si existe
    const searchInput = document.getElementById(`reg-mecanico-search-${formId}`);
    if (searchInput) { searchInput.value = ''; app.filterMecanicoOptions(formId); }
}

// Añadir gasto (como producto) desde campos de gasto
app.addGastoToSelection = function(formId) {
    const nombre = document.getElementById(`reg-gasto-nombre-${formId}`);
    const unidades = document.getElementById(`reg-gasto-unidades-${formId}`);
    const precio = document.getElementById(`reg-gasto-precio-${formId}`);
    const productosList = document.getElementById(`productos-seleccionados-list-${formId}`);
    if (!nombre || !unidades || !precio || !productosList) return;
    const name = nombre.value.trim();
    const qty = parseInt(unidades.value) || 1;
    const pr = parseFloat(precio.value) || 0;
    if (!name) { app.showNotification('Ingrese nombre del gasto', 'error', 'register-notification'); return; }
    if (qty <= 0) { app.showNotification('Unidades debe ser >= 1', 'error', 'register-notification'); return; }
    if (pr < 0) { app.showNotification('Precio no puede ser negativo', 'error', 'register-notification'); return; }
    const id = `GASTO-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    // Si el nombre coincide con un producto del catálogo en categoría 'Gasto', usar su id y precio
    let catalogMatch = null;
    try {
        catalogMatch = (app.data && app.data.catalogData) ? app.data.catalogData.find(p => p.name && p.name.trim().toLowerCase() === name.toLowerCase() && (p.category === 'Gasto' || String(p.category).toLowerCase().includes('gasto'))) : null;
    } catch (e) { catalogMatch = null; }
    const effectiveId = catalogMatch ? catalogMatch.id : id;
    const effectivePrice = catalogMatch ? catalogMatch.price : pr;
    const item = document.createElement('div');
    item.className = 'producto-item';
    item.setAttribute('data-producto-id', effectiveId);
    item.setAttribute('data-name', name);
    item.setAttribute('data-quantity', qty);
    item.setAttribute('data-price', effectivePrice);
    item.innerHTML = `
        <div class="producto-display">${name} x${qty} S/ ${(pr * qty).toFixed(2)}</div>
        <div style="margin-top:6px;">
            Cant: <input type="number" class="producto-qty" value="${qty}" min="1" style="width:70px;margin-right:8px;"> 
            Precio: S/ <input type="number" class="producto-price" value="${effectivePrice.toFixed(2)}" min="0" step="0.01" style="width:100px;margin-right:8px;"> 
            <button class="btn btn-danger btn-icon" onclick="app.removeProductoItem(this, ${formId})"><i class='fas fa-times'></i></button>
        </div>
    `;
    productosList.appendChild(item);
    const qtyInput = item.querySelector('.producto-qty');
    const priceInput = item.querySelector('.producto-price');
    if (qtyInput) qtyInput.addEventListener('input', () => app.updateProductosTotal(formId));
    if (priceInput) priceInput.addEventListener('input', () => app.updateProductosTotal(formId));
    document.getElementById(`productos-seleccionados-container-${formId}`).classList.remove('hidden');
    app.updateProductosTotal(formId);
    // limpiar campos
    nombre.value = '';
    unidades.value = '1';
    precio.value = '0.00';
}

app.addProductToSelection = function(formId) {
    console.debug('addProductToSelection called for formId=', formId);
    // Obtener producto y cantidad
    const searchInput = document.getElementById(`reg-producto-search-${formId}`);
    const cantidadInput = document.getElementById(`reg-cantidad-${formId}`);
    const productosList = document.getElementById(`productos-seleccionados-list-${formId}`);
    if (!searchInput || !cantidadInput || !productosList) return;
    const nombre = searchInput.value.trim();
    const cantidad = parseInt(cantidadInput.value);
    if (!nombre || isNaN(cantidad) || cantidad < 1) {
        app.showNotification('Ingrese nombre y cantidad válida', 'error', 'register-notification');
        return;
    }
    // Buscar producto en catálogo
    const producto = app.data.catalogData.find(p => p.name.toLowerCase() === nombre.toLowerCase());
    if (!producto) {
        app.showNotification('Producto no encontrado en catálogo', 'error', 'register-notification');
        return;
    }
    // Evitar duplicados
    if (productosList.querySelector(`[data-producto-id="${producto.id}"]`)) {
        app.showNotification('El producto ya está seleccionado', 'warning', 'register-notification');
        return;
    }
    // Crear item visual con inputs editables
    const item = document.createElement('div');
    item.className = 'producto-item';
    item.setAttribute('data-producto-id', producto.id);
    item.setAttribute('data-name', producto.name);
    item.setAttribute('data-quantity', cantidad);
    item.setAttribute('data-price', producto.price);
    item.innerHTML = `
        <div class="producto-display">${producto.name} x${cantidad} S/ ${(producto.price * cantidad).toFixed(2)}</div>
        <div style="margin-top:6px;">
            Cant: <input type="number" class="producto-qty" value="${cantidad}" min="1" style="width:70px;margin-right:8px;"> 
            Precio: S/ <input type="number" class="producto-price" value="${producto.price.toFixed(2)}" min="0" step="0.01" style="width:100px;margin-right:8px;"> 
            <button class="btn btn-danger btn-icon" onclick="app.removeProductoItem(this, ${formId})"><i class='fas fa-times'></i></button>
        </div>
    `;
    productosList.appendChild(item);
    // Escuchar cambios en qty/price para recalcular
    const qtyInput = item.querySelector('.producto-qty');
    const priceInput = item.querySelector('.producto-price');
    if (qtyInput) qtyInput.addEventListener('input', () => app.updateProductosTotal(formId));
    if (priceInput) priceInput.addEventListener('input', () => app.updateProductosTotal(formId));
    document.getElementById(`productos-seleccionados-container-${formId}`).classList.remove('hidden');
    app.updateProductosTotal(formId);
    // limpiar input de búsqueda y ocultar opciones
    try {
        const searchInputEl = document.getElementById(`reg-producto-search-${formId}`);
        const opts = document.getElementById(`reg-producto-options-${formId}`);
        if (searchInputEl) { searchInputEl.value = ''; searchInputEl.blur(); }
        if (opts) { opts.classList.add('hidden'); opts.style.display = 'none'; }
    } catch (e) { console.warn('post addProductToSelection cleanup failed', e); }
}

app.filterProductOptions = function(formId) {
    // Filtrar productos por texto
    const searchInput = document.getElementById(`reg-producto-search-${formId}`);
    const optionsDiv = document.getElementById(`reg-producto-options-${formId}`);
    if (!searchInput || !optionsDiv) return;
    const term = searchInput.value.trim().toLowerCase();
    let productos = app.data.catalogData;
    if (term) {
        productos = productos.filter(p => p.name.toLowerCase().includes(term));
    }
    optionsDiv.innerHTML = '';
    // Mejor fuzzy: usar distancia de Levenshtein (menor = mejor)
    function levenshtein(a,b) {
        a = a.toLowerCase(); b = b.toLowerCase();
        const al = a.length, bl = b.length;
        if (!al) return bl; if (!bl) return al;
        const dp = Array(al+1).fill(null).map(()=>Array(bl+1).fill(0));
        for (let i=0;i<=al;i++) dp[i][0]=i;
        for (let j=0;j<=bl;j++) dp[0][j]=j;
        for (let i=1;i<=al;i++) for (let j=1;j<=bl;j++) {
            const cost = a[i-1]===b[j-1]?0:1;
            dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
        }
        return dp[al][bl];
    }

    const scored = productos.map(p => ({ p, score: levenshtein(p.name, term || '') })).sort((a,b) => a.score - b.score).slice(0, 50);

    // Control de índice activo para navegación
    let activeIndex = -1;
    scored.forEach((s, idx) => {
        const p = s.p;
        const opt = document.createElement('div');
        opt.className = 'searchable-option';
        opt.tabIndex = 0;
        // Resaltar coincidencia
        let displayName = p.name;
        if (term) {
            const idx = p.name.toLowerCase().indexOf(term);
            if (idx !== -1) {
                displayName = `${p.name.slice(0, idx)}<mark>${p.name.slice(idx, idx + term.length)}</mark>${p.name.slice(idx + term.length)}`;
            }
        }
        opt.innerHTML = `${displayName} <span style="float:right;opacity:0.7;">S/ ${p.price.toFixed(2)}</span>`;
        // usar closure para enlazar correctamente al formId y producto
        opt.addEventListener('click', () => {
            searchInput.value = p.name;
            // rellenar precio si existe campo
            const precioInput = document.getElementById(`reg-precio-${formId}`);
            if (precioInput) precioInput.value = p.price.toFixed(2);
            optionsDiv.classList.add('hidden'); optionsDiv.style.display = 'none';
            try { searchInput.blur(); } catch(e) {}
        });
        opt.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') opt.click(); });
        opt.addEventListener('focus', () => {
            activeIndex = idx;
            optionsDiv.querySelectorAll('.searchable-option').forEach((o,i)=> o.classList.toggle('active-option', i===idx));
        });
        optionsDiv.appendChild(opt);
    });
    if (scored.length) { optionsDiv.classList.remove('hidden'); optionsDiv.style.display = 'block'; } else { optionsDiv.classList.add('hidden'); optionsDiv.style.display = 'none'; }

    // Manejo de teclado específico para este optionsDiv
    const inputEl = document.getElementById(`reg-producto-search-${formId}`);
    const onKey = (e) => {
        const items = Array.from(optionsDiv.querySelectorAll('.searchable-option'));
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault(); activeIndex = Math.min(items.length-1, activeIndex+1); items[activeIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); activeIndex = Math.max(0, activeIndex-1); items[activeIndex].focus();
        } else if (e.key === 'Escape') {
            optionsDiv.classList.add('hidden');
            inputEl.blur();
        }
    };
    
// Asegurar binding seguro del botón Guardar Registro
app.bindSaveButton = function(formId) {
    try {
        const form = document.getElementById(`register-form-${formId}`);
        if (!form) return;
        let saveBtn = document.getElementById(`save-register-${formId}`) || form.querySelector(`[data-role='save-register']`) || form.querySelector('.btn-success');
        if (!saveBtn) return;
        try { saveBtn.removeAttribute && saveBtn.removeAttribute('onclick'); } catch(e){}
        try { const clone = saveBtn.cloneNode(true); saveBtn.parentNode.replaceChild(clone, saveBtn); saveBtn = clone; } catch(e) {}
        try {
            saveBtn.addEventListener('click', (ev) => {
                try { ev && ev.preventDefault(); } catch(e){}
                if (saveBtn.disabled) return;
                saveBtn.disabled = true;
                try {
                    const res = app.addRegister(formId);
                    // Si addRegister es sincrona, será tratado; si devuelve Promise, manejamos
                    if (res && typeof res.then === 'function') {
                        res.finally(() => { try { saveBtn.disabled = false; } catch(e){} });
                    } else {
                        setTimeout(() => { try { saveBtn.disabled = false; } catch(e){} }, 200);
                    }
                } catch (e) {
                    console.error('Error executing addRegister from bindSaveButton', e);
                    saveBtn.disabled = false;
                }
            });
        } catch (e) { try { saveBtn.onclick = () => app.addRegister(formId); } catch(e2){} }
        try { saveBtn.id = `save-register-${formId}`; saveBtn.setAttribute('data-role', 'save-register'); } catch(e){}
    } catch (e) { console.warn('bindSaveButton failed', e); }
};
    // Asignar handler de teclado (no acumular listeners repetidos)
    inputEl.onkeydown = onKey;
}

app.calcularTotalPagos = function(formId) {
    // Calcular el total de los métodos de pago
    const metodosPago = app.obtenerMetodosPago(formId);
    const total = metodosPago.reduce((sum, m) => sum + m.monto, 0);
    document.getElementById(`pago-total-${formId}`).textContent = `Total: S/ ${total.toFixed(2)}`;
};

app.removePaymentMethod = function(button, formId) {
    // Eliminar método de pago visualmente
    const methodDiv = button.closest('.payment-method');
    if (methodDiv) methodDiv.remove();
    app.calcularTotalPagos(formId);
};

app.addPaymentMethod = function(formId) {
    // Agregar nuevo método de pago visual
    const container = document.getElementById(`metodos-pago-${formId}`);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'payment-method';
    div.innerHTML = `<select class="pago-metodo">
        <option value="Efectivo">Efectivo</option>
        <option value="Tarjeta">Tarjeta</option>
        <option value="Yape">Yape</option>
        <option value="Otros">Otros</option>
    </select>
    <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" oninput="app.calcularTotalPagos(${formId})">
    <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, ${formId})"><i class="fas fa-times"></i></button>`;
    container.appendChild(div);
};

app.generateReceiptPreview = function(formId) {
    // Generar vista previa de recibo en el contenedor inline
    const registroData = app.obtenerDatosFormulario(formId);
    const previewCard = document.getElementById('receipt-preview-container');
    const preview = document.getElementById('receipt-preview');
    if (!previewCard || !preview) return;
    const fechaDisplay = (app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registroData.fecha) : registroData.fecha;
    let html = `<div class='receipt-header' style="text-align:center;margin-bottom:8px;"><strong style="font-size:1.1em;">Nota de Venta</strong><div style="font-size:0.9em;margin-top:4px;">${fechaDisplay}</div></div>`;
    html += `<div><strong>Cliente:</strong> ${registroData.cliente || '-'}<br><strong>Placa:</strong> ${registroData.placa || '-'}<br><strong>Modelo:</strong> ${registroData.modelo || '-'}</div>`;
    html += `<hr><div><strong>Productos/Servicios:</strong><br>`;
    if (Array.isArray(registroData.productos) && registroData.productos.length) {
        registroData.productos.forEach(p => {
            html += `<div class='receipt-item'>${p.name} x${p.quantity} <span>S/ ${(p.price * p.quantity).toFixed(2)}</span></div>`;
        });
    } else {
        html += `<div class='empty'>No hay productos/servicios</div>`;
    }
    html += `</div><div class='receipt-total'>Total: S/ ${Number(registroData.total || 0).toFixed(2)}</div>`;
    if (registroData.descripcion) {
        html += `<div style="margin-top:8px;"><strong>Descripción:</strong><br>${registroData.descripcion}</div>`;
    }
    html += `<div><strong>Métodos de Pago:</strong><br>`;
    if (Array.isArray(registroData.metodosPago) && registroData.metodosPago.length) {
        registroData.metodosPago.forEach(m => {
            html += `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}<br>`;
        });
    } else {
        html += `<div class='empty'>No hay métodos de pago</div>`;
    }
    html += `</div>`;
    // No incluir controles de cierre o copiar en el voucher imprimible. Solo mostrar nota de venta limpia.
    preview.innerHTML = html;
    // Marcar como imprimible para aplicar estilos @media print
    previewCard.classList.add('receipt-printable');
    previewCard.classList.remove('hidden');
}

app.applyCustomDateFilter = function() {
    // Filtrar por rango de fechas personalizado
    const desdeInput = document.getElementById('filter-fecha-desde');
    const hastaInput = document.getElementById('filter-fecha-hasta');
    if (!desdeInput || !hastaInput) return;
    const desde = new Date(desdeInput.value);
    const hasta = new Date(hastaInput.value);
    let registros = app.data.registerData.filter(r => {
        const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(r.fecha) : r.fecha;
        const fecha = new Date(iso);
        return fecha >= desde && fecha <= hasta;
    });
    app.updateRegisterTableFiltered(registros);
};

// Utilidades para rangos de fecha y atajos
app.registroDateHelpers = {
    todayRange: function(now=new Date()) {
        const inicio = new Date(now); inicio.setHours(0,0,0,0);
        const fin = new Date(now); fin.setHours(23,59,59,999);
        return { desde: inicio, hasta: fin };
    },
    weekRange: function(now=new Date()) {
        const inicio = new Date(now); inicio.setHours(0,0,0,0);
        const dia = inicio.getDay();
        const diffToMonday = (dia === 0) ? -6 : (1 - dia);
        inicio.setDate(inicio.getDate() + diffToMonday);
        const fin = new Date(inicio); fin.setDate(inicio.getDate() + 6); fin.setHours(23,59,59,999);
        return { desde: inicio, hasta: fin };
    },
    monthRange: function(now=new Date()) {
        const inicio = new Date(now.getFullYear(), now.getMonth(), 1); inicio.setHours(0,0,0,0);
        const fin = new Date(now.getFullYear(), now.getMonth()+1, 0); fin.setHours(23,59,59,999);
        return { desde: inicio, hasta: fin };
    },
    toInputDateString: function(d) { if (!d) return ''; const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${yyyy}-${mm}-${dd}`; }
};

// Wire up quick buttons when Registro tab initializes (safe to call multiple times)
app.setupRegistroQuickDateButtons = function() {
    try {
        const todayBtn = document.getElementById('quick-today-btn');
        const weekBtn = document.getElementById('quick-week-btn');
        const monthBtn = document.getElementById('quick-month-btn');
        const desdeInput = document.getElementById('filter-fecha-desde');
        const hastaInput = document.getElementById('filter-fecha-hasta');
        if (todayBtn && desdeInput && hastaInput) todayBtn.onclick = () => {
            const r = app.registroDateHelpers.todayRange(); desdeInput.value = app.registroDateHelpers.toInputDateString(r.desde); hastaInput.value = app.registroDateHelpers.toInputDateString(r.hasta); app.applyCustomDateFilter();
        };
        if (weekBtn && desdeInput && hastaInput) weekBtn.onclick = () => {
            const r = app.registroDateHelpers.weekRange(); desdeInput.value = app.registroDateHelpers.toInputDateString(r.desde); hastaInput.value = app.registroDateHelpers.toInputDateString(r.hasta); app.applyCustomDateFilter();
        };
        if (monthBtn && desdeInput && hastaInput) monthBtn.onclick = () => {
            const r = app.registroDateHelpers.monthRange(); desdeInput.value = app.registroDateHelpers.toInputDateString(r.desde); hastaInput.value = app.registroDateHelpers.toInputDateString(r.hasta); app.applyCustomDateFilter();
        };
    } catch (e) { console.warn('setupRegistroQuickDateButtons failed', e); }
};

// Scroll helpers: encontrar contenedor vertical y reenviar wheel events
app.findVerticalScrollParent = function(el) {
    let p = el && el.parentElement;
    while (p) {
        try {
            const overflowY = window.getComputedStyle ? window.getComputedStyle(p).overflowY : (p.style && p.style.overflowY);
            if ((overflowY === 'auto' || overflowY === 'scroll') && p.scrollHeight > p.clientHeight) return p;
        } catch(e) {}
        p = p.parentElement;
    }
    return window.document.scrollingElement || document.body || document.documentElement;
};

app.makeFormContainerScrollFriendly = function() {
    try {
        const container = document.getElementById('register-form-container');
        if (!container) return;
        // Cuando el cursor esté sobre el contenedor horizontal, si hay rueda vertical, reenviarla al padre vertical
        (function() {
            const minDelta = 6; // px mínimo para considerar intención vertical
            const maxJump = 120; // limitar salto por evento para evitar grandes 'teleport'
            let rafId = null;
            let pendingScroll = 0;
            const flush = function(target) {
                if (!target) return;
                target.scrollTop += pendingScroll;
                pendingScroll = 0;
                rafId = null;
            };
            container.addEventListener('wheel', function(ev) {
                try {
                    // Si la rueda ocurrió sobre un dropdown/selector (p.ej. lista de opciones),
                    // no interferir con la interacción (evitar preventDefault allí).
                    try {
                        const tgt = ev.target || ev.srcElement;
                        if (tgt && typeof tgt.closest === 'function' && tgt.closest('.searchable-options, .mecanico-option, .searchable-option')) {
                            return; // dejar que el componente interno gestione la interacción
                        }
                    } catch(e) { /* ignore */ }
                    const dx = ev.deltaX || 0;
                    const dy = ev.deltaY || 0;
                    const absX = Math.abs(dx);
                    const absY = Math.abs(dy);
                    if (absY > absX && absY > minDelta) {
                        const verticalParent = app.findVerticalScrollParent(container);
                        if (verticalParent && verticalParent !== container) {
                            ev.preventDefault();
                            // limitar el salto
                            const add = Math.max(-maxJump, Math.min(maxJump, dy));
                            pendingScroll += add;
                            if (!rafId) rafId = requestAnimationFrame(() => flush(verticalParent));
                        }
                    }
                } catch(e) { /* no bloquear UX por errores */ }
            }, { passive: false });
        })();

        // Hacer que el scroll horizontal sea suave cuando se usa shift+wheel (que es común)
        container.addEventListener('wheel', function(ev) {
            try {
                // Si está sobre un panel de opciones, no procesar aquí
                try {
                    const tgt = ev.target || ev.srcElement;
                    if (tgt && typeof tgt.closest === 'function' && tgt.closest('.searchable-options, .mecanico-option, .searchable-option')) {
                        return;
                    }
                } catch(e) {}
                if (ev.shiftKey) {
                    // horizontal scroll
                    container.scrollLeft += ev.deltaY;
                    ev.preventDefault();
                }
            } catch(e) {}
        }, { passive: false });
    } catch(e) { console.warn('makeFormContainerScrollFriendly top-level error', e); }
};

// Vista previa del recibo a partir de un registro existente
app.previewReceiptFromRegistro = function(registroId) {
    const registro = this.data.registerData.find(r => r.id === registroId);
    if (!registro) {
        this.showNotification('Registro no encontrado', 'error', 'register-notification');
        return;
    }
    const previewCard = document.getElementById('receipt-preview-container');
    const preview = document.getElementById('receipt-preview');
    if (!previewCard || !preview) return;
    let html = `<div class='receipt-header' style="text-align:center;margin-bottom:8px;"><strong style="font-size:1.1em;">Nota de Venta</strong><div style="font-size:0.9em;margin-top:4px;">${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registro.fecha) : registro.fecha}</div></div>`;
    html += `<div><strong>Cliente:</strong> ${registro.cliente || '-'}<br><strong>Placa:</strong> ${registro.placa || '-'}<br><strong>Modelo:</strong> ${registro.modelo || '-'}</div>`;
    html += `<hr><div><strong>Productos/Servicios:</strong><br>`;
    if (Array.isArray(registro.productos) && registro.productos.length) {
        registro.productos.forEach(p => {
            html += `<div class='receipt-item'>${p.name} x${p.quantity} <span>S/ ${(p.price * p.quantity).toFixed(2)}</span></div>`;
        });
    } else {
        html += `<div class='empty'>No hay productos/servicios</div>`;
    }
    html += `</div><div class='receipt-total'>Total: S/ ${Number(registro.total||0).toFixed(2)}</div>`;
    html += `<div><strong>Métodos de Pago:</strong><br>`;
    if (Array.isArray(registro.metodosPago) && registro.metodosPago.length) {
        registro.metodosPago.forEach(m => {
            html += `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}<br>`;
        });
    } else {
        html += `<div class='empty'>No hay métodos de pago</div>`;
    }
    html += `</div>`;
    // No agregar controles adicionales: el voucher es una Nota de Venta minimalista para impresión
    preview.innerHTML = html;
    previewCard.classList.add('receipt-printable');
    previewCard.classList.remove('hidden');
};

// Ocultar la vista previa (función expuesta para botones si hace falta)
app.clearReceiptPreview = function() {
    const previewCard = document.getElementById('receipt-preview-container');
    const preview = document.getElementById('receipt-preview');
    if (preview) preview.innerHTML = '';
    if (previewCard) {
        previewCard.classList.add('hidden');
        previewCard.classList.remove('receipt-printable');
    }
};

app.filterRegisterTable = function() {
    // Filtrar registros por Tipo, Texto y Rango de fecha
    const tipoFilterEl = document.getElementById('filter-tipo');
    const searchInput = document.getElementById('search-register');
    let registros = Array.isArray(app.data.registerData) ? app.data.registerData.slice() : [];

    // Filtrar por Tipo si existe selector
    try {
        const tipoVal = tipoFilterEl ? tipoFilterEl.value : 'all';
        if (tipoVal && tipoVal !== 'all') {
            registros = registros.filter(r => String(r.tipo).toUpperCase() === String(tipoVal).toUpperCase());
        }
    } catch (e) { console.warn('filterRegisterTable - tipo filter failed', e); }

    // Filtrar por texto
    if (searchInput && searchInput.value.trim()) {
        const term = searchInput.value.trim().toLowerCase();
        registros = registros.filter(r =>
            (r.id && r.id.toLowerCase().includes(term)) ||
            (r.placa && r.placa.toLowerCase().includes(term)) ||
            (r.cliente && r.cliente.toLowerCase().includes(term)) ||
            (Array.isArray(r.productos) && r.productos.some(p => p.name && p.name.toLowerCase().includes(term)))
        );
    }

    // Aplicar filtro de fecha global si está activo (delegar a filtrarRegistrosPorFecha)
    try {
        registros = this.filtrarRegistrosPorFecha(registros);
    } catch (e) { /* no crítico */ }

    app.updateRegisterTableFiltered(registros);
};

app.clearSearch = function() {
    // Limpiar búsqueda y mostrar todos los registros
    const searchInput = document.getElementById('search-register');
    if (searchInput) searchInput.value = '';
    app.updateRegisterTable();
}
 // Actualizar tabla de registros con lista filtrada
app.updateRegisterTableFiltered = function(registros) {
    const tbody = document.querySelector('#register-table tbody');
    if (!tbody) return 0;

    // Preservar scroll
    const container = tbody.parentElement || tbody;
    let prevScroll = 0; try { prevScroll = container.scrollTop || 0; } catch (e) { prevScroll = 0; }

    // Ordenar por createdAt o fecha desc
    const ordenados = (registros||[]).slice().sort((a,b) => {
        const ta = a && a.createdAt ? new Date(a.createdAt).getTime() : (a && a.fecha ? new Date(a.fecha).getTime() : 0);
        const tb = b && b.createdAt ? new Date(b.createdAt).getTime() : (b && b.fecha ? new Date(b.fecha).getTime() : 0);
        return tb - ta;
    });

    const frag = document.createDocumentFragment();
    ordenados.forEach(registro => {
        const tr = document.createElement('tr');
        const productosTexto = (registro.productos||[]).map(p => `${p.name} x${p.quantity}`).join(', ');
        const nombresMecanicos = app.obtenerNombresMecanicos(registro.mecanicos || []);
        tr.innerHTML = `
            <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registro.fecha) : registro.fecha || ''}</td>
            <td>${registro.tipo || '-'}</td>
            <td>${registro.id || ''}</td>
            <td>${registro.placa || ''}</td>
            <td>${registro.modelo || ''}</td>
            <td>${registro.cliente || ''}</td>
            <td>${productosTexto}</td>
            <td>${nombresMecanicos.join(', ')}</td>
            <td>${(registro.productos||[]).reduce((sum, p) => sum + (p.quantity||0), 0)}</td>
            <td>${(typeof registro.total !== 'undefined') ? `S/ ${Number(registro.total).toFixed(2)}` : '-'}</td>
            <td>${(registro.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
            <td>
                <button class="btn btn-icon" onclick="app.editarRegistro('${registro.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${registro.id}')"><i class="fas fa-receipt"></i></button>
                <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${registro.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        frag.appendChild(tr);
    });

    try { if (typeof tbody.replaceChildren === 'function') tbody.replaceChildren(frag); else { tbody.innerHTML=''; tbody.appendChild(frag); } } catch(e) { tbody.innerHTML = ''; tbody.appendChild(frag); }
    try { container.scrollTop = prevScroll; } catch(e){}
    return ordenados.length;
}
app.printReceipt = function() {
    // Imprimir contenido actual del preview inline
    const preview = document.getElementById('receipt-preview');
    if (!preview) return;
    const win = window.open('', 'Recibo', 'width=400,height=600');
    win.document.write(`<html><head><title>Recibo</title><link rel='stylesheet' href='css/styles.css'></head><body>${preview.innerHTML}</body></html>`);
    win.document.close();
    win.print();
};

app.clearReceiptPreview = function() {
    const preview = document.getElementById('receipt-preview');
    const previewCard = document.getElementById('receipt-preview-container');
    if (preview) preview.innerHTML = '';
    if (previewCard) previewCard.classList.add('hidden');
};

// Funciones internas que faltan
app.obtenerMetodosPago = function(formId) {
    const metodosPago = [];
    const container = document.getElementById(`metodos-pago-${formId}`);
    if (!container) return metodosPago;

    container.querySelectorAll('.payment-method').forEach(methodElem => {
        try {
            const metodoSelect = methodElem.querySelector('.pago-metodo');
            const montoInput = methodElem.querySelector('.pago-monto');
            const metodo = (metodoSelect && metodoSelect.value) ? metodoSelect.value : 'Efectivo';
            const montoVal = montoInput ? (montoInput.value || montoInput.getAttribute('value') || '0') : '0';
            const monto = parseFloat(montoVal) || 0;
            metodosPago.push({ metodo, monto });
        } catch (e) {
            console.warn('Error reading payment method element', e);
        }
    });

    return metodosPago;
};

// Obtener IDs de mecánicos seleccionados
app.obtenerMecanicosSeleccionados = function(formId) {
    const container = document.getElementById(`mecanicos-seleccionados-${formId}`);
    const mecanicosIds = [];
    
    if (container) {
        container.querySelectorAll('.mecanico-tag').forEach(tag => {
            const mecanicoId = tag.getAttribute('data-mecanico-id');
            if (mecanicoId) {
                mecanicosIds.push(mecanicoId);
            }
        });
    }
    
    return mecanicosIds;
};

// Placeholder para utils hasta que cargues el módulo
if (!app.registroUtils) {
    app.registroUtils = {
        calcularTotalProductos: function(productos) {
            console.log('calculando total productos...');
            return productos.reduce((total, producto) => total + (producto.price * producto.quantity), 0);
        },
        generarIdUnico: function(fecha, placa, registros) {
            return 'TEMP_ID_' + Date.now();
        },
        formatearFechaDisplay: function(fecha) {
            return fecha;
        },
        limpiarFormulario: function(formId) {
            // Limpiar todos los campos del formulario de registro
            const form = document.getElementById(`register-form-${formId}`);
            if (!form) return;
            // Limpiar inputs de texto, número y fecha
            form.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
            // Restaurar selects a su valor por defecto
            form.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
                select.dispatchEvent(new Event('change'));
            });
            // Limpiar productos seleccionados
            const prodList = document.getElementById(`productos-seleccionados-list-${formId}`);
            if (prodList) prodList.innerHTML = '';
            const prodTotal = document.getElementById(`productos-total-${formId}`);
            if (prodTotal) prodTotal.textContent = 'Total: S/ 0.00';
            // Limpiar mecánicos seleccionados
            const mecSel = document.getElementById(`mecanicos-seleccionados-${formId}`);
            if (mecSel) mecSel.innerHTML = '<p>No hay mecánicos asignados</p>';
            // Limpiar métodos de pago
            const pagoContainer = document.getElementById(`metodos-pago-${formId}`);
            if (pagoContainer) {
                pagoContainer.innerHTML = `<div class="payment-method">
                    <select class="pago-metodo">
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Yape">Yape</option>
                        <option value="Otros">Otros</option>
                    </select>
                    <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" oninput="app.calcularTotalPagos(${formId})">
                    <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, ${formId})"><i class='fas fa-times'></i></button>
                </div>`;
                const pagoTotal = document.getElementById(`pago-total-${formId}`);
                if (pagoTotal) pagoTotal.textContent = 'Total: S/ 0.00';
            }
            // Ocultar campos de modelo otro y gasto
            const modeloOtro = document.getElementById(`modelo-otro-container-${formId}`);
            if (modeloOtro) modeloOtro.classList.add('hidden');
            const gastoRow = document.getElementById(`gasto-row-${formId}`);
            if (gastoRow) gastoRow.classList.add('hidden');
            // Quitar modo edición si está activo
            form.classList.remove('editing');
            const banner = form.querySelector('.edit-banner'); if (banner) banner.remove();
            const cancel = form.querySelector('.btn-cancel-edit'); if (cancel) cancel.remove();
            // Restaurar botón guardar
            const saveBtn = form.querySelector('.btn-success');
            if (saveBtn) {
                saveBtn.textContent = 'Guardar Registro';
                saveBtn.onclick = () => app.addRegister(formId);
            }
        }
    };
}

// Placeholder para validations hasta que cargues el módulo
if (!app.registroValidations) {
    app.registroValidations = {
        validarRegistroCompleto: function(registroData) {
            // Validación flexible
            if (!registroData.tipo) return { valido: false, mensaje: 'Seleccione tipo de registro' };
            if (registroData.tipo === 'VENTA') {
                // Cliente NO obligatorio
                // Placa opcional
                if (!registroData.productos || registroData.productos.length === 0) return { valido: false, mensaje: 'Agregue al menos un producto/servicio' };
                if (!registroData.metodosPago || registroData.metodosPago.length === 0) return { valido: false, mensaje: 'Agregue al menos un método de pago' };
            } else if (registroData.tipo === 'GASTO') {
                if (!registroData.descripcion) return { valido: false, mensaje: 'Ingrese la descripción del gasto' };
                if (!registroData.productos || registroData.productos.length === 0) return { valido: false, mensaje: 'Agregue al menos un producto/servicio relacionado al gasto' };
                if (!registroData.metodosPago || registroData.metodosPago.length === 0) return { valido: false, mensaje: 'Agregue al menos un método de pago' };
            }
            return { valido: true, mensaje: 'Validación exitosa' };
        }
    };
}

// Configurar event listeners específicos de registro
app.setupRegistroEventListeners = function() {
    // Botón para agregar otro registro
    const addRegisterBtn = document.getElementById('add-register-btn');
    if (addRegisterBtn) {
        addRegisterBtn.addEventListener('click', () => {
            this.addRegisterForm();
        });
    }
    
    // Configurar filtros de fecha
    document.querySelectorAll('.date-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            document.querySelectorAll('.date-filter').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            this.data.currentDateFilter = e.target.getAttribute('data-filter');

            const customEl = document.getElementById('custom-date-filter');
            if (this.data.currentDateFilter === 'custom') {
                        if (customEl) customEl.classList.remove('hidden');
                    } else {
                        if (customEl) customEl.classList.add('hidden');
                        this.updateRegisterTable();
                    }
        });
    });

    // Manejo teclado para selectores de producto (delegado)
    document.addEventListener('keydown', (e) => {
        // Encontrar cualquier opciones visibles
        const visibleOptions = document.querySelectorAll('.searchable-options');
        visibleOptions.forEach(optionsDiv => {
            if (!optionsDiv.classList.contains('hidden')) {
                // incluir tanto .searchable-option como .mecanico-option para navegación por teclado
                const items = Array.from(optionsDiv.querySelectorAll('.searchable-option, .mecanico-option'));
                if (!items.length) return;
                const focused = document.activeElement;
                let idx = items.indexOf(focused);
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    idx = Math.min(items.length - 1, idx + 1);
                    items[idx].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    idx = Math.max(0, idx - 1);
                    items[idx].focus();
                }
            }
        });
    });

    // Delegación: manejar cambios de tipo para cualquier formulario dinámico
    document.addEventListener('change', (e) => {
        const el = e.target;
        if (!el) return;
        if (el.classList && el.classList.contains('reg-tipo')) {
            // extraer formId desde el id, que es reg-tipo-<id>
            const parts = el.id.split('-');
            const fid = parts[parts.length - 1];
            if (fid) app.handleTipoChange(fid);
        }
        if (el.classList && el.classList.contains('reg-modelo')) {
            const parts = el.id.split('-');
            const fid = parts[parts.length - 1];
            if (fid) app.handleModeloChange(fid);
        }
        if (el.classList && el.classList.contains('reg-sin-vehiculo')) {
            const parts = el.id.split('-');
            const fid = parts[parts.length - 1];
            if (fid) app.handleSinVehiculoChange(fid);
        }
    });

    // Conectar búsqueda/limpiar y botones sin usar atributos inline
    const searchInput = document.getElementById('search-register');
    const searchBtn = document.getElementById('search-register-btn');
    const clearBtn = document.getElementById('clear-search-btn');
    const applyCustomBtn = document.getElementById('apply-custom-date-filter-btn');
    if (searchInput) {
        searchInput.addEventListener('input', () => app.filterRegisterTable());
        searchInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') app.filterRegisterTable(); });
    }
    if (searchBtn) searchBtn.addEventListener('click', () => app.filterRegisterTable());
    if (clearBtn) clearBtn.addEventListener('click', () => app.clearSearch());
    if (applyCustomBtn) applyCustomBtn.addEventListener('click', () => app.applyCustomDateFilter());
    // Listener para filtro por Tipo (VENTA/GASTO)
    const tipoFilterEl = document.getElementById('filter-tipo');
    if (tipoFilterEl) tipoFilterEl.addEventListener('change', () => app.filterRegisterTable());

    // Delegación: Asegurar que cualquier botón 'Guardar Registro' invoque app.addRegister
    document.addEventListener('click', (ev) => {
        try {
            const btn = ev.target.closest && ev.target.closest("[data-role='save-register']");
            if (btn) {
                ev.preventDefault();
                // Extraer formId si está en el id o en el DOM padre
                let fid = null;
                if (btn.id && btn.id.startsWith('save-register-')) fid = btn.id.replace('save-register-','');
                if (!fid) {
                    const form = btn.closest && btn.closest('.register-form');
                    if (form) fid = form.getAttribute('data-form-id') || form.id && form.id.split('-').pop();
                }
                if (fid) app.addRegister(fid);
            }
        } catch (e) { /* no bloquear otros handlers */ }
    });

    // Cerrar preview con Escape
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            const previewCard = document.getElementById('receipt-preview-container');
            if (previewCard && !previewCard.classList.contains('hidden')) previewCard.classList.add('hidden');
        }
    });
};

// Función optimizada y pulida para agregar registro (VENTA/GASTO)
app.addRegister = function(formId) {
    try {
        // Obtener datos del formulario
        const registroData = this.obtenerDatosFormulario(formId);
        console.debug('[diag] addRegister called for formId=', formId);
        try { console.debug('[diag] registroData snapshot:', JSON.parse(JSON.stringify(registroData))); } catch(e) { console.debug('[diag] registroData (raw):', registroData); }
        // Validar registro
        const validacion = app.registroValidations.validarRegistroCompleto(registroData);
        console.debug('[diag] validation result:', validacion);
        if (!validacion.valido) {
            console.warn('[diag] addRegister - validation failed:', validacion.mensaje);
            this.showNotification(validacion.mensaje, 'error', 'register-notification');
            return false;
        }
        // Manejar advertencias no bloqueantes (por ejemplo formato de placa)
        try {
            if (validacion.warnings && Array.isArray(validacion.warnings) && validacion.warnings.length) {
                // normalizar warnings: pueden ser strings (antiguo) o {field,message}
                const norm = validacion.warnings.map(w => (typeof w === 'string' ? { field: null, message: w } : w));
                // aplicar marcas a los inputs correspondientes
                norm.forEach(w => {
                    try {
                        let selector = null;
                        if (w.field === 'placa') selector = `reg-placa-${formId}`;
                        else if (w.field === 'cliente') selector = `reg-cliente-${formId}`;
                        else if (w.field === 'modelo-otro') selector = `reg-modelo-otro-${formId}`;
                        // si no hay campo, aplicar a placa por compatibilidad
                        const elId = selector || `reg-placa-${formId}`;
                        const inputEl = document.getElementById(elId);
                        if (inputEl) {
                            inputEl.classList.add('input-warning');
                            inputEl.setAttribute('title', w.message || 'Advertencia');
                            // badge
                            const next = inputEl.nextElementSibling;
                            if (!(next && next.classList && next.classList.contains('input-warning-badge'))) {
                                const badge = document.createElement('span');
                                badge.className = 'input-warning-badge';
                                badge.setAttribute('data-tooltip', w.message || 'Advertencia');
                                badge.style.marginLeft = '8px';
                                badge.style.color = 'var(--warning)';
                                badge.textContent = '⚠';
                                if (inputEl.parentNode && inputEl.parentNode.insertBefore) inputEl.parentNode.insertBefore(badge, inputEl.nextSibling);
                            } else {
                                next.setAttribute && next.setAttribute('data-tooltip', w.message || 'Advertencia');
                            }
                        }
                    } catch(e) {}
                });
                // Mostrar notificación tipo warning con la lista de mensajes
                this.showNotification(norm.map(n => n.message).join('\n'), 'warning', 'register-notification');
            }
        } catch (e) { console.warn('warning handling failed', e); }
        // Validaciones estrictas: precios no negativos
        for (const p of (registroData.productos || [])) {
            // Ignorar productos incompletos (p.ej. temporales sin nombre correcto)
            if (!p || !p.name || p.name === 'Desconocido') continue;
            if (p.price < 0) { console.warn('[diag] invalid product price', p); this.showNotification('Precio no puede ser negativo', 'error', 'register-notification'); return false; }
            if (p.quantity <= 0) { console.warn('[diag] invalid product quantity', p); this.showNotification(`La cantidad de ${p.name} debe ser mayor a 0.`, 'error', 'register-notification'); return false; }
        }
        // Validación de métodos de pago: la suma debe cubrir el total o confirmar abono parcial
        const pagosSuma = (registroData.metodosPago || []).reduce((s,m)=>s + (m.monto||0), 0);
        console.debug('[diag] pagosSuma=', pagosSuma, ' total=', registroData.total);
        if (pagosSuma < registroData.total) {
            console.warn('[diag] pagos insuficientes: pagosSuma=', pagosSuma, 'total=', registroData.total);
            const ok = confirm(`La suma de pagos (S/ ${pagosSuma.toFixed(2)}) es menor que el total (S/ ${registroData.total.toFixed(2)}). ¿Desea registrar un abono/pendiente?`);
            if (!ok) return false;
        }
        // Procesar el registro según el tipo
        if (registroData.tipo === "VENTA") {
            this.procesarRegistroVenta(registroData, formId);
        } else {
            this.procesarRegistroGasto(registroData, formId);
        }
        // Sincronizar arqueo de caja tras cada registro
        if (typeof app.calcularArqueoCaja === 'function') {
            setTimeout(() => app.calcularArqueoCaja(), 100);
        }
        // Actualizar historial de registros (usar la función existente/fallback)
        try { if (typeof app.updateRegisterTable === 'function') app.updateRegisterTable(); } catch(e) { console.warn('updateRegisterTable call failed', e); }
        // Limpiar formulario y mantener siempre un formulario guía visible
        if (typeof app.registroUtils.limpiarFormulario === 'function') {
            setTimeout(() => app.registroUtils.limpiarFormulario(formId), 100);
        }
        // UX: notificación de éxito
        this.showNotification('Registro agregado correctamente', 'success', 'register-notification');
        try { console.info('[diag] addRegister - registro añadido OK, total registros=', this.data.registerData.length, ' lastId=', (this.data.registerData.length? this.data.registerData[this.data.registerData.length-1].id : null)); } catch(e){}
        try { this.forceSave(); } catch(e) { console.warn('[diag] forceSave failed', e); }
        return true;
    } catch (error) {
        console.error('Error al agregar registro:', error);
        console.error('[diag] addRegister exception', error && error.stack ? error.stack : error);
        this.showNotification('Error inesperado al procesar el registro', 'error', 'register-notification');
        return false;
    }
};

// Obtener datos del formulario
app.obtenerDatosFormulario = function(formId) {
    const fechaInput = document.getElementById(`reg-fecha-${formId}`);
    const tipoInput = document.getElementById(`reg-tipo-${formId}`);
    const placaInput = document.getElementById(`reg-placa-${formId}`);
    const clienteInput = document.getElementById(`reg-cliente-${formId}`);
    const modeloSelect = document.getElementById(`reg-modelo-${formId}`);
    const modeloOtroInput = document.getElementById(`reg-modelo-otro-${formId}`);
    const descInput = document.getElementById(`reg-descripcion-${formId}`);
    
    const rawFecha = fechaInput ? fechaInput.value : '';
    const fecha = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(rawFecha) : rawFecha;
    const tipo = tipoInput.value;
    const placa = placaInput.value.trim();
    const cliente = clienteInput.value.trim();
    const modelo = modeloSelect ? (modeloSelect.value === 'Otro' ? (modeloOtroInput ? modeloOtroInput.value.trim() : '') : modeloSelect.value) : '';
    const descripcion = descInput.value.trim();
    const sinVehiculoEl = document.getElementById(`reg-sin-vehiculo-${formId}`);
    const sinVehiculo = !!(sinVehiculoEl && sinVehiculoEl.checked);
    
    // Obtener productos seleccionados
    const productos = this.obtenerProductosSeleccionados(formId);
    const total = app.registroUtils.calcularTotalProductos(productos);
    
    // Obtener métodos de pago
    const metodosPago = this.obtenerMetodosPago(formId);
    
    // Obtener mecánicos seleccionados
    const mecanicosIds = this.obtenerMecanicosSeleccionados(formId);
    
    return {
        fecha,
        tipo,
        placa,
        cliente,
        modelo,
    descripcion,
    sinVehiculo,
        productos,
        total,
        metodosPago,
        mecanicosIds,
        formId
    };
};

// Obtener productos seleccionados del formulario
app.obtenerProductosSeleccionados = function(formId) {
    const productosList = document.getElementById(`productos-seleccionados-list-${formId}`);
    const productos = [];
    if (!productosList) return productos;

    productosList.querySelectorAll('.producto-item').forEach(item => {
        try {
            const rawName = item.getAttribute('data-name') || (item.querySelector('.producto-display') && item.querySelector('.producto-display').textContent) || '';
            const name = rawName.trim() || '';
            const qtyInput = item.querySelector('.producto-qty');
            const priceInput = item.querySelector('.producto-price');
            const quantity = qtyInput ? parseInt(qtyInput.value) || 0 : parseInt(item.getAttribute('data-quantity')) || 0;
            const price = priceInput ? parseFloat(priceInput.value) || 0 : parseFloat(item.getAttribute('data-price')) || 0;
            const catalogProduct = (this.data && this.data.catalogData) ? this.data.catalogData.find(p => p.name === name || p.id === item.getAttribute('data-producto-id')) : null;
            const id = catalogProduct ? catalogProduct.id : (item.getAttribute('data-producto-id') || `OTRO-${Date.now()}`);
            const originalPrice = catalogProduct ? catalogProduct.price : price;
            // Omitir productos sin nombre válido
            if (!name) return;
            productos.push({ id, name, quantity, price, originalPrice });
        } catch (e) {
            console.warn('Error reading producto item', e);
        }
    });

    return productos;
};

// Procesar registro de venta
app.procesarRegistroVenta = function(registroData, formId) {
    // Generar ID único
    const uniqueId = app.registroUtils.generarIdUnico(
        registroData.fecha, 
        registroData.placa, 
        this.data.registerData
    );
    
    // Normalizar fecha a ISO para almacenamiento
    const fechaFormateada = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(registroData.fecha) : registroData.fecha;
    
    // Crear nuevo registro
    const nuevoRegistro = {
        id: uniqueId,
    fecha: fechaFormateada,
        tipo: registroData.tipo,
        placa: registroData.placa,
        modelo: registroData.modelo,
        cliente: registroData.cliente,
        productos: registroData.productos,
        mecanicos: registroData.mecanicosIds,
        total: registroData.total,
        metodosPago: registroData.metodosPago,
        descripcion: registroData.descripcion
        ,
        sinVehiculo: !!registroData.sinVehiculo
    };
    
    // Agregar a los datos
    // Añadir timestamp de creación para ordenar por fecha/hora exacta
    nuevoRegistro.createdAt = (new Date()).toISOString();
    this.data.registerData.push(nuevoRegistro);
    
    // Actualizar contador de servicios para mecánicos
    registroData.mecanicosIds.forEach(mecanicoId => {
        const mecanico = this.data.mecanicosData.find(m => m.id === mecanicoId);
        if (mecanico) {
            mecanico.servicios = (mecanico.servicios || 0) + 1;
        }
    });
    
    // Actualizar interfaz y limpiar formulario
    this.finalizarRegistroExitoso(formId);
};

// Procesar registro tipo GASTO (similar a venta pero clasificado como gasto)
app.procesarRegistroGasto = function(registroData, formId) {
    const uniqueId = app.registroUtils.generarIdUnico(registroData.fecha, registroData.placa, this.data.registerData);
    const fechaFormateada = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(registroData.fecha) : registroData.fecha;
    const nuevoRegistro = {
        id: uniqueId,
        fecha: fechaFormateada,
        tipo: registroData.tipo || 'GASTO',
        placa: registroData.placa || '',
        modelo: registroData.modelo || '',
        cliente: registroData.cliente || '',
        productos: registroData.productos || [],
        mecanicos: registroData.mecanicosIds || [],
        total: registroData.total || 0,
        metodosPago: registroData.metodosPago || [],
        descripcion: registroData.descripcion || '',
        sinVehiculo: !!registroData.sinVehiculo
    };
    nuevoRegistro.createdAt = (new Date()).toISOString();
    this.data.registerData.push(nuevoRegistro);
    this.finalizarRegistroExitoso(formId);
};

// Finalizar registro exitoso
app.finalizarRegistroExitoso = function(formId) {
    this.updateRegisterTable();
    this.updateResumenTable();
    this.updateMecanicosTable();
    
    // Limpiar formulario y hacer UX: resaltar última fila insertada
    const lastRegistro = this.data.registerData && this.data.registerData[this.data.registerData.length - 1];
    const lastId = lastRegistro && lastRegistro.id;
    app.registroUtils.limpiarFormulario(formId);
    // Usar helper de table.js para resaltar fila
    if (lastId && typeof app.highlightRowById === 'function') {
        try { app.highlightRowById(lastId); } catch (e) { console.warn('highlightRowById failed', e); }
    }
    // Verificar que la tabla fue actualizada; si no hay filas, reintentar
    try {
        const tbody = document.querySelector('#register-table tbody') || document.getElementById('register-table-body');
        const rows = tbody ? (tbody.querySelectorAll ? tbody.querySelectorAll('tr').length : 0) : 0;
        if (!rows) {
            console.warn('finalizarRegistroExitoso: no se detectaron filas en la tabla, forzando actualización');
            try { if (typeof this.updateRegisterTable === 'function') this.updateRegisterTable(); } catch(e) { console.error('updateRegisterTable retry failed', e); }
        }
    } catch (e) { console.warn('finalizarRegistroExitoso - tabla check failed', e); }
    this.showNotification('Registro agregado correctamente', 'success', 'register-notification');
    this.forceSave();
}

// Agregar producto personalizado (no está en catálogo) con precio manual
app.addProductoPersonalizado = function(formId) {
    // Abrir modal para agregar producto personalizado
    app.openProductModal(formId);
};

// Mostrar/ocultar campos específicos según tipo (VENTA / GASTO)
// Mostrar/ocultar campos específicos según tipo (VENTA / GASTO)
app.handleTipoChange = function(formId) {
    const tipo = document.getElementById(`reg-tipo-${formId}`);
    const gastoRow = document.getElementById(`gasto-row-${formId}`);
    // Campos producto/cantidad/search
    const productoSearchRow = document.getElementById(`reg-producto-search-${formId}`) && document.getElementById(`reg-producto-search-${formId}`).parentElement;
    const cantidadRow = document.getElementById(`reg-cantidad-${formId}`) && document.getElementById(`reg-cantidad-${formId}`).parentElement;
    // Nuevos: filas a ocultar en GASTO
    const rowCliente = document.getElementById(`row-cliente-${formId}`);
    const rowModelo = document.getElementById(`row-modelo-${formId}`);
    const rowMecanicos = document.getElementById(`row-mecanicos-${formId}`);
    const rowMecanicosAsignados = document.getElementById(`row-mecanicos-asignados-${formId}`);
    if (!tipo) return;
    if (tipo.value === 'GASTO') {
            if (gastoRow) { gastoRow.classList.remove('hidden'); gastoRow.style.display = ''; }
        // ocultar búsqueda de producto y cantidad para gastos
        if (productoSearchRow) { productoSearchRow.classList.add('hidden'); productoSearchRow.style.display = 'none'; }
        if (cantidadRow) { cantidadRow.classList.add('hidden'); cantidadRow.style.display = 'none'; }
        if (rowCliente) { rowCliente.classList.add('hidden'); rowCliente.style.display = 'none'; }
        if (rowModelo) { rowModelo.classList.add('hidden'); rowModelo.style.display = 'none'; }
        if (rowMecanicos) { rowMecanicos.classList.add('hidden'); rowMecanicos.style.display = 'none'; }
        if (rowMecanicosAsignados) { rowMecanicosAsignados.classList.add('hidden'); rowMecanicosAsignados.style.display = 'none'; }
        // ocultar botones de agregar producto/personalizado si existen en el formulario
        try {
            const form = document.getElementById(`register-form-${formId}`);
            if (form) {
                Array.from(form.querySelectorAll('button')).forEach(b => {
                    const onclickAttr = b.getAttribute && b.getAttribute('onclick');
                    const txt = (b.textContent || '').trim();
                    if ((onclickAttr && (onclickAttr.includes('addProductToSelection') || onclickAttr.includes('addProductoPersonalizado'))) || txt.includes('Agregar Producto') || txt.includes('Agregar personalizado') || txt.includes('Agregar personalizado')) {
                        b.classList.add('hidden'); b.style.display = 'none';
                    }
                });
            }
        } catch(e) {}
    } else {
        if (gastoRow) { gastoRow.classList.add('hidden'); gastoRow.style.display = 'none'; }
        // mostrar búsqueda de producto y cantidad
        if (productoSearchRow) { productoSearchRow.classList.remove('hidden'); productoSearchRow.style.display = ''; }
        if (cantidadRow) { cantidadRow.classList.remove('hidden'); cantidadRow.style.display = ''; }
        if (rowCliente) { rowCliente.classList.remove('hidden'); rowCliente.style.display = ''; }
        if (rowModelo) { rowModelo.classList.remove('hidden'); rowModelo.style.display = ''; }
        if (rowMecanicos) { rowMecanicos.classList.remove('hidden'); rowMecanicos.style.display = ''; }
        // Si el checkbox 'sin vehículo' está activo, mantener mecánicos ocultos
        const sinVeh = document.getElementById(`reg-sin-vehiculo-${formId}`);
        if (sinVeh && sinVeh.checked) {
            if (rowMecanicos) { rowMecanicos.classList.add('hidden'); rowMecanicos.style.display = 'none'; }
            if (rowMecanicosAsignados) { rowMecanicosAsignados.classList.add('hidden'); rowMecanicosAsignados.style.display = 'none'; }
        } else {
            if (rowMecanicosAsignados) { rowMecanicosAsignados.classList.remove('hidden'); rowMecanicosAsignados.style.display = ''; }
        // restaurar botones de producto si existen
        try {
            const form = document.getElementById(`register-form-${formId}`);
            if (form) {
                Array.from(form.querySelectorAll('button')).forEach(b => {
                    const onclickAttr = b.getAttribute && b.getAttribute('onclick');
                    const txt = (b.textContent || '').trim();
                    if ((onclickAttr && (onclickAttr.includes('addProductToSelection') || onclickAttr.includes('addProductoPersonalizado'))) || txt.includes('Agregar Producto') || txt.includes('Agregar personalizado') || txt.includes('Agregar personalizado')) {
                        b.classList.remove('hidden'); b.style.display = '';
                    }
                });
            }
        } catch(e) {}
        }
    }
};

// Conectar campo 'Nombre gasto' con catálogo: autocompletado de items cuya categoría sea 'Gasto'
app.initGastoAutocompleteForForm = function(formId) {
    const nombreEl = document.getElementById(`reg-gasto-nombre-${formId}`);
    if (!nombreEl) return;
    // crear datalist si no existe
    const datalistId = `datalist-gasto-${formId}`;
    let dl = document.getElementById(datalistId);
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = datalistId;
        document.body.appendChild(dl);
    }
    nombreEl.setAttribute('list', datalistId);
    const renderOptions = () => {
        dl.innerHTML = '';
        const gastosCatalog = (app.data && app.data.catalogData) ? app.data.catalogData.filter(p => p.category === 'Gasto' || String(p.category).toLowerCase().includes('gasto')) : [];
        gastosCatalog.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            dl.appendChild(opt);
        });
    };
    // Inicializar y actualizar cuando cambie el catálogo
    renderOptions();
    // actualizar al enfocarse por si el catálogo cambió
    nombreEl.addEventListener('focus', renderOptions);
    // Cuando el usuario seleccione/ingrese un valor, si coincide con un item del catálogo (categoria Gasto)
    // autocompletar el precio y dejar unidades en 1 si está vacío o inválido
    nombreEl.addEventListener('input', function() {
        const v = (this.value || '').trim();
        if (!v) return;
        const match = (app.data && app.data.catalogData) ? app.data.catalogData.find(p => p.name && p.name.trim().toLowerCase() === v.toLowerCase() && (p.category === 'Gasto' || String(p.category).toLowerCase().includes('gasto'))) : null;
        if (match) {
            const precioEl = document.getElementById(`reg-gasto-precio-${formId}`);
            const unidadesEl = document.getElementById(`reg-gasto-unidades-${formId}`);
            try { if (precioEl) precioEl.value = Number(match.price || 0).toFixed(2); } catch (e) {}
            try { if (unidadesEl && (!unidadesEl.value || Number(unidadesEl.value) <= 0)) unidadesEl.value = '1'; } catch (e) {}
        }
    });
};

// Refrescar opciones de producto en todos los formularios abiertos
app.refreshProductOptionsInForms = function() {
    try {
        const total = (app.data && app.data.currentRegisterForms) || 0;
        for (let i = 1; i <= total; i++) {
            try { if (typeof app.filterProductOptions === 'function') app.filterProductOptions(i); } catch(e){}
        }
    } catch (e) { console.warn('refreshProductOptionsInForms failed', e); }
};

// Refrescar opciones de mecánicos en todos los formularios abiertos
app.refreshMecanicoOptionsInForms = function() {
    try {
        const total = (app.data && app.data.currentRegisterForms) || 0;
        for (let i = 1; i <= total; i++) {
            try { if (typeof app.loadMecanicoOptionsForForm === 'function') app.loadMecanicoOptionsForForm(i); } catch(e){}
            try { if (typeof app.filterMecanicoOptions === 'function') app.filterMecanicoOptions(i); } catch(e){}
        }
    } catch (e) { console.warn('refreshMecanicoOptionsInForms failed', e); }
};