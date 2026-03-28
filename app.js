// ===================== app.js - BASİT FIREBASE VERSİYON (ÇALIŞAN) =====================

const firebaseConfig = {
  apiKey: "AIzaSyDRz_pRfHM7AGTz4c21bQhtg9DxCqlb2ek",
  authDomain: "aa-perfin-tracking-d33b8.firebaseapp.com",
  databaseURL: "https://aa-perfin-tracking-d33b8-default-rtdb.firebaseio.com",
  projectId: "aa-perfin-tracking-d33b8",
  storageBucket: "aa-perfin-tracking-d33b8.firebasestorage.app",
  messagingSenderId: "374462035684",
  appId: "1:374462035684:web:f30fc6f0de73477826def1"
};

// Firebase'i yükle
const script = document.createElement('script');
script.src = "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js";
script.onload = () => {
  const script2 = document.createElement('script');
  script2.src = "https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js";
  script2.onload = initializeFirebase;
  document.head.appendChild(script2);
};
document.head.appendChild(script);

let db;
let transactions = [];
let accounts = [];
let kategoriler = [];

function initializeFirebase() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  loadDataFromFirebase();
  console.log("✅ Firebase bağlantısı kuruldu");
}

// ===================== VERİ YÜKLEME =====================
function loadDataFromFirebase() {
  db.ref('transactions').on('value', (snapshot) => {
    transactions = snapshot.val() ? Object.values(snapshot.val()) : [];
    updateBalances();
    if (typeof loadRecords === "function") loadRecords();
  });

  db.ref('accounts').on('value', (snapshot) => {
    accounts = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateAccounts === "function") populateAccounts();
  });

  db.ref('kategoriler').on('value', (snapshot) => {
    kategoriler = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateCategories === "function") populateCategories();
  });
}

// ===================== VERİ KAYDETME =====================
function saveTransactions() {
  db.ref('transactions').set(transactions);
}

function saveAccounts() {
  db.ref('accounts').set(accounts);
}

function saveKategoriler() {
  db.ref('kategoriler').set(kategoriler);
}

// ===================== DİĞER FONKSİYONLAR (Kısaltılmış) =====================
function startClock() {
  function update() {
    const now = new Date();
    document.getElementById("date") && (document.getElementById("date").textContent = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    document.getElementById("clock") && (document.getElementById("clock").textContent = now.toLocaleTimeString("tr-TR"));
  }
  update();
  setInterval(update, 1000);
}

function updateBalances() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === "Gelir") income += amt;
    else if (t.type === "Gider") expense += amt;
  });
  const balance = income - expense;

  document.getElementById("total-income") && (document.getElementById("total-income").textContent = income.toLocaleString('tr-TR') + " ₺");
  document.getElementById("total-expense") && (document.getElementById("total-expense").textContent = expense.toLocaleString('tr-TR') + " ₺");
  document.getElementById("total-balance") && (document.getElementById("total-balance").textContent = balance.toLocaleString('tr-TR') + " ₺");
}

function populateCategories() {
  const type = document.getElementById("type")?.value || "Gider";
  const catSelect = document.getElementById("category");
  if (!catSelect) return;

  catSelect.innerHTML = "<option value=''>Kategori seçin</option>";

  const filtered = kategoriler.filter(k => {
    if (type === "Gelir") return k.tip === "gelir";
    if (type === "Gider") return k.tip === "gider";
    if (type === "Transfer") return k.tip === "transfer";
    return false;
  });

  filtered.forEach(k => {
    const opt = document.createElement("option");
    opt.value = k.ad;
    opt.textContent = k.ad;
    catSelect.appendChild(opt);
  });
}

function addNewCategory() {
  const newCat = document.getElementById("newCategory").value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  if (kategoriler.some(k => k.ad === newCat)) return alert("Bu kategori zaten mevcut!");

  const currentType = document.getElementById("type").value;
  const tip = currentType === "Gelir" ? "gelir" : currentType === "Gider" ? "gider" : "transfer";

  kategoriler.push({ ad: newCat, tip: tip });
  saveKategoriler();

  document.getElementById("newCategory").value = "";
  populateCategories();
  alert("✅ Yeni kategori eklendi!");
}

function populateAccounts() {
  const select = document.getElementById("account");
  if (!select) return;

  select.innerHTML = '<option value="">Hesap / Kart seçin...</option>';

  if (accounts.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Henüz hesap eklenmedi";
    select.appendChild(opt);
    return;
  }

  accounts.forEach(acc => {
    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = `${acc.name} (${acc.type})`;
    select.appendChild(opt);
  });
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

  if (!record.date || isNaN(record.amount) || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori alanlarını doldurunuz!");
    return;
  }

  transactions.push(record);
  saveTransactions();

  alert("✅ Kayıt başarıyla eklendi ve Firebase'e yüklendi!");
  e.target.reset();
  populateCategories();
  updateBalances();
}

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  loadDataFromFirebase();
});
