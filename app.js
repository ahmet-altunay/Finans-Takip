// ===================== app.js - FIREBASE ENTEGRASYONU (DÜZELTİLMİŞ) =====================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRz_pRfHM7AGTz4c21bQhtg9DxCqlb2ek",
  authDomain: "aa-perfin-tracking-d33b8.firebaseapp.com",
  databaseURL: "https://aa-perfin-tracking-d33b8-default-rtdb.firebaseio.com",
  projectId: "aa-perfin-tracking-d33b8",
  storageBucket: "aa-perfin-tracking-d33b8.firebasestorage.app",
  messagingSenderId: "374462035684",
  appId: "1:374462035684:web:f30fc6f0de73477826def1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global veriler
let transactions = [];
let accounts = [];
let kategoriler = [];

// ===================== VERİ YÜKLEME =====================
function loadDataFromFirebase() {
  // Transactions
  onValue(ref(db, 'transactions'), (snapshot) => {
    transactions = snapshot.val() ? Object.values(snapshot.val()) : [];
    updateBalances();
    if (typeof loadRecords === "function") loadRecords();
  });

  // Accounts
  onValue(ref(db, 'accounts'), (snapshot) => {
    accounts = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateAccounts === "function") populateAccounts();
  });

  // Kategoriler
  onValue(ref(db, 'kategoriler'), (snapshot) => {
    kategoriler = snapshot.val() ? Object.values(snapshot.val()) : [];
    if (typeof populateCategories === "function") populateCategories();
  });
}

// ===================== VERİ KAYDETME =====================
function saveTransactions() {
  set(ref(db, 'transactions'), transactions);
}

function saveAccounts() {
  set(ref(db, 'accounts'), accounts);
}

function saveKategoriler() {
  set(ref(db, 'kategoriler'), kategoriler);
}

// ===================== Diğer Fonksiyonlar (Kısaltıldı) =====================
function startClock() { /* ... aynı */ }
function updateBalances() { /* ... aynı */ }
function populateCategories() { /* ... aynı */ }
function addNewCategory() { /* ... aynı */ }
function populateAccounts() { /* ... aynı */ }

function addTransaction(e) {
  e.preventDefault();

  const record = {
    id: Date.now().toString(),
    date: document.getElementById("dateInput").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || "",
    amount: parseFloat(document.getElementById("amount").value),
    account: document.getElementById("account").value || "Nakit",
    timestamp: Date.now()
  };

  if (!record.date || isNaN(record.amount) || !record.category) {
    alert("❌ Tarih, Tutar ve Kategori alanlarını doldurunuz!");
    return;
  }

  transactions.push(record);
  saveTransactions();     // ← Firebase'e kaydet

  alert("✅ Kayıt başarıyla eklendi ve Firebase'e yüklendi!");
  e.target.reset();
  populateCategories();
  updateBalances();
}

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  loadDataFromFirebase();   // Firebase'den verileri çek

  if (document.getElementById("transactionForm")) {
    populateAccounts();
    populateCategories();
    document.getElementById("type").addEventListener("change", populateCategories);

    document.getElementById("addCategoryBtn").addEventListener("click", () => {
      document.getElementById("newCategoryDiv").style.display = "block";
    });

    document.getElementById("saveCategoryBtn").addEventListener("click", addNewCategory);
    document.getElementById("transactionForm").addEventListener("submit", addTransaction);
  }

  const csvBtn = document.getElementById("csvBtn");
  if (csvBtn) csvBtn.addEventListener("click", importCSV);
});