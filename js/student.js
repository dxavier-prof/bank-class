import { watchStudents, watchItems, watchHistory } from "./bank.js";

const pickBox = document.getElementById("pickBox");
const pinBox = document.getElementById("pinBox");
const walletBox = document.getElementById("walletBox");

let students = [];
let items = [];
let pendingStudent = null; // estudiante seleccionado, esperando NIE
let currentId = null;
let historyUnsub = null;

watchStudents(list => {
  students = list;
  if (currentId && !students.find(s => s.id === currentId)) resetToPicker();
  if (!currentId && !pendingStudent) renderPicker();
  if (currentId) {
    const s = students.find(x => x.id === currentId);
    if (s) document.getElementById("walletAmount").textContent = "$" + (s.balance || 0);
  }
});

watchItems(list => { items = list; renderStore(); });

function showOnly(el) {
  [pickBox, pinBox, walletBox].forEach(b => b.classList.add("hidden"));
  el.classList.remove("hidden");
}

function renderPicker() {
  showOnly(pickBox);
  const box = document.getElementById("pickList");
  box.innerHTML = "";
  if (students.length === 0) {
    box.innerHTML = `<p class="empty">Tu maestro/a todavía no ha agregado estudiantes.</p>`;
    return;
  }
  students.forEach(s => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `<span class="name">${s.name}</span><span class="balance">🔒</span>`;
    row.addEventListener("click", () => goToPin(s));
    box.appendChild(row);
  });
}

function goToPin(student) {
  pendingStudent = student;
  showOnly(pinBox);
  document.getElementById("pinStudentName").textContent = `Hola, ${student.name}`;
  document.getElementById("nieInput").value = "";
  document.getElementById("nieError").classList.add("hidden");
  document.getElementById("nieInput").focus();
}

document.getElementById("nieBtn").addEventListener("click", checkNie);
document.getElementById("nieInput").addEventListener("keydown", e => { if (e.key === "Enter") checkNie(); });
document.getElementById("backToPick").addEventListener("click", (e) => {
  e.preventDefault();
  pendingStudent = null;
  renderPicker();
});

function checkNie() {
  const val = document.getElementById("nieInput").value.trim();
  if (pendingStudent && val === pendingStudent.nie) {
    currentId = pendingStudent.id;
    pendingStudent = null;
    showWallet(currentId);
  } else {
    document.getElementById("nieError").classList.remove("hidden");
  }
}

function resetToPicker() {
  currentId = null;
  pendingStudent = null;
  if (historyUnsub) { historyUnsub(); historyUnsub = null; }
  renderPicker();
}

function showWallet(id) {
  const s = students.find(x => x.id === id);
  if (!s) { resetToPicker(); return; }
  showOnly(walletBox);
  document.getElementById("walletAmount").textContent = "$" + (s.balance || 0);
  document.getElementById("walletName").textContent = s.name;
  if (historyUnsub) historyUnsub();
  historyUnsub = watchHistory(id, renderHistory);
  renderStore();
}

document.getElementById("switchUser").addEventListener("click", (e) => {
  e.preventDefault();
  resetToPicker();
});

function renderStore() {
  if (!currentId) return;
  const grid = document.getElementById("storeGrid");
  const empty = document.getElementById("storeEmpty");
  grid.innerHTML = "";
  empty.style.display = items.length === 0 ? "block" : "none";
  items.forEach(i => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `<div class="emoji">${i.emoji || "🛍️"}</div><div class="name">${i.name}</div><div class="price">$${i.price}</div>`;
    grid.appendChild(card);
  });
}

function renderHistory(rows) {
  const box = document.getElementById("historyBox");
  box.innerHTML = "";
  if (rows.length === 0) { box.innerHTML = `<p class="empty">Todavía no tienes movimientos.</p>`; return; }
  rows.forEach(r => {
    const row = document.createElement("div");
    row.className = "history-row";
    const isIn = r.tipo === "entrega";
    row.innerHTML = `<div><div>${r.detalle || ""}</div><div class="meta">${isIn ? "Entrega del banco" : "Compra"}</div></div>
      <div class="${isIn ? "plus" : "minus"}">${isIn ? "+" : "-"}$${r.monto}</div>`;
    box.appendChild(row);
  });
}
