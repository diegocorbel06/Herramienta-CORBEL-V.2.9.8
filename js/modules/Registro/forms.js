// Funciones relacionadas con formularios de registro (módulo separado)
(function(){
    // Agregar formulario de registro dinámicamente
    app.addRegisterForm = function() {
        const newFormId = this.data.nextFormId || (this.data.currentRegisterForms + 1);
        const tabsContainer = document.getElementById('register-tabs');
        if (!tabsContainer) return;
        const newTab = document.createElement('div');
        newTab.className = 'register-tab';
        newTab.setAttribute('data-form-id', newFormId);
        newTab.innerHTML = `
            <span>Registro ${newFormId}</span>
            <span class="close-tab" onclick="event.stopPropagation();app.closeRegisterTab(${newFormId})">×</span>
        `;
        newTab.addEventListener('click', () => this.activarPestañaRegistro(newFormId));
        tabsContainer.appendChild(newTab);

        const formsContainer = document.getElementById('register-form-container');
        const templateForm = document.getElementById('register-form-1');
        const newForm = document.createElement('div');
        newForm.className = 'register-form';
        newForm.id = `register-form-${newFormId}`;

        if (templateForm) {
            const clone = templateForm.cloneNode(true);
            clone.classList.remove('active');
            clone.id = `register-form-${newFormId}`;
            clone.querySelectorAll('[id]').forEach(el => {
                if (el.id && el.id.endsWith('-1')) el.id = el.id.replace(/-1$/, `-${newFormId}`);
            });
            clone.querySelectorAll('label[for]').forEach(l => {
                if (l.getAttribute('for') && l.getAttribute('for').endsWith('-1')) {
                    l.setAttribute('for', l.getAttribute('for').replace(/-1$/, `-${newFormId}`));
                }
            });
            const attrsToFix = ['onclick','oninput','onchange','onblur','onkeydown'];
            clone.querySelectorAll('*').forEach(el => {
                attrsToFix.forEach(attr => {
                    const v = el.getAttribute && el.getAttribute(attr);
                    if (v && typeof v === 'string' && v.includes('(1)')) el.setAttribute(attr, v.replace(/\(1\)/g, `(${newFormId})`));
                    if (v && typeof v === 'string' && v.includes('-1')) el.setAttribute(attr, v.replace(/-1/g, `-${newFormId}`));
                });
            });
            newForm.innerHTML = clone.innerHTML;
            const tempTitleMatch = newForm.querySelector('h4'); if (tempTitleMatch) tempTitleMatch.textContent = `Registro ${newFormId}`;
        } else {
            newForm.innerHTML = `<p>Formulario ${newFormId} - plantilla no encontrada</p>`;
        }

        formsContainer.appendChild(newForm);
        this.data.currentRegisterForms = (this.data.currentRegisterForms || 0) + 1;
        this.data.nextFormId = newFormId + 1;
        setTimeout(() => this.loadMecanicoOptionsForForm(newFormId), 0);
        setTimeout(() => this.initializeRegisterForm(newFormId), 0);
        const prodContainer = document.getElementById(`productos-seleccionados-container-${newFormId}`);
        if (prodContainer) prodContainer.classList.add('hidden');
        const pagoTotal = document.getElementById(`pago-total-${newFormId}`);
        if (pagoTotal) pagoTotal.textContent = 'Total: S/ 0.00';
        this.activarPestañaRegistro(newFormId);
        const formEl = document.getElementById(`register-form-${newFormId}`);
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    app.initializeRegisterForm = function(formId) {
        const form = document.getElementById(`register-form-${formId}`);
        if (!form) return;
        const prodSearch = document.getElementById(`reg-producto-search-${formId}`);
        const prodOptions = document.getElementById(`reg-producto-options-${formId}`);
        if (prodSearch) {
            prodSearch.oninput = () => app.filterProductOptions(formId);
            prodSearch.addEventListener('focus', () => { if (prodOptions) { prodOptions.classList.remove('hidden'); prodOptions.style.display = 'block'; } });
        }
        try {
            const addButtons = Array.from(form.querySelectorAll('button'));
            addButtons.forEach(btn => {
                const onclickAttr = btn.getAttribute && btn.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes('addProductToSelection')) { btn.onclick = null; btn.addEventListener('click', () => app.addProductToSelection(formId)); }
                if (onclickAttr && onclickAttr.includes('addProductoPersonalizado')) { btn.onclick = null; btn.addEventListener('click', () => app.addProductoPersonalizado(formId)); }
                if (onclickAttr && onclickAttr.includes('addGastoToSelection')) { btn.onclick = null; btn.addEventListener('click', () => app.addGastoToSelection(formId)); }
                if (onclickAttr && onclickAttr.includes('addPaymentMethod')) { btn.onclick = null; btn.addEventListener('click', () => app.addPaymentMethod(formId)); }
                if (onclickAttr && onclickAttr.includes("document.getElementById('reg-mecanico-search-")) {
                    btn.onclick = null;
                    btn.addEventListener('click', () => { const inp = document.getElementById(`reg-mecanico-search-${formId}`); if (inp) inp.focus(); });
                }
            });
        } catch (e) { console.warn('initializeRegisterForm - error al enlazar botones', e); }
        // Vincular el botón principal de guardar por data-role para evitar colisiones con clones
        const saveBtn = document.querySelector(`#register-form-${formId} [data-role='save-register']`);
        if (saveBtn) {
            saveBtn.removeAttribute('onclick');
            saveBtn.addEventListener('click', () => app.addRegister(formId));
        }
        // Vincular botón para agregar mecanicos desde select multiple
        const addMecBtn = document.querySelector(`#register-form-${formId} [data-role='add-mecanico']`);
        if (addMecBtn) {
            addMecBtn.addEventListener('click', () => app.addMecanicoToSelection(formId));
        }
        const mecSearch = document.getElementById(`reg-mecanico-search-${formId}`);
        const mecOptions = document.getElementById(`reg-mecanico-options-${formId}`);
    if (mecSearch) { mecSearch.oninput = () => app.filterMecanicoOptions(formId); mecSearch.addEventListener('focus', () => { if (mecOptions) { mecOptions.classList.remove('hidden'); mecOptions.style.display = 'block'; } }); }
    // Inicializar autocomplete de gastos para el formulario (vincula datalist y comportamiento)
    try { if (typeof app.initGastoAutocompleteForForm === 'function') app.initGastoAutocompleteForForm(formId); } catch(e) {}
    if (prodOptions) prodOptions.classList.add('hidden');
    if (mecOptions) mecOptions.classList.add('hidden');
    };

    // Las funciones de carga/filtrado/selección de mecánicos se implementan en registro.js
    // Aquí sólo delegamos a esas implementaciones si existen.
    app.loadMecanicoOptionsForForm = function(formId) { if (typeof app.loadMecanicoOptionsForForm === 'function' && app.loadMecanicoOptionsForForm !== arguments.callee) return; };
    app.filterMecanicoOptions = function(formId) { if (typeof app.filterMecanicoOptions === 'function' && app.filterMecanicoOptions !== arguments.callee) return; };
    app.selectMecanicoOption = function(formId, mecanicoId) { if (typeof app.selectMecanicoOption === 'function' && app.selectMecanicoOption !== arguments.callee) return; };
    app.renderMecanicoTagsForForm = function(formId) { if (typeof app.renderMecanicoTagsForForm === 'function' && app.renderMecanicoTagsForForm !== arguments.callee) return; };

})();
