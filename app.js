// ===================== app.js - Finans Takip Sistemi =====================

// Global veriler
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

// ===================== SAAT ve BAKİYE =====================
function startClock() {
  function updateClock() {
    const now = new Date();
    document.getElementById("date")?.textContent = "Tarih: " + now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    document.getElementById("clock")?.textContent = "Saat: " + now.toLocaleTimeString("tr-TR");
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function displayBalances() {
  const div = document.getElementById("balances");
  if (!div) return;

  let income = 0, expense = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === "Gelir") income += amt;
    else if (t.type === "Gider") expense += amt;
  });

  const bakiye = income - expense;

  div.innerHTML = `
    <p><strong>Toplam Gelir:</strong> <span style="color:#28a745">${income.toLocaleString('tr-TR')} ₺</span></p>
    <p><strong>Toplam Gider:</strong> <span style="color:#dc3545">${expense.toLocaleString('tr-TR')} ₺</span></p>
    <p><strong>Kalan Bakiye:</strong> <span style="font-size:18px; color:${bakiye >= 0 ? '#28a745' : '#dc3545'}">${bakiye.toLocaleString('tr-TR')} ₺</span></p>
  `;
}

// ===================== KATEGORİLER =====================
function populateCategories() {
  const type = document.getElementById("type")?.value;
  const catSelect = document.getElementById("category");
  if (!catSelect) return;

  catSelect.innerHTML = "";

  let cats = [];
  if (type === "Gelir") cats = ["Maaş", "Freelance", "Aile", "Diğer Gelir"];
  else if (type === "Gider") cats = ["Yemek", "Ulaşım", "Market", "Fatura", "Sağlık", "Eğlence", "Kira", "Diğer"];
  else if (type === "Transfer") cats = ["Hesaplar Arası", "Aile İçi"];

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });
}

function addCategory() {
  const newCatInput = document.getElementById("newCategory");
  const catSelect = document.getElementById("category");
  if (!newCatInput || !catSelect) return;

  const newCat = newCatInput.value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  const opt = document.createElement("option");
  opt.value = newCat;
  opt.textContent = newCat;
  catSelect.appendChild(opt);
  catSelect.value = newCat;

  newCatInput.value = "";
  alert("Yeni kategori eklendi: " + newCat);
}

// ===================== KAYIT EKLEME =====================
function saveRecord(e) {
  e.preventDefault();

  const record = {
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value,
    installments: parseInt(document.getElementById("installments").value) || 0,
    dueDate: document.getElementById("dueDate").value || ""
  };

  if (!record.date || !record.amount) {
    alert("Tarih ve Tutar alanları zorunludur!");
    return;
  }

  transactions.push(record);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  alert("✅ Kayıt başarıyla eklendi!");
  e.target.reset();
  populateCategories();

  // Ana sayfadaki bakiyeleri güncelle
  displayBalances();
}

// ===================== KAYITLARI GÖSTER =====================
function displayRecords() {
  const tbody = document.getElementById("recordsList");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (transactions.length === 0) {
    document.getElementById("emptyMessage").style.display = "block";
    return;
  }

  document.getElementById("emptyMessage").style.display = "none";

  transactions.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date || "-"}</td>
      <td>${t.type || "-"}</td>
      <td>${t.category || "-"}</td>
      <td>${t.note || "-"}</td>
      <td style="font-weight:bold; color:${t.type === "Gelir" ? "#28a745" : "#dc3545"}">
        ${parseFloat(t.amount).toLocaleString('tr-TR')} ₺
      </td>
      <td>${t.account || "-"}</td>
      <td>${t.installments || "-"}</td>
      <td>${t.dueDate || "-"}</td>
      <td><button class="delete-btn" onclick="deleteRecord(${i})">Sil</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteRecord(index) {
  if (confirm("Bu kaydı silmek istediğinden emin misin?")) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    displayRecords();
    displayBalances();
  }
}

// ===================== HESAPLAR =====================
function loadAccountsDropdown() {
  const select = document.getElementById("account");
  if (!select) return;

  select.innerHTML = "";
  accounts.forEach(acc => {
    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = acc.name;
    select.appendChild(opt);
  });
}

function displayAccounts() {
  const tbody = document.getElementById("accountsList");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (accounts.length === 0) {
    document.getElementById("emptyMessage").style.display = "block";
    return;
  }
  document.getElementById("emptyMessage").style.display = "none";

  accounts.forEach((acc, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${acc.name}</td>
      <td>${acc.type}</td>
      <td>${acc.balance ? parseFloat(acc.balance).toLocaleString('tr-TR') + " ₺" : "-"}</td>
      <td><button class="delete-btn" onclick="deleteAccount(${i})">Sil</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteAccount(index) {
  if (confirm("Bu hesabı silmek istediğinden emin misin?")) {
    accounts.splice(index, 1);
    localStorage.setItem("accounts", JSON.stringify(accounts));
    displayAccounts();
    loadAccountsDropdown();
  }
}

// ===================== CSV YÜKLEME =====================
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

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",");
      if (cols.length < 5) continue;

      const record = {
        date: cols[0].trim(),
        type: cols[1].trim(),
        category: cols[2].trim(),
        note: cols[3].trim(),
        amount: parseFloat(cols[4].trim().replace(",", ".")),
        account: cols[5] ? cols[5].trim() : "Nakit"
      };

      if (record.date && record.amount) {
        transactions.push(record);
        added++;
      }
    }

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert(`${added} kayıt CSV'den başarıyla yüklendi!`);
    displayRecords();
    displayBalances();
  };

  reader.readAsText(fileInput.files[0], "UTF-8");
}

// ===================== SAYFA YÜKLENDİĞİNDE =====================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  displayBalances();

  // add.html için
  if (document.getElementById("type")) {
    populateCategories();
    document.getElementById("type").addEventListener("change", populateCategories);
  }

  if (document.getElementById("transactionForm")) {
    document.getElementById("transactionForm").addEventListener("submit", saveRecord);
  }

  if (document.getElementById("addCategoryBtn")) {
    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      document.getElementById("newCategoryDiv").style.display = "block";
    });
  }

  if (document.getElementById("saveCategoryBtn")) {
    document.getElementById("saveCategoryBtn").addEventListener("click", addCategory);
  }

  if (document.getElementById("csvBtn")) {
    document.getElementById("csvBtn").addEventListener("click", importCSV);
  }

  // records.html ve accounts.html için
  displayRecords();
  displayAccounts();
  loadAccountsDropdown();
});