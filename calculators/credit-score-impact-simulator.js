function allowOnlyNumbers(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

function updateScenarioFields() {
  const scenarioType = document.getElementById('scenario-type').value;
  const amountLabel = document.querySelector('label[for="scenario-amount"]');
  const amountInput = document.getElementById('scenario-amount');
  const helpText = amountInput.nextElementSibling;

  switch (scenarioType) {
    case 'payment':
      amountLabel.textContent = 'Payment Amount (₹)';
      amountInput.placeholder = '10000';
      helpText.textContent = 'Amount you plan to pay towards credit card debt';
      break;
    case 'new-loan':
      amountLabel.textContent = 'Loan/Credit Amount (₹)';
      amountInput.placeholder = '100000';
      helpText.textContent = 'Amount of new loan or credit limit requested';
      break;
    case 'miss-payment':
      amountLabel.textContent = 'Missed Payment Amount (₹)';
      amountInput.placeholder = '5000';
      helpText.textContent = 'Amount of the missed payment';
      break;
    case 'increase-limit':
      amountLabel.textContent = 'Limit Increase Amount (₹)';
      amountInput.placeholder = '50000';
      helpText.textContent = 'Additional credit limit requested';
      break;
    case 'pay-off':
      amountLabel.textContent = 'Pay Off Amount (₹)';
      amountInput.placeholder = '50000';
      helpText.textContent = 'Amount you plan to pay off completely';
      break;
  }
}

function simulateCreditScoreImpact() {
  const currentScore = parseFloat(document.getElementById('current-score').value);
  const creditLimit = parseFloat(document.getElementById('credit-limit').value);
  const currentUtilization = parseFloat(document.getElementById('current-utilization').value);
  const paymentHistory = document.getElementById('payment-history').value;
  const creditAge = parseFloat(document.getElementById('credit-age').value);
  const newInquiries = parseInt(document.getElementById('new-inquiries').value) || 0;
  const scenarioType = document.getElementById('scenario-type').value;
  const scenarioAmount = parseFloat(document.getElementById('scenario-amount').value);

  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error-msg');

  // Clear previous results
  resultDiv.innerHTML = '';
  errorDiv.innerHTML = '';

  // Validation
  const errors = [];
  if (isNaN(currentScore) || currentScore < 300 || currentScore > 900) {
    errors.push('Please enter a valid credit score (300-900).');
    document.getElementById('current-score').classList.add('error');
  } else {
    document.getElementById('current-score').classList.remove('error');
  }

  if (isNaN(creditLimit) || creditLimit <= 0) {
    errors.push('Please enter a valid credit limit greater than 0.');
    document.getElementById('credit-limit').classList.add('error');
  } else {
    document.getElementById('credit-limit').classList.remove('error');
  }

  if (isNaN(currentUtilization) || currentUtilization < 0) {
    errors.push('Please enter a valid current utilization (0 or greater).');
    document.getElementById('current-utilization').classList.add('error');
  } else {
    document.getElementById('current-utilization').classList.remove('error');
  }

  if (isNaN(creditAge) || creditAge < 0) {
    errors.push('Please enter a valid credit age (0 or greater).');
    document.getElementById('credit-age').classList.add('error');
  } else {
    document.getElementById('credit-age').classList.remove('error');
  }

  if (isNaN(scenarioAmount) || scenarioAmount < 0) {
    errors.push('Please enter a valid scenario amount (0 or greater).');
    document.getElementById('scenario-amount').classList.add('error');
  } else {
    document.getElementById('scenario-amount').classList.remove('error');
  }

  if (currentUtilization > creditLimit) {
    errors.push('Current utilization cannot exceed credit limit.');
    document.getElementById('current-utilization').classList.add('error');
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // Calculate current metrics
  const currentUtilizationRatio = (currentUtilization / creditLimit) * 100;

  // Payment history score impact (0-35 points)
  let paymentHistoryScore = 35;
  switch (paymentHistory) {
    case 'perfect': paymentHistoryScore = 35; break;
    case 'good': paymentHistoryScore = 30; break;
    case 'average': paymentHistoryScore = 25; break;
    case 'poor': paymentHistoryScore = 15; break;
  }

  // Credit utilization score impact (0-30 points)
  let utilizationScore = 30;
  if (currentUtilizationRatio > 70) utilizationScore = 5;
  else if (currentUtilizationRatio > 50) utilizationScore = 15;
  else if (currentUtilizationRatio > 30) utilizationScore = 25;
  else if (currentUtilizationRatio > 10) utilizationScore = 28;
  else utilizationScore = 30;

  // Credit age score impact (0-15 points)
  let ageScore = 15;
  if (creditAge > 10) ageScore = 15;
  else if (creditAge > 7) ageScore = 12;
  else if (creditAge > 3) ageScore = 9;
  else if (creditAge > 1) ageScore = 6;
  else ageScore = 3;

  // New inquiries impact (0-10 points, negative)
  let inquiryPenalty = Math.min(newInquiries * 2, 10);

  // Credit mix (assuming basic mix for simplicity)
  const mixScore = 10;

  // Calculate new score based on scenario
  let newScore = currentScore;
  let scoreChange = 0;
  let changeDescription = '';
  let recommendations = [];

  switch (scenarioType) {
    case 'payment':
      // Payment reduces utilization
      const newUtilization = Math.max(0, currentUtilization - scenarioAmount);
      const newUtilizationRatio = (newUtilization / creditLimit) * 100;

      let newUtilizationScore = 30;
      if (newUtilizationRatio > 70) newUtilizationScore = 5;
      else if (newUtilizationRatio > 50) newUtilizationScore = 15;
      else if (newUtilizationRatio > 30) newUtilizationScore = 25;
      else if (newUtilizationRatio > 10) newUtilizationScore = 28;
      else newUtilizationScore = 30;

      scoreChange = (newUtilizationScore - utilizationScore) * 3; // Utilization is 30% of score
      newScore = Math.min(900, Math.max(300, currentScore + scoreChange));
      changeDescription = `Payment of ₹${scenarioAmount.toLocaleString('en-IN')} reduces utilization from ${currentUtilizationRatio.toFixed(1)}% to ${newUtilizationRatio.toFixed(1)}%`;
      recommendations = [
        'Great choice! Reducing utilization improves your score quickly',
        'Aim to keep utilization below 30% for optimal scores',
        'This change could be reflected in 30-60 days'
      ];
      break;

    case 'new-loan':
      // New credit inquiry and potential utilization increase
      const inquiryImpact = -15; // Hard inquiry impact
      const newLimit = creditLimit + scenarioAmount;
      const newUtilizationRatioAfter = (currentUtilization / newLimit) * 100;

      let newUtilizationScoreAfter = 30;
      if (newUtilizationRatioAfter > 70) newUtilizationScoreAfter = 5;
      else if (newUtilizationRatioAfter > 50) newUtilizationScoreAfter = 15;
      else if (newUtilizationRatioAfter > 30) newUtilizationScoreAfter = 25;
      else if (newUtilizationRatioAfter > 10) newUtilizationScoreAfter = 28;
      else newUtilizationScoreAfter = 30;

      scoreChange = inquiryImpact + (newUtilizationScoreAfter - utilizationScore) * 3;
      newScore = Math.min(900, Math.max(300, currentScore + scoreChange));
      changeDescription = `New credit inquiry of ₹${scenarioAmount.toLocaleString('en-IN')} may temporarily hurt score due to hard inquiry`;
      recommendations = [
        'Hard inquiries can reduce score by 5-10 points temporarily',
        'Score should recover in 3-6 months if payments are made on time',
        'Avoid multiple inquiries within 30 days'
      ];
      break;

    case 'miss-payment':
      // Missed payment severely hurts score
      scoreChange = -50; // Significant negative impact
      newScore = Math.min(900, Math.max(300, currentScore + scoreChange));
      changeDescription = `Missing payment of ₹${scenarioAmount.toLocaleString('en-IN')} severely damages credit score`;
      recommendations = [
        'Late payments stay on record for 7 years',
        'Contact lender immediately to make payment',
        'Consider setting up automatic payments to avoid this'
      ];
      break;

    case 'increase-limit':
      // Credit limit increase reduces utilization ratio
      const newLimitAfterIncrease = creditLimit + scenarioAmount;
      const newUtilizationRatioIncrease = (currentUtilization / newLimitAfterIncrease) * 100;

      let newUtilizationScoreIncrease = 30;
      if (newUtilizationRatioIncrease > 70) newUtilizationScoreIncrease = 5;
      else if (newUtilizationRatioIncrease > 50) newUtilizationScoreIncrease = 15;
      else if (newUtilizationRatioIncrease > 30) newUtilizationScoreIncrease = 25;
      else if (newUtilizationRatioIncrease > 10) newUtilizationScoreIncrease = 28;
      else newUtilizationScoreIncrease = 30;

      scoreChange = (newUtilizationScoreIncrease - utilizationScore) * 3;
      newScore = Math.min(900, Math.max(300, currentScore + scoreChange));
      changeDescription = `Credit limit increase of ₹${scenarioAmount.toLocaleString('en-IN')} improves utilization ratio from ${currentUtilizationRatio.toFixed(1)}% to ${newUtilizationRatioIncrease.toFixed(1)}%`;
      recommendations = [
        'Credit limit increases can improve your score',
        'Use the additional limit wisely to maintain low utilization',
        'Request limit increases gradually, not all at once'
      ];
      break;

    case 'pay-off':
      // Paying off debt completely
      const newUtilizationAfterPayoff = Math.max(0, currentUtilization - scenarioAmount);
      const newUtilizationRatioPayoff = (newUtilizationAfterPayoff / creditLimit) * 100;

      let newUtilizationScorePayoff = 30;
      if (newUtilizationRatioPayoff > 70) newUtilizationScorePayoff = 5;
      else if (newUtilizationRatioPayoff > 50) newUtilizationScorePayoff = 15;
      else if (newUtilizationRatioPayoff > 30) newUtilizationScorePayoff = 25;
      else if (newUtilizationRatioPayoff > 10) newUtilizationScorePayoff = 28;
      else newUtilizationScorePayoff = 30;

      scoreChange = (newUtilizationScorePayoff - utilizationScore) * 3;
      newScore = Math.min(900, Math.max(300, currentScore + scoreChange));
      changeDescription = `Paying off ₹${scenarioAmount.toLocaleString('en-IN')} reduces utilization to ${newUtilizationRatioPayoff.toFixed(1)}%`;
      recommendations = [
        'Paying off debt is one of the best ways to improve credit score',
        'Consider paying off high-interest debts first',
        'This change should positively impact your score within 30 days'
      ];
      break;
  }

  // Display results
  resultDiv.style.display = 'block';
  const changeClass = scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral';
  const changeSymbol = scoreChange > 0 ? '+' : scoreChange < 0 ? '' : '';

  let resultHTML = `
    <h3>Credit Score Impact Simulation</h3>
    <p><strong>Current Score:</strong> ${currentScore}</p>
    <p><strong>New Score:</strong> ${newScore}</p>
    <div class="score-change ${changeClass}">Change: ${changeSymbol}${scoreChange} points</div>
    <p><strong>Scenario:</strong> ${changeDescription}</p>
  `;

  if (recommendations.length > 0) {
    resultHTML += '<div class="note"><strong>Recommendations:</strong><ul>';
    recommendations.forEach(rec => {
      resultHTML += `<li>${rec}</li>`;
    });
    resultHTML += '</ul></div>';
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateScoreFactorsTable(currentScore, newScore, scoreChange);

  // Draw chart
  drawScoreChart(currentScore, newScore);
}

function generateScoreFactorsTable(currentScore, newScore, change) {
  const tableHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Factor</th>
            <th>Current</th>
            <th>Projected</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Credit Score</td>
            <td>${currentScore}</td>
            <td>${newScore}</td>
            <td>${change > 0 ? '+' : ''}${change}</td>
          </tr>
          <tr>
            <td>Score Range</td>
            <td>${getScoreRange(currentScore)}</td>
            <td>${getScoreRange(newScore)}</td>
            <td>${getScoreRange(newScore) !== getScoreRange(currentScore) ? 'Changed' : 'Same'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function getScoreRange(score) {
  if (score >= 800) return 'Excellent (800-900)';
  if (score >= 740) return 'Very Good (740-799)';
  if (score >= 670) return 'Good (670-739)';
  if (score >= 580) return 'Fair (580-669)';
  return 'Poor (300-579)';
}

function drawScoreChart(currentScore, newScore) {
  const canvas = document.getElementById('scoreChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Data
  const labels = ['Current Score', 'Projected Score'];
  const data = [currentScore, newScore];
  const colors = ['#2563eb', newScore > currentScore ? '#10b981' : newScore < currentScore ? '#ef4444' : '#f59e0b'];

  // Draw bars
  const barWidth = 80;
  const spacing = 120;
  const startX = 80;

  data.forEach((value, index) => {
    const x = startX + index * spacing;
    const barHeight = (value / 900) * (height - 100); // Scale to max score of 900
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
    ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
  });

  // Draw title
  ctx.fillStyle = '#0f172a';
  ctx.font = '16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Credit Score Comparison', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('credit-score-form').reset();
  document.getElementById('result').style.display = 'none';
  document.getElementById('error-msg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('error'));

  // Reset scenario fields
  updateScenarioFields();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners
  document.getElementById('calculate-btn').addEventListener('click', simulateCreditScoreImpact);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);

  // Initialize scenario fields
  updateScenarioFields();
});