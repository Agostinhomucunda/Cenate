import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===== FIREBASE CONFIG =====
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
const auth = getAuth(app);

// ===== LOGIN ADMIN =====
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("panelSection").style.display = "block";
    loadAllPlayers();
    loadUpdates();
  } catch (err) {
    loginMsg.textContent = "❌ Email ou senha incorretos";
  }
});

// ===== FUNÇÕES DE ABAS =====
function showTab(tabId){
  document.querySelectorAll(".adminTab").forEach(t => t.style.display="none");
  document.getElementById(tabId).style.display="block";
}
window.showTab = showTab;

// ===== FUNÇÃO PARA CARREGAR JOGADORES =====
async function loadAllPlayers(){
  const snapshot = await getDocs(collection(db, "players"));
  snapshot.forEach(docSnap => {
    createPlayerCard(docSnap);
  });
}

// Criar cartão de jogador com botões
function createPlayerCard(docSnap){
  const p = docSnap.data();
  const card = document.createElement("div");
  card.className = "adminPlayerCard";
  card.innerHTML = `
    <div class="player-avatar" style="background:${p.color}">${p.emoji}</div>
    <div class="player-info">
      <strong>${p.fullname}</strong><br/>
      JOGADOR #${p.number}<br/>
      XP: ${p.xp}
    </div>
    <div class="player-actions">
      <button onclick="changeXP('${docSnap.id}', 1)">+ XP</button>
      <button onclick="changeXP('${docSnap.id}', -1)">- XP</button>
      <button onclick="eliminatePlayer('${docSnap.id}')">Eliminar</button>
    </div>
  `;
  const listId = p.status === "ativo" ? "listAdminParticipantes" :
                 p.status === "destacado" ? "listAdminDestacados" :
                 "listAdminEliminados";
  document.getElementById(listId).appendChild(card);
}

// ===== FUNÇÃO DE PESQUISA =====
window.searchAdmin = async (status) => {
  const searchInput = document.getElementById(`searchAdmin${capitalize(status)}`);
  const listDiv = document.getElementById(`listAdmin${capitalize(status)}`);
  listDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "players"));
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    if(p.status !== status) return;
    const searchValue = searchInput.value.toLowerCase();
    if(!p.fullname.toLowerCase().includes(searchValue) && !p.username.toLowerCase().includes(searchValue)) return;
    createPlayerCard(docSnap);
  });
};

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== FUNÇÃO PARA ALTERAR XP =====
window.changeXP = async (playerId, amount) => {
  const playerRef = doc(db, "players", playerId);
  const playerSnap = await getDocs(playerRef);
  const currentData = (await playerRef.get()).data ? await playerRef.get().data() : null;
  const currentXP = currentData?.xp || 0;
  await updateDoc(playerRef, { xp: currentXP + amount });
  reloadPlayers(); // Atualiza a lista após mudança
};

// ===== FUNÇÃO PARA ELIMINAR =====
window.eliminatePlayer = async (playerId) => {
  await updateDoc(doc(db, "players", playerId), { status: "eliminado" });
  reloadPlayers();
};

// ===== RELOAD LISTA DE JOGADORES =====
async function reloadPlayers(){
  ["ativo","destacado","eliminado"].forEach(status => searchAdmin(status));
}

// ===== FUNÇÃO DE ATUALIZAÇÕES =====
const updatesCollection = collection(db, "updates");
window.addUpdate = async () => {
  const text = document.getElementById("updateText").value.trim();
  const image = document.getElementById("updateImage").value.trim();
  if(!text) return alert("Digite um texto para a atualização");
  await addDoc(updatesCollection, { text, image: image || null, created: Date.now() });
  document.getElementById("updateText").value = "";
  document.getElementById("updateImage").value = "";
  loadUpdates();
};

function loadUpdates(){
  onSnapshot(updatesCollection, snapshot => {
    const updateList = document.getElementById("updateList");
    updateList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const u = docSnap.data();
      const div = document.createElement("div");
      div.innerHTML = `<p>${u.text}</p>${u.image?'<img src="'+u.image+'"/>':''}`;
      updateList.appendChild(div);
    });
  });
}