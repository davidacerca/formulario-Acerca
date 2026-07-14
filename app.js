document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE ELEMENTOS ---
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    
    // Pantallas
    const loginScreen = document.getElementById('login-screen');
    const userMenuScreen = document.getElementById('user-menu-screen');
    const formStep1Screen = document.getElementById('form-step1-screen');
    const formStep2Screen = document.getElementById('form-step2-screen');
    const managerScreen = document.getElementById('manager-screen');
    
    // Componentes dinámicos
    const displayUserEmail = document.getElementById('display-user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const exitManagerBtn = document.getElementById('exit-manager-btn');
    const userTableBody = document.getElementById('user-table-body');
    const managerTableBody = document.getElementById('manager-table-body');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const managerFilterWeek = document.getElementById('manager-filter-week');
    
    // Botones de navegación
    const createNewBtn = document.getElementById('create-new-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const backToStep1Btn = document.getElementById('back-to-step1-btn');
    
    // Formularios e inputs internos
    const step1Form = document.getElementById('step1-form');
    const step2Form = document.getElementById('step2-form');
    const formDate = document.getElementById('form-date');
    const formWeek = document.getElementById('form-week');
    const summaryChosenWeek = document.getElementById('summary-chosen-week');
    const calculatedDay = document.getElementById('calculated-day');
    const dayComment = document.getElementById('day-comment');

    // Variables globales de estado
    let currentUser = sessionStorage.getItem('acerca_user') || '';
    let selectedWeekGlobal = '';
    let selectedDayLetterGlobal = ''; 

    // --- 2. MOTOR DE ANÁLISIS DINÁMICO Y GENERACIÓN DE TEXTO ---
    function generarResumenInteligente(comentariosDiccionario) {
        // Unimos todas las anotaciones de la semana para analizarlas juntas
        const todoElTexto = Object.values(comentariosDiccionario).join(' ').toLowerCase();

        // 1. Bloques para el Párrafo 1: Evolución y Bases
        let parrafo1 = "Durante esta semana, el grupo ha mostrado una evolución positiva y una buena predisposición para aprender. Se han trabajado las bases de la formación, reforzando el conocimiento de los rebates, los textos legales y el uso de las herramientas de trabajo.";
        if (todoElTexto.includes('legal') || todoElTexto.includes('rebate') || todoElTexto.includes('normativa')) {
            parrafo1 = "A lo largo de las jornadas, el equipo se ha concentrado firmemente en el marco formativo avanzado. Destaca la asimilación del argumentario de rebates y la lectura minuciosa de textos legales obligatorios, demostrando un rigor excelente en el uso de los aplicativos corporativos.";
        } else if (todoElTexto.includes('lento') || todoElTexto.includes('procedimiento') || todoElTexto.includes('informática') || todoElTexto.includes('sistema')) {
            parrafo1 = "La semana ha estado muy enfocada en superar las barreras iniciales de los sistemas informáticos y flujos de procesos. Aunque la adaptación técnica ha requerido un esfuerzo extra, la predisposición grupal para dominar las herramientas ha agilizado la curva de aprendizaje.";
        }

        // 2. Bloques para el Párrafo 2: Rendimiento Comercial y Actitud
        let parrafo2 = "A nivel comercial, los integrantes han evidenciado potencial para obtener resultados, aunque con diferentes ritmos de aprendizaje. La actitud general ha sido buena y el grupo ha respondido positivamente al acompañamiento, si bien todavía deben ganar confianza y constancia para mantener el rendimiento.";
        if (todoElTexto.includes('venta') || todoElTexto.includes('cierre') || todoElTexto.includes('objetivo') || todoElTexto.includes('éxito')) {
            parrafo2 = "El enfoque comercial de estos días ha arrojado métricas e indicadores de venta muy prometedores. Se percibe un instinto natural hacia el cierre de operaciones; no obstante, el principal reto radica en homogeneizar los ritmos del equipo para consolidar este volumen de forma constante.";
        } else if (todoElTexto.includes('frustración') || todoElTexto.includes('seguridad') || todoElTexto.includes('objeción') || todoElTexto.includes('dificultad')) {
            parrafo2 = "La gestión emocional ha sido clave esta semana debido a la dureza de ciertas objeciones en frío. Aunque el grupo ha manifestado picos de frustración lógicos, el acompañamiento directo en sala les ha ayudado a recuperar la seguridad y la firmeza telefónica de cara al tramo final de la jornada.";
        }

        // 3. Bloques para el Párrafo 3: Balance y Decisión
        let parrafo3 = "En conjunto, considero que el balance de la semana es positivo. Se trata de un grupo con margen de mejora, pero con implicación, capacidad de aprendizaje y potencial suficiente para seguir evolucionando. Por ello, he decidido mantener a los integrantes y continuar trabajando en su desarrollo.";
        if (todoElTexto.includes('sobresaliente') || todoElTexto.includes('excelente') || todoElTexto.includes('implicación') || todoElTexto.includes('foco')) {
            parrafo3 = "El balance final arroja conclusiones sumamente optimistas. La alta implicación colectiva y el foco diario compensan con creces cualquier área de mejora detectada. Existe potencial real de desarrollo en el proyecto, por lo que apuesto con total confianza por la continuidad del bloque.";
        }

        // Devolvemos los párrafos estructurados
        return `${parrafo1}\n\n${parrafo2}\n\n${parrafo3}`;
    }

    // --- 3. BASE DE DATOS INICIAL ---
    const datosInicialesPredeterminados = [
        {
            id: 'id_david_28',
            usuario: 'davidolivaresfernandez@acerca.info',
            semana: '28',
            resumenIA: `Durante esta primera semana, el grupo ha mostrado una evolución positiva y una buena predisposición para aprender. Se han trabajado las bases de la formación, reforzando el conocimiento de los rebates, los textos legales y el uso de las herramientas de trabajo. Aunque todavía presentan carencias en algunos procedimientos y en el manejo informático, todos han demostrado capacidad para asimilar las correcciones y mejorar progresivamente.\n\nA nivel comercial, los cuatro integrantes han evidenciado potencial para obtener resultados, aunque con diferentes ritmos de aprendizaje. La actitud general ha sido buena y el grupo ha respondido positivamente al acompañamiento y a las dinámicas realizadas, si bien todavía deben ganar confianza, seguridad y constancia para mantener el rendimiento durante toda la jornada y gestionar mejor los momentos de frustración.\n\nEn conjunto, considero que el balance de la semana es positivo. Se trata de un grupo con margen de mejora, pero con implicación, capacidad de aprendizaje y potencial suficiente para seguir evolucionando. Por ello, he decidido mantener a los cuatro integrantes y continuar trabajando en su desarrollo durante las próximas semanas.`,
            comentarios: {
                'L': 'Lunes: Reunión de inicio de semana comercial. El equipo muestra gran foco en los objetivos de la campaña Talento +.',
                'M': 'Martes: Análisis de métricas individuales. Buen ritmo de llamadas y cierres.',
                'X': 'Miércoles: Formación intermedia sobre el manejo de objeciones. Lectura de textos legales.',
                'J': 'Jueves: Se mantienen excelentes resultados, resiliencia del equipo ante situaciones complejas.',
                'V': 'Viernes: Cierre semanal sobresaliente con feedback positivo y consolidación de reportes.'
            }
        },
        {
            id: 'id_laura_27',
            usuario: 'laura.rodriguez@acerca.info',
            semana: '27',
            resumenIA: 'Pendiente de completar los 5 días para generar resumen automático.',
            comentarios: {
                'L': 'Lunes: Planificación de la semana de ventas con el equipo.',
                'X': 'Miércoles: Seguimiento de leads calificados y llamadas en frío.'
            }
        }
    ];

    let sistemaDatos = JSON.parse(localStorage.getItem('acerca_datos')) || datosInicialesPredeterminados;

    function guardarEnMemoria() {
        localStorage.setItem('acerca_datos', JSON.stringify(sistemaDatos));
    }

    // --- 4. COMPROBACIÓN DE SESIÓN ACTIVA (F5 CONTROL) ---
    if (currentUser) {
        loginScreen.classList.remove('active');
        if (currentUser === 'SUPERVISORACERCA') {
            actualizarFiltroSemanas();
            renderManagerTable();
            managerScreen.classList.add('active');
        } else {
            displayUserEmail.textContent = currentUser;
            renderUserTable();
            userMenuScreen.classList.add('active');
        }
    }

    // --- 5. LOGICA DE ACCESO (LOGIN) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let inputValue = usernameInput.value.trim();

        if (inputValue.toUpperCase() === 'SUPERVISORACERCA') {
            currentUser = 'SUPERVISORACERCA';
            sessionStorage.setItem('acerca_user', currentUser);
            actualizarFiltroSemanas();
            renderManagerTable();
            changeScreen(loginScreen, managerScreen);
        } else if (inputValue.includes('@')) {
            currentUser = inputValue.toLowerCase();
            sessionStorage.setItem('acerca_user', currentUser);
            displayUserEmail.textContent = currentUser;
            renderUserTable();
            changeScreen(loginScreen, userMenuScreen);
        } else {
            alert('Por favor, introduce un correo electrónico válido o la clave de gestor.');
        }
    });

    function clearSession() {
        sessionStorage.removeItem('acerca_user');
        currentUser = '';
        usernameInput.value = '';
    }

    logoutBtn.addEventListener('click', () => {
        clearSession();
        changeScreen(userMenuScreen, loginScreen);
    });

    exitManagerBtn.addEventListener('click', () => {
        clearSession();
        changeScreen(managerScreen, loginScreen);
    });

    // --- 6. FLUJO DEL FORMULARIO DE CREACIÓN ---
    createNewBtn.addEventListener('click', () => {
        formDate.value = '';
        formWeek.value = '';
        changeScreen(userMenuScreen, formStep1Screen);
    });

    backToMenuBtn.addEventListener('click', () => {
        changeScreen(formStep1Screen, userMenuScreen);
    });

    step1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateValue = new Date(formDate.value);
        const weekValue = formWeek.value.trim();
        
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const letrasDias = { 'Lunes':'L', 'Martes':'M', 'Miércoles':'X', 'Jueves':'J', 'Viernes':'V' };
        const diaNombre = diasSemana[dateValue.getDay()];
        
        if (diaNombre === 'Sábado' || diaNombre === 'Domingo') {
            alert('Por favor, selecciona un día laborable de Lunes a Viernes.');
            return;
        }

        selectedWeekGlobal = weekValue;
        selectedDayLetterGlobal = letrasDias[diaNombre];
        
        summaryChosenWeek.textContent = `Semana ${weekValue}`;
        calculatedDay.value = diaNombre;
        dayComment.value = '';
        
        changeScreen(formStep1Screen, formStep2Screen);
    });

    backToStep1Btn.addEventListener('click', () => {
        changeScreen(formStep2Screen, formStep1Screen);
    });

    step2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const comentarioTexto = dayComment.value.trim();

        let registroSemana = sistemaDatos.find(d => d.usuario === currentUser && d.semana === selectedWeekGlobal);

        if (!registroSemana) {
            registroSemana = {
                id: 'id_' + Date.now(),
                usuario: currentUser,
                semana: selectedWeekGlobal,
                resumenIA: 'Pendiente de completar los 5 días para generar resumen automático.',
                comentarios: {}
            };
            sistemaDatos.push(registroSemana);
        }

        registroSemana.comentarios[selectedDayLetterGlobal] = `${calculatedDay.value}: ${comentarioTexto}`;

        // ANALIZAR Y GENERAR EL INFORME AUTOMÁTICO AL COMPLETAR LOS 5 DÍAS
        const diasRellenos = Object.keys(registroSemana.comentarios);
        if (diasRellenos.length === 5) {
            registroSemana.resumenIA = generarResumenInteligente(registroSemana.comentarios);
        }

        guardarEnMemoria();
        alert('¡Registro guardado correctamente!');
        
        renderUserTable();
        changeScreen(formStep2Screen, userMenuScreen);
    });

    // --- 7. RENDERIZAR TABLA DE USUARIOS ---
    function renderUserTable() {
        userTableBody.innerHTML = '';
        const datosActuales = JSON.parse(localStorage.getItem('acerca_datos')) || sistemaDatos;
        const misDatos = datosActuales.filter(d => d.usuario === currentUser);

        if(misDatos.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888; padding: 20px;">No tienes registros previos.</td></tr>`;
            return;
        }

        misDatos.forEach(row => {
            const tr = document.createElement('tr');
            let badgesHTML = '<div class="day-badges">';
            ['L', 'M', 'X', 'J', 'V'].forEach(dia => {
                if (row.comentarios && row.comentarios[dia]) {
                    badgesHTML += `<span class="badge" data-user="${row.usuario}" data-week="${row.semana}" data-day="${dia}">${dia}</span>`;
                } else {
                    badgesHTML += `<span class="badge pending">${dia}</span>`;
                }
            });
            badgesHTML += '</div>';

            const resumenFormateado = row.resumenIA.replace(/\n/g, '<br>');

            tr.innerHTML = `
                <td class="bold-text">Semana ${row.semana}</td>
                <td>${badgesHTML}</td>
                <td class="summary-cell" style="white-space: pre-line; text-align: justify;">${resumenFormateado}</td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // --- 8. RENDERIZAR TABLA DE GESTOR ---
    function renderManagerTable() {
        managerTableBody.innerHTML = '';
        const semanaFiltrada = managerFilterWeek.value;
        
        const datosAFiltrar = semanaFiltrada === 'all' 
            ? sistemaDatos 
            : sistemaDatos.filter(d => d.semana === semanaFiltrada);

        if (datosAFiltrar.length === 0) {
            managerTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No hay registros para la semana seleccionada.</td></tr>`;
            return;
        }

        datosAFiltrar.forEach(row => {
            const tr = document.createElement('tr');
            let badgesHTML = '<div class="day-badges">';

            ['L', 'M', 'X', 'J', 'V'].forEach(dia => {
                if (row.comentarios && row.comentarios[dia]) {
                    badgesHTML += `<span class="badge" data-user="${row.usuario}" data-week="${row.semana}" data-day="${dia}">${dia}</span>`;
                } else {
                    badgesHTML += `<span class="badge pending">${dia}</span>`;
                }
            });
            badgesHTML += '</div>';

            const resumenFormateado = row.resumenIA.replace(/\n/g, '<br>');

            tr.innerHTML = `
                <td class="bold-text" style="font-size: 13px;">${row.usuario}</td>
                <td class="bold-text">Semana ${row.semana}</td>
                <td>${badgesHTML}</td>
                <td class="summary-cell" style="font-size: 13px; max-width: 450px; text-align: justify; white-space: pre-line;">${resumenFormateado}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <button class="delete-btn" data-id="${row.id}" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #cc0000;" title="Borrar entrada">🗑️</button>
                </td>
            `;
            managerTableBody.appendChild(tr);
        });
    }

    function actualizarFiltroSemanas() {
        const valorActual = managerFilterWeek.value || 'all';
        managerFilterWeek.innerHTML = '<option value="all">Todas</option>';
        
        const semanasUnicas = [...new Set(sistemaDatos.map(d => d.semana))].sort((a,b) => a - b);
        
        semanasUnicas.forEach(sem => {
            const opt = document.createElement('option');
            opt.value = sem;
            opt.textContent = `Semana ${sem}`;
            managerFilterWeek.appendChild(opt);
        });
        managerFilterWeek.value = valorActual;
    }

    managerFilterWeek.addEventListener('change', renderManagerTable);

    // EVENTO DE ELIMINACIÓN
    document.addEventListener('click', (e) => {
        const botonBorrar = e.target.closest('.delete-btn');
        if (botonBorrar) {
            const idParaBorrar = botonBorrar.getAttribute('data-id');
            
            if (confirm('¿Estás seguro de que deseas borrar por completo este registro semanal? Se eliminará de forma irreversible para el usuario en tiempo real.')) {
                sistemaDatos = sistemaDatos.filter(registro => String(registro.id) !== String(idParaBorrar));
                guardarEnMemoria();
                
                actualizarFiltroSemanas();
                renderManagerTable();
                alert('Registro eliminado del sistema.');
            }
        }
    });

    // --- 9. POP-UP DE ANOTACIONES DIARIAS ---
    const notesModal = document.getElementById('notes-modal');
    const modalDayTitle = document.getElementById('modal-day-title');
    const modalTextContent = document.getElementById('modal-text-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge') && !e.target.classList.contains('pending')) {
            const userTarget = e.target.getAttribute('data-user');
            const weekTarget = e.target.getAttribute('data-week');
            const dayTarget = e.target.getAttribute('data-day');

            const registro = sistemaDatos.find(d => d.usuario === userTarget && d.semana === weekTarget);
            
            if (registro && registro.comentarios && registro.comentarios[dayTarget]) {
                modalDayTitle.textContent = `Anotaciones del Día — [${dayTarget}]`;
                modalTextContent.textContent = registro.comentarios[dayTarget];
                notesModal.classList.add('active');
            }
        }
    });

    closeModalBtn.addEventListener('click', () => notesModal.classList.remove('active'));
    notesModal.addEventListener('click', (e) => { if (e.target === notesModal) notesModal.classList.remove('active'); });

    // --- 10. EXPORTAR A EXCEL ---
    exportExcelBtn.addEventListener('click', () => {
        const datosExcel = sistemaDatos.map(d => ({
            'Usuario': d.usuario,
            'Semana': 'Semana ' + d.semana,
            'Resumen Semanal': d.resumenIA
        }));

        const hoja = XLSX.utils.json_to_sheet(datosExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Reporte Ventas");
        XLSX.writeFile(libro, "Reporte_Semanal_Acerca.xlsx");
    });

    function changeScreen(screenToRemove, screenToActive) {
        screenToRemove.classList.remove('active');
        screenToActive.classList.add('active');
    }
});