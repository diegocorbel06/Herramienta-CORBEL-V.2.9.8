// =============================================
// ARCHIVO: js/modules/mecanicos.js
// Módulo de Gestión de Mecánicos
// =============================================

// Función para obtener el HTML de la pestaña de mecánicos
app.getMecanicosHTML = function() {
    return `<div class="card">
        <div class="card-header">
            <h3><i class="fas fa-user-plus"></i> Agregar Nuevo Mecánico</h3>
        </div>
        <div id="mecanico-notification" class="notification"></div>
        <div class="form-row">
            <div class="form-group">
                <label for="mecanico-nombre"><i class="fas fa-user"></i> Nombre</label>
                <input type="text" id="mecanico-nombre" placeholder="Ej: Carlos Mendoza">
            </div>
            <div class="form-group">
                <label for="mecanico-especialidad"><i class="fas fa-star"></i> Especialidad</label>
                <input type="text" id="mecanico-especialidad" placeholder="Ej: Motor, Electricidad">
            </div>
            <div class="form-group">
                <label for="mecanico-estado"><i class="fas fa-check-circle"></i> Estado</label>
                <select id="mecanico-estado">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
        </div>
        <button class="btn btn-success" onclick="app.addMecanico()">
            <i class="fas fa-check"></i> Agregar Mecánico
        </button>
    </div>
    
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-users"></i> Lista de Mecánicos</h3>
        </div>
        <div class="search-box">
            <input type="text" id="search-mecanico" placeholder="Buscar mecánicos...">
            <button class="btn" onclick="app.filterMecanicoTable()">
                <i class="fas fa-search"></i> Buscar
            </button>
            <button class="btn btn-warning" onclick="app.clearMecanicoSearch()">
                <i class="fas fa-times"></i> Limpiar
            </button>
        </div>
        <div class="table-container">
            <table id="mecanicos-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Especialidad</th>
                        <th>Estado</th>
                        <th>Servicios</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>`;
};

// Inicializar la pestaña de mecánicos
app.initMecanicosTab = function() {
    // Inicializar la pestaña de mecánicos
    this.updateMecanicosTable();
};

// Agregar nuevo mecánico
app.addMecanico = function() {
    const nombreInput = document.getElementById('mecanico-nombre');
    const especialidadInput = document.getElementById('mecanico-especialidad');
    const estadoInput = document.getElementById('mecanico-estado');
    
    const nombre = nombreInput.value.trim();
    const especialidad = especialidadInput.value.trim();
    const estado = estadoInput.value;
    
    if (!nombre || !especialidad) {
        this.showNotification('Por favor complete todos los campos', 'error', 'mecanico-notification');
        return;
    }
    
    const newId = `MEC-${this.data.nextMecanicoId.toString().padStart(3, '0')}`;
    this.data.nextMecanicoId++;
    
    const newMecanico = {
        id: newId,
        nombre: nombre,
        especialidad: especialidad,
        estado: estado,
        servicios: 0
    };
    
    this.data.mecanicosData.push(newMecanico);
    this.updateMecanicosTable();
    
    // Limpiar el formulario
    nombreInput.value = '';
    especialidadInput.value = '';
    estadoInput.value = 'Activo';
    
    this.showNotification('Mecánico agregado correctamente', 'success', 'mecanico-notification');
    this.forceSave();
    // refrescar opciones en formularios de registro
    try { if (typeof app.refreshMecanicoOptionsInForms === 'function') app.refreshMecanicoOptionsInForms(); } catch(e){}
};

// Actualizar la tabla de mecánicos
app.updateMecanicosTable = function() {
    const tableBody = document.querySelector('#mecanicos-table tbody');
    if (!tableBody) {
        // La pestaña de mecánicos no está montada en el DOM actualmente; nada que actualizar visualmente
        return;
    }
    tableBody.innerHTML = '';
    
    // Aplicar filtro de búsqueda si existe
    const searchTerm = document.getElementById('search-mecanico').value.toLowerCase();
    let filteredMecanicos = this.data.mecanicosData;
    
    if (searchTerm) {
        filteredMecanicos = filteredMecanicos.filter(mecanico => 
            mecanico.id.toLowerCase().includes(searchTerm) ||
            mecanico.nombre.toLowerCase().includes(searchTerm) ||
            mecanico.especialidad.toLowerCase().includes(searchTerm) ||
            mecanico.estado.toLowerCase().includes(searchTerm)
        );
    }
    
    filteredMecanicos.forEach(mecanico => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mecanico.id}</td>
            <td>${mecanico.nombre}</td>
            <td>${mecanico.especialidad}</td>
            <td>${mecanico.estado}</td>
            <td>${mecanico.servicios || 0}</td>
            <td class="action-buttons">
                <button class="btn btn-icon" onclick="app.editMecanico('${mecanico.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="app.deleteMecanico('${mecanico.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// Editar mecánico existente
app.editMecanico = function(id) {
    const mecanico = this.data.mecanicosData.find(m => m.id === id);
    if (mecanico) {
        // Crear modal de edición
        const modalHTML = `
            <div class="modal-overlay modal-fulloverlay">
                <div class="modal modal-centered">
                    <h3>Editar Mecánico: ${mecanico.nombre}</h3>
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="edit-mecanico-nombre" value="${mecanico.nombre}" class="form-control compact-input">
                    </div>
                    <div class="form-group">
                        <label>Especialidad</label>
                        <input type="text" id="edit-mecanico-especialidad" value="${mecanico.especialidad}" class="form-control compact-input">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="edit-mecanico-estado" class="form-control compact-input">
                            <option value="Activo" ${mecanico.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                            <option value="Inactivo" ${mecanico.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <button class="btn btn-success" onclick="app.saveMecanicoEdit('${id}')">Guardar</button>
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

// Guardar los cambios al editar mecánico
app.saveMecanicoEdit = function(id) {
    const nombre = document.getElementById('edit-mecanico-nombre').value;
    const especialidad = document.getElementById('edit-mecanico-especialidad').value;
    const estado = document.getElementById('edit-mecanico-estado').value;

    const mecanicoIndex = this.data.mecanicosData.findIndex(m => m.id === id);
    if (mecanicoIndex !== -1) {
        this.data.mecanicosData[mecanicoIndex] = {
            ...this.data.mecanicosData[mecanicoIndex],
            nombre,
            especialidad,
            estado
        };
        
        this.updateMecanicosTable();
        this.showNotification('Mecánico actualizado correctamente', 'success', 'mecanico-notification');
        this.forceSave();
    }
    
    this.closeModal();
    try { if (typeof app.refreshMecanicoOptionsInForms === 'function') app.refreshMecanicoOptionsInForms(); } catch(e){}
};

// Eliminar mecánico
app.deleteMecanico = function(id) {
    if (!confirm('¿Está seguro de que desea eliminar este mecánico?')) {
        return;
    }
    
    const mecanicoIndex = this.data.mecanicosData.findIndex(m => m.id === id);
    if (mecanicoIndex === -1) return;
    
    this.data.mecanicosData.splice(mecanicoIndex, 1);
    this.updateMecanicosTable();
    
    this.showNotification('Mecánico eliminado correctamente', 'success', 'mecanico-notification');
    this.forceSave();
    try { if (typeof app.refreshMecanicoOptionsInForms === 'function') app.refreshMecanicoOptionsInForms(); } catch(e){}
};

// Filtrar la tabla de mecánicos
app.filterMecanicoTable = function() {
    this.updateMecanicosTable();
};

// Limpiar búsqueda de mecánicos
app.clearMecanicoSearch = function() {
    document.getElementById('search-mecanico').value = '';
    this.updateMecanicosTable();
};