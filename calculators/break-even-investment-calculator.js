function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function toggleAnalysisType() {
  const analysisType = document.getElementById('analysis-type').value;
  const timeGroup = document.getElementById('time-group');

  if (analysisType === 'required-return') {
    timeGroup.style.display = 'block';
  } else {
    timeGroup.style.display = 'none';
  }
}

function calculateBreakEven() {
  // Clear previous results
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'none';

  // Get form elements
  const initialInvestmentElement = document.getElementById('initial-investment');
  const expectedReturnElement = document.getElementById('expected-return');
  const analysisTypeElement = document.getElementById('analysis-type');
  const timePeriodElement = document.getElementById('time-period');

  // Clear previous errors
  initialInvestmentElement.classList.remove('error');
  expectedReturnElement.classList.remove('error');
  timePeriodElement.classList.remove('error');

  // Get values
  const initialInvestment = parseFloat(initialInvestmentElement.value);
  const expectedReturn = parseFloat(expectedReturnElement.value);
  const analysisType = analysisTypeElement.value;
  const timePeriod = parseFloat(timePeriodElement.value);

  // Validation
  let isValid = true;
  let errorMessage = '';

  if (!initialInvestment || initialInvestment <= 0) {
    initialInvestmentElement.classList.add('error');
    isValid = false;
    errorMessage = 'Please enter a valid initial investment amount greater than 0.';
  }

  if (analysisType === 'time-to-break-even') {
    if (!expectedReturn || expectedReturn <= 0 || expectedReturn > 100) {
      expectedReturnElement.classList.add('error');
      isValid = false;
      errorMessage = 'Please enter a valid expected return rate between 0.01% and 100%.';
    }
  } else if (analysisType === 'required-return') {
    if (!timePeriod || timePeriod <= 0 || timePeriod > 50) {
      timePeriodElement.classList.add('error');
      isValid = false;
      errorMessage = 'Please enter a valid time period between 1 and 50 years.';
    }
  }

  if (!isValid) {
    alert(errorMessage);
    return;
  }

  let result = {};

  if (analysisType === 'time-to-break-even') {
    result = calculateTimeToBreakEven(initialInvestment, expectedReturn / 100);
  } else {
    result = calculateRequiredReturn(initialInvestment, timePeriod);
  }

  displayResults(result, analysisType);
}

function calculateTimeToBreakEven(initialInvestment, annualRate) {
  const maxYears = 50; // Maximum years to calculate
  let years = 0;
  let currentValue = 0;
  const yearlyData = [];

  // Calculate year by year
  while (currentValue < initialInvestment && years < maxYears) {
    years++;
    currentValue = initialInvestment * Math.pow(1 + annualRate, years);
    const profit = currentValue - initialInvestment;

    yearlyData.push({
      year: years,
      investmentValue: currentValue,
      profit: profit,
      cumulativeReturn: (profit / initialInvestment) * 100
    });
  }

  const breakEvenYear = years;
  const finalValue = currentValue;
  const totalReturn = finalValue - initialInvestment;
  const totalReturnPercent = (totalReturn / initialInvestment) * 100;

  return {
    breakEvenYear,
    finalValue,
    totalReturn,
    totalReturnPercent,
    yearlyData,
    initialInvestment,
    annualRate: annualRate * 100
  };
}

function calculateRequiredReturn(initialInvestment, years) {
  // Using compound interest formula: FV = PV * (1 + r)^n
  // We want FV = 2 * PV (to double the investment)
  // So: 2 * PV = PV * (1 + r)^n
  // 2 = (1 + r)^n
  // r = (2^(1/n)) - 1

  const requiredRate = (Math.pow(2, 1 / years) - 1) * 100;
  const finalValue = initialInvestment * 2;
  const yearlyData = [];

  let currentValue = initialInvestment;
  for (let year = 1; year <= years; year++) {
    currentValue = initialInvestment * Math.pow(1 + requiredRate / 100, year);
    const profit = currentValue - initialInvestment;

    yearlyData.push({
      year: year,
      investmentValue: currentValue,
      profit: profit,
      cumulativeReturn: (profit / initialInvestment) * 100
    });
  }

  return {
    requiredRate,
    finalValue,
    years,
    yearlyData,
    initialInvestment
  };
}

function displayResults(result, analysisType) {
  const resultDiv = document.getElementById('result');

  let html = '';

  if (analysisType === 'time-to-break-even') {
    html = `
      <h3>Break-Even Analysis Results</h3>

      <div class="summary">
        <div class="metric">
          <span class="value">${result.breakEvenYear} Years</span>
          <span class="label">Time to Break Even</span>
        </div>
        <div class="metric">
          <span class="value">₹${result.finalValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          <span class="label">Final Value</span>
        </div>
        <div class="metric">
          <span class="value">₹${result.totalReturn.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          <span class="label">Total Return</span>
        </div>
        <div class="metric">
          <span class="value">${result.totalReturnPercent.toFixed(2)}%</span>
          <span class="label">Total Return %</span>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="breakEvenChart"></canvas>
      </div>

      <h4>Year-by-Year Breakdown</h4>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Investment Value</th>
            <th>Profit</th>
            <th>Cumulative Return</th>
          </tr>
        </thead>
        <tbody>
    `;

    result.yearlyData.forEach(row => {
      html += `
        <tr>
          <td>${row.year}</td>
          <td>₹${row.investmentValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
          <td>₹${row.profit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
          <td>${row.cumulativeReturn.toFixed(2)}%</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  } else {
    html = `
      <h3>Required Return Rate Analysis</h3>

      <div class="summary">
        <div class="metric">
          <span class="value">${result.requiredRate.toFixed(2)}%</span>
          <span class="label">Required Annual Return</span>
        </div>
        <div class="metric">
          <span class="value">${result.years} Years</span>
          <span class="label">Time Period</span>
        </div>
        <div class="metric">
          <span class="value">₹${result.finalValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          <span class="label">Target Value</span>
        </div>
        <div class="metric">
          <span class="value">₹${result.initialInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          <span class="label">Initial Investment</span>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="breakEvenChart"></canvas>
      </div>

      <h4>Year-by-Year Breakdown</h4>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Investment Value</th>
            <th>Profit</th>
            <th>Cumulative Return</th>
          </tr>
        </thead>
        <tbody>
    `;

    result.yearlyData.forEach(row => {
      html += `
        <tr>
          <td>${row.year}</td>
          <td>₹${row.investmentValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
          <td>₹${row.profit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
          <td>${row.cumulativeReturn.toFixed(2)}%</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  }

  html += `
    <div class="form-actions" style="margin-top: 2rem;">
      <button type="button" onclick="downloadPDF()">Download PDF</button>
    </div>
  `;

  resultDiv.innerHTML = html;
  resultDiv.style.display = 'block';

  // Draw chart
  drawChart(result, analysisType);

  // Scroll to results
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function drawChart(result, analysisType) {
  const canvas = document.getElementById('breakEvenChart');
  const ctx = canvas.getContext('2d');

  // Clear previous chart
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const data = result.yearlyData;
  const maxValue = Math.max(...data.map(d => d.investmentValue));
  const maxYear = Math.max(...data.map(d => d.year));

  // Chart dimensions
  const padding = 60;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  // Draw axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;

  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  // Draw grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();

    // Y-axis labels
    const value = maxValue - (maxValue / 5) * i;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('₹' + value.toLocaleString('en-IN', {maximumFractionDigits: 0}), padding - 10, y + 4);
  }

  // Vertical grid lines
  for (let i = 1; i <= maxYear; i++) {
    const x = padding + (chartWidth / maxYear) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, canvas.height - padding);
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x, canvas.height - padding + 20);
  }

  // Draw line chart
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + (chartWidth / maxYear) * point.year;
    const y = padding + chartHeight - (chartHeight * point.investmentValue / maxValue);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // Draw point
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.stroke();

  // Draw break-even line
  if (analysisType === 'time-to-break-even') {
    const breakEvenY = padding + chartHeight - (chartHeight * result.initialInvestment / maxValue);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, breakEvenY);
    ctx.lineTo(canvas.width - padding, breakEvenY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Break-even label
    ctx.fillStyle = '#dc2626';
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Break-even Line', padding + 10, breakEvenY - 10);
  }

  // Axis labels
  ctx.fillStyle = '#1e293b';
  ctx.font = '14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Years', canvas.width / 2, canvas.height - 10);

  ctx.save();
  ctx.translate(20, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Investment Value (₹)', 0, 0);
  ctx.restore();
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  // Clear all inputs
  document.getElementById('initial-investment').value = '';
  document.getElementById('expected-return').value = '';
  document.getElementById('time-period').value = '';

  // Clear errors
  document.getElementById('initial-investment').classList.remove('error');
  document.getElementById('expected-return').classList.remove('error');
  document.getElementById('time-period').classList.remove('error');

  // Hide results
  document.getElementById('result').style.display = 'none';

  // Reset analysis type
  document.getElementById('analysis-type').value = 'time-to-break-even';
  toggleAnalysisType();

  // Focus first input
  document.getElementById('initial-investment').focus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add input validation
  document.getElementById('initial-investment').addEventListener('input', function() {
    allowOnlyNumbers(this);
  });

  document.getElementById('expected-return').addEventListener('input', function() {
    allowOnlyNumbers(this);
  });

  document.getElementById('time-period').addEventListener('input', function() {
    allowOnlyNumbers(this);
  });

  // Add analysis type change listener
  document.getElementById('analysis-type').addEventListener('change', toggleAnalysisType);

  // Initialize form
  toggleAnalysisType();
});