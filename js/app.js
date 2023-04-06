let customer = {
  table: "",
  hour: "",
  order: [],
};

const categories = {
  1: "Comida",
  2: "Bebida",
  3: "Postre",
};

const saveBtn = document.querySelector("#guardar-cliente");

saveBtn.addEventListener("click", newOrder);

function newOrder() {
  // Capturar valores de los campos.
  const table = document.querySelector("#mesa").value;
  const hour = document.querySelector("#hora").value;

  //Verificar y validar campos vacios.
  const emptyFields = [table, hour].some((field) => field == "");

  if (emptyFields) {
    printAlert("Todos los campos son obligatorios");
  } else {
    // Copiar objeto original y sobreescribir table y hour.
    customer = { ...customer, table, hour };

    //ocultar modal de bootstrap
    const modal = document.querySelector("#modal");
    const modalBootstrap = bootstrap.Modal.getInstance(modal);
    modalBootstrap.hide();

    // Mostrar Secciones
    avaliableHTML();
    // Descargar Menu
    getMenu();
  }
}

function printAlert(message) {
  const exist = document.querySelector(".invalid-feedback");
  if (!exist) {
    const modalBody = document.querySelector(".modal-body form");
    const alert = document.createElement("P");
    alert.classList.add("invalid-feedback", "d-block", "p-2", "text-center");
    alert.textContent = message;
    modalBody.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 2000);
  }
  return;
}

function avaliableHTML() {
  const hideSections = document.querySelectorAll(".d-none");
  hideSections.forEach((section) => section.classList.remove("d-none"));
}

async function getMenu() {
  const url = "http://localhost:4000/platillos";
  try {
    const response = await fetch(url);
    const result = await response.json();
    printMenu(result);
  } catch (error) {
    console.log(error);
  }
}

function printMenu(menu) {
  const gridContainer = document.querySelector(".contenido");

  menu.forEach((item) => {
    const { id, categoria, nombre, precio } = item;

    const row = document.createElement("DIV");
    row.classList.add("row", "py-2", "border-top");

    const names = document.createElement("DIV");
    names.classList.add("col-md-6");
    names.textContent = nombre;

    const prices = document.createElement("DIV");
    prices.classList.add("col-md-2", "fw-bolder");
    prices.textContent = `$${precio}`;

    const category = document.createElement("DIV");
    category.classList.add("col-md-2");
    category.textContent = categories[categoria];

    const countInput = document.createElement("INPUT");
    countInput.type = "number";
    countInput.min = 0;
    countInput.value = 0;
    countInput.id = `productID-${id}`;
    countInput.classList.add("form-control");

    const countDiv = document.createElement("DIV");
    countDiv.classList.add("col-md-2");
    countDiv.appendChild(countInput);

    row.appendChild(names);
    row.appendChild(prices);
    row.appendChild(category);
    row.appendChild(countDiv);
    gridContainer.appendChild(row);

    countInput.addEventListener("change", () => {
      const cantidad = parseInt(countInput.value);
      addOrder({ ...item, cantidad });
    });
  });
}

function addOrder(newOrder) {
  // Extraer pedido inicial.
  let { order } = customer;

  // Revisar que la cantidad sea mayor a 0.
  if (newOrder.cantidad > 0) {
    const exist = order.some((item) => item.id === newOrder.id);
    if (exist) {
      // actualizar cantidad del item.
      const orderUpdated = order.map((item) => {
        if (item.id === newOrder.id) {
          item.cantidad = newOrder.cantidad;
        }
        return item;
      });
      customer.order = [...orderUpdated];
    } else {
      // si no existe, crea una nueva orden.
      customer.order = [...order, newOrder];
    }
  } else {
    // Eliminar el item si la cantidad es 0.
    const orderCleaned = order.filter((item) => item.id !== newOrder.id);
    customer.order = [...orderCleaned];
  }

  if (customer.order.length) {
    // Imprimir Resumen.
    printResume();
  } else {
    // Imprimir mensaje de orden vacia.
    messageEmptyOrder();
  }
}

function printResume() {
  // Creando la card de cada mesa.
  const resumeDiv = document.querySelector("#resumen .contenido");
  while (resumeDiv.firstChild) {
    resumeDiv.removeChild(resumeDiv.firstChild);
  }
  // Info mesa.
  const orderResume = document.createElement("DIV");
  orderResume.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

  const table = document.createElement("P");
  table.textContent = "Mesa: ";
  table.classList.add("fw-bold");

  const tableSpan = document.createElement("SPAN");
  tableSpan.textContent = customer.table;
  tableSpan.classList.add("fw-normal");

  // Info hora.
  const hour = document.createElement("P");
  hour.textContent = "Hora: ";
  hour.classList.add("fw-bold");

  const hourSpan = document.createElement("SPAN");
  hourSpan.textContent = customer.hour;
  hourSpan.classList.add("fw-normal");

  table.appendChild(tableSpan);
  hour.appendChild(hourSpan);

  // Info de consumo para la card
  const sectionTitle = document.createElement("H3");
  sectionTitle.textContent = "Menú Consumido";
  sectionTitle.classList.add("my-4", "text-center");

  const group = document.createElement("UL");
  group.classList.add("list-group");

  const { order } = customer;

  // Info de cada consumo.
  order.forEach((item) => {
    const { nombre, cantidad, precio, id } = item;

    const listItem = document.createElement("LI");
    listItem.classList.add("list-group-item");

    const titleItem = document.createElement("H4");
    titleItem.classList.add("my-4");
    titleItem.textContent = nombre;

    // Cantidad
    const amountItem = document.createElement("P");
    amountItem.classList.add("fw-bold");
    amountItem.textContent = "Cantidad: ";

    const amountValue = document.createElement("SPAN");
    amountValue.classList.add("fw-normal");
    amountValue.textContent = cantidad;

    // Precio
    const priceItem = document.createElement("P");
    priceItem.classList.add("fw-bold");
    priceItem.textContent = "Precio: ";

    const priceValue = document.createElement("SPAN");
    priceValue.classList.add("fw-normal");
    priceValue.textContent = `$${precio}`;

    // Subtotal
    const subtotalItem = document.createElement("P");
    subtotalItem.classList.add("fw-bold");
    subtotalItem.textContent = "SubTotal: ";

    const subtotalValue = document.createElement("SPAN");
    subtotalValue.classList.add("fw-normal");
    subtotalValue.textContent = `$${cantidad * precio}`;

    const deleteBtn = document.createElement("BUTTON");
    deleteBtn.classList.add("btn", "btn-danger");
    deleteBtn.textContent = "Eliminar Pedido";

    deleteBtn.onclick = () => {
      deleteItem(id);
    };

    amountItem.appendChild(amountValue);
    priceItem.appendChild(priceValue);
    subtotalItem.appendChild(subtotalValue);

    listItem.appendChild(titleItem);
    listItem.appendChild(amountItem);
    listItem.appendChild(priceItem);
    listItem.appendChild(subtotalItem);
    listItem.appendChild(deleteBtn);

    group.appendChild(listItem);
  });

  orderResume.appendChild(sectionTitle);
  orderResume.appendChild(table);
  orderResume.appendChild(hour);
  orderResume.appendChild(group);

  resumeDiv.appendChild(orderResume);

  // Imprimir formulario de propinas
  printTips();
}

function deleteItem(id) {
  const { order } = customer;
  const clearOrder = order.filter((item) => item.id !== id);
  customer.order = [...clearOrder];

  if (customer.order.length) {
    // Imprimir Resumen.
    printResume();
  } else {
    // Imprimir mensaje de orden vacia.
    messageEmptyOrder();
  }

  // Se regresa la cantidad del input correspondiente a 0.
  const idInput = `#productID-${id}`;
  const inputDeleted = document.querySelector(idInput);
  inputDeleted.value = 0;
}

function messageEmptyOrder() {
  const resumeDiv = document.querySelector("#resumen .contenido");
  while (resumeDiv.firstChild) {
    resumeDiv.removeChild(resumeDiv.firstChild);
  }
  const text = document.createElement("P");
  text.classList.add("text-center");
  text.textContent = "Añade los elementos del pedido";

  resumeDiv.appendChild(text);
}

function printTips() {
  const resumeDiv = document.querySelector("#resumen .contenido");

  const tipsContainer = document.createElement("DIV");
  tipsContainer.classList.add("col-md-6", "form");

  const tipsDiv = document.createElement("DIV");
  tipsDiv.classList.add("card", "py-2", "px-3", "shadow");

  const sectionTitle = document.createElement("H3");
  sectionTitle.textContent = "Propina";
  sectionTitle.classList.add("my-4", "text-center");

  // Radio Button 10%
  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.name = "tip";
  radio10.value = "10";
  radio10.classList.add("form-check-input");

  const radio10Label = document.createElement("LABEL");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  radio10.onclick = () => {
    calculateTip(radio10.value);
  };

  // Radio Button 10%
  const radio25 = document.createElement("INPUT");
  radio25.type = "radio";
  radio25.name = "tip";
  radio25.value = "25";
  radio25.classList.add("form-check-input");

  const radio25Label = document.createElement("LABEL");
  radio25Label.textContent = "25%";
  radio25Label.classList.add("form-check-label");

  const radio25Div = document.createElement("DIV");
  radio25Div.classList.add("form-check");

  radio25.onclick = () => {
    calculateTip(radio25.value);
  };

  // Radio Button 10%
  const radio50 = document.createElement("INPUT");
  radio50.type = "radio";
  radio50.name = "tip";
  radio50.value = "50";
  radio50.classList.add("form-check-input");

  const radio50Label = document.createElement("LABEL");
  radio50Label.textContent = "50%";
  radio50Label.classList.add("form-check-label");

  const radio50Div = document.createElement("DIV");
  radio50Div.classList.add("form-check");

  radio50.onclick = () => {
    calculateTip(radio50.value);
  };

  // apends
  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);

  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  tipsDiv.appendChild(sectionTitle);
  tipsDiv.appendChild(radio10Div);
  tipsDiv.appendChild(radio25Div);
  tipsDiv.appendChild(radio50Div);

  tipsContainer.appendChild(tipsDiv);
  resumeDiv.appendChild(tipsContainer);
}

function calculateTip() {
  const { order } = customer;
  let subTotal = 0;

  order.forEach((item) => {
    subTotal += item.cantidad * item.precio;
  });

  const tipValue = document.querySelector('[name="tip"]:checked').value;

  // Calcular propina
  let tip = (subTotal * tipValue) / 100;

  console.log(`Se aplicara una propina de ${tipValue}%`, tip);

  calculateTotal(subTotal, tip);
}

function calculateTotal(subtotal, tip) {
  let total = subtotal + tip;

  printTotals(subtotal, tip, total);
}

function printTotals(subtotal, tip, total) {
  console.log(subtotal, tip, total);
  // totals container
  const totalsContainer = document.createElement("DIV");
  totalsContainer.classList.add("total-pagar");

  // subtotal.
  const subTotalText = document.createElement("P");
  subTotalText.classList.add("fs-4", "fw-bold", "mt-5");
  subTotalText.textContent = "Subtotal Consumos: ";

  const subTotalSpan = document.createElement("SPAN");
  subTotalSpan.classList.add("fw-normal");
  subTotalSpan.textContent = `$${subtotal}`;

  subTotalText.appendChild(subTotalSpan);

  // tip.
  const tipText = document.createElement("P");
  tipText.classList.add("fs-4", "fw-bold", "mt-5");
  tipText.textContent = "Propina: ";

  const tipSpan = document.createElement("SPAN");
  tipSpan.classList.add("fw-normal");
  tipSpan.textContent = `$${tip}`;

  tipText.appendChild(tipSpan);
  console.log(tipSpan);

  // total.
  const totalText = document.createElement("P");
  totalText.classList.add("fs-4", "fw-bold", "mt-5");
  totalText.textContent = "TOTAL: ";

  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$${total}`;

  totalText.appendChild(totalSpan);

  // Limpiar contenido
  const divTotales = document.querySelector(".total-pagar");
  if (divTotales) {
    divTotales.remove();
  }

  // appends
  totalsContainer.appendChild(subTotalText);
  totalsContainer.appendChild(tipText);
  totalsContainer.appendChild(totalText);

  const form = document.querySelector(".form");
  form.appendChild(totalsContainer);
}
