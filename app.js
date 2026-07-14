document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE ELEMENTOS GENERALES ---
    const mainAppContainer = document.getElementById('main-app-container');
    const loginScreen = document.getElementById('login-screen');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const displayActiveUsers = document.querySelectorAll('.display-active-user');

    // MÓDULO VENTAS / SALA ORIGINAL
    const salesMenuScreen = document.getElementById('sales-menu-screen');
    const salesStep1Screen = document.getElementById('sales-step1-screen');
    const salesStep2Screen = document.getElementById('sales-step2-screen');
    const salesTableBody = document.getElementById('sales-table-body');
    const salesStep1Form = document.getElementById('sales-step1-form');
    const salesStep2Form = document.getElementById('sales-step2-form');
    const salesDate = document.getElementById('sales-date');
    const salesWeekInput = document.getElementById('sales-week-input');
    const salesSummaryWeekLabel = document.getElementById('sales-summary-week-label');
    const salesCalcDay = document.getElementById('sales-calc-day');
    const salesDayComment = document.getElementById('sales-day-comment');
    const salesCreateBtn = document.getElementById('sales-create-btn');
    const salesBackMenuBtn = document.getElementById('sales-back-menu-btn');
    const salesBackStep1Btn = document.getElementById('sales-back-step1-btn');
    const salesLogoutBtn = document.getElementById('sales-logout-btn');

    // MÓDULO SELECCIÓN / RRHH (NUEVO)
    const hrMenuScreen = document.getElementById('hr-menu-screen');
    const hrStep1Screen = document.getElementById('hr-step1-screen');
    const hrStep2Screen = document.getElementById('hr-step2-screen');
    const hrLoteViewScreen = document.getElementById('hr-lote-view-screen');
    const hrLotesTableBody = document.getElementById('hr-lotes-table-body');
    const hrStep1Form = document.getElementById('hr-step1-form');
    const hrIncDate = document.getElementById('hr-inc-date');
    const hrIncCity = document.getElementById('hr-inc-city');
    const hrIncDept = document.getElementById('hr-inc-dept');
    const hrCandidatesForm = document.getElementById('hr-candidates-form');
    const hrDynamicRowsContainer = document.getElementById('hr-dynamic-rows-container');
    const hrDniUploader = document.getElementById('hr-dni-uploader');
    const hrSummaryWeekLabel = document.getElementById('hr-summary-week-label');
    const hrSummaryCityLabel = document.getElementById('hr-summary-city-label');
    const hrSummaryDeptLabel = document.getElementById('hr-summary-dept-label');
    const hrViewWeekTitle = document.getElementById('hr-view-week-title');
    const hrViewLoteSubtitle = document.getElementById('hr-view-lote-subtitle');
    const hrViewCandidatesBody = document.getElementById('hr-view-candidates-body');
    const hrGoCreateBtn = document.getElementById('hr-go-create-btn');
    const hrCancelToMenuBtn = document.getElementById('hr-cancel-to-menu-btn');
    const hrAddManualRowBtn = document.getElementById('hr-add-manual-row-btn');
    const hrBackToStep1Btn = document.getElementById('hr-back-to-step1-btn');
    const hrBackToListBtn = document.getElementById('hr-back-to-list-btn');
    const hrLogoutBtn = document.getElementById('hr-logout-btn');

    // MÓDULO SUPERVISOR
    const managerScreen = document.getElementById('manager-screen');
    const managerTableBody = document.getElementById('manager-table-body');
    const managerExportExcelBtn = document.getElementById('manager-export-excel-btn');
    const exitManagerBtn = document.getElementById('exit-manager-btn');

    // --- 2. CONFIGURACIÓN DE ESTADO Y PERSISTENCIA ---
    let currentUser = sessionStorage.getItem('acerca_user') || '';
    let selectedWeekGlobal = '';
    let selectedDayLetterGlobal = '';
    let loteEnCreacion = null;
    let listaCandidatosTemp = [];
    let indexObsActivoTemp = null;

    let sistemaDatos = JSON.parse(localStorage.getItem('acerca_datos')) || [];
    let baseDatosLotes = JSON.parse(localStorage.getItem('acerca_lotes_erp')) || [];

    // --- 3. CONFIGURACIÓN DE CONTENEDORES SEGÚN VERTICAL ---
    function aplicarLayoutPorRol() {
        if (!currentUser) return;
        const userLower = currentUser.toLowerCase();
        
        if (['andresrrhh@acerca.info', 'sararrhh@acerca.info'].includes(userLower)) {
            mainAppContainer.classList.add('full-width-container');
        } else {
            mainAppContainer.classList.remove('full-width-container');
        }
    }

    // --- 4. ENGINE RESUMEN IA ORIGINAL (SALA) ---
    function generarResumenInteligente(comentariosDiccionario) {
        const todoElTexto = Object.values(comentariosDiccionario).join(' ').toLowerCase();
        let p1 = "Durante esta semana, el grupo ha mostrado una evolución positiva y una buena predisposición para aprender. Se han trabajado las bases de la formación, reforzando el conocimiento de los rebates, los textos legales y el uso de las herramientas de trabajo.";
        if (todoElTexto.includes('legal') || todoElTexto.includes('rebate')) {
            p1 = "A lo largo de las jornadas, el equipo se ha concentrado firmemente en el marco formativo avanzado. Destaca la asimilación del argumentario de rebates y la lectura minuciosa de textos legales obligatorios.";
        } else if (todoElTexto.includes('lento') || todoElTexto.includes('sistema')) {
            p1 = "La semana ha estado muy enfocada en superar las barreras iniciales de los sistemas informáticos y flujos de procesos. Aunque la adaptación técnica ha requerido un esfuerzo extra, se ha agilizado la curva de aprendizaje.";
        }
        let p2 = "A nivel comercial, los integrantes han evidenciado potencial para obtener resultados, aunque con diferentes ritmos de aprendizaje. La actitud general ha sido buena.";
        if (todoElTexto.includes('venta') || todoElTexto.includes('cierre')) {
            p2 = "El enfoque comercial de estos días ha arrojado métricas e indicadores de venta muy prometedores. Se percibe un instinto natural hacia el cierre de operaciones.";
        }
        let p3 = "En conjunto, considero que el balance de la semana es positivo. Se trata de un grupo con margen de mejora, pero con implicación. Decido mantener a los integrantes.";
        return `${p1}\n\n${p2}\n\n${p3}`;
    }

    function calcularNumeroSemanaAnio(fechaStr) {
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return "";
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const añoInicio = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - añoInicio) / 86400000) + 1) / 7);
    }

    // --- 5. ENRUTAMIENTO DE SESIONES ACTIVAS (F5) ---
    if (currentUser) {
        loginScreen.classList.remove('active');
        displayActiveUsers.forEach(el => el.textContent = currentUser);
        aplicarLayoutPorRol();

        if (currentUser === 'SUPERVISORACERCA') {
            renderSupervisorScreen();
            managerScreen.classList.add('active');
        } else if (['andresrrhh@acerca.info', 'sararrhh@acerca.info'].includes(currentUser.toLowerCase())) {
            renderHRMainMenu();
            hrMenuScreen.classList.add('active');
        } else {
            renderSalesMainMenu();
            salesMenuScreen.classList.add('active');
        }
    }

    // --- 6. CONTROLADOR DE ACCESO CON ERROR LIMPIO ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputUser = usernameInput.value.trim();
        const inputUserLower = inputUser.toLowerCase();

        if (inputUser.toUpperCase() === 'SUPERVISORACERCA') {
            currentUser = 'SUPERVISORACERCA';
            sessionStorage.setItem('acerca_user', currentUser);
            displayActiveUsers.forEach(el => el.textContent = currentUser);
            aplicarLayoutPorRol();
            renderSupervisorScreen();
            changeScreen(loginScreen, managerScreen);
        } else if (['andresrrhh@acerca.info', 'sararrhh@acerca.info'].includes(inputUserLower)) {
            currentUser = inputUser;
            sessionStorage.setItem('acerca_user', currentUser);
            displayActiveUsers.forEach(el => el.textContent = currentUser);
            aplicarLayoutPorRol();
            renderHRMainMenu();
            changeScreen(loginScreen, hrMenuScreen);
        } else if (inputUserLower.endsWith('@acerca.info')) {
            currentUser = inputUser;
            sessionStorage.setItem('acerca_user', currentUser);
            displayActiveUsers.forEach(el => el.textContent = currentUser);
            aplicarLayoutPorRol();
            renderSalesMainMenu();
            changeScreen(loginScreen, salesMenuScreen);
        } else {
            alert('Usuario erróneo');
        }
    });

    function logoutGral() { sessionStorage.removeItem('acerca_user'); currentUser = ''; usernameInput.value = ''; }
    salesLogoutBtn.addEventListener('click', () => { logoutGral(); changeScreen(salesMenuScreen, loginScreen); });
    hrLogoutBtn.addEventListener('click', () => { logoutGral(); changeScreen(hrMenuScreen, loginScreen); });
    exitManagerBtn.addEventListener('click', () => { logoutGral(); changeScreen(managerScreen, loginScreen); });

    // --- 7. MÓDULO VENTAS / SALA: CONTROL DE ACCIONES ---
    salesCreateBtn.addEventListener('click', () => { salesDate.value = ''; salesWeekInput.value = ''; changeScreen(salesMenuScreen, salesStep1Screen); });
    salesBackMenuBtn.addEventListener('click', () => { changeScreen(salesStep1Screen, salesMenuScreen); });
    salesBackStep1Btn.addEventListener('click', () => { changeScreen(salesStep2Screen, salesStep1Screen); });

    salesStep1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dVal = new Date(salesDate.value);
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const letras = { 'Lunes':'L', 'Martes':'M', 'Miércoles':'X', 'Jueves':'J', 'Viernes':'V' };
        const nameD = dias[dVal.getDay()];

        if (nameD === 'Sábado' || nameD === 'Domingo') return alert('Selecciona un día laborable (Lunes a Viernes).');

        selectedWeekGlobal = salesWeekInput.value.trim();
        selectedDayLetterGlobal = letras[nameD];
        salesSummaryWeekLabel.textContent = `Semana ${selectedWeekGlobal}`;
        salesCalcDay.value = nameD;
        salesDayComment.value = '';
        changeScreen(salesStep1Screen, salesStep2Screen);
    });

    salesStep2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        let rSem = sistemaDatos.find(d => d.usuario === currentUser && d.semana === selectedWeekGlobal);
        if (!rSem) {
            rSem = { id: 'id_' + Date.now(), usuario: currentUser, semana: selectedWeekGlobal, resumenIA: 'Incompleto (Faltan días)', comentarios: {} };
            sistemaDatos.push(rSem);
        }
        rSem.comentarios[selectedDayLetterGlobal] = `${salesCalcDay.value}: ${salesDayComment.value.trim()}`;
        if (Object.keys(rSem.comentarios).length === 5) {
            rSem.resumenIA = generarResumenInteligente(rSem.comentarios);
        }
        localStorage.setItem('acerca_datos', JSON.stringify(sistemaDatos));
        alert('¡Nota guardada correctamente!');
        renderSalesMainMenu();
        changeScreen(salesStep2Screen, salesMenuScreen);
    });

    function renderSalesMainMenu() {
        salesTableBody.innerHTML = '';
        const filtrados = sistemaDatos.filter(d => d.usuario === currentUser);
        if(!filtrados.length) { salesTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#888;">Sin registros de sala.</td></tr>`; return; }
        filtrados.forEach(row => {
            const tr = document.createElement('tr');
            let bgs = '';
            ['L', 'M', 'X', 'J', 'V'].forEach(d => {
                bgs += row.comentarios?.[d] ? `<span class="badge-interactive" data-user="${row.usuario}" data-week="${row.semana}" data-day="${d}">${d}</span>` : `<span class="badge-interactive pending">${d}</span>`;
            });
            tr.innerHTML = `<td><b>Semana ${row.semana}</b></td><td><div class="day-badges">${bgs}</div></td><td style="font-size:12px;text-align:justify;">${row.resumenIA.replace(/\n/g, '<br>')}</td>`;
            salesTableBody.appendChild(tr);
        });
    }

    // --- 8. MÓDULO SELECCIÓN / RRHH: CONTROL DE ACCIONES ---
    hrGoCreateBtn.addEventListener('click', () => { hrIncDate.value = ''; hrIncCity.value = ''; hrIncDept.value = ''; changeScreen(hrMenuScreen, hrStep1Screen); });
    hrCancelToMenuBtn.addEventListener('click', () => { changeScreen(hrStep1Screen, hrMenuScreen); });
    hrBackToStep1Btn.addEventListener('click', () => { changeScreen(hrStep2Screen, hrStep1Screen); });

    hrStep1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const semCalculada = calcularNumeroSemanaAnio(hrIncDate.value);
        loteEnCreacion = { semana: semCalculada, fecha: hrIncDate.value, ciudad: hrIncCity.value, departamento: hrIncDept.value };
        
        hrSummaryWeekLabel.textContent = semCalculada;
        hrSummaryCityLabel.textContent = hrIncCity.value;
        hrSummaryDeptLabel.textContent = hrIncDept.value;

        listaCandidatosTemp = [];
        agregarFilaCandidatoBlanco();
        changeScreen(hrStep1Screen, hrStep2Screen);
    });

    hrDniUploader.addEventListener('change', (e) => {
        const fileList = Array.from(e.target.files);
        if (listaCandidatosTemp.length === 1 && listaCandidatosTemp[0].nombre === '') {
            listaCandidatosTemp = [];
        }

        fileList.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                listaCandidatosTemp.push({
                    id: 'c_' + Date.now() + '_' + idx,
                    nombre: '', dni: '', fechaNacimiento: '', telefono: '', email: '',
                    turno: 'Mañana', jornada: '40h', observaciones: '', documentoB64: event.target.result
                });
                renderHrMassiveTable();
            };
            reader.readAsDataURL(file);
        });
        hrDniUploader.value = '';
    });

    hrAddManualRowBtn.addEventListener('click', () => { agregarFilaCandidatoBlanco(); });

    function agregarFilaCandidatoBlanco() {
        listaCandidatosTemp.push({
            id: 'c_' + Date.now() + '_' + Math.floor(Math.random()*1000),
            nombre: '', dni: '', fechaNacimiento: '', telefono: '', email: '',
            turno: 'Mañana', jornada: '40h', observaciones: '', documentoB64: null
        });
        renderHrMassiveTable();
    }

    function renderHrMassiveTable() {
        hrDynamicRowsContainer.innerHTML = '';
        listaCandidatosTemp.forEach((cand, index) => {
            const tr = document.createElement('tr');
            const classBtn = cand.observaciones ? 'btn-obs-action btn-obs-view' : 'btn-obs-action btn-obs-add';
            const textBtn = cand.observaciones ? 'ver observación' : '+ añadir observación';

            tr.innerHTML = `
                <td><input type="text" value="${cand.nombre}" class="input-table r-nombre" data-index="${index}" placeholder="Nombre" required></td>
                <td><input type="text" value="${cand.dni}" class="input-table r-dni" data-index="${index}" placeholder="DNI/NIE" required></td>
                <td><input type="date" value="${cand.fechaNacimiento}" class="input-table r-fecha" data-index="${index}" required></td>
                <td><input type="tel" value="${cand.telefono}" class="input-table r-tel" data-index="${index}" placeholder="600000000" required></td>
                <td><input type="email" value="${cand.email}" class="input-table r-email" data-index="${index}" placeholder="mail@acerca.info" required></td>
                <td>
                    <select class="input-table r-turno" data-index="${index}">
                        <option value="Mañana" ${cand.turno === 'Mañana' ? 'selected' : ''}>Mañana</option>
                        <option value="Tarde" ${cand.turno === 'Tarde' ? 'selected' : ''}>Tarde</option>
                    </select>
                </td>
                <td>
                    <select class="input-table r-jornada" data-index="${index}">
                        <option value="20h" ${cand.jornada === '20h' ? 'selected' : ''}>20h</option>
                        <option value="25h" ${cand.jornada === '25h' ? 'selected' : ''}>25h</option>
                        <option value="30h" ${cand.jornada === '30h' ? 'selected' : ''}>30h</option>
                        <option value="35h" ${cand.jornada === '35h' ? 'selected' : ''}>35h</option>
                        <option value="40h" ${cand.jornada === '40h' ? 'selected' : ''}>40h</option>
                    </select>
                </td>
                <td style="text-align:center; white-space:nowrap;">
                    ${cand.documentoB64 ? `<span class="badge-interactive view-doc-trigger" data-b64="${cand.documentoB64}">👁️ Ver</span>` : `<span style="font-size:11px;color:#aaa;">Sin Doc</span>`}
                    <button type="button" class="r-del-btn" data-index="${index}" style="color:red; background:none; border:none; cursor:pointer; margin-left:6px;">✕</button>
                </td>
                <td style="text-align:center;">
                    <button type="button" class="${classBtn} trigger-obs-edit" data-index="${index}">${textBtn}</button>
                </td>
            `;
            hrDynamicRowsContainer.appendChild(tr);
        });

        // Eventos en caliente para sincronizar inputs manuales
        document.querySelectorAll('.r-nombre').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].nombre = e.target.value; }));
        document.querySelectorAll('.r-dni').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].dni = e.target.value; }));
        document.querySelectorAll('.r-fecha').forEach(i => i.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].fechaNacimiento = e.target.value; }));
        document.querySelectorAll('.r-tel').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].telefono = e.target.value; }));
        document.querySelectorAll('.r-email').forEach(i => i.addEventListener('input', e => { listaCandidatosTemp[e.target.dataset.index].email = e.target.value; }));
        document.querySelectorAll('.r-turno').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].turno = e.target.value; }));
        document.querySelectorAll('.r-jornada').forEach(s => s.addEventListener('change', e => { listaCandidatosTemp[e.target.dataset.index].jornada = e.target.value; }));
        
        document.querySelectorAll('.r-del-btn').forEach(b => b.addEventListener('click', e => {
            listaCandidatosTemp.splice(e.target.dataset.index, 1);
            renderHrMassiveTable();
        }));

        document.querySelectorAll('.trigger-obs-edit').forEach(b => b.addEventListener('click', e => {
            indexObsActivoTemp = e.target.dataset.index;
            obsModalTextarea.value = listaCandidatosTemp[indexObsActivoTemp].observaciones || '';
            obsModal.classList.add('active');
        }));
    }

    // INTERRUPTORES DE GUARDADO MODAL OBSERVACIÓN
    const obsModal = document.getElementById('obs-modal');
    const obsModalTextarea = document.getElementById('obs-modal-textarea');
    document.getElementById('save-obs-modal-btn').addEventListener('click', () => {
        if (indexObsActivoTemp !== null) {
            listaCandidatosTemp[indexObsActivoTemp].observaciones = obsModalTextarea.value.trim();
            obsModal.classList.remove('active');
            indexObsActivoTemp = null;
            renderHrMassiveTable();
        }
    });
    document.getElementById('close-obs-modal-btn').addEventListener('click', () => obsModal.classList.remove('active'));

    hrCandidatesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(!listaCandidatosTemp.length) return alert('Debes añadir un candidato al menos.');

        baseDatosLotes.push({
            id: 'lote_' + Date.now(),
            responsable: currentUser,
            semana: loteEnCreacion.semana,
            fecha: loteEnCreacion.fecha,
            ciudad: loteEnCreacion.ciudad,
            departamento: loteEnCreacion.departamento,
            candidatos: [...listaCandidatosTemp]
        });

        localStorage.setItem('acerca_lotes_erp', JSON.stringify(baseDatosLotes));
        alert('¡Lote de candidatos registrado de forma permanente!');
        renderHRMainMenu();
        changeScreen(hrStep2Screen, hrMenuScreen);
    });

    function renderHRMainMenu() {
        hrLotesTableBody.innerHTML = '';
        const misLotes = baseDatosLotes.filter(l => l.responsable.toLowerCase() === currentUser.toLowerCase());
        if(!misLotes.length) { hrLotesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;">No registras ningún lote anterior.</td></tr>`; return; }
        
        misLotes.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><b>Semana ${l.semana}</b></td><td>${l.ciudad}</td><td>${l.departamento}</td><td><button class="btn-primary" style="padding:4px 8px; font-size:12px; background:#f15a24;">📁 Ver Candidatos</button></td>`;
            tr.addEventListener('click', () => verDetalleDeLoteHR(l.id));
            hrLotesTableBody.appendChild(tr);
        });
    }

    function verDetalleDeLoteHR(loteId) {
        const lote = baseDatosLotes.find(l => l.id === loteId);
        if (!lote) return;

        hrViewWeekTitle.textContent = lote.semana;
        hrViewLoteSubtitle.textContent = `Sede: ${lote.ciudad} | Departamento: ${lote.departamento} | Responsable: ${lote.responsable}`;
        hrViewCandidatesBody.innerHTML = '';

        lote.candidatos.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${c.nombre}</b></td><td>${lote.ciudad}</td><td>${lote.departamento}</td>
                <td><span class="badge-interactive" style="background:#555;">${c.turno}</span></td><td><b>${c.jornada}</b></td>
                <td>${c.email}</td><td>${c.telefono}</td>
                <td style="text-align:center;">${c.documentoB64 ? `<button class="btn-secondary view-doc-trigger" data-b64="${c.documentoB64}" style="padding:4px 8px; font-size:12px;">👁️ Ver</button>` : `<span style="color:#aaa; font-size:12px;">Sin Doc</span>`}</td>
                <td style="text-align:center;">${c.observaciones ? `<button class="btn-obs-action btn-obs-view hr-read-obs" data-txt="${c.observaciones}">ver observación</button>` : `<span style="color:#aaa; font-size:12px;">Sin obs</span>`}</td>
            `;
            hrViewCandidatesBody.appendChild(tr);
        });

        document.querySelectorAll('.hr-read-obs').forEach(b => b.addEventListener('click', e => {
            obsModalTextarea.value = e.target.dataset.txt;
            obsModal.classList.add('active');
        }));

        changeScreen(hrMenuScreen, hrLoteViewScreen);
        hrBackToListBtn.onclick = function() { changeScreen(hrLoteViewScreen, hrMenuScreen); };
    }

    // --- 9. MÓDULO SUPERVISOR ORIGINAL (SALA) ---
    function renderSupervisorScreen() {
        managerTableBody.innerHTML = '';
        if(!sistemaDatos.length) { managerTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;">Sin informes de sala registrados.</td></tr>`; return; }
        
        sistemaDatos.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.usuario}</td><td><b>Semana ${row.semana}</b></td><td>${Object.keys(row.comentarios).length}/5 días</td><td style="font-size:12px;text-align:justify;">${row.resumenIA.replace(/\n/g,'<br>')}</td><td><button class="del-sala-btn" style="background:none; border:none; cursor:pointer;">🗑️</button></td>`;
            tr.querySelector('.del-sala-btn').addEventListener('click', () => {
                if(confirm('¿Borrar este registro?')) {
                    sistemaDatos = sistemaDatos.filter(s => s.id !== row.id);
                    localStorage.setItem('acerca_datos', JSON.stringify(sistemaDatos));
                    renderSupervisorScreen();
                }
            });
            managerTableBody.appendChild(tr);
        });
    }

    // --- 10. MODALES GENERALES (SALA Y DOCUMENTOS) ---
    const notesModal = document.getElementById('notes-modal');
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge-interactive') && !e.target.classList.contains('pending') && !e.target.classList.contains('view-doc-trigger')) {
            const reg = sistemaDatos.find(d => d.usuario === e.target.dataset.user && d.semana === e.target.dataset.week);
            if (reg?.comentarios?.[e.target.dataset.day]) {
                document.getElementById('modal-day-title').textContent = `Nota del Día — [${e.target.dataset.day}]`;
                document.getElementById('modal-text-content').textContent = reg.comentarios[e.target.dataset.day];
                notesModal.classList.add('active');
            }
        }
    });
    document.getElementById('close-modal-btn').addEventListener('click', () => notesModal.classList.remove('active'));

    const documentModal = document.getElementById('document-modal');
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.view-doc-trigger');
        if (trigger) {
            const base64 = trigger.getAttribute('data-b64');
            if (base64) {
                document.getElementById('modal-document-render').innerHTML = `<img src="${base64}" style="max-width:100%; max-height:420px; border-radius:4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">`;
                documentModal.classList.add('active');
            }
        }
    });
    document.getElementById('close-doc-modal-btn').addEventListener('click', () => documentModal.classList.remove('active'));

    // EXPORTACIÓN EXCEL DE SALA ORIGINAL
    managerExportExcelBtn.addEventListener('click', () => {
        let rows = [];
        sistemaDatos.forEach(s => {
            ['L', 'M', 'X', 'J', 'V'].forEach(d => {
                if(s.comentarios[d]) rows.push({ Responsable: s.usuario, Semana: s.semana, Día: d, Anotación: s.comentarios[d], ResumenSemanal: s.resumenIA });
            });
        });
        if(!rows.length) return alert('Sin datos.');
        const hoja = XLSX.utils.json_to_sheet(rows);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Sala Ventas");
        XLSX.writeFile(libro, "Reportes_Ventas_Acerca.xlsx");
    });

    function changeScreen(rem, act) { rem.classList.remove('active'); act.classList.add('active'); }
});