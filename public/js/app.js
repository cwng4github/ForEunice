// Baby Tracker Application - Client-side JavaScript with SQLite backend

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  if (mins == null) return "";
  mins = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const computeMonthAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return months < 0 ? 0 : months;
};

const formatAgeText = (months) => {
  if (months == null) return "尚未設定生日";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} 個月大`;
  if (m === 0) return `${y} 歲`;
  return `${y} 歲 ${m} 個月`;
};

// ===== 月齡專屬參考模板 =====
const referenceByMonth = {
  0: [
    { time: "02:00", feed: "母乳 60ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "05:00", feed: "母乳 60ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "08:00", feed: "母乳 70ml", sleepStart: "08:30", sleepEnd: "09:30", poop: "少量" },
    { time: "11:00", feed: "母乳 70ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "14:00", feed: "母乳 70ml", sleepStart: "14:30", sleepEnd: "15:30", poop: "" },
    { time: "17:00", feed: "母乳 70ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "20:00", feed: "母乳 80ml", sleepStart: "20:30", sleepEnd: "23:30", poop: "少量" },
    { time: "23:30", feed: "母乳 60ml", sleepStart: "00:00", sleepEnd: "02:00", poop: "" }
  ],
  1: [
    { time: "01:30", feed: "母乳 80ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "04:30", feed: "母乳 80ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "07:30", feed: "母乳 90ml", sleepStart: "08:00", sleepEnd: "09:30", poop: "少量" },
    { time: "10:30", feed: "母乳 90ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "13:30", feed: "母乳 90ml", sleepStart: "14:00", sleepEnd: "15:30", poop: "" },
    { time: "16:30", feed: "母乳 90ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "19:30", feed: "母乳 100ml", sleepStart: "20:00", sleepEnd: "23:00", poop: "正常" },
    { time: "23:00", feed: "母乳 80ml", sleepStart: "23:30", sleepEnd: "01:30", poop: "" }
  ],
  2: [
    { time: "02:00", feed: "母乳 120ml", sleepStart: "02:30", sleepEnd: "05:30", poop: "" },
    { time: "06:00", feed: "母乳 120ml", sleepStart: "", sleepEnd: "", poop: "少量" },
    { time: "09:30", feed: "母乳 120ml", sleepStart: "10:00", sleepEnd: "11:00", poop: "" },
    { time: "13:00", feed: "母乳 130ml", sleepStart: "13:30", sleepEnd: "14:30", poop: "正常" },
    { time: "17:00", feed: "母乳 120ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "20:30", feed: "母乳 130ml", sleepStart: "21:00", sleepEnd: "02:00", poop: "" }
  ],
  3: [
    { time: "02:30", feed: "母乳 130ml", sleepStart: "03:00", sleepEnd: "06:30", poop: "" },
    { time: "07:00", feed: "母乳 130ml", sleepStart: "", sleepEnd: "", poop: "少量" },
    { time: "10:30", feed: "母乳 140ml", sleepStart: "11:00", sleepEnd: "12:00", poop: "" },
    { time: "14:00", feed: "母乳 140ml", sleepStart: "14:30", sleepEnd: "15:30", poop: "" },
    { time: "17:30", feed: "母乳 140ml", sleepStart: "", sleepEnd: "", poop: "正常" },
    { time: "21:00", feed: "母乳 150ml", sleepStart: "21:30", sleepEnd: "02:30", poop: "" }
  ],
  4: [
    { time: "02:30", feed: "母乳 150ml", sleepStart: "03:00", sleepEnd: "06:30", poop: "" },
    { time: "07:00", feed: "母乳 160ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "11:00", feed: "母乳 160ml", sleepStart: "11:30", sleepEnd: "12:30", poop: "少量" },
    { time: "15:00", feed: "母乳 170ml", sleepStart: "15:30", sleepEnd: "16:30", poop: "" },
    { time: "19:00", feed: "母乳 170ml", sleepStart: "", sleepEnd: "", poop: "正常" },
    { time: "22:30", feed: "母乳 160ml", sleepStart: "23:00", sleepEnd: "02:30", poop: "" }
  ],
  5: [
    { time: "06:30", feed: "母乳 170ml", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "10:30", feed: "母乳 180ml", sleepStart: "11:00", sleepEnd: "12:00", poop: "少量" },
    { time: "14:30", feed: "母乳 180ml", sleepStart: "15:00", sleepEnd: "16:00", poop: "" },
    { time: "18:30", feed: "母乳 170ml", sleepStart: "", sleepEnd: "", poop: "正常" },
    { time: "22:00", feed: "母乳 170ml", sleepStart: "22:30", sleepEnd: "06:30", poop: "" }
  ],
  6: [
    { time: "07:00", feed: "母乳 180ml", sleepStart: "", sleepEnd: "", poop: "少量" },
    { time: "10:30", feed: "母乳 180ml + 副食品", sleepStart: "11:00", sleepEnd: "12:00", poop: "" },
    { time: "14:30", feed: "母乳 180ml", sleepStart: "15:00", sleepEnd: "16:00", poop: "" },
    { time: "18:30", feed: "母乳 190ml + 副食品", sleepStart: "", sleepEnd: "", poop: "正常" },
    { time: "22:00", feed: "母乳 180ml", sleepStart: "22:30", sleepEnd: "07:00", poop: "" }
  ],
  7: [
    { time: "07:00", feed: "母乳 180ml + 副食品", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "11:00", feed: "母乳 180ml", sleepStart: "11:30", sleepEnd: "12:30", poop: "少量" },
    { time: "15:00", feed: "母乳 180ml + 副食品", sleepStart: "15:30", sleepEnd: "16:30", poop: "" },
    { time: "19:30", feed: "母乳 190ml", sleepStart: "20:00", sleepEnd: "07:00", poop: "正常" }
  ],
  8: [
    { time: "07:00", feed: "母乳 200ml + 副食品", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "11:30", feed: "母乳 200ml", sleepStart: "12:00", sleepEnd: "13:00", poop: "少量" },
    { time: "16:00", feed: "母乳 200ml + 副食品", sleepStart: "16:30", sleepEnd: "17:30", poop: "" },
    { time: "20:00", feed: "母乳 200ml", sleepStart: "20:30", sleepEnd: "07:00", poop: "正常" }
  ],
  9: [
    { time: "07:00", feed: "母乳 200ml + 早餐副食品", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "12:00", feed: "母乳 200ml + 午餐副食品", sleepStart: "12:30", sleepEnd: "13:30", poop: "少量" },
    { time: "16:30", feed: "點心 / 少量母乳", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "20:00", feed: "母乳 200ml + 晚餐副食品", sleepStart: "20:30", sleepEnd: "07:00", poop: "正常" }
  ],
  10: [
    { time: "07:00", feed: "母乳 200ml + 早餐副食品", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "12:30", feed: "母乳 180ml + 午餐副食品", sleepStart: "13:00", sleepEnd: "14:00", poop: "少量" },
    { time: "16:30", feed: "點心 / 水果", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "20:00", feed: "母乳 180ml + 晚餐副食品", sleepStart: "20:30", sleepEnd: "07:00", poop: "正常" }
  ],
  11: [
    { time: "07:00", feed: "奶 180ml + 早餐固體", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "12:30", feed: "奶 150ml + 午餐固體", sleepStart: "13:00", sleepEnd: "14:00", poop: "少量" },
    { time: "16:30", feed: "點心 / 少量奶", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "20:00", feed: "奶 150ml + 晚餐固體", sleepStart: "20:30", sleepEnd: "07:00", poop: "正常" }
  ],
  12: [
    { time: "07:30", feed: "牛奶 / 配方奶 150ml + 早餐固體", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "12:30", feed: "少量奶 + 午餐固體", sleepStart: "13:00", sleepEnd: "14:00", poop: "正常" },
    { time: "16:00", feed: "點心", sleepStart: "", sleepEnd: "", poop: "" },
    { time: "19:30", feed: "少量奶 + 晚餐固體", sleepStart: "20:00", sleepEnd: "07:30", poop: "" }
  ]
};

const genericDefaultReference = [
  { time: "06:30", feed: "母乳 120ml", sleepStart: "", sleepEnd: "", poop: "少量" },
  { time: "09:30", feed: "母乳 100ml", sleepStart: "10:00", sleepEnd: "11:00", poop: "" },
  { time: "13:00", feed: "母乳 120ml", sleepStart: "13:30", sleepEnd: "14:30", poop: "正常" },
  { time: "17:30", feed: "母乳 110ml", sleepStart: "", sleepEnd: "", poop: "" },
  { time: "21:00", feed: "母乳 130ml", sleepStart: "21:30", sleepEnd: "06:00", poop: "" }
];

const clampMonth = (m) => {
  if (m == null) return 0;
  if (m < 0) return 0;
  if (m > 12) return 12;
  return m;
};

const getDefaultReferenceForMonth = (month) => {
  month = clampMonth(month);
  if (referenceByMonth[month]) return referenceByMonth[month];
  if (month <= 1) return referenceByMonth[0];
  if (month <= 3) return referenceByMonth[2];
  if (month <= 5) return referenceByMonth[4];
  if (month <= 7) return referenceByMonth[6];
  if (month <= 12) return referenceByMonth[8];
  return referenceByMonth[12];
};

const describeRefMonth = (m) => {
  m = clampMonth(m);
  if (m === null) return "尚未計算";
  if (m === 0) return "0 個月（新生兒少量多餐）";
  if (m === 1) return "1 個月（每 3 小時餵）";
  if (m === 2) return "2 個月（約 6–7 餐）";
  if (m === 3) return "3 個月（約 6 餐）";
  if (m === 4 || m === 5) return m + " 個月（每 4 小時左右）";
  if (m === 6 || m === 7) return m + " 個月（開始副食品）";
  if (m >= 8 && m <= 12) return m + " 個月（3 次奶搭配固體餐）";
  return m + " 個月";
};

const getMonthFeatures = (m) => {
  m = clampMonth(m);
  const features = {
    0: "少量多餐，夜間餵食頻繁。8次/天，60-80ml/次，約每3小時餵食。短睡眠週期（1-3小時）。",
    1: "開始建立規律，仍需夜間餵食。8次/天，80-100ml/次，約每3小時餵食。開始延長夜間睡眠。",
    2: "餵食次數減少，夜間睡眠延長。6次/天，120-130ml/次，每3-4小時餵食。夜間可睡5-6小時。",
    3: "作息更規律，奶量增加。6次/天，130-150ml/次，每3.5-4小時餵食。夜間睡眠7-8小時。",
    4: "每4小時餵食，夜間睡眠穩定。6次/天，150-170ml/次，每4小時餵食。夜間睡眠8-9小時。",
    5: "準備引入副食品，夜間餵食減少。5次/天，170-180ml/次，每4小時餵食。夜間可睡10-12小時。",
    6: "開始引入副食品，奶量維持。5次/天（4次奶+2次副食），180-190ml/次。夜間睡眠穩定。",
    7: "副食品增加，奶量穩定。4次/天（3-4次奶+副食），180-190ml/次。夜間睡眠11小時。",
    8: "奶量達峰值，副食品為主。4次/天（3次奶+2-3次副食），200ml/次。夜間睡眠11小時。",
    9: "三餐模式建立，奶量維持。4次/天（3次奶+3餐副食），200ml/次。夜間睡眠11小時。",
    10: "奶量開始減少，固體為主。4次/天（3次奶+3餐副食），180-200ml/次。夜間睡眠11小時。",
    11: "接近幼兒餐，奶量減少。4次/天（3次奶+3餐固體），150-180ml/次。夜間睡眠11小時。",
    12: "轉換至牛奶/配方奶，固體為主。4次/天（少量奶+3餐固體），150ml或更少。夜間睡眠11.5小時。"
  };
  return features[m] || "—";
};

// Global state
let currentBirthDate = null;
let currentReference = [];
let currentRecords = [];
let currentForecasts = [];
let planChart = null;

// DOM Elements
const babyBirthDateInput = document.getElementById("babyBirthDate");
const babyAgeText = document.getElementById("babyAgeText");
const babyAgeChip = document.getElementById("baby-age-chip");
const forecastAgeChip = document.getElementById("forecastAgeChip");
const todayDateLabel = document.getElementById("todayDateLabel");
const referenceTableBody = document.getElementById("referenceTableBody");
const runForecastBtn = document.getElementById("runForecastBtn");
const saveForecastBtn = document.getElementById("saveForecastBtn");
const forecastTableBody = document.getElementById("forecastTableBody");
const planTimeline = document.getElementById("planTimeline");
const loadReferenceBtn = document.getElementById("loadReferenceBtn");
const reloadRefForAgeBtn = document.getElementById("reloadRefForAgeBtn");
const refreshPlanBtn = document.getElementById("refreshPlanBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const currentRefMonthLabel = document.getElementById("currentRefMonthLabel");
const currentRefFeatureLabel = document.getElementById("currentRefFeatureLabel");
const saveBabyProfileBtn = document.getElementById("saveBabyProfileBtn");
const saveReferenceBtn = document.getElementById("saveReferenceBtn");

const recordDateInput = document.getElementById("recordDate");
const recordTimeInput = document.getElementById("recordTime");
const recordFeedLeftInput = document.getElementById("recordFeedLeft");
const recordFeedRightInput = document.getElementById("recordFeedRight");
const recordFeedBreastMilkInput = document.getElementById("recordFeedBreastMilk");
const recordFeedFormulaInput = document.getElementById("recordFeedFormula");
const recordSleepStartInput = document.getElementById("recordSleepStart");
const recordSleepEndInput = document.getElementById("recordSleepEnd");
const recordPoopInput = document.getElementById("recordPoop");
const recordPeeInput = document.getElementById("recordPee");
const recordBathInput = document.getElementById("recordBath");
const recordNotesInput = document.getElementById("recordNotes");
const addRecordBtn = document.getElementById("addRecordBtn");
const clearRecordFormBtn = document.getElementById("clearRecordFormBtn");
const recordList = document.getElementById("recordList");
const recordDateFilter = document.getElementById("recordDateFilter");

// API Functions
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    currentBirthDate = data.birthDate;
    currentReference = data.reference || [];
    currentRecords = data.records || [];
    currentForecasts = data.forecasts || [];
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function saveBabyProfile(birthDate) {
  try {
    const response = await fetch('/api/baby-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate })
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving baby profile:', error);
    return null;
  }
}

async function saveReferencePattern(patterns) {
  try {
    const response = await fetch('/api/reference-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patterns })
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving reference pattern:', error);
    return null;
  }
}

async function addRecord(record) {
  try {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding record:', error);
    return null;
  }
}

async function updateRecord(id, record) {
  try {
    const response = await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating record:', error);
    return null;
  }
}

async function deleteRecord(id) {
  try {
    const response = await fetch(`/api/records/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting record:', error);
    return null;
  }
}

async function saveForecast(date, rows) {
  try {
    const response = await fetch('/api/forecasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, rows })
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving forecast:', error);
    return null;
  }
}

// Render Functions
const renderReferenceTable = () => {
  referenceTableBody.innerHTML = "";
  currentReference.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-stone-100";
    tr.innerHTML = `
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white" data-ref-index="${index}" data-field="time" value="${row.time || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="text" class="input-base text-[11px] bg-white" data-ref-index="${index}" data-field="feed" value="${row.feed || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white" data-ref-index="${index}" data-field="sleepStart" value="${row.sleepStart || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white" data-ref-index="${index}" data-field="sleepEnd" value="${row.sleepEnd || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="text" class="input-base text-[11px] bg-white" data-ref-index="${index}" data-field="poop" value="${row.poop || ""}">
      </td>
    `;
    referenceTableBody.appendChild(tr);
  });

  referenceTableBody.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      const index = parseInt(input.dataset.refIndex, 10);
      const field = input.dataset.field;
      if (!currentReference[index]) return;
      currentReference[index][field] = input.value;
    });
  });
};

const renderRecordList = () => {
  const records = [...currentRecords].sort((a, b) => {
    if (a.date === b.date) return (a.time || "").localeCompare(b.time || "");
    return a.date.localeCompare(b.date);
  });
  const filterDate = recordDateFilter.value || "";
  recordList.innerHTML = "";

  const filtered = filterDate ? records.filter(r => r.date === filterDate) : records;

  if (filtered.length === 0) {
    recordList.innerHTML = `<p class="text-[11px] text-stone-400 text-center py-4">目前沒有任何記錄。</p>`;
    return;
  }

  filtered.forEach((r) => {
    const card = document.createElement("div");
    card.className = "muji-card px-3 py-2 flex flex-col gap-1 text-[11px]";
    
    // Build feed summary
    const feedParts = [];
    if (r.feedLeft) feedParts.push(`埋身(L) ${r.feedLeft}mins`);
    if (r.feedRight) feedParts.push(`埋身(R) ${r.feedRight}mins`);
    if (r.feedBreastMilk) feedParts.push(`人奶 ${r.feedBreastMilk}ml`);
    if (r.feedFormula) feedParts.push(`奶粉 ${r.feedFormula}ml`);
    const feedText = feedParts.length > 0 ? feedParts.join(', ') : '—';
    
    // Build status icons
    const statusParts = [];
    if (r.sleepStart) statusParts.push('入睡');
    if (r.sleepEnd) statusParts.push('起床');
    if (r.bath) statusParts.push('沖涼');
    const statusText = statusParts.length > 0 ? statusParts.join(' · ') : '—';
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="chip">${r.date}</span>
          <span class="text-stone-800 font-medium">${r.time || "--:--"}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="text-stone-400 hover:text-red-500" data-action="delete" data-id="${r.id}">
            <i class="fa fa-trash-o"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1 mt-1">
        <div><span class="text-stone-400">食：</span>${feedText}</div>
        <div class="flex gap-3">
          <span><span class="text-stone-400">便便：</span>${r.poop || "—"}</span>
          <span><span class="text-stone-400">尿尿：</span>${r.pee || "—"}</span>
        </div>
        <div><span class="text-stone-400">狀態：</span>${statusText}</div>
        ${r.notes ? `<div><span class="text-stone-400">備注：</span>${r.notes}</div>` : ''}
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest("button[data-action='delete']")) return;
      openRecordEditModal(r.id);
    });

    card.querySelector("button[data-action='delete']").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("確定要刪除此筆記錄？")) return;
      await deleteRecord(r.id);
      await fetchData();
      renderRecordList();
      populateRecordDateFilter();
      renderPlanTimeline();
    });

    recordList.appendChild(card);
  });
};

const populateRecordDateFilter = () => {
  const dates = Array.from(new Set(currentRecords.map(r => r.date))).sort();
  const currentValue = recordDateFilter.value;
  recordDateFilter.innerHTML = `<option value="">全部日期</option>`;
  dates.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    recordDateFilter.appendChild(opt);
  });
  if (dates.includes(currentValue)) {
    recordDateFilter.value = currentValue;
  }
};

const openRecordEditModal = async (id) => {
  const r = currentRecords.find(x => x.id === id);
  if (!r) return;
  
  alert("編輯功能：請刪除後重新新增記錄");
  return;
  
  // TODO: Implement proper edit modal for new fields
};

const computeAverageShiftMinutes = () => {
  const byDate = {};
  currentRecords.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  const dates = Object.keys(byDate).sort().reverse();
  const considerDates = dates.slice(0, 3);
  const shifts = [];

  considerDates.forEach(date => {
    const dayRecords = byDate[date];
    currentReference.forEach(refRow => {
      const refTimeMins = parseTimeToMinutes(refRow.time);
      if (refTimeMins == null) return;
      const sameTimeRecord = dayRecords.find(r => r.time && parseTimeToMinutes(r.time) != null);
      if (!sameTimeRecord) return;
      const actualMins = parseTimeToMinutes(sameTimeRecord.time);
      if (actualMins == null) return;
      shifts.push(actualMins - refTimeMins);
    });
  });

  if (shifts.length === 0) return 0;
  const sum = shifts.reduce((a, b) => a + b, 0);
  return Math.round(sum / shifts.length);
};

const renderForecastTable = (rows) => {
  forecastTableBody.innerHTML = "";
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-stone-100";
    tr.innerHTML = `
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white forecast-input" data-row="${idx}" data-field="time" value="${row.time || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="text" class="input-base text-[11px] bg-white forecast-input" data-row="${idx}" data-field="feed" value="${row.feed || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white forecast-input" data-row="${idx}" data-field="sleepStart" value="${row.sleepStart || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="time" class="input-base text-[11px] bg-white forecast-input" data-row="${idx}" data-field="sleepEnd" value="${row.sleepEnd || ""}">
      </td>
      <td class="py-1 pr-2">
        <input type="text" class="input-base text-[11px] bg-white forecast-input" data-row="${idx}" data-field="poop" value="${row.poop || ""}">
      </td>
    `;
    forecastTableBody.appendChild(tr);
  });
};

const runForecast = () => {
  const shift = computeAverageShiftMinutes();
  const forecastRows = currentReference.map(row => {
    const base = parseTimeToMinutes(row.time);
    const forecastTime = base == null ? "" : minutesToTime(base + shift);
    return {
      time: forecastTime,
      feed: row.feed,
      sleepStart: row.sleepStart,
      sleepEnd: row.sleepEnd,
      poop: row.poop
    };
  });
  renderForecastTable(forecastRows);
  return forecastRows;
};

const getForecastTableData = () => {
  const rows = [];
  forecastTableBody.querySelectorAll("tr").forEach(() => {
    rows.push({ time: "", feed: "", sleepStart: "", sleepEnd: "", poop: "" });
  });

  forecastTableBody.querySelectorAll(".forecast-input").forEach(input => {
    const rowIndex = parseInt(input.dataset.row, 10);
    const field = input.dataset.field;
    if (!rows[rowIndex]) return;
    rows[rowIndex][field] = input.value;
  });

  return rows;
};

const renderPlanChart = () => {
  const today = todayISO();
  const todayForecast = currentForecasts.find(f => f.date === today);
  const todayRecords = currentRecords.filter(r => r.date === today);

  const canvas = document.getElementById('planChart');
  const ctx = canvas.getContext('2d');

  if (planChart) {
    planChart.destroy();
  }

  const labels = [];
  const planData = [];
  const actualData = [];

  // Get plan data from forecast
  if (todayForecast && todayForecast.rows) {
    todayForecast.rows.forEach(row => {
      if (row.time) {
        labels.push(row.time);
        planData.push(parseTimeToMinutes(row.time));
      }
    });
  }

  // Get actual data from records
  todayRecords.forEach(record => {
    if (record.time) {
      const mins = parseTimeToMinutes(record.time);
      if (mins !== null) {
        if (!labels.includes(record.time)) {
          labels.push(record.time);
        }
        actualData.push({ x: record.time, y: mins });
      }
    }
  });

  labels.sort();

  planChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '每日計畫',
          data: planData,
          borderColor: 'rgb(120, 113, 108)',
          backgroundColor: 'rgba(120, 113, 108, 0.1)',
          tension: 0.1
        },
        {
          label: '今日實際',
          data: actualData,
          borderColor: 'rgb(41, 37, 36)',
          backgroundColor: 'rgba(41, 37, 36, 0.1)',
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return minutesToTime(value);
            }
          }
        }
      }
    }
  });
};

const renderPlanTimeline = () => {
  const today = todayISO();
  const todayForecast = currentForecasts.find(f => f.date === today);
  const records = currentRecords.filter(r => r.date === today);

  planTimeline.innerHTML = "";

  const block = document.createElement("div");
  block.className = "space-y-2";

  if (!todayForecast) {
    block.innerHTML = `
      <p class="text-[11px] text-stone-400 mb-1">尚未保存今日預測，可在 FORECAST 分頁產生並保存。</p>
    `;
  } else {
    const rows = todayForecast.rows;
    rows.forEach(row => {
      const time = row.time || "--:--";
      const li = document.createElement("div");
      li.className = "flex items-start gap-3";

      li.innerHTML = `
        <div class="flex flex-col items-center">
          <span class="text-[11px] text-stone-500">${time}</span>
          <span class="w-px flex-1 bg-stone-200 mt-1"></span>
        </div>
        <div class="flex-1 muji-card px-3 py-2 text-[11px]">
          <div class="flex items-center justify-between">
            <span class="text-stone-800">${row.feed || "—"}</span>
            <span class="chip">預測</span>
          </div>
          <div class="mt-1 text-stone-500">
            <span>入睡：${row.sleepStart || "—"}</span>
            <span class="mx-1">·</span>
            <span>起床：${row.sleepEnd || "—"}</span>
            <span class="mx-1">·</span>
            <span>痾屎：${row.poop || "—"}</span>
          </div>
        </div>
      `;
      block.appendChild(li);
    });
  }

  if (records.length > 0) {
    const subTitle = document.createElement("div");
    subTitle.className = "mt-3 section-title";
    subTitle.textContent = "TODAY ACTUAL";
    block.appendChild(subTitle);

    records.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    records.forEach(r => {
      // Build feed summary
      const feedParts = [];
      if (r.feedLeft) feedParts.push(`埋身(L) ${r.feedLeft}mins`);
      if (r.feedRight) feedParts.push(`埋身(R) ${r.feedRight}mins`);
      if (r.feedBreastMilk) feedParts.push(`人奶 ${r.feedBreastMilk}ml`);
      if (r.feedFormula) feedParts.push(`奶粉 ${r.feedFormula}ml`);
      const feedText = feedParts.length > 0 ? feedParts.join(', ') : '—';
      
      // Build status
      const statusParts = [];
      if (r.sleepStart) statusParts.push('入睡');
      if (r.sleepEnd) statusParts.push('起床');
      if (r.bath) statusParts.push('沖涼');
      
      const row = document.createElement("div");
      row.className = "flex items-start gap-3 mt-1";
      row.innerHTML = `
        <div class="flex flex-col items-center">
          <span class="text-[11px] text-stone-500">${r.time || "--:--"}</span>
          <span class="w-px flex-1 bg-stone-200 mt-1"></span>
        </div>
        <div class="flex-1 muji-card px-3 py-2 text-[11px]">
          <div class="flex items-center justify-between">
            <span class="text-stone-800">${feedText}</span>
            <span class="chip">歷史</span>
          </div>
          <div class="mt-1 text-stone-500 text-[10px]">
            ${statusParts.length > 0 ? `<div>${statusParts.join(' · ')}</div>` : ''}
            <div>便便：${r.poop || "—"} · 尿尿：${r.pee || "—"}</div>
            ${r.notes ? `<div class="mt-0.5 text-stone-600">備注：${r.notes}</div>` : ''}
          </div>
        </div>
      `;
      block.appendChild(row);
    });
  } else {
    const p = document.createElement("p");
    p.className = "text-[11px] text-stone-400 mt-2";
    p.textContent = "今日尚未有實際記錄，可在 RECORD 分頁新增。";
    block.appendChild(p);
  }

  planTimeline.appendChild(block);
  
  // Render chart
  renderPlanChart();
};

const clearRecordForm = () => {
  recordDateInput.value = todayISO();
  recordTimeInput.value = "";
  recordFeedLeftInput.value = "";
  recordFeedRightInput.value = "";
  recordFeedBreastMilkInput.value = "";
  recordFeedFormulaInput.value = "";
  recordSleepStartInput.checked = false;
  recordSleepEndInput.checked = false;
  recordPoopInput.value = "";
  recordPeeInput.value = "";
  recordBathInput.checked = false;
  recordNotesInput.value = "";
};

const exportToCsv = () => {
  window.location.href = '/api/export/csv';
};

const updateAgeDisplay = () => {
  const months = computeMonthAge(currentBirthDate);
  const ageTextStr = formatAgeText(months);
  babyAgeText.textContent = `目前月齡：約 ${ageTextStr}。`;
  babyAgeChip.textContent = ageTextStr;
  forecastAgeChip.textContent = `預測以 ${ageTextStr} 為參考。`;
  currentRefMonthLabel.textContent = describeRefMonth(months);
  currentRefFeatureLabel.textContent = getMonthFeatures(months);
};

// Tab switching
const tabButtons = document.querySelectorAll("button.tab-btn");
const tabSections = {
  setup: document.getElementById("tab-setup"),
  plan: document.getElementById("tab-plan"),
  record: document.getElementById("tab-record"),
  forecast: document.getElementById("tab-forecast")
};

const switchTab = (tab) => {
  Object.keys(tabSections).forEach(key => {
    tabSections[key].classList.toggle("hidden", key !== tab);
  });
  tabButtons.forEach(btn => {
    const t = btn.dataset.tab;
    if (t === tab) {
      btn.classList.remove("tab-inactive");
      btn.classList.add("tab-active");
    } else {
      btn.classList.remove("tab-active");
      btn.classList.add("tab-inactive");
    }
  });
  
  // Refresh plan chart when switching to plan tab
  if (tab === 'plan') {
    renderPlanTimeline();
  }
};

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  const today = todayISO();
  todayDateLabel.textContent = `今天：${today}`;
  recordDateInput.value = today;

  // Fetch data from server
  await fetchData();

  if (currentBirthDate) {
    babyBirthDateInput.value = currentBirthDate;
  }
  
  updateAgeDisplay();

  // If no reference pattern, load default for current age
  if (currentReference.length === 0) {
    const months = computeMonthAge(currentBirthDate);
    currentReference = getDefaultReferenceForMonth(months);
  }

  renderReferenceTable();
  renderRecordList();
  populateRecordDateFilter();
  renderForecastTable(runForecast());
  renderPlanTimeline();
});

// Event Listeners
saveBabyProfileBtn.addEventListener("click", async () => {
  const birthDate = babyBirthDateInput.value;
  if (!birthDate) {
    alert("請輸入出生日期");
    return;
  }
  
  await saveBabyProfile(birthDate);
  currentBirthDate = birthDate;
  updateAgeDisplay();
  alert("嬰兒資料已儲存");
});

loadReferenceBtn.addEventListener("click", () => {
  if (!confirm("確定要載入通用預設？這會覆蓋目前參考模板。")) return;
  currentReference = JSON.parse(JSON.stringify(genericDefaultReference));
  renderReferenceTable();
});

reloadRefForAgeBtn.addEventListener("click", () => {
  const months = computeMonthAge(currentBirthDate);
  if (months == null) {
    alert("請先設定嬰兒出生日期。");
    return;
  }
  if (!confirm(`將依照目前月齡（約 ${formatAgeText(months)}）重設參考模板，會覆蓋你已修改的內容，確定繼續？`)) return;
  currentReference = getDefaultReferenceForMonth(months);
  renderReferenceTable();
  currentRefMonthLabel.textContent = describeRefMonth(months);
  currentRefFeatureLabel.textContent = getMonthFeatures(months);
  alert("已依月齡載入新的參考模板。");
});

saveReferenceBtn.addEventListener("click", async () => {
  await saveReferencePattern(currentReference);
  alert("參考模板已儲存");
});

addRecordBtn.addEventListener("click", async () => {
  const date = recordDateInput.value || todayISO();
  const time = recordTimeInput.value || "";
  const feedLeft = parseInt(recordFeedLeftInput.value) || 0;
  const feedRight = parseInt(recordFeedRightInput.value) || 0;
  const feedBreastMilk = parseInt(recordFeedBreastMilkInput.value) || 0;
  const feedFormula = parseInt(recordFeedFormulaInput.value) || 0;
  const sleepStart = recordSleepStartInput.checked;
  const sleepEnd = recordSleepEndInput.checked;
  const poop = recordPoopInput.value;
  const pee = recordPeeInput.value;
  const bath = recordBathInput.checked;
  const notes = recordNotesInput.value.trim();

  if (!time && !feedLeft && !feedRight && !feedBreastMilk && !feedFormula &&
      !sleepStart && !sleepEnd && !poop && !pee && !bath && !notes) {
    alert("請至少填寫一個欄位。");
    return;
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await addRecord({
    id, date, time,
    feedLeft, feedRight, feedBreastMilk, feedFormula,
    sleepStart, sleepEnd, poop, pee, bath, notes
  });
  await fetchData();
  renderRecordList();
  populateRecordDateFilter();
  renderPlanTimeline();
  clearRecordForm();
});

clearRecordFormBtn.addEventListener("click", () => {
  clearRecordForm();
});

recordDateFilter.addEventListener("change", () => {
  renderRecordList();
});

runForecastBtn.addEventListener("click", () => {
  runForecast();
  alert("已根據最近歷史記錄與月齡模板更新預測時間。");
});

saveForecastBtn.addEventListener("click", async () => {
  const today = todayISO();
  const rows = getForecastTableData();
  await saveForecast(today, rows);
  await fetchData();
  alert("已保存今日預測，可於 PLAN 及 CSV 匯出查看。");
  renderPlanTimeline();
});

refreshPlanBtn.addEventListener("click", () => {
  renderPlanTimeline();
});

exportCsvBtn.addEventListener("click", () => {
  exportToCsv();
});

// Made with Bob
