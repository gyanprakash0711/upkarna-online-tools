function allowOnlyNumbers(e) {
  const c = e.key;
  if (!/[0-9.]/.test(c) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(c)) {
    e.preventDefault();
  }
  if (c === "." && e.target.value.includes(".")) e.preventDefault();
}

document.querySelectorAll("input").forEach(i =>
  i.addEventListener("keypress", allowOnlyNumbers)
);

function calculatePayoff() {
  // Clear previous results
  result.innerHTML = '';

  // Validation
  let errors = [];
  let balanceVal, rateVal, minPaymentVal, extraPaymentVal;

  if (!balance.value.trim()) {
    errors.push("Current Balance is required. Please enter a value like 50000.");
  } else {
    balanceVal = parseFloat(balance.value);
    if (isNaN(balanceVal) || balanceVal <= 0) {
      errors.push("Current Balance must be a positive number greater than 0.");
    }
  }

  if (!rate.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 18.");
  } else {
    rateVal = parseFloat(rate.value) / 100;
    if (isNaN(rateVal) || rateVal < 0) {
      errors.push("Annual Interest Rate (%) must be a non-negative number (e.g., 18 for 18%).");
    }
  }

  if (!minPayment.value.trim()) {
    errors.push("Minimum Monthly Payment is required. Please enter a value like 1500.");
  } else {
    minPaymentVal = parseFloat(minPayment.value);
    if (isNaN(minPaymentVal) || minPaymentVal <= 0) {
      errors.push("Minimum Monthly Payment must be a positive number greater than 0.");
    }
  }

  if (!extraPayment.value.trim()) {
    extraPaymentVal = 0;
  } else {
    extraPaymentVal = parseFloat(extraPayment.value);
    if (isNaN(extraPaymentVal) || extraPaymentVal < 0) {
      errors.push("Extra Monthly Payment must be a non-negative number.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Proceed with calculation
  const monthlyRate = rateVal / 12;
  const monthlyPayment = minPaymentVal + extraPaymentVal;

  let currentBalance = balanceVal;
  let totalInterest = 0;
  let totalPayments = 0;
  let months = 0;
  let tableData = [];

  while (currentBalance > 0 && months < 360) { // Max 30 years
    months++;
    const interest = currentBalance * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, currentBalance);
    const payment = interest + principal;

    totalInterest += interest;
    totalPayments += payment;
    currentBalance -= principal;

    if (months <= 12) { // Show first 12 months in table
      tableData.push({
        month: months,
        balance: currentBalance,
        payment: payment,
        interest: interest,
        principal: principal
      });
    }
  }

  // If payoff took more than 12 months, add final month
  if (months > 12) {
    tableData.push({
      month: months,
      balance: currentBalance,
      payment: tableData[tableData.length - 1].payment,
      interest: tableData[tableData.length - 1].interest,
      principal: tableData[tableData.length - 1].principal
    });
  }

  // Display table
  const tbody = document.querySelector("#payoffTable tbody");
  tbody.innerHTML = "";
  tableData.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.month}</td>
        <td>₹${row.balance.toFixed(2)}</td>
        <td>₹${row.payment.toFixed(2)}</td>
        <td>₹${row.interest.toFixed(2)}</td>
        <td>₹${row.principal.toFixed(2)}</td>
      </tr>
    `;
  });

  // Display result
  result.innerHTML = `
    <strong>Months to Payoff:</strong> ${months}<br>
    <strong>Total Interest Paid:</strong> ₹${totalInterest.toFixed(2)}<br>
    <strong>Total Payments:</strong> ₹${totalPayments.toFixed(2)}
  `;

  // Chart: balance over time
  drawChart(tableData.map(d => d.balance));
}

function drawChart(data) {
  const ctx = payoffChart.getContext("2d");
  ctx.clearRect(0, 0, payoffChart.width, payoffChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (payoffChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const h = (v / max) * (payoffChart.height - padding * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(
      padding + i * (barWidth + 6),
      payoffChart.height - padding - h,
      barWidth,
      h
    );
  });
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert("Please calculate first.");
    return;
  }
  window.print();
}