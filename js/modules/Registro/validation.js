// =============================================
// ARCHIVO: js/modules/registro/validation.js
// Validaciones para el módulo de registro
// =============================================

app.registroValidations = {
    // Validar formato de placa de vehículo
    validarPlaca: function(placa) {
        // La placa ahora es opcional en el flujo principal; si está vacía, pasar la validación
        if (!placa || placa.trim() === '') {
            return { valido: true, mensaje: '' };
        }
        // Formato: 3-4 letras + 3-4 números, opcional guión
        const placaRegex = /^[A-Za-z]{2,4}-?\d{3,4}$/;
        if (!placaRegex.test(placa.toUpperCase())) {
            // No bloquear el guardado por formato de placa: devolver aviso (warning) opcional
            return { valido: true, mensaje: '', warning: 'Formato de placa inválido. Ejemplo: ABC123 o ABC-123.' };
        }
        return { valido: true, mensaje: '' };
    },

    // Validar formato de fecha
    validarFecha: function(fecha) {
        if (!fecha) return { valido: false, mensaje: 'La fecha es requerida' };

        // Aceptar formatos: YYYY-MM-DD, DD/MM/YYYY, timestamp
        let fechaObj = null;
        if (typeof fecha === 'number') {
            fechaObj = new Date(fecha);
        } else if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
            fechaObj = new Date(fecha);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
            // dd/mm/yyyy -> yyyy-mm-dd
            const parts = fecha.split('/');
            fechaObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            fechaObj = new Date(fecha);
        }

        if (!(fechaObj instanceof Date) || isNaN(fechaObj.getTime())) {
            return { valido: false, mensaje: 'Formato de fecha inválido' };
        }

        const hoy = new Date();
        // Normalizar horas para comparar solo fecha
        fechaObj.setHours(0,0,0,0);
        hoy.setHours(0,0,0,0);

        if (fechaObj > hoy) return { valido: false, mensaje: 'La fecha no puede ser futura' };
        if (fechaObj < new Date('2000-01-01')) return { valido: false, mensaje: 'La fecha es demasiado antigua' };
        return { valido: true, mensaje: '' };
    },

    // Validar cliente
    validarCliente: function(cliente) {
        // Cliente opcional: no bloquear si está vacío
        if (!cliente || cliente.trim() === '') {
            return { valido: true, mensaje: '' };
        }
        // No bloquear por nombre corto/largo: convertirlo en advertencia no bloqueante.
        if (cliente.length < 2) {
            return { valido: true, mensaje: '', warning: 'El nombre del cliente es muy corto.' };
        }
        if (cliente.length > 100) {
            return { valido: true, mensaje: '', warning: 'El nombre del cliente es muy largo.' };
        }
        return { valido: true, mensaje: '' };
    },

    // Validar productos seleccionados
    validarProductos: function(productos) {
        if (!productos || productos.length === 0) {
            return { valido: false, mensaje: 'Debe seleccionar al menos un producto o servicio.' };
        }
        for (let producto of productos) {
            if (producto.quantity <= 0) {
                return { valido: false, mensaje: `La cantidad de ${producto.name} debe ser mayor a 0.` };
            }
            if (producto.price < 0) {
                return { valido: false, mensaje: `El precio de ${producto.name} no puede ser negativo.` };
            }
        }
        return { valido: true, mensaje: '' };
    },

    // Validar métodos de pago
    validarMetodosPago: function(metodosPago, totalVenta) {
        if (!metodosPago || metodosPago.length === 0) return { valido: false, mensaje: 'Debe especificar al menos un método de pago.' };
        let totalPagos = 0;
        for (let metodo of metodosPago) {
            // Validar estructura
            if (!metodo || typeof metodo.monto === 'undefined') return { valido: false, mensaje: 'Método de pago inválido.' };
            const monto = parseFloat(metodo.monto);
            if (isNaN(monto) || monto < 0) return { valido: false, mensaje: `El monto de ${metodo.metodo || 'desconocido'} debe ser un número >= 0.` };
            totalPagos += monto;
        }
        // Permitir pequeña diferencia por redondeo
        const diff = totalPagos - (parseFloat(totalVenta) || 0);
        if (diff < -0.01) {
            return { valido: false, mensaje: `La suma de pagos (S/ ${totalPagos.toFixed(2)}) es menor que el total de la venta (S/ ${(parseFloat(totalVenta)||0).toFixed(2)})` };
        }
        // Si es mayor por más de 0.01, advertir (puede ser propina o error)
        if (diff > 0.01) {
            return { valido: false, mensaje: `La suma de pagos (S/ ${totalPagos.toFixed(2)}) excede el total de la venta (S/ ${(parseFloat(totalVenta)||0).toFixed(2)})` };
        }
        return { valido: true, mensaje: '' };
    },

    // Validación completa del registro
    validarRegistroCompleto: function(registroData) {
        const validaciones = [];
        const warnings = [];

        // Validar fecha
        validaciones.push(this.validarFecha(registroData.fecha));

        // Validar tipo
        if (!registroData.tipo) {
            validaciones.push({ valido: false, mensaje: 'El tipo es requerido' });
        }

        // Validaciones específicas para ventas
            if (registroData.tipo === 'VENTA') {
            // Permitir ventas sin vehículo cuando se indique el flag
            if (!registroData.sinVehiculo) {
                    const v = this.validarPlaca(registroData.placa);
                    if (v && v.warning) warnings.push({ field: 'placa', message: v.warning });
                    else validaciones.push(v);
            }
            // Cliente ahora opcional: validar solo si fue provisto
            if (registroData.cliente && String(registroData.cliente).trim() !== '') {
                validaciones.push(this.validarCliente(registroData.cliente));
            }
            validaciones.push(this.validarProductos(registroData.productos));
            validaciones.push(this.validarMetodosPago(registroData.metodosPago, registroData.total));
                // Si el usuario seleccionó 'Otro' como modelo y no especificó, emitir advertencia no bloqueante
                try {
                    if (registroData.modelo === 'Otro' && (!registroData.modeloOtro || String(registroData.modeloOtro).trim() === '')) {
                        warnings.push({ field: 'modelo-otro', message: 'Modelo especificado como "Otro" pero no se proporcionó detalle.' });
                    }
                } catch(e) {}
        }
        
        // Validaciones para gastos
        if (registroData.tipo === 'GASTO') {
            if (registroData.total <= 0) {
                validaciones.push({ valido: false, mensaje: 'El monto del gasto debe ser mayor a 0' });
            }
        }
        
        // Encontrar primer error
        const error = validaciones.find(v => !v.valido);
        if (error) return error;
        return { valido: true, mensaje: '', warnings: warnings };
    }
};