// =============================================
// ARCHIVO: js/modules/catalogo.js
// Módulo de Catálogo de Productos
// =============================================

// Función para obtener el HTML de la pestaña de catálogo
app.getCatalogoHTML = function() {
    return `<div class="card">
        <div class="card-header">
            <h3><i class="fas fa-plus-circle"></i> Agregar Nuevo Producto/Servicio</h3>
        </div>
        <div id="catalog-notification" class="notification"></div>
        <div class="form-row">
            <div class="form-group">
                <label for="product-name"><i class="fas fa-tag"></i> Nombre</label>
                <input type="text" id="product-name" placeholder="Ej: Cambio de aceite">
            </div>
            <div class="form-group">
                <label for="product-category"><i class="fas fa-folder"></i> Categoría</label>
                <select id="product-category">
                    <option value="Servicio">Servicio</option>
                    <option value="Repuesto">Repuesto</option>
                    <option value="Consumible">Consumible</option>
                        <option value="Gasto">Gasto</option>
                </select>
            </div>
            <div class="form-group">
                <label for="product-price"><i class="fas fa-dollar-sign"></i> Precio (PEN)</label>
                <input type="number" id="product-price" min="0" step="0.01" placeholder="0.00">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="product-desc"><i class="fas fa-align-left"></i> Descripción</label>
                <textarea id="product-desc" rows="2" placeholder="Descripción del producto/servicio..."></textarea>
            </div>
            <div class="form-group">
                <label class="visually-hidden">Agregar</label>
                <button class="btn btn-success" onclick="app.addProduct()">
                    <i class="fas fa-check"></i> Agregar Producto/Servicio
                </button>
            </div>
        </div>
    </div>
    
    <div class="category-filters">
        <div class="category-filter active" data-category="all">Todos</div>
        <div class="category-filter" data-category="Servicio">Servicios</div>
        <div class="category-filter" data-category="Repuesto">Repuestos</div>
        <div class="category-filter" data-category="Consumible">Consumibles</div>
            <div class="category-filter" data-category="Gasto">Gastos</div>
    </div>
    
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-boxes"></i> Catálogo de Productos y Servicios</h3>
        </div>
        <div class="search-box">
            <input type="text" id="search-product" placeholder="Buscar productos...">
            <button class="btn" onclick="app.filterProductTable()">
                <i class="fas fa-search"></i> Buscar
            </button>
            <button class="btn btn-warning" onclick="app.clearProductSearch()">
                <i class="fas fa-times"></i> Limpiar
            </button>
        </div>
        <div class="table-container">
            <table id="catalog-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio (PEN)</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>`;
};

// Inicializar la pestaña de catálogo
app.initCatalogoTab = function() {
    // Inicializar la pestaña de catálogo
    this.updateCatalogTable();
    
    // Configurar filtros de categoría
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            this.data.currentCategoryFilter = e.target.getAttribute('data-category');
            this.updateCatalogTable();
        });
    });
};

// Agregar nuevo producto al catálogo
app.addProduct = function() {
    const nameInput = document.getElementById('product-name');
    const categoryInput = document.getElementById('product-category');
    const priceInput = document.getElementById('product-price');
    const descInput = document.getElementById('product-desc');
    
    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const price = parseFloat(priceInput.value);
    const desc = descInput.value.trim();
    
    if (!name || !category || isNaN(price) || price < 0) {
        this.showNotification('Por favor complete todos los campos correctamente', 'error', 'catalog-notification');
        return;
    }
    
    let newId;
    if (category === "Servicio") {
        newId = `SERV-${this.data.nextServiceId.toString().padStart(3, '0')}`;
        this.data.nextServiceId++;
    } else if (category === "Repuesto") {
        newId = `REP-${this.data.nextPartId.toString().padStart(3, '0')}`;
        this.data.nextPartId++;
    } else {
        newId = `CONS-${this.data.nextConsumableId.toString().padStart(3, '0')}`;
        this.data.nextConsumableId++;
    }
    
    const newProduct = {
        id: newId,
        name: name,
        category: category,
        price: price,
        desc: desc
    };
    
    this.data.catalogData.push(newProduct);
                newId = `GASTO-${this.data.nextGastoId.toString().padStart(3, '0')}`;
                this.data.nextGastoId++;
    this.updateCatalogTable();
    
    // Limpiar el formulario
    nameInput.value = '';
    categoryInput.value = 'Servicio';
    priceInput.value = '';
    descInput.value = '';
    
    this.showNotification('Producto agregado correctamente', 'success', 'catalog-notification');
    this.forceSave();
};

// Actualizar la tabla del catálogo
app.updateCatalogTable = function() {
    const tableBody = document.querySelector('#catalog-table tbody');
    tableBody.innerHTML = '';
    
    // Aplicar filtro de búsqueda si existe
    const searchTerm = document.getElementById('search-product').value.toLowerCase();
    let filteredProducts = this.data.catalogData;
    
    // Aplicar filtro de categoría
    if (this.data.currentCategoryFilter !== "all") {
        filteredProducts = filteredProducts.filter(product => product.category === this.data.currentCategoryFilter);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.id.toLowerCase().includes(searchTerm) ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            (product.desc && product.desc.toLowerCase().includes(searchTerm))
        );
    }
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td><span class="badge badge-${product.category.toLowerCase()}">${product.category}</span></td>
            <td>S/ ${product.price.toFixed(2)}</td>
            <td>${product.desc || ''}</td>
            <td class="action-buttons">
                <button class="btn btn-icon" onclick="app.editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="app.deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// Editar producto existente
app.editProduct = function(id) {
    const product = this.data.catalogData.find(p => p.id === id);
    if (product) {
        // Crear modal de edición
        const modalHTML = `
                <div class="modal-overlay modal-fulloverlay">
                    <div class="modal modal-centered">
                    <h3>Editar Producto: ${product.name}</h3>
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="edit-product-name" value="${product.name}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="edit-product-category" class="form-control">
                            <option value="Servicio" ${product.category === 'Servicio' ? 'selected' : ''}>Servicio</option>
                            <option value="Repuesto" ${product.category === 'Repuesto' ? 'selected' : ''}>Repuesto</option>
                            <option value="Consumible" ${product.category === 'Consumible' ? 'selected' : ''}>Consumible</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Precio (PEN)</label>
                        <input type="number" id="edit-product-price" value="${product.price}" step="0.01" min="0" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="edit-product-desc" class="form-control">${product.desc || ''}</textarea>
                    </div>
                    <div class="form-row">
                        <button class="btn btn-success" onclick="app.saveProductEdit('${id}')">Guardar</button>
                        <button class="btn" onclick="app.closeModal()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
    }
};

// Guardar los cambios al editar producto
app.saveProductEdit = function(id) {
    const name = document.getElementById('edit-product-name').value;
    const category = document.getElementById('edit-product-category').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const desc = document.getElementById('edit-product-desc').value;

    const productIndex = this.data.catalogData.findIndex(p => p.id === id);
    if (productIndex !== -1) {
        this.data.catalogData[productIndex] = {
            ...this.data.catalogData[productIndex],
            name,
            category,
            price,
            desc
        };
        
            this.updateCatalogTable();
            // refrescar opciones en formularios de registro que puedan estar abiertos
            try { if (typeof app.refreshProductOptionsInForms === 'function') app.refreshProductOptionsInForms(); } catch(e){}
        this.showNotification('Producto actualizado correctamente', 'success', 'catalog-notification');
        this.forceSave();
    }
    
    this.closeModal();
};

// Eliminar producto del catálogo
app.deleteProduct = function(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) {
        return;
    }
    
    const productIndex = this.data.catalogData.findIndex(p => p.id === id);
    if (productIndex === -1) return;
    
    this.data.catalogData.splice(productIndex, 1);
    this.updateCatalogTable();
    try { if (typeof app.refreshProductOptionsInForms === 'function') app.refreshProductOptionsInForms(); } catch(e){}
    
    this.showNotification('Producto eliminado correctamente', 'success', 'catalog-notification');
    this.forceSave();
};

// Filtrar la tabla de productos
app.filterProductTable = function() {
    this.updateCatalogTable();
};

// Limpiar búsqueda de productos
app.clearProductSearch = function() {
    document.getElementById('search-product').value = '';
    this.updateCatalogTable();
};