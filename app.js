// Tüm kayıtlar
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Hesap/Kartlar
let accounts = JSON.parse(localStorage.getItem("accounts")) || ["Cüzdan", "Ziraat Bankası", "İş Bankası", "Garanti Bonus", "Akbank Axess"];

// Kategoriler
let incomeCategories = JSON.parse(localStorage.getItem("incomeCategories")) || ["Maaş", "Ek Gelir", "Faiz Geliri"];
let expenseCategories = JSON.parse(localStorage.getItem("expenseCategories")) || ["Akaryakıt", "Yeme-İçme", "Fatura", "Eğlence", "Kişisel Bakım"];

// Saat ve tarih
function startClock() {
  const dateDiv = document.getElementById("date");
  const clockDiv = document.getElementById("clock");

  function updateTime() {
    const now = new Date();
    dateDiv.textContent = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    clockDiv.textContent = now.toLocaleTimeString("tr-TR");
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// Bakiyeler
function showBalances() {
  const balancesDiv = document.getElementById("balances");
  if (!balancesDiv) return;

  let html = "";
  accounts.forEach(acc => {
    html += `${acc}: 0 TL<br>`; // Şimdilik sabit, ileride hesap bazlı bakiye eklenebilir
  });

  balancesDiv.innerHTML = html;
}
showBalances();

// Kategorileri doldur
function populateCategories() {
  const type = document.getElementById("type")?.value;
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  categorySelect.innerHTML = "";

  if (type === "Gelir") {
    [...incomeCategories].sort().forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "Gider") {
    [...expenseCategories].sort().forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "Transfer") {
    const option = document.createElement("option");
    option.value = "Hesaplar Arası";
    option.textContent = "Hesaplar Arası";
    categorySelect.appendChild(option);
  }

  // Hesap/Kart dropdown
  const accountSelect = document.getElementById("account");
  if (accountSelect) {
    accountSelect.innerHTML = "";
    accounts.forEach(acc => {
      const option = document.createElement("option");
      option.value = acc;
      option.textContent = acc;
      accountSelect.appendChild(option);
    });
  }

  // Taksit bölümü
  const installmentSection = document.getElementById("installmentSection");
  if (installmentSection) {
    installmentSection.style.display = (type === "Gider") ? "block" : "none";
  }
}

// Yeni kategori inputunu göster
function showCategoryInput() {
  document.getElementById("newCategoryDiv").style.display = "block";
  document.getElementById("categoryMessage").style.display = "none";
}

// Yeni kategori ekle
function addCategory() {
  const type = document.getElementById("type").value;
  let newCat = document.getElementById("newCategory").value.trim();
  const message = document.getElementById("categoryMessage");

  if (!newCat) return;

  newCat = newCat.charAt(0).toUpperCase() + newCat.slice(1).toLowerCase();

  let list = type === "Gelir" ? incomeCategories : expenseCategories;

  if (list.includes(newCat)) {
    message.textContent = "⚠️ Bu kategori zaten mevcut!";
    message.style.display = "block";
    return;
  }

  list.push(newCat);
  if (type === "Gelir") {
    localStorage.setItem("incomeCategories", JSON.stringify(list));
  } else {
    localStorage.setItem("expenseCategories", JSON.stringify(list));
  }

  document.getElementById("newCategory").value = "";
  document.getElementById("newCategoryDiv").style.display = "none";
  message.style.display = "none";
  populateCategories();
}

// Kayıt ekleme
document.getElementById("transactionForm")?.addEventListener("submit", function(e) {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const accountId = document.getElementById("account").value;
  const date = document.getElementById("dateInput").value;
  const installments = parseInt(document.getElementById("installments")?.value || 0);

  const transaction = { type, amount, category, note, accountId, date, installments };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  alert("Kayıt başarıyla eklendi!");
  displayRecords();
  displayReport();
});

// Kayıtları listele
function displayRecords() {
  const list = document.getElementById("recordsList");
  if (!list) return;

  list.innerHTML = "";
  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${t.date} - ${t.type} - ${t.amount} TL - ${t.category} (${t.accountId})
      <button class="edit-btn" onclick="editRecord(${index})">Düzenle</button>
      <button class="delete-btn" onclick="deleteRecord(${index})">Sil</button>
    `;
    list.appendChild(li);
  });
}

// Kayıt silme
function deleteRecord(index) {
  if (confirm("Bu kaydı silmek istediğine emin misin?")) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    displayRecords();
  }
}

// Kayıt düzenleme
let editingIndex = null;
function editRecord(index) {
  const t = transactions[index];
  document.getElementById("type").value = t.type;
  document.getElementById("category").value = t.category;
  document.getElementById("amount").value = t.amount;
  document.getElementById("note").value = t.note;
  document.getElementById("dateInput").value = t.date;
  document.getElementById("account").value = t.accountId;
  editingIndex = index;
}

// Rapor ekranı
function displayReport() {
  const reportDiv = document.getElementById("report");
  const selectedMonth = document.getElementById("monthSelect")?.value;
  if (!reportDiv || !selectedMonth) return;

  const [year, month] = selectedMonth.split("-");
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() == year && (d.getMonth() + 1) == parseInt(month);
  });

  let incomeTotal = 0, expenseTotal = 0;
  const incomeCats = {};
  const expenseCats = {};
  const transfers = [];

  filtered.forEach(t => {
    if (t.type === "Gelir") {
      incomeTotal += t.amount;
      incomeCats[t.category] = (incomeCats[t.category] || 0) + t.amount;
    } else if (t.type === "Gider") {
      expenseTotal += t.amount;
      expenseCats[t.category] = (expenseCats[t.category] || 0) + t.amount;
    } else if (t.type === "Transfer") {
      transfers.push(t);
    }
  });

  const net = incomeTotal - expenseTotal;
  const netColor = net >= 0 ? "green" : "red";

  let html = `<h2>${selectedMonth} Raporu</h2>`;

  html += `<h3>Gelir Kategorileri</h3>`;
  for (const cat in incomeCats) html += `- ${cat}: ${incomeCats[cat]} TL<br>`;
  html += `<strong>Toplam Gelir: ${incomeTotal} TL</strong><br><br>`;

  html += `<h3>Gider Kategorileri</h3>`;
  for (const cat in expenseCats) html += `- ${cat}: ${expenseCats[cat]} TL<br>`;
  html += `<strong>Toplam Gider: ${expenseTotal} TL</strong><br><br>`;

  html += `<h3 style="color:${netColor}">Net Durum: ${net} TL</h3><br>`;

  if