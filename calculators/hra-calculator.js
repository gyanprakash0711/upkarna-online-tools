// HRA Calculator JavaScript

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

// Main calculation function
function calculateHRA() {
  // Get input values
  const cityType = document.getElementById('cityType').value;
  const basicSalary = parseFloat(document.getElementById('basicSalary').value);
  const hraReceived = parseFloat(document.getElementById('hraReceived').value);
  const rentPaid = parseFloat(document.getElementById('rentPaid').value);
  
  const errorMsg = document.getElementById('errorMsg');
  const result = document.getElementById('result');
  
  // Reset error and result
  errorMsg.style.display = 'none';
  errorMsg.innerHTML = '';
  result.style.display = 'none';
  result.innerHTML = '';
  
  // Validation
  if (!basicSalary || basicSalary <= 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Basic Salary amount.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!hraReceived || hraReceived < 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid HRA Received amount.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (!rentPaid || rentPaid < 0) {
    errorMsg.innerHTML = '⚠️ Please enter a valid Rent Paid amount.';
    errorMsg.style.display = 'block';
    return;
  }
  
  if (rentPaid === 0) {
    errorMsg.innerHTML = '⚠️ You cannot claim HRA exemption if you are not paying any rent.';
    errorMsg.style.display = 'block';
    return;
  }
  
  // Calculate HRA exemption
  // Component 1: Actual HRA received
  const actualHRA = hraReceived;
  
  // Component 2: 50% of basic (metro) or 40% of basic (non-metro)
  const percentage = cityType === 'metro' ? 0.50 : 0.40;
  const percentageOfSalary = basicSalary * percentage;
  
  // Component 3: Rent paid - 10% of basic salary
  const tenPercentOfSalary = basicSalary * 0.10;
  const rentMinusTenPercent = rentPaid - tenPercentOfSalary;
  
  // HRA Exemption is MINIMUM of three components
  let hraExemption = Math.min(actualHRA, percentageOfSalary, rentMinusTenPercent);
  
  // Exemption cannot be negative
  if (hraExemption < 0) {
    hraExemption = 0;
  }
  
  // Taxable HRA
  const taxableHRA = actualHRA - hraExemption;
  
  // Annual amounts
  const annualExemption = hraExemption * 12;
  const annualTaxable = taxableHRA * 12;
  
  // Display results
  result.innerHTML = `
    <h2>HRA Calculation Results</h2>
    
    <div class="result-summary">
      <div class="result-row">
        <span>Monthly HRA Exemption:</span>
        <span><strong>${formatCurrency(hraExemption)}</strong></span>
      </div>
      <div class="result-row">
        <span>Monthly Taxable HRA:</span>
        <span><strong>${formatCurrency(taxableHRA)}</strong></span>
      </div>
      <div class="result-row">
        <span>Annual HRA Exemption:</span>
        <span><strong>${formatCurrency(annualExemption)}</strong></span>
      </div>
    </div>
    
    <h3>Detailed Breakdown</h3>
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Component</th>
          <th class="amount">Monthly Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>1. Actual HRA Received</strong>
            <div class="label">HRA component in your salary</div>
          </td>
          <td class="amount">${formatCurrency(actualHRA)}</td>
        </tr>
        <tr>
          <td>
            <strong>2. ${percentage * 100}% of Basic Salary</strong>
            <div class="label">${cityType === 'metro' ? '50% for Metro City' : '40% for Non-Metro City'}</div>
          </td>
          <td class="amount">${formatCurrency(percentageOfSalary)}</td>
        </tr>
        <tr>
          <td>
            <strong>3. Rent Paid - 10% of Basic</strong>
            <div class="label">${formatCurrency(rentPaid)} - ${formatCurrency(tenPercentOfSalary)}</div>
          </td>
          <td class="amount">${formatCurrency(rentMinusTenPercent)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="info-box">
      <h3>📌 Understanding Your HRA Exemption</h3>
      <p><strong>HRA Exemption = Minimum of above 3 components = ${formatCurrency(hraExemption)}/month</strong></p>
      <p>This means <strong>${formatCurrency(hraExemption)}</strong> per month (or <strong>${formatCurrency(annualExemption)}</strong> annually) is exempt from tax.</p>
      <p>The remaining <strong>${formatCurrency(taxableHRA)}</strong> per month will be added to your taxable income.</p>
    </div>
    
    <div class="warning-box">
      <h3>⚠️ Important Notes:</h3>
      <ul>
        <li>Keep all rent receipts and rental agreement as proof</li>
        <li>If annual rent exceeds ₹1,00,000, provide landlord's PAN to employer</li>
        <li>HRA exemption is available only under Old Tax Regime</li>
        <li>Submit rent receipts to your employer for claiming exemption</li>
        <li>This calculation is based on Section 10(13A) of Income Tax Act</li>
      </ul>
    </div>
    
    <h3>Tax Savings Calculation</h3>
    <table class="breakdown-table">
      <tbody>
        <tr>
          <td><strong>Annual HRA Exemption</strong></td>
          <td class="amount">${formatCurrency(annualExemption)}</td>
        </tr>
        <tr>
          <td>
            <strong>Estimated Tax Savings (at 30% tax rate)</strong>
            <div class="label">Actual savings depend on your tax slab</div>
          </td>
          <td class="amount">${formatCurrency(annualExemption * 0.30)}</td>
        </tr>
        <tr>
          <td>
            <strong>Estimated Tax Savings (at 20% tax rate)</strong>
            <div class="label">For 20% tax slab</div>
          </td>
          <td class="amount">${formatCurrency(annualExemption * 0.20)}</td>
        </tr>
        <tr>
          <td>
            <strong>Estimated Tax Savings (at 10% tax rate)</strong>
            <div class="label">For 10% tax slab (Old Regime)</div>
          </td>
          <td class="amount">${formatCurrency(annualExemption * 0.10)}</td>
        </tr>
      </tbody>
    </table>
  `;
  
  result.style.display = 'block';
  
  // Scroll to result
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset form function
function resetForm() {
  document.getElementById('cityType').value = 'metro';
  document.getElementById('basicSalary').value = '';
  document.getElementById('hraReceived').value = '';
  document.getElementById('rentPaid').value = '';
  document.getElementById('errorMsg').style.display = 'none';
  document.getElementById('errorMsg').innerHTML = '';
  document.getElementById('result').style.display = 'none';
  document.getElementById('result').innerHTML = '';
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
