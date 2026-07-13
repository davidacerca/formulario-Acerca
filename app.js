document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE ELEMENTOS ---
    const loginScreen = document.getElementById('login-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const step1Screen = document.getElementById('step1-screen');
    const step2Screen = document.getElementById('step2-screen');
    const loteViewScreen = document.getElementById('lote-view-screen');
    const managerScreen = document.getElementById('manager-screen');
    
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const step1Form = document.getElementById('step1-form');
    const incDate = document.getElementById('inc-date');
    const incCity = document.getElementById('inc-city');
    const incDept = document.getElementById('inc-dept');
    const candidatesMassiveForm = document.getElementById('candidates-massive-form');
    const dynamicCandidatesRows = document.getElementById('dynamic-candidates-rows');
    const dniMultipleUploader = document.getElementById('dni-multiple-uploader');
    
    const lotesTableBody = document.getElementById('lotes-table-body');
    const viewCandidatesTableBody = document.getElementById('view-candidates-table-body');
    const managerGlobalTableBody = document.getElementById('manager-global-table-body');
    
    const summaryWeekLabel = document.getElementById('summary-week-label');
    const summaryCityLabel = document.getElementById('summary-city-label');
    const summaryDeptLabel = document.getElementById('summary-dept-label');
    const viewWeekTitle = document.getElementById('view-week-title');
    const viewLoteSubtitle = document.getElementById('view-lote-subtitle');

    const logoutBtn = document.getElementById('logout-btn');
    const exitManagerBtn = document.getElementById('exit-manager-btn');
    const goToStep1Btn = document.getElementById('go-to-step1-btn');
    const cancelToMenuBtn = document.getElementById('cancel-to-menu-btn');
    const backToStep1Btn = document.getElementById('back-to-step1-btn');
    const backToLotesListBtn = document.getElementById('back-to-lotes-list-btn');
    const addManualRowBtn = document.getElementById('add-manual-row-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');

    // --- 2. CONFIGURACIÓN DE ESTADO LOCAL ---
    let currentUser = sessionStorage.getItem('acerca_user') || '';
    let loteEnCreacion = null; 
    let listaCandidatosTemp = []; 
    let indexObsActivoTemp = null; // Guarda temporalmente a quién le estamos editando la observación

    let baseDatosLotes = JSON.parse(localStorage.getItem('acerca_lotes_erp')) || [];

    // --- 3. CÁLCULO DE SEMANA AUTOMÁTICA ---
    function obtenerNumeroSemana(fechaStr) {
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return "";
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const añoInicio = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - añoInicio) / 86400000) + 1) / 7);
    }

    // --- 4. CONTROL DE SESIONES AL REFRESCAR (F5) ---
    if (currentUser) {
        loginScreen.classList.remove('active');
        if (currentUser === 'SUPERVISORACERCA') {
            renderSupervisorScreen();
            managerScreen.classList.add('active');
        } else {
            renderMainMenu();
            mainMenuScreen.classList.add('active');
        }
    }

    // --- 5. CONTROL DE ACCESOS (UNIFICADO MINÚSCULAS) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputUser = usernameInput.value.trim();
        const inputUserLower = inputUser.toLowerCase();

        if (inputUser.toUpperCase() === 'SUPERVISORACERCA') {
            currentUser = 'SUPERVISORACERCA';
            sessionStorage.setItem('acerca_user', currentUser);
            renderSupervisorScreen();
            changeScreen(loginScreen, managerScreen);
        } else if (['acerc@sara', 'acerc@david', 'acerc@angel'].includes(inputUserLower)) {
            currentUser = inputUserLower;
            sessionStorage.setItem('acerca_user', currentUser);
            renderMainMenu();
            changeScreen(loginScreen, mainMenuScreen);
        } else {
            alert('Acceso Denegado. Introduce un usuario autorizado (Acerc@sara, Acerc@david, Acerc@angel) o el código Gestor.');
        }
    });

    function cerrarSesion() {
        sessionStorage.removeItem('acerca_user');
        currentUser = '';
        usernameInput.value = '';
    }
    logoutBtn.addEventListener('click', () => { cerrarSesion(); changeScreen(mainMenuScreen, loginScreen); });
    exitManagerBtn.addEventListener('click', () => { cerrarSesion(); changeScreen(managerScreen, loginScreen); });

    // --- 6. PASO 1: PARÁMETROS DEL LOTE ---
    goToStep1Btn.addEventListener('click', () => {
        incDate.value = ''; incCity.value = ''; incDept.value = '';
        changeScreen(mainMenuScreen, step1Screen);
    });

    cancelToMenuBtn.addEventListener('click', () => { changeScreen(step1Screen, mainMenuScreen); });

    step1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const numSemana = obtenerNumeroSemana(incDate.value);
        
        loteEnCreacion = {
            semanaNum: numSemana,
            fecha: incDate.value,
            ciudad: incCity.value,
            departamento: incDept.value
        };

        summaryWeekLabel.textContent = numSemana;
        summaryCityLabel.textContent = incCity.value;
        summaryDeptLabel.textContent = incDept.value;

        listaCandidatosTemp = [];
        agregarNuevaFilaCandidato();
        changeScreen(step1Screen, step2Screen);
    });

    backToStep1Btn.addEventListener('click', () => { changeScreen(step2Screen, step1Screen); });

    // --- 7. CARGA MASIVA MULTIDOCUMENTO LIMPIA (SIN EJEMPLOS) ---
    dniMultipleUploader.addEventListener('change', (e) => {
        const archivos = Array.from(e.target.files);
        if (archivos.length === 0) return;

        if (listaCandidatosTemp.length === 1 && listaCandidatosTemp[0].nombre === '') {
            listaCandidatosTemp = [];
        }

        archivos.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                listaCandidatosTemp.push({
                    id: 'cand_' + Date.now() + '_' + index,
                    nombre: '',
                    dni: '',
                    fechaNacimiento: '',
                    telefono: '',
                    email: '',
                    turno: 'Mañana',
                    jornada: '40h',
                    observaciones: '',
                    documentoB64: event.target.result 
                });
                rebuilCandidatesMassiveTable();
            };
            reader.readAsDataURL(file);
        });
        dniMultipleUploader.value = '';
    });

    addManualRowBtn.addEventListener('click', () => { agregarNuevaFilaCandidato(); });

    function agregarNuevaFilaCandidato() {
        listaCandidatosTemp.push({
            id: 'cand_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            nombre: '', dni: '', fechaNacimiento: '', telefono: '', email: '',
            turno: 'Mañana', jornada: '40h', observaciones: '', documentoB64: null
        });
        rebuilCandidatesMassiveTable();
    }

    // --- 8. RECONSTRUCCIÓN DINÁMICA DE LA TABLA MULTI-ALTA ---
    function rebuilCandidatesMassiveTable() {
        dynamicCandidatesRows.innerHTML = '';

        listaCandidatosTemp.forEach((cand, index) => {
            const tr = document.createElement('tr');
            
            const btnObsClass = cand.observaciones ? 'btn-obs btn-obs-view' : 'btn-obs btn-obs-add';
            const btnObsText = cand.observaciones ? 'ver comentario' : '+ añadir comentario';

            tr.innerHTML = `
                <td><input type="text" value="${cand.nombre}" class="input-table row-nombre" data-index="${index}" placeholder="Nombre completo" required></td>
                <td><input type="text" value="${cand.dni}" class="input-table row-dni" data-index="${index}" placeholder="DNI o NIE" required></td>
                <td><input type="date" value="${cand.fechaNacimiento}" class="input-table row-fecha" data-index="${index}" required></td>
                <td><input type="tel" value="${cand.telefono}" class="input-table row-tel" data-index="${index}" placeholder="600000000" required></td>
                <td><input type="email" value="${cand.email}" class="input-table row-email" data-index="${index}" placeholder="correo@ejemplo.com" required></td>
                <td>
                    <select class="input-table row-turno" data-index="${index}">
                        <option value="Mañana" ${cand.turno === 'Mañana' ? 'selected' : ''}>Mañana</option>
                        <option value="Tarde" ${cand.turno === 'Tarde' ? 'selected' : ''}>Tarde</option>
                    </select>
                </td>
                <td>
                    <select class="input-table row-jornada" data-index="${index}">
                        <option value="20h" ${cand.jornada === '20h' ? 'selected' : ''}>20h</option>
                        <option value="25h" ${cand.jornada === '25h' ? 'selected' : ''}>25h</option>
                        <option value="30h" ${cand.jornada === '30h' ? 'selected' : ''}>30h</option>
                        <option value="35h" ${cand.jornada === '35h' ? 'selected' : ''}>35h</option>
                        <option value="40h" ${cand.jornada === '40h' ? 'selected' : ''}>40h</option>
                    </select>
                </td>
                <td style="text-align:center; white-space:nowrap;">
                    ${cand.documentoB64 ? `<span class="badge view-doc-btn" data-base64="${cand.documentoB64}" style="cursor:pointer; background-color:#333; padding:4px 6px;">👁️ Ver DNI</span>` : `<span style="font-size:11px; color:#999;">Sin Doc</span>`}
                    <button type="button" class="btn-delete-row" data-index="${index}" style="background:none; border:none; color:red; cursor:pointer; margin-left:5px;">✕</button>
                </td>
                <td style="text-align:center;">
                    <button type="button" class="${btnObsClass} edit-obs-trigger" data-index="${index}">${btnObsText}</button>
                </td>
            `;
            dynamicCandidatesRows.appendChild(tr);
        });

        // Eventos en caliente para sincronizar entradas
        document.querySelectorAll('.row-nombre').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].nombre = e.target.value; }));
        document.querySelectorAll('.row-dni').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].dni = e.target.value; }));
        document.querySelectorAll('.row-fecha').forEach(i => i.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].fechaNacimiento = e.target.value; }));
        document.querySelectorAll('.row-tel').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].telefono = e.target.value; }));
        document.querySelectorAll('.row-email').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].email = e.target.value; }));
        document.querySelectorAll('.row-turno').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].turno = e.target.value; }));
        document.querySelectorAll('.row-jornada').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].jornada = e.target.value; }));
        
        document.querySelectorAll('.btn-delete-row').forEach(b => b.addEventListener('click', e => {
            listaCandidatosTemp.splice(e.target.closest('.btn-delete-row').dataset.index, 1);
            rebuilCandidatesMassiveTable();
        }));

        // Disparador del Pop-up modal de observaciones
        document.querySelectorAll('.edit-obs-trigger').forEach(b => b.addEventListener('click', e => {
            indexObsActivoTemp = e.target.dataset.index;
            obsModalTextarea.value = listaCandidatosTemp[indexObsActivoTemp].observaciones || '';
            obsModal.classList.add('active');
        }));
    }

    // --- 9. MODAL DE OBSERVACIONES (LÓGICA DE GUARDADO INTERNO) ---
    const obsModal = document.getElementById('obs-modal');
    const obsModalTextarea = document.getElementById('obs-modal-textarea');
    const closeObsModalBtn = document.getElementById('close-obs-modal-btn');
    const saveObsModalBtn = document.getElementById('save-obs-modal-btn');

    saveObsModalBtn.addEventListener('click', () => {
        if (indexObsActivoTemp !== null) {
            listaCandidatosTemp[indexObsActivoTemp].observaciones = obsModalTextarea.value.trim();
            obsModal.classList.remove('active');
            indexObsActivoTemp = null;
            rebuilCandidatesMassiveTable(); // Redibujar para alternar estados visuales de los botones
        }
    });
    closeObsModalBtn.addEventListener('click', () => obsModal.classList.remove('active'));

    // --- 10. ALMACENAMIENTO FINAL DEL LOTE ---
    candidatesMassiveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (listaCandidatosTemp.length === 0) return alert('Añada un candidato como mínimo.');

        baseDatosLotes.push({
            id: 'lote_' + Date.now(),
            responsable: currentUser,
            semana: loteEnCreacion.semanaNum,
            fecha: loteEnCreacion.fecha,
            ciudad: loteEnCreacion.ciudad,
            departamento: loteEnCreacion.departamento,
            candidatos: [...listaCandidatosTemp]
        });

        localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));
        alert('¡Lote guardado correctamente!');
        renderMainMenu();
        changeScreen(step2Screen, mainMenuScreen);
    });

    // --- 11. RENDERS GENERALES (MENÚS Y DETALLES) ---
    function renderMainMenu() {
        lotesTableBody.innerHTML = '';
        const lotesUsuario = baseDatosLotes.filter(l => l.responsable === currentUser);

        if (lotesUsuario.length === 0) {
            lotesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:20px;">No registras ningún lote de incorporaciones activo.</td></tr>`;
            return;
        }

        lotesUsuario.forEach(lote => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="bold-text">Semana ${lote.semana}</td>
                <td>${lote.ciudad}</td>
                <td>${lote.departamento}</td>
                <td><button class="btn-primary" style="padding:4px 8px; font-size:12px;">📁 Ver Candidatos</button></td>
            `;
            tr.addEventListener('click', () => verDetalleDeLote(lote.id));
            lotesTableBody.appendChild(tr);
        });
    }

    function verDetalleDeLote(loteId) {
        const lote = baseDatosLotes.find(l => l.id === loteId);
        if (!lote) return;

        viewWeekTitle.textContent = lote.semana;
        viewLoteSubtitle.textContent = `Sede: ${lote.ciudad} | Departamento: ${lote.departamento} | Responsable: ${lote.responsable}`;
        viewCandidatesTableBody.innerHTML = '';

        lote.candidatos.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="bold-text">${c.nombre}</td>
                <td>${lote.ciudad}</td>
                <td>${lote.departamento}</td>
                <td><span class="badge" style="background-color:#444;">${c.turno}</span></td>
                <td><strong>${c.jornada}</strong></td>
                <td>${c.email}</td>
                <td>${c.telefono}</td>
                <td style="text-align:center;">
                    ${c.documentoB64 ? `<button class="btn-secondary view-doc-btn" data-base64="${c.documentoB64}" style="padding:4px 8px; font-size:12px;">👁️ Ver</button>` : `<span style="color:#aaa; font-size:12px;">Sin Doc</span>`}
                </td>
                <td style="text-align:center;">
                    ${c.observaciones ? `<button class="btn-obs btn-obs-view read-only-obs" data-txt="${c.observaciones}">ver comentario</button>` : `<span style="color:#aaa; font-size:12px;">Sin obs</span>`}
                </td>
            `;
            viewCandidatesTableBody.appendChild(tr);
        });

        // Evento de lectura modal de observaciones ya fijadas
        document.querySelectorAll('.read-only-obs').forEach(b => b.addEventListener('click', e => {
            obsModalTextarea.value = e.target.dataset.txt;
            obsModal.classList.add('active');
        }));

        const origen = currentUser === 'SUPERVISORACERCA' ? managerScreen : mainMenuScreen;
        changeScreen(origen, loteViewScreen);
        backToLotesListBtn.onclick = function() { changeScreen(loteViewScreen, origen); };
    }

    function renderSupervisorScreen() {
        managerGlobalTableBody.innerHTML = '';
        if (baseDatosLotes.length === 0) {
            managerGlobalTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">No existen lotes grabados en la plataforma.</td></tr>`;
            return;
        }

        baseDatosLotes.forEach(lote => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="highlight" style="padding:2px 6px;">${lote.responsable}</span></td>
                <td class="bold-text">Semana ${lote.semana}</td>
                <td>${lote.ciudad}</td>
                <td>${lote.departamento}</td>
                <td style="text-align:center;"><strong>${lote.candidatos.length}</strong> incorporaciones</td>
                <td style="text-align:center;">
                    <button class="btn-primary open-lote-btn" style="padding:4px 8px; font-size:12px; background-color:#0b5ca3;">Revisar</button>
                    <button class="delete-lote-btn" style="background:none; border:none; font-size:16px; cursor:pointer; margin-left:10px;">🗑️</button>
                </td>
            `;
            tr.querySelector('.open-lote-btn').addEventListener('click', () => verDetalleDeLote(lote.id));
            tr.querySelector('.delete-lote-btn').addEventListener('click', () => {
                if(confirm('¿Deseas eliminar este lote de forma irreversible?')){
                    baseDatosLotes = baseDatosLotes.filter(l => l.id !== lote.id);
                    localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));
                    renderSupervisorScreen();
                }
            });
            managerGlobalTableBody.appendChild(tr);
        });
    }

    // --- 12. POP-UP VISOR DE DNI ---
    const documentModal = document.getElementById('document-modal');
    const modalDocumentRender = document.getElementById('modal-document-render');
    const closeModalBtn = document.getElementById('close-modal-btn');

    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.view-doc-btn');
        if (targetBtn) {
            const b64 = targetBtn.getAttribute('data-base64');
            if (b64) {
                modalDocumentRender.innerHTML = `<img src="${b64}" alt="Documento" style="max-width:100%; max-height:400px; border-radius:4px;">`;
                documentModal.classList.add('active');
            }
        }
    });
    closeModalBtn.addEventListener('click', () => documentModal.classList.remove('active'));

    // --- 13. EXPORTACIONES EXCEL ---
    exportExcelBtn.addEventListener('click', () => {
        let rowsAplanadas = [];
        baseDatosLotes.forEach(l => {
            l.candidatos.forEach(c => {
                rowsAplanadas.push({
                    'Responsable': l.responsable, 'Semana': 'Semana ' + l.semana, 'Sede': l.ciudad, 'Departamento': l.departamento,
                    'Nombre': c.nombre, 'DNI / NIE': c.dni, 'Nacimiento': c.fechaNacimiento, 'Teléfono': c.telefono, 'Email': c.email,
                    'Turno': c.turno, 'Jornada': c.jornada, 'Observaciones': c.observaciones
                });
            });
        });
        if(rowsAplanadas.length === 0) return alert('Sin datos.');
        const hoja = XLSX.utils.json_to_sheet(rowsAplanadas);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Altas");
        XLSX.writeFile(libro, "ERP_Incorporaciones_Acerca.xlsx");
    });

    function changeScreen(remove, active) { remove.classList.remove('active'); active.classList.add('active'); }
});