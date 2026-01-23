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

function calculateLumpsum() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const principalElement = document.getElementById('principal');
  const rateElement = document.getElementById('rate');
  const yearsElement = document.getElementById('years');

  // Validation
  let errors = [];
  let principal, rate, years;

  if (!principalElement.value.trim()) {
    errors.push("Principal Amount is required. Please enter a value like 100000.");
  } else {
    principal = parseFloat(principalElement.value);
    if (isNaN(principal) || principal <= 0) {
      errors.push("Principal Amount must be a positive number greater than 0.");
    }
  }

  if (!rateElement.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 8.");
  } else {
    rate = parseFloat(rateElement.value) / 100;
    if (isNaN(rate) || rate < 0) {
      errors.push("Annual Interest Rate must be a non-negative number.");
    }
  }

  if (!yearsElement.value.trim()) {
    errors.push("Investment Period (Years) is required. Please enter a value like 10.");
  } else {
    years = parseFloat(yearsElement.value);
    if (isNaN(years) || years <= 0 || !Number.isInteger(years)) {
      errors.push("Investment Period must be a positive integer.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations
  const futureValue = principal * Math.pow(1 + rate, years);
  const totalInterest = futureValue - principal;

  // Display result
  result.innerHTML = `
    <strong>Future Value:</strong> ₹${futureValue.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}
  `;

  // Table: Year-by-year breakdown
  const tbody = document.querySelector("#lumpsumTable tbody");
  tbody.innerHTML = '';
  let currentValue = principal;
  for (let y = 1; y <= years; y++) {
    const interestEarned = currentValue * rate;
    const newValue = currentValue + interestEarned;
    tbody.innerHTML += `
      <tr>
        <td>${y}</td>
        <td>₹${currentValue.toFixed(2)}</td>
        <td>₹${interestEarned.toFixed(2)}</td>
        <td>₹${newValue.toFixed(2)}</td>
      </tr>
    `;
    currentValue = newValue;
  }

  // Chart: Growth over time
  drawChart(years, principal, rate);
}

function drawChart(years, principal, rate) {
  const ctx = lumpsumChart.getContext("2d");
  ctx.clearRect(0, 0, lumpsumChart.width, lumpsumChart.height);

  const padding = 40;
  const max = principal * Math.pow(1 + rate, years);
  const barWidth = (lumpsumChart.width - padding * 2) / years - 6;

  let currentValue = principal;
  for (let y = 1; y <= years; y++) {
    const interestEarned = currentValue * rate;
    const newValue = currentValue + interestEarned;
    const h = (newValue / max) * (lumpsumChart.height - padding * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(
      padding + (y - 1) * (barWidth + 6),
      lumpsumChart.height - padding - h,
      barWidth,
      h
    );
    currentValue = newValue;
  }
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert("Please calculate first.");
    return;
  }
  window.print();
}