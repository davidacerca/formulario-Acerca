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
    
    // Botones de navegación del formulario
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
    let currentUser = '';
    let selectedWeekGlobal = '';
    let selectedDayLetterGlobal = ''; 

    // Texto de IA redactado dinámicamente solicitado
    const textoIARedactadoBase = `Durante esta primera semana, el grupo ha mostrado una evolución positiva y una buena predisposición para aprender. Se han trabajado las bases de la formación, reforzando el conocimiento de los rebates, los textos legales y el uso de las herramientas de trabajo. Aunque todavía presentan carencias en algunos procedimientos y en el manejo informático, todos han demostrado capacidad para asimilar las correcciones y mejorar progresivamente.\n\nA nivel comercial, los cuatro integrantes han evidenciado potencial para obtener resultados, aunque con diferentes ritmos de aprendizaje. La actitud general ha sido buena y el grupo ha respondido positivamente al acompañamiento y a las dinámicas realizadas, si bien todavía deben ganar confianza, seguridad y constancia para mantener el rendimiento durante toda la jornada y gestionar mejor los momentos de frustración.\n\nEn conjunto, considero que el balance de la semana es positivo. Se trata de un grupo con margen de mejora, pero con implicación, capacidad de aprendizaje y potencial suficiente para seguir evolucionando. Por ello, he decidido mantener a los cuatro integrantes y continuar trabajando en su desarrollo durante las próximas semanas.`;

    // --- 2. BASE DE DATOS INICIAL ---
    const datosInicialesPredeterminados = [
        {
            id: 'id_david_28',
            usuario: 'davidolivaresfernandez@acerca.info',
            semana: '28',
            resumenIA: textoIARedactadoBase,
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

    // --- 3. FUNCIÓN PARA CAMBIAR DE PANTALLA ---
    function changeScreen(screenToRemove, screenToActive) {
        screenToRemove.classList.remove('active');
        screenToActive.classList.add('active');
    }

    // --- 4. LOGICA DE ACCESO (LOGIN) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputValue = usernameInput.value.trim();

        if (inputValue === 'SUPERVISORACERCA') {
            renderManagerTable();
            changeScreen(loginScreen, managerScreen);
        } else if (inputValue.includes('@')) {
            currentUser = inputValue;
            displayUserEmail.textContent = currentUser;
            renderUserTable();
            changeScreen(loginScreen, userMenuScreen);
        } else {
            alert('Por favor, introduce un correo electrónico válido o la clave de gestor.');
        }
    });

    // --- 5. CERRAR SESIÓN ---
    logoutBtn.addEventListener('click', () => {
        usernameInput.value = '';
        changeScreen(userMenuScreen, loginScreen);
    });

    exitManagerBtn.addEventListener('click', () => {
        usernameInput.value = '';
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

    // GUARDAR COMENTARIO 
    step2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const comentarioTexto = dayComment.value.trim();

        let registroSemana = sistemaDatos.find(d => d.usuario === currentUser && d.semana === selectedWeekGlobal);

        if (!registroSemana) {
            registroSemana = {
                id: 'id_' + Date.now(), // Generamos ID único para poder borrarlo después
                usuario: currentUser,
                semana: selectedWeekGlobal,
                resumenIA: 'Pendiente de completar los 5 días para generar resumen automático.',
                comentarios: {}
            };
            sistemaDatos.push(registroSemana);
        }

        registroSemana.comentarios[selectedDayLetterGlobal] = `${calculatedDay.value}: ${comentarioTexto}`;

        // Al completar los 5 días, salta la IA bien redactada
        const diasRellenos = Object.keys(registroSemana.comentarios);
        if (diasRellenos.length === 5) {
            registroSemana.resumenIA = textoIARedactadoBase;
        }

        guardarEnMemoria();
        alert('¡Registro guardado correctamente!');
        
        renderUserTable();
        changeScreen(formStep2Screen, userMenuScreen);
    });

    // --- 7. RENDERIZAR TABLA DE USUARIOS ---
    function renderUserTable() {
        userTableBody.innerHTML = '';
        const misDatos = sistemaDatos.filter(d => d.usuario === currentUser);

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

            // Formatear párrafos en el resumen si es texto largo
            const resumenFormateado = row.resumenIA.replace(/\n/g, '<br>');

            tr.innerHTML = `
                <td class="bold-text">Semana ${row.semana}</td>
                <td>${badgesHTML}</td>
                <td class="summary-cell" style="white-space: pre-line;">${resumenFormateado}</td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // --- 8. RENDERIZAR TABLA DE SUPERVISOR (CON BOTÓN BORRAR) ---
    function renderManagerTable() {
        managerTableBody.innerHTML = '';
        
        if (sistemaDatos.length === 0) {
            managerTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No hay registros en el sistema.</td></tr>`;
            return;
        }

        sistemaDatos.forEach(row => {
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
                <td class="summary-cell" style="font-size: 13px; max-width: 450px; text-align: justify;">${resumenFormateado}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <button class="delete-btn" data-id="${row.id}" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #cc0000;" title="Borrar entrada">🗑️</button>
                </td>
            `;
            managerTableBody.appendChild(tr);
        });
    }

    // EVENTO COMPARTIDO PARA EL BOTÓN DE BORRAR
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idParaBorrar = e.target.getAttribute('data-id');
            
            if (confirm('¿Estás seguro de que deseas borrar por completo este registro semanal? Esta acción afectará también al usuario.')) {
                // Filtramos el array para quitar el elemento borrado
                sistemaDatos = sistemaDatos.filter(registro => registro.id !== idParaBorrar);
                guardarEnMemoria(); // Guardamos el estado limpio en localStorage
                renderManagerTable(); // Redibujamos la tabla del supervisor al instante
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

});