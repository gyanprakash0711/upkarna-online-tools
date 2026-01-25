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

// Format currency in Indian format
function formatCurrency(num) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// Calculate salary hike
function calculateHike() {
  // Get input values
  const oldSalaryInput = document.getElementById('oldSalary');
  const newSalaryInput = document.getElementById('newSalary');
  const salaryTypeInput = document.getElementById('salaryType');
  const errorMsg = document.getElementById('errorMsg');
  const result = document.getElementById('result');

  // Clear previous results and errors
  errorMsg.textContent = '';
  errorMsg.classList.remove('show');
  result.innerHTML = '';
  result.classList.remove('show');

  // Remove error styling
  oldSalaryInput.classList.remove('error');
  newSalaryInput.classList.remove('error');

  // Validation
  let errors = [];

  const oldSalary = parseFloat(oldSalaryInput.value);
  const newSalary = parseFloat(newSalaryInput.value);
  const salaryType = salaryTypeInput.value;

  if (!oldSalaryInput.value || oldSalaryInput.value.trim() === '') {
    errors.push('Please enter old/current salary');
    oldSalaryInput.classList.add('error');
  } else if (isNaN(oldSalary) || oldSalary <= 0) {
    errors.push('Old salary must be a positive number');
    oldSalaryInput.classList.add('error');
  }

  if (!newSalaryInput.value || newSalaryInput.value.trim() === '') {
    errors.push('Please enter new/offered salary');
    newSalaryInput.classList.add('error');
  } else if (isNaN(newSalary) || newSalary <= 0) {
    errors.push('New salary must be a positive number');
    newSalaryInput.classList.add('error');
  }

  if (errors.length > 0) {
    errorMsg.innerHTML = errors.join('<br>');
    errorMsg.classList.add('show');
    return;
  }

  // Additional validation: new salary should be different from old
  if (newSalary === oldSalary) {
    errorMsg.textContent = 'New salary cannot be the same as old salary. There is no hike or decrement.';
    errorMsg.classList.add('show');
    newSalaryInput.classList.add('error');
    return;
  }

  // Calculate hike metrics
  const absoluteHike = newSalary - oldSalary;
  const hikePercentage = (absoluteHike / oldSalary) * 100;
  
  // Determine if it's a hike or decrement
  const isHike = absoluteHike > 0;
  const changeType = isHike ? 'Hike' : 'Decrement';
  
  // Calculate monthly/annual values based on salary type
  let monthlyOld, monthlyNew, monthlyIncrease;
  let annualOld, annualNew, annualIncrease;
  
  if (salaryType === 'annual') {
    annualOld = oldSalary;
    annualNew = newSalary;
    annualIncrease = absoluteHike;
    monthlyOld = oldSalary / 12;
    monthlyNew = newSalary / 12;
    monthlyIncrease = absoluteHike / 12;
  } else {
    monthlyOld = oldSalary;
    monthlyNew = newSalary;
    monthlyIncrease = absoluteHike;
    annualOld = oldSalary * 12;
    annualNew = newSalary * 12;
    annualIncrease = absoluteHike * 12;
  }

  // Determine hike quality
  let hikeQuality = '';
  let hikeColor = '';
  const absPercentage = Math.abs(hikePercentage);
  
  if (isHike) {
    if (absPercentage >= 30) {
      hikeQuality = 'Excellent';
      hikeColor = '#10b981';
    } else if (absPercentage >= 20) {
      hikeQuality = 'Very Good';
      hikeColor = '#3b82f6';
    } else if (absPercentage >= 15) {
      hikeQuality = 'Good';
      hikeColor = '#8b5cf6';
    } else if (absPercentage >= 10) {
      hikeQuality = 'Average';
      hikeColor = '#f59e0b';
    } else if (absPercentage >= 5) {
      hikeQuality = 'Below Average';
      hikeColor = '#ef4444';
    } else {
      hikeQuality = 'Very Low';
      hikeColor = '#dc2626';
    }
  } else {
    hikeQuality = 'Salary Decrease';
    hikeColor = '#dc2626';
  }

  // Generate result HTML
  let resultHTML = `
    <h2>${changeType} Calculation Results</h2>
    
    <div class="highlight-amount" style="border-left-color: ${hikeColor};">
      <p>${changeType} Percentage</p>
      <strong style="color: ${hikeColor};">${hikePercentage >= 0 ? '+' : ''}${hikePercentage.toFixed(2)}%</strong>
      <p style="margin-top: 8px; font-weight: 600; color: ${hikeColor};">${hikeQuality}</p>
    </div>

    <div class="highlight-amount">
      <p>Absolute ${changeType} Amount (${salaryType === 'annual' ? 'Annual' : 'Monthly'})</p>
      <strong>${absoluteHike >= 0 ? '+' : ''}${formatCurrency(Math.abs(absoluteHike))}</strong>
    </div>

    <h3>Salary Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Old Salary</th>
          <th>New Salary</th>
          <th>${changeType}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Monthly</strong></td>
          <td>${formatCurrency(monthlyOld)}</td>
          <td>${formatCurrency(monthlyNew)}</td>
          <td style="color: ${hikeColor}; font-weight: 600;">${monthlyIncrease >= 0 ? '+' : ''}${formatCurrency(Math.abs(monthlyIncrease))}</td>
        </tr>
        <tr>
          <td><strong>Annual</strong></td>
          <td>${formatCurrency(annualOld)}</td>
          <td>${formatCurrency(annualNew)}</td>
          <td style="color: ${hikeColor}; font-weight: 600;">${annualIncrease >= 0 ? '+' : ''}${formatCurrency(Math.abs(annualIncrease))}</td>
        </tr>
      </tbody>
    </table>

    <h3>${changeType} Analysis</h3>
    <table>
      <tbody>
        <tr>
          <td><strong>Old Salary (Annual)</strong></td>
          <td>${formatCurrency(annualOld)}</td>
        </tr>
        <tr>
          <td><strong>New Salary (Annual)</strong></td>
          <td>${formatCurrency(annualNew)}</td>
        </tr>
        <tr>
          <td><strong>${changeType} Percentage</strong></td>
          <td style="color: ${hikeColor}; font-weight: 600;">${hikePercentage >= 0 ? '+' : ''}${hikePercentage.toFixed(2)}%</td>
        </tr>
        <tr>
          <td><strong>${changeType} Quality</strong></td>
          <td style="color: ${hikeColor}; font-weight: 600;">${hikeQuality}</td>
        </tr>
        <tr>
          <td><strong>Monthly ${changeType}</strong></td>
          <td style="font-weight: 600;">${monthlyIncrease >= 0 ? '+' : ''}${formatCurrency(Math.abs(monthlyIncrease))}</td>
        </tr>
        <tr>
          <td><strong>Annual ${changeType}</strong></td>
          <td style="font-weight: 600;">${annualIncrease >= 0 ? '+' : ''}${formatCurrency(Math.abs(annualIncrease))}</td>
        </tr>
      </tbody>
    </table>

    ${isHike ? `
    <h3>Recommendations</h3>
    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 16px;">
      ${absPercentage >= 25 ? `
        <p style="margin: 0; color: #0c4a6e;">
          <strong>Excellent ${changeType}!</strong> This ${hikePercentage.toFixed(2)}% increase (${formatCurrency(Math.abs(annualIncrease))} annually) is well above market standards. 
          ${salaryType === 'annual' ? 'Make sure to check your in-hand salary increase using our In-Hand Salary Calculator.' : ''}
          Consider investing the additional income wisely through SIP, EPF, or other tax-saving instruments.
        </p>
      ` : absPercentage >= 15 ? `
        <p style="margin: 0; color: #0c4a6e;">
          <strong>Good ${changeType}!</strong> This ${hikePercentage.toFixed(2)}% increase is respectable. 
          Plan your finances to utilize the extra ${formatCurrency(Math.abs(monthlyIncrease))} monthly income effectively.
          ${salaryType === 'annual' ? 'Verify the actual in-hand salary increase to understand real benefit.' : ''}
        </p>
      ` : absPercentage >= 10 ? `
        <p style="margin: 0; color: #0c4a6e;">
          <strong>Average ${changeType}.</strong> This ${hikePercentage.toFixed(2)}% increase is in line with standard increments. 
          After considering inflation (~6-7%), your real income growth is around ${(absPercentage - 6.5).toFixed(1)}%.
          ${salaryType === 'annual' ? 'Calculate in-hand salary to see actual monthly benefit.' : ''}
        </p>
      ` : absPercentage >= 5 ? `
        <p style="margin: 0; color: #0c4a6e;">
          <strong>Below Average ${changeType}.</strong> This ${hikePercentage.toFixed(2)}% increase barely covers inflation.
          Consider negotiating for better terms or exploring other opportunities for career growth.
          Focus on skill development and document your achievements for next appraisal.
        </p>
      ` : `
        <p style="margin: 0; color: #0c4a6e;">
          <strong>Very Low ${changeType}.</strong> This ${hikePercentage.toFixed(2)}% increase is significantly below inflation.
          Your real purchasing power may actually decrease. Consider having a conversation with your manager about 
          performance expectations and career growth opportunities, or explore job market for better offers.
        </p>
      `}
    </div>
    ` : `
    <h3>Alert</h3>
    <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #dc2626;">
      <p style="margin: 0; color: #7f1d1d;">
        <strong>Salary Decrease Detected!</strong> Your salary is decreasing by ${Math.abs(hikePercentage).toFixed(2)}% 
        (${formatCurrency(Math.abs(annualIncrease))} annually). This is unusual and concerning. 
        Carefully evaluate the reasons and consider if this change aligns with your career goals.
      </p>
    </div>
    `}

    <canvas id="salaryChart" width="400" height="300"></canvas>
  `;

  result.innerHTML = resultHTML;
  result.classList.add('show');

  // Draw comparison chart
  drawSalaryChart(monthlyOld, monthlyNew, monthlyIncrease, isHike);
}

// Draw salary comparison chart
function drawSalaryChart(monthlyOld, monthlyNew, monthlyIncrease, isHike) {
  const canvas = document.getElementById('salaryChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Chart settings
  const barWidth = 80;
  const maxValue = Math.max(monthlyOld, monthlyNew) * 1.2;
  const chartHeight = height - 80;
  const startY = 50;
  
  // Colors
  const oldColor = '#94a3b8';
  const newColor = isHike ? '#10b981' : '#dc2626';
  const oldGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  oldGradient.addColorStop(0, '#94a3b8');
  oldGradient.addColorStop(1, '#64748b');
  
  const newGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  if (isHike) {
    newGradient.addColorStop(0, '#10b981');
    newGradient.addColorStop(1, '#059669');
  } else {
    newGradient.addColorStop(0, '#dc2626');
    newGradient.addColorStop(1, '#b91c1c');
  }
  
  // Draw bars
  const bar1X = width / 2 - barWidth - 20;
  const bar2X = width / 2 + 20;
  
  const bar1Height = (monthlyOld / maxValue) * chartHeight;
  const bar2Height = (monthlyNew / maxValue) * chartHeight;
  
  // Old salary bar
  ctx.fillStyle = oldGradient;
  ctx.fillRect(bar1X, startY + chartHeight - bar1Height, barWidth, bar1Height);
  
  // New salary bar
  ctx.fillStyle = newGradient;
  ctx.fillRect(bar2X, startY + chartHeight - bar2Height, barWidth, bar2Height);
  
  // Draw values on bars
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';
  
  const formatValue = (val) => {
    if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
    if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + 'k';
    return '₹' + val.toFixed(0);
  };
  
  ctx.fillText(formatValue(monthlyOld), bar1X + barWidth / 2, startY + chartHeight - bar1Height - 10);
  ctx.fillText(formatValue(monthlyNew), bar2X + barWidth / 2, startY + chartHeight - bar2Height - 10);
  
  // Draw labels
  ctx.font = '500 12px Inter';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Old Salary', bar1X + barWidth / 2, height - 40);
  ctx.fillText('New Salary', bar2X + barWidth / 2, height - 40);
  
  // Draw hike arrow and percentage
  if (monthlyIncrease !== 0) {
    const arrowStartY = startY + chartHeight - bar1Height - 30;
    const arrowEndY = startY + chartHeight - bar2Height - 30;
    const arrowX = width / 2;
    
    ctx.strokeStyle = isHike ? '#10b981' : '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowStartY);
    ctx.lineTo(arrowX, arrowEndY);
    ctx.stroke();
    
    // Arrow head
    const arrowSize = 8;
    ctx.beginPath();
    if (isHike) {
      ctx.moveTo(arrowX, arrowEndY);
      ctx.lineTo(arrowX - arrowSize, arrowEndY + arrowSize);
      ctx.lineTo(arrowX + arrowSize, arrowEndY + arrowSize);
    } else {
      ctx.moveTo(arrowX, arrowEndY);
      ctx.lineTo(arrowX - arrowSize, arrowEndY - arrowSize);
      ctx.lineTo(arrowX + arrowSize, arrowEndY - arrowSize);
    }
    ctx.closePath();
    ctx.fillStyle = isHike ? '#10b981' : '#dc2626';
    ctx.fill();
    
    // Percentage text
    const hikePercentage = (monthlyIncrease / monthlyOld) * 100;
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = isHike ? '#10b981' : '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText(
      (hikePercentage >= 0 ? '+' : '') + hikePercentage.toFixed(1) + '%',
      arrowX,
      (arrowStartY + arrowEndY) / 2
    );
  }
  
  // Title
  ctx.font = 'bold 16px Inter';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText('Monthly Salary Comparison', width / 2, 25);
}

// Download PDF
function downloadPDF() {
  window.print();
}
