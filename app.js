// Tüm kayıtlar
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Hesap/Kartlar
let accounts = JSON.parse(localStorage.getItem("accounts")) || [
  { name: "ENPARA Kredi Kartı", dueDate: "" },
  { name: "ENPARA Vd.siz TL" },
  { name: "Halkbank Kredi Kartı", dueDate: "" },
  { name: "Nakit" }
];

// Kategoriler
let incomeCategories = JSON.parse(localStorage.getItem("incomeCategories")) || [
  "Aile Destek Geliri",
  "Ders Ücreti Geliri",
  "Maaş Geliri",
  "Para Üstü Geliri",
  "TOKİ - Depozit"
];

let expenseCategories = JSON.parse(localStorage.getItem("expenseCategories")) || [
  "Akaryakıt Gideri",
  "Araç Devir Ücreti",
  "Araç Sigorta",
  "Araç Tamir Bakım",
  "Araç Vergi",
  "Arda Harici Gider",
  "Arda Nafaka Bedeli",
  "Babam İçin Harcanan",
  "Banka-Faiz Gideri",
  "Ehliyet Yenileme",
  "Ev Gideri",
  "Haberleşme",
  "İlaç-Sağlık Gideri",
  "Kişisel Bakım",
  "Küçük Demirbaş Gideri",
  "TOKİ - Depozit",
  "Ulaşım Gideri",
  "Yatırım",
  "Yeme-İçme Gideri",
  "Yurtdışı Harcama"
];

let transferCategories = JSON.parse(localStorage.getItem("transferCategories")) || [
  "Aday Ödemesi",
  "Aile İçi Transfer"
];

// Saat ve tarih
function startClock() {
  const dateDiv = document.getElementById("date");
  const clockDiv = document.getElementById("clock");

  function updateTime() {
    const now = new Date();
    if (dateDiv) dateDiv.textContent = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (clockDiv) clockDiv.textContent = now.toLocaleTimeString("tr-TR");
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
    html += `${acc.name}: 0 TL<br>`;
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
    incomeCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "Gider") {
    expenseCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "Transfer") {
    transferCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  // Hesap/Kart dropdown
  const accountSelect = document.getElementById("account");
  if (accountSelect) {
    accountSelect.innerHTML = "";
    accounts.forEach(acc => {
      const option = document.createElement("option");
      option.value = acc.name;
      option.textContent = acc.name;
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

  let list = type === "Gelir" ? incomeCategories : (type === "Gider" ? expenseCategories : transferCategories);

  if (list.includes(newCat)) {
    message.textContent = "⚠️ Bu kategori zaten mevcut!";
    message.style.display = "block";
    return;
  }

  list.push(newCat);
  if (type === "Gelir") {
    localStorage.setItem("incomeCategories", JSON.stringify(list));
  } else if (type === "Gider") {
    localStorage.setItem("expenseCategories", JSON.stringify(list));
  } else {
    localStorage.setItem("transferCategories", JSON.stringify(list));
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
  const dueDate = document.getElementById("dueDate")?.value || "";
  const receiptFile = document.getElementById("receiptFile")?.value || "";

  const transaction = { type, amount, category, note, accountId, date, installments, dueDate, receiptFile };
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
      ${t.date} - <span class="type-${t.type.toLowerCase()}">${t.type}</span> - ${t.amount} TL - ${t.category} (${t.accountId})
      ${t.dueDate ? `<span class="due-date">Son Ödeme: ${t.dueDate}</span>` : ""}
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
  document.getElementById("dueDate").value = t.dueDate || "";
  editingIndex = index;
}

// Hesap/Kartları listele
function displayAccounts() {
  const list = document.getElementById("accountList");
  if (!list) return;

  list.innerHTML = "";
  accounts.forEach(acc => {
    const li = document.createElement("li");
    li.innerHTML = `${acc.name} ${acc.dueDate ? `<span class="due-date">(Son Ödeme: ${acc.dueDate})</span>` : ""}`;
    list.appendChild(li);
  });
}

// Rapor ekranı
function displayReport