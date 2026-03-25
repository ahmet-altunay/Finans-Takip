<<<<<<< HEAD
// ===================== app.js - FIREBASE ENTEGRASYONU (DÜZELTİLMİŞ) =====================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
=======
// ===================== FIREBASE ve LOCALSTORAGE =====================
let transactions = [];
let accounts = [];
let kategoriler = [];
let isOnline = navigator.onLine;

// Firebase referansları
let db = null;
let auth = null;

// Firebase hazır olana kadar bekle
function waitForFirebase() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.db) {
        db = window.db;
        auth = window.auth;
        clearInterval(checkInterval);
        console.log("✅ Firebase referansları alındı!");
        resolve();
      }
    }, 100);
    
    // 5 saniye sonra timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn("⚠️ Firebase yüklenemedi, LocalStorage kullanılacak");
      resolve();
    }, 5000);
  });
}
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f

const firebaseConfig = {
  apiKey: "AIzaSyDRz_pRfHM7AGTz4c21bQhtg9DxCqlb2ek",
  authDomain: "aa-perfin-tracking-d33b8.firebaseapp.com",
  databaseURL: "https://aa-perfin-tracking-d33b8-default-rtdb.firebaseio.com",
  projectId: "aa-perfin-tracking-d33b8",
  storageBucket: "aa-perfin-tracking-d33b8.firebasestorage.app",
  messagingSenderId: "374462035684",
  appId: "1:374462035684:web:f30fc6f0de73477826def1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global veriler
let transactions = [];
let accounts = [];
let kategoriler = [];

<<<<<<< HEAD
// ===================== VERİ YÜKLEME =====================
function loadDataFromFirebase() {
  // Transactions
  onValue(ref(db, 'transactions'), (snapshot) => {
    transactions = snapshot.val() ? Object.values(snapshot.val()) : [];
    updateBalances();
    if (typeof loadRecords === "function") loadRecords();
=======
// ===================== FIRESTORE'DAN VERİ ÇEK =====================
async function syncFromFirebase() {
  if (!db) {
    console.warn("⚠️ Firebase hazır değil, LocalStorage kullanılıyor");
    loadFromLocalStorage();
    return false;
  }

  try {
    // Transactions
    const transSnapshot = await db.collection('transactions').get();
    transactions = [];
    transSnapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    // Accounts
    const accSnapshot = await db.collection('accounts').get();
    accounts = [];
    accSnapshot.forEach(doc => {
      accounts.push({ id: doc.id, ...doc.data() });
    });

    // Kategoriler
    const catSnapshot = await db.collection('kategoriler').get();
    kategoriler = [];
    catSnapshot.forEach(doc => {
      kategoriler.push({ id: doc.id, ...doc.data() });
    });

    // LocalStorage'a kaydet
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('kategoriler', JSON.stringify(kategoriler));

    updateBalances();
    console.log("✅ Firebase'den senkronizasyon tamamlandı!");
    return true;
  } catch (error) {
    console.error("❌ Firebase senkronizasyon hatası:", error);
    loadFromLocalStorage();
    return false;
  }
}

// ===================== LOCALSTORAGE'DEN YÜKLEME =====================
function loadFromLocalStorage() {
  transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  accounts = JSON.parse(localStorage.getItem('accounts')) || [];
  kategoriler = JSON.parse(localStorage.getItem('kategoriler')) || [];
  updateBalances();
  console.log("📱 LocalStorage'dan yüklendi");
}

// ===================== KATEGORİ DOLDURMA =====================
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
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f
  });

  // Accounts
  onValue(ref(db, 'accounts'), (snapshot) => {
    accounts = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateAccounts === "function") populateAccounts();
  });

  // Kategoriler
  onValue(ref(db, 'kategoriler'), (snapshot) => {
    kategoriler = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateCategories === "function") populateCategories();
  });
}

<<<<<<< HEAD
// ===================== VERİ KAYDETME =====================
function saveTransactions() {
  set(ref(db, 'transactions'), transactions);
}

function saveAccounts() {
  set(ref(db, 'accounts'), accounts);
}

function saveKategoriler() {
  set(ref(db, 'kategoriler'), kategoriler);
}

// ===================== Diğer Fonksiyonlar (Kısaltıldı) =====================
function startClock() { /* ... aynı */ }
function updateBalances() { /* ... aynı */ }
function populateCategories() { /* ... aynı */ }
function addNewCategory() { /* ... aynı */ }
function populateAccounts() { /* ... aynı */ }

function addTransaction(e) {
=======
// ===================== YENİ KATEGORİ EKLE =====================
async function addNewCategory() {
  const newCat = document.getElementById("newCategory").value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  if (kategoriler.some(k => k.ad === newCat)) 
    return alert("Bu kategori zaten mevcut!");

  const currentType = document.getElementById("type").value;
  const tip = currentType === "Gelir" ? "gelir" : 
              currentType === "Gider" ? "gider" : "transfer";

  const newCategory = { ad: newCat, tip: tip };

  // LocalStorage'a ekle
  kategoriler.push(newCategory);
  localStorage.setItem("kategoriler", JSON.stringify(kategoriler));

  // Firebase'e gönder
  if (isOnline && db) {
    try {
      await db.collection('kategoriler').add(newCategory);
      console.log("✅ Kategori Firebase'e gönderildi");
    } catch (error) {
      console.warn("⚠️ Kategori offline modda kaydedildi, daha sonra senkronize edilecek", error);
    }
  }

  document.getElementById("newCategory").value = "";
  populateCategories();
  alert("✅ Yeni kategori eklendi: " + newCat);
}

// ===================== YENİ KAYIT EKLE =====================
async function addTransaction(e) {
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f
  e.preventDefault();

  const record = {
    id: Date.now().toString(),
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value || "Nakit",
<<<<<<< HEAD
    timestamp: Date.now()
=======
    timestamp: new Date().toISOString()
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f
  };

  if (!record.date || isNaN(record.amount) || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori alanlarını doldurunuz!");
    return;
  }

  // LocalStorage'a ekle
  transactions.push(record);
  saveTransactions();     // ← Firebase'e kaydet

<<<<<<< HEAD
  alert("✅ Kayıt başarıyla eklendi ve Firebase'e yüklendi!");
=======
  // Firebase'e gönder
  if (isOnline && db) {
    try {
      await db.collection('transactions').add(record);
      console.log("✅ İşlem Firebase'e gönderildi");
    } catch (error) {
      console.warn("⚠️ İşlem offline modda kaydedildi, daha sonra senkronize edilecek", error);
    }
  }

  alert("✅ Kayıt başarıyla eklendi!");
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f
  e.target.reset();
  populateCategories();
  updateBalances();
}

<<<<<<< HEAD
// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  loadDataFromFirebase();   // Firebase'den verileri çek
=======
// ===================== CSV İÇE AKTARMA =====================
async function importCSV() {
  const csvData = `Tarih;Tür;Kategori;Açıklama;Tutar;Hesap/Kart:;Taksit Sayısı;Son Ödeme Tarihi
2025.11.28;GİDER;ARAÇ TAMİR BAKIM;Hasan Eyi - MESUT YURDAGELEN / TERMOSTAT VE BORU DEĞİŞİMİ MALZEME VE İŞÇİLİĞİ;4.500,00;ENPARA Vd.siz TL;0;2025.11.28`;

  const lines = csvData.trim().split("\n");
  let added = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(";;;;")) continue;

    const cols = line.split(";");
    if (cols.length < 5) continue;

    let tutarStr = cols[4].trim().replace(/\./g, "").replace(",", ".");
    const tutar = parseFloat(tutarStr);

    const record = {
      date: cols[0].trim().replace(/\./g, "-"),
      type: cols[1].trim().replace("GİDER", "Gider").replace("GELİR", "Gelir").replace("TRANSFER", "Transfer"),
      category: cols[2].trim(),
      note: cols[3] ? cols[3].trim() : "",
      amount: isNaN(tutar) ? 0 : tutar,
      account: cols[5] ? cols[5].trim() : "Nakit",
      timestamp: new Date().toISOString()
    };

    if (record.date && record.amount !== 0 && record.category) {
      transactions.push(record);
      added++;
    }
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  // Firebase'e gönder
  if (isOnline && db) {
    for (let trans of transactions) {
      try {
        await db.collection('transactions').add(trans);
      } catch (error) {
        console.warn("⚠️ CSV verisi kısmen kaydedildi", error);
      }
    }
  }

  alert(`✅ ${added} kayıt başarıyla yüklendi!`);
  updateBalances();
}

// ===================== HESAP / KART DROPDOWN DOLDURMA =====================
function populateAccounts() {
  const select = document.getElementById("account");
  if (!select) return;

  select.innerHTML = '<option value="">Hesap / Kart seçin...</option>';

  if (accounts.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
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

// ===================== INTERNET BAĞLANTISI TAKİBİ =====================
window.addEventListener('online', () => {
  isOnline = true;
  console.log("🌐 İnternet bağlantısı kuruldu - Senkronizasyon başlıyor...");
  if (db) syncFromFirebase();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log("📴 Çevrimdışı mod - LocalStorage kullanılıyor");
});

// ===================== SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KISIM =====================
document.addEventListener("DOMContentLoaded", async () => {
  startClock();
  
  // Firebase hazır olana kadar bekle
  await waitForFirebase();
  
  // İlk yükleme: Firebase'den çek, başarısız olursa LocalStorage'dan yükle
  const synced = await syncFromFirebase();
  if (!synced) {
    loadFromLocalStorage();
  }
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f

  if (document.getElementById("transactionForm")) {
    populateAccounts();
    populateCategories();
    document.getElementById("type").addEventListener("change", populateCategories);

    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      document.getElementById("newCategoryDiv").style.display = "block";
    });

    document.getElementById("saveCategoryBtn").addEventListener("click", addNewCategory);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
  }

  const csvBtn = document.getElementById("csvBtn");
<<<<<<< HEAD
  if (csvBtn) csvBtn.addEventListener("click", importCSV);
});
=======
  if (csvBtn) {
    csvBtn.addEventListener("click", importCSV);
  }

  // Hesap dropdown
  if (document.getElementById("account")) {
    populateAccounts();
  }
});

// ===================== HER 30 SANİYE SİNKRONİZASYON =====================
setInterval(() => {
  if (isOnline && db) {
    syncFromFirebase().catch(error => console.warn("Periyodik senkronizasyon hatası:", error));
  }
}, 30000);
>>>>>>> ac233cc28329cd0bd4a2afc5501d38eb0396cc0f
