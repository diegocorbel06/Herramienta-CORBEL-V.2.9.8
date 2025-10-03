
// Importaciones de servicios y utilidades
import storage from './services/storage.js';
// import ventasService from './services/ventas.js';
// import gastosService from './services/gastos.js';
// import proveedoresService from './services/proveedores.js';
// import arqueoCajaService from './services/arqueoCaja.js';
// import validaciones from './utils/validaciones.js';
// import formateadores from './utils/formateadores.js';

// Estado global de la app (migrado de js/app.js)
const app = {
	data: {
		catalogData: [],
		mecanicosData: [],
		registerData: [],
		nextServiceId: 5,
		nextPartId: 3,
		nextConsumableId: 2,
		nextMecanicoId: 4,
		nextRegisterId: 3,
		gastosDelDia: [],
		currentCategoryFilter: "all",
		currentDateFilter: "all",
		currentRegisterForms: 1,
		activeRegisterForm: 1
	},
	arqueoData: { saldoInicial:0, ingresos:0, egresos:0, saldoFinal:0, registrosArqueo:[] },
	data_relacion_default: [],

	// Inicialización principal
	init() {
		this.loadFromStorage();
		this.setupEventListeners();
		this.loadTabContent('registro');
		this.startAutosave();
		// Modo oscuro
		if (storage.get('darkMode') === 'enabled') {
			document.body.classList.add('dark-mode');
			document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
		}
	},

	// Persistencia usando storage.js
	loadFromStorage() {
		const savedData = storage.get('tallerData');
		if (savedData) {
			this.data = { ...this.data, ...savedData };
		}
	},
	forceSave() {
		storage.set('tallerData', this.data);
	},

	// Notificaciones
	showNotification(message, type, containerId) {
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

	// Event listeners globales
	setupEventListeners() {
		// Navegación por pestañas
		document.querySelectorAll('.tab').forEach(tab => {
			tab.addEventListener('click', (e) => {
				const tabId = e.currentTarget.getAttribute('data-tab');
				this.showTab(tabId);
			});
		});
		// Botones globales
		document.getElementById('export-btn').addEventListener('click', () => this.exportToExcel && this.exportToExcel());
		document.getElementById('import-btn').addEventListener('click', () => this.importExcel && this.importExcel());
		document.getElementById('save-btn').addEventListener('click', () => this.forceSave());
		document.getElementById('clear-btn').addEventListener('click', () => this.clearAllData && this.clearAllData());
		document.getElementById('theme-toggle').addEventListener('click', () => this.toggleDarkMode());
		document.getElementById('excel-upload').addEventListener('change', (e) => this.handleExcelImport && this.handleExcelImport(e));
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.searchable-select')) {
				document.querySelectorAll('.searchable-options').forEach(options => {
					options.style.display = 'none';
				});
			}
		});
		window.addEventListener('beforeunload', () => this.forceSave());
	},

	// Gestión de pestañas (modularizable)
	showTab(tabId) {
		document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
		document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
		document.getElementById(tabId).classList.add('active');
		document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
		this.loadTabContent(tabId);
	},

	// Carga de contenido de pestañas (modularizable)
	loadTabContent(tabId) {
		const tabElement = document.getElementById(tabId);
		if (tabElement.innerHTML !== '') return;
		// Aquí se llamarán los componentes según la pestaña
		// Ejemplo: import y render de FormVenta, FormGasto, etc.
		// TODO: Modularizar cada caso
	},

	// Modo oscuro
	toggleDarkMode() {
		document.body.classList.toggle('dark-mode');
		const isDarkMode = document.body.classList.contains('dark-mode');
		storage.set('darkMode', isDarkMode ? 'enabled' : 'disabled');
		const themeToggle = document.getElementById('theme-toggle');
		themeToggle.innerHTML = isDarkMode ? 
			'<i class="fas fa-sun"></i> Modo Claro' : 
			'<i class="fas fa-moon"></i> Modo Oscuro';
	},

	// Autosave cada cierto tiempo
	startAutosave() {
		setInterval(() => this.forceSave(), 60000);
	},

	// Utilidad para obtener fecha actual
	setCurrentDate() {
		const now = new Date();
		return now.toISOString().split('T')[0];
	}
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
	app.init();
});
