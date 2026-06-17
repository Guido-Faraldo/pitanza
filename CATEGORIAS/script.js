const botonSumar = document.getElementById("botonSumar");
const overlay = document.getElementById("overlay");
const botonCerrarModal = document.getElementById("botonCerrarModal");
const inputCategoria = document.getElementById("inputCategoria");
const botonGuardar = document.getElementById("botonGuardar");
const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
const mensajeInput = document.getElementById("mensajeErrorInput");
const tbody = document.querySelector("tbody");
const mensajeListaVacia = document.createElement("p");
const btnNo = document.getElementById("botonNo");
const btnSi = document.getElementById("botonSi");
const overlaySeguridad = document.getElementById("overlaySeguridad");
const titulo = document.querySelector("h1");
const pregunta = document.getElementById("textoEliminacionCategoria");
let timeoutMensaje;
let categoriaEditando = null;
mensajeListaVacia.classList.add("textoListaVacia");

botonSumar.addEventListener("click", () => {
    overlay.style.display = "flex";
    inputCategoria.focus();
});

botonCerrarModal.addEventListener("click", () => {
    overlay.style.display = "none";
    inputCategoria.value = "";
    categoriaEditando = null;
});

botonGuardar.addEventListener("click", () => {
    let nuevaCategoria = inputCategoria.value.trim();
    if (nuevaCategoria === "") {
        mostrarMensajeError(
            "Error, ingresa al menos una palabra",
            mensajeInput
        );
        return;
    }
    nuevaCategoria = capitalizar(nuevaCategoria);
    const categoriaExiste = categorias.some(
        categoria =>
            categoria.toLowerCase() === nuevaCategoria.toLowerCase()
    );
    if (
        categoriaExiste &&
        (!categoriaEditando ||
        categoriaEditando.categoriaOriginal.toLowerCase() !== nuevaCategoria.toLowerCase())
    ) {
        mostrarMensajeError(
            "Error, esa categoria ya existe",
            mensajeInput
        );
        return;
    }
    if (categoriaEditando) {
        categoriaEditando.textoCategoria.textContent = nuevaCategoria;
        const indice = categorias.indexOf(
            categoriaEditando.categoriaOriginal
        );
        categorias[indice] = nuevaCategoria;
        if (indice !== -1) {
            categorias[indice] = nuevaCategoria;
        }
    } else {
        categorias.push(nuevaCategoria);
        agregarCategoriaHTML(nuevaCategoria);
    }
    localStorage.setItem(
        "categorias",
        JSON.stringify(categorias)
    );
    inputCategoria.value = "";
    overlay.style.display = "none";
    actualizarMensajeListaVacia();
});

function mostrarMensajeError(mensaje, parrafo) {
    clearTimeout(timeoutMensaje);
    parrafo.textContent = mensaje;
    parrafo.style.display = "block";
    parrafo.style.opacity = "0";
    parrafo.style.transform = "translateY(10px)";
    setTimeout(() => {
        parrafo.style.opacity = "1";
        parrafo.style.transform = "translateY(0)";
    }, 10);
    timeoutMensaje = setTimeout(() => {
        parrafo.style.opacity = "0";
        setTimeout(() => {
            parrafo.style.display = "none";
            parrafo.style.transform = "translateY(10px)";
        }, 500);
    }, 4000);
}

function agregarCategoriaHTML(categoria) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    const contenedor = document.createElement("div");
    const contBotones = document.createElement("div");
    contenedor.classList.add("filaCategoria");
    const textoCategoria = document.createElement("span");
    textoCategoria.textContent = categoria;
    const botonEliminar = document.createElement("button");
    const botonEditar = document.createElement("button");
    botonEliminar.textContent = "🗑";
    botonEditar.textContent = "✏️"
    contBotones.classList.add("botonesConfiguracion");
    botonEliminar.classList.add("btnEliminar");
    botonEditar.classList.add("btnEditar");
    botonEliminar.classList.add("btnConfig");
    botonEditar.classList.add("btnConfig");
    contenedor.appendChild(textoCategoria);
    contBotones.appendChild(botonEditar);
    contBotones.appendChild(botonEliminar);
    celda.appendChild(contenedor);
    contenedor.appendChild(contBotones);
    fila.appendChild(celda);
    tbody.appendChild(fila);

    botonEliminar.addEventListener("click", () => {
        overlaySeguridad.style.display = "flex";
        const nombreActual = textoCategoria.textContent;
        pregunta.textContent = `¿Seguro que deseas eliminar la categoria: "${nombreActual}"?`;
        btnSi.onclick = () => {
            fila.remove();
            const indice = categorias.indexOf(nombreActual);
            categorias.splice(indice, 1);
            localStorage.setItem("categorias", JSON.stringify(categorias));
            overlaySeguridad.style.display = "none"
            botonSumar.classList.remove("sinHover");
            pregunta.textContent = "";
            actualizarMensajeListaVacia();
        }
    });
    
    botonEditar.addEventListener("click", () => {
        overlay.style.display = "flex";
        inputCategoria.value = textoCategoria.textContent;
        inputCategoria.focus();
        inputCategoria.select();
        categoriaEditando = {
            categoriaOriginal: textoCategoria.textContent,
            textoCategoria: textoCategoria
        };
    });
}

categorias.forEach(categoria => {
    agregarCategoriaHTML(categoria);
});

function capitalizar(texto) {
    return texto
        .toLowerCase()
        .split(" ")
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(" ");
}

function actualizarMensajeListaVacia() {
    if (categorias.length === 0) {
        mensajeListaVacia.textContent = "Todavia no se agregaron categorias";
        mensajeListaVacia.style.textAlign = "center";
        titulo.insertAdjacentElement("afterend", mensajeListaVacia);
    } else {
        mensajeListaVacia.remove();
    }
}

actualizarMensajeListaVacia();

btnNo.addEventListener("click", () => {
    overlaySeguridad.style.display = "none"
})

inputCategoria.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        botonGuardar.click();
    }
});