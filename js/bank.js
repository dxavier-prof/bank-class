import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, updateDoc, getDoc,
  onSnapshot, query, orderBy, serverTimestamp, runTransaction, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const studentsCol = collection(db, "students");
const itemsCol = collection(db, "tienda");

export function watchStudents(cb) {
  return onSnapshot(query(studentsCol, orderBy("name")), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function watchItems(cb) {
  return onSnapshot(query(itemsCol, orderBy("name")), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function watchHistory(studentId, cb) {
  const col = collection(db, "students", studentId, "movimientos");
  return onSnapshot(query(col, orderBy("fecha", "desc")), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function createStudent(name, pin) {
  const ref = await addDoc(studentsCol, {
    name: name.trim(),
    pin: pin || "",
    balance: 0,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function deleteStudent(studentId) {
  await deleteDoc(doc(db, "students", studentId));
}

export async function addItem(name, price, emoji) {
  await addDoc(itemsCol, { name: name.trim(), price: Number(price), emoji: emoji || "🛍️" });
}

export async function deleteItem(itemId) {
  await deleteDoc(doc(db, "tienda", itemId));
}

// Entrega de dinero del banco a un estudiante (lista de billetes entregados)
export async function giveMoney(studentId, bills) {
  const total = bills.reduce((a, b) => a + b, 0);
  const studentRef = doc(db, "students", studentId);
  const movimientoRef = doc(collection(db, "students", studentId, "movimientos"));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(studentRef);
    if (!snap.exists()) throw new Error("El estudiante no existe");

    const current = snap.data()?.balance || 0;
    
    // Actualizar saldo y crear historial dentro de la transacción
    tx.update(studentRef, { balance: current + total });
    tx.set(movimientoRef, {
      tipo: "entrega",
      monto: total,
      detalle: `Billetes: ${bills.map(b => "$" + b).join(", ")}`,
      fecha: serverTimestamp()
    });
  });
}

// Venta de un artículo de la tienda a un estudiante (descuenta saldo)
export async function sellItem(studentId, item) {
  const studentRef = doc(db, "students", studentId);
  const movimientoRef = doc(collection(db, "students", studentId, "movimientos"));

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(studentRef);
      if (!snap.exists()) throw new Error("El estudiante no existe");

      const current = snap.data()?.balance || 0;

      // Lanzamos un error si no tiene suficiente saldo para cancelar la transacción
      if (current < item.price) {
        throw new Error("Saldo insuficiente");
      }

      // Actualizar el saldo del estudiante
      tx.update(studentRef, { balance: current - item.price });

      // Registrar el movimiento de la compra
      tx.set(movimientoRef, {
        tipo: "compra",
        monto: item.price,
        detalle: `${item.emoji || "🛍️"} ${item.name}`,
        fecha: serverTimestamp()
      });
    });

    return true;
  } catch (error) {
    console.error("Error en sellItem:", error.message);
    return false;
  }
}

export async function getStudent(studentId) {
  const snap = await getDoc(doc(db, "students", studentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
