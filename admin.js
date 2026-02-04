import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyAkzjSSNpENw9GC1_z8DXizFFjen5CND0E",
  authDomain: "hub-cenate.firebaseapp.com",
  projectId: "hub-cenate",
  storageBucket: "hub-cenate.firebasestorage.app",
  messagingSenderId: "56101635493",
  appId: "1:56101635493:web:e4e85b3fdcc500ade7944c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== LISTA ADMIN =====
const list = document.getElementById("adminPlayers");

// ===== CARREGAR JOGADORES =====
async function loadAdminPlayers() {
  list.innerHTML = "";

  const snap = await getDocs(collection(db, "players"));

  snap.forEach(d => {
    const p = d.data();

    const card = document.createElement("div");
    card.className = "player-card";

    card.innerHTML = `
      <div class="player-avatar" style="background:${p.color}">
        ${p.emoji}
      </div>

      <div class="player-info">
        <strong>${p.fullname}</strong><br>
        @${p.username}<br>
        XP: <b>${p.xp}</b><br>
        Status: ${p.status}
      </div>

      <div style="margin-top:10px; display:flex; gap:6px;">
        <button onclick="addXP('${d.id}', ${p.xp})">➕</button>
        <button onclick="removeXP('${d.id}', ${p.xp})">➖</button>
        <button onclick="eliminar('${d.id}')">❌</button>
      </div>
    `;

    list.appendChild(card);
  });
}

// ===== AÇÕES =====
window.addXP = async (id, xp) => {
  await updateDoc(doc(db, "players", id), { xp: xp + 10 });
  loadAdminPlayers();
};

window.removeXP = async (id, xp) => {
  await updateDoc(doc(db, "players", id), { xp: Math.max(0, xp - 10) });
  loadAdminPlayers();
};

window.eliminar = async (id) => {
  await updateDoc(doc(db, "players", id), { status: "eliminado" });
  loadAdminPlayers();
};

// ===== ATUALIZAÇÕES =====
window.sendUpdate = async () => {
  const text = document.getElementById("updateText").value.trim();
  if (!text) return;

  await addDoc(collection(db, "updates"), {
    text,
    date: Date.now()
  });

  document.getElementById("updateText").value = "";
};

// INICIAR
loadAdminPlayers();