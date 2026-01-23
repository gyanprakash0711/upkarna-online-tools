function allowOnlyNumbers(e) {
  const c = e.key;
  if (!/[0-9.]/.test(c) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(c)) {
    e.preventDefault();
  }
  if (c === "." && e.target.value.includes(".")) {
    e.preventDefault();
  }
}

document.querySelectorAll("input").forEach(i =>
  i.addEventListener("keypress", allowOnlyNumbers)
);

function calculateTax() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const annualIncomeElement = document.getElementById('annualIncome');
  const deductionsElement = document.getElementById('deductions');
  const regimeElement = document.getElementById('regime');

  // Validation
  let errors = [];
  let annualIncome = 0, deductions = 0, regime = regimeElement.value;

  if (!annualIncomeElement.value.trim()) {
    errors.push('Please enter your annual income.');
    annualIncomeElement.classList.add('error');
  } else {
    annualIncome = parseFloat(annualIncomeElement.value);
    if (isNaN(annualIncome) || annualIncome <= 0) {
      errors.push('Annual income must be a positive number.');
      annualIncomeElement.classList.add('error');
    } else {
      annualIncomeElement.classList.remove('error');
    }
  }

  if (!deductionsElement.value.trim()) {
    deductions = 0;
  } else {
    deductions = parseFloat(deductionsElement.value);
    if (isNaN(deductions) || deductions < 0) {
      errors.push('Deductions must be a non-negative number.');
      deductionsElement.classList.add('error');
    } else {
      deductionsElement.classList.remove('error');
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculate taxable income
  let taxableIncomeOld = Math.max(0, annualIncome - deductions);
  let taxableIncomeNew = Math.max(0, annualIncome - 50000); // Standard deduction in new regime

  // Calculate tax for old regime
  let taxOld = calculateTaxAmount(taxableIncomeOld, 'old');
  let cessOld = taxOld * 0.04;
  let totalTaxOld = taxOld + cessOld;

  // Calculate tax for new regime
  let taxNew = calculateTaxAmount(taxableIncomeNew, 'new');
  let cessNew = taxNew * 0.04;
  let totalTaxNew = taxNew + cessNew;

  // Display results
  let html = '<h3>Tax Calculation Results</h3>';

  if (regime === 'both' || regime === 'old') {
    html += '<div><strong>Old Regime:</strong><br>';
    html += 'Taxable Income: ₹' + taxableIncomeOld.toLocaleString('en-IN') + '<br>';
    html += 'Income Tax: ₹' + taxOld.toLocaleString('en-IN') + '<br>';
    html += 'Cess (4%): ₹' + cessOld.toLocaleString('en-IN') + '<br>';
    html += 'Total Tax: ₹' + totalTaxOld.toLocaleString('en-IN') + '<br>';
    html += 'Effective Rate: ' + ((totalTaxOld / annualIncome) * 100).toFixed(2) + '%</div><br>';
  }

  if (regime === 'both' || regime === 'new') {
    html += '<div><strong>New Regime:</strong><br>';
    html += 'Taxable Income: ₹' + taxableIncomeNew.toLocaleString('en-IN') + '<br>';
    html += 'Income Tax: ₹' + taxNew.toLocaleString('en-IN') + '<br>';
    html += 'Cess (4%): ₹' + cessNew.toLocaleString('en-IN') + '<br>';
    html += 'Total Tax: ₹' + totalTaxNew.toLocaleString('en-IN') + '<br>';
    html += 'Effective Rate: ' + ((totalTaxNew / annualIncome) * 100).toFixed(2) + '%</div><br>';
  }

  if (regime === 'both') {
    let savings = totalTaxOld - totalTaxNew;
    html += '<div><strong>Comparison:</strong><br>';
    html += 'Tax Savings with New Regime: ₹' + Math.abs(savings).toLocaleString('en-IN') + ' (' + (savings > 0 ? 'New regime saves more' : 'Old regime saves more') + ')</div>';
  }

  // Tax slabs table
  html += '<div class="table-wrapper"><table>';
  html += '<thead><tr><th>Income Range</th><th>Old Regime Rate</th><th>New Regime Rate</th></tr></thead>';
  html += '<tbody>';
  html += '<tr><td>Up to ₹2.5 lakh</td><td>0%</td><td>0%</td></tr>';
  html += '<tr><td>₹2.5L - ₹5L</td><td>5%</td><td>0%</td></tr>';
  html += '<tr><td>₹5L - ₹10L</td><td>20%</td><td>5%</td></tr>';
  html += '<tr><td>Above ₹10L</td><td>30%</td><td>15% (₹9L-12L), 20% (₹12L-15L), 30% (above)</td></tr>';
  html += '</tbody></table></div>';

  // Chart
  html += '<canvas id="taxChart" width="400" height="200"></canvas>';

  result.innerHTML = html;
  result.style.animation = 'fadeIn 0.5s ease-in';

  // Draw chart
  drawChart(totalTaxOld, totalTaxNew, regime);
}

function calculateTaxAmount(taxableIncome, regime) {
  let tax = 0;

  if (regime === 'old') {
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.3;
      taxableIncome = 1000000;
    }
    if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.2;
      taxableIncome = 500000;
    }
    if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05;
    }
  } else if (regime === 'new') {
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.3;
      taxableIncome = 1500000;
    }
    if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.2;
      taxableIncome = 1200000;
    }
    if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.15;
      taxableIncome = 900000;
    }
    if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.1;
      taxableIncome = 600000;
    }
    if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }
  }

  return tax;
}

function drawChart(taxOld, taxNew, regime) {
  const canvas = document.getElementById('taxChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const maxTax = Math.max(taxOld, taxNew, 1);
  const barWidth = 60;
  const gap = 40;
  const startX = 50;

  // Draw bars
  if (regime === 'both' || regime === 'old') {
    const barHeightOld = (taxOld / maxTax) * (height - 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(startX, height - barHeightOld - 40, barWidth, barHeightOld);
    ctx.fillStyle = '#000';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Old Regime', startX + barWidth/2, height - 20);
    ctx.fillText('₹' + taxOld.toLocaleString('en-IN'), startX + barWidth/2, height - barHeightOld - 45);
  }

  if (regime === 'both' || regime === 'new') {
    const barHeightNew = (taxNew / maxTax) * (height - 60);
    const xPos = regime === 'both' ? startX + barWidth + gap : startX;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(xPos, height - barHeightNew - 40, barWidth, barHeightNew);
    ctx.fillStyle = '#000';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('New Regime', xPos + barWidth/2, height - 20);
    ctx.fillText('₹' + taxNew.toLocaleString('en-IN'), xPos + barWidth/2, height - barHeightNew - 45);
  }
}

function downloadPDF() {
  window.print();
}