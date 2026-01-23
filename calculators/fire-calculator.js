function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function calculateFIRE() {
  const annualExpenses = parseFloat(document.getElementById('annual-expenses').value);
  const currentAge = parseFloat(document.getElementById('current-age').value);
  const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
  const monthlySavings = parseFloat(document.getElementById('monthly-savings').value);
  const expectedReturn = parseFloat(document.getElementById('expected-return').value);
  const safeWithdrawalRate = parseFloat(document.getElementById('safe-withdrawal-rate').value);
  const inflationRate = parseFloat(document.getElementById('inflation-rate').value);
  const targetFIREAge = parseFloat(document.getElementById('target-fire-age').value);

  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error-msg');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  // Validation
  const errors = [];
  if (isNaN(annualExpenses) || annualExpenses <= 0) {
    errors.push('Please enter valid annual expenses greater than 0.');
    document.getElementById('annual-expenses').classList.add('error');
  } else {
    document.getElementById('annual-expenses').classList.remove('error');
  }

  if (isNaN(currentAge) || currentAge < 18 || currentAge > 65) {
    errors.push('Please enter a valid current age (18-65).');
    document.getElementById('current-age').classList.add('error');
  } else {
    document.getElementById('current-age').classList.remove('error');
  }

  if (isNaN(monthlySavings) || monthlySavings < 0) {
    errors.push('Please enter valid monthly savings (0 or greater).');
    document.getElementById('monthly-savings').classList.add('error');
  } else {
    document.getElementById('monthly-savings').classList.remove('error');
  }

  if (isNaN(expectedReturn) || expectedReturn < 0 || expectedReturn > 30) {
    errors.push('Please enter a valid expected return rate (0-30%).');
    document.getElementById('expected-return').classList.add('error');
  } else {
    document.getElementById('expected-return').classList.remove('error');
  }

  if (isNaN(safeWithdrawalRate) || safeWithdrawalRate <= 0 || safeWithdrawalRate > 10) {
    errors.push('Please enter a valid safe withdrawal rate (0-10%).');
    document.getElementById('safe-withdrawal-rate').classList.add('error');
  } else {
    document.getElementById('safe-withdrawal-rate').classList.remove('error');
  }

  if (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 15) {
    errors.push('Please enter a valid inflation rate (0-15%).');
    document.getElementById('inflation-rate').classList.add('error');
  } else {
    document.getElementById('inflation-rate').classList.remove('error');
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // Calculations
  const withdrawalRate = safeWithdrawalRate / 100;
  const realReturnRate = (expectedReturn - inflationRate) / 100;

  // FIRE Number (current expenses)
  const fireNumber = annualExpenses / withdrawalRate;

  // FIRE Number adjusted for inflation (if target age provided)
  let adjustedFIRENumber = fireNumber;
  let yearsToTarget = 0;
  if (!isNaN(targetFIREAge) && targetFIREAge > currentAge) {
    yearsToTarget = targetFIREAge - currentAge;
    adjustedFIRENumber = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToTarget) / withdrawalRate;
  }

  // Current savings progress
  const progressPercentage = (currentSavings / fireNumber) * 100;

  // Time to reach FIRE with current savings and monthly contributions
  let yearsToFIRE = 0;
  let monthlyRate = expectedReturn / 100 / 12;
  let targetCorpus = fireNumber;

  if (monthlySavings > 0) {
    // Using future value of annuity formula to solve for time
    // FV = P * [(1+r)^n - 1]/r + PV * (1+r)^n = target
    // This is complex to solve algebraically, so we'll use numerical approximation
    yearsToFIRE = calculateYearsToFIRE(currentSavings, monthlySavings, targetCorpus, monthlyRate);
  }

  // Savings rate calculation
  const annualSavings = monthlySavings * 12;
  const annualIncome = annualSavings + annualExpenses; // Approximation
  const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

  // Coast FIRE calculation (stop saving, let investments grow)
  const coastFIRECorpus = fireNumber / Math.pow(1 + expectedReturn / 100, yearsToFIRE);

  // Display results
  resultDiv.style.display = 'block';
  let resultHTML = `
    <h3>FIRE Calculation Results</h3>
    <p><strong>Your FIRE Number:</strong> ₹${fireNumber.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Safe Annual Withdrawal:</strong> ₹${annualExpenses.toLocaleString('en-IN', {maximumFractionDigits: 2})} (${safeWithdrawalRate}% of ₹${fireNumber.toLocaleString('en-IN', {maximumFractionDigits: 2})})</p>
    <p><strong>Current Progress:</strong> ₹${currentSavings.toLocaleString('en-IN', {maximumFractionDigits: 2})} (${progressPercentage.toFixed(1)}% of FIRE number)</p>
    <p><strong>Your Savings Rate:</strong> ${savingsRate.toFixed(1)}%</p>
  `;

  if (yearsToFIRE > 0 && yearsToFIRE < 50) {
    resultHTML += `<p><strong>Years to FIRE:</strong> ${yearsToFIRE.toFixed(1)} years (at age ${(currentAge + yearsToFIRE).toFixed(1)})</p>`;
  }

  if (!isNaN(targetFIREAge) && targetFIREAge > currentAge) {
    resultHTML += `
      <p><strong>Adjusted FIRE Number (at age ${targetFIREAge}):</strong> ₹${adjustedFIRENumber.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
      <p><strong>Coast FIRE Corpus:</strong> ₹${coastFIRECorpus.toLocaleString('en-IN', {maximumFractionDigits: 2})} (save this now, stop saving)</p>
    `;
  }

  // FIRE category
  let fireCategory = '';
  if (savingsRate >= 70) fireCategory = 'Extreme FIRE (70%+)';
  else if (savingsRate >= 50) fireCategory = 'Lean FIRE (50-70%)';
  else if (savingsRate >= 25) fireCategory = 'Fat FIRE (25-50%)';
  else fireCategory = 'Slow FIRE (25% or less)';

  resultHTML += `<p><strong>FIRE Category:</strong> ${fireCategory}</p>`;

  if (progressPercentage >= 100) {
    resultHTML += `<div class="note" style="background: #d1fae5; border-color: #10b981;">Congratulations! You've achieved FIRE!</div>`;
  } else if (progressPercentage >= 75) {
    resultHTML += `<div class="note">You're getting close to FIRE! Keep up the great work.</div>`;
  } else {
    resultHTML += `<div class="note">Keep saving and investing consistently to reach your FIRE goals.</div>`;
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateFIRETable(fireNumber, currentSavings, annualSavings, yearsToFIRE);

  // Draw chart
  drawChart(fireNumber, currentSavings, fireNumber - currentSavings);
}

function calculateYearsToFIRE(presentValue, monthlySavings, targetCorpus, monthlyRate) {
  // Numerical approximation to solve for n in the compound interest formula
  // FV = P * (1+r)^n + PMT * [(1+r)^n - 1]/r

  let years = 0;
  let corpus = presentValue;
  const annualSavings = monthlySavings * 12;
  const annualRate = monthlyRate * 12;

  while (corpus < targetCorpus && years < 50) {
    corpus = corpus * (1 + annualRate) + annualSavings;
    years += 1;
  }

  return years;
}

function generateFIRETable(fireNumber, currentSavings, annualSavings, yearsToFIRE) {
  const remaining = fireNumber - currentSavings;
  const monthlyGap = remaining > 0 && yearsToFIRE > 0 ? remaining / (yearsToFIRE * 12) : 0;

  const tableHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>FIRE Number</td>
            <td>${fireNumber.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Current Savings</td>
            <td>${currentSavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Remaining Amount</td>
            <td>${remaining.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Annual Savings</td>
            <td>${annualSavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          ${monthlyGap > 0 ? `
          <tr>
            <td>Monthly Gap</td>
            <td>${monthlyGap.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function drawChart(fireNumber, currentSavings, remaining) {
  const canvas = document.getElementById('fireChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Data
  const labels = ['Current Savings', 'Remaining to FIRE'];
  const data = [currentSavings, remaining];
  const colors = ['#10b981', '#ef4444'];

  // Calculate max value for scaling
  const maxValue = Math.max(...data);

  // Draw bars
  const barWidth = 80;
  const spacing = 120;
  const startX = 60;

  data.forEach((value, index) => {
    const x = startX + index * spacing;
    const barHeight = (value / maxValue) * (height - 100);
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
  ctx.fillText('FIRE Progress', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('fire-form').reset();
  document.getElementById('result').style.display = 'none';
  document.getElementById('error-msg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove('error'));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateFIRE);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);
});