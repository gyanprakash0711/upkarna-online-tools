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

function compareEMIvSIP() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const loanAmountElement = document.getElementById('loanAmount');
  const loanRateElement = document.getElementById('loanRate');
  const loanTenureElement = document.getElementById('loanTenure');
  const sipAmountElement = document.getElementById('sipAmount');
  const sipRateElement = document.getElementById('sipRate');
  const sipTenureElement = document.getElementById('sipTenure');

  // Validation
  let errors = [];
  let loanAmount, loanRate, loanTenure, sipAmount, sipRate, sipTenure;

  if (!loanAmountElement.value.trim()) {
    errors.push("Loan Amount is required. Please enter a value like 500000.");
  } else {
    loanAmount = parseFloat(loanAmountElement.value);
    if (isNaN(loanAmount) || loanAmount <= 0) {
      errors.push("Loan Amount must be a positive number greater than 0.");
    }
  }

  if (!loanRateElement.value.trim()) {
    errors.push("Loan Interest Rate (%) is required. Please enter a value like 12.");
  } else {
    loanRate = parseFloat(loanRateElement.value) / 100;
    if (isNaN(loanRate) || loanRate < 0) {
      errors.push("Loan Interest Rate must be a non-negative number.");
    }
  }

  if (!loanTenureElement.value.trim()) {
    errors.push("Loan Tenure (Years) is required. Please enter a value like 5.");
  } else {
    loanTenure = parseFloat(loanTenureElement.value);
    if (isNaN(loanTenure) || loanTenure <= 0 || !Number.isInteger(loanTenure)) {
      errors.push("Loan Tenure must be a positive integer.");
    }
  }

  if (!sipAmountElement.value.trim()) {
    errors.push("Monthly SIP Amount is required. Please enter a value like 10000.");
  } else {
    sipAmount = parseFloat(sipAmountElement.value);
    if (isNaN(sipAmount) || sipAmount <= 0) {
      errors.push("Monthly SIP Amount must be a positive number greater than 0.");
    }
  }

  if (!sipRateElement.value.trim()) {
    errors.push("Expected SIP Return (%) is required. Please enter a value like 12.");
  } else {
    sipRate = parseFloat(sipRateElement.value) / 100;
    if (isNaN(sipRate) || sipRate < 0) {
      errors.push("Expected SIP Return must be a non-negative number.");
    }
  }

  if (!sipTenureElement.value.trim()) {
    errors.push("SIP Tenure (Years) is required. Please enter a value like 5.");
  } else {
    sipTenure = parseFloat(sipTenureElement.value);
    if (isNaN(sipTenure) || sipTenure <= 0 || !Number.isInteger(sipTenure)) {
      errors.push("SIP Tenure must be a positive integer.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations
  // EMI Calculation
  const monthlyLoanRate = loanRate / 12;
  const numPayments = loanTenure * 12;
  const emi = loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, numPayments) / (Math.pow(1 + monthlyLoanRate, numPayments) - 1);
  const totalEMIPaid = emi * numPayments;

  // SIP Future Value Calculation (using future value of annuity formula)
  const monthlySIPRate = sipRate / 12;
  const numSIPPayments = sipTenure * 12;
  const sipFutureValue = sipAmount * (Math.pow(1 + monthlySIPRate, numSIPPayments) - 1) / monthlySIPRate * (1 + monthlySIPRate);
  const totalSIPInvested = sipAmount * numSIPPayments;

  // Comparison
  const difference = sipFutureValue - totalEMIPaid;
  const recommendation = difference > 0 ? "SIP is better" : "EMI is better";

  // Display result
  result.innerHTML = `
    <strong>Total EMI Paid:</strong> ₹${totalEMIPaid.toFixed(2)}<br>
    <strong>SIP Future Value:</strong> ₹${sipFutureValue.toFixed(2)}<br>
    <strong>Total SIP Invested:</strong> ₹${totalSIPInvested.toFixed(2)}<br>
    <strong>SIP Returns:</strong> ₹${(sipFutureValue - totalSIPInvested).toFixed(2)}<br>
    <strong>Difference (SIP - EMI):</strong> ₹${difference.toFixed(2)}<br>
    <strong>Recommendation:</strong> ${recommendation}
  `;

  // Table
  const tbody = document.querySelector("#comparisonTable tbody");
  tbody.innerHTML = `
    <tr><td>Monthly Payment</td><td>₹${emi.toFixed(2)}</td><td>₹${sipAmount.toFixed(2)}</td><td>₹${(sipAmount - emi).toFixed(2)}</td></tr>
    <tr><td>Total Paid/Invested</td><td>₹${totalEMIPaid.toFixed(2)}</td><td>₹${totalSIPInvested.toFixed(2)}</td><td>₹${(totalSIPInvested - totalEMIPaid).toFixed(2)}</td></tr>
    <tr><td>Future Value</td><td>N/A (Cost)</td><td>₹${sipFutureValue.toFixed(2)}</td><td>₹${sipFutureValue.toFixed(2)}</td></tr>
    <tr><td>Net Benefit</td><td>-₹${totalEMIPaid.toFixed(2)}</td><td>₹${(sipFutureValue - totalSIPInvested).toFixed(2)}</td><td>₹${difference.toFixed(2)}</td></tr>
  `;

  // Chart: Bar chart comparing EMI cost vs SIP value
  drawChart(totalEMIPaid, sipFutureValue);
}

function drawChart(emiCost, sipValue) {
  const ctx = comparisonChart.getContext("2d");
  ctx.clearRect(0, 0, comparisonChart.width, comparisonChart.height);

  const padding = 40;
  const max = Math.max(emiCost, sipValue);
  const barWidth = (comparisonChart.width - padding * 2) / 2 - 6;

  // EMI bar (red)
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(
    padding,
    comparisonChart.height - padding - (emiCost / max) * (comparisonChart.height - padding * 2),
    barWidth,
    (emiCost / max) * (comparisonChart.height - padding * 2)
  );

  // SIP bar (green)
  ctx.fillStyle = "#10b981";
  ctx.fillRect(
    padding + barWidth + 12,
    comparisonChart.height - padding - (sipValue / max) * (comparisonChart.height - padding * 2),
    barWidth,
    (sipValue / max) * (comparisonChart.height - padding * 2)
  );
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert("Please calculate first.");
    return;
  }
  window.print();
}