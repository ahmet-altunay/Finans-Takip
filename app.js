// ===================== FIREBASE ve LOCALSTORAGE =====================
let transactions = [];
let accounts = [];
let kategoriler = [];
let isOnline = navigator.onLine;

// Firebase referansları (index.html'den global olarak tanımlanmış)
const db = window.db;
const auth = window.auth;

// ===================== SAAT ve TARİH =====================
function startClock() {
  function update() {
    const now = new Date();
    if (document.getElementById("date")) {
      document.getElementById("date").textContent = 
        now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    if (document.getElementById("clock")) {
      document.getElementById("clock").textContent = now.toLocaleTimeString("tr-TR");
    }
  }
  update();
  setInterval(update, 1000);
}

// ===================== BAKİYE GÜNCELLEME =====================
function updateBalances() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === "Gelir") income += amt;
    else if (t.type === "Gider") expense += amt;
  });
  const balance = income - expense;

  if (document.getElementById("total-income")) 
    document.getElementById("total-income").textContent = income.toLocaleString('tr-TR') + " ₺";
  if (document.getElementById("total-expense")) 
    document.getElementById("total-expense").textContent = expense.toLocaleString('tr-TR') + " ₺";
  if (document.getElementById("total-balance")) 
    document.getElementById("total-balance").textContent = balance.toLocaleString('tr-TR') + " ₺";
}

// ===================== FIRESTORE'DAN VERİ ÇEK =====================
async function syncFromFirebase() {
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
  });

  filtered.forEach(k => {
    const opt = document.createElement("option");
    opt.value = k.ad;
    opt.textContent = k.ad;
    catSelect.appendChild(opt);
  });
}

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
  if (isOnline) {
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
  e.preventDefault();

  const record = {
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value || "Nakit",
    timestamp: new Date().toISOString()
  };

  if (!record.date || isNaN(record.amount) || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori alanlarını doldurunuz!");
    return;
  }

  // LocalStorage'a ekle
  transactions.push(record);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Firebase'e gönder
  if (isOnline) {
    try {
      await db.collection('transactions').add(record);
      console.log("✅ İşlem Firebase'e gönderildi");
    } catch (error) {
      console.warn("⚠️ İşlem offline modda kaydedildi, daha sonra senkronize edilecek", error);
    }
  }

  alert("✅ Kayıt başarıyla eklendi!");
  e.target.reset();
  populateCategories();
  updateBalances();
}

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
  if (isOnline) {
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
  syncFromFirebase();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log("📴 Çevrimdışı mod - LocalStorage kullanılıyor");
});

// ===================== SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KISIM =====================
document.addEventListener("DOMContentLoaded", async () => {
  startClock();
  
  // İlk yükleme: Firebase'den çek, başarısız olursa LocalStorage'dan yükle
  const synced = await syncFromFirebase();
  if (!synced) {
    loadFromLocalStorage();
  }

  // add.html sayfası için
  if (document.getElementById("transactionForm")) {
    populateCategories();
    document.getElementById("type").addEventListener("change", populateCategories);

    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      document.getElementById("newCategoryDiv").style.display = "block";
    });

    document.getElementById("saveCategoryBtn").addEventListener("click", addNewCategory);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
  }

  // CSV butonu için (add.html)
  const csvBtn = document.getElementById("csvBtn");
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
  if (isOnline) {
    syncFromFirebase().catch(error => console.warn("Periyodik senkronizasyon hatası:", error));
  }
}, 30000);
