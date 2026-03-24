// ===================== app.js - Düzeltilmiş ve Entegre Versiyon =====================

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

// Kategorileri Doldur (add.html için)
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

// Yeni Kategori Ekle
function addNewCategory() {
  const newCatInput = document.getElementById("newCategory");
  if (!newCatInput) return;
  const newCat = newCatInput.value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  if (kategoriler.some(k => k.ad === newCat)) return alert("Bu kategori zaten mevcut!");

  const currentType = document.getElementById("type")?.value || "Gider";
  const tip = currentType === "Gelir" ? "gelir" : currentType === "Gider" ? "gider" : "transfer";

  kategoriler.push({ ad: newCat, tip: tip });
  localStorage.setItem("kategoriler", JSON.stringify(kategoriler));

  newCatInput.value = "";
  populateCategories();
  alert("✅ Yeni kategori eklendi: " + newCat);
}

// Kayıt Ekle
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

  if (!record.date || !record.amount || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori zorunludur!");
    return;
  }

  transactions.push(record);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  alert("✅ Kayıt başarıyla eklendi!");
  e.target.reset();
  populateCategories();
  updateBalances();
}

// Hesapları Dropdown'a Doldur
function populateAccounts() {
  const select = document.getElementById("account");
  if (!select) return;
  select.innerHTML = "<option value=''>Hesap seçin</option>";

  accounts.forEach(acc => {
    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = acc.name;
    select.appendChild(opt);
  });
}

// ===================== SAYFA YÜKLENDİĞİNDE =====================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  updateBalances();

  // add.html sayfası için
  if (document.getElementById("transactionForm")) {
    populateCategories();
    populateAccounts();
    document.getElementById("type").addEventListener("change", populateCategories);

    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      document.getElementById("newCategoryDiv").style.display = "block";
    });

    document.getElementById("saveCategoryBtn").addEventListener("click", addNewCategory);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
  }
});