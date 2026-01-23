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

function calculateWealthGoal() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const currentSavingsElement = document.getElementById('currentSavings');
  const monthlyInvestmentElement = document.getElementById('monthlyInvestment');
  const annualReturnElement = document.getElementById('annualReturn');
  const targetAmountElement = document.getElementById('targetAmount');

  // Validation
  let errors = [];
  let currentSavings = 0, monthlyInvestment = 0, annualReturn = 0, targetAmount = 0;

  if (!currentSavingsElement.value.trim()) {
    currentSavings = 0;
  } else {
    currentSavings = parseFloat(currentSavingsElement.value);
    if (isNaN(currentSavings) || currentSavings < 0) {
      errors.push('Current savings must be a non-negative number.');
      currentSavingsElement.classList.add('error');
    } else {
      currentSavingsElement.classList.remove('error');
    }
  }

  if (!monthlyInvestmentElement.value.trim()) {
    errors.push('Please enter monthly investment.');
    monthlyInvestmentElement.classList.add('error');
  } else {
    monthlyInvestment = parseFloat(monthlyInvestmentElement.value);
    if (isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
      errors.push('Monthly investment must be a positive number.');
      monthlyInvestmentElement.classList.add('error');
    } else {
      monthlyInvestmentElement.classList.remove('error');
    }
  }

  if (!annualReturnElement.value.trim()) {
    errors.push('Please enter expected annual return.');
    annualReturnElement.classList.add('error');
  } else {
    annualReturn = parseFloat(annualReturnElement.value);
    if (isNaN(annualReturn) || annualReturn <= 0) {
      errors.push('Annual return must be a positive number.');
      annualReturnElement.classList.add('error');
    } else {
      annualReturnElement.classList.remove('error');
    }
  }

  if (!targetAmountElement.value.trim()) {
    errors.push('Please enter target amount.');
    targetAmountElement.classList.add('error');
  } else {
    targetAmount = parseFloat(targetAmountElement.value);
    if (isNaN(targetAmount) || targetAmount <= currentSavings) {
      errors.push('Target amount must be greater than current savings.');
      targetAmountElement.classList.add('error');
    } else {
      targetAmountElement.classList.remove('error');
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculate time to reach goal
  const monthlyRate = annualReturn / 100 / 12;
  const futureValue = targetAmount;
  const presentValue = currentSavings;

  // Using formula for future value of annuity: FV = PMT * [(1+r)^n - 1]/r + PV * (1+r)^n
  // Solve for n: n = log( (FV*r + PMT) / (PV*r + PMT) ) / log(1+r)

  let n = 0;
  let amount = presentValue;
  while (amount < futureValue && n < 1200) { // Max 100 years
    amount = amount * (1 + monthlyRate) + monthlyInvestment;
    n++;
  }

  const years = Math.floor(n / 12);
  const months = n % 12;

  const totalInvested = currentSavings + monthlyInvestment * n;
  const totalReturns = futureValue - totalInvested;

  // Display results
  let html = '<h3>Time to Reach Wealth Goal</h3>';
  html += '<div>Time Required: ' + years + ' years and ' + months + ' months<br>';
  html += 'Total Amount at Goal: ₹' + futureValue.toLocaleString('en-IN') + '<br>';
  html += 'Total Invested: ₹' + totalInvested.toLocaleString('en-IN') + '<br>';
  html += 'Total Returns: ₹' + totalReturns.toLocaleString('en-IN') + '</div><br>';

  // Year-by-year table (simplified)
  html += '<div class="table-wrapper"><table>';
  html += '<thead><tr><th>Year</th><th>Invested</th><th>Portfolio Value</th></tr></thead>';
  html += '<tbody>';
  let invested = currentSavings;
  let portfolio = currentSavings;
  for (let y = 1; y <= years + 1; y++) {
    invested += monthlyInvestment * 12;
    portfolio = portfolio * Math.pow(1 + annualReturn / 100, 1) + monthlyInvestment * 12;
    if (portfolio >= futureValue) {
      html += '<tr><td>' + y + '</td><td>₹' + invested.toLocaleString('en-IN') + '</td><td>₹' + portfolio.toLocaleString('en-IN') + ' (Goal Reached)</td></tr>';
      break;
    } else {
      html += '<tr><td>' + y + '</td><td>₹' + invested.toLocaleString('en-IN') + '</td><td>₹' + portfolio.toLocaleString('en-IN') + '</td></tr>';
    }
  }
  html += '</tbody></table></div>';

  // Chart
  html += '<canvas id="wealthChart" width="400" height="200"></canvas>';

  result.innerHTML = html;
  result.style.animation = 'fadeIn 0.5s ease-in';

  // Draw chart
  drawChart(years, futureValue, totalInvested);
}

function calculateRequiredInvestment() {
  // Similar validation, but calculate required monthly investment for a given time (assume 10 years or input time?)
  // For simplicity, assume time is 10 years, or add a time input. But to keep simple, let's add a time input or assume.

  // Actually, the form doesn't have time for this mode. Perhaps modify to have modes.

  // For now, let's assume a default time of 10 years for required investment calculation.

  const timeYears = 10; // Default

  // Get values
  const currentSavingsElement = document.getElementById('currentSavings');
  const annualReturnElement = document.getElementById('annualReturn');
  const targetAmountElement = document.getElementById('targetAmount');

  let currentSavings = parseFloat(currentSavingsElement.value) || 0;
  let annualReturn = parseFloat(annualReturnElement.value);
  let targetAmount = parseFloat(targetAmountElement.value);

  const monthlyRate = annualReturn / 100 / 12;
  const months = timeYears * 12;

  // Formula for required monthly PMT: PMT = [FV - PV*(1+r)^n] * r / [(1+r)^n - 1]
  const requiredMonthly = (targetAmount - currentSavings * Math.pow(1 + monthlyRate, months)) * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

  if (requiredMonthly > 0) {
    result.innerHTML = '<h3>Required Monthly Investment</h3><div>To reach ₹' + targetAmount.toLocaleString('en-IN') + ' in ' + timeYears + ' years with ' + annualReturn + '% return:<br>Monthly Investment: ₹' + requiredMonthly.toFixed(0).toLocaleString('en-IN') + '</div>';
  } else {
    result.innerHTML = '<div class="error-msg">Goal already achievable with current savings.</div>';
  }
}

function drawChart(years, target, invested) {
  const canvas = document.getElementById('wealthChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const barWidth = 60;
  const gap = 40;
  const startX = 80;

  const investedHeight = (invested / target) * (height - 60);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(startX, height - investedHeight - 40, barWidth, investedHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Total Invested', startX + barWidth/2, height - 20);
  ctx.fillText('₹' + invested.toLocaleString('en-IN'), startX + barWidth/2, height - investedHeight - 45);

  const returnsHeight = ((target - invested) / target) * (height - 60);
  const returnsX = startX + barWidth + gap;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(returnsX, height - returnsHeight - 40, barWidth, returnsHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Total Returns', returnsX + barWidth/2, height - 20);
  ctx.fillText('₹' + (target - invested).toLocaleString('en-IN'), returnsX + barWidth/2, height - returnsHeight - 45);
}

function downloadPDF() {
  window.print();
}