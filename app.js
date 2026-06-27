const authScreen = document.getElementById("auth-screen");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginPanel = document.getElementById("login-panel");
const registerPanel = document.getElementById("register-panel");
const resetPanel = document.getElementById("reset-panel");
const authDescription = document.getElementById("auth-description");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const resetForm = document.getElementById("reset-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const registerUsername = document.getElementById("register-username");
const registerPassword = document.getElementById("register-password");
const registerConfirmPassword = document.getElementById("register-confirm-password");
const resetUsername = document.getElementById("reset-username");
const resetPassword = document.getElementById("reset-password");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const authError = document.getElementById("auth-error");
const registerError = document.getElementById("register-error");
const resetError = document.getElementById("reset-error");
const resetSuccess = document.getElementById("reset-success");
const logoutButton = document.getElementById("logout-button");
const currentUserNameEl = document.getElementById("current-user-name");
const appContainer = document.querySelector(".container");
const eyeToggleButtons = document.querySelectorAll(".eye-toggle");

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryField = document.getElementById("category-field");
const categorySelect = document.getElementById("category");
const transactionDateInput = document.getElementById("transaction-date");
const transactionSubmitBtn = document.getElementById("transaction-submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const transactionHistory = document.getElementById("transaction-history");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const currentBalanceEl = document.getElementById("current-balance");
const expenseCategoryCanvas = document.getElementById("expense-category-chart");
const comparisonBarCanvas = document.getElementById("comparison-bar-chart");
const spendingTrendCanvas = document.getElementById("spending-trend-chart");
const currencySelector = document.getElementById("currency-selector");

const USERS_KEY = "financeTrackerUsers";
const CURRENT_USER_KEY = "financeTrackerCurrentUser";
const CURRENCY_KEY = "financeTrackerCurrency";
const TRANSACTIONS_KEY = "financeTrackerTransactions";
const DEFAULT_CURRENCY = "NGN";
const transactions = [];
let expenseCategoryChart = null;
let comparisonBarChart = null;
let spendingTrendChart = null;
let editingTransactionId = null;

function getUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUser(username) {
  localStorage.setItem(CURRENT_USER_KEY, username);
}

function getCurrencyCode() {
  return localStorage.getItem(CURRENCY_KEY) || DEFAULT_CURRENCY;
}

function saveCurrencyCode(code) {
  localStorage.setItem(CURRENCY_KEY, code);
}

function getCurrencySymbol() {
  const currencyMap = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
  };
  return currencyMap[getCurrencyCode()] || "₦";
}

function getSavedTransactions() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTransactions() {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function toggleCategoryField() {
  if (typeInput.value === "expense") {
    categoryField.classList.remove("hidden");
  } else {
    categoryField.classList.add("hidden");
  }
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function showPanel(panel) {
  loginPanel.classList.add("hidden");
  registerPanel.classList.add("hidden");
  resetPanel.classList.add("hidden");
  loginTab.classList.remove("active");
  registerTab.classList.remove("active");
  authError.textContent = "";
  registerError.textContent = "";
  resetError.textContent = "";
  resetSuccess.textContent = "";

  if (panel === "register") {
    registerPanel.classList.remove("hidden");
    registerTab.classList.add("active");
    authDescription.textContent = "Create a new account and start tracking your personal finances.";
  } else if (panel === "reset") {
    resetPanel.classList.remove("hidden");
    authDescription.textContent = "Reset your password to regain access to your account.";
  } else {
    loginPanel.classList.remove("hidden");
    loginTab.classList.add("active");
    authDescription.textContent = "Existing users can log in and new users can register for access.";
  }
}

function resetAuthForms() {
  loginForm.reset();
  registerForm.reset();
  resetForm.reset();
  authError.textContent = "";
  registerError.textContent = "";
  resetError.textContent = "";
  resetSuccess.textContent = "";
}

function createExpenseCategoryChart() {
  if (expenseCategoryChart || !expenseCategoryCanvas) return;

  const chartData = {
    labels: ["Expense", "Savings", "Others"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6"],
        hoverBackgroundColor: ["#dc2626", "#d97706", "#2563eb"],
        borderWidth: 0,
      },
    ],
  };

  expenseCategoryChart = new Chart(expenseCategoryCanvas, {
    type: "doughnut",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const symbol = getCurrencySymbol();
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ${symbol}${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function createComparisonBarChart() {
  if (comparisonBarChart || !comparisonBarCanvas) return;

  const chartData = {
    labels: ["Income", "Expense", "Savings"],
    datasets: [
      {
        label: "Amount",
        data: [0, 0, 0],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
      },
    ],
  };

  comparisonBarChart = new Chart(comparisonBarCanvas, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return `${getCurrencySymbol()}${value}`;
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function createSpendingTrendChart() {
  if (spendingTrendChart || !spendingTrendCanvas) return;

  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Spending",
        data: [],
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderColor: "#ef4444",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  spendingTrendChart = new Chart(spendingTrendCanvas, {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return `${getCurrencySymbol()}${value}`;
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function formatMonthLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function getMonthlySpending() {
  const monthlyTotals = {};

  transactions
    .filter((transaction) => transaction.type !== "income")
    .forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + transaction.amount;
    });

  const sortedKeys = Object.keys(monthlyTotals).sort();
  return {
    labels: sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      return new Date(year, Number(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
    }),
    values: sortedKeys.map((key) => monthlyTotals[key]),
  };
}

function updateSummary() {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const savings = transactions
    .filter((transaction) => transaction.type === "savings")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const others = transactions
    .filter((transaction) => transaction.type === "others")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = income - expense;
  const symbol = getCurrencySymbol();

  totalIncomeEl.textContent = `${symbol}${income.toFixed(2)}`;
  totalExpensesEl.textContent = `${symbol}${expense.toFixed(2)}`;
  currentBalanceEl.textContent = `${symbol}${balance.toFixed(2)}`;

  createExpenseCategoryChart();
  createComparisonBarChart();
  createSpendingTrendChart();

  if (expenseCategoryChart) {
    expenseCategoryChart.data.datasets[0].data = [expense, savings, others];
    expenseCategoryChart.update();
  }

  if (comparisonBarChart) {
    comparisonBarChart.data.datasets[0].data = [income, expense, savings];
    comparisonBarChart.update();
  }

  const monthlySpending = getMonthlySpending();
  if (spendingTrendChart) {
    spendingTrendChart.data.labels = monthlySpending.labels;
    spendingTrendChart.data.datasets[0].data = monthlySpending.values;
    spendingTrendChart.update();
  }
}

function showAppForCurrentUser() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    authScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
    currentUserNameEl.textContent = currentUser;
    if (currencySelector) {
      currencySelector.value = getCurrencyCode();
    }
    loadTransactions();
    updateSummary();
  } else {
    authScreen.classList.remove("hidden");
    appContainer.classList.add("hidden");
    showPanel("login");
  }
}

function loadTransactions() {
  transactions.length = 0;
  const saved = getSavedTransactions();
  saved.forEach((transaction) => transactions.push(transaction));
  renderTransactionHistory();
}

function clearTransactionForm() {
  form.reset();
  typeInput.value = "income";
  transactionDateInput.value = new Date().toISOString().split("T")[0];
  categoryField.classList.add("hidden");
  transactionSubmitBtn.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
  editingTransactionId = null;
}

function setEditMode(transaction) {
  editingTransactionId = transaction.id;
  descriptionInput.value = transaction.description;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  transactionDateInput.value = transaction.createdAt.split("T")[0];
  if (transaction.type === "expense") {
    categoryField.classList.remove("hidden");
    categorySelect.value = transaction.category || "Food";
  } else {
    categoryField.classList.add("hidden");
  }
  transactionSubmitBtn.textContent = "Update Transaction";
  cancelEditBtn.classList.remove("hidden");
}

function deleteTransaction(id) {
  const index = transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) return;
  transactions.splice(index, 1);
  saveTransactions();
  renderTransactionHistory();
  updateSummary();
}

function logout() {
  clearCurrentUser();
  transactions.length = 0;
  if (financeChart) {
    financeChart.data.datasets[0].data = [0, 0, 0, 0];
    financeChart.update();
  }
  authScreen.classList.remove("hidden");
  appContainer.classList.add("hidden");
  resetAuthForms();
  showPanel("login");
}

loginTab.addEventListener("click", () => showPanel("login"));
registerTab.addEventListener("click", () => showPanel("register"));
forgotPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();
  showPanel("reset");
});

typeInput.addEventListener("change", toggleCategoryField);
window.addEventListener("DOMContentLoaded", toggleCategoryField);

currencySelector.addEventListener("change", (event) => {
  saveCurrencyCode(event.target.value);
  updateSummary();
});

eyeToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "🙈" : "👁️";
  });
});

logoutButton.addEventListener("click", logout);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  const users = getUsers();
  const user = users.find((item) => item.username === username);

  if (!user || user.password !== password) {
    authError.textContent = "Username or password is incorrect.";
    return;
  }

  setCurrentUser(username);
  resetAuthForms();
  showAppForCurrentUser();
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = registerUsername.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;
  const users = getUsers();

  if (!username || !password) {
    registerError.textContent = "Please enter a username and password.";
    return;
  }

  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match.";
    return;
  }

  if (users.some((item) => item.username === username)) {
    registerError.textContent = "Username already exists. Please choose another.";
    return;
  }

  users.push({ username, password });
  saveUsers(users);
  setCurrentUser(username);
  resetAuthForms();
  showAppForCurrentUser();
});

resetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = resetUsername.value.trim();
  const password = resetPassword.value;
  const users = getUsers();
  const user = users.find((item) => item.username === username);

  resetError.textContent = "";
  resetSuccess.textContent = "";

  if (!username || !password) {
    resetError.textContent = "Please enter your username and new password.";
    return;
  }

  if (!user) {
    resetError.textContent = "Username not found. Please register first.";
    return;
  }

  user.password = password;
  saveUsers(users);
  resetSuccess.textContent = "Password updated successfully. You can now log in.";
  resetForm.reset();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if (!description || Number.isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description and amount greater than zero.");
    return;
  }

  const transaction = {
    description,
    amount,
    type,
    createdAt: new Date().toISOString(),
  };

  if (type === "expense") {
    transaction.category = categorySelect.value;
  }

  if (editingTransactionId) {
    const existing = transactions.find((item) => item.id === editingTransactionId);
    if (existing) {
      existing.description = description;
      existing.amount = amount;
      existing.type = type;
      existing.category = type === "expense" ? categorySelect.value : undefined;
      existing.createdAt = transactionDateInput.value + "T00:00:00.000Z";
    }
  } else {
    transactions.push(transaction);
  }

  saveTransactions();
  renderTransactionHistory();
  updateSummary();
  clearTransactionForm();
});

cancelEditBtn.addEventListener("click", () => {
  clearTransactionForm();
});

showAppForCurrentUser();
