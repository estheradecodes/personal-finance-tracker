const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const pinInput = document.getElementById("pin");
const loginError = document.getElementById("login-error");
const appContainer = document.querySelector(".container");
const DEFAULT_PIN = "1234";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const currentBalanceEl = document.getElementById("current-balance");
const chartCanvas = document.getElementById("finance-chart");

const transactions = [];
let totalIncome = 0;
let totalExpenses = 0;
let financeChart = null;

function setDefaultPin() {
  if (!localStorage.getItem("financeTrackerPin")) {
    localStorage.setItem("financeTrackerPin", DEFAULT_PIN);
  }
}

function validatePin(pin) {
  return pin === localStorage.getItem("financeTrackerPin");
}

function createFinanceChart() {
  if (financeChart || !chartCanvas) return;

  const chartData = {
    labels: ["Income", "Expense", "Savings", "Others"],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"],
        hoverBackgroundColor: ["#059669", "#dc2626", "#d97706", "#2563eb"],
        borderWidth: 0,
      },
    ],
  };

  financeChart = new Chart(chartCanvas, {
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
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ₦${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
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

  totalIncome = income;
  totalExpenses = expense;
  const balance = totalIncome - totalExpenses;

  totalIncomeEl.textContent = `₦${totalIncome.toFixed(2)}`;
  totalExpensesEl.textContent = `₦${totalExpenses.toFixed(2)}`;
  currentBalanceEl.textContent = `₦${balance.toFixed(2)}`;

  createFinanceChart();

  if (financeChart) {
    financeChart.data.datasets[0].data = [income, expense, savings, others];
    financeChart.update();
  }
}

function unlockApp() {
  loginScreen.classList.add("hidden");
  appContainer.classList.remove("hidden");
  updateSummary();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const enteredPin = pinInput.value.trim();

  if (validatePin(enteredPin)) {
    loginError.textContent = "";
    unlockApp();
  } else {
    loginError.textContent = "Incorrect PIN. Please try again.";
    pinInput.value = "";
    pinInput.focus();
  }
});

setDefaultPin();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if (!description || Number.isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description and amount greater than zero.");
    return;
  }

  transactions.push({
    description,
    amount,
    type,
  });

  updateSummary();

  form.reset();
  typeInput.value = "income";
});
