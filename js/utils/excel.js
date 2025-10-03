// =============================================
// ARCHIVO: js/utils/excel.js
// Módulo para exportar/importar Excel
// =============================================

// Exportar a Excel
app.exportToExcel = function() {
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();

    // Hoja de productos
    const productosWs = XLSX.utils.json_to_sheet(this.data.catalogData.map(p => ({
        ID: p.id,
        Nombre: p.name,
        Categoría: p.category,
        Precio: p.price,
        Descripción: p.desc || ''
    })));
    XLSX.utils.book_append_sheet(wb, productosWs, "Productos");

    // Hoja de registros
    const registrosWs = XLSX.utils.json_to_sheet(this.data.registerData.map(r => {
        const mecanicosNombres = r.mecanicos.map(mecanicoId => {
            const mecanico = this.data.mecanicosData.find(m => m.id === mecanicoId);
            return mecanico ? mecanico.nombre : "Desconocido";
        }).join(', ');

        const metodosPago = r.metodosPago.map(p => `${p.metodo}: S/ ${p.monto.toFixed(2)}`).join(', ');

        return {
            ID: r.id,
            Fecha: r.fecha,
            Tipo: r.tipo,
            Placa: r.placa,
            Modelo: r.modelo || '',
            Cliente: r.cliente,
            Productos: r.productos.map(p => `${p.name} x${p.quantity}`).join(', '),
            Mecánicos: mecanicosNombres,
            Total: r.total,
            'Métodos de Pago': metodosPago,
            Descripción: r.descripcion || ''
        };
    }));
    XLSX.utils.book_append_sheet(wb, registrosWs, "Registros");

    // Hoja de mecánicos
    const mecanicosWs = XLSX.utils.json_to_sheet(this.data.mecanicosData.map(m => ({
        ID: m.id,
        Nombre: m.nombre,
        Especialidad: m.especialidad,
        Estado: m.estado,
        Servicios: m.servicios || 0
    })));
    XLSX.utils.book_append_sheet(wb, mecanicosWs, "Mecánicos");

    // Hoja de proveedores
    const provWs = XLSX.utils.json_to_sheet((this.data.proveedores||[]).map(p => ({ ID: p.id, Nombre: p.nombre, Contacto: p.contacto || '' } )));
    XLSX.utils.book_append_sheet(wb, provWs, "Proveedores");

    // Hoja de compras
    const comprasWs = XLSX.utils.json_to_sheet((this.data.compras||[]).map(c => ({
        ID: c.id,
        ProveedorId: c.proveedorId,
        Fecha: c.fecha,
        Total: c.total,
        Estado: c.estado,
        Items: c.items.map(i => `${i.name}|${i.quantity}|${i.price}`).join(';'),
        Pagos: (c.pagos||[]).map(p => `${p.fecha}|${p.monto}`).join(';')
    })));
    XLSX.utils.book_append_sheet(wb, comprasWs, "Compras");

    // Guardar el archivo
    XLSX.writeFile(wb, "taller_data.xlsx");
    this.showNotification('Datos exportados correctamente a Excel', 'success');
};

// Importar desde Excel
app.importExcel = function() {
    document.getElementById('excel-upload').click();
};

// Manejar la importación de Excel
app.handleExcelImport = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Procesar hoja de productos
            if (workbook.SheetNames.includes('Productos')) {
                const productosSheet = workbook.Sheets['Productos'];
                try {
                    const productosData = XLSX.utils.sheet_to_json(productosSheet);
                    app.data.catalogData = productosData.map(item => ({
                        id: item.ID || (`ITEM-${Date.now()}`),
                        name: item.Nombre || 'Sin nombre',
                        category: item.Categoría || 'General',
                        price: parseFloat(item.Precio) || 0,
                        desc: item.Descripción || ''
                    }));
                } catch (err) {
                    console.warn('Error parsing Productos sheet:', err);
                }
            }

            // Procesar hoja de registros
            if (workbook.SheetNames.includes('Registros')) {
                const registrosSheet = workbook.Sheets['Registros'];
                try {
                    const registrosData = XLSX.utils.sheet_to_json(registrosSheet);
                    // Asegurar que exista el array destino
                    app.data.registerData = app.data.registerData || [];
                    registrosData.forEach(item => {
                        // Parsear productos (formato: "Nombre xCantidad")
                        let productos = [];
                        if (item.Productos) {
                            const productosStr = String(item.Productos).split(',');
                            productos = productosStr.map(prodStr => {
                                const match = prodStr.trim().match(/(.+) x(\d+)/);
                                if (match) {
                                    const name = match[1].trim();
                                    const quantity = parseInt(match[2]) || 0;
                                    const catalogProduct = (app.data.catalogData||[]).find(p => String(p.name).trim() === String(name).trim());
                                    const price = catalogProduct ? Number(catalogProduct.price) : (parseFloat(item.Total) || 0);
                                    return {
                                        id: catalogProduct ? catalogProduct.id : `OTRO-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
                                        name: name,
                                        quantity: quantity,
                                        price: price,
                                        originalPrice: price
                                    };
                                }
                                return null;
                            }).filter(Boolean);
                        }

                        // Parsear mecánicos (separados por comas) -> map nombres a ids
                        let mecanicosIds = [];
                        if (item.Mecánicos) {
                            const mecanicosNombres = String(item.Mecánicos).split(',');
                            mecanicosNombres.forEach(nombreRaw => {
                                const nombre = String(nombreRaw || '').trim();
                                if (!nombre) return;
                                let mecanico = (app.data.mecanicosData||[]).find(m => String(m.nombre).trim().toLowerCase() === nombre.toLowerCase());
                                if (!mecanico) {
                                    // Crear nuevo mecanico y asignar id
                                    const nextIdNum = (app.data.nextMecanicoId || 1);
                                    const newId = `MEC-${String(nextIdNum).padStart(3,'0')}`;
                                    mecanico = { id: newId, nombre: nombre, especialidad: '', estado: 'activo', servicios: 0 };
                                    app.data.mecanicosData = app.data.mecanicosData || [];
                                    app.data.mecanicosData.push(mecanico);
                                    // actualizar contador
                                    app.data.nextMecanicoId = nextIdNum + 1;
                                }
                                mecanicosIds.push(mecanico.id);
                            });
                        }

                        // Parsear métodos de pago (flexible)
                        let metodosPago = [];
                        if (item['Métodos de Pago']) {
                            const metodosStr = String(item['Métodos de Pago']);
                            const metodosArray = metodosStr.split(',');
                            metodosPago = metodosArray.map(metodoStr => {
                                // acepta formatos como "Método: S/ 12.50" o "Método: 12.50"
                                const s = metodoStr.trim();
                                const m1 = s.match(/(.+):\s*S?\/?\s*([\d.,]+)$/);
                                if (m1) {
                                    return { metodo: m1[1].trim(), monto: parseFloat(String(m1[2]).replace(/,/g, '')) || 0 };
                                }
                                return null;
                            }).filter(Boolean);
                        }
                        if (!metodosPago.length) {
                            metodosPago = [{ metodo: 'Efectivo', monto: parseFloat(item.Total) || 0 }];
                        }

                        // Normalizar fecha y tipo
                        const fechaNorm = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(item.Fecha || '') : (item.Fecha || '');
                        const tipoNorm = (item.Tipo || item.Tipo || '').toString().trim().toUpperCase() || 'VENTA';

                        // ID único: usar ID de sheet si existe, sino generar uno
                        let recId = item.ID || null;
                        if (!recId) {
                            recId = app.registroUtils && typeof app.registroUtils.generarIdUnico === 'function'
                                ? app.registroUtils.generarIdUnico(fechaNorm || app.setCurrentDate(), item.Placa || '', app.data.registerData)
                                : (`IMP-${Date.now()}-${Math.random().toString(36).slice(2,5)}`);
                        }

                        // Asegurar que fecha esté en formato yyyy-mm-dd y agregar createdAt (ISO datetime)
                        const fechaIso = fechaNorm || app.setCurrentDate();
                        const createdAt = (function() {
                            // Si item trae hora en formato reconocible, usarla; sino usar mediodía local para conservar el día
                            try {
                                const d = new Date(item.Fecha);
                                if (!isNaN(d.getTime())) return d.toISOString();
                            } catch(e) {}
                            // fallback a ahora
                            return new Date().toISOString();
                        })();

                        const nuevoRegistro = {
                            id: recId,
                            fecha: fechaIso,
                            createdAt: createdAt,
                            tipo: tipoNorm,
                            placa: item.Placa || '',
                            cliente: item.Cliente || '',
                            productos: productos,
                            mecanicos: mecanicosIds,
                            total: parseFloat(item.Total) || (productos.reduce((s,p)=>s+(p.price*p.quantity),0) || 0),
                            metodosPago: metodosPago,
                            descripcion: item.Descripción || ''
                        };

                        // Insertar o reemplazar por id en app.data.registerData
                        const existIdx = (app.data.registerData||[]).findIndex(r => String(r.id) === String(nuevoRegistro.id));
                        if (existIdx !== -1) {
                            app.data.registerData[existIdx] = { ...app.data.registerData[existIdx], ...nuevoRegistro };
                        } else {
                            app.data.registerData.push(nuevoRegistro);
                        }
                    });
                } catch (err) {
                    console.warn('Error parsing Registros sheet:', err);
                }
            }

            // Procesar hoja de proveedores
            if (workbook.SheetNames.includes('Proveedores')) {
                try {
                    const provSheet = workbook.Sheets['Proveedores'];
                    const provData = XLSX.utils.sheet_to_json(provSheet);
                    app.data.proveedores = provData.map(p => ({ id: p.ID || `PRV-${Date.now()}`, nombre: p.Nombre || 'Sin nombre', contacto: p.Contacto || '' }));
                } catch (err) {
                    console.warn('Error parsing Proveedores sheet:', err);
                }
            }

            // Procesar hoja de compras
            if (workbook.SheetNames.includes('Compras')) {
                try {
                    const comprasSheet = workbook.Sheets['Compras'];
                    const comprasData = XLSX.utils.sheet_to_json(comprasSheet);
                    app.data.compras = comprasData.map(c => ({
                        id: c.ID || `CMP-${Date.now()}`,
                        proveedorId: c.ProveedorId || '',
                        fecha: c.Fecha || app.setCurrentDate(),
                        total: parseFloat(c.Total) || 0,
                        estado: c.Estado || 'pendiente',
                        items: (c.Items || '').split(';').map(s => {
                            const parts = s.split('|');
                            return { id: `IT-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, name: (parts[0]||'').trim(), quantity: parseInt(parts[1])||1, price: parseFloat(parts[2])||0 };
                        }).filter(Boolean)
                    })).map(compra => {
                        // parse pagos si existen
                        const pagosRaw = (comprasData.find(x=>x.ID===compra.id)||{}).Pagos || '';
                        compra.pagos = pagosRaw ? pagosRaw.split(';').map(s => { const p = s.split('|'); return { fecha: p[0], monto: parseFloat(p[1])||0 }; }) : [];
                        compra.deuda = Math.max(0, compra.total - (compra.pagos.reduce((s,p)=>s+(p.monto||0),0) || 0));
                        compra.estado = compra.deuda > 0 ? 'pendiente' : 'pagada';
                        return compra;
                    });
                } catch (err) {
                    console.warn('Error parsing Compras sheet:', err);
                }
            }

            // Procesar hoja de mecánicos
            if (workbook.SheetNames.includes('Mecánicos')) {
                const mecanicosSheet = workbook.Sheets['Mecánicos'];
                const mecanicosData = XLSX.utils.sheet_to_json(mecanicosSheet);
                app.data.mecanicosData = mecanicosData.map(item => ({
                    id: item.ID,
                    nombre: item.Nombre,
                    especialidad: item.Especialidad,
                    estado: item.Estado,
                    servicios: item.Servicios || 0
                }));
            }

            // Actualizar contadores de ID
            app.updateNextIds();

            app.showNotification('Datos importados correctamente desde Excel', 'success');
            app.forceSave();

            // Refrescar las tablas (forzar actualización aunque la pestaña no esté activa)
            try {
                if (typeof app.updateRegisterTable === 'function') app.updateRegisterTable();
            } catch(e) { console.warn('updateRegisterTable failed after import', e); }
            try { if (typeof app.updateCatalogTable === 'function') app.updateCatalogTable(); } catch(e) {}
            try { if (typeof app.updateMecanicosTable === 'function') app.updateMecanicosTable(); } catch(e) {}
        } catch (error) {
            console.error('Error al importar Excel:', error);
            app.showNotification('Error al importar el archivo Excel: ' + error.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
};

// Actualizar los siguientes IDs
app.updateNextIds = function() {
    // Para servicios
    const serviceIds = this.data.catalogData
        .filter(p => p.id.startsWith('SERV-'))
        .map(p => parseInt(p.id.replace('SERV-', '')))
        .filter(id => !isNaN(id));
    this.data.nextServiceId = serviceIds.length > 0 ? Math.max(...serviceIds) + 1 : 1;

    // Para repuestos
    const partIds = this.data.catalogData
        .filter(p => p.id.startsWith('REP-'))
        .map(p => parseInt(p.id.replace('REP-', '')))
        .filter(id => !isNaN(id));
    this.data.nextPartId = partIds.length > 0 ? Math.max(...partIds) + 1 : 1;

    // Para consumibles
    const consumableIds = this.data.catalogData
        .filter(p => p.id.startsWith('CONS-'))
        .map(p => parseInt(p.id.replace('CONS-', '')))
        .filter(id => !isNaN(id));
    this.data.nextConsumableId = consumableIds.length > 0 ? Math.max(...consumableIds) + 1 : 1;

    // Para mecánicos
    const mecanicoIds = this.data.mecanicosData
        .map(m => parseInt(m.id.replace('MEC-', '')))
        .filter(id => !isNaN(id));
    this.data.nextMecanicoId = mecanicoIds.length > 0 ? Math.max(...mecanicoIds) + 1 : 1;
};