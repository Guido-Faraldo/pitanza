const overlay = document.getElementById("overlay");
const botonCerrarModal = document.getElementById("botonCerrarModal");
const botonSumar = document.getElementById("botonSumar");
const botonGuardar = document.getElementById("botonGuardar");
const inputNombre = document.getElementById("inputNombre");
const inputPrecio = document.getElementById("inputPrecio");
const inputCategoria = document.getElementById("inputCategoria");
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
const tbody = document.querySelector("tbody");
const parrafoError = document.getElementById("mensajeError");
const mensajeListaVacia = document.createElement("p");
const titulo = document.querySelector("h1");
const btnNo = document.getElementById("botonNo");
const btnSi = document.getElementById("botonSi");
const overlaySeguridad = document.getElementById("overlaySeguridad");
const pregunta = document.getElementById("textoEliminacionProducto");
pregunta.textContent = `¿Seguro que deseas eliminar el producto?`;
let timeoutMensaje;
let productoEditando = null;

botonSumar.addEventListener("click", () => {
    productoEditando = null;
    limpiarFormulario();
    overlay.style.display = "flex";
    inputNombre.focus();
});

botonCerrarModal.addEventListener("click", () => {
    overlay.style.display = "none";
    productoEditando = null;
    limpiarFormulario();
});

inputNombre.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        inputPrecio.focus();
    }
});

inputPrecio.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        inputCategoria.focus();
    }
});

inputCategoria.addEventListener("change", () => {
    botonGuardar.focus();
});

botonGuardar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        botonGuardar.click();
    }
});

botonGuardar.addEventListener("click", () => {
    let nombreProducto = inputNombre.value.trim();
    let precioProducto = inputPrecio.value.trim();
    let categoriaProducto = inputCategoria.value;

    if (nombreProducto === "" || precioProducto === "" || categoriaProducto === "") {
        mostrarMensajeError("Error, ningún campo debe estar vacío", parrafoError);
        return;
    }

    nombreProducto = capitalizar(nombreProducto);

    let productoExiste = productos.some(
        producto =>
            producto.nombre.toLowerCase() === nombreProducto.toLowerCase()
    );

    if (
        productoExiste &&
        (
            !productoEditando ||
            productoEditando.nombre.toLowerCase() !== nombreProducto.toLowerCase()
        )
    ) {
        mostrarMensajeError(
            "Error, ese producto ya existe",
            parrafoError
        );
        return;
    }

    if (productoEditando) {

        productoEditando.nombre = nombreProducto;
        productoEditando.precio = Number(precioProducto);
        productoEditando.categoria = categoriaProducto;

    } else {

        let producto = {
            id: Date.now(),
            nombre: nombreProducto,
            precio: Number(precioProducto),
            categoria: categoriaProducto
        };

        productos.push(producto);
    }

    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarProductos();

    actualizarMensajeListaVacia()

    limpiarFormulario()

    overlay.style.display = "none";
    productoEditando = null;
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("botonEditar")) {

        let id = Number(e.target.dataset.id);

        let producto = productos.find(
            producto => producto.id === id
        );

        productoEditando = producto;

        inputNombre.value = producto.nombre;
        inputPrecio.value = producto.precio;
        inputCategoria.value = producto.categoria;

        overlay.style.display = "flex";
        inputNombre.focus();
        inputNombre.select();
    }
});

categorias.forEach(categoria => {
    let opcion = document.createElement("option");

    opcion.value = categoria;
    opcion.textContent = categoria;

    inputCategoria.appendChild(opcion);
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

function mostrarProductos() {
    tbody.innerHTML = "";

    productos.forEach(producto => {

        let fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toLocaleString("es-AR")}</td>
            <td>${producto.categoria}</td>
            <td>
                <div class="botonesConfig">
                    <button class="botonEditar botonesEditar" data-id="${producto.id}">✏️</button>
                    <button class="botonEliminar botonesEditar" data-id="${producto.id}">🗑</button>
                </div>
            </td>
        `;

        tbody.appendChild(fila);

    });

}

btnNo.addEventListener("click", () => {
    btnSi.onclick = null;
    overlaySeguridad.style.display = "none";
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("botonEliminar")) {

        let id = Number(e.target.dataset.id);

        overlaySeguridad.style.display = "flex";

        btnSi.onclick = () => {

            productos = productos.filter(
                producto => producto.id !== id
            );

            localStorage.setItem(
                "productos",
                JSON.stringify(productos)
            );

            mostrarProductos();
            actualizarMensajeListaVacia();

            overlaySeguridad.style.display = "none";
        };
    }
});

function actualizarMensajeListaVacia() {
    if (productos.length === 0) {
        mensajeListaVacia.textContent = "Todavia no se agregaron productos";
        mensajeListaVacia.style.textAlign = "center";
        titulo.insertAdjacentElement("afterend", mensajeListaVacia);
    } else {
        mensajeListaVacia.remove();
    }
}

function limpiarFormulario() {
    inputNombre.value = "";
    inputPrecio.value = "";
    inputCategoria.value = "";
}

function capitalizar(texto) {
    return texto
        .toLowerCase()
        .split(" ")
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(" ");
}

mostrarProductos();
actualizarMensajeListaVacia()