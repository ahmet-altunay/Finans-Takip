document.getElementById("transactionForm").addEventListener("submit", function(event) {
  event.preventDefault();
  // Burada kayıt ekleme işlemlerini yapacaksın
});
// ===================== GENEL =====================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

// Canlı saat ve tarih
function startClock() {
  function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR");

    document.getElementById("date").textContent = "Tarih: " + dateStr;
    document.getElementById("clock").textContent = "Saat: " + timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);
}
function displayBalances() {
  const balancesDiv = document.getElementById("balances");
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  if (accounts.length === 0) {
    balancesDiv.innerHTML = "<p>Henüz hesap eklenmedi.</p>";
    return;
  }

  let html = "<h2>Hesap Bakiyeleri</h2><ul>";
  accounts.forEach(acc => {
    html += `<li>${acc.name} (${acc.type}) - Bakiye: ${acc.balance || 0}</li>`;
  });
  html += "</ul>";

  balancesDiv.innerHTML = html;
}


// ===================== ADD.HTML =====================
function populateCategories() {
  const type = document.getElementById("type").value;
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = "";

  let categories = [];
  if (type === "Gelir") categories = ["Maaş Geliri", "Ders Ücreti Geliri", "Aile Destek Geliri", "Para Üstü Geliri", "Toki Depozit İadesi"];
  else if (type === "Gider") categories = ["Akaryakıt Gideri", "Araç Devir Ücreti", "Araç Sigorta", "Araç Tamir Bakım", "Araç Vergi", "Arda Harici Gider", "Arda Nafaka Bedeli", "Araç Devir Ücreti", "Babam İçin Harcanan", "Banka-Faiz Gideri", "Ehliyet Yenileme", "Ev Gideri", "Haberleşme", "İlaç-Sağlık Gideri", "Kişisel Bakım", "Küçük Demirbaş Gideri", "Toki - Depozit", "Ulaşım Gideri", "Yatırım", "Yeme-içme Gideri", "Yurtdışı Harcama"];
  else if (type === "Transfer") categories = ["Aile İçi Transfer", "Aday Ödemesi"];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function showCategoryInput() {
  document.getElementById("newCategoryDiv").style.display = "block";
}

function addCategory() {
  const newCat = document.getElementById("newCategory").value.trim();
  if (newCat) {
    const categorySelect = document.getElementById("category");
    const opt = document.createElement("option");
    opt.value = newCat;
    opt.textContent = newCat;
    categorySelect.appendChild(opt);
    categorySelect.value = newCat;
    document.getElementById("categoryMessage").textContent = "Kategori eklendi.";
    document.getElementById("categoryMessage").style.display = "block";
  }
}

function loadAccountsDropdown() {
  const accountSelect = document.getElementById("account");
  if (!accountSelect) return;
  accountSelect.innerHTML = "";
  accounts.forEach(acc => {
    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = acc.name;
    accountSelect.appendChild(opt);
  });
}

function toggleInstallments() {
  const accountSelect = document.getElementById("account");
  const installmentSection = document.getElementById("installmentSection");
  const selectedAccount = accountSelect.value;

  if (selectedAccount.includes("Kredi Kartı")) {
    installmentSection.style.display = "block";
  } else {
    installmentSection.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  if (form) {
    loadAccountsDropdown();
    form.addEventListener("submit", e => {
      e.preventDefault();
      const transaction = {
        date: document.getElementById("dateInput").value,
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        note: document.getElementById("note").value,
        amount: parseFloat(document.getElementById("amount").value),
        accountId: document.getElementById("account").value,
        installments: parseInt(document.getElementById("installments").value) || 0,
        dueDate: document.getElementById("dueDate").value
      };
      transactions.push(transaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      alert("Kayıt eklendi!");
      form.reset();
      if (typeof displayRecords === "function") displayRecords();
    });
  }
});
function showCategoryInput() {
  document.getElementById("newCategoryDiv").style.display = "block";
}

function addCategory() {
  const newCategory = document.getElementById("newCategory").value.trim();
  const categorySelect = document.getElementById("category");
  const message = document.getElementById("categoryMessage");

  if (newCategory) {
    const option = document.createElement("option");
    option.value = newCategory;
    option.textContent = newCategory;
    categorySelect.appendChild(option);
    categorySelect.value = newCategory;

    message.textContent = "Kategori eklendi.";
    message.style.display = "block";
  } else {
    message.textContent = "Kategori adı boş olamaz!";
    message.style.display = "block";
  }
}


// ===================== CSV AKTARIMI =====================
function importCSV() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Lütfen bir CSV dosyası seçin.");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    lines.forEach((line, idx) => {
      if (idx === 0 || line.startsWith("Tarih")) return; // başlığı atla
      const parts = line.split(";");
      if (parts.length < 8) return; // eksik satırları atla

      // Türkçe sayı formatını düzelt
      let amountStr = parts[4].trim().replace(/\./g, "").replace(",", ".");
      let amount = parseFloat(amountStr);

      transactions.push({
        date: parts[0].trim(),
        type: parts[1].trim(),
        category: parts[2].trim(),
        note: parts[3].trim(),
        amount: amount || 0,
        accountId: parts[5].trim(),
        installments: parseInt(parts[6]) || 0,
        dueDate: parts[7] ? parts[7].trim() : ""
      });
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("CSV aktarımı tamamlandı!");
    if (typeof displayRecords === "function") displayRecords();
  };
  reader.readAsText(file, "UTF-8");
}

// ===================== RECORDS.HTML =====================
function displayRecords() {
  const recordsList = document.getElementById("recordsList");
  recordsList.innerHTML = "";

  const records = JSON.parse(localStorage.getItem("records")) || [];

  records.forEach((rec, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rec.date}</td>
      <td>${rec.type}</td>
      <td>${rec.category}</td>
      <td>${rec.note}</td>
      <td>${rec.amount}</td>
      <td>${rec.account}</td>
      <td>${rec.installments || "-"}</td>
      <td>${rec.dueDate || "-"}</td>
      <td class="actions">
        <button onclick="editRecord(${index})">Düzenle</button>
        <button onclick="deleteRecord(${index})">Sil</button>
      </td>
    `;
    recordsList.appendChild(row);
  });
}

function editRecord(index) {
  let records = JSON.parse(localStorage.getItem("records")) || [];
  const rec = records[index];

  // Düzenleme için add.html sayfasına yönlendirme
  // index parametresi ile hangi kaydın düzenleneceğini belirtiyoruz
  location.href = "add.html?edit=" + index;
}

function deleteRecord(index) {
  let records = JSON.parse(localStorage.getItem("records")) || [];
  records.splice(index, 1);
  localStorage.setItem("records", JSON.stringify(records));
  displayRecords();
}


// ===================== REPORT.HTML =====================
function displayReport() {
  const month = document.getElementById("monthSelect").value;
  if (!month) return;

  const [year, mon] = month.split("-");
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() == year && (d.getMonth() + 1) == mon;
  });

function displayReport() {
  const month = document.getElementById("monthSelect").value;
  const records = JSON.parse(localStorage.getItem("records")) || [];

  // Seçilen aya göre filtreleme
  const filtered = records.filter(rec => rec.date.startsWith(month));

  // Gelir/Gider raporu
  let income = 0, expense = 0;
  filtered.forEach(rec => {
    if (rec.type === "Gelir") income += Number(rec.amount);
    else if (rec.type === "Gider") expense += Number(rec.amount);
  });
  document.getElementById("incomeExpenseReport").innerHTML =
    `<p>Gelir: ${income} | Gider: ${expense} | Net: ${income - expense}</p>`;

  // Kredi Kartı Borçları
  const creditCards = filtered.filter(rec => rec.account.includes("Kredi Kartı"));
  let ccHtml = "<table><tr><th>Kart</th><th>Tutar</th><th>Son Ödeme</th></tr>";
  creditCards.forEach(rec => {
    ccHtml += `<tr><td>${rec.account}</td><td>${rec.amount}</td><td>${rec.dueDate || "-"}</td></tr>`;
  });
  ccHtml += "</table>";
  document.getElementById("creditCardReport").innerHTML = ccHtml;

  // Anlık Bakiyeler
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  let balHtml = "<table><tr><th>Hesap</th><th>Bakiye</th></tr>";
  accounts.forEach(acc => {
    balHtml += `<tr><td>${acc.name}</td><td>${acc.balance || 0}</td></tr>`;
  });
  balHtml += "</table>";
  document.getElementById("balancesReport").innerHTML = balHtml;
}


  // Gelir/Gider raporu
  const incomeExpenseDiv = document.getElementById("incomeExpenseReport");
  let incomeMap = {};
  let expenseMap = {};
  filtered.forEach(t => {
    if (t.type.toLowerCase() === "gelir") {
      incomeMap[t.category] = (incomeMap[t.category] || 0) + t.amount;
    } else if (t.type.toLowerCase() === "gider") {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    }
  });

  let html = "<table><tr><th>Kategori</th><th>Toplam</th></tr>";
  Object.entries(incomeMap).forEach(([cat, sum]) => {
    html += `<tr><td>${cat} (Gelir)</td><td>${sum.toFixed(2)}</td></tr>`;
  });
  Object.entries(expenseMap).forEach(([cat, sum]) => {
    html += `<tr><td>${cat} (Gider)</td><td>${sum.toFixed
      function importCSV() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Lütfen bir CSV dosyası seçin.");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    lines.forEach((line, idx) => {
      if (idx === 0 || line.startsWith("Tarih")) return; // başlığı atla
      const parts = line.split(";");
      if (parts.length < 8) return; // eksik satırları atla

      // Tarihi düzelt (2025.11.28 → 2025-11-28)
      let dateStr = parts[0].trim().replace(/\./g, "-");

      // Türkçe sayı formatını düzelt (4.500,00 → 4500.00)
      let amountStr = parts[4].trim().replace(/\./g, "").replace(",", ".");
      let amount = parseFloat(amountStr);

      transactions.push({
        date: dateStr,
        type: parts[1].trim(),
        category: parts[2].trim(),
        note: parts[3].trim(),
        amount: amount || 0,
        accountId: parts[5].trim(),
        installments: parseInt(parts[6]) || 0,
        dueDate: parts[7] ? parts[7].trim() : ""
      });
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("CSV aktarımı tamamlandı!");
    if (typeof displayRecords === "function") displayRecords();
  };
  reader.readAsText(file, "UTF-8");
}
function importCSV() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Lütfen bir CSV dosyası seçin.");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    lines.forEach((line, idx) => {
      if (idx === 0 || line.startsWith("Tarih")) return; // başlığı atla
      const parts = line.split(";");
      if (parts.length < 8) return; // eksik satırları atla

      // Tarihi düzelt (2025.11.28 → 2025-11-28)
      let dateStr = parts[0].trim().replace(/\./g, "-");

      // Türkçe sayı formatını düzelt (4.500,00 → 4500.00)
      let amountStr = parts[4].trim().replace(/\./g, "").replace(",", ".");
      let amount = parseFloat(amountStr);

      transactions.push({
        date: dateStr,
        type: parts[1].trim().toLowerCase(), // GELİR/GİDER/TRANSFER normalize
        category: parts[2].trim(),
        note: parts[3].trim(),
        amount: amount || 0,
        accountId: parts[5].trim(),
        installments: parseInt(parts[6]) || 0,
        dueDate: parts[7] ? parts[7].trim() : ""
      });
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("CSV aktarımı tamamlandı!");
    if (typeof displayRecords === "function") displayRecords();
  };
  reader.readAsText(file, "UTF-8");
}
// Basit kayıt listesi
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Form submit yakalama
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    // Formdan değerleri al
    const transaction = {
      date: document.getElementById("dateInput").value,
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      note: document.getElementById("note").value,
      amount: parseFloat(document.getElementById("amount").value),
      accountId: document.getElementById("account").value,
      installments: parseInt(document.getElementById("installments").value) || 0,
      dueDate: document.getElementById("dueDate").value
    };

    // Listeye ekle ve kaydet
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    alert("Kayıt başarıyla eklendi!");
    form.reset();
  });
});
// app.js

const accountForm = document.getElementById("accountForm");

// Form gönderiminde çalışacak
accountForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("accountName").value.trim();
  const type = document.getElementById("accountType").value;
  const dueDayInput = document.getElementById("dueDay").value.trim();
  const dueDay = type === "Kredi Kartı" && dueDayInput !== "" ? parseInt(dueDayInput) : null;

  if (!name) {
    alert("Hesap/Kart adı boş olamaz!");
    return;
  }

  const editingIndex = accountForm.getAttribute("data-editing-index");

  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  if (editingIndex !== null) {
    // Düzenleme modunda
    accounts[editingIndex] = { name, type, dueDay };
    accountForm.removeAttribute("data-editing-index");
  } else {
    // Yeni ekleme
    accounts.push({ name, type, dueDay });
  }

  localStorage.setItem("accounts", JSON.stringify(accounts));

  accountForm.reset();
  document.getElementById("dueDateSection").style.display = "none";

  displayAccounts();
});

// Kredi kartı seçildiğinde son ödeme günü alanını aç/kapat
function toggleDueDate() {
  const type = document.getElementById("accountType").value;
  const dueDateSection = document.getElementById("dueDateSection");
  if (type === "Kredi Kartı") {
    dueDateSection.style.display = "block";
  } else {
    dueDateSection.style.display = "none";
  }
}

// Hesapları tabloya yazdır
function displayAccounts() {
  const accountsList = document.getElementById("accountsList");
  accountsList.innerHTML = "";

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  accounts.forEach((acc, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${acc.name}</td>
      <td>${acc.type}</td>
      <td>${acc.type === "Kredi Kartı" ? (acc.dueDay || "-") : "-"}</td>
      <td>
        <button onclick="editAccount(${index})">Düzenle</button>
        <button onclick="deleteAccount(${index})">Sil</button>
      </td>
    `;
    accountsList.appendChild(row);
  });
}

// Hesap silme
function deleteAccount(index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  accounts.splice(index, 1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  displayAccounts();
}

// Hesap düzenleme
function editAccount(index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const acc = accounts[index];

  document.getElementById("accountName").value = acc.name;
  document.getElementById("accountType").value = acc.type;
  toggleDueDate();

  if (acc.type === "Kredi Kartı" && acc.dueDay) {
    document.getElementById("dueDay").value = acc.dueDay;
  } else {
    document.getElementById("dueDay").value = "";
  }

  accountForm.setAttribute("data-editing-index", index);
}
