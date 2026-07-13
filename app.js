document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DE PANTALLAS ---
    const loginScreen = document.getElementById('login-screen');
    const userMenuScreen = document.getElementById('user-menu-screen');
    const formStep1Screen = document.getElementById('form-step1-screen');
    const formStep2Screen = document.getElementById('form-step2-screen');
    const step1Screen = document.getElementById('step1-screen');
    const step2Screen = document.getElementById('step2-screen');
    const loteViewScreen = document.getElementById('lote-view-screen');
    const managerScreen = document.getElementById('manager-screen');

    // CONTENEDORES DE VERTICALES INDEPENDIENTES
    const moduloSalaContainer = document.getElementById('modulo-sala-container');
    const moduloRrhhContainer = document.getElementById('modulo-rrhh-container');
    const panelMainTitle = document.getElementById('panel-main-title');

    // MÓDULO CONTROL DIARIO (SALA)
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const displayUserEmail = document.getElementById('display-user-email');
    const userTableBody = document.getElementById('user-table-body');
    const managerTableBody = document.getElementById('manager-table-body');
    const createNewBtn = document.getElementById('create-new-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const backToStep1BtnSala = document.getElementById('back-to-step1-btn-sala');
    const step1FormSala = document.getElementById('step1-form-sala');
    const step2FormSala = document.getElementById('step2-form-sala');
    const formDate = document.getElementById('form-date');
    const formWeek = document.getElementById('form-week');
    const summaryChosenWeek = document.getElementById('summary-chosen-week');
    const calculatedDay = document.getElementById('calculated-day');
    const dayComment = document.getElementById('day-comment');

    // MÓDULO INCORPORACIONES (RRHH)
    const goToStep1Btn = document.getElementById('go-to-step1-btn');
    const cancelToMenuBtn = document.getElementById('cancel-to-menu-btn');
    const step1FormRrhh = document.getElementById('step1-form-rrhh');
    const incDate = document.getElementById('inc-date');
    const incCity = document.getElementById('inc-city');
    const incDept = document.getElementById('inc-dept');
    const candidatesMassiveForm = document.getElementById('candidates-massive-form');
    const dynamicCandidatesRows = document.getElementById('dynamic-candidates-rows');
    const dniMultipleUploader = document.getElementById('dni-multiple-uploader');
    const lotesTableBody = document.getElementById('lotes-table-body');
    const viewCandidatesTableBody = document.getElementById('view-candidates-table-body');
    const summaryWeekLabel = document.getElementById('summary-week-label');
    const summaryCityLabel = document.getElementById('summary-city-label');
    const summaryDeptLabel = document.getElementById('summary-dept-label');
    const viewWeekTitle = document.getElementById('view-week-title');
    const viewLoteSubtitle = document.getElementById('view-lote-subtitle');
    const addManualRowBtn = document.getElementById('add-manual-row-btn');
    const backToStep1BtnRrhh = document.getElementById('back-to-step1-btn-rrhh');
    const backToLotesListBtn = document.getElementById('back-to-lotes-list-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const exitManagerBtn = document.getElementById('exit-manager-btn');

    // --- VARIABLES GLOBALES ---
    let currentUser = sessionStorage.getItem('acerca_user') || '';
    let selectedWeekGlobal = '';
    let selectedDayLetterGlobal = '';
    let loteEnCreacion = null;
    let listaCandidatosTemp = [];
    let indexObsActivoTemp = null;

    // BASES DE DATOS COMPARTIDAS
    let sistemaDatos = JSON.parse(localStorage.getItem('acerca_datos')) || [];
    let baseDatosLotes = JSON.parse(localStorage.getItem('acerca_lotes_erp')) || [];

    // --- MOTOR IA DE SALA ---
    function generarResumenInteligente(comentariosDiccionario) {
        const todoElTexto = Object.values(comentariosDiccionario).join(' ').toLowerCase();
        let parrafo1 = "Durante esta semana, el grupo ha mostrado una evolución positiva y una buena predisposición para aprender. Se han trabajado las bases de la formación, reforzando el conocimiento de los rebates, los textos legales y el uso de las herramientas de trabajo.";
        if (todoElTexto.includes('legal') || todoElTexto.includes('rebate')) {
            parrafo1 = "A lo largo de las jornadas, el equipo se ha concentrado firmemente en el marco formativo avanzado. Destaca la asimilación del argumentario de rebates y la lectura minuciosa de textos legales obligatorios.";
        } else if (todoElTexto.includes('lento') || todoElTexto.includes('sistema')) {
            parrafo1 = "La semana ha estado muy enfocada en superar las barreras iniciales de los sistemas informáticos y flujos de procesos. Aunque la adaptación técnica ha requerido un esfuerzo extra, se ha agilizado la curva de aprendizaje.";
        }
        let parrafo2 = "A nivel comercial, los integrantes han evidenciado potencial para obtener resultados, aunque con diferentes ritmos de aprendizaje. La actitud general ha sido buena.";
        if (todoElTexto.includes('venta') || todoElTexto.includes('cierre')) {
            parrafo2 = "El enfoque comercial de estos días ha arrojado métricas e indicadores de venta muy prometedores. Se percibe un instinto natural hacia el cierre de operaciones.";
        }
        let parrafo3 = "En conjunto, considero que el balance de la semana es positivo. Se trata de un grupo con margen de mejora, pero con implicación. Decido mantener a los integrantes.";
        return `${parrafo1}\n\n${parrafo2}\n\n${parrafo3}`;
    }

    function obtenerNumeroSemana(fechaStr) {
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return "";
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const añoInicio = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - añoInicio) / 86400000) + 1) / 7);
    }

    // --- FILTRADO DE INTERFAZ EXCLUSIVO POR VERTICAL LABORAL ---
    function evaluarVisibilidadModulos() {
        if (!currentUser) return;

        const userLower = currentUser.toLowerCase();

        if (userLower.endsWith('@acerca.info') || userLower.startsWith('acerc@')) {
            // VERTICAL SELECCIÓN DE PERSONAL: ÚNICAMENTE INTERFAZ RRHH
            moduloSalaContainer.style.display = 'none';
            moduloRrhhContainer.style.display = 'block';
            panelMainTitle.textContent = 'Nuevas Incorporaciones';
        } else {
            // VERTICAL VENTAS ORIGINAL: ÚNICAMENTE INTERFAZ SALA
            moduloRrhhContainer.style.display = 'none';
            moduloSalaContainer.style.display = 'block';
            panelMainTitle.textContent = 'Panel de Control — Sala';
        }
    }

    // --- SESIONES ACTIVAS (F5) ---
    if (currentUser) {
        loginScreen.classList.remove('active');
        if (currentUser === 'SUPERVISORACERCA') {
            renderSupervisorScreen();
            managerScreen.classList.add('active');
        } else {
            displayUserEmail.textContent = currentUser;
            evaluarVisibilidadModulos();
            renderUserTable();
            renderMainMenuLotes();
            userMenuScreen.classList.add('active');
        }
    }

    // --- ACCESO CON DISCRIMINACIÓN ESTRICTA ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputUser = usernameInput.value.trim();
        const inputUserLower = inputUser.toLowerCase();

        if (inputUser.toUpperCase() === 'SUPERVISORACERCA') {
            currentUser = 'SUPERVISORACERCA';
            sessionStorage.setItem('acerca_user', currentUser);
            renderSupervisorScreen();
            changeScreen(loginScreen, managerScreen);
        } else if (inputUserLower.endsWith('@acerca.info') || inputUserLower.startsWith('acerc@') || ['sara', 'david', 'angel'].includes(inputUserLower)) {
            // Soporta tanto las cuentas antiguas como los nuevos correos de la vertical de selección
            currentUser = inputUserLower;
            sessionStorage.setItem('acerca_user', currentUser);
            displayUserEmail.textContent = currentUser;
            evaluarVisibilidadModulos();
            renderUserTable();
            renderMainMenuLotes();
            changeScreen(loginScreen, userMenuScreen);
        } else {
            alert('Usuario erróneo');
        }
    });

    function clearSession() { sessionStorage.removeItem('acerca_user'); currentUser = ''; usernameInput.value = ''; }
    logoutBtn.addEventListener('click', () => { clearSession(); changeScreen(userMenuScreen, loginScreen); });
    exitManagerBtn.addEventListener('click', () => { clearSession(); changeScreen(managerScreen, loginScreen); });

    // --- MÓDULO 1: LÓGICA DE SALA ---
    createNewBtn.addEventListener('click', () => { formDate.value = ''; formWeek.value = ''; changeScreen(userMenuScreen, formStep1Screen); });
    backToMenuBtn.addEventListener('click', () => { changeScreen(formStep1Screen, userMenuScreen); });
    backToStep1BtnSala.addEventListener('click', () => { changeScreen(formStep2Screen, formStep1Screen); });

    step1FormSala.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateValue = new Date(formDate.value);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const letrasDias = { 'Lunes':'L', 'Martes':'M', 'Miércoles':'X', 'Jueves':'J', 'Viernes':'V' };
        const diaNombre = diasSemana[dateValue.getDay()];
        
        if (diaNombre === 'Sábado' || diaNombre === 'Domingo') return alert('Selecciona un día laborable de Lunes a Viernes.');

        selectedWeekGlobal = formWeek.value.trim();
        selectedDayLetterGlobal = letrasDias[diaNombre];
        summaryChosenWeek.textContent = `Semana ${selectedWeekGlobal}`;
        calculatedDay.value = diaNombre;
        dayComment.value = '';
        changeScreen(formStep1Screen, formStep2Screen);
    });

    step2FormSala.addEventListener('submit', (e) => {
        e.preventDefault();
        let registroSemana = sistemaDatos.find(d => d.usuario === currentUser && d.semana === selectedWeekGlobal);
        if (!registroSemana) {
            registroSemana = { id: 'id_' + Date.now(), usuario: currentUser, semana: selectedWeekGlobal, resumenIA: 'Incompleto (Faltan días)', comentarios: {} };
            sistemaDatos.push(registroSemana);
        }
        registroSemana.comentarios[selectedDayLetterGlobal] = `${calculatedDay.value}: ${dayComment.value.trim()}`;
        if (Object.keys(registroSemana.comentarios).length === 5) {
            registroSemana.resumenIA = generarResumenInteligente(registroSemana.comentarios);
        }
        localStorage.setItem('acerca_datos', JSON.stringify(sistemaDatos));
        alert('¡Nota guardada correctamente!');
        renderUserTable();
        changeScreen(formStep2Screen, userMenuScreen);
    });

    function renderUserTable() {
        userTableBody.innerHTML = '';
        const misDatos = sistemaDatos.filter(d => d.usuario === currentUser);
        if(!misDatos.length) { userTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#888;">Sin registros de sala.</td></tr>`; return; }
        misDatos.forEach(row => {
            const tr = document.createElement('tr');
            let badges = '';
            ['L', 'M', 'X', 'J', 'V'].forEach(d => {
                badges += row.comentarios?.[d] ? `<span class="badge" data-user="${row.usuario}" data-week="${row.semana}" data-day="${d}">${d}</span>` : `<span class="badge pending">${d}</span>`;
            });
            tr.innerHTML = `<td><b>Semana ${row.semana}</b></td><td><div class="day-badges">${badges}</div></td><td style="font-size:12px; max-width:250px; text-align:justify;">${row.resumenIA.replace(/\n/g, '<br>')}</td>`;
            userTableBody.appendChild(tr);
        });
    }

    // --- MÓDULO 2: LÓGICA DE RRHH ---
    goToStep1Btn.addEventListener('click', () => { incDate.value = ''; incCity.value = ''; incDept.value = ''; changeScreen(userMenuScreen, step1Screen); });
    cancelToMenuBtn.addEventListener('click', () => { changeScreen(step1Screen, userMenuScreen); });
    backToStep1BtnRrhh.addEventListener('click', () => { changeScreen(step2Screen, step1Screen); });

    step1FormRrhh.addEventListener('submit', (e) => {
        e.preventDefault();
        const numSemana = obtenerNumeroSemana(incDate.value);
        loteEnCreacion = { semanaNum: numSemana, fecha: incDate.value, city: incCity.value, dept: incDept.value };
        summaryWeekLabel.textContent = numSemana;
        summaryCityLabel.textContent = incCity.value;
        summaryDeptLabel.textContent = incDept.value;
        listaCandidatosTemp = [];
        agregarNuevaFilaCandidato();
        changeScreen(step1Screen, step2Screen);
    });

    dniMultipleUploader.addEventListener('change', (e) => {
        const archivos = Array.from(e.target.files);
        if (listaCandidatosTemp.length === 1 && listaCandidatosTemp[0].nombre === '') listaCandidatosTemp = [];
        archivos.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                listaCandidatosTemp.push({ id: 'cand_' + Date.now() + '_' + index, nombre: '', dni: '', fechaNacimiento: '', telefono: '', email: '', turno: 'Mañana', jornada: '40h', observaciones: '', documentoB64: event.target.result });
                rebuilCandidatesMassiveTable();
            };
            reader.readAsDataURL(file);
        });
        dniMultipleUploader.value = '';
    });

    addManualRowBtn.addEventListener('click', () => { agregarNuevaFilaCandidato(); });

    function agregarNuevaFilaCandidato() {
        listaCandidatosTemp.push({ id: 'cand_' + Date.now() + '_' + Math.floor(Math.random()*1000), nombre:'', dni:'', fechaNacimiento:'', telefono:'', email:'', turno:'Mañana', jornada:'40h', observaciones:'', documentoB64:null });
        rebuilCandidatesMassiveTable();
    }

    function rebuilCandidatesMassiveTable() {
        dynamicCandidatesRows.innerHTML = '';
        listaCandidatosTemp.forEach((cand, index) => {
            const tr = document.createElement('tr');
            const btnClass = cand.observaciones ? 'btn-obs btn-obs-view' : 'btn-obs btn-obs-add';
            const btnText = cand.observaciones ? 'ver comentario' : '+ añadir comentario';
            tr.innerHTML = `
                <td><input type="text" value="${cand.nombre}" class="input-table row-nombre" data-index="${index}" required></td>
                <td><input type="text" value="${cand.dni}" class="input-table row-dni" data-index="${index}" required></td>
                <td><input type="date" value="${cand.fechaNacimiento}" class="input-table row-fecha" data-index="${index}" required></td>
                <td><input type="tel" value="${cand.telefono}" class="input-table row-tel" data-index="${index}" required></td>
                <td><input type="email" value="${cand.email}" class="input-table row-email" data-index="${index}" required></td>
                <td><select class="input-table row-turno" data-index="${index}"><option value="Mañana" ${cand.turno==='Mañana'?'selected':''}>Mañana</option><option value="Tarde" ${cand.turno==='Tarde'?'selected':''}>Tarde</option></select></td>
                <td><select class="input-table row-jornada" data-index="${index}"><option value="20h" ${cand.jornada==='20h'?'selected':''}>20h</option><option value="40h" ${cand.jornada==='40h'?'selected':''}>40h</option></select></td>
                <td style="text-align:center;">${cand.documentoB64 ? `<span class="badge view-doc-btn" data-base64="${cand.documentoB64}">👁️ Ver</span>` : ''}<button type="button" class="btn-delete-row" data-index="${index}" style="color:red; background:none; border:none; cursor:pointer; margin-left:5px;">✕</button></td>
                <td><button type="button" class="${btnClass} edit-obs-trigger" data-index="${index}">${btnText}</button></td>
            `;
            dynamicCandidatesRows.appendChild(tr);
        });

        document.querySelectorAll('.row-nombre').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].nombre = e.target.value; }));
        document.querySelectorAll('.row-dni').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].dni = e.target.value; }));
        document.querySelectorAll('.row-fecha').forEach(i => i.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].fechaNacimiento = e.target.value; }));
        document.querySelectorAll('.row-tel').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].telefono = e.target.value; }));
        document.querySelectorAll('.row-email').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].email = e.target.value; }));
        document.querySelectorAll('.row-turno').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].turno = e.target.value; }));
        document.querySelectorAll('.row-jornada').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].jornada = e.target.value; }));
        document.querySelectorAll('.btn-delete-row').forEach(b => b.addEventListener('click', e => { listaCandidatosTemp.splice(e.target.closest('.btn-delete-row').dataset.index, 1); rebuilCandidatesMassiveTable(); }));
        document.querySelectorAll('.edit-obs-trigger').forEach(b => b.addEventListener('click', e => { indexObsActivoTemp = e.target.dataset.index; obsModalTextarea.value = listaCandidatosTemp[indexObsActivoTemp].observaciones || ''; obsModal.classList.add('active'); }));
    }

    const obsModal = document.getElementById('obs-modal');
    const obsModalTextarea = document.getElementById('obs-modal-textarea');
    const saveObsModalBtn = document.getElementById('save-obs-modal-btn');
    saveObsModalBtn.addEventListener('click', () => { if (indexObsActivoTemp !== null) { listaCandidatosTemp[indexObsActivoTemp].observaciones = obsModalTextarea.value.trim(); obsModal.classList.remove('active'); rebuilCandidatesMassiveTable(); } });
    document.getElementById('close-obs-modal-btn').addEventListener('click', () => obsModal.classList.remove('active'));

    candidatesMassiveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        baseDatosLotes.push({ id:'lote_'+Date.now(), responsable:currentUser, semana:loteEnCreacion.semanaNum, fecha:loteEnCreacion.fecha, ciudad:loteEnCreacion.city, departamento:loteEnCreacion.dept, candidatos:[...listaCandidatosTemp] });
        localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));
        alert('¡Lote guardado!');
        renderMainMenuLotes();
        changeScreen(step2Screen, userMenuScreen);
    });

    function renderMainMenuLotes() {
        lotesTableBody.innerHTML = '';
        const misLotes = baseDatosLotes.filter(l => l.responsable === currentUser);
        if(!misLotes.length) { lotesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Sin lotes de altas RRHH.</td></tr>`; return; }
        misLotes.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><b>Semana ${l.semana}</b></td><td>${l.ciudad}</td><td>${l.departamento}</td><td><button class="btn-primary" style="padding:4px 8px; font-size:12px; background:#f15a24;">📁 Ver</button></td>`;
            tr.addEventListener('click', () => verDetalleDeLote(l.id));
            lotesTableBody.appendChild(tr);
        });
    }

    function verDetalleDeLote(loteId) {
        const lote = baseDatosLotes.find(l => l.id === loteId);
        if (!lote) return;
        viewWeekTitle.textContent = lote.semana;
        viewLoteSubtitle.textContent = `Sede: ${lote.ciudad} | Departamento: ${lote.departamento}`;
        viewCandidatesTableBody.innerHTML = '';
        lote.candidatos.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><b>${c.nombre}</b></td><td>${lote.ciudad}</td><td>${lote.departamento}</td><td>${c.turno}</td><td>${c.jornada}</td><td>${c.email}</td><td>${c.telefono}</td><td style="text-align:center;">${c.documentoB64?`<button class="btn-secondary view-doc-btn" data-base64="${c.documentoB64}">👁️</button>`:''}</td><td>${c.observaciones?`<button class="btn-obs btn-obs-view read-only-obs" data-txt="${c.observaciones}">ver comentario</button>`:''}</td>`;
            viewCandidatesTableBody.appendChild(tr);
        });
        document.querySelectorAll('.read-only-obs').forEach(b => b.addEventListener('click', e => { obsModalTextarea.value = e.target.dataset.txt; obsModal.classList.add('active'); }));
        const origen = currentUser === 'SUPERVISORACERCA' ? managerScreen : userMenuScreen;
        changeScreen(origen, loteViewScreen);
        backToLotesListBtn.onclick = function() { changeScreen(loteViewScreen, origen); };
    }

    // --- MÓDULO 3: PANEL DEL SUPERVISOR (SÓLO ADMITE HISTORIAL DE VENTAS) ---
    function renderSupervisorScreen() {
        managerTableBody.innerHTML = '';

        if(!sistemaDatos.length) managerTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;">Sin informes de sala.</td></tr>`;
        else {
            sistemaDatos.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${row.usuario}</td><td><b>Semana ${row.semana}</b></td><td>${Object.keys(row.comentarios).length}/5 días</td><td style="font-size:12px; max-width:400px; text-align:justify;">${row.resumenIA.replace(/\n/g,'<br>')}</td><td><button class="delete-sala-btn" style="background:none; border:none; cursor:pointer;">🗑️</button></td>`;
                tr.querySelector('.delete-sala-btn').addEventListener('click', () => { if(confirm('¿Borrar registro de sala?')) { sistemaDatos = sistemaDatos.filter(s => s.id !== row.id); localStorage.setItem('acerca_datos', JSON.stringify(sistemaDatos)); renderSupervisorScreen(); } });
                managerTableBody.appendChild(tr);
            });
        }
    }

    // --- ESCUCHADORES EXTRA DE MODALES Y EXPORTACIÓN ---
    const notesModal = document.getElementById('notes-modal');
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge') && !e.target.classList.contains('pending')) {
            const reg = sistemaDatos.find(d => d.usuario === e.target.dataset.user && d.semana === e.target.dataset.week);
            if (reg?.comentarios?.[e.target.dataset.day]) {
                document.getElementById('modal-day-title').textContent = `Nota del Día — [${e.target.dataset.day}]`;
                document.getElementById('modal-text-content').textContent = reg.comentarios[e.target.dataset.day];
                notesModal.classList.add('active');
            }
        }
    });
    document.getElementById('close-modal-btn').addEventListener('click', () => notesModal.classList.remove('active'));

    const docModal = document.getElementById('document-modal');
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-doc-btn');
        if (btn?.getAttribute('data-base64')) {
            document.getElementById('modal-document-render').innerHTML = `<img src="${btn.getAttribute('data-base64')}" style="max-width:100%; max-height:400px; border-radius:4px;">`;
            docModal.classList.add('active');
        }
    });
    document.getElementById('close-doc-modal-btn').addEventListener('click', () => docModal.classList.remove('active'));

    exportExcelBtn.addEventListener('click', () => {
        let rows = [];
        sistemaDatos.forEach(s => {
            ['L', 'M', 'X', 'J', 'V'].forEach(d => {
                if(s.comentarios[d]){
                    rows.push({ 'Responsable Ventas': s.usuario, 'Semana': s.semana, 'Día': d, 'Anotación Sala': s.comentarios[d], 'Resumen Inteligente de la Semana': s.resumenIA });
                }
            });
        });
        if(!rows.length) return alert('Sin datos de sala que exportar.');
        const hoja = XLSX.utils.json_to_sheet(rows);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Ventas Sala");
        XLSX.writeFile(libro, "Reportes_Ventas_Acerca.xlsx");
    });

    function changeScreen(rem, act) { rem.classList.remove('active'); act.classList.add('active'); }
});