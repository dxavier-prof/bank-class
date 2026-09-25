import { watchStudents } from "./bank.js";

const medals = ["🥇", "🥈", "🥉"];

watchStudents(students => {
  const sorted = [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  const box = document.getElementById("rankList");
  box.innerHTML = "";

  if (sorted.length === 0) {
    box.innerHTML = `<p style="color:#B9C8D0;text-align:center;">Todavía no hay estudiantes registrados.</p>`;
    return;
  }

  sorted.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "rk-row" + (i < 3 ? " top" + (i + 1) : "");
    row.innerHTML = `
      <div class="rk-medal">${medals[i] || (i + 1)}</div>
      <div class="rk-name">${s.name}</div>
      <div class="rk-amount">$${s.balance || 0}</div>
    `;
    box.appendChild(row);
  });
});
