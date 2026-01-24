// Restrict invalid characters
function allowOnlyNumbers(event) {
  const char = event.key;

  if (
    char === "Backspace" ||
    char === "Delete" ||
    char === "ArrowLeft" ||
    char === "ArrowRight" ||
    char === "Tab"
  ) {
    return;
  }

  if (!/[0-9.]/.test(char)) {
    event.preventDefault();
  }

  if (char === "." && event.target.value.includes(".")) {
    event.preventDefault();
  }
}

// Attach validation
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("keypress", allowOnlyNumbers);
});

// Get form elements
const propertyPrice = document.getElementById("propertyPrice");
const downPayment = document.getElementById("downPayment");
const loanRate = document.getElementById("loanRate");
const loanTenure = document.getElementById("loanTenure");
const monthlyRent = document.getElementById("monthlyRent");
const rentIncrease = document.getElementById("rentIncrease");
const appreciation = document.getElementById("appreciation");
const investmentReturn = document.getElementById("investmentReturn");
const maintenance = document.getElementById("maintenance");
const errorMsg = document.getElementById("errorMsg");
const result = document.getElementById("result");

// Buy vs Rent Calculation
function calculateBuyVsRent() {
  // Clear previous results
  result.innerHTML = '';
  errorMsg.innerHTML = '';

  // Validation
  let errors = [];
  let price, dpPercent, rate, years, rent, rentInc, appreciationRate, investReturn, maintenanceCost;

  if (!propertyPrice.value.trim()) {
    errors.push("Property Price is required. Please enter a value like 5000000.");
  } else {
    price = parseFloat(propertyPrice.value);
    if (isNaN(price) || price <= 0) {
      errors.push("Property Price must be a positive number greater than 0.");
    }
  }

  if (!downPayment.value.trim()) {
    errors.push("Down Payment is required. Please enter a percentage like 20.");
  } else {
    dpPercent = parseFloat(downPayment.value);
    if (isNaN(dpPercent) || dpPercent < 0 || dpPercent > 100) {
      errors.push("Down Payment must be between 0 and 100.");
    }
  }

  if (!loanRate.value.trim()) {
    errors.push("Loan Interest Rate is required. Please enter a value like 8.5.");
  } else {
    rate = parseFloat(loanRate.value);
    if (isNaN(rate) || rate <= 0 || rate > 30) {
      errors.push("Loan Interest Rate must be between 0 and 30.");
    }
  }

  if (!loanTenure.value.trim()) {
    errors.push("Loan Tenure is required. Please enter years like 20.");
  } else {
    years = parseFloat(loanTenure.value);
    if (isNaN(years) || years <= 0 || years > 30) {
      errors.push("Loan Tenure must be between 1 and 30 years.");
    }
  }

  if (!monthlyRent.value.trim()) {
    errors.push("Monthly Rent is required. Please enter a value like 25000.");
  } else {
    rent = parseFloat(monthlyRent.value);
    if (isNaN(rent) || rent <= 0) {
      errors.push("Monthly Rent must be a positive number greater than 0.");
    }
  }

  if (!rentIncrease.value.trim()) {
    errors.push("Annual Rent Increase is required. Please enter a percentage like 5.");
  } else {
    rentInc = parseFloat(rentIncrease.value);
    if (isNaN(rentInc) || rentInc < 0 || rentInc > 20) {
      errors.push("Annual Rent Increase must be between 0 and 20.");
    }
  }

  if (!appreciation.value.trim()) {
    errors.push("Property Appreciation is required. Please enter a percentage like 5.");
  } else {
    appreciationRate = parseFloat(appreciation.value);
    if (isNaN(appreciationRate) || appreciationRate < 0 || appreciationRate > 20) {
      errors.push("Property Appreciation must be between 0 and 20.");
    }
  }

  if (!investmentReturn.value.trim()) {
    errors.push("Investment Return is required. Please enter a percentage like 12.");
  } else {
    investReturn = parseFloat(investmentReturn.value);
    if (isNaN(investReturn) || investReturn < 0 || investReturn > 30) {
      errors.push("Investment Return must be between 0 and 30.");
    }
  }

  if (!maintenance.value.trim()) {
    errors.push("Monthly Maintenance is required. Please enter a value like 3000.");
  } else {
    maintenanceCost = parseFloat(maintenance.value);
    if (isNaN(maintenanceCost) || maintenanceCost < 0) {
      errors.push("Monthly Maintenance must be 0 or greater.");
    }
  }

  if (errors.length > 0) {
    let errorHtml = '<div class="error-box"><strong>Please fix the following errors:</strong><ul>';
    errors.forEach(err => {
      errorHtml += `<li>${err}</li>`;
    });
    errorHtml += '</ul></div>';
    errorMsg.innerHTML = errorHtml;
    return;
  }

  // Calculate Buying Scenario
  const downPaymentAmount = (price * dpPercent) / 100;
  const loanAmount = price - downPaymentAmount;
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
  const totalEmiPaid = emi * months;
  const totalInterest = totalEmiPaid - loanAmount;
  const totalMaintenance = maintenanceCost * months;
  const futurePropertyValue = price * Math.pow(1 + appreciationRate / 100, years);
  const propertyGain = futurePropertyValue - price;
  
  // Down payment investment growth
  const dpInvestmentGrowth = downPaymentAmount * Math.pow(1 + investReturn / 100, years) - downPaymentAmount;
  
  const totalBuyingCost = downPaymentAmount + totalEmiPaid + totalMaintenance - propertyGain - dpInvestmentGrowth;

  // Calculate Renting Scenario
  let totalRentPaid = 0;
  let currentRent = rent;
  for (let year = 1; year <= years; year++) {
    totalRentPaid += currentRent * 12;
    currentRent = currentRent * (1 + rentInc / 100);
  }

  // Investment growth calculation
  // Initial investment: down payment amount
  // Monthly investment: EMI - rent
  let investmentValue = downPaymentAmount;
  currentRent = rent;
  const monthlyInvestReturn = investReturn / 100 / 12;
  
  for (let month = 1; month <= months; month++) {
    const monthlyInvestment = emi - currentRent - maintenanceCost;
    investmentValue = investmentValue * (1 + monthlyInvestReturn) + (monthlyInvestment > 0 ? monthlyInvestment : 0);
    
    // Update rent annually
    if (month % 12 === 0) {
      currentRent = currentRent * (1 + rentInc / 100);
    }
  }

  const investmentGrowth = investmentValue - downPaymentAmount;
  const totalRentingCost = totalRentPaid - investmentGrowth;

  // Display Results
  let verdict = '';
  if (totalBuyingCost < totalRentingCost) {
    verdict = `<div class="verdict-buy">
      <h3>✓ Buying is Better</h3>
      <p>You save ${formatCurrency(totalRentingCost - totalBuyingCost)} by buying over ${years} years</p>
    </div>`;
  } else {
    verdict = `<div class="verdict-rent">
      <h3>✓ Renting is Better</h3>
      <p>You save ${formatCurrency(totalBuyingCost - totalRentingCost)} by renting over ${years} years</p>
    </div>`;
  }

  result.innerHTML = `
    ${verdict}
    <strong>Net Cost of Buying:</strong> ${formatCurrency(totalBuyingCost)}<br>
    <strong>Net Cost of Renting:</strong> ${formatCurrency(totalRentingCost)}<br>
    <strong>Difference:</strong> ${formatCurrency(Math.abs(totalBuyingCost - totalRentingCost))}<br>
    <strong>Property Value After ${years} Years:</strong> ${formatCurrency(futurePropertyValue)}<br>
    <strong>Investment Value After ${years} Years:</strong> ${formatCurrency(investmentValue)}
  `;

  // Populate comparison table
  const tbody = document.querySelector("#comparisonTable tbody");
  tbody.innerHTML = `
    <tr>
      <td>Initial Payment</td>
      <td>${formatCurrency(downPaymentAmount)}</td>
      <td>${formatCurrency(downPaymentAmount)} (Invested)</td>
      <td>₹0</td>
    </tr>
    <tr>
      <td>Monthly Payment</td>
      <td>${formatCurrency(emi + maintenanceCost)}</td>
      <td>${formatCurrency(rent)}</td>
      <td>${formatCurrency((emi + maintenanceCost) - rent)}</td>
    </tr>
    <tr>
      <td>Total Paid (${years}y)</td>
      <td>${formatCurrency(totalEmiPaid + totalMaintenance)}</td>
      <td>${formatCurrency(totalRentPaid)}</td>
      <td>${formatCurrency((totalEmiPaid + totalMaintenance) - totalRentPaid)}</td>
    </tr>
    <tr>
      <td>Interest/Returns</td>
      <td>-${formatCurrency(totalInterest)} (Interest Paid)</td>
      <td>+${formatCurrency(investmentGrowth)} (Returns Earned)</td>
      <td>${formatCurrency(investmentGrowth + totalInterest)}</td>
    </tr>
    <tr>
      <td>Asset Value</td>
      <td>${formatCurrency(futurePropertyValue)}</td>
      <td>${formatCurrency(investmentValue)}</td>
      <td>${formatCurrency(futurePropertyValue - investmentValue)}</td>
    </tr>
    <tr style="background: #e5edff; font-weight: bold;">
      <td>Net Cost</td>
      <td>${formatCurrency(totalBuyingCost)}</td>
      <td>${formatCurrency(totalRentingCost)}</td>
      <td>${formatCurrency(Math.abs(totalBuyingCost - totalRentingCost))}</td>
    </tr>
  `;

  // Draw comparison chart
  drawChart(totalBuyingCost, totalRentingCost);
}

// Draw bar chart comparing buying vs renting costs
function drawChart(buyingCost, rentingCost) {
  const canvas = document.getElementById('comparisonChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Handle high DPI displays for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set actual canvas size (accounting for device pixel ratio)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale context to match
  ctx.scale(dpr, dpr);
  
  // Use logical dimensions for drawing
  const width = rect.width;
  const height = rect.height;
  
  ctx.clearRect(0, 0, width, height);

  const padding = 60;
  const max = Math.max(buyingCost, rentingCost) * 1.15; // Add 15% headroom
  const barWidth = (width - padding * 2) / 2 - 30;
  const chartHeight = height - padding * 2;

  // Set font
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.textAlign = "center";

  // Title
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 18px Inter, sans-serif";
  ctx.fillText("Net Cost Comparison", width / 2, 25);

  // Draw Buying bar (blue gradient)
  const buyingHeight = (buyingCost / max) * chartHeight;
  const buyingGradient = ctx.createLinearGradient(0, height - padding - buyingHeight, 0, height - padding);
  buyingGradient.addColorStop(0, "#3b82f6");
  buyingGradient.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = buyingGradient;
  ctx.fillRect(
    padding,
    height - padding - buyingHeight,
    barWidth,
    buyingHeight
  );
  
  // Buying bar border
  ctx.strokeStyle = "#1e40af";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    padding,
    height - padding - buyingHeight,
    barWidth,
    buyingHeight
  );
  
  // Buying value label (on top of bar)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.fillText(formatCurrency(buyingCost), padding + barWidth / 2, height - padding - buyingHeight + 25);
  
  // Buying label (below baseline)
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.fillText("🏠 Buying", padding + barWidth / 2, height - padding + 25);

  // Draw Renting bar (green gradient)
  const rentingHeight = (rentingCost / max) * chartHeight;
  const rentingGradient = ctx.createLinearGradient(0, height - padding - rentingHeight, 0, height - padding);
  rentingGradient.addColorStop(0, "#10b981");
  rentingGradient.addColorStop(1, "#059669");
  ctx.fillStyle = rentingGradient;
  ctx.fillRect(
    padding + barWidth + 60,
    height - padding - rentingHeight,
    barWidth,
    rentingHeight
  );
  
  // Renting bar border
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    padding + barWidth + 60,
    height - padding - rentingHeight,
    barWidth,
    rentingHeight
  );
  
  // Renting value label (on top of bar)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.fillText(formatCurrency(rentingCost), padding + barWidth + 60 + barWidth / 2, height - padding - rentingHeight + 25);
  
  // Renting label (below baseline)
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.fillText("🏢 Renting", padding + barWidth + 60 + barWidth / 2, height - padding + 25);

  // Draw baseline
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padding - 10, height - padding);
  ctx.lineTo(width - padding + 10, height - padding);
  ctx.stroke();

  // Add winner indicator
  ctx.font = "bold 14px Inter, sans-serif";
  if (buyingCost < rentingCost) {
    ctx.fillStyle = "#10b981";
    ctx.fillText("✓ Better Choice", padding + barWidth / 2, height - padding - buyingHeight - 15);
  } else {
    ctx.fillStyle = "#10b981";
    ctx.fillText("✓ Better Choice", padding + barWidth + 60 + barWidth / 2, height - padding - rentingHeight - 15);
  }
}

// Format currency
function formatCurrency(num) {
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// Reset calculator
function resetCalculator() {
  document.getElementById("calcForm").reset();
  result.innerHTML = '';
  errorMsg.innerHTML = '';
  
  // Clear chart
  const canvas = document.getElementById('comparisonChart');
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // Clear table
  const tbody = document.querySelector("#comparisonTable tbody");
  if (tbody) {
    tbody.innerHTML = '';
  }
}

// Download PDF
function downloadPDF() {
  if (result.innerHTML.trim() === '') {
    alert('Please calculate the results first before downloading PDF.');
    return;
  }
  window.print();
}
