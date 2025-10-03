// =============================================
// ARCHIVO: js/modules/resumen.js
// Módulo de Resumen
// =============================================

/**
 * Módulo de Resumen
 * Muestra resumen gráfico y tabular de ventas y gastos, productos más vendidos y gastos principales.
 */

app.resumenData = {
    periodo: 'mes', // 'dia', 'semana', 'mes', 'personalizado'
    fechaDesde: null,
    fechaHasta: null,
    resumen: {},
    productosTop: [],
    gastosTop: []
};

app.getResumenHTML = function() {
    return `<div class="card">
        <div class="card-header">
            <h3><i class="fas fa-chart-bar"></i> Resumen</h3>
        </div>
        <div id="resumen-notification" class="notification"></div>
        <div class="form-row">
            <div class="form-group">
                <label for="resumen-periodo">Periodo</label>
                <select id="resumen-periodo" onchange="app.cambiarPeriodoResumen()">
                    <option value="dia">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes" selected>Este mes</option>
                    <option value="personalizado">Personalizado</option>
                </select>
            </div>
            <div class="form-group" id="resumen-fechas" aria-hidden="true" hidden>
                <label for="resumen-desde">Desde</label>
                <input type="date" id="resumen-desde">
                <label for="resumen-hasta">Hasta</label>
                <input type="date" id="resumen-hasta">
                <button class="btn" onclick="app.calcularResumenPersonalizado()"><i class="fas fa-filter"></i> Filtrar</button>
            </div>
        </div>
        <div id="resumen-tabla"></div>
        <div id="resumen-productos-top"></div>
        <div id="resumen-gastos-top"></div>
    </div>`;
};

app.initResumenTab = function() {
    console.log('Pestaña de resumen inicializada');
    app.calcularResumen();
};

app.cambiarPeriodoResumen = function() {
    const periodo = document.getElementById('resumen-periodo').value;
    app.resumenData.periodo = periodo;
    if (periodo === 'personalizado') {
        document.getElementById('resumen-fechas').style.display = '';
    } else {
        document.getElementById('resumen-fechas').style.display = 'none';
        app.calcularResumen();
    }
};

app.calcularResumenPersonalizado = function() {
    app.resumenData.fechaDesde = document.getElementById('resumen-desde').value;
    app.resumenData.fechaHasta = document.getElementById('resumen-hasta').value;
    app.calcularResumen();
};

app.calcularResumen = function() {
    // Filtrar registros según periodo
    let registros = [...app.data.registerData];
    const hoy = new Date();
    if (app.resumenData.periodo === 'dia') {
        registros = registros.filter(r => {
            const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(r.fecha) : r.fecha.split('/').reverse().join('-');
            const d = new Date(iso);
            return d.toDateString() === hoy.toDateString();
        });
    } else if (app.resumenData.periodo === 'semana') {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        registros = registros.filter(r => {
            const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(r.fecha) : r.fecha.split('/').reverse().join('-');
            const d = new Date(iso);
            return d >= inicioSemana;
        });
    } else if (app.resumenData.periodo === 'mes') {
        registros = registros.filter(r => {
            const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(r.fecha) : r.fecha.split('/').reverse().join('-');
            const d = new Date(iso);
            return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
        });
    } else if (app.resumenData.periodo === 'personalizado') {
        const desde = new Date(app.resumenData.fechaDesde);
        const hasta = new Date(app.resumenData.fechaHasta);
        hasta.setHours(23,59,59,999);
            registros = registros.filter(r => {
            const iso = (app.registroUtils && typeof app.registroUtils.toInputDate === 'function') ? app.registroUtils.toInputDate(r.fecha) : r.fecha.split('/').reverse().join('-');
            const d = new Date(iso);
            return d >= desde && d <= hasta;
        });
    }

    // Calcular totales
    let totalVentas = 0, totalGastos = 0;
    let productos = {}, gastos = {};
    registros.forEach(r => {
        if (r.tipo === 'VENTA') {
            totalVentas += r.total;
            r.productos.forEach(p => {
                productos[p.name] = (productos[p.name] || 0) + p.quantity;
            });
        }
        if (r.tipo === 'GASTO') {
            totalGastos += r.total;
            r.productos.forEach(p => {
                gastos[p.name] = (gastos[p.name] || 0) + p.quantity;
            });
        }
    });

    // Top productos y gastos
    const productosTop = Object.entries(productos).sort((a,b) => b[1]-a[1]).slice(0,5);
    const gastosTop = Object.entries(gastos).sort((a,b) => b[1]-a[1]).slice(0,5);

    app.resumenData.resumen = { totalVentas, totalGastos };
    app.resumenData.productosTop = productosTop;
    app.resumenData.gastosTop = gastosTop;

    app.renderResumenTabla();
    app.renderResumenProductosTop();
    app.renderResumenGastosTop();
};

app.renderResumenTabla = function() {
    const div = document.getElementById('resumen-tabla');
    if (!div) return;
    div.innerHTML = `<div class="resumen-box">
        <strong>Total Ventas:</strong> S/ ${app.resumenData.resumen.totalVentas.toFixed(2)}<br>
        <strong>Total Gastos:</strong> S/ ${app.resumenData.resumen.totalGastos.toFixed(2)}
    </div>`;
};

app.renderResumenProductosTop = function() {
    const div = document.getElementById('resumen-productos-top');
    if (!div) return;
    if (!app.resumenData.productosTop.length) {
        div.innerHTML = '<p>No hay productos vendidos en el periodo.</p>';
        return;
    }
    let html = '<h4>Productos más vendidos</h4><ul>';
    app.resumenData.productosTop.forEach(([name, qty]) => {
        html += `<li>${name}: ${qty} unidades</li>`;
    });
    html += '</ul>';
    div.innerHTML = html;
};

app.renderResumenGastosTop = function() {
    const div = document.getElementById('resumen-gastos-top');
    if (!div) return;
    if (!app.resumenData.gastosTop.length) {
        div.innerHTML = '<p>No hay gastos registrados en el periodo.</p>';
        return;
    }
    let html = '<h4>Gastos principales</h4><ul>';
    app.resumenData.gastosTop.forEach(([name, qty]) => {
        html += `<li>${name}: ${qty} unidades</li>`;
    });
    html += '</ul>';
    div.innerHTML = html;
};