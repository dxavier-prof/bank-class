import { TEACHER_PIN } from "./firebase-config.js";
import {
  watchStudents, watchItems, watchHistory,
  createStudent, deleteStudent, addItem, deleteItem,
  giveMoney, sellItem
} from "./bank.js";

// ---- PIN gate ----
const pinGate = document.getElementById("pinGate");
const app = document.getElementById("app");
document.getElementById("pinBtn").addEventListener("click", checkPin);
document.getElementById("pinInput").addEventListener("keydown", e => { if (e.key === "Enter") checkPin(); });
function checkPin() {
  const val = document.getElementById("pinInput").value.trim();
  if (val === TEACHER_PIN) {
    pinGate.classList.add("hidden");
    app.classList.remove("hidden");
    boot();
  } else {
    document.getElementById("pinError").classList.remove("hidden");
  }
}

// ---- Tabs ----
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ---- State ----
let students = [];
let items = [];
let selectedStudentId = null;
let selectedBills = [];
let selectedItemId = null;
let historyUnsub = null;

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function boot() {
  watchStudents(list => { students = list; renderStudents(); renderSellGrid(); });
  watchItems(list => { items = list; renderItems(); renderSellGrid(); });

  document.getElementById("addStudentBtn").addEventListener("click", async () => {
    const nameInput = document.getElementById("newStudentName");
    const nieInput = document.getElementById("newStudentNie");
    const nieError = document.getElementById("nieError");
    const nie = nieInput.value.trim();
    if (!nameInput.value.trim()) return;
    if (!/^\d{8}$/.test(nie)) {
      nieError.classList.remove("hidden");
      return;
    }
    nieError.classList.add("hidden");
    await createStudent(nameInput.value.trim(), nie);
    nameInput.value = "";
    nieInput.value = "";
    toast("Estudiante agregado");
  });

  document.getElementById("addItemBtn").addEventListener("click", async () => {
    const name = document.getElementById("itemName").value;
    const price = document.getElementById("itemPrice").value;
    const emoji = document.getElementById("itemEmoji").value;
    if (!name.trim() || !price) return;
    await addItem(name, price, emoji);
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemEmoji").value = "";
    toast("Artículo agregado a la tienda");
  });

  document.querySelectorAll(".bill").forEach(b => {
    b.addEventListener("click", () => {
      selectedBills.push(Number(b.dataset.v));
      renderGiveTotal();
    });
  });
  document.getElementById("clearGive").addEventListener("click", () => {
    selectedBills = [];
    renderGiveTotal();
  });
  document.getElementById("confirmGive").addEventListener("click", async () => {
    if (!selectedStudentId || selectedBills.length === 0) return;
    await giveMoney(selectedStudentId, selectedBills);
    toast("Dinero entregado 💵");
    selectedBills = [];
    renderGiveTotal();
  });
  document.getElementById("confirmSell").addEventListener("click", async () => {
    if (!selectedStudentId || !selectedItemId) return;
    const item = items.find(i => i.id === selectedItemId);
    const ok = await sellItem(selectedStudentId, item);
    if (ok) { toast(`Vendido: ${item.name}`); }
    else { toast("Saldo insuficiente para ese artículo"); }
  });
}

function renderStudents() {
  const box = document.getElementById("studentList");
  box.innerHTML = "";
  if (students.length === 0) {
    box.innerHTML = `<p class="empty">Aún no hay estudiantes.</p>`;
  }
  students.forEach(s => {
    const row = document.createElement("div");
    row.className = "student-row" + (s.id === selectedStudentId ? " selected" : "");
    row.innerHTML = `<span class="name">${s.name}</span>
      <span style="display:flex;align-items:center;gap:10px;">
        <button class="btn btn-outline" style="padding:3px 9px;font-size:.7rem;" data-nie-btn>Ver NIE</button>
        <span class="balance">$${s.balance || 0}</span>
      </span>`;
    row.querySelector("[data-nie-btn]").addEventListener("click", (e) => {
      e.stopPropagation();
      toast(`NIE de ${s.name}: ${s.nie || "no asignado"}`);
    });
    row.addEventListener("click", () => selectStudent(s.id));
    box.appendChild(row);
  });
}

function selectStudent(id) {
  selectedStudentId = id;
  const s = students.find(x => x.id === id);
  document.getElementById("selectedName").textContent = s ? s.name : "Selecciona un estudiante";
  document.getElementById("operarBox").classList.toggle("hidden", !s);
  selectedBills = [];
  renderGiveTotal();
  renderStudents();
  renderSellGrid();
  if (historyUnsub) historyUnsub();
  if (s) historyUnsub = watchHistory(id, renderHistory);
}

function renderGiveTotal() {
  const total = selectedBills.reduce((a, b) => a + b, 0);
  document.getElementById("giveTotal").textContent = "$" + total;
  document.getElementById("confirmGive").disabled = total === 0;
}

function renderItems() {
  const grid = document.getElementById("itemGrid");
  grid.innerHTML = "";
  if (items.length === 0) grid.innerHTML = `<p class="empty">No hay artículos todavía.</p>`;
  items.forEach(i => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `<div class="emoji">${i.emoji || "🛍️"}</div><div class="name">${i.name}</div><div class="price">$${i.price}</div>
      <button class="btn btn-danger" style="margin-top:6px;font-size:.75rem;padding:4px 8px;">Eliminar</button>`;
    card.querySelector("button").addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteItem(i.id);
    });
    grid.appendChild(card);
  });
}

function renderSellGrid() {
  const grid = document.getElementById("sellItemGrid");
  grid.innerHTML = "";
  items.forEach(i => {
    const card = document.createElement("div");
    card.className = "item-card" + (i.id === selectedItemId ? " selected" : "");
    card.innerHTML = `<div class="emoji">${i.emoji || "🛍️"}</div><div class="name">${i.name}</div><div class="price">$${i.price}</div>`;
    card.addEventListener("click", () => {
      selectedItemId = i.id;
      renderSellGrid();
      document.getElementById("confirmSell").disabled = !selectedStudentId;
    });
    grid.appendChild(card);
  });
}

function renderHistory(rows) {
  const box = document.getElementById("historyBox");
  box.innerHTML = "";
  if (rows.length === 0) { box.innerHTML = `<p class="empty">Sin movimientos todavía.</p>`; return; }
  rows.forEach(r => {
    const row = document.createElement("div");
    row.className = "history-row";
    const isIn = r.tipo === "entrega";
    row.innerHTML = `<div><div>${r.detalle || ""}</div><div class="meta">${isIn ? "Entrega del banco" : "Compra"}</div></div>
      <div class="${isIn ? "plus" : "minus"}">${isIn ? "+" : "-"}$${r.monto}</div>`;
    box.appendChild(row);
  });
}
