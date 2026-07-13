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
    let selectedDayLetterGlobal = ''; // 'L', 'M', 'X', 'J', 'V'

    // --- 2. BASE DE DATOS INICIAL (Con almacenamiento en LocalStorage) ---
    const datosInicialesPredeterminados = [
        {
            usuario: 'davidolivaresfernandez@acerca.info',
            semana: '28',
            resumenIA: 'El grupo ha mostrado una evolución positiva a lo largo de la semana, destacando por su buena actitud, implicación y capacidad de aprendizaje.',
            puntosFuertes: 'Han demostrado iniciativa, como la lectura voluntaria de los textos legales fuera del horario de formación, y una disposición constante para aplicar las correcciones recibidas.',
            puntosMejora: 'En varios momentos han conseguido buenos resultados comerciales, pero falta consolidar el ritmo los miércoles tras las objeciones iniciales.',
            comentarios: {
                'L': 'Lunes: Reunión de inicio de semana comercial. El equipo muestra gran foco en los objetivos de la campaña Talento +.',
                'M': 'Martes: Análisis de métricas individuales. Buen ritmo de llamadas y cierres.',
                'X': 'Miércoles: Formación intermedia sobre el manejo de objeciones. Lectura de textos legales.',
                'J': 'Jueves: Se mantienen excelentes resultados, resiliencia del equipo ante situaciones complejas.',
                'V': 'Viernes: Cierre semanal sobresaliente con feedback positivo y consolidación de reportes.'
            }
        },
        {
            usuario: 'laura.rodriguez@acerca.info',
            semana: '27',
            resumenIA: 'Pendiente de completar los 5 días para generar resumen automático.',
            puntosFuertes: 'N/A',
            puntosMejora: 'N/A',
            comentarios: {
                'L': 'Lunes: Planificación de la semana de ventas con el equipo.',
                'X': 'Miércoles: Seguimiento de leads calificados y llamadas en frío.'
            }
        }
    ];

    // Cargar datos guardados o usar los predeterminados si es la primera vez
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
        
        // Mapeo de días
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

    // GUARDAR COMENTARIO REAL
    step2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        const comentarioTexto = dayComment.value.trim();

        // Buscar si este usuario ya tiene registros para esa semana
        let registroSemana = sistemaDatos.find(d => d.usuario === currentUser && d.semana === selectedWeekGlobal);

        if (!registroSemana) {
            // Si es una semana nueva para el usuario, creamos la estructura vacía
            registroSemana = {
                usuario: currentUser,
                semana: selectedWeekGlobal,
                resumenIA: 'Pendiente de completar los 5 días para generar resumen automático.',
                puntosFuertes: 'N/A',
                puntosMejora: 'N/A',
                comentarios: {}
            };
            sistemaDatos.push(registroSemana);
        }

        // Guardamos el comentario en el día correspondiente
        registroSemana.comentarios[selectedDayLetterGlobal] = `${calculatedDay.value}: ${comentarioTexto}`;

        // Regla del negocio: Si la semana ya tiene los 5 comentarios, autogeneramos el resumen de IA de ventas
        const diasRellenos = Object.keys(registroSemana.comentarios);
        if (diasRellenos.length === 5) {
            registroSemana.resumenIA = 'El grupo comercial ha alcanzado el 100% de la actividad semanal planificada en Talento +, mostrando un ritmo constante de ejecuciones de venta.';
            registroSemana.puntosFuertes = 'Excelente consistencia de Lunes a Viernes. Registro completo de anotaciones comerciales sin huecos.';
            registroSemana.puntosMejora = 'Optimizar los tiempos de reporte al final de la jornada de los viernes.';
        }

        guardarEnMemoria();
        alert('¡Registro guardado y almacenado correctamente!');
        
        // Actualizamos la tabla del usuario e inmediatamente volvemos
        renderUserTable();
        changeScreen(formStep2Screen, userMenuScreen);
    });

    // --- 7. RENDERIZAR TABLA DE USUARIOS ---
    function renderUserTable() {
        userTableBody.innerHTML = '';
        // Filtrar datos que pertenezcan únicamente al usuario que ha iniciado sesión
        const misDatos = sistemaDatos.filter(d => d.usuario === currentUser);

        if(misDatos.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No tienes registros previos. Haz clic en 'Crear nuevo'</td></tr>`;
            return;
        }

        misDatos.forEach(row => {
            const tr = document.createElement('tr');
            
            // Renderizar los botones (badges) de los días según si existen en sus comentarios
            let badgesHTML = '<div class="day-badges">';
            ['L', 'M', 'X', 'J', 'V'].forEach(dia => {
                if (row.comentarios && row.comentarios[dia]) {
                    badgesHTML += `<span class="badge" data-user="${row.usuario}" data-week="${row.semana}" data-day="${dia}">${dia}</span>`;
                } else {
                    badgesHTML += `<span class="badge pending">${dia}</span>`;
                }
            });
            badgesHTML += '</div>';

            let resumenCuerpo = row.resumenIA;
            if (row.puntosFuertes !== 'N/A') {
                resumenCuerpo += `<br><br><strong>PUNTOS FUERTES:</strong> ${row.puntosFuertes}<br><strong>A MEJORAR:</strong> ${row.puntosMejora}`;
            }

            tr.innerHTML = `
                <td class="bold-text">Semana ${row.semana}</td>
                <td>${badgesHTML}</td>
                <td class="summary-cell">${resumenCuerpo}</td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // --- 8. RENDERIZAR TABLA DE SUPERVISOR ---
    function renderManagerTable() {
        managerTableBody.innerHTML = '';
        
        sistemaDatos.forEach(row => {
            const tr = document.createElement('tr');
            let resumenHTML = '';
            let badgesHTML = '<div class="day-badges">';

            // Construir los días interactivos o grises para el supervisor
            ['L', 'M', 'X', 'J', 'V'].forEach(dia => {
                if (row.comentarios && row.comentarios[dia]) {
                    badgesHTML += `<span class="badge" data-user="${row.usuario}" data-week="${row.semana}" data-day="${dia}">${dia}</span>`;
                } else {
                    badgesHTML += `<span class="badge pending">${dia}</span>`;
                }
            });
            badgesHTML += '</div>';

            if(row.puntosFuertes === 'N/A') {
                resumenHTML = `<span style="color:#888; font-style:italic;">${row.resumenIA}</span>`;
            } else {
                resumenHTML = `
                    <div class="ia-summary-box">
                        <p>${row.resumenIA}</p>
                        <p><span class="ia-tag fuertes">PUNTOS FUERTES:</span> ${row.puntosFuertes}</p>
                        <p><span class="ia-tag mejora">A MEJORAR:</span> ${row.puntosMejora}</p>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td class="bold-text">${row.usuario}</td>
                <td class="bold-text">Semana ${row.semana}</td>
                <td>${badgesHTML}</td>
                <td>${resumenHTML}</td>
            `;
            managerTableBody.appendChild(tr);
        });
    }

    // --- 9. POP-UP DE ANOTACIONES DIARIAS DINÁMICO ---
    const notesModal = document.getElementById('notes-modal');
    const modalDayTitle = document.getElementById('modal-day-title');
    const modalTextContent = document.getElementById('modal-text-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge') && !e.target.classList.contains('pending')) {
            const userTarget = e.target.getAttribute('data-user');
            const weekTarget = e.target.getAttribute('data-week');
            const dayTarget = e.target.getAttribute('data-day');

            // Buscar el texto real dentro de nuestro sistema de datos dinámico
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

    // --- 10. EXPORTAR A EXCEL DINÁMICO ---
    exportExcelBtn.addEventListener('click', () => {
        const datosExcel = sistemaDatos.map(d => ({
            'Usuario': d.usuario,
            'Semana': 'Semana ' + d.semana,
            'Resumen Semanal': d.resumenIA,
            'Puntos Fuertes del Grupo': d.puntosFuertes,
            'Puntos de Mejora': d.puntosMejora
        }));

        const hoja = XLSX.utils.json_to_sheet(datosExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Reporte Ventas");
        XLSX.writeFile(libro, "Reporte_Semanal_Acerca.xlsx");
    });

});