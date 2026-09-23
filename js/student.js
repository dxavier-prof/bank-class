import { watchStudents, watchItems, watchHistory } from "./bank.js";

const pickBox = document.getElementById("pickBox");
const walletBox = document.getElementById("walletBox");
let students = [];
let items = [];
let currentId = localStorage.getItem("bankStudentId") || null;
let historyUnsub = null;

watchStudents(list => {
  students = list;
  if (currentId && !students.find(s => s.id === currentId)) {
    currentId = null;
    localStorage.removeItem("bankStudentId");
  }
  if (currentId) showWallet(currentId);
  else renderPicker();
});

watchItems(list => { items = list; renderStore(); });

function renderPicker() {
  walletBox.classList.add("hidden");
  pickBox.classList.remove("hidden");
  const box = document.getElementById("pickList");
  box.innerHTML = "";
  if (students.length === 0) {
    box.innerHTML = `<p class="empty">Tu maestro/a todavía no ha agregado estudiantes.</p>`;
    return;
  }
  students.forEach(s => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `<span class="name">${s.name}</span><span class="balance">$${s.balance || 0}</span>`;
    row.addEventListener("click", () => {
      localStorage.setItem("bankStudentId", s.id);
      currentId = s.id;
      showWallet(s.id);
    });
    box.appendChild(row);
  });
}

function showWallet(id) {
  const s = students.find(x => x.id === id);
  if (!s) { renderPicker(); return; }
  pickBox.classList.add("hidden");
  walletBox.classList.remove("hidden");
  document.getElementById("walletAmount").textContent = "$" + (s.balance || 0);
  document.getElementById("walletName").textContent = s.name;
  document.getElementById("switchUser").addEventListener("click", () => {
    localStorage.removeItem("bankStudentId");
  });
  if (historyUnsub) historyUnsub();
  historyUnsub = watchHistory(id, renderHistory);
  renderStore();
}

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
