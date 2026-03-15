// ===================== GENEL =====================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

// Canlı saat ve tarih
function startClock() {
  function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("tr-TR");
    if (document.getElementById("date")) document.getElementById("date").textContent = dateStr;
    if (document.getElementById("clock")) document.getElementById("clock").textContent = timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// ===================== ADD.HTML =====================
function populateCategories() {
  const type = document.getElementById("type").value;
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = "";

  let categories = [];
  if (type.toLowerCase() === "gelir") categories = ["Maaş", "Ek Gelir"];
  else if (type.toLowerCase() === "gider") categories = ["Market", "Fatura", "Ulaşım", "Eğlence"];
  else if (type.toLowerCase() === "transfer") categories = ["Hesaplar Arası"];

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
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
  const account = document.getElementById("account").value;
  const section = document.getElementById("installmentSection");
  if (account.includes("Kredi Kartı")) {
    section.style.display = "block";
  } else {
    section.style.display = "none";
    document.getElementById("installments").value = 0;
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
  if (!recordsList) return;
  recordsList.innerHTML = "";

  transactions.forEach((t, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>${t.note}</td>
      <td>${t.amount.toFixed(2)}</td>
      <td>${t.accountId}</td>
      <td>${t.installments}</td>
      <td>${t.dueDate || ""}</td>
      <td class="actions">
        <button onclick="editRecord(${index})">Düzenle</button>
        <button onclick="deleteRecord(${index})">Sil</button>
      </td>
    `;
    recordsList.appendChild(row);
  });
}

function editRecord(index) {
  const t = transactions[index];
  alert("Düzenleme için add.html sayfasına gidiniz. Açıklama: " + t.note);
}

function deleteRecord(index) {
  if (confirm("Bu kaydı silmek istediğine emin misin?")) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    displayRecords();
  }
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
