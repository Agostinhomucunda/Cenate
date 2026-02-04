import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const list = document.getElementById("adminPlayers");
const btnUpdate = document.getElementById("btnUpdate");
const updateText = document.getElementById("updateText");

window.addXP = async (id, xp) => { await updateDoc(doc(db, "players", id), { xp: xp + 10 }); loadPlayers(); };
window.removeXP = async (id, xp) => { await updateDoc(doc(db, "players", id), { xp: Math.max(0, xp - 10) }); loadPlayers(); };
window.eliminar = async (id) => { await updateDoc(doc(db, "players", id), { status: "eliminado" }); loadPlayers(); };

async function loadPlayers(){
  list.innerHTML = "";
  const snap = await getDocs(collection(db,"players"));
  snap.forEach(docSnap=>{
    const p = docSnap.data();
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-avatar" style="background:${p.color}">${p.emoji}</div>
      <div class="player-info">
        <strong>${p.fullname}</strong><br>@${p.username}<br>XP: <b>${p.xp}</b><br>Status: ${p.status}
      </div>
      <div style="margin-top:8px; display:flex; gap:6px;">
        <button onclick="addXP('${docSnap.id}', ${p.xp})">➕ XP</button>
        <button onclick="removeXP('${docSnap.id}', ${p.xp})">➖ XP</button>
        <button onclick="eliminar('${docSnap.id}')">❌ Eliminar</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// ATUALIZAÇÕES
btnUpdate.addEventListener("click", async ()=>{
  const text = updateText.value.trim();
  if(!text) return;
  await addDoc(collection(db,"updates"),{ text, date: Date.now() });
  updateText.value="";
  alert("✅ Atualização enviada!");
});

loadPlayers();