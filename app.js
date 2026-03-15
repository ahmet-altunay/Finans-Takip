// =====================
// VERİLERİN TANIMLANMASI
// =====================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let accounts = JSON.parse(localStorage.getItem("accounts")) || [
  { name: "ENPARA Kredi Kartı", dueDate: "" },
  { name: "ENPARA Vd.siz TL" },
  { name: "Halkbank Kredi Kartı", dueDate: "" },
  { name: "Nakit" }
];

let incomeCategories = JSON.parse(localStorage.getItem("incomeCategories")) || [
  "Aile Destek Geliri","Ders Ücreti Geliri","Maaş Geliri","Para Üstü Geliri","TOKİ - Depozit"
];

let expenseCategories = JSON.parse(localStorage.getItem("expenseCategories")) || [
  "Akaryakıt Gideri","Araç Devir Ücreti","Araç Sigorta","Araç Tamir Bakım","Araç Vergi",
  "Arda Harici Gider","Arda Nafaka Bedeli","Babam İçin Harcanan","Banka-Faiz Gideri",
  "Ehliyet Yenileme","Ev Gideri","Haberleşme","İlaç-Sağlık Gideri","Kişisel Bakım",
  "Küçük Demirbaş Gideri","TOKİ - Depozit","Ulaşım Gideri","Yatırım","Yeme-İçme Gideri","Yurtdışı Harcama"
];

let transferCategories = JSON.parse(localStorage.getItem("transferCategories")) || [
  "Aday Ödemesi","Aile İçi Transfer"
];

// =====================
// SAAT VE TARİH
// =====================
function startClock() {
  const dateDiv = document.getElementById("date");
  const clockDiv = document.getElementById("clock");
  function updateTime() {
    const now = new Date();
    if (dateDiv) dateDiv.textContent = now.toLocaleDateString("tr-TR",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
    if (clockDiv) clockDiv.textContent = now.toLocaleTimeString("tr-TR");
  }
  updateTime();
  setInterval(updateTime,1000);
}

// =====================
// BAKİYE GÖSTERİMİ
// =====================
function showBalances() {
  const balancesDiv = document.getElementById("balances");
  if (!balancesDiv) return;
  let html = "";
  accounts.forEach(acc => { html += `${acc.name}: 0 TL<br>`; });
  balancesDiv.innerHTML = html;
}
showBalances();

// =====================
// KATEGORİLERİ DOLDURMA
// =====================
function populateCategories() {
  const type = document.getElementById("type")?.value;
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;
  categorySelect.innerHTML = "";

  let list = [];
  if (type === "Gelir") list = incomeCategories;
  else if (type === "Gider") list = expenseCategories;
  else if (type === "Transfer") list = transferCategories;

  list.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

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

  const installmentSection = document.getElementById("installmentSection");
  if (installmentSection) installmentSection.style.display = (type==="Gider")?"block":"none";
}

// =====================
// YENİ KATEGORİ EKLEME
// =====================
function showCategoryInput() {
  document.getElementById("newCategoryDiv").style.display="block";
  document.getElementById("categoryMessage").style.display="none";
}

function addCategory() {
  const type = document.getElementById("type").value;
  let newCat = document.getElementById("newCategory").value.trim();
  const message = document.getElementById("categoryMessage");
  if (!newCat) return;
  newCat = newCat.charAt(0).toUpperCase()+newCat.slice(1).toLowerCase();

  let list = type==="Gelir"?incomeCategories:(type==="Gider"?expenseCategories:transferCategories);
  if (list.includes(newCat)) {
    message.textContent="⚠️ Bu kategori zaten mevcut!";
    message.style.display="block"; return;
  }
  list.push(newCat);
  localStorage.setItem(type==="Gelir"?"incomeCategories":type==="Gider"?"expenseCategories":"transferCategories",JSON.stringify(list));
  document.getElementById("newCategory").value="";
  document.getElementById("newCategoryDiv").style.display="none";
  message.style.display="none";
  populateCategories();
}

// =====================
// KAYIT EKLEME
// =====================
document.getElementById("transactionForm")?.addEventListener("submit",function(e){
  e.preventDefault();
  const type=document.getElementById("type").value;
  const amount=parseFloat(document.getElementById("amount").value);
  const category=document.getElementById("category").value;
  const note=document.getElementById("note").value;
  const accountId=document.getElementById("account").value;
  const date=document.getElementById("dateInput").value;
  const installments=parseInt(document.getElementById("installments")?.value||0);
  const dueDate=document.getElementById("dueDate")?.value||"";
  const receiptFile=document.getElementById("receiptFile")?.value||"";

  const transaction={type,amount,category,note,accountId,date,installments,dueDate,receiptFile};
  transactions.push(transaction);
  localStorage.setItem("transactions",JSON.stringify(transactions));
  alert("Kayıt başarıyla eklendi!");
  displayRecords(); displayReport();
});

// =====================
// KAYITLARI LİSTELEME
// =====================
function displayRecords() {
  const list=document.getElementById("recordsList");
  if (!list) return;
  list.innerHTML="";
  transactions.forEach((t,index)=>{
    const li=document.createElement("li");
    li.innerHTML=`
      ${t.date} - <span class="type-${t.type.toLowerCase()}">${t.type}</span> - ${t.amount} TL - ${t.category} (${t.accountId})
      ${t.dueDate?`<span class="due-date">Son Ödeme: ${t.dueDate}</span>`:""}
      <button onclick="editRecord(${index})">Düzenle</button>
      <button onclick="deleteRecord(${index})">Sil</button>
    `;
    list.appendChild(li);
  });
}

function deleteRecord(index) {
  if (confirm("Bu kaydı silmek istediğine emin misin?")) {
    transactions.splice(index,1);
    localStorage.setItem("transactions",JSON.stringify(transactions));
    displayRecords();
  }
}

let editingIndex=null;
function editRecord(index) {
  const t=transactions[index];
  document.getElementById("type").value=t.type;
  populateCategories();
  document.getElementById("category").value=t.category;
  document.getElementById("amount").value=t.amount;
  document.getElementById("note").value=t.note;
  document.getElementById("dateInput").value=t.date;
  document.getElementById("account").value=t.accountId;
  document.getElementById("dueDate").value=t.dueDate||"";
  editingIndex=index;
}

// =====================
// HESAP/KART LİSTELEME
// =====================
function displayAccounts() {
  const list=document.getElementById("accountList");
  if (!list) return;
  list.innerHTML="";
  accounts.forEach(acc=>{
    const li=document.createElement("li");
    li.innerHTML=`${acc.name} ${acc.dueDate?`<span class="due-date">(Son Ödeme: ${acc.dueDate})</span>`:""}`;
    list.appendChild(li);
  });
}

// =====================
// RAPOR EKRANI
// =====================
function displayReport() {
  const reportDiv=document.getElementById("report");
  if (!reportDiv) return;
  const month=document.getElementById("monthSelect")?.value;
  if (!month) return;

  let gelir=0,gider=0,transfer=0;
  transactions.forEach(t=>{
    if (t.date.startsWith(month)) {
      if (t.type==="Gelir") gelir+=t.amount;
      else if (t.type==="Gider") gider+=t.amount;
      else if (t.type==="Transfer") transfer+=t.amount;
    }
  });

  reportDiv.innerHTML=`
    <p>Gelir: ${gelir} TL</p>
    <p>Gider: ${gider} TL</p>
    <p>Transfer: ${transfer} TL</