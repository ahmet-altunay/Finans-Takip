// ===================== app.js - TAM ve GÜNCEL VERSİYON (Mart 2026) =====================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let kategoriler = JSON.parse(localStorage.getItem("kategoriler")) || [];

// ===================== SAAT ve TARİH =====================
function startClock() {
  function update() {
    const now = new Date();
    if (document.getElementById("date")) {
      document.getElementById("date").textContent = 
        now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    if (document.getElementById("clock")) {
      document.getElementById("clock").textContent = now.toLocaleTimeString("tr-TR");
    }
  }
  update();
  setInterval(update, 1000);
}

// ===================== BAKİYE GÜNCELLEME =====================
function updateBalances() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === "Gelir") income += amt;
    else if (t.type === "Gider") expense += amt;
  });
  const balance = income - expense;

  if (document.getElementById("total-income")) 
    document.getElementById("total-income").textContent = income.toLocaleString('tr-TR') + " ₺";
  if (document.getElementById("total-expense")) 
    document.getElementById("total-expense").textContent = expense.toLocaleString('tr-TR') + " ₺";
  if (document.getElementById("total-balance")) 
    document.getElementById("total-balance").textContent = balance.toLocaleString('tr-TR') + " ₺";
}

// ===================== KATEGORİ DOLDURMA =====================
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

// ===================== YENİ KATEGORİ EKLE =====================
function addNewCategory() {
  const newCat = document.getElementById("newCategory").value.trim();
  if (!newCat) return alert("Kategori adı boş olamaz!");

  if (kategoriler.some(k => k.ad === newCat)) 
    return alert("Bu kategori zaten mevcut!");

  const currentType = document.getElementById("type").value;
  const tip = currentType === "Gelir" ? "gelir" : 
              currentType === "Gider" ? "gider" : "transfer";

  kategoriler.push({ ad: newCat, tip: tip });
  localStorage.setItem("kategoriler", JSON.stringify(kategoriler));

  document.getElementById("newCategory").value = "";
  populateCategories();
  alert("✅ Yeni kategori eklendi: " + newCat);
}

// ===================== YENİ KAYIT EKLE =====================
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

// ===================== CSV İÇE AKTARMA (Senin dosyan için hazır) =====================
function importCSV() {
  // Senin gönderdiğin CSV verisi burada gömülü olarak bulunuyor
  const csvData = `Tarih;Tür;Kategori;Açıklama;Tutar;Hesap/Kart:;Taksit Sayısı;Son Ödeme Tarihi
2025.11.28;GİDER;ARAÇ TAMİR BAKIM;Hasan Eyi - MESUT YURDAGELEN / TERMOSTAT VE BORU DEĞİŞİMİ MALZEME VE İŞÇİLİĞİ;4.500,00;ENPARA Vd.siz TL;0;2025.11.28
2025.11.28;GİDER;ARAÇ TAMİR BAKIM;Diksan Oto Yedek Parça - MESUT YURDAGELEN / TERMOSTAT VE BORU DEĞİŞİMİ MALZEME VE İŞÇİLİĞİ;4.500,00;ENPARA Vd.siz TL;0;2025.11.28
2025.11.28;GİDER;TOKİ - DEPOZİT;AHMET ALTUNAY, Bireysel Ödeme, EFT (FAST) sorgu no: 4139602532;5.000,00;ENPARA Vd.siz TL;0;2025.11.28
2025.12.01;GİDER;BANKA-FAİZ GİDERİ;Kasım 2025 dönemi Ekpara kullanım faizi BSMV;9,45;ENPARA Vd.siz TL;0;2025.12.01
2025.12.01;GİDER;BANKA-FAİZ GİDERİ;Kasım 2025 dönemi Ekpara kullanım faizi KKDF;9,45;ENPARA Vd.siz TL;0;2025.12.01
2025.12.01;GİDER;BANKA-FAİZ GİDERİ;Kasım 2025 dönemi Ekpara kullanım faizi;63,00;ENPARA Vd.siz TL;0;2025.12.01
2025.12.02;GELİR;DERS ÜCRETİ GELİRİ;İRFAN AYIK, ders ücreti avans;10.000,00;ENPARA Vd.siz TL;0;2025.12.02
2025.12.02;GİDER;ARDA NAFAKA BEDELİ;ARİFE YÜKSEKDAĞ, ARDA ALTUNAY NAFAKA BEDELİ, EFT (FAST) sorgu no: 4148503415;4.500,00;ENPARA Vd.siz TL;0;2025.12.02
2025.11.12;GİDER;HABERLEŞME;5053487593 - TURK TELEKOM (MOBIL) - ODE ;241,50;ENPARA Kredi Kartı;0;2025.12.02
2025.11.11;GİDER;YURTDIŞI HARCAMA;Karttan nakit avans (3.000,00 MKD) (Aylık faiz oranı: %4,50) ;2.408,81;ENPARA Kredi Kartı;0;2025.12.02
2025.11.12;GİDER;YURTDIŞI HARCAMA;M HOUSE 3 (150,00 MKD) ;121,23;ENPARA Kredi Kartı;0;2025.12.02
2025.11.16;GİDER;YURTDIŞI HARCAMA;OSKAR KP (890,00 MKD) ;725,90;ENPARA Kredi Kartı;0;2025.12.02
2025.11.17;GİDER;YURTDIŞI HARCAMA;Karttan nakit avans (1.000,00 MKD) (Aylık faiz oranı: %4,50) ;815,32;ENPARA Kredi Kartı;0;2025.12.02
2025.11.18;GİDER;YURTDIŞI HARCAMA;Karttan nakit avans (500,00 MKD) (Aylık faiz oranı: %4,50) ;174,24;ENPARA Kredi Kartı;0;2025.12.02
2025.12.19;GİDER;ARAÇ DEVİR ÜCRETİ;Takasbank, TB25507323711525, EFT sorgu no: 3582752;1.000,00;ENPARA Vd.siz TL;0;2025.12.19
2025.12.26;GİDER;KİŞİSEL BAKIM;Aylin Bayrı, Parfüm için, EFT (FAST) sorgu no: 4200462412;1.250,00;ENPARA Vd.siz TL;0;2025.12.26
2025.12.29;GİDER;KİŞİSEL BAKIM;QNB ATM'sinden para çekme / KUAFÖR YUNUS YURTSUZ İÇİN ÖDENEN;700,00;NAKİT;0;2025.12.29
2025.12.31;GELİR;AİLE DESTEK GELİRİ;200,00 USD satış, işlem kuru 42,665000 TL / BÜNYAMİN ALTUNAY;8.533,00;NAKİT;0;2025.12.31
2025.12.31;GELİR;DERS ÜCRETİ GELİRİ;İRFAN AYIK, ders ücreti avans;2.500,00;ENPARA Vd.siz TL;0;2025.12.31
2026.01.02;GİDER;BANKA-FAİZ GİDERİ;Aralık 2025 dönemi Ekpara kullanım faizi BSMV;93,97;ENPARA Vd.siz TL;0;2026.01.02
2026.01.02;GİDER;BANKA-FAİZ GİDERİ;Aralık 2025 dönemi Ekpara kullanım faizi KKDF;93,97;ENPARA Vd.siz TL;0;2026.01.02
2026.01.02;GİDER;BANKA-FAİZ GİDERİ;Aralık 2025 dönemi Ekpara kullanım faizi;626,46;ENPARA Vd.siz TL;0;2026.01.02
2026.01.08;GELİR;DERS ÜCRETİ GELİRİ;İRFAN AYIK, ders ücreti avans;22.500,00;ENPARA Vd.siz TL;0;2026.01.08
2026.01.08;GİDER;ARDA NAFAKA BEDELİ;ARİFE YÜKSEKDAĞ, ARDA ALTUNAY NAFAKA BEDELİ, EFT (FAST) sorgu no: 4228242136;4.500,00;ENPARA Vd.siz TL;0;2026.01.08
2025.12.02;GİDER;AKARYAKIT GİDERİ;SHELL ORG.SAN.MANİSA;1.000,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.13;GİDER;AKARYAKIT GİDERİ;SHELL ORG.SAN.MANİSA;1.000,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.07;GİDER;BANKA-FAİZ GİDERİ;Nakit avans ücreti (Yurt dışı);245,39;ENPARA Kredi Kartı;0;2026.01.08
2025.11.11;GİDER;BANKA-FAİZ GİDERİ;Nakit avans ücreti (Yurt dışı);72,76;ENPARA Kredi Kartı;0;2026.01.08
2025.11.17;GİDER;BANKA-FAİZ GİDERİ;Nakit avans ücreti (Yurt dışı);24,46;ENPARA Kredi Kartı;0;2026.01.08
2025.11.18;GİDER;BANKA-FAİZ GİDERİ;Nakit avans ücreti (Yurt dışı);12,18;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;BANKA-FAİZ GİDERİ;Nakit avans ücreti (Yurt dışı);12,18;ENPARA Kredi Kartı;0;2026.01.08
2025.11.30;GİDER;BANKA-FAİZ GİDERİ;Nakit avans faizi;146,70;ENPARA Kredi Kartı;0;2026.01.08
2025.11.30;GİDER;BANKA-FAİZ GİDERİ;"Faizlerin KKDF'si""";22,01;ENPARA Kredi Kartı;0;2026.01.08
2025.11.30;GİDER;BANKA-FAİZ GİDERİ;"Faiz ve ücretlerin BSMV'si""";77,05;ENPARA Kredi Kartı;0;2026.01.08
2025.11.30;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;41,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.09;GİDER;EV GİDERİ;MEGA FIRIN GÜZELYURT;415,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.13;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;87,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.18;GİDER;EV GİDERİ;FILE MARKET MAĞAZACILIK A;170,90;ENPARA Kredi Kartı;0;2026.01.08
2025.12.12;GİDER;HABERLEŞME;5053487593-TURK TELEKOM (MOBIL) - ODE;241,50;ENPARA Kredi Kartı;0;2026.01.08
2025.12.17;GİDER;İLAÇ-SAĞLIK GİDERİ;ADA ECZANESI;190,14;ENPARA Kredi Kartı;0;2026.01.08
2025.11.23;GİDER;ULAŞIM GİDERİ;PAYCELL/ENUYGUN.COM OTOBU;675,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.02;GİDER;ULAŞIM GİDERİ;PAYCELL/ENUYGUN.COM OTOBU;700,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.05;GİDER;ULAŞIM GİDERİ;PAYCELL/ENUYGUN.COM OTOBU;700,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;ULAŞIM GİDERİ;BELBIM ELEKTRONIK PARA ;150,08;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;ULAŞIM GİDERİ;BELBIM AS. ULASIM ;450,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.20;GİDER;ULAŞIM GİDERİ;BELBIM ELEKTRONIK PARA;150,08;ENPARA Kredi Kartı;0;2026.01.08
2025.11.20;GİDER;ULAŞIM GİDERİ;BELBIM AS. ULASIM;50,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.20;GİDER;ULAŞIM GİDERİ;BELBIM AS. ULASIM;50,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.24;GİDER;ULAŞIM GİDERİ;TOPLU TASIMA UCRETI;30,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.06;GİDER;ULAŞIM GİDERİ;TOPLU TASIMA UCRETI;30,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.08;GİDER;ULAŞIM GİDERİ;MANULAŞ MANİSA ULAŞI;80,00;ENPARA Kredi Kartı;0;2026.01.08
2025.11.21;GİDER;YEME-İÇME GİDERİ;ŞOK-ÇIRÇIR SON DURAK;100,34;ENPARA Kredi Kartı;0;2026.01.08
2025.12.06;GİDER;YEME-İÇME GİDERİ;SÇ PARK TURİZM GIDA SAN.;75,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.06;GİDER;YEME-İÇME GİDERİ;ADIYAMAN LEZZET;200,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.08;GİDER;YEME-İÇME GİDERİ;WHITE AVLU - YEME İÇME;115,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.12;GİDER;YEME-İÇME GİDERİ;ADIYAMAN LEZZET;110,00;ENPARA Kredi Kartı;0;2026.01.08
2025.12.19;GİDER;YEME-İÇME GİDERİ;BOZKÖY KAFE / ARDA ÖĞRETMEN DOĞÜM GÜNÜ;314,43;ENPARA Kredi Kartı;0;2026.01.08
2025.11.18;GİDER;YURTDIŞI HARCAMA;Karttan nakit avans (500,00 MKD) (Aylık faiz oranı: %4,50) ;231,67;ENPARA Kredi Kartı;0;2026.01.08
2025.11.18;GİDER;YURTDIŞI HARCAMA;TKPAY / AJET 34 TR ;2.757,19;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;YURTDIŞI HARCAMA;ATU SHOP SHENGEN (1.113,00 MKD) ;904,02;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;YURTDIŞI HARCAMA;A1 MAKEDONIJA DOOEL (200,00 MKD) ;162,52;ENPARA Kredi Kartı;0;2026.01.08
2025.11.19;GİDER;YURTDIŞI HARCAMA;Karttan nakit avans (500,00 MKD) (Aylık faiz oranı: %4,50) ;406,10;ENPARA Kredi Kartı;0;2026.01.08
2026.01.19;GİDER;YEME-İÇME GİDERİ;Ahmet Altunay, Nakit Çekim İçin Yapıkredi'ye Aktarılan;500,00;ENPARA Vd.siz TL;0;2026.01.19
2026.01.28;GELİR;TOKİ - DEPOZİT;AHMET ALTUNAY, TOKI Başvuru işlemi iade bedeli;5.000,00;ENPARA Vd.siz TL;0;2026.01.28
2025.12.19;GİDER;ARAÇ DEVİR ÜCRETİ;MANISA 5.NOTER;2.139,07;ENPARA Kredi Kartı;0;2026.01.28
2025.12.19;GİDER;ARAÇ SİGORTA;ANADOLU SIGORTA ISTANBUL TR (21.650,00 TL) 1/12 TK.;21.650,00;ENPARA Kredi Kartı;12;2026.01.10
2025.12.20;GİDER;EV GİDERİ;FILE GUZELYURT/YUNUSE;23,24;ENPARA Kredi Kartı;0;2026.01.28
2025.12.20;GİDER;EV GİDERİ;VOLKAN HAS;300,00;ENPARA Kredi Kartı;0;2026.01.28
2025.12.21;GİDER;EV GİDERİ;MUSTAFA VURAL;127,77;ENPARA Kredi Kartı;0;2026.01.28
2025.12.19;GİDER;YEME-İÇME GİDERİ;BOZKÖY KAFE;105,57;ENPARA Kredi Kartı;0;2026.01.28
2026.02.02;GİDER;BANKA-FAİZ GİDERİ;Ocak 2026 dönemi Ekpara kullanım faizi BSMV;8,37;ENPARA Vd.siz TL;0;2026.02.02
2026.02.02;GİDER;BANKA-FAİZ GİDERİ;Ocak 2026 dönemi Ekpara kullanım faizi KKDF;8,37;ENPARA Vd.siz TL;0;2026.02.02
2026.02.02;GİDER;BANKA-FAİZ GİDERİ;Ocak 2026 dönemi Ekpara kullanım faizi;55,82;ENPARA Vd.siz TL;0;2026.02.02
2026.02.04;TRANSFER;AİLE İÇİ TRANSFER;HACI BAYRAM ALTUNAY, 999/0267066-Ahmet Altunay;1.400,00;ENPARA Vd.siz TL;0;2026.02.04
2026.02.04;TRANSFER;AİLE İÇİ TRANSFER;Hakan Güreş, Emniyet kemeri, EFT (FAST) sorgu no: 4284689417;1.400,00;ENPARA Vd.siz TL;0;2026.02.04
2026.01.19;GİDER;ARAÇ TAMİR BAKIM;KURS VERİLEN NOTER ÖDEMESİ KÜSÜRAT ÖDEMESİ;2,46;Halkbank Kredi Kartı;0;2026.02.16
2026.01.19;GİDER;ARAÇ TAMİR BAKIM;Ahmet Altunay, Kredi kartı ödemesi, EFT (FAST) sorgu no: 4297191286 / ARAÇ LASTİK ALIMI 1. TAKSİTİ;17.428,00;Halkbank Kredi Kartı;5;2026.02.16
2026.02.09;GELİR;DERS ÜCRETİ GELİRİ;İRFAN AYIK, ders ücreti avans;3.750,00;ENPARA Vd.siz TL;0;2026.02.09
2026.02.09;GELİR;MAAŞ GELİRİ;İRFAN AYIK, maaş avans maaş farki ödemesi;30.065,00;ENPARA Vd.siz TL;0;2026.02.09
2026.02.09;GİDER;KİŞİSEL BAKIM;İsmail Alak, Bireysel Ödeme, EFT (FAST) sorgu no: 4297683811;500,00;ENPARA Vd.siz TL;0;2026.02.09
2026.02.09;GİDER;ARDA NAFAKA BEDELİ;ARİFE YÜKSEKDAĞ, ARDA ALTUNAY NAFAKA BEDELİ, EFT (FAST) sorgu no: 4297181498;4.500,00;ENPARA Vd.siz TL;0;2026.02.09
2025.12.21;GİDER;AKARYAKIT GİDERİ;B/İÇENGİL PETROL;1.000,00;ENPARA Kredi Kartı;0;2026.02.09
2025.12.30;GİDER;AKARYAKIT GİDERİ;AKYAR AKARYAKIT;500,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.03;GİDER;AKARYAKIT GİDERİ;SHELL ANEMON TURIZM TIC.A;600,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.16;GİDER;AKARYAKIT GİDERİ;ANEMON SHELL;600,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.21;GİDER;AKARYAKIT GİDERİ;SHELL ORG.SAN.MANİSA ;500,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.15;GİDER;ARAÇ TAMİR BAKIM;HEPSIPAY/HEPSIBURADA TR ISTANBUL (2.732,84 TL) 1/3 TK.;2.732,84;ENPARA Kredi Kartı;3;2026.02.10
2026.01.19;GİDER;ARAÇ TAMİR BAKIM;Hepsiburada ISTANBUL (iade) 1/3 TK.;-2.732,84;ENPARA Kredi Kartı;3;2026.02.10
2026.01.19;GİDER;ARAÇ TAMİR BAKIM;IDUG PETROL URUNLERI IZMIR TR (12.000,00 TL) 1/3 TK.;12.000,00;ENPARA Kredi Kartı;3;2026.02.10
2026.01.03;GİDER;ARAÇ VERGİ;ALAYBEY V.D. MANISA TR;590,50;ENPARA Kredi Kartı;0;2026.02.09
2026.01.28;GİDER;BABAM İÇİN HARCANAN;HEPSIPAY/HEPSIBURADA ISTANBUL TR ;265,99;ENPARA Kredi Kartı;0;2026.02.09
2025.12.30;GİDER;BANKA-FAİZ GİDERİ;Alışveriş faizi ;235,55;ENPARA Kredi Kartı;0;2026.02.09
2025.12.30;GİDER;BANKA-FAİZ GİDERİ;Nakit avans faizi;5,09;ENPARA Kredi Kartı;0;2026.02.09
2025.12.30;GİDER;BANKA-FAİZ GİDERİ;Faizlerin KKDF’si* ;36,10;ENPARA Kredi Kartı;0;2026.02.09
2025.12.30;GİDER;BANKA-FAİZ GİDERİ;Faiz ve ücretlerin BSMV'si* ;36,10;ENPARA Kredi Kartı;0;2026.02.09
2026.01.30;GİDER;BANKA-FAİZ GİDERİ;Alışveriş faizi ;198,04;ENPARA Kredi Kartı;0;2026.02.09
2026.01.30;GİDER;BANKA-FAİZ GİDERİ;Faizlerin KKDF’si* ;29,71;ENPARA Kredi Kartı;0;2026.02.09
2026.01.30;GİDER;BANKA-FAİZ GİDERİ;Faiz ve ücretlerin BSMV'si* ;29,71;ENPARA Kredi Kartı;0;2026.02.09
2025.12.21;GİDER;EV GİDERİ;MUSTAFA VURAL;272,23;ENPARA Kredi Kartı;0;2026.02.09
2025.12.31;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;294,28;ENPARA Kredi Kartı;0;2026.02.09
2025.12.31;GİDER;EV GİDERİ;VOLKAN HAS;700,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.03;GİDER;EV GİDERİ;SEZER KAYA;25,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.04;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;64,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.09;GİDER;EV GİDERİ;FILE GUZELYURT/YUNUSE;320,90;ENPARA Kredi Kartı;0;2026.02.09
2026.01.11;GİDER;EV GİDERİ;9448 B537 A101 GUZELYURT;179,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.17;GİDER;EV GİDERİ;FILE GUZELYURT/YUNUSE;88,70;ENPARA Kredi Kartı;0;2026.02.09
2026.01.20;GİDER;EV GİDERİ;FILE GUZELYURT/YUNUSE;127,90;ENPARA Kredi Kartı;0;2026.02.09
2026.01.25;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI ;167,50;ENPARA Kredi Kartı;0;2026.02.09
2025.12.22;GİDER;HABERLEŞME;5053487593-TURKCELL - ODEME;86,60;ENPARA Kredi Kartı;0;2026.02.09
2026.01.12;GİDER;HABERLEŞME;5053487593-TURK TELEKOM (MOBIL) - ODE;103,54;ENPARA Kredi Kartı;0;2026.02.09
2026.01.21;GİDER;HABERLEŞME;5053487593 - TURKCELL - ODEME;287,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.24;GİDER;ULAŞIM GİDERİ;MANULAŞ MANİSA ULAŞI ;60,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.10;GİDER;YEME-İÇME GİDERİ;KOKORECCI SULEYMAN DEDENI;520,00;ENPARA Kredi Kartı;0;2026.02.09
2026.01.13;GİDER;YEME-İÇME GİDERİ;SERRA KURUYEMİŞ;130,00;ENPARA Kredi Kartı;0;2026.02.09
2026.02.11;TRANSFER;AİLE İÇİ TRANSFER;Hacı Bayram Altunay, 1 çeyrek altın ve 2 gram altın alım para üstü, EFT (FAST) sorgu no: 4302686852;950,00;ENPARA Vd.siz TL;0;2026.02.11
2026.02.11;TRANSFER;AİLE İÇİ TRANSFER;HACI BAYRAM ALTUNAY, 999/0267066-Ahmet Altunay;12.000,00;ENPARA Vd.siz TL;0;2026.02.11
2026.02.11;TRANSFER;AİLE İÇİ TRANSFER;Gizem Kartal, 2 tane gram altın, 1 tane çeyrek altın, EFT (FAST) sorgu no: 4301278111;39.950,00;ENPARA Vd.siz TL;0;2026.02.11
2026.02.11;TRANSFER;AİLE İÇİ TRANSFER;SEVİM ALTUNAY, gün altını için;15.000,00;ENPARA Vd.siz TL;0;2026.02.11
2026.02.11;GİDER;YATIRIM;Gizem Kartal, 1 tane gram altın;6.950,00;ENPARA Vd.siz TL;0;2026.02.11
2026.02.16;GELİR;PARA ÜSTÜ GELİRİ;QNB ATM'sinden  para yatırma / DİLEK BASKIN EHLİYET İÇİN YATIRILAN;30,00;ENPARA Vd.siz TL;0;2026.02.16
2026.02.16;TRANSFER;ADAY ÖDEMESİ;QNB ATM'sinden  para yatırma / DİLEK BASKIN EHLİYET İÇİN YATIRILAN;3.870,00;ENPARA Vd.siz TL;0;2026.02.16
2026.02.16;TRANSFER;ADAY ÖDEMESİ;Kübra Meteler, Dilek baskın ehliyet harç ödemesi, EFT (FAST) sorgu no: 4313192382;8.870,00;ENPARA Vd.siz TL;0;2026.02.16
2026.02.16;TRANSFER;ADAY ÖDEMESİ;DİLEK BASKIN, EHLİYET VERGİ ÖDEMESİ;5.000,00;ENPARA Vd.siz TL;0;2026.02.16
2026.02.19;GİDER;EHLİYET YENİLEME;Dilek SÜDAN - BİYOMETRİK RESİM ÇEKİMİ;400,00;ENPARA Vd.siz TL;0;2026.02.19
2026.02.19;GİDER;EHLİYET YENİLEME;Kübra Meteler, AHMET ALTUNAYAY Ehliyet yenileme harç bede li, EFT (FAST) sorgu no: 4320405217;2.115,00;ENPARA Vd.siz TL;0;2026.02.19
2026.03.02;GİDER;BANKA-FAİZ GİDERİ;Şubat 2026 dönemi Ekpara kullanım faizi BSMV;0,08;ENPARA Vd.siz TL;0;2026.03.02
2026.03.02;GİDER;BANKA-FAİZ GİDERİ;Şubat 2026 dönemi Ekpara kullanım faizi KKDF;0,08;ENPARA Vd.siz TL;0;2026.03.02
2026.03.02;GİDER;BANKA-FAİZ GİDERİ;Şubat 2026 dönemi Ekpara kullanım faizi;0,51;ENPARA Vd.siz TL;0;2026.03.02
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;OLGUN OTO ELEKTRİK / AMPUL ALIMI;40,00;NAKİT;0;2026.03.05
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;MESUT YURDAGELEN / VANUS TEMİZLİK BEDELİ;750,00;ENPARA Vd.siz TL;0;2026.03.05
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;AZİZ YÜKSEKDAĞ / ARAÇ İÇİN TURBO BORUSU ALIMI;200,00;NAKİT;0;2026.03.05
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;ALİ DAYI / TORBO EMME BORUSU İÇİN KELEPÇE ALIMI;150,00;NAKİT;0;2026.03.05
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;MESUT YURDAGELEN / KÜLBÜTÖR KAPAK DEĞİŞİMİ VE TURBO EMME İŞÇİLİĞİ;3.200,00;ENPARA Vd.siz TL;0;2026.03.05
2026.03.05;GİDER;EV GİDERİ;QNB ATM'sinden para çekme;460,00;NAKİT;0;2026.03.05
2026.03.06;GİDER;ARAÇ TAMİR BAKIM;DERİN REKLAM - Sadettin hatun, Countryman araç kaplama;2.500,00;ENPARA Vd.siz TL;0;2026.03.06
2026.03.09;GELİR;MAAŞ GELİRİ;İRFAN AYIK, ders ücreti avans;28.075,50;ENPARA Vd.siz TL;0;2026.03.09
2026.03.09;GİDER;ARDA NAFAKA BEDELİ;ARİFE YÜKSEKDAĞ, ARDA ALTUNAY NAFAKA BEDELİ, EFT (FAST) sorgu no: 4362273330;4.500,00;ENPARA Vd.siz TL;0;2026.03.09
2026.01.30;GİDER;ARAÇ TAMİR BAKIM;YILMAZ NESRİN YUSUF / ARAÇ LASTİK DEĞİŞİM;2.000,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.01;GİDER;EV GİDERİ;VOLKAN HAS;360,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.02;GİDER;EV GİDERİ;KESKİN SOGUTMA;450,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.02;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;347,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.07;GİDER;YEME-İÇME GİDERİ;SERRA KURUYEMİŞ;215,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.13;GİDER;AKARYAKIT GİDERİ;İZCİ PETROL;700,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.13;GİDER;EV GİDERİ;ERSOY KASAP SARKUTERI;644,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.16;GİDER;YEME-İÇME GİDERİ;AHMET USTUN ADI ORTAKLIGI;120,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.16;GİDER;YEME-İÇME GİDERİ;MOSPETROL;140,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.17;GİDER;YEME-İÇME GİDERİ;ÖZTADIM UNLU MAMÜLLER;75,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.19;GİDER;EHLİYET YENİLEME;T.C.SAGLIK BAKANLIGI;250,00;ENPARA Kredi Kartı;0;2026.03.09
2026.02.21;GİDER;EV GİDERİ;FİLE MARKET MAĞAZACILIK A;294,78;ENPARA Kredi Kartı;0;2026.03.09
2026.03.10;GİDER;KİŞİSEL BAKIM;İsmail Alak, Bireysel Ödeme, EFT (FAST) sorgu no: 4365802558;500,00;ENPARA Vd.siz TL;0;2026.03.10
2026.03.12;GELİR;DERS ÜCRETİ GELİRİ;İRFAN AYIK, ders ücreti avans;3.750,00;ENPARA Vd.siz TL;0;2026.03.12
2026.03.14;GİDER;ARDA HARİCİ GİDER;İsmail Alak, Bireysel Ödeme, EFT (FAST) sorgu no: 4375377669;300,00;ENPARA Vd.siz TL;0;2026.03.14
2026.03.14;TRANSFER;AİLE İÇİ TRANSFER;ELVIN GASIMOV, bireysel Ödeme;5.000,00;ENPARA Vd.siz TL;0;2026.03.14
2026.03.14;TRANSFER;AİLE İÇİ TRANSFER;Elif Güler, Eliffim kuzum bayram harçlığını güle güle kullan hayırlı bayramlar,EFT (FAST) sorgu no: 4375491180;5.000,00;ENPARA Vd.siz TL;0;2026.03.14
2026.02.28;GİDER;KİŞİSEL BAKIM;HEPSIPAY/HEPSIBURADA ISTANBUL TR (1.099,00 TL) 1/3 TK.;1.099,00;ENPARA Kredi Kartı;3;2026.04.10
2026.02.28;GİDER;YEME-İÇME GİDERİ;MOSPETROL;50,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.01;GİDER;EV GİDERİ;MEGA FIRIN GÜZELYURT;140,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.04;GİDER;AKARYAKIT GİDERİ;MOSPET 2;500,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.04;GİDER;YEME-İÇME GİDERİ;MOS BP 2;200,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.04;GİDER;ARAÇ TAMİR BAKIM;MOS BP 2;165,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;BAŞARI MADENİ YAĞ / ARAÇ PERİYODİK BAKIM / KM-198263;5.000,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.05;GİDER;ARAÇ TAMİR BAKIM;ÜSTÜN OTO / ARAÇ BUJİ ALIMI;2.600,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.06;GİDER;ARAÇ TAMİR BAKIM;TRENDYOL.COM ISTANBUL TR / ARAÇ BAGAJ YAZISI (1.250,22 TL) 1/3 TK.;1.250,22;ENPARA Kredi Kartı;3;2026.04.10
2026.03.06;GİDER;EV GİDERİ;ÖZTADIM UNLU MAMÜLLER;125,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.07;GİDER;EV GİDERİ;FİLE MARKET MAĞAZACILIK A;316,75;ENPARA Kredi Kartı;0;2026.04.10
2026.03.08;GİDER;AKARYAKIT GİDERİ;TANKAR OTO MANISA MANISA TR;2.329,62;ENPARA Kredi Kartı;0;2026.04.10
2026.03.08;GİDER;EV GİDERİ;VOLKAN HAS MANISA TR;75,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.08;GİDER;YEME-İÇME GİDERİ;VOLKAN HAS MANISA TR;50,00;ENPARA Kredi Kartı;0;2026.04.10
2026.03.09;GİDER;KÜÇÜK DEMİRBAŞ GİDERİ;VATAN BILG. MANISA MANISA TR;189,00;ENPARA Kredi Kartı;0;2026.04.10`;

  const lines = csvData.trim().split("\n");
  let added = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(";;;;")) continue;

    const cols = line.split(";");
    if (cols.length < 5) continue;

    let tutarStr = cols[4].trim().replace(/\./g, "").replace(",", ".");
    const tutar = parseFloat(tutarStr);

    const record = {
      date: cols[0].trim().replace(/\./g, "-"),
      type: cols[1].trim().replace("GİDER", "Gider").replace("GELİR", "Gelir").replace("TRANSFER", "Transfer"),
      category: cols[2].trim(),
      note: cols[3] ? cols[3].trim() : "",
      amount: isNaN(tutar) ? 0 : tutar,
      account: cols[5] ? cols[5].trim() : "Nakit"
    };

    if (record.date && record.amount !== 0 && record.category) {
      transactions.push(record);
      added++;
    }
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  alert(`✅ ${added} kayıt CSV dosyasından sisteme başarıyla yüklendi!`);
  updateBalances();
}

// ===================== SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KISIM =====================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  updateBalances();

  // add.html sayfası için
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