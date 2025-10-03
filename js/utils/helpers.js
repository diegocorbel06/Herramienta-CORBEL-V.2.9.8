// =============================================
// ARCHIVO: js/utils/helpers.js
// Funciones de ayuda generales
// =============================================

// Función para obtener la fecha actual en formato YYYY-MM-DD
app.setCurrentDate = function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    return `${yyyy}-${mm}-${dd}`;
};

// Función para mostrar notificaciones
app.showNotification = function(message, type, containerId = null) {
    if (containerId) {
        const notification = document.getElementById(containerId);
        if (!notification) {
            // Caída silenciosa si el contenedor no existe
            console.warn('showNotification: contenedor no encontrado', containerId);
            return;
        }
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } else {
        // Crear notificación global si no se especifica contenedor
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Función para mostrar el indicador de autoguardado
app.showAutosaveIndicator = function() {
    try {
        const indicator = document.getElementById('autosave-indicator');
        if (!indicator) return;
        indicator.style.display = 'block';
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    } catch (e) {
        console.warn('showAutosaveIndicator error', e);
    }
};

// Función para iniciar el autoguardado
app.startAutosave = function() {
    try {
        // Evitar duplicar timers
        if (app._autosaveInterval) return;
        app._autosaveInterval = setInterval(() => {
            try {
                if (typeof app.saveToLocalStorage === 'function') app.saveToLocalStorage();
                app.showAutosaveIndicator();
            } catch (e) {
                console.warn('autosave error', e);
            }
        }, 30000);
    } catch (e) {
        console.warn('startAutosave error', e);
    }
};

// Función para forzar el guardado
app.forceSave = function() {
    try {
        if (typeof app.saveToLocalStorage === 'function') {
            app.saveToLocalStorage();
        } else {
            console.warn('forceSave: app.saveToLocalStorage no está definido en este entorno');
        }
        app.showAutosaveIndicator();
        app.showNotification('Datos guardados correctamente', 'success');
    } catch (e) {
        console.error('forceSave error', e);
        try { app.showNotification('Error al guardar datos', 'error'); } catch (_) {}
    }
};

// Función para cerrar modales
app.closeModal = function() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
};