// ===================== app.js - TAM SENKRONİZE VERSİYON =====================

const firebaseConfig = {
  apiKey: "AIzaSyDRz_pRfHM7AGTz4c21bQhtg9DxCqlb2ek",
  authDomain: "aa-perfin-tracking-d33b8.firebaseapp.com",
  // Hata mesajındaki doğru Avrupa sunucu adresi tanımlandı:
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

// Firebase SDK'larını dinamik ve güvenli yükleme
const loadFirebase = () => {
  if (typeof firebase !== 'undefined') return initializeFirebase();

  const s1 = document.createElement('script');
  s1.src = "https://www.gstatic.com";
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = "https://www.gstatic.com";
    s2.onload = initializeFirebase;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
};

function initializeFirebase() {
  // Mükerrer başlatmayı önle
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.database();
  console.log("✅ Firebase (Europe) Senkronizasyonu Aktif");
  loadDataFromFirebase();
}

// ===================== VERİ YÜKLEME (GERÇEK ZAMANLI) =====================
function loadDataFromFirebase() {
  // .on('value') sayesinde bir cihazda değişen veri diğerinde anında görünür
  db.ref('transactions').on('value', (snapshot) => {
    const val = snapshot.val();
    transactions = val ? Object.values(val) : [];
    updateBalances();
    if (typeof loadRecords === "function") loadRecords();
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
function saveKategoriler() { 
  db.ref('kategoriler').set(kategoriler)
    .then(() => console.log("☁️ Kategoriler buluta işlendi"))
    .catch(err => console.error("❌ Kayıt hatası:", err));
}

// ===================== FONKSİYONLAR =====================
function startClock() {
  const update = () => {
    const now = new Date();
    const d = document.getElementById("date");
    const c = document.getElementById("clock");
    if(d) d.textContent = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if(c) c.textContent = now.toLocaleTimeString("tr-TR");
  };
  update();
  setInterval(update, 1000);
}

function updateBalances() {
  let inc = 0, exp = 0;
  transactions.forEach(t => {
    const val = parseFloat(t.amount) || 0;
    t.type === "Gelir" ? inc += val : exp += val;
  });
  
  const ti = document.getElementById("total-income");
  const te = document.getElementById("total-expense");
  const tb = document.getElementById("total-balance");

  if(ti) ti.textContent = inc.toLocaleString('tr-TR') + " ₺";
  if(te) te.textContent = exp.toLocaleString('tr-TR') + " ₺";
  if(tb) tb.textContent = (inc - exp).toLocaleString('tr-TR') + " ₺";
}

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

function addNewCategory() {
  const input = document.getElementById("newCategory");
  const name = input?.value.trim();
  if (!name) return alert("İsim giriniz!");
  
  const type = document.getElementById("type").value.toLowerCase();
  if (kategoriler.some(k => k.ad === name)) return alert("Mevcut!");

  kategoriler.push({ ad: name, tip: type });
  saveKategoriler(); // Veriyi buluta gönderir, telefon otomatik çeker
  input.value = "";
}

// Sayfa Başlatıcı
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  loadFirebase();
});
