function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function calculateRetirementPlan() {
  const currentAge = parseFloat(document.getElementById('current-age').value);
  const retirementAge = parseFloat(document.getElementById('retirement-age').value);
  const lifeExpectancy = parseFloat(document.getElementById('life-expectancy').value);
  const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value);
  const inflationRate = parseFloat(document.getElementById('inflation-rate').value);
  const expectedReturn = parseFloat(document.getElementById('expected-return').value);
  const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
  const monthlySavings = parseFloat(document.getElementById('monthly-savings').value);
  const existingPension = parseFloat(document.getElementById('existing-pension').value) || 0;
  const retirementExpenseRatio = parseFloat(document.getElementById('retirement-expense-ratio').value) / 100;

  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error-msg');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  // Validation
  const errors = [];
  if (isNaN(currentAge) || currentAge < 18 || currentAge >= retirementAge) {
    errors.push('Please enter a valid current age (18 or above, less than retirement age).');
    document.getElementById('current-age').classList.add('error');
  } else {
    document.getElementById('current-age').classList.remove('error');
  }

  if (isNaN(retirementAge) || retirementAge <= currentAge || retirementAge > 70) {
    errors.push('Please enter a valid retirement age (greater than current age, up to 70).');
    document.getElementById('retirement-age').classList.add('error');
  } else {
    document.getElementById('retirement-age').classList.remove('error');
  }

  if (isNaN(lifeExpectancy) || lifeExpectancy <= retirementAge) {
    errors.push('Please enter a valid life expectancy (greater than retirement age).');
    document.getElementById('life-expectancy').classList.add('error');
  } else {
    document.getElementById('life-expectancy').classList.remove('error');
  }

  if (isNaN(monthlyExpenses) || monthlyExpenses <= 0) {
    errors.push('Please enter valid monthly expenses greater than 0.');
    document.getElementById('monthly-expenses').classList.add('error');
  } else {
    document.getElementById('monthly-expenses').classList.remove('error');
  }

  if (isNaN(inflationRate) || inflationRate < 0) {
    errors.push('Please enter a valid inflation rate (0 or greater).');
    document.getElementById('inflation-rate').classList.add('error');
  } else {
    document.getElementById('inflation-rate').classList.remove('error');
  }

  if (isNaN(expectedReturn) || expectedReturn < 0) {
    errors.push('Please enter a valid expected return rate (0 or greater).');
    document.getElementById('expected-return').classList.add('error');
  } else {
    document.getElementById('expected-return').classList.remove('error');
  }

  if (isNaN(monthlySavings) || monthlySavings < 0) {
    errors.push('Please enter valid monthly savings (0 or greater).');
    document.getElementById('monthly-savings').classList.add('error');
  } else {
    document.getElementById('monthly-savings').classList.remove('error');
  }

  if (isNaN(retirementExpenseRatio) || retirementExpenseRatio <= 0 || retirementExpenseRatio > 2) {
    errors.push('Please enter a valid retirement expense ratio (1-200%).');
    document.getElementById('retirement-expense-ratio').classList.add('error');
  } else {
    document.getElementById('retirement-expense-ratio').classList.remove('error');
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // Calculations
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  // Monthly expenses at retirement (adjusted for inflation and expense ratio)
  const monthlyExpensesAtRetirement = monthlyExpenses * retirementExpenseRatio * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Annual expenses at retirement
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

  // Net monthly expenses after pension
  const netMonthlyExpenses = Math.max(0, monthlyExpensesAtRetirement - existingPension);

  // Required retirement corpus using 4% rule (adjusted for inflation)
  const requiredCorpus = (annualExpensesAtRetirement / 0.04) * Math.pow(1 + inflationRate / 100, yearsInRetirement / 2);

  // Future value of current savings
  const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

  // Future value of monthly savings (SIP)
  const monthlyRate = expectedReturn / 100 / 12;
  const months = yearsToRetirement * 12;
  const futureValueMonthlySavings = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

  // Total corpus at retirement
  const totalCorpusAtRetirement = futureValueCurrentSavings + futureValueMonthlySavings;

  // Gap analysis
  const corpusGap = Math.max(0, requiredCorpus - totalCorpusAtRetirement);
  const additionalMonthlySavings = corpusGap > 0 ?
    (corpusGap * (expectedReturn / 100 / 12)) / ((Math.pow(1 + expectedReturn / 100 / 12, months) - 1) / (expectedReturn / 100 / 12)) : 0;

  // Display results
  resultDiv.style.display = 'block';
  let resultHTML = `
    <h3>Retirement Planning Results</h3>
    <p><strong>Years to Retirement:</strong> ${yearsToRetirement} years</p>
    <p><strong>Years in Retirement:</strong> ${yearsInRetirement} years</p>
    <p><strong>Monthly Expenses at Retirement:</strong> ₹${monthlyExpensesAtRetirement.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Net Monthly Expenses (after pension):</strong> ₹${netMonthlyExpenses.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Required Retirement Corpus:</strong> ₹${requiredCorpus.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Future Value of Current Savings:</strong> ₹${futureValueCurrentSavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Future Value of Monthly Savings:</strong> ₹${futureValueMonthlySavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Total Corpus at Retirement:</strong> ₹${totalCorpusAtRetirement.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
  `;

  if (corpusGap > 0) {
    resultHTML += `
      <p><strong>Corpus Gap:</strong> ₹${corpusGap.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
      <p><strong>Additional Monthly Savings Needed:</strong> ₹${additionalMonthlySavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
      <div class="note">You need to increase your monthly savings to bridge the gap.</div>
    `;
  } else {
    resultHTML += `<div class="note" style="background: #d1fae5; border-color: #10b981;">Great! You're on track to meet your retirement goals.</div>`;
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateRetirementTable(requiredCorpus, totalCorpusAtRetirement, corpusGap, monthlyExpensesAtRetirement, netMonthlyExpenses);

  // Draw chart
  drawChart(requiredCorpus, totalCorpusAtRetirement, corpusGap);
}

function generateRetirementTable(requiredCorpus, totalCorpus, gap, monthlyExpenses, netMonthlyExpenses) {
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
            <td>Required Corpus</td>
            <td>${requiredCorpus.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Projected Corpus</td>
            <td>${totalCorpus.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Gap</td>
            <td>${gap.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Monthly Expenses at Retirement</td>
            <td>${monthlyExpenses.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Net Monthly Expenses</td>
            <td>${netMonthlyExpenses.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function drawChart(requiredCorpus, totalCorpus, gap) {
  const canvas = document.getElementById('retirementChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Data
  const labels = ['Required Corpus', 'Projected Corpus'];
  const data = [requiredCorpus, totalCorpus];
  const colors = ['#ef4444', '#10b981'];

  if (gap > 0) {
    labels.push('Gap');
    data.push(gap);
    colors.push('#f59e0b');
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...data);

  // Draw bars
  const barWidth = 60;
  const spacing = 80;
  const startX = 50;

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
  ctx.fillText('Retirement Corpus Analysis', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('retirement-form').reset();
  document.getElementById('result').style.display = 'none';
  document.getElementById('error-msg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove('error'));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateRetirementPlan);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);
});