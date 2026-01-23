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

function calculateFD() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const principalElement = document.getElementById('principal');
  const rateElement = document.getElementById('rate');
  const tenureElement = document.getElementById('tenure');
  const compoundingElement = document.getElementById('compounding');

  // Validation
  let errors = [];
  let principal, rate, tenure, compounding;

  if (!principalElement.value.trim()) {
    errors.push("Principal Amount is required. Please enter a value like 100000.");
  } else {
    principal = parseFloat(principalElement.value);
    if (isNaN(principal) || principal <= 0) {
      errors.push("Principal Amount must be a positive number.");
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
    errors.push("Tenure (Years) is required. Please enter a value like 5.");
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

  // Calculations
  const maturityAmount = principal * Math.pow(1 + rate / compounding, compounding * tenure);
  const totalInterest = maturityAmount - principal;

  // Display result
  result.innerHTML = `
    <strong>Principal Amount:</strong> ₹${principal.toFixed(2)}<br>
    <strong>Maturity Amount:</strong> ₹${maturityAmount.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}
  `;

  // Table: Year-wise breakdown
  const tbody = document.querySelector("#fdTable tbody");
  tbody.innerHTML = '';
  let currentBalance = principal;
  let cumulativeInterest = 0;

  for (let year = 1; year <= tenure; year++) {
    const yearEndBalance = principal * Math.pow(1 + rate / compounding, compounding * year);
    const yearInterest = yearEndBalance - currentBalance;
    cumulativeInterest += yearInterest;

    tbody.innerHTML += `
      <tr>
        <td>${year}</td>
        <td>₹${principal.toFixed(2)}</td>
        <td>₹${yearInterest.toFixed(2)}</td>
        <td>₹${yearEndBalance.toFixed(2)}</td>
      </tr>
    `;

    currentBalance = yearEndBalance;
  }

  // Chart: Growth over time
  drawChart(tenure, principal, rate, compounding);
}

function drawChart(tenure, principal, rate, compounding) {
  const ctx = fdChart.getContext("2d");
  ctx.clearRect(0, 0, fdChart.width, fdChart.height);

  const padding = 40;
  const max = principal * Math.pow(1 + rate / compounding, compounding * tenure);
  const barWidth = (fdChart.width - padding * 2) / tenure - 6;

  let currentValue = principal;
  for (let y = 1; y <= tenure; y++) {
    const value = principal * Math.pow(1 + rate / compounding, compounding * y);
    const height = (value / max) * (fdChart.height - padding * 2);
    const x = padding + (y - 1) * (barWidth + 6);
    const yPos = fdChart.height - padding - height;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, yPos, barWidth, height);

    ctx.fillStyle = '#0f172a';
    ctx.font = '10px Inter';
    ctx.fillText(y.toString(), x + barWidth / 2 - 5, fdChart.height - 10);
  }
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert('Please calculate first.');
    return;
  }
  window.print();
}