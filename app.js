document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELECCIÓN DE PANTALLAS ---
    const loginScreen = document.getElementById('login-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const step1Screen = document.getElementById('step1-screen');
    const step2Screen = document.getElementById('step2-screen');
    const loteViewScreen = document.getElementById('lote-view-screen');
    const managerScreen = document.getElementById('manager-screen');
    
    // Formularios e inputs
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const step1Form = document.getElementById('step1-form');
    const incDate = document.getElementById('inc-date');
    const incCity = document.getElementById('inc-city');
    const incDept = document.getElementById('inc-dept');
    const candidatesMassiveForm = document.getElementById('candidates-massive-form');
    const dynamicCandidatesRows = document.getElementById('dynamic-candidates-rows');
    const dniMultipleUploader = document.getElementById('dni-multiple-uploader');
    const loteComment = document.getElementById('lote-comment');
    
    // Componentes de datos
    const lotesTableBody = document.getElementById('lotes-table-body');
    const viewCandidatesTableBody = document.getElementById('view-candidates-table-body');
    const managerGlobalTableBody = document.getElementById('manager-global-table-body');
    
    // Labels informativas
    const summaryWeekLabel = document.getElementById('summary-week-label');
    const summaryCityLabel = document.getElementById('summary-city-label');
    const summaryDeptLabel = document.getElementById('summary-dept-label');
    const viewWeekTitle = document.getElementById('view-week-title');
    const viewLoteSubtitle = document.getElementById('view-lote-subtitle');
    const viewCommentBox = document.getElementById('view-comment-box');
    const viewCommentText = document.getElementById('view-comment-text');

    // Botones de control
    const logoutBtn = document.getElementById('logout-btn');
    const exitManagerBtn = document.getElementById('exit-manager-btn');
    const goToStep1Btn = document.getElementById('go-to-step1-btn');
    const cancelToMenuBtn = document.getElementById('cancel-to-menu-btn');
    const backToStep1Btn = document.getElementById('back-to-step1-btn');
    const backToLotesListBtn = document.getElementById('back-to-lotes-list-btn');
    const addManualRowBtn = document.getElementById('add-manual-row-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');

    // --- 2. CONFIGURACIÓN DE VARIABLES DE ESTADO ---
    let currentUser = sessionStorage.getItem('acerca_user') || '';
    let loteEnCreacion = null; // Guardará de forma temporal las variables del paso 1
    let listaCandidatosTemp = []; // Lista reactiva de la pantalla de carga masiva

    // Base de datos local unificada
    let baseDatosLotes = JSON.parse(localStorage.getItem('acerca_lotes_erp')) || [];

    // --- 3. CÁLCULO AUTOMÁTICO DE SEMANA (ISO-8601) ---
    function obtenerNumeroSemana(fechaStr) {
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return "";
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const añoInicio = new Date(d.getFullYear(), 0, 1);
        const numeroSemana = Math.ceil((((d - añoInicio) / 86400000) + 1) / 7);
        return numeroSemana;
    }

    // --- 4. PERSISTENCIA Y PERSISTENCIA AL REFRESCAR (F5) ---
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

    // --- 5. CONTROL DE ACCESOS (AUTENTICACIÓN RESTRINGIDA) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputUser = usernameInput.value.trim();
        const inputUserLower = inputUser.toLowerCase();

        // Validaciones de credenciales exactas solicitadas
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
            alert('Acceso Denegado. Por favor introduzca un usuario autorizado de Selección (Acerc@sara, Acerc@david, Acerc@angel) o el código Gestor.');
        }
    });

    function cerrarSesion() {
        sessionStorage.removeItem('acerca_user');
        currentUser = '';
        usernameInput.value = '';
    }

    logoutBtn.addEventListener('click', () => { cerrarSesion(); changeScreen(mainMenuScreen, loginScreen); });
    exitManagerBtn.addEventListener('click', () => { cerrarSesion(); changeScreen(managerScreen, loginScreen); });

    // --- 6. FLUJO DEL ALTA: PASO 1 (PARÁMETROS) ---
    goToStep1Btn.addEventListener('click', () => {
        incDate.value = '';
        incCity.value = '';
        incDept.value = '';
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

        // Rellenar etiquetas dinámicas
        summaryWeekLabel.textContent = numSemana;
        summaryCityLabel.textContent = incCity.value;
        summaryDeptLabel.textContent = incDept.value;

        // Resetear tabla temporal de carga de candidatos
        listaCandidatosTemp = [];
        dynamicCandidatesRows.innerHTML = '';
        loteComment.value = '';

        // Añadir una primera fila manual por defecto
        agregarNuevaFilaCandidato();

        changeScreen(step1Screen, step2Screen);
    });

    backToStep1Btn.addEventListener('click', () => { changeScreen(step2Screen, step1Screen); });

    // --- 7. CARGA MASIVA MULTIDOCUMENTO E INTELIGENCIA OCR ---
    dniMultipleUploader.addEventListener('change', (e) => {
        const archivos = Array.from(e.target.files);
        if (archivos.length === 0) return;

        // Limpiamos la fila vacía si no se ha modificado aún
        if (listaCandidatosTemp.length === 1 && listaCandidatosTemp[0].nombre === '') {
            listaCandidatosTemp = [];
        }

        archivos.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;

                // SIMULACIÓN DE DETECCIÓN Y SEPARACIÓN DE DOCUMENTOS DISTINTOS
                // Extraemos datos simulados basados en el nombre de archivo o cadenas aleatorias para emular el OCR
                const nombresSimulados = ["Francisco Javier Rodríguez", "Daniel Sánchez Domínguez", "Rafael Coll Díaz", "Nuria Roldán López", "María Gabriela Fuenmayor"];
                const dniSimulados = ["45983214A", "28471092B", "71948203C", "39481029D", "02938102E"];
                const fechasSimuladas = ["1994-05-12", "1991-11-23", "1988-02-14", "1996-08-09", "1993-12-02"];

                const randIdx = Math.floor(Math.random() * nombresSimulados.length);

                const nuevoCandidato = {
                    id: 'cand_' + Date.now() + '_' + index,
                    nombre: nombresSimulados[randIdx] + ' (Detectado)',
                    dni: dniSimulados[randIdx],
                    fechaNacimiento: fechasSimuladas[randIdx],
                    telefono: '',
                    email: '',
                    turno: 'Mañana',
                    jornada: '40h',
                    documentoB64: base64Data 
                };

                listaCandidatosTemp.push(nuevoCandidato);
                rebuilCandidatesMassiveTable();
            };
            reader.readAsDataURL(file);
        });
        
        // Limpiar el value para permitir volver a subir el mismo archivo
        dniMultipleUploader.value = '';
    });

    addManualRowBtn.addEventListener('click', () => {
        agregarNuevaFilaCandidato();
    });

    function agregarNuevaFilaCandidato() {
        listaCandidatosTemp.push({
            id: 'cand_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            nombre: '',
            dni: '',
            fechaNacimiento: '',
            telefono: '',
            email: '',
            turno: 'Mañana',
            jornada: '40h',
            documentoB64: null
        });
        rebuilCandidatesMassiveTable();
    }

    // --- 8. RECONSTRUCCIÓN DINÁMICA DE LA TABLA DE CARGA MASIVA ---
    function rebuilCandidatesMassiveTable() {
        dynamicCandidatesRows.innerHTML = '';

        listaCandidatosTemp.forEach((cand, index) => {
            const tr = document.createElement('tr');
            
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
                <td style="text-align:center;">
                    ${cand.documentoB64 ? `<span class="badge view-doc-btn" data-base64="${cand.documentoB64}" style="cursor:pointer; background-color:#0b5ca3;">👁️ Ver DNI</span>` : `<span style="font-size:11px; color:#999;">Sin Doc</span>`}
                    <button type="button" class="btn-delete-row" data-index="${index}" style="background:none; border:none; color:red; cursor:pointer; margin-left:8px;">✕</button>
                </td>
            `;
            dynamicCandidatesRows.appendChild(tr);
        });

        // Vinculamos eventos de escucha inmediatos para actualizar el estado temporal al teclear
        document.querySelectorAll('.row-nombre').forEach(input => input.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].nombre = e.target.value; }));
        document.querySelectorAll('.row-dni').forEach(input => input.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].dni = e.target.value; }));
        document.querySelectorAll('.row-fecha').forEach(input => input.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].fechaNacimiento = e.target.value; }));
        document.querySelectorAll('.row-tel').forEach(input => input.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].telefono = e.target.value; }));
        document.querySelectorAll('.row-email').forEach(input => input.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].email = e.target.value; }));
        document.querySelectorAll('.row-turno').forEach(select => select.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].turno = e.target.value; }));
        document.querySelectorAll('.row-jornada').forEach(select => select.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].jornada = e.target.value; }));
        
        // Botón de eliminar fila individual
        document.querySelectorAll('.btn-delete-row').forEach(btn => btn.addEventListener('click', e => {
            const idx = e.target.closest('.btn-delete-row').dataset.index;
            listaCandidatosTemp.splice(idx, 1);
            rebuilCandidatesMassiveTable();
        }));
    }

    // --- 9. GUARDAR LOTE EN EL HISTÓRICO GLOBAL ---
    candidatesMassiveForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (listaCandidatosTemp.length === 0) {
            alert('Debes añadir al menos un candidato para poder registrar el lote.');
            return;
        }

        // Construimos la estructura final del lote agrupado
        const nuevoLoteCompleto = {
            id: 'lote_' + Date.now(),
            responsable: currentUser,
            semana: loteEnCreacion.semanaNum,
            fecha: loteEnCreacion.fecha,
            ciudad: loteEnCreacion.ciudad,
            departamento: loteEnCreacion.departamento,
            comentariosGenerales: loteComment.value.trim(),
            candidatos: [...listaCandidatosTemp]
        };

        baseDatosLotes.push(nuevoLoteCompleto);
        localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));

        alert('¡Lote de incorporaciones guardado de forma permanente!');
        renderMainMenu();
        changeScreen(step2Screen, mainMenuScreen);
    });

    // --- 10. RENDER DE VISTAS (MENÚ PRINCIPAL DE LOTES) ---
    function renderMainMenu() {
        lotesTableBody.innerHTML = '';
        // Sincronización instantánea leyendo de memoria activa
        const lotesUsuario = baseDatosLotes.filter(l => l.responsable === currentUser);

        if (lotesUsuario.length === 0) {
            lotesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:20px;">No registras ningún lote de incorporaciones activo.</td></tr>`;
            return;
        }

        lotesUsuario.forEach(lote => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
                <td class="bold-text">Semana ${lote.semana}</td>
                <td>${lote.ciudad}</td>
                <td>${lote.departamento}</td>
                <td><button class="btn-primary open-lote-btn" data-id="${lote.id}" style="padding:4px 8px; font-size:12px;">📁 Ver Candidatos</button></td>
            `;
            
            // Si hacen clic en la fila completa o en el botón, los lleva a ver los candidatos detallados (Croquis 2)
            tr.addEventListener('click', (e) => {
                verDetalleDeLote(lote.id);
            });
            lotesTableBody.appendChild(tr);
        });
    }

    // --- 11. VISTA DE DETALLE DE UN LOTE SELECCIONADO (CROQUIS 2) ---
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
            `;
            viewCandidatesTableBody.appendChild(tr);
        });

        if (lote.comentariosGenerales) {
            viewCommentBox.style.display = 'block';
            viewCommentText.textContent = lote.comentariosGenerales;
        } else {
            viewCommentBox.style.display = 'none';
        }

        // Saltamos de pantalla según la jerarquía de roles
        const origen = currentUser === 'SUPERVISORACERCA' ? managerScreen : mainMenuScreen;
        changeScreen(origen, loteViewScreen);
        
        // Guardamos el retorno dinámico en el botón de atrás
        backToLotesListBtn.onclick = function() {
            changeScreen(loteViewScreen, origen);
        };
    }

    // --- 12. MODO GESTOR / PANEL DE SUPERVISIÓN GLOBAL ---
    function renderSupervisorScreen() {
        managerGlobalTableBody.innerHTML = '';

        if (baseDatosLotes.length === 0) {
            managerGlobalTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">No existen lotes grabados en el sistema por ningún departamento.</td></tr>`;
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
                    <button class="btn-primary open-lote-btn" data-id="${lote.id}" style="padding:4px 8px; font-size:12px; background-color:#0b5ca3;">👁️ Revisar</button>
                    <button class="delete-lote-btn" data-id="${lote.id}" style="background:none; border:none; font-size:16px; cursor:pointer; margin-left:10px;">🗑️</button>
                </td>
            `;

            // Botón revisar lote completo
            tr.querySelector('.open-lote-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                verDetalleDeLote(lote.id);
            });

            // Botón borrar irreversible en tiempo real (Sincronización mutua)
            tr.querySelector('.delete-lote-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm('¿Estás seguro de que deseas eliminar este lote de incorporaciones por completo? Esta acción lo borrará de los perfiles de selección al instante.')){
                    baseDatosLotes = baseDatosLotes.filter(l => l.id !== lote.id);
                    localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));
                    renderSupervisorScreen();
                }
            });

            managerGlobalTableBody.appendChild(tr);
        });
    }

    // --- 13. VENTANA FLOTANTE PARA VER EL DNI (MODAL 👁️) ---
    const documentModal = document.getElementById('document-modal');
    const modalDocumentRender = document.getElementById('modal-document-render');
    const closeModalBtn = document.getElementById('close-modal-btn');

    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.view-doc-btn');
        if (targetBtn) {
            e.stopPropagation();
            const b64 = targetBtn.getAttribute('data-base64');
            if (b64) {
                modalDocumentRender.innerHTML = `<img src="${b64}" alt="DNI / NIE" style="max-width:100%; max-height:400px; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.2);">`;
                documentModal.classList.add('active');
            }
        }
    });

    closeModalBtn.addEventListener('click', () => documentModal.classList.remove('active'));
    documentModal.addEventListener('click', (e) => { if (e.target === documentModal) documentModal.classList.remove('active'); });

    // --- 14. INFORME INTEGRAL EXCEL ---
    exportExcelBtn.addEventListener('click', () => {
        let rowsAplanadas = [];
        
        baseDatosLotes.forEach(l => {
            l.candidatos.forEach(c => {
                rowsAplanadas.push({
                    'Responsable Selección': l.responsable,
                    'Semana Incorporación': 'Semana ' + l.semana,
                    'Fecha Alta': l.fecha,
                    'Sede / Oficina': l.ciudad,
                    'Departamento': l.departamento,
                    'Nombre Candidato': c.nombre,
                    'DNI / NIE': c.dni,
                    'Fecha Nacimiento': c.fechaNacimiento,
                    'Teléfono': c.telefono,
                    'Email': c.email,
                    'Turno': c.turno,
                    'Jornada': c.jornada,
                    'Comentarios Lote': l.comentariosGenerales
                });
            });
        });

        if(rowsAplanadas.length === 0){
            alert('No hay datos disponibles para exportar.');
            return;
        }

        const hoja = XLSX.utils.json_to_sheet(rowsAplanadas);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Altas RRHH");
        XLSX.writeFile(libro, "ERP_Incorporaciones_Acerca.xlsx");
    });

    // Utilidad de cambio de pantallas
    function changeScreen(screenToRemove, screenToActive) {
        screenToRemove.classList.remove('active');
        screenToActive.classList.add('active');
    }
});