// ===================== GENEL =====================
<<<<<<< HEAD
function startClock() {
  function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR");
    document.getElementById("date").textContent = "Tarih: " + dateStr;
    document.getElementById("clock").textContent = "Saat: " + timeStr;
=======
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

// ===================== SAAT =====================
function startClock() {
  function updateClock() {
    const now = new Date();
    document.getElementById("date")?.textContent = "Tarih: " + now.toLocaleDateString("tr-TR");
    document.getElementById("clock")?.textContent = "Saat: " + now.toLocaleTimeString("tr-TR");
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
  }
  updateClock();
  setInterval(updateClock, 1000);
}

<<<<<<< HEAD
function displayBalances() {
  const balancesDiv = document.getElementById("balances");
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
=======
// ===================== BAKİYELER =====================
function displayBalances() {
  const div = document.getElementById("balances");
  if (!div) return;

>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
  if (accounts.length === 0) {
    div.innerHTML = "<p>Henüz hesap yok</p>";
    return;
  }
<<<<<<< HEAD
  let html = "<h2>Hesap Bakiyeleri</h2><ul>";
=======

  let html = "<h3>Hesaplar</h3><ul>";
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
  accounts.forEach(acc => {
    html += `<li>${acc.name} (${acc.type}) - ${acc.balance || 0}₺</li>`;
  });
  html += "</ul>";
<<<<<<< HEAD
  balancesDiv.innerHTML = html;
=======

  div.innerHTML = html;
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
}

// ===================== ADD.HTML =====================
// Sayfa yüklendiğinde çalışacak başlangıç ayarları
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("type")) populateCategories();
    if (document.getElementById("account")) loadAccountsDropdown();
    
    // Form gönderme olayını dinle
    const form = document.getElementById("transactionForm");
    if (form) {
        form.addEventListener("submit", saveRecord);
    }
});

// Tür seçimine göre kategorileri doldurur
function populateCategories() {
    const type = document.getElementById("type").value;
    const categorySelect = document.getElementById("category");
    if (!categorySelect) return;

    categorySelect.innerHTML = "";
    let categories = [];

    if (type === "Gelir") {
        categories = ["Maaş", "Ders Ücreti", "Aile Destek", "Para Üstü", "Depozit İadesi"];
    } else if (type === "Gider") {
        categories = ["Akaryakıt", "Araç Sigorta", "Ev Gideri", "Yeme-İçme", "Sağlık", "Yatırım"];
    } else if (type === "Transfer") {
        categories = ["Aile İçi Transfer", "Ödeme"];
    }

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// Yeni kategori ekleme fonksiyonu
function addCategory() {
    const newCat = document.getElementById("newCategory").value.trim();
    const categorySelect = document.getElementById("category");
    const message = document.getElementById("categoryMessage");

    if (newCat) {
        const opt = document.createElement("option");
        opt.value = newCat;
        opt.textContent = newCat;
        categorySelect.appendChild(opt);
        categorySelect.value = newCat; // Yeni ekleneni seçili yap
        
        message.textContent = "Kategori eklendi.";
        message.style.color = "green";
        message.style.display = "block";
        document.getElementById("newCategory").value = ""; // Kutuyu temizle
    } else {
        message.textContent = "Kategori adı boş olamaz!";
        message.style.color = "red";
        message.style.display = "block";
    }
}

// Hesapları LocalStorage'dan yükle
function loadAccountsDropdown() {
    const accountSelect = document.getElementById("account");
    if (!accountSelect) return;

    accountSelect.innerHTML = "";
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [
        { name: "Nakit" },
        { name: "Kredi Kartı" }
    ];

    accounts.forEach(acc => {
        const opt = document.createElement("option");
        opt.value = acc.name;
        opt.textContent = acc.name;
        accountSelect.appendChild(opt);
    });
}

// Kaydı kaydetme fonksiyonu
function saveRecord(event) {
    event.preventDefault();
    const record = {
        date: document.getElementById("dateInput").value,
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        note: document.getElementById("note").value,
        amount: Number(document.getElementById("amount").value),
        account: document.getElementById("account").value,
        installments: Number(document.getElementById("installments").value || 0),
        dueDate: document.getElementById("dueDate").value
    };

    let records = JSON.parse(localStorage.getItem("records")) || [];
    records.push(record);
    localStorage.setItem("records", JSON.stringify(records));
    
    alert("Kayıt başarıyla eklendi!");
    document.getElementById("transactionForm").reset();
    populateCategories(); // Form sıfırlandığı için kategorileri tazele
}

// CSV Aktarma Fonksiyonu (Eksik olan kısım)
function importCSV() {
    const fileInput = document.getElementById("csvFile");
    if (fileInput.files.length === 0) {
        alert("Lütfen bir CSV dosyası seçin!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split("\n");
        let records = JSON.parse(localStorage.getItem("records")) || [];

        // İlk satırı (başlık) atlamak için i=1'den başlatabilirsiniz
        for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(",");
            if (data.length >= 5) {
                records.push({
                    date: data[0],
                    type: data[1],
                    category: data[2],
                    note: data[3],
                    amount: Number(data[4]),
                    account: data[5] || "Bilinmiyor"
                });
            }
        }
        localStorage.setItem("records", JSON.stringify(records));
        alert("CSV verileri başarıyla aktarıldı!");
    };

    reader.readAsText(file);
}
// ===================== RECORDS.HTML =====================
function displayRecords() {
  const recordsList = document.getElementById("recordsList");
  recordsList.innerHTML = "";
  const records = JSON.parse(localStorage.getItem("records")) || [];
=======
// ===================== FORM SUBMIT =====================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  displayBalances();
  loadAccountsDropdown();
  displayAccounts?.();
  displayRecords?.();

  // TRANSACTION FORM
  const form = document.getElementById("transactionForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      const t = {
        date: document.getElementById("dateInput").value,
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        note: document.getElementById("note").value,
        amount: parseFloat(document.getElementById("amount").value),
        accountId: document.getElementById("account").value
      };

      transactions.push(t);
      localStorage.setItem("transactions", JSON.stringify(transactions));

      alert("Kayıt eklendi");
      form.reset();
    });
  }

  // ACCOUNT FORM
  const accountForm = document.getElementById("accountForm");
  if (accountForm) {
    accountForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = document.getElementById("accountName").value.trim();
      const type = document.getElementById("accountType").value;

      if (!name) return alert("İsim boş olamaz");

      accounts.push({ name, type });
      localStorage.setItem("accounts", JSON.stringify(accounts));

      accountForm.reset();
      displayAccounts();
    });
  }
});

// ===================== RECORDS =====================
function displayRecords() {
  const table = document.getElementById("recordsList");
  if (!table) return;

  table.innerHTML = "";
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628

  transactions.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
<<<<<<< HEAD
      <td>${rec.date}</td>
      <td>${rec.type}</td>
      <td>${rec.category}</td>
      <td>${rec.note}</td>
      <td>${rec.amount}</td>
      <td>${rec.account}</td>
      <td>${rec.installments || "-"}</td>
      <td>${rec.dueDate || "-"}</td>
      <td><button onclick="deleteRecord(${index})">Sil</button></td>
=======
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>${t.note}</td>
      <td>${t.amount}</td>
      <td>${t.accountId}</td>
      <td>
        <button onclick="deleteRecord(${i})">Sil</button>
      </td>
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
    `;
    table.appendChild(row);
  });
}

<<<<<<< HEAD
function deleteRecord(index) {
  let records = JSON.parse(localStorage.getItem("records")) || [];
  records.splice(index, 1);
  localStorage.setItem("records", JSON.stringify(records));
  displayRecords();
}

// ===================== REPORT.HTML =====================
function displayReport() {
  const month = document.getElementById("monthSelect").value;
  const records = JSON.parse(localStorage.getItem("records")) || [];

  // Seçilen aya göre filtreleme
  const filtered = records.filter(rec => rec.date.startsWith(month));

  // Gelir/Gider raporu
  let income = 0, expense = 0;
  filtered.forEach(rec => {
    if (rec.type === "Gelir") income += rec.amount;
    else if (rec.type === "Gider") expense += rec.amount;
  });
  document.getElementById("incomeExpenseReport").innerHTML =
    `<p>Gelir: ${income} | Gider: ${expense} | Net: ${income - expense}</p>`;

  // Kredi Kartı Borçları
  let ccHtml = "<table><tr><th>Kart</th><th>Tutar</th><th>Son Ödeme</th></tr>";
  filtered.filter(rec => rec.account.includes("Kredi Kartı")).forEach(rec => {
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
    let records = JSON.parse(localStorage.getItem("records")) || [];

    lines.forEach((line, idx) => {
      if (idx === 0 || line.startsWith("Tarih")) return;
      const parts = line.split(";");
      if (parts.length < 8) return;

      let amountStr = parts[4].trim().replace(/\./g, "").replace(",", ".");
      let amount = parseFloat(amountStr);

      records.push({
        date: parts[0].trim(),
        type: parts[1].trim(),
        category: parts[2].trim(),
        note: parts[3].trim(),
        amount: amount || 0,
        account: parts[5].trim(),
        installments: parseInt(parts[6]) || 0,
        dueDate: parts[7] ? parts[7].trim() : ""
      });
    });

    localStorage.setItem("records", JSON.stringify(records));
    alert("CSV aktarımı tamamlandı! " + records.length + " kayıt var.");
    if (typeof displayRecords === "function") displayRecords();
  };

  reader.readAsText(file, "UTF-8");
}

// ===================== ACCOUNTS.HTML =====================
function toggleDueDate() {
  const type = document.getElementById("accountType").value;
  const dueDateSection = document.getElementById("dueDateSection");
  if (type === "Kredi Kartı") {
    dueDateSection.style.display = "block";
  } else {
    dueDateSection.style.display = "none";
  }
}

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
  ;`
  accountsList.appendChild(row);
});


function deleteAccount(index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  accounts.splice(index, 1);
=======
function deleteRecord(i) {
  transactions.splice(i, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  displayRecords();
}

// ===================== ACCOUNTS =====================
function displayAccounts() {
  const table = document.getElementById("accountsList");
  if (!table) return;

  table.innerHTML = "";

  accounts.forEach((a, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.name}</td>
      <td>${a.type}</td>
      <td>
        <button onclick="deleteAccount(${i})">Sil</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function deleteAccount(i) {
  accounts.splice(i, 1);
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
  localStorage.setItem("accounts", JSON.stringify(accounts));
  displayAccounts();
}

<<<<<<< HEAD
function editAccount(index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const acc = accounts[index];
=======
// ===================== CSV =====================
function importCSV() {
  const input = document.getElementById("csvFile");
  if (!input || !input.files[0]) return alert("Dosya seç");
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628

  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split("\n");

    lines.forEach((line, i) => {
      if (i === 0) return;

<<<<<<< HEAD
  document.getElementById("accountForm").setAttribute("data-editing-index", index);
}

document.addEventListener("DOMContentLoaded", () => {
  const accountForm = document.getElementById("accountForm");
  if (accountForm) {
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

      let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
      const editingIndex = accountForm.getAttribute("data-editing-index");

      if (editingIndex !== null) {
        accounts[editingIndex] = { name, type, dueDay };
        accountForm.removeAttribute("data-editing-index");
      } else {
        accounts.push({ name, type, dueDay });
      }

      localStorage.setItem("accounts", JSON.stringify(accounts)); accountForm.reset();
      document.getElementById("dueDateSection").style.display = "none";
      displayAccounts();
    });
  }
});
=======
      const p = line.split(";");
      if (p.length < 5) return;

      transactions.push({
        date: p[0],
        type: p[1],
        category: p[2],
        note: p[3],
        amount: parseFloat(p[4].replace(",", ".")),
        accountId: p[5]
      });
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("CSV yüklendi");
  };

  reader.readAsText(input.files[0]);
}
>>>>>>> 6ac4c93e5fa59e65a5cc6cca518b590a619ac628
