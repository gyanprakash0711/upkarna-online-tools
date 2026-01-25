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
    return true;
  }
  
  if (!/[0-9.]/.test(char)) {
    event.preventDefault();
    return false;
  }
  
  if (char === "." && event.target.value.includes(".")) {
    event.preventDefault();
    return false;
  }
}

// Attach validation to inputs
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keypress', allowOnlyNumbers);
  });
});

function calculateGratuity() {
  // Get input values
  const employeeTypeInput = document.getElementById('employeeType');
  const lastSalaryInput = document.getElementById('lastSalary');
  const yearsOfServiceInput = document.getElementById('yearsOfService');
  const monthsOfServiceInput = document.getElementById('monthsOfService');
  
  const employeeType = employeeTypeInput.value;
  const lastSalary = parseFloat(lastSalaryInput.value.trim());
  const yearsOfService = parseFloat(yearsOfServiceInput.value.trim()) || 0;
  const monthsOfService = parseFloat(monthsOfServiceInput.value.trim()) || 0;
  
  const resultDiv = document.getElementById('result');
  const errorMsg = document.getElementById('errorMsg');
  
  // Clear previous results and errors
  resultDiv.innerHTML = '';
  errorMsg.innerHTML = '';
  
  // Clear error states
  lastSalaryInput.classList.remove('error');
  yearsOfServiceInput.classList.remove('error');
  monthsOfServiceInput.classList.remove('error');
  
  // Validation
  const errors = [];
  
  if (!lastSalaryInput.value.trim()) {
    errors.push('Last drawn salary is required');
    lastSalaryInput.classList.add('error');
  } else if (lastSalary <= 0) {
    errors.push('Last drawn salary must be greater than 0');
    lastSalaryInput.classList.add('error');
  }
  
  if (!yearsOfServiceInput.value.trim()) {
    errors.push('Years of service is required');
    yearsOfServiceInput.classList.add('error');
  } else if (yearsOfService < 0) {
    errors.push('Years of service cannot be negative');
    yearsOfServiceInput.classList.add('error');
  }
  
  if (monthsOfService < 0 || monthsOfService > 11) {
    errors.push('Additional months must be between 0 and 11');
    monthsOfServiceInput.classList.add('error');
  }
  
  if (errors.length > 0) {
    errorMsg.innerHTML = errors.join('<br>');
    return;
  }
  
  // Check minimum service requirement
  if (yearsOfService < 5) {
    errorMsg.innerHTML = '⚠️ You need at least 5 years of continuous service to be eligible for gratuity. (Exception: In case of death or disability, gratuity is payable even before 5 years)';
    return;
  }
  
  // Calculate total years of service
  // Round up if months >= 6
  let totalYears = yearsOfService;
  if (monthsOfService >= 6) {
    totalYears = yearsOfService + 1;
  }
  
  // Calculate gratuity
  // Formula: (Last Salary × 15 × Years of Service) / Divisor
  // Divisor: 26 for covered, 30 for not covered
  const divisor = employeeType === 'covered' ? 26 : 30;
  let gratuityAmount = (lastSalary * 15 * totalYears) / divisor;
  
  // Maximum cap: ₹20 lakhs
  const maxGratuity = 2000000;
  const isCapped = gratuityAmount > maxGratuity;
  if (isCapped) {
    gratuityAmount = maxGratuity;
  }
  
  // Tax calculation (simplified)
  const taxExemptLimit = employeeType === 'covered' ? 2000000 : 1000000;
  let taxableAmount = 0;
  if (gratuityAmount > taxExemptLimit) {
    taxableAmount = gratuityAmount - taxExemptLimit;
  }
  
  // Display results
  const employeeTypeText = employeeType === 'covered' ? 'Covered under Payment of Gratuity Act' : 'Not covered under Act';
  
  resultDiv.innerHTML = `
    <h3>📊 Your Gratuity Calculation</h3>
    
    <div class="highlight-amount">
      <p>Gratuity Amount</p>
      <strong>₹${formatCurrency(gratuityAmount)}</strong>
    </div>
    
    <p><strong>Employee Type:</strong> ${employeeTypeText}</p>
    <p><strong>Last Drawn Salary:</strong> ₹${formatCurrency(lastSalary)}/month</p>
    <p><strong>Service Period:</strong> ${yearsOfService} years ${monthsOfService} months</p>
    <p><strong>Considered Years:</strong> ${totalYears} years ${monthsOfService >= 6 ? '(rounded up)' : ''}</p>
    <p><strong>Formula Used:</strong> (${formatCurrency(lastSalary)} × 15 × ${totalYears}) ÷ ${divisor}</p>
    
    ${isCapped ? `
    <div class="warning-box">
      ⚠️ <strong>Note:</strong> Your calculated gratuity exceeded ₹20 lakhs. As per Payment of Gratuity Act, the maximum gratuity amount is capped at ₹20,00,000.
    </div>
    ` : ''}
    
    <div class="info-box">
      <strong>💡 Tax Treatment:</strong><br>
      Tax-exempt amount: ₹${formatCurrency(taxExemptLimit)}<br>
      ${taxableAmount > 0 ? `Taxable amount: ₹${formatCurrency(taxableAmount)} (will be taxed as per your income tax slab)` : 'Your entire gratuity amount is tax-exempt! 🎉'}
    </div>
    
    <p><strong>📅 Payment Timeline:</strong> Your employer must pay gratuity within 30 days from the date it becomes due.</p>
    
    <p style="font-size: 0.85rem; color: var(--muted); margin-top: 16px;">
      <strong>Disclaimer:</strong> This is an estimate based on the Payment of Gratuity Act, 1972. Actual gratuity may vary based on company policy and specific circumstances. Consult your HR department for accurate information.
    </p>
  `;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
}

function resetForm() {
  document.getElementById('employeeType').value = 'covered';
  document.getElementById('lastSalary').value = '';
  document.getElementById('yearsOfService').value = '';
  document.getElementById('monthsOfService').value = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('errorMsg').innerHTML = '';
  
  // Clear error states
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error');
  });
}

function downloadPDF() {
  const result = document.getElementById('result');
  if (!result.innerHTML.trim()) {
    alert('Please calculate first.');
    return;
  }
  window.print();
}
