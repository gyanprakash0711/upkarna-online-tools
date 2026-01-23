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

function calculateNetWorth() {
    debugger
  // Clear previous results
  result.innerHTML = '';

  // Validation and parsing
  let errors = [];
  let cashSavingsParsed = 0, investmentsParsed = 0, realEstateParsed = 0, otherAssetsParsed = 0;
  let creditCardDebtParsed = 0, loansParsed = 0, otherDebtsParsed = 0;

  // Assets
  if (cashSavings.value.trim()) {
    cashSavingsParsed = parseFloat(cashSavings.value);
    if (isNaN(cashSavingsParsed) || cashSavingsParsed < 0) {
      errors.push("Cash & Savings must be a non-negative number.");
    }
  }

  if (investments.value.trim()) {
    investmentsParsed = parseFloat(investments.value);
    if (isNaN(investmentsParsed) || investmentsParsed < 0) {
      errors.push("Investments must be a non-negative number.");
    }
  }

  if (realEstate.value.trim()) {
    realEstateParsed = parseFloat(realEstate.value);
    if (isNaN(realEstateParsed) || realEstateParsed < 0) {
      errors.push("Real Estate must be a non-negative number.");
    }
  }

  if (otherAssets.value.trim()) {
    otherAssetsParsed = parseFloat(otherAssets.value);
    if (isNaN(otherAssetsParsed) || otherAssetsParsed < 0) {
      errors.push("Other Assets must be a non-negative number.");
    }
  }

  // Liabilities
  if (creditCardDebt.value.trim()) {
    creditCardDebtParsed = parseFloat(creditCardDebt.value);
    if (isNaN(creditCardDebtParsed) || creditCardDebtParsed < 0) {
      errors.push("Credit Card Debt must be a non-negative number.");
    }
  }

  if (loans.value.trim()) {
    loansParsed = parseFloat(loans.value);
    if (isNaN(loansParsed) || loansParsed < 0) {
      errors.push("Loans must be a non-negative number.");
    }
  }

  if (otherDebts.value.trim()) {
    otherDebtsParsed = parseFloat(otherDebts.value);
    if (isNaN(otherDebtsParsed) || otherDebtsParsed < 0) {
      errors.push("Other Debts must be a non-negative number.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations
  const totalAssets = cashSavingsParsed + investmentsParsed + realEstateParsed + otherAssetsParsed;
  const totalLiabilities = creditCardDebtParsed + loansParsed + otherDebtsParsed;
  const netWorth = totalAssets - totalLiabilities;

  // Display result
  result.innerHTML = `
    <strong>Total Assets:</strong> ₹${totalAssets.toFixed(2)}<br>
    <strong>Total Liabilities:</strong> ₹${totalLiabilities.toFixed(2)}<br>
    <strong>Net Worth:</strong> ₹${netWorth.toFixed(2)}
  `;

  // Table
  const tbody = document.querySelector("#netWorthTable tbody");
  tbody.innerHTML = `
    <tr><td>Cash & Savings</td><td>₹${cashSavingsParsed.toFixed(2)}</td></tr>
    <tr><td>Investments</td><td>₹${investmentsParsed.toFixed(2)}</td></tr>
    <tr><td>Real Estate</td><td>₹${realEstateParsed.toFixed(2)}</td></tr>
    <tr><td>Other Assets</td><td>₹${otherAssetsParsed.toFixed(2)}</td></tr>
    <tr><td><strong>Total Assets</strong></td><td><strong>₹${totalAssets.toFixed(2)}</strong></td></tr>
    <tr><td>Credit Card Debt</td><td>₹${creditCardDebtParsed.toFixed(2)}</td></tr>
    <tr><td>Loans</td><td>₹${loansParsed.toFixed(2)}</td></tr>
    <tr><td>Other Debts</td><td>₹${otherDebtsParsed.toFixed(2)}</td></tr>
    <tr><td><strong>Total Liabilities</strong></td><td><strong>₹${totalLiabilities.toFixed(2)}</strong></td></tr>
    <tr><td><strong>Net Worth</strong></td><td><strong>₹${netWorth.toFixed(2)}</strong></td></tr>
  `;

  // Chart: Simple bar chart for assets vs liabilities
  drawChart([totalAssets, totalLiabilities]);
}

function drawChart(data) {
  const ctx = netWorthChart.getContext("2d");
  ctx.clearRect(0, 0, netWorthChart.width, netWorthChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (netWorthChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const h = (v / max) * (netWorthChart.height - padding * 2);
    ctx.fillStyle = i === 0 ? "#2563eb" : "#ef4444"; // Blue for assets, red for liabilities
    ctx.fillRect(
      padding + i * (barWidth + 6),
      netWorthChart.height - padding - h,
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