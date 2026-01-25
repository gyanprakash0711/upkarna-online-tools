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

function calculate80D() {
  // Get input values
  const selfPremiumInput = document.getElementById('selfPremium');
  const selfAgeInput = document.getElementById('selfAge');
  const parentsPremiumInput = document.getElementById('parentsPremium');
  const parentsAgeInput = document.getElementById('parentsAge');
  const preventiveCheckupInput = document.getElementById('preventiveCheckup');

  const selfPremium = parseFloat(selfPremiumInput.value.trim()) || 0;
  const selfAge = selfAgeInput.value;
  const parentsPremium = parseFloat(parentsPremiumInput.value.trim()) || 0;
  const parentsAge = parentsAgeInput.value;
  const preventiveCheckup = parseFloat(preventiveCheckupInput.value.trim()) || 0;

  const resultDiv = document.getElementById('result');
  const errorMsg = document.getElementById('errorMessage');
  
  // Clear previous results and errors
  resultDiv.innerHTML = '';
  resultDiv.classList.remove('show');
  errorMsg.innerHTML = '';
  errorMsg.classList.remove('show');
  
  // Clear error states
  selfPremiumInput.classList.remove('error');
  parentsPremiumInput.classList.remove('error');
  preventiveCheckupInput.classList.remove('error');

  // Validation
  const errors = [];

  if (selfPremium < 0) {
    errors.push('Self premium cannot be negative');
    selfPremiumInput.classList.add('error');
  }

  if (parentsPremium < 0) {
    errors.push('Parents premium cannot be negative');
    parentsPremiumInput.classList.add('error');
  }

  if (preventiveCheckup < 0) {
    errors.push('Preventive checkup amount cannot be negative');
    preventiveCheckupInput.classList.add('error');
  }

  if (preventiveCheckup > 5000) {
    errors.push('Preventive health checkup deduction is limited to ₹5,000');
    preventiveCheckupInput.classList.add('error');
  }

  if (selfPremium === 0 && parentsPremium === 0 && preventiveCheckup === 0) {
    errors.push('Please enter at least one premium or checkup amount');
    selfPremiumInput.classList.add('error');
  }

  if (errors.length > 0) {
    errorMsg.innerHTML = errors.join('<br>');
    errorMsg.classList.add('show');
    return;
  }

  // Calculate deduction limits
  const selfLimit = selfAge === 'above60' ? 50000 : 25000;
  const parentsLimit = parentsAge === 'above60' ? 50000 : 25000;

  // Calculate allowed deduction for self (includes preventive checkup within limit)
  const selfAllowedPremium = Math.min(selfPremium, selfLimit);
  const selfTotal = Math.min(selfPremium + preventiveCheckup, selfLimit);
  const selfDeduction = selfTotal;

  // Calculate allowed deduction for parents
  const parentsDeduction = Math.min(parentsPremium, parentsLimit);

  // Total deduction
  const totalDeduction = selfDeduction + parentsDeduction;

  // Tax savings (assuming 30% tax bracket - highest slab)
  const taxSaved30 = totalDeduction * 0.30;
  const taxSaved20 = totalDeduction * 0.20;
  const taxSaved10 = totalDeduction * 0.10;
  const taxSaved5 = totalDeduction * 0.05;

  // Display results
  let resultHTML = `
    <strong>Section 80D Deduction Summary</strong><br><br>
    <strong>Self/Family Deduction:</strong><br>
    Premium Paid: ₹${selfPremium.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    Preventive Checkup: ₹${preventiveCheckup.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    Allowed Deduction: ₹${selfDeduction.toLocaleString('en-IN', {maximumFractionDigits: 0})} (Limit: ₹${selfLimit.toLocaleString('en-IN')})<br><br>
    <strong>Parents Deduction:</strong><br>
    Premium Paid: ₹${parentsPremium.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    Allowed Deduction: ₹${parentsDeduction.toLocaleString('en-IN', {maximumFractionDigits: 0})} (Limit: ₹${parentsLimit.toLocaleString('en-IN')})<br><br>
    <strong>Total Section 80D Deduction: ₹${totalDeduction.toLocaleString('en-IN', {maximumFractionDigits: 0})}</strong><br><br>
    <strong>Estimated Tax Savings:</strong><br>
    5% Tax Bracket: ₹${taxSaved5.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    10% Tax Bracket: ₹${taxSaved10.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    20% Tax Bracket: ₹${taxSaved20.toLocaleString('en-IN', {maximumFractionDigits: 0})}<br>
    30% Tax Bracket: ₹${taxSaved30.toLocaleString('en-IN', {maximumFractionDigits: 0})}
  `;

  // Add notes if any amount exceeds limit
  if (selfPremium + preventiveCheckup > selfLimit) {
    resultHTML += `<br><br><strong>Note:</strong> Your self/family premium + checkup (₹${(selfPremium + preventiveCheckup).toLocaleString('en-IN')}) exceeds the limit of ₹${selfLimit.toLocaleString('en-IN')}. Only ₹${selfLimit.toLocaleString('en-IN')} is deductible.`;
  }

  if (parentsPremium > parentsLimit) {
    resultHTML += `<br><br><strong>Note:</strong> Your parents' premium (₹${parentsPremium.toLocaleString('en-IN')}) exceeds the limit of ₹${parentsLimit.toLocaleString('en-IN')}. Only ₹${parentsLimit.toLocaleString('en-IN')} is deductible.`;
  }

  resultHTML += `<br><br><small style="color: #64748b;">Note: Section 80D is not available in the new tax regime. You must opt for the old regime to claim this deduction. Tax savings shown are estimates based on different tax brackets.</small>`;

  resultDiv.innerHTML = resultHTML;
  resultDiv.classList.add('show');
}

function downloadPDF() {
  const result = document.getElementById('result');
  if (!result.innerHTML.trim()) {
    alert('Please calculate Section 80D deduction first before downloading.');
    return;
  }
  window.print();
}
