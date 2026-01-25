// Car Loan vs Lease Calculator JavaScript

// Allow only numbers in input fields
function allowOnlyNumbers(event) {
  const charCode = event.which ? event.which : event.keyCode;
  // Allow: backspace, delete, tab, escape, enter, and .
  if (charCode === 46 || charCode === 8 || charCode === 9 || charCode === 27 || charCode === 13 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true) ||
      // Allow: home, end, left, right
      (charCode >= 35 && charCode <= 39)) {
    return;
  }
  // Ensure that it is a number and stop the keypress
  if ((charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
}

// Format currency in Indian format
function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '₹0';
  
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
}

// Calculate EMI
function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const tenureMonths = tenureYears * 12;
  
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  return emi;
}

// Main calculation function
function calculateLoanVsLease() {
  // Get input values
  const carPrice = parseFloat(document.getElementById('carPrice').value);
  const downPayment = parseFloat(document.getElementById('downPayment').value);
  const loanInterestRate = parseFloat(document.getElementById('loanInterestRate').value);
  const loanTenure = parseFloat(document.getElementById('loanTenure').value);
  const leaseMonthlyPayment = parseFloat(document.getElementById('leaseMonthlyPayment').value);
  const leaseTenure = parseFloat(document.getElementById('leaseTenure').value);
  const residualValue = parseFloat(document.getElementById('residualValue').value);
  
  const errorMsg = document.getElementById('errorMsg');
  const result = document.getElementById('result');
  
  // Reset error and result
  errorMsg.style.display = 'none';
  errorMsg.innerHTML = '';
  result.style.display = 'none';
  result.innerHTML = '';
  
  // Validation
  if (!carPrice || carPrice <= 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Car Price.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!downPayment || downPayment < 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Down Payment.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (downPayment >= carPrice) {
    errorMsg.innerHTML = '⚠️ Down Payment must be less than Car Price.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!loanInterestRate || loanInterestRate <= 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Loan Interest Rate.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!loanTenure || loanTenure <= 0 || loanTenure > 10) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Loan Tenure (1-10 years).';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!leaseMonthlyPayment || leaseMonthlyPayment <= 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Lease Monthly Payment.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!leaseTenure || leaseTenure <= 0 || leaseTenure > 10) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Lease Tenure (1-10 years).';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!residualValue || residualValue < 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Residual Value.';
    errorMsg.style.display = 'block';
    return;
  }
  
  // Car Loan Calculations
  const loanAmount = carPrice - downPayment;
  const loanMonthlyEMI = calculateEMI(loanAmount, loanInterestRate, loanTenure);
  const loanTotalPayment = loanMonthlyEMI * loanTenure * 12;
  const loanTotalInterest = loanTotalPayment - loanAmount;
  const loanTotalCost = downPayment + loanTotalPayment;
  
  // Car Lease Calculations
  const leaseMonths = leaseTenure * 12;
  const leaseTotalPayment = leaseMonthlyPayment * leaseMonths;
  const leaseTotalCostWithBuyout = leaseTotalPayment + residualValue;
  
  // Comparison for same period (use loan tenure as baseline)
  let comparisonPeriod = loanTenure;
  let adjustedLeaseCost;
  
  if (leaseTenure < loanTenure) {
    // If lease is shorter, calculate multiple leases to match loan period
    const numLeases = Math.ceil(loanTenure / leaseTenure);
    adjustedLeaseCost = leaseTotalPayment * numLeases;
  } else {
    // Use lease cost for comparison period
    const monthsToCompare = loanTenure * 12;
    adjustedLeaseCost = leaseMonthlyPayment * monthsToCompare;
  }
  
  // Determine winner
  let winner;
  let savings;
  let recommendation;
  
  // For fair comparison, assume car is kept for loan tenure
  // Loan: Total cost - Car value at end
  // Lease: Just lease payments (no ownership)
  
  const carDepreciationRate = 0.15; // 15% per year average
  const carValueAfterLoanPeriod = carPrice * Math.pow(1 - carDepreciationRate, loanTenure);
  const loanNetCost = loanTotalCost - carValueAfterLoanPeriod;
  
  if (loanNetCost < adjustedLeaseCost) {
    winner = 'loan';
    savings = adjustedLeaseCost - loanNetCost;
    recommendation = `Car Loan is better! You save ${formatCurrency(savings)} over ${comparisonPeriod} years AND own a car worth ${formatCurrency(carValueAfterLoanPeriod)}.`;
  } else {
    winner = 'lease';
    savings = loanNetCost - adjustedLeaseCost;
    recommendation = `Car Lease is better! You save ${formatCurrency(savings)} over ${comparisonPeriod} years in lower monthly payments.`;
  }
  
  // Display results
  result.innerHTML = `
    <h2>Loan vs Lease Comparison Results</h2>
    
    <div class="savings-highlight">
      <div style="font-size: 1rem; opacity: 0.9;">Recommended Option</div>
      <div style="font-size: 1.5rem; font-weight: 700; margin: 8px 0;">
        ${winner === 'loan' ? '🚗 Car Loan (Buying)' : '📝 Car Lease'}
      </div>
      <div class="amount">${formatCurrency(savings)}</div>
      <div style="font-size: 0.95rem;">Savings over ${comparisonPeriod} years</div>
    </div>
    
    <div class="comparison-grid">
      <div class="option-card ${winner === 'loan' ? 'winner' : ''}">
        <h3>🚗 Car Loan</h3>
        <div class="amount">${formatCurrency(loanMonthlyEMI)}</div>
        <div class="detail">Monthly EMI</div>
        <div class="detail">Down Payment: ${formatCurrency(downPayment)}</div>
        <div class="detail">Total Interest: ${formatCurrency(loanTotalInterest)}</div>
        <div class="detail">Total Cost: ${formatCurrency(loanTotalCost)}</div>
        ${winner === 'loan' ? '<span class="winner-badge">✓ Better Option</span>' : ''}
      </div>
      
      <div class="option-card ${winner === 'lease' ? 'winner' : ''}">
        <h3>📝 Car Lease</h3>
        <div class="amount">${formatCurrency(leaseMonthlyPayment)}</div>
        <div class="detail">Monthly Payment</div>
        <div class="detail">Lease Period: ${leaseTenure} years</div>
        <div class="detail">Total Lease Cost: ${formatCurrency(leaseTotalPayment)}</div>
        <div class="detail">Buyout Cost: ${formatCurrency(residualValue)}</div>
        ${winner === 'lease' ? '<span class="winner-badge">✓ Better Option</span>' : ''}
      </div>
    </div>
    
    <h3>Detailed Car Loan Breakdown</h3>
    <table class="breakdown-table">
      <tbody>
        <tr>
          <td><strong>Car Price</strong></td>
          <td class="amount">${formatCurrency(carPrice)}</td>
        </tr>
        <tr>
          <td><strong>Down Payment</strong></td>
          <td class="amount">${formatCurrency(downPayment)}</td>
        </tr>
        <tr>
          <td><strong>Loan Amount</strong></td>
          <td class="amount">${formatCurrency(loanAmount)}</td>
        </tr>
        <tr>
          <td><strong>Interest Rate</strong></td>
          <td class="amount">${loanInterestRate}% p.a.</td>
        </tr>
        <tr>
          <td><strong>Loan Tenure</strong></td>
          <td class="amount">${loanTenure} years (${loanTenure * 12} months)</td>
        </tr>
        <tr>
          <td><strong>Monthly EMI</strong></td>
          <td class="amount">${formatCurrency(loanMonthlyEMI)}</td>
        </tr>
        <tr>
          <td><strong>Total Interest Paid</strong></td>
          <td class="amount">${formatCurrency(loanTotalInterest)}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td><strong>Total Amount Paid</strong></td>
          <td class="amount" style="font-size: 1.1rem;">${formatCurrency(loanTotalCost)}</td>
        </tr>
        <tr>
          <td><strong>Car Value After ${loanTenure} Years</strong></td>
          <td class="amount">${formatCurrency(carValueAfterLoanPeriod)}</td>
        </tr>
        <tr style="background: #eff6ff;">
          <td><strong>Net Cost (After Resale)</strong></td>
          <td class="amount" style="font-size: 1.1rem;">${formatCurrency(loanNetCost)}</td>
        </tr>
      </tbody>
    </table>
    
    <h3>Detailed Car Lease Breakdown</h3>
    <table class="breakdown-table">
      <tbody>
        <tr>
          <td><strong>Monthly Lease Payment</strong></td>
          <td class="amount">${formatCurrency(leaseMonthlyPayment)}</td>
        </tr>
        <tr>
          <td><strong>Lease Tenure</strong></td>
          <td class="amount">${leaseTenure} years (${leaseMonths} months)</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td><strong>Total Lease Payments</strong></td>
          <td class="amount" style="font-size: 1.1rem;">${formatCurrency(leaseTotalPayment)}</td>
        </tr>
        <tr>
          <td><strong>Residual Value (Buyout Price)</strong></td>
          <td class="amount">${formatCurrency(residualValue)}</td>
        </tr>
        <tr>
          <td><strong>Total Cost if You Buy After Lease</strong></td>
          <td class="amount">${formatCurrency(leaseTotalCostWithBuyout)}</td>
        </tr>
        <tr style="background: #fffbeb;">
          <td><strong>Estimated Cost for ${comparisonPeriod} Years</strong></td>
          <td class="amount" style="font-size: 1.1rem;">${formatCurrency(adjustedLeaseCost)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="info-box">
      <h3>📊 Recommendation</h3>
      <p>${recommendation}</p>
      <p><strong>Key Considerations:</strong></p>
      <ul>
        <li><strong>Loan:</strong> Higher monthly payment (${formatCurrency(loanMonthlyEMI)}) but you own the car worth ${formatCurrency(carValueAfterLoanPeriod)} after ${loanTenure} years</li>
        <li><strong>Lease:</strong> Lower monthly payment (${formatCurrency(leaseMonthlyPayment)}) but you don't own anything at lease end</li>
        <li><strong>Long-term:</strong> Buying is usually cheaper over ${loanTenure}+ years due to asset ownership</li>
        <li><strong>Flexibility:</strong> Leasing offers newer cars every ${leaseTenure} years but with mileage restrictions</li>
      </ul>
    </div>
    
    <div class="warning-box">
      <h3>⚠️ Important Notes</h3>
      <ul>
        <li>This calculation assumes ${(carDepreciationRate * 100).toFixed(0)}% annual depreciation for the car</li>
        <li>Lease costs may include additional charges for excess mileage, wear and tear</li>
        <li>Loan calculation doesn't include maintenance, insurance, and fuel costs (same for both)</li>
        <li>Your actual savings depend on how long you keep the car and driving habits</li>
        <li>Consider tax benefits if using car for business purposes</li>
      </ul>
    </div>
  `;
  
  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Download PDF function
function downloadPDF() {
  const result = document.getElementById('result');
  if (!result.innerHTML.trim()) {
    alert('Please calculate first.');
    return;
  }
  window.print();
}
