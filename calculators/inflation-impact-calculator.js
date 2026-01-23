// Restrict invalid characters
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

// Attach validation
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("keypress", allowOnlyNumbers);
});

// Inflation Impact Calculation
function calculateInflationImpact() {
  // Clear previous results
  const result = document.getElementById('result');
  result.innerHTML = '';
  result.style.display = 'none';

  // Get form elements
  const currentAmountElement = document.getElementById('current-amount');
  const inflationRateElement = document.getElementById('inflation-rate');
  const timePeriodElement = document.getElementById('time-period');

  // Validation
  let errors = [];
  let currentAmount, inflationRate, timePeriod;

  if (!currentAmountElement.value.trim()) {
    errors.push("Current Amount is required. Please enter a value like 100000.");
    currentAmountElement.classList.add('error');
  } else {
    currentAmount = parseFloat(currentAmountElement.value);
    if (isNaN(currentAmount) || currentAmount <= 0) {
      errors.push("Current Amount must be a positive number greater than 0.");
      currentAmountElement.classList.add('error');
    } else {
      currentAmountElement.classList.remove('error');
    }
  }

  if (!inflationRateElement.value.trim()) {
    errors.push("Annual Inflation Rate (%) is required. Please enter a value like 6.5.");
    inflationRateElement.classList.add('error');
  } else {
    inflationRate = parseFloat(inflationRateElement.value) / 100;
    if (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 1) {
      errors.push("Annual Inflation Rate must be between 0 and 100.");
      inflationRateElement.classList.add('error');
    } else {
      inflationRateElement.classList.remove('error');
    }
  }

  if (!timePeriodElement.value.trim()) {
    errors.push("Time Period is required. Please enter a value like 10.");
    timePeriodElement.classList.add('error');
  } else {
    timePeriod = parseInt(timePeriodElement.value);
    if (isNaN(timePeriod) || timePeriod <= 0 || timePeriod > 50) {
      errors.push("Time Period must be between 1 and 50 years.");
      timePeriodElement.classList.add('error');
    } else {
      timePeriodElement.classList.remove('error');
    }
  }

  // Show errors if any
  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    result.style.display = 'block';
    return;
  }

  // Calculate inflation impact
  const futureValue = currentAmount * Math.pow(1 + inflationRate, timePeriod);
  const purchasingPowerLoss = futureValue - currentAmount;
  const realValue = currentAmount; // Current purchasing power

  // Generate year-by-year breakdown
  const yearlyData = [];
  let cumulativeAmount = currentAmount;

  for (let year = 0; year <= timePeriod; year++) {
    const requiredAmount = currentAmount * Math.pow(1 + inflationRate, year);
    const loss = requiredAmount - currentAmount;

    yearlyData.push({
      year: year,
      requiredAmount: requiredAmount,
      purchasingPowerLoss: loss,
      percentageLoss: (loss / currentAmount) * 100
    });
  }

  // Display results
  let resultHTML = `
    <h3>Inflation Impact Summary</h3>
    <p><strong>Current Amount:</strong> ₹${currentAmount.toLocaleString('en-IN')}</p>
    <p><strong>Future Amount Needed (after ${timePeriod} years):</strong> ₹${futureValue.toLocaleString('en-IN')}</p>
    <p><strong>Total Purchasing Power Loss:</strong> ₹${purchasingPowerLoss.toLocaleString('en-IN')}</p>
    <p><strong>Percentage Loss:</strong> ${((purchasingPowerLoss / currentAmount) * 100).toFixed(2)}%</p>

    <div class="chart-container">
      <canvas id="inflationChart"></canvas>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Amount Needed (₹)</th>
            <th>Purchasing Power Loss (₹)</th>
            <th>Loss (%)</th>
          </tr>
        </thead>
        <tbody>`;

  yearlyData.forEach(data => {
    resultHTML += `
          <tr>
            <td>${data.year}</td>
            <td>${data.requiredAmount.toLocaleString('en-IN')}</td>
            <td>${data.purchasingPowerLoss.toLocaleString('en-IN')}</td>
            <td>${data.percentageLoss.toFixed(2)}%</td>
          </tr>`;
  });

  resultHTML += `
        </tbody>
      </table>
    </div>

    <button class="download-btn" onclick="downloadPDF()">Download PDF Report</button>
  `;

  result.innerHTML = resultHTML;
  result.style.display = 'block';

  // Draw chart
  drawChart(yearlyData);
}

// Generate chart
function drawChart(data) {
  const canvas = document.getElementById('inflationChart');
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;

  // Calculate scales
  const maxAmount = Math.max(...data.map(d => d.requiredAmount));
  const maxLoss = Math.max(...data.map(d => d.purchasingPowerLoss));

  const xScale = (width - 2 * padding) / data.length;
  const yScaleAmount = (height - 2 * padding) / maxAmount;
  const yScaleLoss = (height - 2 * padding) / maxLoss;

  // Draw axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;

  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  // Draw amount needed line (blue)
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + index * xScale;
    const y = height - padding - (point.requiredAmount * yScaleAmount);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw purchasing power loss line (red)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + index * xScale;
    const y = height - padding - (point.purchasingPowerLoss * yScaleLoss);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Add labels
  ctx.fillStyle = '#0f172a';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';

  // X-axis labels
  for (let i = 0; i < data.length; i += Math.ceil(data.length / 10)) {
    const x = padding + i * xScale;
    ctx.fillText(data[i].year.toString(), x, height - padding + 20);
  }

  // Y-axis labels for amount
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const value = (maxAmount * i) / 5;
    const y = height - padding - (value * yScaleAmount);
    ctx.fillText('₹' + (value / 100000).toFixed(0) + 'L', padding - 10, y + 4);
  }

  // Legend
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(width - padding - 150, padding, 15, 3);
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.fillText('Amount Needed', width - padding - 130, padding + 5);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(width - padding - 150, padding + 20, 15, 3);
  ctx.fillText('Purchasing Power Loss', width - padding - 130, padding + 25);
}

// Download PDF
function downloadPDF() {
  window.print();
}

// Reset form
function resetForm() {
  // Clear all input fields manually
  document.getElementById('current-amount').value = '';
  document.getElementById('inflation-rate').value = '';
  document.getElementById('time-period').value = '';

  // Hide result section
  document.getElementById('result').style.display = 'none';

  // Remove error classes
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error');
  });

  // Focus on first input
  document.getElementById('current-amount').focus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Focus on first input
  document.getElementById('current-amount').focus();
});