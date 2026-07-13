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

    // --- 2. FUNCIÓN PARA CAMBIAR DE PANTALLA ---
    function changeScreen(screenToRemove, screenToActive) {
        screenToRemove.classList.remove('active');
        screenToActive.classList.add('active');
    }

    // --- 3. LOGICA DE ACCESO (LOGIN) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputValue = usernameInput.value.trim();

        if (inputValue === 'SUPERVISORACERCA') {
            renderManagerTable();
            changeScreen(loginScreen, managerScreen);
        } else if (inputValue.includes('@')) {
            displayUserEmail.textContent = inputValue;
            changeScreen(loginScreen, userMenuScreen);
        } else {
            alert('Por favor, introduce un correo electrónico válido o la clave de gestor.');
        }
    });

    // --- 4. CERRAR SESIÓN (USUARIO Y GESTOR) ---
    logoutBtn.addEventListener('click', () => {
        usernameInput.value = '';
        changeScreen(userMenuScreen, loginScreen);
    });

    exitManagerBtn.addEventListener('click', () => {
        usernameInput.value = '';
        changeScreen(managerScreen, loginScreen);
    });

    // --- 5. FLUJO DEL FORMULARIO DE CREACIÓN ---
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
        const diaNombre = diasSemana[dateValue.getDay()];
        
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
        alert('¡Registro guardado con éxito!');
        changeScreen(formStep2Screen, userMenuScreen);
    });

    // --- 6. POP-UP DE ANOTACIONES DIARIAS ---
    const notesModal = document.getElementById('notes-modal');
    const modalDayTitle = document.getElementById('modal-day-title');
    const modalTextContent = document.getElementById('modal-text-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const ejemplosComentarios = {
        'L': 'Lunes: Reunión de inicio de semana comercial. El equipo muestra gran foco en los objetivos de la campaña Talento +. Se han detectado oportunidades en el sector retail.',
        'M': 'Martes: Análisis de métricas individuales. Buen ritmo de llamadas y cierres. Comentario extenso para probar el scroll lateral del cuadro emergente.',
        'X': 'Miércoles: Formación intermedia sobre el manejo de objeciones. Lectura de textos legales.',
        'J': 'Jueves: Se mantienen excelentes resultados, resiliencia del equipo ante situaciones complejas.',
        'V': 'Viernes: Cierre semanal sobresaliente con feedback positivo y consolidación de reportes.'
    };

    document.addEventListener('click', (e) => {
        // Solo abrir si es un badge activo y NO es uno pendiente (gris transparente)
        if (e.target.classList.contains('badge') && !e.target.classList.contains('pending')) {
            const diaId = e.target.textContent.trim();
            if (ejemplosComentarios[diaId]) {
                modalDayTitle.textContent = `Anotaciones del Día — [${diaId}]`;
                modalTextContent.textContent = ejemplosComentarios[diaId];
                notesModal.classList.add('active');
            }
        }
    });

    closeModalBtn.addEventListener('click', () => notesModal.classList.remove('active'));
    notesModal.addEventListener('click', (e) => { if (e.target === notesModal) notesModal.classList.remove('active'); });

    // --- 7. MODO GESTOR (TABLAS Y EXCEL) ---
    const datosSupervisión = [
        {
            usuario: 'davidolivaresfernandez@acerca.info',
            semana: 'Semana 28',
            resumenIA: 'El grupo ha mostrado una evolución positiva a lo largo de la semana, destacando por su buena actitud, implicación y capacidad de aprendizaje.',
            puntosFuertes: 'Han demostrado iniciativa, como la lectura voluntaria de los textos legales fuera del horario de formación, y una disposición constante para aplicar las correcciones recibidas.',
            puntosMejora: 'En varios momentos han conseguido buenos resultados comerciales, pero falta consolidar el ritmo los miércoles tras las objeciones iniciales.'
        },
        {
            usuario: 'laura.rodriguez@acerca.info',
            semana: 'Semana 27',
            resumenIA: 'Pendiente de completar los 5 días para generar resumen automático por IA.',
            puntosFuertes: 'N/A',
            puntosMejora: 'N/A'
        }
    ];

    function renderManagerTable() {
        managerTableBody.innerHTML = '';
        
        datosSupervisión.forEach(row => {
            const tr = document.createElement('tr');
            let resumenHTML = '';
            let badgesHTML = '';

            if(row.puntosFuertes === 'N/A') {
                resumenHTML = `<span style="color:#888; font-style:italic;">${row.resumenIA}</span>`;
                badgesHTML = `
                    <div class="day-badges">
                        <span class="badge">L</span>
                        <span class="badge pending">M</span>
                        <span class="badge">X</span>
                        <span class="badge pending">J</span>
                        <span class="badge pending">V</span>
                    </div>
                `;
            } else {
                resumenHTML = `
                    <div class="ia-summary-box">
                        <p>${row.resumenIA}</p>
                        <p><span class="ia-tag fuertes">PUNTOS FUERTES:</span> ${row.puntosFuertes}</p>
                        <p><span class="ia-tag mejora">A MEJORAR:</span> ${row.puntosMejora}</p>
                    </div>
                `;
                badgesHTML = `
                    <div class="day-badges">
                        <span class="badge">L</span>
                        <span class="badge">M</span>
                        <span class="badge">X</span>
                        <span class="badge">J</span>
                        <span class="badge">V</span>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td class="bold-text">${row.usuario}</td>
                <td>${row.semana}</td>
                <td>${badgesHTML}</td>
                <td>${resumenHTML}</td>
            `;
            managerTableBody.appendChild(tr);
        });
    }

    // BOTÓN DE EXPORTAR A EXCEL
    exportExcelBtn.addEventListener('click', () => {
        const datosExcel = datosSupervisión.map(d => ({
            'Usuario': d.usuario,
            'Semana': d.semana,
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