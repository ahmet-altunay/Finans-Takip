// ===================== app.js - TAM DÜZELTİLMİŞ VERSİYON =====================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let kategoriler = JSON.parse(localStorage.getItem("kategoriler")) || [];

// Saat ve Tarih
function startClock() {
  function update() {
    const now = new Date();
    document.getElementById("date") && (document.getElementById("date").textContent = 
      now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    document.getElementById("clock") && (document.getElementById("clock").textContent = 
      now.toLocaleTimeString("tr-TR"));
  }
  update();
  setInterval(update, 1000);
}

// Bakiyeleri Güncelle
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

// Kategorileri Doldur
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

// Yeni Kategori Ekle (add.html içinden)
function addNewCategory() {
  const newCat = document.getElementById("newCategory").value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  if (kategoriler.some(k => k.ad === newCat)) return alert("Bu kategori zaten mevcut!");

  const currentType = document.getElementById("type").value;
  const tip = currentType === "Gelir" ? "gelir" : currentType === "Gider" ? "gider" : "transfer";

  kategoriler.push({ ad: newCat, tip: tip });
  localStorage.setItem("kategoriler", JSON.stringify(kategoriler));

  document.getElementById("newCategory").value = "";
  populateCategories();
  alert("✅ Yeni kategori eklendi: " + newCat);
}

// ===================== YENİ KAYIT EKLEME =====================
function addTransaction(e) {
  e.preventDefault();

  const record = {
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value || "Nakit"
  };

  if (!record.date || isNaN(record.amount) || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori alanlarını doldurunuz!");
    return;
  }

  transactions.push(record);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  alert("✅ Kayıt başarıyla eklendi!");
  e.target.reset();
  populateCategories();
  updateBalances();
}

// ===================== CSV İÇE AKTARMA =====================
function importCSV() {
  const fileInput = document.getElementById("csvFile");
  if (!fileInput || !fileInput.files[0]) {
    alert("Lütfen bir CSV dosyası seçin!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split("\n");
    let added = 0;

    for (let i = 1; i < lines.length; i++) {   // ilk satır başlık ise atla
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",");
      if (cols.length < 5) continue;

      const record = {
        date: cols[0].trim(),
        type: cols[1].trim(),
        category: cols[2].trim(),
        note: cols[3] ? cols[3].trim() : "",
        amount: parseFloat(cols[4].trim().replace(",", ".")),
        account: cols[5] ? cols[5].trim() : "Nakit"
      };

      if (record.date && !isNaN(record.amount) && record.category) {
        transactions.push(record);
        added++;
      }
    }

    if (added > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
      alert(`${added} kayıt CSV'den başarıyla yüklendi!`);
      updateBalances();
    } else {
      alert("CSV dosyasında geçerli kayıt bulunamadı.");
    }
  };

  reader.readAsText(fileInput.files[0], "UTF-8");
}

// ===================== SAYFA YÜKLENDİĞİNDE =====================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  updateBalances();

  // add.html için
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
});