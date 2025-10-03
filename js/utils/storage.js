// =============================================
// ARCHIVO: js/utils/storage.js
// Manejo del almacenamiento local
// =============================================

// Guardar datos en localStorage
app.saveToLocalStorage = function() {
    const data = {
        catalogData: app.data.catalogData,
        mecanicosData: app.data.mecanicosData,
        registerData: app.data.registerData,
        nextServiceId: app.data.nextServiceId,
        nextPartId: app.data.nextPartId,
        nextConsumableId: app.data.nextConsumableId,
        nextMecanicoId: app.data.nextMecanicoId,
        nextRegisterId: app.data.nextRegisterId,
        gastosDelDia: app.data.gastosDelDia,
        arqueoData: app.arqueoData || {},
        relacionData: app.data.relacionData || [],
        proveedores: app.data.proveedores || [],
        compras: app.data.compras || []
    };
    
    try {
        localStorage.setItem('tallerData', JSON.stringify(data));
    } catch (e) {
        // Manejo seguro de errores de almacenamiento
        const msg = (e && e.message) ? e.message : String(e);
        if (typeof app !== 'undefined' && typeof app.showNotification === 'function') {
            if (e && e.name === 'QuotaExceededError') {
                app.showNotification('Error: Espacio de almacenamiento excedido', 'error');
            } else {
                app.showNotification('Error al guardar datos en el navegador', 'error');
            }
        } else {
            console.error('Error al guardar en localStorage:', msg);
        }
    }
};

// Cargar datos desde localStorage
app.loadFromLocalStorage = function() {
    try {
        const dataStr = localStorage.getItem('tallerData');
        if (!dataStr) {
            // Cargar datos de ejemplo desde el Excel proporcionado
            if (typeof app !== 'undefined' && typeof app.loadExampleData === 'function') {
                app.loadExampleData();
            }
            return;
        }

        const data = JSON.parse(dataStr || '{}');
        // Asignar valores con defensas
        if (typeof app === 'undefined') return;
        app.data.catalogData = data.catalogData || app.data.catalogData || [];
        app.data.mecanicosData = data.mecanicosData || app.data.mecanicosData || [];
        app.data.registerData = data.registerData || app.data.registerData || [];
        app.data.nextServiceId = data.nextServiceId || app.data.nextServiceId || 5;
        app.data.nextPartId = data.nextPartId || app.data.nextPartId || 3;
        app.data.nextConsumableId = data.nextConsumableId || app.data.nextConsumableId || 2;
        app.data.nextMecanicoId = data.nextMecanicoId || app.data.nextMecanicoId || 4;
        app.data.nextRegisterId = data.nextRegisterId || app.data.nextRegisterId || 3;
        app.data.gastosDelDia = data.gastosDelDia || app.data.gastosDelDia || [];
        // Cargar arqueo y relaciones si existen
        app.arqueoData = data.arqueoData || app.arqueoData || { saldoInicial:0, ingresos:0, egresos:0, saldoFinal:0, registrosArqueo:[] };
        app.data.relacionData = data.relacionData || app.data.relacionData || [];
        app.data.proveedores = data.proveedores || app.data.proveedores || [];
        app.data.compras = data.compras || app.data.compras || [];
    } catch (e) {
        const msg = (e && e.message) ? e.message : String(e);
        if (typeof app !== 'undefined' && typeof app.showNotification === 'function') {
            app.showNotification('Error al cargar los datos del navegador', 'error');
        } else {
            console.error('Error al cargar datos:', msg);
        }
    }
};

// Cargar datos de ejemplo
app.loadExampleData = function() {
    // Datos de productos desde el Excel
    app.data.catalogData = [
        { id: "REP-002", name: "Pastillas de Freno No Especificada", category: "Repuesto", price: 15, desc: "Pastillas delanteras originales" },
        // ... (pega aquí TODOS los productos del ejemplo)
        { id: "REP-070", name: "Rosca Caliper No Especificado", category: "Repuesto", price: 30, desc: "" }
    ];
    
    // Datos de mecánicos desde el Excel
    app.data.mecanicosData = [
        { id: "MEC-008", nombre: "Luis", especialidad: "Frenos", estado: "Activo", servicios: 50 },
        // ... (pega aquí TODOS los mecánicos del ejemplo)
        { id: "MEC-014", nombre: "Carlos", especialidad: "Frenos", estado: "Activo", servicios: 71 }
    ];
    
    // Inicializar registros vacíos
    app.data.registerData = [];
};

// Limpiar todos los datos
app.clearAllData = function(askConfirm = true) {
    const doClear = () => {
        if (typeof app === 'undefined') return;
        app.data.catalogData = [];
        app.data.mecanicosData = [];
        app.data.registerData = [];
        app.data.nextServiceId = 1;
        app.data.nextPartId = 1;
        app.data.nextConsumableId = 1;
        app.data.nextMecanicoId = 1;
        app.data.nextRegisterId = 1;
        app.data.gastosDelDia = [];
        
        try { localStorage.removeItem('tallerData'); } catch(e){/* ignore */}
        if (typeof app.showNotification === 'function') app.showNotification('Todos los datos han sido borrados', 'success');
    };

    if (!askConfirm) return doClear();

    // Confirmación segura (si existe confirm en el entorno)
    try {
        if (typeof confirm === 'function') {
            if (confirm('¿Está seguro de que desea borrar todos los datos? Esta acción no se puede deshacer.')) doClear();
        } else {
            // Si no hay confirm (tests o node), borrar directamente
            doClear();
        }
    } catch (e) {
        doClear();
    }
};

function initializeStorage() {
    // Asegurar existencia de app
    if (typeof window !== 'undefined' && typeof window.app === 'undefined') window.app = {};
    if (typeof app === 'undefined') return;

    // Vincular API simple y segura
    app.storage = app.storage || {};
    app.storage.saveData = function() { try { app.saveToLocalStorage(); } catch(e){ console.error('saveData error', e); } };
    app.storage.loadData = function() { try { app.loadFromLocalStorage(); } catch(e){ console.error('loadData error', e); } };
    app.storage.clearAllData = function(askConfirm) { return app.clearAllData(askConfirm); };
}

// Esperar a que el DOM esté listo y app esté definido
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeStorage, 50);
});