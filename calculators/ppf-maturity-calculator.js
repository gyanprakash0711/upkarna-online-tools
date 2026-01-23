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

function calculatePPF() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const annualDepositElement = document.getElementById('annualDeposit');
  const rateElement = document.getElementById('rate');
  const tenureElement = document.getElementById('tenure');

  // Validation
  let errors = [];
  let annualDeposit, rate, tenure;

  if (!annualDepositElement.value.trim()) {
    errors.push("Annual Deposit Amount is required. Please enter a value like 50000.");
  } else {
    annualDeposit = parseFloat(annualDepositElement.value);
    if (isNaN(annualDeposit) || annualDeposit < 500 || annualDeposit > 150000) {
      errors.push("Annual Deposit Amount must be between ₹500 and ₹1,50,000.");
    }
  }

  if (!rateElement.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 7.1.");
  } else {
    rate = parseFloat(rateElement.value) / 100;
    if (isNaN(rate) || rate <= 0) {
      errors.push("Annual Interest Rate must be a positive number.");
    }
  }

  if (!tenureElement.value.trim()) {
    errors.push("Tenure (Years) is required. Please enter a value like 15.");
  } else {
    tenure = parseFloat(tenureElement.value);
    if (isNaN(tenure) || tenure < 15 || tenure > 50 || !Number.isInteger(tenure)) {
      errors.push("Tenure must be between 15 and 50 years.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations: Simulate year by year
  let balance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  let tableData = [];
  let balanceData = [0];

  for (let year = 1; year <= tenure; year++) {
    // Add annual deposit at the beginning of the year
    balance += annualDeposit;
    totalDeposits += annualDeposit;

    // Apply interest at the end of the year
    const interest = balance * rate;
    balance += interest;
    totalInterest += interest;

    tableData.push({
      year,
      deposit: totalDeposits.toFixed(2),
      interest: totalInterest.toFixed(2),
      balance: balance.toFixed(2)
    });

    balanceData.push(balance);
  }

  // Display result
  result.innerHTML = `
    <strong>Annual Deposit:</strong> ₹${annualDeposit.toFixed(2)}<br>
    <strong>Total Deposits:</strong> ₹${totalDeposits.toFixed(2)}<br>
    <strong>Maturity Amount:</strong> ₹${balance.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}
  `;

  // Table
  const tbody = document.querySelector("#ppfTable tbody");
  tbody.innerHTML = '';
  tableData.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.year}</td>
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
  const ctx = ppfChart.getContext("2d");
  ctx.clearRect(0, 0, ppfChart.width, ppfChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (ppfChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const height = (v / max) * (ppfChart.height - padding * 2);
    const x = padding + i * (barWidth + 6);
    const y = ppfChart.height - padding - height;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, y, barWidth, height);

    if (i % 5 === 0 || i === data.length - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '10px Inter';
      ctx.fillText(i.toString(), x + barWidth / 2 - 5, ppfChart.height - 10);
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