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

function calculateSIP() {
  // Get input values
  const monthlyInvestmentInput = document.getElementById('monthlyInvestment');
  const expectedReturnInput = document.getElementById('expectedReturn');
  const timePeriodInput = document.getElementById('timePeriod');
  
  const monthlyInvestment = parseFloat(monthlyInvestmentInput.value.trim());
  const expectedReturn = parseFloat(expectedReturnInput.value.trim());
  const timePeriod = parseFloat(timePeriodInput.value.trim());
  
  const resultDiv = document.getElementById('result');
  const errorMsg = document.getElementById('errorMsg');
  
  // Clear previous results and errors
  resultDiv.innerHTML = '';
  errorMsg.innerHTML = '';
  
  // Clear error states
  monthlyInvestmentInput.classList.remove('error');
  expectedReturnInput.classList.remove('error');
  timePeriodInput.classList.remove('error');

  // Validation
  const errors = [];
  
  if (!monthlyInvestmentInput.value.trim()) {
    errors.push('Please enter monthly investment amount');
    monthlyInvestmentInput.classList.add('error');
  } else if (monthlyInvestment <= 0) {
    errors.push('Monthly investment must be greater than 0');
    monthlyInvestmentInput.classList.add('error');
  }

  if (!expectedReturnInput.value.trim()) {
    errors.push('Please enter expected annual return rate');
    expectedReturnInput.classList.add('error');
  } else if (expectedReturn <= 0 || expectedReturn > 50) {
    errors.push('Expected return rate should be between 0 and 50%');
    expectedReturnInput.classList.add('error');
  }

  if (!timePeriodInput.value.trim()) {
    errors.push('Please enter investment period');
    timePeriodInput.classList.add('error');
  } else if (timePeriod <= 0 || timePeriod > 50) {
    errors.push('Investment period should be between 1 and 50 years');
    timePeriodInput.classList.add('error');
  }

  if (errors.length > 0) {
    errorMsg.innerHTML = `<div class="error-box">${errors.join('<br>')}</div>`;
    return;
  }

  // Calculate SIP returns
  const monthlyReturnRate = expectedReturn / 12 / 100;
  const numberOfMonths = timePeriod * 12;
  
  // Future Value formula for SIP: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
  const futureValue = monthlyInvestment * 
    (((Math.pow(1 + monthlyReturnRate, numberOfMonths) - 1) / monthlyReturnRate) * 
    (1 + monthlyReturnRate));
  
  const totalInvestment = monthlyInvestment * numberOfMonths;
  const wealthGained = futureValue - totalInvestment;

  // Display results
  let resultHTML = `
    <h3>SIP Investment Summary</h3>
    <div class="highlight-amount">
      <p><strong>Total Investment:</strong> ₹${totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
      <p><strong>Wealth Gained:</strong> ₹${wealthGained.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
      <p><strong>Expected Amount:</strong> ₹${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
    </div>
    <p><strong>Monthly SIP:</strong> ₹${monthlyInvestment.toLocaleString('en-IN')}</p>
    <p><strong>Investment Period:</strong> ${timePeriod} years (${numberOfMonths} months)</p>
    <p><strong>Expected Return Rate:</strong> ${expectedReturn}% per annum</p>
    <p><strong>Return Percentage:</strong> ${((wealthGained / totalInvestment) * 100).toFixed(2)}%</p>
  `;

  resultDiv.innerHTML = resultHTML;

  // Generate year-wise table
  generateYearWiseTable(monthlyInvestment, monthlyReturnRate, timePeriod);

  // Draw chart
  drawChart(totalInvestment, wealthGained);
}

function generateYearWiseTable(monthlyInvestment, monthlyRate, years) {
  const tableBody = document.querySelector('#sipTable tbody');
  tableBody.innerHTML = '';

  let cumulativeInvestment = 0;
  let cumulativeValue = 0;

  for (let year = 1; year <= years; year++) {
    const monthsInYear = year * 12;
    
    // Calculate value at end of this year
    cumulativeValue = monthlyInvestment * 
      (((Math.pow(1 + monthlyRate, monthsInYear) - 1) / monthlyRate) * 
      (1 + monthlyRate));
    
    cumulativeInvestment = monthlyInvestment * monthsInYear;
    const gains = cumulativeValue - cumulativeInvestment;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Year ${year}</td>
      <td>₹${cumulativeInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
      <td>₹${gains.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
      <td>₹${cumulativeValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
    `;
    tableBody.appendChild(row);
  }
}

function drawChart(totalInvestment, wealthGained) {
  const canvas = document.getElementById('sipChart');
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
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Data
  const totalAmount = totalInvestment + wealthGained;
  const investmentRatio = totalInvestment / totalAmount;
  const gainsRatio = wealthGained / totalAmount;

  // Colors
  const investmentColor = '#3b82f6';
  const gainsColor = '#10b981';

  // Draw bars
  const barWidth = 80;
  const spacing = 60;
  const startX = (width - (barWidth * 2 + spacing)) / 2;

  // Investment bar
  const investmentHeight = chartHeight * investmentRatio;
  const investmentY = padding + chartHeight - investmentHeight;

  // Gradient for investment
  const investmentGradient = ctx.createLinearGradient(0, investmentY, 0, investmentY + investmentHeight);
  investmentGradient.addColorStop(0, investmentColor);
  investmentGradient.addColorStop(1, '#60a5fa');

  ctx.fillStyle = investmentGradient;
  ctx.fillRect(startX, investmentY, barWidth, investmentHeight);

  // Gains bar
  const gainsHeight = chartHeight * gainsRatio;
  const gainsY = padding + chartHeight - gainsHeight;

  // Gradient for gains
  const gainsGradient = ctx.createLinearGradient(0, gainsY, 0, gainsY + gainsHeight);
  gainsGradient.addColorStop(0, gainsColor);
  gainsGradient.addColorStop(1, '#34d399');

  ctx.fillStyle = gainsGradient;
  ctx.fillRect(startX + barWidth + spacing, gainsY, barWidth, gainsHeight);

  // Draw values on bars
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';

  // Investment value
  const investmentText = '₹' + (totalInvestment / 100000).toFixed(1) + 'L';
  ctx.fillText(investmentText, startX + barWidth / 2, investmentY + investmentHeight / 2);

  // Gains value
  const gainsText = '₹' + (wealthGained / 100000).toFixed(1) + 'L';
  ctx.fillText(gainsText, startX + barWidth + spacing + barWidth / 2, gainsY + gainsHeight / 2);

  // Draw labels
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 14px Inter';
  ctx.textAlign = 'center';

  // Investment label
  ctx.fillText('Invested', startX + barWidth / 2, height - padding + 30);
  
  // Gains label
  ctx.fillText('Returns', startX + barWidth + spacing + barWidth / 2, height - padding + 30);

  // Draw border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, investmentY, barWidth, investmentHeight);
  ctx.strokeRect(startX + barWidth + spacing, gainsY, barWidth, gainsHeight);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('SIP Investment Breakdown', width / 2, padding - 20);
}

function resetForm() {
  document.getElementById('sipForm').reset();
  document.getElementById('result').innerHTML = '';
  document.getElementById('errorMsg').innerHTML = '';
  document.querySelector('#sipTable tbody').innerHTML = '';
  
  const canvas = document.getElementById('sipChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Remove error states
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error');
  });
}

function downloadPDF() {
  window.print();
}
