// ===================== app.js - KESİN SENKRONİZE VERSİYON =====================

const firebaseConfig = {
  apiKey: "AIzaSyDRz_pRfHM7AGTz4c21bQhtg9DxCqlb2ek",
  authDomain: "aa-perfin-tracking-d33b8.firebaseapp.com",
  databaseURL: "https://aa-perfin-tracking-d33b8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aa-perfin-tracking-d33b8",
  storageBucket: "aa-perfin-tracking-d33b8.firebasestorage.app",
  messagingSenderId: "374462035684",
  appId: "1:374462035684:web:f30fc6f0de73477826def1"
};

// Global Değişkenler
let db;
let transactions = [];
let accounts = [];
let kategoriler = [];

// Firebase Başlatma
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
db = firebase.database();

// ===================== VERİ YÜKLEME (SENKRONİZASYON) =====================
function loadDataFromFirebase() {
  db.ref('transactions').on('value', (snapshot) => {
    const val = snapshot.val();
    transactions = val ? Object.values(val) : [];
    if (typeof updateBalances === "function") updateBalances();
  });

  db.ref('accounts').on('value', (snapshot) => {
    const val = snapshot.val();
    accounts = val ? Object.values(val) : [];
    if (typeof populateAccounts === "function") populateAccounts();
  });

  db.ref('kategoriler').on('value', (snapshot) => {
    const val = snapshot.val();
    kategoriler = val ? Object.values(val) : [];
    if (typeof populateCategories === "function") populateCategories();
  });
}

// ===================== VERİ KAYDETME =====================
function saveTransactions() { db.ref('transactions').set(transactions); }
function saveAccounts() { db.ref('accounts').set(accounts); }
function saveKategoriler() { db.ref('kategoriler').set(kategoriler); }

// ===================== LİSTELEME FONKSİYONLARI =====================
function populateCategories() {
  const type = document.getElementById("type")?.value || "Gider";
  const select = document.getElementById("category");
  if (!select) return;

  select.innerHTML = "<option value=''>Kategori seçin</option>";
  kategoriler.filter(k => k.tip === type.toLowerCase()).forEach(k => {
    const opt = document.createElement("option");
    opt.value = k.ad; opt.textContent = k.ad;
    select.appendChild(opt);
  });
}

function populateAccounts() {
  const select = document.getElementById("account");
  if (!select) return;
  select.innerHTML = '<option value="">Hesap / Kart seçin...</option>';
  accounts.forEach(acc => {
    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = `${acc.name} (${acc.type})`;
    select.appendChild(opt);
  });
}

// ===================== EKLEME FONKSİYONLARI =====================
function addNewCategory() {
  const name = document.getElementById("newCategory")?.value.trim();
  const type = document.getElementById("type")?.value.toLowerCase();
  if (!name) return alert("İsim giriniz!");
  if (kategoriler.some(k => k.ad === name)) return alert("Mevcut!");

  kategoriler.push({ ad: name, tip: type });
  saveKategoriler();
  document.getElementById("newCategory").value = "";
}

function addTransaction(e) {
  e.preventDefault();
  const record = {
    id: Date.now().toString(),
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value || "Nakit",
    timestamp: Date.now()
  };
  transactions.push(record);
  saveTransactions();
  alert("✅ Kayıt eklendi!");
  e.target.reset();
}

// Saati başlat ve Verileri çek
function startClock() {
  setInterval(() => {
    const now = new Date();
    if(document.getElementById("date")) document.getElementById("date").textContent = now.toLocaleDateString("tr-TR");
    if(document.getElementById("clock")) document.getElementById("clock").textContent = now.toLocaleTimeString("tr-TR");
  }, 1000);
}

// BAŞLATICI
loadDataFromFirebase();
startClock();
