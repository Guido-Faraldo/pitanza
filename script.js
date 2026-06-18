const botonCerrarModal = document.getElementById("botonCerrarModal");
const botonMesas = document.querySelectorAll(".mesa:not(.mesaInvisible)");
const botonTacho = document.getElementById("tachoBasura");
const overlay = document.getElementById("overlay");
const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
const inputBusqueda = document.getElementById("inputBusqueda");
const contenedorCategorias = document.getElementById("categorias");
const productos = JSON.parse(localStorage.getItem("productos")) || [];
const contenedorProductos = document.getElementById("productos");
const resultadosBusqueda = document.getElementById("resultadosBusqueda");
const btnCambiarMesa = document.getElementById("botonMoverMesa");
const overlayCambioMesa = document.getElementById("CambiodeMesa");
const btnCerrarModalCambioMesa = document.getElementById("botonCerrarModalCambioMesa");
const inputCambioMesa = document.getElementById("inputCambioMesa");
const contenedorPedidos = document.getElementById("pedidos");
let pedidosMesas = JSON.parse(localStorage.getItem("pedidosMesas")) || {};
let pedido = [];
let mesaActual = null;

botonMesas.forEach(mesa => {
    mesa.addEventListener("click", () => {
        mesaActual = mesa.dataset.id;
        if (!pedidosMesas[mesaActual]) {
            pedidosMesas[mesaActual] = [];
        }
        pedido = pedidosMesas[mesaActual];
        mostrarPedido();
        guardarMesa();
        actualizarMesa(mesaActual);
        overlay.style.display = "flex";
    });
});

function agregarProductoAPedido(producto) {
    const productoExistente = pedido.find(
        p => p.id === producto.id
    );
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        pedido.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    mostrarPedido();
    guardarMesa();
    actualizarMesa(mesaActual);
}

botonCerrarModal.addEventListener("click", () => {
    overlay.style.display = "none";
    vaciarInput()
    resultadosBusqueda.style.display = "none";
});

botonTacho.addEventListener("click", () => {
    overlay.style.display = "none";
    vaciarInput()
    resultadosBusqueda.style.display = "none";

    pedido.length = 0;

    guardarMesa();
    actualizarMesa(mesaActual);
    mostrarPedido();
});

function actualizarMesa(numeroMesa) {
    const mesa = document.querySelector(
        `.mesa[data-id="${numeroMesa}"]`
    );
    const pedidoMesa = pedidosMesas[numeroMesa] || [];
    const total = pedidoMesa.reduce(
        (acumulador, item) =>
            acumulador + (item.precio * item.cantidad),
        0
    );
    if (total > 0) {
        mesa.classList.add("mesaOcupada");
        mesa.innerHTML = `
            <div>${numeroMesa}</div>
            <small>
                $${total.toLocaleString("es-AR")}
            </small>
        `;
    } else {
        mesa.classList.remove("mesaOcupada");
        mesa.textContent = numeroMesa;
    }
}

categorias.forEach(categoria => {
    const boton = document.createElement("button");
    boton.classList.add("categoria");
    boton.textContent = categoria;
    contenedorCategorias.appendChild(boton);
    boton.addEventListener("click", () => {
        document.querySelectorAll(".categoria").forEach(b => {
            b.classList.remove("categoriaSeleccionada");
        });
        boton.classList.add("categoriaSeleccionada");
        mostrarProductosPorCategoria(categoria);
    });
});

function guardarMesa() {
    pedidosMesas[mesaActual] = pedido;
    localStorage.setItem(
        "pedidosMesas",
        JSON.stringify(pedidosMesas)
    );
    actualizarColorMesa(mesaActual);
}

inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase().trim();
    resultadosBusqueda.innerHTML = "";
    if (texto === "") {
        resultadosBusqueda.style.display = "none";
        return;
    }
    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(texto)
    );
    productosFiltrados.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("resultadoBusqueda");
        div.textContent =
            `${producto.nombre}`;

        div.addEventListener("click", () => {
            agregarProductoAPedido(producto);
                
            inputBusqueda.value = "";
            resultadosBusqueda.innerHTML = "";
            resultadosBusqueda.style.display = "none";
        });
        resultadosBusqueda.appendChild(div);
    });
    resultadosBusqueda.style.display = productosFiltrados.length > 0 ? "block" : "none";
});

function mostrarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";
    listaProductos.forEach(producto => {
        const boton = document.createElement("button");
        boton.textContent =
            `${producto.nombre}`;
        contenedorProductos.appendChild(boton);
    });
}

function mostrarProductosPorCategoria(categoriaSeleccionada) {
    console.log("Categoría seleccionada:", categoriaSeleccionada);
    contenedorProductos.innerHTML = "";
    const productosFiltrados = productos.filter(producto =>
        producto.categoria === categoriaSeleccionada
    );
    productosFiltrados.forEach(producto => {
        const botonProducto = document.createElement("button");
        botonProducto.classList.add("producto");
        botonProducto.textContent =
            `${producto.nombre}`;
        contenedorProductos.appendChild(botonProducto);

        botonProducto.addEventListener("click", () => {
            agregarProductoAPedido(producto);
        });
    });
}

function mostrarPedido() {
    contenedorPedidos.innerHTML = "";
    pedido.forEach(item => {
        const fila = document.createElement("div");
        fila.classList.add("filaPedido");
        fila.innerHTML = `
            <span
                class="nombrePedido"
                data-id="${item.id}"
                contenteditable="true">
                ${item.nombre}
            </span>
        
            <div class="controlesCantidad">
                <button class="menos"
                    data-id="${item.id}">
                    -
                </button>
                <span>${item.cantidad}</span>
                <button class="mas"
                    data-id="${item.id}">
                    +
                </button>
            </div>
        
            <span
                class="precioPedido"
                data-id="${item.id}"
                contenteditable="true">
                $${(item.precio * item.cantidad).toLocaleString("es-AR")}
            </span>
        `;
        contenedorPedidos.appendChild(fila);
    });
    actualizarTotal();
}

function actualizarColorMesa(numeroMesa) {
    const mesa = document.querySelector(
        `.mesa[data-id="${numeroMesa}"]`
    );
    if (!mesa) return;
    if (
        pedidosMesas[numeroMesa] &&
        pedidosMesas[numeroMesa].length > 0
    ) {
        mesa.classList.add("mesaOcupada");
    } else {
        mesa.classList.remove("mesaOcupada");
    }
}

function actualizarTotal() {
    const total = pedido.reduce(
        (acumulador, item) =>
            acumulador + (item.precio * item.cantidad),
        0
    );
    document.getElementById("precioTotal").textContent =
    "$" + total.toLocaleString("es-AR");
}

document.addEventListener("blur", e => {
    if (e.target.classList.contains("precioPedido")) {
        const id = Number(e.target.dataset.id);
        const item = pedido.find(
            p => p.id === id
        );
        let nuevoPrecio = e.target.textContent
            .replace(/[^0-9]/g, "");
        if (nuevoPrecio) {
            item.precio =
                Number(nuevoPrecio) / item.cantidad;
        }
        mostrarPedido();
        guardarMesa();
        actualizarMesa(mesaActual);
    }
}, true);

document.addEventListener("blur", e => {
    if (e.target.classList.contains("nombrePedido")) {
        const id = Number(e.target.dataset.id);
        const item = pedido.find(
            p => p.id === id
        );
        const nuevoNombre = e.target.textContent.trim();
        if (nuevoNombre) {
            item.nombre = nuevoNombre;
        }
        mostrarPedido();
        guardarMesa();
        actualizarMesa(mesaActual);
    }
}, true);

document.addEventListener("click", e => {
    if (e.target.classList.contains("mas")) {
        const id = Number(e.target.dataset.id);
        const item = pedido.find(
            p => p.id === id
        );
        item.cantidad++;
        mostrarPedido();
        guardarMesa();
        actualizarMesa(mesaActual);
    }

    if (e.target.classList.contains("menos")) {
        const id = Number(e.target.dataset.id);
        const item = pedido.find(
            p => p.id === id
        );
        item.cantidad--;
        if (item.cantidad <= 0) {
            pedido = pedido.filter(
                p => p.id !== id
            );
        }
        mostrarPedido();
        guardarMesa();
        actualizarMesa(mesaActual);
    }
});

function vaciarInput(){
    inputBusqueda.value = "";
}

if (categorias.length > 0) {
    contenedorCategorias.firstElementChild
        .classList.add("categoriaSeleccionada");
    mostrarProductosPorCategoria(categorias[0]);
}

Object.keys(pedidosMesas).forEach(numeroMesa => {
    actualizarColorMesa(numeroMesa);
});
Object.keys(pedidosMesas).forEach(numeroMesa => {
    actualizarMesa(numeroMesa);
});

btnCambiarMesa.addEventListener("click", () =>{
    inputCambioMesa.selectedIndex = 0;
    overlayCambioMesa.style.display = "flex";
});

btnCerrarModalCambioMesa.addEventListener("click", () =>{
    overlayCambioMesa.style.display = "none";
});

const mesasOrdenadas = [...botonMesas].sort(
    (a, b) =>
        Number(a.dataset.id) -
        Number(b.dataset.id)
);

mesasOrdenadas.forEach(mesa => {
    const option = document.createElement("option");
    option.value = mesa.dataset.id;
    option.textContent = `Mesa ${mesa.dataset.id}`;
    inputCambioMesa.appendChild(option);
});

inputCambioMesa.addEventListener("change", () => {
    const mesaDestino = inputCambioMesa.value;

    if (pedido.length === 0) {
        alert("La mesa actual no tiene pedidos");
        return;
    }
    console.log(
        "Mover mesa",
        mesaActual,
        "a",
        mesaDestino
    );

    if (pedidosMesas[mesaDestino] && pedidosMesas[mesaDestino].length > 0) {
        alert("La mesa destino ya tiene pedidos");    
        return;
    }
    if (mesaDestino === mesaActual) {
        alert("No puedes mover una mesa a sí misma");
        return;
    }
    pedidosMesas[mesaDestino] = [
        ...pedido
    ];
    pedidosMesas[mesaActual] = [];

    localStorage.setItem("pedidosMesas", JSON.stringify(pedidosMesas));

    actualizarMesa(mesaActual);
    actualizarMesa(mesaDestino);
    
    pedido = [];
    mesaActual = null;
    
    mostrarPedido();
    overlayCambioMesa.style.display = "none";
    overlay.style.display = "none";
    inputCambioMesa.selectedIndex = 0;
});