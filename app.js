import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot
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

// ===== INSCRIÇÃO =====
const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = fullname.value.trim();
  const username = document.getElementById("username").value.trim().toLowerCase();

  if (!fullname || !username) {
    msg.innerHTML = "❌ Preencha todos os campos";
    return;
  }

  const q = query(collection(db, "players"), where("username", "==", username));
  const snap = await getDocs(q);
  if (!snap.empty) {
    msg.innerHTML = "❌ Nome já existe";
    return;
  }

  await addDoc(collection(db, "players"), {
    fullname,
    username,
    xp: 0,
    status: "ativo",
    created: Date.now()
  });

  msg.innerHTML = "✅ Inscrição feita com sucesso!";
  form.reset();
});

// ===== LISTAGEM EM TEMPO REAL =====
function loadPlayers(tab, status) {
  const list = document.getElementById(`list${tab}`);
  onSnapshot(collection(db, "players"), snap => {
    list.innerHTML = "";
    snap.forEach(docSnap => {
      const p = docSnap.data();
      if (p.status !== status) return;

      list.innerHTML += `
        <div class="player-card">
          <strong>${p.fullname}</strong><br>
          @${p.username}<br>
          XP: ${p.xp}
        </div>
      `;
    });
  });
}

loadPlayers("Participantes", "ativo");
loadPlayers("Destacados", "destacado");
loadPlayers("Eliminados", "eliminado");