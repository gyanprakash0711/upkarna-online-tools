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

function calculateStepUpSIP() {
  // Clear previous results
  result.innerHTML = '';

  // Validation
  let errors = [];
  let sip, stepUpPercent, ratePercent, yearsNum;

  if (!monthlySIP.value.trim()) {
    errors.push("Initial Monthly SIP is required. Please enter a value like 5000.");
  } else {
    sip = parseFloat(monthlySIP.value);
    if (isNaN(sip) || sip <= 0) {
      errors.push("Initial Monthly SIP must be a positive number greater than 0.");
    }
  }

  if (!stepUp.value.trim()) {
    errors.push("Annual Step-Up (%) is required. Please enter a value like 10.");
  } else {
    stepUpPercent = parseFloat(stepUp.value) / 100;
    if (isNaN(stepUpPercent) || stepUpPercent < 0) {
      errors.push("Annual Step-Up (%) must be a non-negative number (e.g., 10 for 10%).");
    }
  }

  if (!rate.value.trim()) {
    errors.push("Expected Annual Return (%) is required. Please enter a value like 12.");
  } else {
    ratePercent = parseFloat(rate.value) / 100;
    if (isNaN(ratePercent) || ratePercent < 0) {
      errors.push("Expected Annual Return (%) must be a non-negative number (e.g., 12 for 12%).");
    }
  }

  if (!years.value.trim()) {
    errors.push("Investment Duration (Years) is required. Please enter a value like 20.");
  } else {
    yearsNum = parseInt(years.value);
    if (isNaN(yearsNum) || yearsNum <= 0 || yearsNum > 100) {
      errors.push("Investment Duration (Years) must be a positive integer between 1 and 100.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Proceed with calculation

  const tbody = document.querySelector("#growthTable tbody");
  tbody.innerHTML = "";

  let totalInvested = 0;
  let totalValue = 0;
  let values = [];
  let currentSIP = sip;

  for (let y = 1; y <= yearsNum; y++) {
    const yearlyInvestment = currentSIP * 12;
    totalInvested += yearlyInvestment;
    totalValue = (totalValue + yearlyInvestment) * (1 + ratePercent);

    values.push(totalValue);

    tbody.innerHTML += `
      <tr>
        <td>${y}</td>
        <td>₹${currentSIP.toFixed(0)}</td>
        <td>₹${totalInvested.toFixed(0)}</td>
        <td>₹${totalValue.toFixed(0)}</td>
      </tr>
    `;

    currentSIP *= (1 + stepUpPercent);
  }

  result.innerHTML = `
    <strong>Total Investment:</strong> ₹${totalInvested.toFixed(0)}<br>
    <strong>Maturity Value:</strong> ₹${totalValue.toFixed(0)}<br>
    <strong>Wealth Gained:</strong> ₹${(totalValue - totalInvested).toFixed(0)}
  `;

  drawChart(values);
}

function drawChart(data) {
  const ctx = growthChart.getContext("2d");
  ctx.clearRect(0, 0, growthChart.width, growthChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (growthChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const h = (v / max) * (growthChart.height - padding * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(
      padding + i * (barWidth + 6),
      growthChart.height - padding - h,
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
