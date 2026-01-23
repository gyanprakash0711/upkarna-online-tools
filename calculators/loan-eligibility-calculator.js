function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function updateLoanFields() {
  const loanType = document.getElementById('loan-type').value;
  const homeFields = document.getElementById('home-loan-fields');
  const carFields = document.getElementById('car-loan-fields');

  if (loanType === 'home') {
    homeFields.style.display = 'block';
    carFields.style.display = 'none';
  } else if (loanType === 'car') {
    homeFields.style.display = 'none';
    carFields.style.display = 'block';
  } else {
    homeFields.style.display = 'none';
    carFields.style.display = 'none';
  }
}

function calculateLoanEligibility() {
  const loanType = document.getElementById('loan-type').value;
  const monthlyIncome = parseFloat(document.getElementById('monthly-income').value);
  const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value);
  const existingObligations = parseFloat(document.getElementById('existing-obligations').value) || 0;
  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const loanTenure = parseFloat(document.getElementById('loan-tenure').value);
  const age = parseFloat(document.getElementById('age').value);

  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error-msg');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  // Validation
  const errors = [];
  if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
    errors.push('Please enter a valid monthly income greater than 0.');
    document.getElementById('monthly-income').classList.add('error');
  } else {
    document.getElementById('monthly-income').classList.remove('error');
  }

  if (isNaN(monthlyExpenses) || monthlyExpenses < 0) {
    errors.push('Please enter valid monthly expenses (0 or greater).');
    document.getElementById('monthly-expenses').classList.add('error');
  } else {
    document.getElementById('monthly-expenses').classList.remove('error');
  }

  if (isNaN(interestRate) || interestRate <= 0 || interestRate > 30) {
    errors.push('Please enter a valid interest rate (0-30%).');
    document.getElementById('interest-rate').classList.add('error');
  } else {
    document.getElementById('interest-rate').classList.remove('error');
  }

  if (isNaN(loanTenure) || loanTenure <= 0) {
    errors.push('Please enter a valid loan tenure greater than 0.');
    document.getElementById('loan-tenure').classList.add('error');
  } else {
    document.getElementById('loan-tenure').classList.remove('error');
  }

  if (isNaN(age) || age < 18 || age > 65) {
    errors.push('Please enter a valid age (18-65).');
    document.getElementById('age').classList.add('error');
  } else {
    document.getElementById('age').classList.remove('error');
  }

  // Loan-specific validations
  let propertyCost, downPayment, carCost, carDownPayment;
  if (loanType === 'home') {
    propertyCost = parseFloat(document.getElementById('property-cost').value);
    downPayment = parseFloat(document.getElementById('down-payment').value) || 0;

    if (isNaN(propertyCost) || propertyCost <= 0) {
      errors.push('Please enter a valid property cost greater than 0.');
      document.getElementById('property-cost').classList.add('error');
    } else {
      document.getElementById('property-cost').classList.remove('error');
    }

    if (downPayment < 0) {
      errors.push('Down payment cannot be negative.');
      document.getElementById('down-payment').classList.add('error');
    } else {
      document.getElementById('down-payment').classList.remove('error');
    }
  } else if (loanType === 'car') {
    carCost = parseFloat(document.getElementById('car-cost').value);
    carDownPayment = parseFloat(document.getElementById('car-down-payment').value) || 0;

    if (isNaN(carCost) || carCost <= 0) {
      errors.push('Please enter a valid car cost greater than 0.');
      document.getElementById('car-cost').classList.add('error');
    } else {
      document.getElementById('car-cost').classList.remove('error');
    }

    if (carDownPayment < 0) {
      errors.push('Down payment cannot be negative.');
      document.getElementById('car-down-payment').classList.add('error');
    } else {
      document.getElementById('car-down-payment').classList.remove('error');
    }
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // Calculations
  const annualIncome = monthlyIncome * 12;
  const disposableIncome = monthlyIncome - monthlyExpenses - existingObligations;

  // Maximum EMI banks typically allow (40-50% of income)
  const maxEMIPercentage = 0.45; // Conservative 45%
  const maxEMI = monthlyIncome * maxEMIPercentage - existingObligations;
  const maxEMIAffordable = Math.max(0, maxEMI);

  // Calculate maximum loan amount based on EMI affordability
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTenure * 12;

  let maxLoanAmountEMI = 0;
  if (monthlyRate > 0) {
    maxLoanAmountEMI = maxEMIAffordable * (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate;
  }

  // Loan-specific calculations
  let maxLoanAmount = maxLoanAmountEMI;
  let requiredDownPayment = 0;
  let loanToValueRatio = 0;

  if (loanType === 'home') {
    // Home loan: typically 80-90% of property value
    const maxLTV = 0.85; // 85% LTV
    const maxLoanByValue = (propertyCost - downPayment) * maxLTV;
    maxLoanAmount = Math.min(maxLoanAmountEMI, maxLoanByValue);
    requiredDownPayment = propertyCost - maxLoanAmount;
    loanToValueRatio = (maxLoanAmount / propertyCost) * 100;
  } else if (loanType === 'car') {
    // Car loan: typically 80-85% of car value
    const maxLTV = 0.85; // 85% LTV
    const maxLoanByValue = (carCost - carDownPayment) * maxLTV;
    maxLoanAmount = Math.min(maxLoanAmountEMI, maxLoanByValue);
    requiredDownPayment = carCost - maxLoanAmount;
    loanToValueRatio = (maxLoanAmount / carCost) * 100;
  } else {
    // Personal loan: based on income multiples and credit score
    // Typically 6-24 months of income
    const maxLoanByIncome = annualIncome * 2; // Conservative 2x annual income
    maxLoanAmount = Math.min(maxLoanAmountEMI, maxLoanByIncome);
  }

  // Calculate EMI for the eligible loan amount
  let eligibleEMI = 0;
  if (maxLoanAmount > 0 && monthlyRate > 0) {
    eligibleEMI = maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Debt-to-Income ratio
  const dtiRatio = ((existingObligations + eligibleEMI) / monthlyIncome) * 100;

  // Eligibility status
  let eligibilityStatus = 'Eligible';
  let statusColor = '#10b981';

  if (dtiRatio > 50) {
    eligibilityStatus = 'Not Eligible (High DTI)';
    statusColor = '#ef4444';
  } else if (dtiRatio > 45) {
    eligibilityStatus = 'Eligible with Caution';
    statusColor = '#f59e0b';
  }

  // Display results
  resultDiv.style.display = 'block';
  let resultHTML = `
    <h3>Loan Eligibility Results</h3>
    <p><strong>Loan Type:</strong> ${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan</p>
    <p><strong>Eligibility Status:</strong> <span style="color: ${statusColor};">${eligibilityStatus}</span></p>
    <p><strong>Maximum Eligible Loan Amount:</strong> ₹${maxLoanAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Monthly EMI:</strong> ₹${eligibleEMI.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Debt-to-Income Ratio:</strong> ${dtiRatio.toFixed(1)}%</p>
    <p><strong>Disposable Income:</strong> ₹${disposableIncome.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
  `;

  if (loanType === 'home' || loanType === 'car') {
    resultHTML += `
      <p><strong>Loan-to-Value Ratio:</strong> ${loanToValueRatio.toFixed(1)}%</p>
      <p><strong>Required Down Payment:</strong> ₹${requiredDownPayment.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    `;
  }

  if (eligibilityStatus.includes('Not Eligible')) {
    resultHTML += `<div class="note">Consider reducing existing obligations or increasing income to improve eligibility.</div>`;
  } else if (eligibilityStatus.includes('Caution')) {
    resultHTML += `<div class="note">Your DTI is high. Consider a longer tenure or lower loan amount.</div>`;
  } else {
    resultHTML += `<div class="note" style="background: #d1fae5; border-color: #10b981;">You are eligible for this loan amount. Consult with banks for exact terms.</div>`;
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateEligibilityTable(maxLoanAmount, eligibleEMI, dtiRatio, disposableIncome);

  // Draw chart
  drawChart(monthlyIncome, monthlyExpenses, existingObligations, eligibleEMI);
}

function generateEligibilityTable(maxLoan, emi, dti, disposableIncome) {
  const tableHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Maximum Loan Amount</td>
            <td>₹${maxLoan.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Monthly EMI</td>
            <td>₹${emi.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Debt-to-Income Ratio</td>
            <td>${dti.toFixed(1)}%</td>
          </tr>
          <tr>
            <td>Disposable Income</td>
            <td>₹${disposableIncome.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function drawChart(income, expenses, existingEMI, newEMI) {
  const canvas = document.getElementById('eligibilityChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Data
  const labels = ['Income', 'Expenses', 'Existing EMI', 'New EMI'];
  const data = [income, expenses, existingEMI, newEMI];
  const colors = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  // Calculate max value for scaling
  const maxValue = Math.max(...data);

  // Draw bars
  const barWidth = 50;
  const spacing = 70;
  const startX = 40;

  data.forEach((value, index) => {
    const x = startX + index * spacing;
    const barHeight = (value / maxValue) * (height - 100);
    const y = height - 50 - barHeight;

    // Draw bar
    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw label
    ctx.fillStyle = '#0f172a';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x + barWidth / 2, height - 30);

    // Draw value
    ctx.fillText('₹' + value.toLocaleString('en-IN', {maximumFractionDigits: 0}), x + barWidth / 2, y - 10);
  });

  // Draw title
  ctx.fillStyle = '#0f172a';
  ctx.font = '14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Income & Expense Breakdown', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('loan-eligibility-form').reset();
  document.getElementById('result').style.display = 'none';
  document.getElementById('error-msg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('error'));

  // Reset field visibility
  updateLoanFields();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateLoanEligibility);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);

  // Initialize field visibility
  updateLoanFields();
});