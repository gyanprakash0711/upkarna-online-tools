function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function toggleInvestmentFields() {
  const investmentType = document.getElementById('investment-type').value;
  const sipFields = document.getElementById('sip-fields');
  const lumpsumFields = document.getElementById('lumpsum-fields');

  if (investmentType === 'sip') {
    sipFields.style.display = 'block';
    lumpsumFields.style.display = 'none';
  } else {
    sipFields.style.display = 'none';
    lumpsumFields.style.display = 'block';
  }
}

function calculateMFReturns() {
  const investmentType = document.getElementById('investment-type').value;
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error-msg');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  // Validation
  const errors = [];
  let monthlyInvestment, investmentPeriod, lumpsumAmount, lumpsumPeriod;

  if (investmentType === 'sip') {
    monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value);
    investmentPeriod = parseFloat(document.getElementById('investment-period').value);

    if (isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
      errors.push('Please enter a valid monthly investment amount greater than 0.');
      document.getElementById('monthly-investment').classList.add('error');
    } else {
      document.getElementById('monthly-investment').classList.remove('error');
    }

    if (isNaN(investmentPeriod) || investmentPeriod <= 0) {
      errors.push('Please enter a valid investment period greater than 0.');
      document.getElementById('investment-period').classList.add('error');
    } else {
      document.getElementById('investment-period').classList.remove('error');
    }
  } else {
    lumpsumAmount = parseFloat(document.getElementById('lumpsum-amount').value);
    lumpsumPeriod = parseFloat(document.getElementById('lumpsum-period').value);

    if (isNaN(lumpsumAmount) || lumpsumAmount <= 0) {
      errors.push('Please enter a valid lumpsum amount greater than 0.');
      document.getElementById('lumpsum-amount').classList.add('error');
    } else {
      document.getElementById('lumpsum-amount').classList.remove('error');
    }

    if (isNaN(lumpsumPeriod) || lumpsumPeriod <= 0) {
      errors.push('Please enter a valid investment period greater than 0.');
      document.getElementById('lumpsum-period').classList.add('error');
    } else {
      document.getElementById('lumpsum-period').classList.remove('error');
    }
  }

  const expectedReturn = parseFloat(document.getElementById('expected-return').value);
  const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 0;

  if (isNaN(expectedReturn) || expectedReturn < 0) {
    errors.push('Please enter a valid expected return rate.');
    document.getElementById('expected-return').classList.add('error');
  } else {
    document.getElementById('expected-return').classList.remove('error');
  }

  if (inflationRate < 0) {
    errors.push('Inflation rate cannot be negative.');
    document.getElementById('inflation-rate').classList.add('error');
  } else {
    document.getElementById('inflation-rate').classList.remove('error');
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // Calculations
  let totalInvested, futureValue, totalReturns, realReturns;

  if (investmentType === 'sip') {
    // SIP calculation using future value of annuity formula
    const monthlyRate = expectedReturn / 100 / 12;
    const months = investmentPeriod * 12;

    futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    totalInvested = monthlyInvestment * months;

    // Real returns (adjusted for inflation)
    const realMonthlyRate = (expectedReturn - inflationRate) / 100 / 12;
    const realFutureValue = monthlyInvestment * ((Math.pow(1 + realMonthlyRate, months) - 1) / realMonthlyRate) * (1 + realMonthlyRate);

    totalReturns = futureValue - totalInvested;
    realReturns = realFutureValue - totalInvested;

  } else {
    // Lumpsum calculation using compound interest formula
    futureValue = lumpsumAmount * Math.pow(1 + expectedReturn / 100, lumpsumPeriod);
    totalInvested = lumpsumAmount;

    // Real returns
    const realRate = (expectedReturn - inflationRate) / 100;
    const realFutureValue = lumpsumAmount * Math.pow(1 + realRate, lumpsumPeriod);

    totalReturns = futureValue - totalInvested;
    realReturns = realFutureValue - totalInvested;
  }

  // Display results
  resultDiv.style.display = 'block';
  let resultHTML = `
    <h3>Mutual Fund Returns Calculation</h3>
    <p><strong>Investment Type:</strong> ${investmentType === 'sip' ? 'SIP' : 'Lumpsum'}</p>
    <p><strong>Total Amount Invested:</strong> ₹${totalInvested.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Future Value (Nominal):</strong> ₹${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Total Returns (Nominal):</strong> ₹${totalReturns.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Absolute Returns:</strong> ${((totalReturns / totalInvested) * 100).toFixed(2)}%</p>
    <p><strong>Annualized Returns:</strong> ${expectedReturn.toFixed(2)}%</p>
  `;

  if (inflationRate > 0) {
    resultHTML += `
      <p><strong>Future Value (Real):</strong> ₹${realReturns.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
      <p><strong>Real Returns:</strong> ${((realReturns / totalInvested) * 100).toFixed(2)}%</p>
      <p><strong>Real Annualized Returns:</strong> ${(expectedReturn - inflationRate).toFixed(2)}%</p>
    `;
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateReturnsTable(totalInvested, futureValue, totalReturns, realReturns, inflationRate);

  // Draw chart
  drawChart(totalInvested, totalReturns, realReturns, inflationRate);
}

function generateReturnsTable(totalInvested, futureValue, totalReturns, realReturns, inflationRate) {
  const tableHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount (₹)</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Invested</td>
            <td>${totalInvested.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
            <td>100%</td>
          </tr>
          <tr>
            <td>Total Returns</td>
            <td>${totalReturns.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
            <td>${((totalReturns / totalInvested) * 100).toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Future Value</td>
            <td>${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
            <td>-</td>
          </tr>
          ${inflationRate > 0 ? `
          <tr>
            <td>Real Returns</td>
            <td>${realReturns.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
            <td>${((realReturns / totalInvested) * 100).toFixed(2)}%</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function drawChart(totalInvested, totalReturns, realReturns, inflationRate) {
  const canvas = document.getElementById('returnChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Data
  const labels = ['Invested Amount', 'Nominal Returns'];
  const data = [totalInvested, totalReturns];
  const colors = ['#2563eb', '#10b981'];

  if (inflationRate > 0) {
    labels.push('Real Returns');
    data.push(realReturns);
    colors.push('#f59e0b');
  }

  // Calculate total for percentages
  const total = data.reduce((sum, value) => sum + value, 0);

  // Draw bars
  const barWidth = 60;
  const spacing = 80;
  const startX = 50;

  data.forEach((value, index) => {
    const x = startX + index * spacing;
    const barHeight = (value / Math.max(...data)) * (height - 100);
    const y = height - 50 - barHeight;

    // Draw bar
    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw label
    ctx.fillStyle = '#0f172a';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x + barWidth / 2, height - 30);

    // Draw value
    ctx.fillText('₹' + value.toLocaleString('en-IN', {maximumFractionDigits: 0}), x + barWidth / 2, y - 10);
  });

  // Draw title
  ctx.fillStyle = '#0f172a';
  ctx.font = '16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Investment Returns Breakdown', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('mf-return-form').reset();
  document.getElementById('result').style.display = 'none';
  document.getElementById('error-msg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('error'));

  // Reset field visibility
  toggleInvestmentFields();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateMFReturns);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);

  // Initialize field visibility
  toggleInvestmentFields();
});