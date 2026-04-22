const CLAVE_ALMACENAMIENTO = "mis_tareas_dia";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formularioTarea = $("#formularioTarea");
const entradaTarea = $("#entradaTarea");
const entradaPrioridad = $("#entradaPrioridad");
const entradaFecha = $("#entradaFecha");
const listaTareas = $("#listaTareas");
const estadoVacio = $("#estadoVacio");

const contadorTotal = $("#contadorTotal");
const contadorPendientes = $("#contadorPendientes");
const contadorCompletadas = $("#contadorCompletadas");

const botonLimpiarCompletadas = $("#botonLimpiarCompletadas");
const botonMenu = $("#botonMenu");
const barraLateral = $("#barraLateral");

let filtroActual = "todas";
let tareas = cargarTareas();

iniciarAplicacion();

function iniciarAplicacion() {
  establecerFechaMinima();
  asignarEventos();
  renderizarTareas();
}

function asignarEventos() {
  formularioTarea.addEventListener("submit", agregarTarea);

  $$(".boton-filtro").forEach((boton) => {
    boton.addEventListener("click", () => {
      filtroActual = boton.dataset.filtro;
      activarBoton($$(".boton-filtro"), boton);
      renderizarTareas();
    });
  });

  $$(".boton-menu").forEach((boton) => {
    boton.addEventListener("click", () => {
      const vista = boton.dataset.vista;

      activarBoton($$(".boton-menu"), boton);

      if (
        vista === "todas" ||
        vista === "pendientes" ||
        vista === "completadas"
      ) {
        filtroActual = vista;
        sincronizarFiltros();
        renderizarTareas();
      }

      if (window.innerWidth <= 1023) {
        barraLateral.classList.remove("mostrar");
      }
    });
  });

  botonLimpiarCompletadas.addEventListener("click", limpiarTareasCompletadas);

  botonMenu.addEventListener("click", () => {
    barraLateral.classList.toggle("mostrar");
  });

  document.addEventListener("click", (evento) => {
    const clicDentroBarra = barraLateral.contains(evento.target);
    const clicEnBotonMenu = botonMenu.contains(evento.target);

    if (
      window.innerWidth <= 1023 &&
      barraLateral.classList.contains("mostrar") &&
      !clicDentroBarra &&
      !clicEnBotonMenu
    ) {
      barraLateral.classList.remove("mostrar");
    }
  });
}

function agregarTarea(evento) {
  evento.preventDefault();

  const nombre = entradaTarea.value.trim();
  const prioridad = entradaPrioridad.value;
  const fecha = entradaFecha.value;

  if (!nombre || !fecha) return;

  const nuevaTarea = {
    id: crypto.randomUUID(),
    nombre: nombre,
    prioridad: prioridad,
    fecha: fecha,
    completada: false
  };

  tareas.unshift(nuevaTarea);
  guardarTareas();
  renderizarTareas();

  formularioTarea.reset();
  entradaPrioridad.value = "Media";
}

function cambiarEstadoTarea(id) {
  tareas = tareas.map((tarea) => {
    if (tarea.id === id) {
      return {
        id: tarea.id,
        nombre: tarea.nombre,
        prioridad: tarea.prioridad,
        fecha: tarea.fecha,
        completada: !tarea.completada
      };
    }

    return tarea;
  });

  guardarTareas();
  renderizarTareas();
}

function eliminarTarea(id) {
  tareas = tareas.filter((tarea) => tarea.id !== id);
  guardarTareas();
  renderizarTareas();
}

function limpiarTareasCompletadas() {
  tareas = tareas.filter((tarea) => !tarea.completada);
  guardarTareas();
  renderizarTareas();
}

function obtenerTareasFiltradas() {
  if (filtroActual === "pendientes") {
    return tareas.filter((tarea) => !tarea.completada);
  }

  if (filtroActual === "completadas") {
    return tareas.filter((tarea) => tarea.completada);
  }

  return tareas;
}

function renderizarTareas() {
  const tareasFiltradas = obtenerTareasFiltradas();

  actualizarContadores();
  limpiarListaTareas();

  if (tareasFiltradas.length === 0) {
    estadoVacio.style.display = "block";
    return;
  }

  estadoVacio.style.display = "none";

  tareasFiltradas.forEach((tarea) => {
    const itemTarea = crearItemTarea(tarea);
    listaTareas.appendChild(itemTarea);
  });
}

function limpiarListaTareas() {
  while (listaTareas.firstChild) {
    listaTareas.removeChild(listaTareas.firstChild);
  }
}

function crearItemTarea(tarea) {
  const item = document.createElement("div");
  item.className = "item-tarea";

  if (tarea.completada) {
    item.classList.add("completada");
  }

  const marcador = crearMarcadorTarea(tarea);
  const contenido = crearContenidoTarea(tarea);
  const fecha = crearFechaTarea(tarea);
  const acciones = crearAccionesTarea(tarea);

  item.appendChild(marcador);
  item.appendChild(contenido);
  item.appendChild(fecha);
  item.appendChild(acciones);

  return item;
}

function crearMarcadorTarea(tarea) {
  const marcador = document.createElement("input");
  marcador.type = "checkbox";
  marcador.className = "marcador-tarea";
  marcador.checked = tarea.completada;

  marcador.addEventListener("change", () => {
    cambiarEstadoTarea(tarea.id);
  });

  return marcador;
}

function crearContenidoTarea(tarea) {
  const contenido = document.createElement("div");
  contenido.className = "contenido-tarea";

  const nombre = document.createElement("label");
  nombre.className = "nombre-tarea";
  nombre.textContent = tarea.nombre;

  const prioridad = document.createElement("label");
  prioridad.className = "etiqueta-prioridad";
  prioridad.textContent = tarea.prioridad;

  contenido.appendChild(nombre);
  contenido.appendChild(prioridad);

  return contenido;
}

function crearFechaTarea(tarea) {
  const fecha = document.createElement("label");
  fecha.className = "fecha-tarea";
  fecha.textContent = formatearFecha(tarea.fecha);
  return fecha;
}

function crearAccionesTarea(tarea) {
  const acciones = document.createElement("div");
  acciones.className = "acciones-tarea";

  const botonCambiar = document.createElement("button");
  botonCambiar.type = "button";
  botonCambiar.className = "boton-accion boton-cambiar";
  botonCambiar.textContent = "✓";

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "boton-accion boton-eliminar";
  botonEliminar.textContent = "🗑";

  botonCambiar.addEventListener("click", () => {
    cambiarEstadoTarea(tarea.id);
  });

  botonEliminar.addEventListener("click", () => {
    eliminarTarea(tarea.id);
  });

  acciones.appendChild(botonCambiar);
  acciones.appendChild(botonEliminar);

  return acciones;
}

function actualizarContadores() {
  const total = tareas.length;
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = total - completadas;

  contadorTotal.textContent = total;
  contadorPendientes.textContent = pendientes;
  contadorCompletadas.textContent = completadas;
}

function activarBoton(listaBotones, botonActivo) {
  listaBotones.forEach((boton) => {
    boton.classList.remove("activo");
  });

  botonActivo.classList.add("activo");
}

function sincronizarFiltros() {
  $$(".boton-filtro").forEach((boton) => {
    if (boton.dataset.filtro === filtroActual) {
      boton.classList.add("activo");
    } else {
      boton.classList.remove("activo");
    }
  });
}

function guardarTareas() {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(tareas));
}

function cargarTareas() {
  const tareasGuardadas = localStorage.getItem(CLAVE_ALMACENAMIENTO);

  if (!tareasGuardadas) {
    return obtenerTareasPorDefecto();
  }

  try {
    return JSON.parse(tareasGuardadas);
  } catch (error) {
    return obtenerTareasPorDefecto();
  }
}

function obtenerTareasPorDefecto() {
  const hoy = new Date();

  function sumarDias(dias) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split("T")[0];
  }

  return [
    {
      id: crypto.randomUUID(),
      nombre: "Estudiar JavaScript",
      prioridad: "Media",
      fecha: sumarDias(0),
      completada: false
    },
    {
      id: crypto.randomUUID(),
      nombre: "Diseñar la interfaz de la app",
      prioridad: "Alta",
      fecha: sumarDias(0),
      completada: false
    },
    {
      id: crypto.randomUUID(),
      nombre: "Hacer ejercicio",
      prioridad: "Baja",
      fecha: sumarDias(1),
      completada: true
    }
  ];
}

function establecerFechaMinima() {
  entradaFecha.min = new Date().toISOString().split("T")[0];
}

function formatearFecha(fechaTexto) {
  const fecha = new Date(fechaTexto + "T00:00:00");
  return fecha.toLocaleDateString("es-ES");
}