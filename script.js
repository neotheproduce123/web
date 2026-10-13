// Elementos UI
const pantallaRegistro = document.getElementById('pantalla-registro');
const pantallaApp = document.getElementById('pantalla-app');
const tituloSeccion = document.getElementById('titulo-seccion');

// Perfil
const formularioUsuario = document.getElementById('formulario-usuario');
const btnAvatar = document.getElementById('btn-avatar');
const avatarInicial = document.getElementById('avatar-inicial');
const menuPerfil = document.getElementById('menu-perfil');
const menuNombreUsuario = document.getElementById('menu-nombre-usuario');
const menuCorreoUsuario = document.getElementById('menu-correo-usuario');

// Listas y Fechas
const listaHoy = document.getElementById('lista-hoy');
const listaTrabajosPendientes = document.getElementById('lista-trabajos-pendientes');
const listaTrabajosCompletados = document.getElementById('lista-trabajos-completados');
const listaHabitosEstudio = document.getElementById('lista-habitos-estudio');
const contenedorFechas = document.getElementById('contenedor-fechas');

// Modales
const modalCrear = document.getElementById('modal-crear');
const inputTipo = document.getElementById('input-tipo');
const campoFechaContenedor = document.getElementById('campo-fecha-contenedor');
const modalEditar = document.getElementById('modal-editar');
const editNombre = document.getElementById('edit-nombre');
const editFecha = document.getElementById('edit-fecha');
let idElementoEnEdicion = null;
let tipoElementoEnEdicion = null;

// Datos
let perfilUsuario = JSON.parse(localStorage.getItem('perfil_aula_organizada')) || null;
let tareas = JSON.parse(localStorage.getItem('tareas_aula_organizada')) || [];
let habitos = JSON.parse(localStorage.getItem('habitos_aula')) || [];

let fechaHoyRealStr = obtenerFechaString(new Date());
let fechaSeleccionadaStr = fechaHoyRealStr;

document.addEventListener('DOMContentLoaded', () => {
    if (perfilUsuario) {
        mostrarPantallaApp();
    } else {
        mostrarPantallaRegistro();
    }
});

function obtenerFechaString(fecha) {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function mostrarPantallaRegistro() {
    pantallaRegistro.style.display = 'flex';
}

function mostrarPantallaApp() {
    pantallaRegistro.style.display = 'none';
    avatarInicial.textContent = perfilUsuario.nombre.charAt(0).toUpperCase();
    menuNombreUsuario.textContent = perfilUsuario.nombre;
    menuCorreoUsuario.textContent = perfilUsuario.correo;

    fechaHoyRealStr = obtenerFechaString(new Date());
    generarTiraMeses();
    renderizarTodo();
}

function generarTiraMeses() {
    contenedorFechas.innerHTML = '';
    const hoy = new Date();
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);

    let aux = new Date(inicio);
    let elementoHoyDOM = null;

    while (aux <= fin) {
        const fechaStr = obtenerFechaString(aux);
        const div = document.createElement('div');
        
        let clases = 'dia-item';
        if (fechaStr === fechaHoyRealStr) clases += ' es-hoy-real';
        if (fechaStr === fechaSeleccionadaStr) clases += ' activo';
        
        div.className = clases;
        div.innerHTML = `
            <span class="mes-tag">${meses[aux.getMonth()]}</span>
            <div>${dias[aux.getDay()]}</div>
            <span class="num-dia">${aux.getDate()}</span>
        `;
        div.onclick = () => seleccionarFecha(fechaStr, div);

        if (fechaStr === fechaHoyRealStr) elementoHoyDOM = div;
        contenedorFechas.appendChild(div);
        aux.setDate(aux.getDate() + 1);
    }

    if (elementoHoyDOM) {
        setTimeout(() => elementoHoyDOM.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 100);
    }
}

function seleccionarFecha(fechaStr, elemento) {
    document.querySelectorAll('.dia-item').forEach(el => el.classList.remove('activo'));
    elemento.classList.add('activo');
    fechaSeleccionadaStr = fechaStr;
    renderizarTodo();
}

function cambiarTab(idTab, btn, titulo) {
    document.querySelectorAll('.vista-tab').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('activo'));
    document.getElementById(idTab).style.display = 'block';
    btn.classList.add('activo');
    tituloSeccion.textContent = titulo;
}

function abrirModalCrear() {
    document.getElementById('input-fecha').value = fechaSeleccionadaStr;
    modalCrear.style.display = 'flex';
}

function cerrarModalCrear() {
    modalCrear.style.display = 'none';
    document.getElementById('formulario-crear-general').reset();
    campoFechaContenedor.style.display = 'flex';
}

function cambiarTipoElemento(val) {
    if (val === 'habito') {
        campoFechaContenedor.style.display = 'none';
    } else {
        campoFechaContenedor.style.display = 'flex';
    }
}

// Formulario General Creación
document.getElementById('formulario-crear-general').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('input-nombre').value.trim();
    const tipo = inputTipo.value;

    if (tipo === 'trabajo') {
        tareas.push({
            id: Date.now(),
            nombre: nombre,
            fechaCreacion: fechaSeleccionadaStr,
            fechaEntrega: document.getElementById('input-fecha').value || fechaSeleccionadaStr,
            completado: false
        });
        localStorage.setItem('tareas_aula_organizada', JSON.stringify(tareas));
    } else {
        habitos.push({
            id: Date.now(),
            nombre: nombre,
            diasCumplidos: [false, false, false, false, false, false, false]
        });
        localStorage.setItem('habitos_aula', JSON.stringify(habitos));
    }

    cerrarModalCrear();
    renderizarTodo();
});

// Renderizado General
function renderizarTodo() {
    // 1. Vista Hoy (Tareas activas en el rango de fechas)
    listaHoy.innerHTML = '';
    const tareasDelDia = tareas.filter(item => fechaSeleccionadaStr >= item.fechaCreacion && fechaSeleccionadaStr <= item.fechaEntrega);

    if (tareasDelDia.length === 0) {
        listaHoy.innerHTML = `
            <div class="estado-vacio-contenedor">
                <p class="estado-vacio-linea1">No tienes pendientes</p>
                <p class="estado-vacio-linea2">¡Agrega uno!</p>
            </div>
        `;
    } else {
        tareasDelDia.forEach(item => {
            const div = document.createElement('div');
            div.className = `item-habitnow ${item.completado ? 'completado' : ''}`;
            div.innerHTML = `
                <div class="item-izq">
                    <div class="check-circulo" onclick="toggleTarea(${item.id})">${item.completado ? '✓' : ''}</div>
                    <div class="item-info">
                        <span class="item-titulo">${item.nombre}</span>
                        <span class="tag-tipo-badge">Entrega: ${item.fechaEntrega}</span>
                    </div>
                </div>
                <div class="item-acciones">
                    <button class="btn-accion" onclick="abrirEditarTarea(${item.id})">✏️</button>
                    <button class="btn-accion" onclick="borrarTarea(${item.id})">🗑</button>
                </div>
            `;
            listaHoy.appendChild(div);
        });
    }

    // 2. Vista Trabajos
    listaTrabajosPendientes.innerHTML = '';
    listaTrabajosCompletados.innerHTML = '';
    tareas.forEach(t => {
        const div = document.createElement('div');
        div.className = `item-habitnow ${t.completado ? 'completado' : ''}`;
        div.innerHTML = `
            <div class="item-izq">
                <div class="check-circulo" onclick="toggleTarea(${t.id})">${t.completado ? '✓' : ''}</div>
                <div class="item-info">
                    <span class="item-titulo">${t.nombre}</span>
                    <span class="item-sub">📅 Entrega: ${t.fechaEntrega}</span>
                </div>
            </div>
            <button class="btn-accion" onclick="borrarTarea(${t.id})">🗑</button>
        `;
        if (t.completado) listaTrabajosCompletados.appendChild(div);
        else listaTrabajosPendientes.appendChild(div);
    });

    // 3. Vista Hábitos (Estilo HabitNow circular semanal)
    listaHabitosEstudio.innerHTML = '';
    const diasNombres = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    habitos.forEach(h => {
        const div = document.createElement('div');
        div.className = 'tarjeta-habito-completa';
        let diasHtml = h.diasCumplidos.map((cumplido, i) => `
            <div class="circulo-dia ${cumplido ? 'cumplido' : ''}" onclick="toggleHabitoDia(${h.id}, ${i})">${diasNombres[i]}</div>
        `).join('');

        div.innerHTML = `
            <div class="habito-header">
                <strong>${h.nombre}</strong>
                <button class="btn-accion" onclick="borrarHabito(${h.id})">🗑</button>
            </div>
            <div class="dias-semana-circulos">${diasHtml}</div>
        `;
        listaHabitosEstudio.appendChild(div);
    });
}

function toggleTarea(id) {
    const idx = tareas.findIndex(x => x.id === id);
    tareas[idx].completado = !tareas[idx].completado;
    localStorage.setItem('tareas_aula_organizada', JSON.stringify(tareas));
    renderizarTodo();
}

function toggleHabitoDia(id, diaIndex) {
    const idx = habitos.findIndex(x => x.id === id);
    if (idx !== -1) {
        habitos[idx].diasCumplidos[diaIndex] = !habitos[idx].diasCumplidos[diaIndex];
        localStorage.setItem('habitos_aula', JSON.stringify(habitos));
        renderizarTodo();
    }
}

function borrarTarea(id) {
    tareas = tareas.filter(x => x.id !== id);
    localStorage.setItem('tareas_aula_organizada', JSON.stringify(tareas));
    renderizarTodo();
}

function borrarHabito(id) {
    habitos = habitos.filter(x => x.id !== id);
    localStorage.setItem('habitos_aula', JSON.stringify(habitos));
    renderizarTodo();
}

function abrirEditarTarea(id) {
    const item = tareas.find(x => x.id === id);
    if (!item) return;
    idElementoEnEdicion = id;
    tipoElementoEnEdicion = 'tarea';
    editNombre.value = item.nombre;
    editFecha.value = item.fechaEntrega;
    modalEditar.style.display = 'flex';
}

function cerrarModalEditar() {
    modalEditar.style.display = 'none';
    idElementoEnEdicion = null;
}

function guardarEdicionModal() {
    if (tipoElementoEnEdicion === 'tarea') {
        const idx = tareas.findIndex(x => x.id === idElementoEnEdicion);
        if (idx !== -1) {
            tareas[idx].nombre = editNombre.value.trim();
            tareas[idx].fechaEntrega = editFecha.value;
            localStorage.setItem('tareas_aula_organizada', JSON.stringify(tareas));
            renderizarTodo();
        }
    }
    cerrarModalEditar();
}

// Configuración de Perfil
btnAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPerfil.style.display = menuPerfil.style.display === 'none' ? 'flex' : 'none';
});

document.addEventListener('click', () => menuPerfil.style.display = 'none');

formularioUsuario.addEventListener('submit', (e) => {
    e.preventDefault();
    perfilUsuario = {
        nombre: document.getElementById('nombre-usuario').value.trim(),
        correo: document.getElementById('correo-usuario').value.trim()
    };
    localStorage.setItem('perfil_aula_organizada', JSON.stringify(perfilUsuario));
    mostrarPantallaApp();
});

document.getElementById('btn-cambiar-usuario').addEventListener('click', () => {
    pantallaRegistro.style.display = 'flex';
});

document.getElementById('btn-borrar-cuenta').addEventListener('click', () => {
    if (confirm("¿Borrar cuenta y datos?")) {
        localStorage.clear();
        location.reload();
    }
});