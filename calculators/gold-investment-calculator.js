// Allow only numbers in input fields
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

// Attach validation to inputs
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keypress', allowOnlyNumbers);
  });
});

function calculateGoldReturns() {
  // Get input values
  const investmentAmountInput = document.getElementById('investmentAmount');
  const purchasePriceInput = document.getElementById('purchasePrice');
  const currentPriceInput = document.getElementById('currentPrice');
  const investmentDurationInput = document.getElementById('investmentDuration');
  
  const investmentAmount = parseFloat(investmentAmountInput.value.trim());
  const purchasePrice = parseFloat(purchasePriceInput.value.trim());
  const currentPrice = parseFloat(currentPriceInput.value.trim());
  const investmentDuration = parseFloat(investmentDurationInput.value.trim());
  
  const resultDiv = document.getElementById('result');
  const errorMsg = document.getElementById('errorMessage');
  const canvas = document.getElementById('goldChart');
  const tableWrapper = document.querySelector('.table-wrapper');
  
  // Clear previous results and errors
  resultDiv.innerHTML = '';
  resultDiv.classList.remove('show');
  errorMsg.innerHTML = '';
  errorMsg.classList.remove('show');
  canvas.classList.remove('show');
  tableWrapper.classList.remove('show');
  
  // Clear error states
  investmentAmountInput.classList.remove('error');
  purchasePriceInput.classList.remove('error');
  currentPriceInput.classList.remove('error');
  investmentDurationInput.classList.remove('error');

  // Validation
  const errors = [];
  
  if (!investmentAmountInput.value.trim()) {
    errors.push('Please enter investment amount');
    investmentAmountInput.classList.add('error');
  } else if (investmentAmount <= 0) {
    errors.push('Investment amount must be greater than 0');
    investmentAmountInput.classList.add('error');
  }

  if (!purchasePriceInput.value.trim()) {
    errors.push('Please enter purchase price');
    purchasePriceInput.classList.add('error');
  } else if (purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
    purchasePriceInput.classList.add('error');
  }

  if (!currentPriceInput.value.trim()) {
    errors.push('Please enter current price');
    currentPriceInput.classList.add('error');
  } else if (currentPrice <= 0) {
    errors.push('Current price must be greater than 0');
    currentPriceInput.classList.add('error');
  }

  if (!investmentDurationInput.value.trim()) {
    errors.push('Please enter investment duration');
    investmentDurationInput.classList.add('error');
  } else if (investmentDuration <= 0 || investmentDuration > 50) {
    errors.push('Investment duration should be between 1 and 50 years');
    investmentDurationInput.classList.add('error');
  }

  if (errors.length > 0) {
    errorMsg.innerHTML = errors.join('<br>');
    errorMsg.classList.add('show');
    return;
  }

  // Calculate gold quantity in grams
  const goldQuantity = investmentAmount / purchasePrice;
  
  // Calculate current value
  const currentValue = goldQuantity * currentPrice;
  
  // Calculate profit/loss
  const profitLoss = currentValue - investmentAmount;
  
  // Calculate absolute return percentage
  const absoluteReturn = ((currentValue - investmentAmount) / investmentAmount) * 100;
  
  // Calculate CAGR
  const cagr = (Math.pow(currentValue / investmentAmount, 1 / investmentDuration) - 1) * 100;

  // Display results
  let resultHTML = `
    <strong>Gold Quantity:</strong> ${goldQuantity.toFixed(2)} grams<br>
    <strong>Investment Amount:</strong> ₹${investmentAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    <strong>Current Value:</strong> ₹${currentValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    <strong>${profitLoss >= 0 ? 'Profit' : 'Loss'}:</strong> ₹${Math.abs(profitLoss).toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    <strong>Purchase Price:</strong> ₹${purchasePrice.toLocaleString('en-IN')} per gram<br>
    <strong>Current Price:</strong> ₹${currentPrice.toLocaleString('en-IN')} per gram<br>
    <strong>Price Appreciation:</strong> ${((currentPrice - purchasePrice) / purchasePrice * 100).toFixed(2)}%<br>
    <strong>Investment Duration:</strong> ${investmentDuration} years<br>
    <strong>Absolute Return:</strong> ${absoluteReturn.toFixed(2)}%<br>
    <strong>CAGR:</strong> ${cagr.toFixed(2)}% per annum
  `;

  resultDiv.innerHTML = resultHTML;
  resultDiv.classList.add('show');

  // Draw chart
  drawChart(investmentAmount, currentValue, profitLoss);

  // Generate year-wise table
  generateYearWiseTable(investmentAmount, purchasePrice, currentPrice, investmentDuration);
}

function generateYearWiseTable(investment, purchasePrice, currentPrice, years) {
  const tableBody = document.querySelector('#goldTable tbody');
  const tableWrapper = document.querySelector('.table-wrapper');
  tableBody.innerHTML = '';

  const goldQuantity = investment / purchasePrice;
  const yearlyPriceIncrease = (currentPrice - purchasePrice) / years;

  for (let year = 1; year <= years; year++) {
    const priceAtYear = purchasePrice + (yearlyPriceIncrease * year);
    const valueAtYear = goldQuantity * priceAtYear;
    const returns = valueAtYear - investment;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${year}</td>
      <td>₹${valueAtYear.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
      <td>₹${returns.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
      <td>₹${valueAtYear.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
    `;
    tableBody.appendChild(row);
  }

  tableWrapper.classList.add('show');
}

function drawChart(investment, currentValue, profit) {
  const canvas = document.getElementById('goldChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // High-DPI support
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Chart dimensions
  const padding = 60;
  const chartHeight = height - padding * 2;

  // Data
  const totalAmount = currentValue;
  const investmentRatio = investment / totalAmount;
  const profitRatio = Math.abs(profit) / totalAmount;

  // Colors
  const investmentColor = '#3b82f6';
  const profitColor = '#10b981';

  // Draw bars
  const barWidth = 80;
  const spacing = 60;
  const startX = (width - (barWidth * 2 + spacing)) / 2;

  // Investment bar
  const investmentHeight = chartHeight * investmentRatio;
  const investmentY = padding + chartHeight - investmentHeight;

  const investmentGradient = ctx.createLinearGradient(0, investmentY, 0, investmentY + investmentHeight);
  investmentGradient.addColorStop(0, investmentColor);
  investmentGradient.addColorStop(1, '#60a5fa');

  ctx.fillStyle = investmentGradient;
  ctx.fillRect(startX, investmentY, barWidth, investmentHeight);

  // Investment label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Investment', startX + barWidth / 2, investmentY - 10);
  ctx.font = '11px Inter';
  ctx.fillText('₹' + (investment / 1000).toFixed(0) + 'K', startX + barWidth / 2, investmentY - 25);

  // Profit/Current Value bar
  const profitHeight = chartHeight * profitRatio;
  const profitY = padding + chartHeight - profitHeight;

  const profitGradient = ctx.createLinearGradient(0, profitY, 0, profitY + profitHeight);
  profitGradient.addColorStop(0, profitColor);
  profitGradient.addColorStop(1, '#34d399');

  ctx.fillStyle = profitGradient;
  ctx.fillRect(startX + barWidth + spacing, profitY, barWidth, profitHeight);

  // Profit label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px Inter';
  ctx.fillText('Current Value', startX + barWidth + spacing + barWidth / 2, profitY - 10);
  ctx.font = '11px Inter';
  ctx.fillText('₹' + (currentValue / 1000).toFixed(0) + 'K', startX + barWidth + spacing + barWidth / 2, profitY - 25);
}

function resetForm() {
  document.getElementById('investmentAmount').value = '';
  document.getElementById('purchasePrice').value = '';
  document.getElementById('currentPrice').value = '';
  document.getElementById('investmentDuration').value = '';
  
  document.getElementById('result').innerHTML = '';
  document.getElementById('result').classList.remove('show');
  document.getElementById('errorMessage').innerHTML = '';
  document.getElementById('errorMessage').classList.remove('show');
  document.getElementById('goldChart').classList.remove('show');
  document.querySelector('.table-wrapper').classList.remove('show');
  
  // Clear canvas
  const canvas = document.getElementById('goldChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // Clear error states
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error');
  });
}

function downloadPDF() {
  const result = document.getElementById('result');
  if (!result.innerHTML.trim()) {
    alert('Please calculate first before downloading.');
    return;
  }
  window.print();
}
