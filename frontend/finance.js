// ===== Finance Tracker Connected to Django Backend =====

// =============================
// CONFIG
// =============================
const BASE_URL = "http://127.0.0.1:8000/api";
const TOKEN_URL = `${BASE_URL}/token/`;
const REFRESH_URL = `${BASE_URL}/token/refresh/`;

const $ = (s) => document.querySelector(s);
const qs = (s) => document.querySelectorAll(s);
const formatCurrency = (v) =>
  "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function showMessage(text, type = "success") {
  const el = $("#message");
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 3000);
}

// =============================
// AUTHENTICATION
// =============================
let accessToken = localStorage.getItem("accessToken") || null;
let refreshToken = localStorage.getItem("refreshToken") || null;
let currentUser = localStorage.getItem("username") || null;

// UI Elements
const authContainer = $("#authContainer"),
  loginBox = $("#loginBox"),
  signupBox = $("#signupBox"),
  dashboard = $("#dashboard"),
  userNameDisplay = $("#userName"),
  logoutBtn = $("#logoutBtn");

function initAuthUI() {
  if (accessToken) {
    authContainer.style.display = "none";
    dashboard.style.display = "flex";
    userNameDisplay.textContent = currentUser;
    logoutBtn.style.display = "inline-block";
    fetchTransactions();
  } else {
    authContainer.style.display = "block";
    dashboard.style.display = "none";
    logoutBtn.style.display = "none";
  }
}

// Switch between login/signup
$("#showSignup").onclick = (e) => {
  e.preventDefault();
  loginBox.style.display = "none";
  signupBox.style.display = "block";
};
$("#showLogin").onclick = (e) => {
  e.preventDefault();
  signupBox.style.display = "none";
  loginBox.style.display = "block";
};

// Sign Up
$("#signupForm").onsubmit = async (e) => {
  e.preventDefault();
  const username = $("#signupUsername").value.trim();
  const email = $("#signupEmail").value.trim();
  const password = $("#signupPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error("Signup failed");

    showMessage("Signed up successfully! You can now log in.");
    signupBox.style.display = "none";
    loginBox.style.display = "block";
  } catch (err) {
    showMessage("Signup failed", "error");
  }
};

// Login
$("#loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const username = $("#loginUsername").value.trim();
  const password = $("#loginPassword").value;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      showMessage("Invalid credentials", "error");
      return;
    }

    const data = await res.json();
    accessToken = data.access;
    refreshToken = data.refresh;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("username", username);
    currentUser = username;
    showMessage("Logged in successfully");
    initAuthUI();
  } catch {
    showMessage("Login failed", "error");
  }
};

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  accessToken = null;
  refreshToken = null;
  initAuthUI();
};

// =============================
// TOKEN REFRESH HANDLER
// =============================
async function refreshAccessToken() {
  if (!refreshToken) {
    showMessage("Session expired, please log in again", "error");
    logoutBtn.click();
    return false;
  }

  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    accessToken = data.access;
    localStorage.setItem("accessToken", accessToken);
    console.log("🔄 Token refreshed successfully");
    return true;
  } catch (err) {
    console.error("Token refresh failed", err);
    showMessage("Session expired, please log in again", "error");
    logoutBtn.click();
    return false;
  }
}

async function authorizedFetch(url, options = {}) {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return res;
    options.headers.Authorization = `Bearer ${accessToken}`;
    res = await fetch(url, options);
  }

  return res;
}

// =============================
// TRANSACTIONS
// =============================
const tDate = $("#tDate"),
  tDesc = $("#tDesc"),
  tType = $("#tType"),
  tAmount = $("#tAmount"),
  tCategory = $("#tCategory"),
  transactionsTable = $("#transactionsTable tbody"),
  incomeVal = $("#incomeVal"),
  expenseVal = $("#expenseVal"),
  savingsVal = $("#savingsVal"),
  savingsProgress = $("#savingsProgress");

let transactions = [];
let savingsTarget = 0;

// Fetch transactions
async function fetchTransactions() {
  try {
    const res = await authorizedFetch(`${BASE_URL}/transactions/`);
    if (!res.ok) throw new Error();
    transactions = await res.json();
    updateAll();
  } catch (err) {
    showMessage("Failed to fetch transactions", "error");
  }
}

// Add transaction
$("#addForm").onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    description: tDesc.value.trim(),
    amount: parseFloat(tAmount.value),
    type: tType.value.toLowerCase(),
    category: tCategory.value.trim().toLowerCase(),
    date: tDate.value || new Date().toISOString().slice(0, 10),
  };

  try {
    const res = await authorizedFetch(`${BASE_URL}/transactions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      showMessage("Transaction added!");
      e.target.reset();
      fetchTransactions();
    } else {
      showMessage("Failed to add transaction", "error");
    }
  } catch (err) {
    showMessage("Error connecting to backend", "error");
  }
};

// =============================
// RENDER TABLE
// =============================
function renderTable() {
  transactionsTable.innerHTML = "";
  transactions
    .slice()
    .reverse()
    .forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.date}</td>
        <td>${t.description}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>${formatCurrency(t.amount)}</td>
        <td><button class="deleteBtn btn tiny danger" data-id="${t.id}">🗑️</button></td>`;
      transactionsTable.appendChild(tr);
    });

  qs(".deleteBtn").forEach((b) =>
    b.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      try {
        const res = await authorizedFetch(`${BASE_URL}/transactions/${id}/`, {
          method: "DELETE",
        });
        if (res.ok) {
          showMessage("Deleted successfully");
          fetchTransactions();
        }
      } catch {
        showMessage("Delete failed", "error");
      }
    })
  );
}

// =============================
// SUMMARY & CHARTS
// =============================
let barChart, pieChart, lineChart;

function computeSummaries() {
  let income = 0,
    expense = 0;
  transactions.forEach((t) =>
    t.type === "income" ? (income += +t.amount) : (expense += +t.amount)
  );
  const savings = income - expense;
  incomeVal.textContent = formatCurrency(income);
  expenseVal.textContent = formatCurrency(expense);
  savingsVal.textContent = formatCurrency(savings);
  const pct =
    savingsTarget > 0
      ? Math.min(100, Math.round((savings / savingsTarget) * 100))
      : 0;
  savingsProgress.style.width = pct + "%";
  return { income, expense, savings };
}

function initCharts() {
  const barCtx = document.getElementById("barChart").getContext("2d");
  const pieCtx = document.getElementById("pieChart").getContext("2d");
  const lineCtx = document.getElementById("lineChart").getContext("2d");

  const baseTextColor = document.body.classList.contains("dark") ? "#e0e0e0" : "#222";
  const gridColor = document.body.classList.contains("dark") ? "#444" : "#ccc";

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: baseTextColor }, grid: { color: gridColor } },
      y: { ticks: { color: baseTextColor }, grid: { color: gridColor } }
    },
    plugins: { legend: { labels: { color: baseTextColor } } }
  };

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        label: "Amount",
        data: [0, 0],
        backgroundColor: ["#4CAF50", "#F44336"]
      }]
    },
    options: commonOptions
  });

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ["#4E9EFF", "#90CAF9", "#64B5F6", "#2196F3", "#1976D2"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { color: baseTextColor } }
      }
    }
  });

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Savings",
        data: [],
        borderColor: "#4E9EFF",
        backgroundColor: "rgba(78, 158, 255, 0.1)",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4
      }]
    },
    options: commonOptions
  });
}

function updateCharts() {
  const { income, expense } = computeSummaries();
  barChart.data.datasets[0].data = [income, expense];
  barChart.update();

  const catMap = {};
  transactions.forEach((t) => {
    if (t.type === "expense")
      catMap[t.category] = (catMap[t.category] || 0) + +t.amount;
  });
  pieChart.data.labels = Object.keys(catMap);
  pieChart.data.datasets[0].data = Object.values(catMap);
  pieChart.update();

  let cum = 0;
  const labels = [],
    data = [];
  transactions.forEach((t) => {
    cum += t.type === "income" ? +t.amount : -t.amount;
    labels.push(t.date);
    data.push(cum);
  });
  lineChart.data.labels = labels;
  lineChart.data.datasets[0].data = data;
  lineChart.update();
}

// =============================
// UTILITIES
// =============================
$("#setTargetBtn").onclick = setTargetHandler;

function setTargetHandler() {
  const val = prompt("Enter your savings target:", savingsTarget);
  if (val === null) return;
  const num = Number(val);
  if (isNaN(num) || num < 0) return showMessage("Invalid number", "error");
  savingsTarget = num;

  const display = document.querySelector("#savingsTargetDisplay");
  display.innerHTML = `
    Savings target: ₹${savingsTarget.toLocaleString("en-IN")}
    <button id="setTargetBtn" class="btn tiny">Set target</button>
  `;
  document.querySelector("#setTargetBtn").onclick = setTargetHandler;
  updateAll();
  showMessage("Savings target updated!");
}

$("#clearBtn").onclick = async () => {
  if (confirm("Clear all transactions?")) {
    for (let t of transactions) {
      await authorizedFetch(`${BASE_URL}/transactions/${t.id}/`, {
        method: "DELETE",
      });
    }
    fetchTransactions();
  }
};

$("#exportBtn").onclick = () => {
  if (!transactions.length) return showMessage("No data", "error");
  const csv = [
    ["Date", "Description", "Type", "Category", "Amount"],
    ...transactions.map((t) => [
      t.date,
      t.description,
      t.type,
      t.category,
      t.amount,
    ]),
  ]
    .map((r) => r.join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// =============================
// THEME TOGGLE (Dark/Light Mode)
// =============================
const themeToggle = document.getElementById("themeToggle");

function applyTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", mode);
  updateChartTheme(isDark);
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.body.classList.contains("dark") ? "dark" : "light";
  const newMode = current === "dark" ? "light" : "dark";
  applyTheme(newMode);
});

function updateChartTheme(isDark) {
  const textColor = isDark ? "#e0e0e0" : "#222";
  const gridColor = isDark ? "#444" : "#ccc";

  [barChart, pieChart, lineChart].forEach((chart) => {
    if (!chart) return;
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach((scale) => {
        if (scale.ticks) scale.ticks.color = textColor;
        if (scale.grid) scale.grid.color = gridColor;
      });
    }
    if (chart.options.plugins && chart.options.plugins.legend) {
      chart.options.plugins.legend.labels.color = textColor;
    }
    chart.update();
  });
}

// =============================
// MAIN
// =============================
function updateAll() {
  renderTable();
  computeSummaries();
  updateCharts();
}

window.onload = () => {
  initAuthUI();
  initCharts();
};