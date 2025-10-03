// =============================================
// ARCHIVO: js/modules/registro/utils.js
// Utilidades específicas para registro
// =============================================

app.registroUtils = {
    // Generar ID único para registro
    generarIdUnico: function(fecha, placa, registrosExistentes) {
        // Normalizar fecha de entrada a formato yyyy-mm-dd
        let inputIso = fecha;
        try {
            if (typeof this.toInputDate === 'function') {
                inputIso = this.toInputDate(fecha);
            } else if (fecha && fecha.indexOf('/') !== -1) {
                const parts = fecha.split('/'); // dd/mm/yyyy
                inputIso = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
            }
        } catch (e) {
            inputIso = fecha;
        }
        const formattedDate = String(inputIso).replace(/-/g, '');

        // Contar registros del mismo día para la misma placa (normalizando fechas existentes)
        const sameDayRecords = (registrosExistentes || []).filter(r => {
            try {
                const regIso = (this.toInputDate && typeof this.toInputDate === 'function') ? this.toInputDate(r.fecha) : (r.fecha.indexOf('/')!==-1 ? r.fecha.split('/').reverse().join('-') : r.fecha);
                const regFormattedDate = String(regIso).replace(/-/g, '');
                return regFormattedDate === formattedDate && String(r.placa || '') === String(placa || '') && r.tipo === "VENTA";
            } catch (e) {
                return false;
            }
        });

        const recordNumber = sameDayRecords.length + 1;
        return `${formattedDate}-${placa}-${recordNumber}`;
    },

    // Formatear fecha para mostrar
    // Formatear fecha para mostrar (dd/MM/yyyy)
    toDisplayDate: function(fecha) {
        if (!fecha) return '';
        try {
            // Aceptar yyyy-mm-dd o dd/mm/yyyy
            if (fecha.indexOf('-') !== -1) {
                const parts = fecha.split('-');
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            } else if (fecha.indexOf('/') !== -1) {
                // asume dd/mm/yyyy
                return fecha;
            }
            return String(fecha);
        } catch (e) {
            return String(fecha);
        }
    },

    // Convertir cualquier fecha aceptada a formato input yyyy-MM-dd
    toInputDate: function(fecha) {
        if (!fecha) return '';
        try {
            if (fecha.indexOf('-') !== -1) {
                // ya en formato ISO
                return fecha.split('T')[0];
            }
            if (fecha.indexOf('/') !== -1) {
                const parts = fecha.split('/'); // dd/mm/yyyy
                return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
            }
            // timestamp o similar
            const d = new Date(fecha);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth()+1).padStart(2,'0');
            const dd = String(d.getDate()).padStart(2,'0');
            return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
            return '';
        }
    },

    // Calcular total de productos
    calcularTotalProductos: function(productos) {
        return productos.reduce((total, producto) => {
            return total + (producto.price * producto.quantity);
        }, 0);
    },

    // Obtener nombres de mecánicos por IDs
    obtenerNombresMecanicos: function(mecanicosIds) {
        if (!Array.isArray(mecanicosIds)) return [];
        const mecanicosData = (app.data && Array.isArray(app.data.mecanicosData)) ? app.data.mecanicosData : [];
        return mecanicosIds.map(entry => {
            try {
                // Caso: ya viene como objeto con nombre
                if (entry && typeof entry === 'object' && entry.nombre) return String(entry.nombre);
                // Caso: es string, puede ser id o nombre
                if (typeof entry === 'string') {
                    const byId = mecanicosData.find(m => String(m.id) === entry);
                    if (byId) return byId.nombre;
                    // buscar por nombre (case-insensitive)
                    const byName = mecanicosData.find(m => String(m.nombre || '').trim().toLowerCase() === entry.trim().toLowerCase());
                    if (byName) return byName.nombre;
                    // si parece un id (p.ej. MEC-XXX) y no se encontró, devolver 'Desconocido'
                    if (/^MEC-?\d+/i.test(entry)) return 'Desconocido';
                    // si es cualquier otra cadena, devolverla como posible nombre
                    return entry;
                }
                // Caso: número u otro, convertir a string
                return String(entry || '');
            } catch (e) {
                return 'Desconocido';
            }
        }).filter(Boolean).map(n => String(n));
    },

    // Filtrar registros con múltiples criterios
    filtrarRegistros: function(registros, filtros) {
        let resultados = [...registros];
        
        // Filtro por fecha
        if (filtros.fechaDesde && filtros.fechaHasta) {
            resultados = resultados.filter(registro => {
                const registroDate = new Date(registro.fecha.split('/').reverse().join('-'));
                const desde = new Date(filtros.fechaDesde);
                const hasta = new Date(filtros.fechaHasta);
                hasta.setHours(23, 59, 59, 999);
                
                return registroDate >= desde && registroDate <= hasta;
            });
        }
        
        // Filtro por tipo
        if (filtros.tipo && filtros.tipo !== 'all') {
            resultados = resultados.filter(registro => registro.tipo === filtros.tipo);
        }
        
        // Filtro por búsqueda de texto
        if (filtros.textoBusqueda) {
            const searchTerm = filtros.textoBusqueda.toLowerCase();
            resultados = resultados.filter(registro =>
                registro.id.toLowerCase().includes(searchTerm) ||
                registro.placa.toLowerCase().includes(searchTerm) ||
                registro.cliente.toLowerCase().includes(searchTerm) ||
                registro.productos.some(p => p.name.toLowerCase().includes(searchTerm))
            );
        }
        
        return resultados;
    },

    // Limpiar formulario de registro
    limpiarFormulario: function(formId) {
        // Limpiar campos básicos de forma defensiva
        const placaEl = document.getElementById(`reg-placa-${formId}`);
        if (placaEl) try { placaEl.value = ''; } catch(e) {}
        const clienteEl = document.getElementById(`reg-cliente-${formId}`);
        if (clienteEl) try { clienteEl.value = ''; } catch(e) {}
        const modeloEl = document.getElementById(`reg-modelo-${formId}`);
        if (modeloEl) try { modeloEl.value = ''; } catch(e) {}
        const descEl = document.getElementById(`reg-descripcion-${formId}`);
        if (descEl) try { descEl.value = ''; } catch(e) {}

        // Limpiar modelo "Otro"
        const modeloOtroInput = document.getElementById(`reg-modelo-otro-${formId}`);
        if (modeloOtroInput) try { modeloOtroInput.value = ''; } catch(e) {}
        const modeloOtroContainer = document.getElementById(`modelo-otro-container-${formId}`);
        if (modeloOtroContainer && modeloOtroContainer.classList) try { modeloOtroContainer.classList.add('hidden'); } catch(e) {}

        // Limpiar productos y mecánicos seleccionados (si existen)
        const mecSel = document.getElementById(`mecanicos-seleccionados-${formId}`);
        if (mecSel) {
            try { mecSel.innerHTML = '<p>No hay mecánicos asignados</p>'; } catch(e) {}
        }
        const prodContainer = document.getElementById(`productos-seleccionados-container-${formId}`);
        if (prodContainer && prodContainer.classList) try { prodContainer.classList.add('hidden'); } catch(e) {}
        const prodList = document.getElementById(`productos-seleccionados-list-${formId}`);
        if (prodList) try { prodList.innerHTML = ''; } catch(e) {}

        // Limpiar métodos de pago de forma defensiva
        const metodosPagoContainer = document.getElementById(`metodos-pago-${formId}`);
        if (metodosPagoContainer) {
            try {
                metodosPagoContainer.innerHTML = `
                    <div class="payment-method">
                        <select class="pago-metodo">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Yape">Yape</option>
                            <option value="Otros">Otros</option>
                        </select>
                        <input type="number" class="pago-monto" min="0" step="0.01" placeholder="Monto" oninput="app.calcularTotalPagos(${formId})">
                        <button class="btn btn-danger btn-icon" onclick="app.removePaymentMethod(this, ${formId})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            } catch(e) { console.warn('limpiarFormulario - set metodosPago failed', e); }
        }
        const pagoTotalEl = document.getElementById(`pago-total-${formId}`);
        if (pagoTotalEl) try { pagoTotalEl.textContent = 'Total: S/ 0.00'; } catch(e) {}
    }
};