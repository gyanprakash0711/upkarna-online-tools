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

function calculateSavingsPlan() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const monthlyIncomeElement = document.getElementById('monthlyIncome');
  const monthlyExpensesElement = document.getElementById('monthlyExpenses');
  const savingsGoalElement = document.getElementById('savingsGoal');
  const timeframeElement = document.getElementById('timeframe');

  // Validation
  let errors = [];
  let monthlyIncome = 0, monthlyExpenses = 0, savingsGoal = 0, timeframe = 0;

  if (!monthlyIncomeElement.value.trim()) {
    errors.push('Please enter your monthly income.');
    monthlyIncomeElement.classList.add('error');
  } else {
    monthlyIncome = parseFloat(monthlyIncomeElement.value);
    if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
      errors.push('Monthly income must be a positive number.');
      monthlyIncomeElement.classList.add('error');
    } else {
      monthlyIncomeElement.classList.remove('error');
    }
  }

  if (!monthlyExpensesElement.value.trim()) {
    errors.push('Please enter your monthly expenses.');
    monthlyExpensesElement.classList.add('error');
  } else {
    monthlyExpenses = parseFloat(monthlyExpensesElement.value);
    if (isNaN(monthlyExpenses) || monthlyExpenses < 0) {
      errors.push('Monthly expenses must be a non-negative number.');
      monthlyExpensesElement.classList.add('error');
    } else {
      monthlyExpensesElement.classList.remove('error');
    }
  }

  if (!savingsGoalElement.value.trim()) {
    errors.push('Please enter your savings goal.');
    savingsGoalElement.classList.add('error');
  } else {
    savingsGoal = parseFloat(savingsGoalElement.value);
    if (isNaN(savingsGoal) || savingsGoal <= 0) {
      errors.push('Savings goal must be a positive number.');
      savingsGoalElement.classList.add('error');
    } else {
      savingsGoalElement.classList.remove('error');
    }
  }

  if (!timeframeElement.value.trim()) {
    errors.push('Please enter the timeframe.');
    timeframeElement.classList.add('error');
  } else {
    timeframe = parseFloat(timeframeElement.value);
    if (isNaN(timeframe) || timeframe <= 0) {
      errors.push('Timeframe must be a positive number.');
      timeframeElement.classList.add('error');
    } else {
      timeframeElement.classList.remove('error');
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations
  const currentSavings = monthlyIncome - monthlyExpenses;
  const requiredMonthlySavings = savingsGoal / timeframe;

  const savingsPercentage = (requiredMonthlySavings / monthlyIncome) * 100;
  const expensePercentage = (monthlyExpenses / monthlyIncome) * 100;

  // Display results
  let html = '<h3>Your Monthly Savings Plan</h3>';

  html += '<div><strong>Budget Breakdown:</strong><br>';
  html += 'Monthly Income: ₹' + monthlyIncome.toLocaleString('en-IN') + '<br>';
  html += 'Monthly Expenses: ₹' + monthlyExpenses.toLocaleString('en-IN') + ' (' + expensePercentage.toFixed(1) + '%)<br>';
  html += 'Current Surplus: ₹' + currentSavings.toLocaleString('en-IN') + '</div><br>';

  html += '<div><strong>Savings Goal:</strong><br>';
  html += 'Target Amount: ₹' + savingsGoal.toLocaleString('en-IN') + '<br>';
  html += 'Timeframe: ' + timeframe + ' months<br>';
  html += 'Required Monthly Savings: ₹' + requiredMonthlySavings.toFixed(0).toLocaleString('en-IN') + ' (' + savingsPercentage.toFixed(1) + '% of income)</div><br>';

  if (requiredMonthlySavings > currentSavings) {
    html += '<div class="note">Note: You need to increase income or reduce expenses by ₹' + (requiredMonthlySavings - currentSavings).toFixed(0).toLocaleString('en-IN') + ' monthly to meet this goal.</div><br>';
  } else {
    html += '<div style="color: green;">Great! You can achieve this goal with your current surplus.</div><br>';
  }

  // Monthly savings tracker table
  html += '<div class="table-wrapper"><table>';
  html += '<thead><tr><th>Month</th><th>Cumulative Savings</th><th>Progress (%)</th></tr></thead>';
  html += '<tbody>';
  let cumulative = 0;
  for (let month = 1; month <= timeframe; month++) {
    cumulative += requiredMonthlySavings;
    const progress = (cumulative / savingsGoal) * 100;
    html += '<tr><td>' + month + '</td><td>₹' + cumulative.toFixed(0).toLocaleString('en-IN') + '</td><td>' + progress.toFixed(1) + '%</td></tr>';
  }
  html += '</tbody></table></div>';

  // Chart
  html += '<canvas id="savingsChart" width="400" height="200"></canvas>';

  result.innerHTML = html;
  result.style.animation = 'fadeIn 0.5s ease-in';

  // Draw chart
  drawChart(monthlyIncome, monthlyExpenses, requiredMonthlySavings);
}

function drawChart(income, expenses, savings) {
  const canvas = document.getElementById('savingsChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const total = income;
  const expensesHeight = (expenses / total) * (height - 60);
  const savingsHeight = (savings / total) * (height - 60);

  const barWidth = 60;
  const gap = 20;
  const startX = 50;

  // Expenses bar
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(startX, height - expensesHeight - 40, barWidth, expensesHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Expenses', startX + barWidth/2, height - 20);
  ctx.fillText('₹' + expenses.toLocaleString('en-IN'), startX + barWidth/2, height - expensesHeight - 45);

  // Savings bar
  const savingsX = startX + barWidth + gap;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(savingsX, height - savingsHeight - 40, barWidth, savingsHeight);
  ctx.fillStyle = '#000';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Savings', savingsX + barWidth/2, height - 20);
  ctx.fillText('₹' + savings.toLocaleString('en-IN'), savingsX + barWidth/2, height - savingsHeight - 45);
}

function downloadPDF() {
  window.print();
}