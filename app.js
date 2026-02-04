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

// ===== AVATARES ILUSTRATIVOS =====
const avatarColors = ["#ff2e2e","#2e9fff","#2eff5b","#ffb22e","#a02eff","#ff2ec3"];
const avatarEmojis = ["🚀","🛡️","🦂","⚡","🔥","💎"];

// ===== FUNÇÃO DE INSCRIÇÃO =====
const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullnameInput = document.getElementById("fullname");
  const usernameInput = document.getElementById("username");
  const fullname = fullnameInput.value.trim();
  const username = usernameInput.value.trim().toLowerCase();

  if(!fullname || !username){
    msg.innerHTML = "❌ Preencha todos os campos.";
    return;
  }

  const q = query(collection(db, "players"), where("username", "==", username));
  const snap = await getDocs(q);

  if(!snap.empty){
    msg.innerHTML = "❌ Nome de jogador já existe.";
    return;
  }

  const allPlayers = await getDocs(collection(db, "players"));
  const number = allPlayers.size + 1;

  const color = avatarColors[number % avatarColors.length];
  const emoji = avatarEmojis[number % avatarEmojis.length];

  await addDoc(collection(db, "players"), {
    number,
    fullname,
    username,
    xp: 0,
    status: "ativo",
    color,
    emoji,
    created: Date.now()
  });

  msg.innerHTML = `✅ Inscrito como Jogador #${number}`;
  fullnameInput.value = "";
  usernameInput.value = "";

  document.querySelector(".whatsapp").style.display = "flex";
});

// ===== FUNÇÕES DE ABAS E PESQUISA =====
window.showTab = (tabName) => {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  const tab = document.getElementById(tabName);
  if(tab) tab.style.display = "block";
};

window.searchPlayers = async (tab) => {
  const searchValue = document.getElementById(`search${tab.charAt(0).toUpperCase()+tab.slice(1)}`).value.toLowerCase();
  const listDiv = document.getElementById(`list${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
  listDiv.innerHTML = "";
  const snapshot = await getDocs(collection(db, "players"));

  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const match = p.fullname.toLowerCase().includes(searchValue) || p.username.toLowerCase().includes(searchValue);
    if(!match) return;

    if((tab==="participantes" && p.status==="ativo") ||
       (tab==="destacados" && p.status==="destacado") ||
       (tab==="eliminados" && p.status==="eliminado")){
      const card = document.createElement("div");
      card.className = "player-card";
      card.innerHTML = `
        <div class="player-avatar" style="background:${p.color}">${p.emoji}</div>
        <div class="player-info">
          ${p.fullname}<br/>
          ID - ${docSnap.id}<br/>
          JOGADOR #${p.number}<br/>
          XP: ${p.xp}
        </div>
      `;
      listDiv.appendChild(card);
    }
  });
};

// ===== ATUALIZAÇÕES =====
const updateFeed = document.getElementById("updateFeed");
onSnapshot(collection(db, "updates"), snapshot => {
  updateFeed.innerHTML = "";
  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `<p>${u.text}</p>${u.image?'<img src="'+u.image+'"/>':''}`;
    updateFeed.appendChild(div);
  });
});

// ===== CARREGAR LISTAS INICIAIS =====
["participantes","destacados","eliminados"].forEach(tab=>{
  showTab(tab);
  searchPlayers(tab);
});