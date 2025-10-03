// Funciones relacionadas con la renderización y actualización de la tabla de registros
(function(){
    function elementIsInsideTable(el) {
        if (!el) return false;
        // prefer closest if available
        if (typeof el.closest === 'function') {
            const table = el.closest && el.closest('#register-table');
            if (table) return true;
        }
        // fallback: walk up parentNode chain
        let p = el.parentNode;
        while (p) {
            if ((p.id && p.id === 'register-table') || (p.tagName && p.tagName.toLowerCase() === 'table')) return true;
            p = p.parentNode;
        }
        return false;
    }

    function getTbody() {
        // Preferir un tbody con id específico sólo si está dentro de la tabla
        const byId = document.getElementById('register-table-body');
        if (byId && elementIsInsideTable(byId)) return byId;

        // Luego intentar el selector dentro de la tabla
        const sel = document.querySelector('#register-table tbody');
        if (sel) return sel;

        // Si existe la tabla pero no el tbody, crear uno y anexarlo (y darle id para futuras referencias)
        const table = document.querySelector('#register-table');
        if (table && typeof table.appendChild === 'function') {
            const tbody = document.createElement('tbody');
            tbody.id = 'register-table-body';
            table.appendChild(tbody);
            return tbody;
        }

        // Como fallback crear un contenedor temporal en document y devolverlo
        const tmp = document.createElement('tbody');
        tmp.id = 'register-table-body';
        // si document.body existe, anexarlo para que querySelector posteriores lo encuentren
        if (document.body && typeof document.body.appendChild === 'function') {
            document.body.appendChild(tmp);
        } else if (document._elements) {
            // en mocks sencillos: almacenar en el map interno
            document._elements['register-table-body'] = tmp;
        }
        return tmp;
    }

    app.updateRegisterTable = function() {
        const tableBody = getTbody();
        if (!tableBody) return 0;
        const registros = (this.data && this.data.registerData) || [];

        // Preservar scroll para evitar saltos
        let container = tableBody.parentElement || tableBody;
        let prevScroll = 0;
        try { prevScroll = container.scrollTop || 0; } catch (e) { prevScroll = 0; }

        // Ordenar por createdAt (si existe) o por fecha. Respetar preferencia en app.data.registerSortDesc
        const desc = (app && app.data && typeof app.data.registerSortDesc !== 'undefined') ? !!app.data.registerSortDesc : true;
        const ordenados = (registros||[]).slice().sort((a,b) => {
            const ta = a && a.createdAt ? new Date(a.createdAt).getTime() : (a && a.fecha ? new Date(a.fecha).getTime() : 0);
            const tb = b && b.createdAt ? new Date(b.createdAt).getTime() : (b && b.fecha ? new Date(b.fecha).getTime() : 0);
            return desc ? (tb - ta) : (ta - tb);
        });

        // Construir filas; preferir fragmento DOM si está disponible, sino generar HTML string (fallback para mocks)
        const canFragment = (typeof document.createDocumentFragment === 'function');
        let rowsHtml = [];
        const frag = canFragment ? document.createDocumentFragment() : null;
        ordenados.forEach((r, idx) => {
            const productosTexto = (r.productos||[]).map(p => `${p.name} x${p.quantity}`).join(', ');
            // Obtener nombres robustamente (acepta ids, nombres o incluso objetos)
            const nombresMecanicos = (typeof app.obtenerNombresMecanicos === 'function') ?
                app.obtenerNombresMecanicos(r.mecanicos || []).join(', ') :
                (r.mecanicos||[]).map(id => { const m = (app.data && app.data.mecanicosData) ? app.data.mecanicosData.find(x => String(x.id) === String(id)) : null; return m ? m.nombre : id; }).join(', ');
            const cantidad = (r.productos||[]).reduce((s,p)=>s+(p.quantity||0),0);
            if (canFragment) {
                const tr = document.createElement('tr'); if (typeof tr.setAttribute === 'function') tr.setAttribute('data-registro-id', r.id || `r-${idx}`);
                tr.innerHTML = `
                    <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(r.fecha) : r.fecha || ''}</td>
                    <td>${r.tipo || '-'}</td>
                    <td>${r.id || ''}</td>
                    <td>${r.placa || ''}</td>
                    <td>${r.modelo || ''}</td>
                    <td>${r.cliente || ''}</td>
                    <td>${productosTexto}</td>
                    <td>${nombresMecanicos}</td>
                    <td>${cantidad}</td>
                    <td>${(typeof r.total !== 'undefined') ? `S/ ${Number(r.total).toFixed(2)}` : '-'}</td>
                    <td>${(r.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
                    <td>
                        <button class="btn btn-icon" onclick="app.editarRegistro('${r.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${r.id}')"><i class="fas fa-receipt"></i></button>
                        <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${r.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                frag.appendChild(tr);
            } else {
                rowsHtml.push(`
                    <tr data-registro-id="${r.id || `r-${idx}`}">
                        <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(r.fecha) : r.fecha || ''}</td>
                        <td>${r.tipo || '-'}</td>
                        <td>${r.id || ''}</td>
                        <td>${r.placa || ''}</td>
                        <td>${r.modelo || ''}</td>
                        <td>${r.cliente || ''}</td>
                        <td>${productosTexto}</td>
                        <td>${nombresMecanicos}</td>
                        <td>${cantidad}</td>
                        <td>${(typeof r.total !== 'undefined') ? `S/ ${Number(r.total).toFixed(2)}` : '-'}</td>
                        <td>${(r.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
                        <td>
                            <button class="btn btn-icon" onclick="app.editarRegistro('${r.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${r.id}')"><i class="fas fa-receipt"></i></button>
                            <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${r.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `);
            }
        });

        // Reemplazar children usando el camino más adecuado
        try {
            if (canFragment) {
                if (typeof tableBody.replaceChildren === 'function') tableBody.replaceChildren(frag);
                else { tableBody.innerHTML = ''; tableBody.appendChild(frag); }
            } else {
                tableBody.innerHTML = rowsHtml.join('');
            }
        } catch (e) {
            try { if (canFragment) { tableBody.innerHTML = ''; tableBody.appendChild(frag); } else { tableBody.innerHTML = rowsHtml.join(''); } } catch (e2) { console.warn('updateRegisterTable render failed', e2); }
        }

        // Restaurar scroll
        try { container.scrollTop = prevScroll; } catch (e) {}
        return ordenados.length;
    };

    app.updateRegisterTableFiltered = function(registros) {
        const tableBody = getTbody(); if (!tableBody) return 0;

        // Preservar scroll
        const container = tableBody.parentElement || tableBody;
        let prevScroll = 0; try { prevScroll = container.scrollTop || 0; } catch (e) { prevScroll = 0; }

        // Ordenar registros filtrados por same criterio (respecting registerSortDesc)
        const descFiltered = (app && app.data && typeof app.data.registerSortDesc !== 'undefined') ? !!app.data.registerSortDesc : true;
        const ordenados = (registros||[]).slice().sort((a,b) => {
            const ta = a && a.createdAt ? new Date(a.createdAt).getTime() : (a && a.fecha ? new Date(a.fecha).getTime() : 0);
            const tb = b && b.createdAt ? new Date(b.createdAt).getTime() : (b && b.fecha ? new Date(b.fecha).getTime() : 0);
            return descFiltered ? (tb - ta) : (ta - tb);
        });

        const frag = document.createDocumentFragment();
        ordenados.forEach((registro, idx) => {
            const productosTexto = (registro.productos||[]).map(p=>`${p.name} x${p.quantity}`).join(', ');
            const nombresMecanicos = (typeof app.obtenerNombresMecanicos === 'function') ?
                app.obtenerNombresMecanicos(registro.mecanicos || []).join(', ') :
                (registro.mecanicos||[]).map(id => { const m = (app.data&&app.data.mecanicosData)?app.data.mecanicosData.find(x=>String(x.id)===String(id)):null; return m?m.nombre:id; }).join(', ');
            const cantidad = (registro.productos||[]).reduce((s,p)=>s+(p.quantity||0),0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${(app.registroUtils && typeof app.registroUtils.toDisplayDate === 'function') ? app.registroUtils.toDisplayDate(registro.fecha) : registro.fecha || ''}</td>
                <td>${registro.tipo || '-'}</td>
                <td>${registro.id || ''}</td>
                <td>${registro.placa || ''}</td>
                <td>${registro.modelo || ''}</td>
                <td>${registro.cliente || ''}</td>
                <td>${productosTexto}</td>
                <td>${nombresMecanicos}</td>
                <td>${cantidad}</td>
                <td>${(typeof registro.total !== 'undefined') ? `S/ ${Number(registro.total).toFixed(2)}` : '-'}</td>
                <td>${(registro.metodosPago||[]).map(m => `${m.metodo}: S/ ${Number(m.monto||0).toFixed(2)}`).join(', ')}</td>
                <td>
                    <button class="btn btn-icon" onclick="app.editarRegistro('${registro.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-icon" onclick="app.previewReceiptFromRegistro('${registro.id}')"><i class="fas fa-receipt"></i></button>
                    <button class="btn btn-danger btn-icon" onclick="app.eliminarRegistro('${registro.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            frag.appendChild(tr);
        });

        try { if (typeof tableBody.replaceChildren === 'function') tableBody.replaceChildren(frag); else { tableBody.innerHTML=''; tableBody.appendChild(frag); } } catch(e) { tableBody.innerHTML=''; tableBody.appendChild(frag); }
        try { container.scrollTop = prevScroll; } catch(e){}
        return ordenados.length;
    };

    app.highlightRowById = function(registroId) {
        try {
            const row = document.querySelector(`[data-registro-id='${registroId}']`);
            if (!row) return;
            row.classList.add('highlight-row');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => row.classList.remove('highlight-row'), 2400);
        } catch (e) { console.warn('highlightRowById error', e); }
    };

})();
