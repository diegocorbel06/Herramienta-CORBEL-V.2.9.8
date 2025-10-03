// =============================================
// ARCHIVO: js/app.js
// Módulo principal de la aplicación
// =============================================

// Módulo principal de la aplicación
const app = {
    // Datos de la aplicación
    data: {
        catalogData: [],
        mecanicosData: [],
        registerData: [],
        nextServiceId: 5,
        nextPartId: 3,
        nextConsumableId: 2,
    nextGastoId: 1,
        nextMecanicoId: 4,
        nextRegisterId: 3,
        gastosDelDia: [],
        currentCategoryFilter: "all",
        currentDateFilter: "all",
        currentRegisterForms: 1,
        activeRegisterForm: 1,
        // contador para asignar IDs únicos a formularios dinámicos
        nextFormId: 2
    },
    // Datos relacionados
    arqueoData: { saldoInicial:0, ingresos:0, egresos:0, saldoFinal:0, registrosArqueo:[] },
    // Relaciones entre registros (por ejemplo: factura <-> recibo)
    data_relacion_default: [],
    
    // Inicialización
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        // Intentar cargar la pestaña 'registro' cuando el módulo correspondiente esté disponible.
        const tryLoadRegistro = (retries = 10) => {
            if (typeof this.getRegistroHTML === 'function' && typeof this.initRegistroTab === 'function') {
                this.loadTabContent('registro');
            } else if (retries > 0) {
                console.warn('getRegistroHTML no disponible aún, reintentando...', { retries });
                setTimeout(() => tryLoadRegistro(retries - 1), 150);
            } else {
                console.error('No se pudo cargar el módulo de Registro. Verifique que los scripts estén cargados y que las rutas sean correctas (distinción mayúsculas/minúsculas en Linux).');
                try { this.showNotification('Error: módulo de Registro no cargado. Revise la consola.', 'error'); } catch (e) { console.error(e); }
            }
        };
        tryLoadRegistro();
        this.startAutosave();
        
        // Verificar modo oscuro
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        }
    },
    loadFromLocalStorage: function() {
        console.log('Cargando datos desde localStorage...');
        // Implementación básica - ajusta según tus necesidades
        const savedData = localStorage.getItem('tallerData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.data = { ...this.data, ...parsedData };
                console.log('Datos cargados correctamente');
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        }
    },
    
    setCurrentDate: function() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },
    
    showNotification: function(message, type, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.textContent = message;
            container.className = `notification ${type}`;
            container.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    },
    
    forceSave: function() {
        console.log('Guardando datos...');
        try {
            localStorage.setItem('tallerData', JSON.stringify(this.data));
            console.log('Datos guardados correctamente');
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    },
    // Configuración de event listeners
    setupEventListeners() {
        // Navegación por pestañas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.showTab(tabId);
            });
        });
        
        // Botones de acción global
        document.getElementById('export-btn').addEventListener('click', () => this.exportToExcel());
        document.getElementById('import-btn').addEventListener('click', () => this.importExcel());
        document.getElementById('save-btn').addEventListener('click', () => this.forceSave());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAllData());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleDarkMode());
        
        // Importación de Excel
        document.getElementById('excel-upload').addEventListener('change', (e) => this.handleExcelImport(e));
        
        // Cerrar menús desplegables al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.searchable-select')) {
                document.querySelectorAll('.searchable-options').forEach(options => {
                    // esconder por defecto con clase hidden y como respaldo, style.display
                    options.classList.add('hidden');
                    options.style.display = 'none';
                });
            }
        });
        
        // Guardar datos antes de cerrar la página
        window.addEventListener('beforeunload', () => this.forceSave());
    },
    
    // Gestión de pestañas
    showTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        
        this.loadTabContent(tabId);
    },
    
    // Carga de contenido de pestañas
    loadTabContent(tabId) {
        const tabElement = document.getElementById(tabId);
        if (tabElement.innerHTML !== '') return;
        
        switch(tabId) {
            case 'registro':
                tabElement.innerHTML = this.getRegistroHTML();
                this.initRegistroTab();
                break;
            case 'arqueo':
                tabElement.innerHTML = this.getArqueoHTML();
                this.initArqueoTab();
                break;
            case 'catalogo':
                tabElement.innerHTML = this.getCatalogoHTML();
                this.initCatalogoTab();
                break;
            case 'mecanicos':
                tabElement.innerHTML = this.getMecanicosHTML();
                this.initMecanicosTab();
                break;
            case 'resumen':
                tabElement.innerHTML = this.getResumenHTML();
                this.initResumenTab();
                break;
            case 'relacion':
                tabElement.innerHTML = this.getRelacionHTML();
                this.initRelacionTab();
                break;
        }
    },
    
    // Funciones para modo oscuro
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.innerHTML = isDarkMode ? 
            '<i class="fas fa-sun"></i> Modo Claro' : 
            '<i class="fas fa-moon"></i> Modo Oscuro';
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});