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

function calculateRD() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const monthlyDepositElement = document.getElementById('monthlyDeposit');
  const rateElement = document.getElementById('rate');
  const tenureElement = document.getElementById('tenure');
  const compoundingElement = document.getElementById('compounding');

  // Validation
  let errors = [];
  let monthlyDeposit, rate, tenure, compounding;

  if (!monthlyDepositElement.value.trim()) {
    errors.push("Monthly Deposit Amount is required. Please enter a value like 5000.");
  } else {
    monthlyDeposit = parseFloat(monthlyDepositElement.value);
    if (isNaN(monthlyDeposit) || monthlyDeposit <= 0) {
      errors.push("Monthly Deposit Amount must be a positive number.");
    }
  }

  if (!rateElement.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 6.");
  } else {
    rate = parseFloat(rateElement.value) / 100;
    if (isNaN(rate) || rate <= 0) {
      errors.push("Annual Interest Rate must be a positive number.");
    }
  }

  if (!tenureElement.value.trim()) {
    errors.push("Tenure (Months) is required. Please enter a value like 24.");
  } else {
    tenure = parseFloat(tenureElement.value);
    if (isNaN(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
      errors.push("Tenure must be a positive integer.");
    }
  }

  compounding = parseInt(compoundingElement.value);

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations: Simulate month by month
  let balance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  let tableData = [];
  let balanceData = [0];

  for (let month = 1; month <= tenure; month++) {
    // Add monthly deposit at the beginning of the month
    balance += monthlyDeposit;
    totalDeposits += monthlyDeposit;

    // Apply interest if it's a compounding period
    if (month % compounding === 0) {
      const interest = balance * (rate / 12) * compounding;
      balance += interest;
      totalInterest += interest;
    }

    // For table, show every month or every 3 months for brevity
    if (month <= 36 || month % 3 === 0) { // Show up to 36 months, then every 3rd
      tableData.push({
        month,
        deposit: totalDeposits.toFixed(2),
        interest: totalInterest.toFixed(2),
        balance: balance.toFixed(2)
      });
    }

    balanceData.push(balance);
  }

  // Display result
  result.innerHTML = `
    <strong>Monthly Deposit:</strong> ₹${monthlyDeposit.toFixed(2)}<br>
    <strong>Total Deposits:</strong> ₹${totalDeposits.toFixed(2)}<br>
    <strong>Maturity Amount:</strong> ₹${balance.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}
  `;

  // Table
  const tbody = document.querySelector("#rdTable tbody");
  tbody.innerHTML = '';
  tableData.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.month}</td>
        <td>₹${row.deposit}</td>
        <td>₹${row.interest}</td>
        <td>₹${row.balance}</td>
      </tr>
    `;
  });

  // Chart: Growth over time
  drawChart(balanceData);
}

function drawChart(data) {
  const ctx = rdChart.getContext("2d");
  ctx.clearRect(0, 0, rdChart.width, rdChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (rdChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const height = (v / max) * (rdChart.height - padding * 2);
    const x = padding + i * (barWidth + 6);
    const y = rdChart.height - padding - height;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, y, barWidth, height);

    if (i % 6 === 0 || i === data.length - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '10px Inter';
      ctx.fillText(i.toString(), x + barWidth / 2 - 5, rdChart.height - 10);
    }
  });
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert('Please calculate first.');
    return;
  }
  window.print();
}