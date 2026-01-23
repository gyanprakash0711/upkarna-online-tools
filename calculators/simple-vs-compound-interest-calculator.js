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

function calculateInterest() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const principalElement = document.getElementById('principal');
  const rateElement = document.getElementById('rate');
  const timeElement = document.getElementById('time');
  const compoundingElement = document.getElementById('compounding');

  // Validation
  let errors = [];
  let principal, rate, time, compounding;

  if (!principalElement.value.trim()) {
    errors.push('Please enter the principal amount.');
    principalElement.classList.add('error');
  } else {
    principal = parseFloat(principalElement.value);
    if (isNaN(principal) || principal <= 0) {
      errors.push('Principal must be a positive number.');
      principalElement.classList.add('error');
    } else {
      principalElement.classList.remove('error');
    }
  }

  if (!rateElement.value.trim()) {
    errors.push('Please enter the interest rate.');
    rateElement.classList.add('error');
  } else {
    rate = parseFloat(rateElement.value);
    if (isNaN(rate) || rate <= 0) {
      errors.push('Rate must be a positive number.');
      rateElement.classList.add('error');
    } else {
      rateElement.classList.remove('error');
    }
  }

  if (!timeElement.value.trim()) {
    errors.push('Please enter the time period.');
    timeElement.classList.add('error');
  } else {
    time = parseFloat(timeElement.value);
    if (isNaN(time) || time <= 0) {
      errors.push('Time must be a positive number.');
      timeElement.classList.add('error');
    } else {
      timeElement.classList.remove('error');
    }
  }

  compounding = parseInt(compoundingElement.value);

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations
  const simpleInterest = (principal * rate * time) / 100;
  const simpleAmount = principal + simpleInterest;

  const compoundAmount = principal * Math.pow(1 + (rate / 100) / compounding, compounding * time);
  const compoundInterest = compoundAmount - principal;

  const difference = compoundInterest - simpleInterest;

  // Display results
  let html = '<h3>Interest Calculation Results</h3>';

  html += '<div><strong>Simple Interest:</strong><br>';
  html += 'Principal: ₹' + principal.toLocaleString('en-IN') + '<br>';
  html += 'Interest Earned: ₹' + simpleInterest.toLocaleString('en-IN') + '<br>';
  html += 'Total Amount: ₹' + simpleAmount.toLocaleString('en-IN') + '<br>';
  html += 'Effective Rate: ' + ((simpleInterest / principal / time) * 100).toFixed(2) + '% per annum</div><br>';

  html += '<div><strong>Compound Interest:</strong><br>';
  html += 'Principal: ₹' + principal.toLocaleString('en-IN') + '<br>';
  html += 'Interest Earned: ₹' + compoundInterest.toLocaleString('en-IN') + '<br>';
  html += 'Total Amount: ₹' + compoundAmount.toLocaleString('en-IN') + '<br>';
  html += 'Effective Rate: ' + ((compoundInterest / principal / time) * 100).toFixed(2) + '% per annum</div><br>';

  html += '<div><strong>Comparison:</strong><br>';
  html += 'Difference: ₹' + difference.toLocaleString('en-IN') + ' (Compound earns more)<br>';
  html += 'Percentage Difference: ' + ((difference / simpleInterest) * 100).toFixed(2) + '%</div><br>';

  // Year-by-year table for compound interest
  html += '<div class="table-wrapper"><table>';
  html += '<thead><tr><th>Year</th><th>Principal</th><th>Interest Earned</th><th>Total Amount</th></tr></thead>';
  html += '<tbody>';
  let currentAmount = principal;
  for (let year = 1; year <= time; year++) {
    const yearEndAmount = principal * Math.pow(1 + (rate / 100) / compounding, compounding * year);
    const yearInterest = yearEndAmount - currentAmount;
    html += '<tr><td>' + year + '</td><td>₹' + currentAmount.toLocaleString('en-IN') + '</td><td>₹' + yearInterest.toLocaleString('en-IN') + '</td><td>₹' + yearEndAmount.toLocaleString('en-IN') + '</td></tr>';
    currentAmount = yearEndAmount;
  }
  html += '</tbody></table></div>';

  // Chart
  html += '<canvas id="interestChart" width="400" height="200"></canvas>';

  result.innerHTML = html;
  result.style.animation = 'fadeIn 0.5s ease-in';

  // Draw chart
  drawChart(simpleAmount, compoundAmount);
}

function drawChart(simpleAmount, compoundAmount) {
  const canvas = document.getElementById('interestChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const maxAmount = Math.max(simpleAmount, compoundAmount);
  const barWidth = 60;
  const gap = 40;
  const startX = 80;

  // Draw bars
  const simpleBarHeight = (simpleAmount / maxAmount) * (height - 60);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(startX, height - simpleBarHeight - 40, barWidth, simpleBarHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Simple Interest', startX + barWidth/2, height - 20);
  ctx.fillText('₹' + simpleAmount.toLocaleString('en-IN'), startX + barWidth/2, height - simpleBarHeight - 45);

  const compoundBarHeight = (compoundAmount / maxAmount) * (height - 60);
  const compoundX = startX + barWidth + gap;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(compoundX, height - compoundBarHeight - 40, barWidth, compoundBarHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Compound Interest', compoundX + barWidth/2, height - 20);
  ctx.fillText('₹' + compoundAmount.toLocaleString('en-IN'), compoundX + barWidth/2, height - compoundBarHeight - 45);
}

function downloadPDF() {
  window.print();
}