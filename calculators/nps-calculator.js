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

function calculateNPS() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const monthlyContributionElement = document.getElementById('monthlyContribution');
  const currentAgeElement = document.getElementById('currentAge');
  const retirementAgeElement = document.getElementById('retirementAge');
  const rateElement = document.getElementById('rate');

  // Validation
  let errors = [];
  let monthlyContribution, currentAge, retirementAge, rate;

  if (!monthlyContributionElement.value.trim()) {
    errors.push('Please enter monthly contribution.');
    monthlyContributionElement.classList.add('error');
  } else {
    monthlyContribution = parseFloat(monthlyContributionElement.value);
    if (monthlyContribution < 500) {
      errors.push('Monthly contribution must be at least ₹500.');
      monthlyContributionElement.classList.add('error');
    } else {
      monthlyContributionElement.classList.remove('error');
    }
  }

  if (!currentAgeElement.value.trim()) {
    errors.push('Please enter current age.');
    currentAgeElement.classList.add('error');
  } else {
    currentAge = parseInt(currentAgeElement.value);
    if (currentAge < 18 || currentAge > 65) {
      errors.push('Current age must be between 18 and 65.');
      currentAgeElement.classList.add('error');
    } else {
      currentAgeElement.classList.remove('error');
    }
  }

  if (!retirementAgeElement.value.trim()) {
    errors.push('Please enter retirement age.');
    retirementAgeElement.classList.add('error');
  } else {
    retirementAge = parseInt(retirementAgeElement.value);
    if (retirementAge < 60 || retirementAge > 70) {
      errors.push('Retirement age must be between 60 and 70.');
      retirementAgeElement.classList.add('error');
    } else {
      retirementAgeElement.classList.remove('error');
    }
  }

  if (!rateElement.value.trim()) {
    errors.push('Please enter expected annual return.');
    rateElement.classList.add('error');
  } else {
    rate = parseFloat(rateElement.value) / 100;
    if (rate <= 0 || rate > 0.20) {
      errors.push('Expected return must be between 0.01% and 20%.');
      rateElement.classList.add('error');
    } else {
      rateElement.classList.remove('error');
    }
  }

  let tenure = retirementAge - currentAge;
  if (tenure <= 0) {
    errors.push('Retirement age must be greater than current age.');
  }

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations: Simulate year by year
  let balance = 0;
  let totalContributions = 0;
  let totalInterest = 0;
  let tableData = [];
  let balanceData = [0];

  for (let year = 1; year <= tenure; year++) {
    let annualContribution = monthlyContribution * 12;
    totalContributions += annualContribution;
    balance += annualContribution;
    let interest = balance * rate;
    totalInterest += interest;
    balance += interest;
    tableData.push({
      year,
      contribution: annualContribution.toFixed(2),
      interest: interest.toFixed(2),
      balance: balance.toFixed(2)
    });
    balanceData.push(balance);
  }

  // Display result
  result.innerHTML = `
    <strong>Total Contributions:</strong> ₹${totalContributions.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}<br>
    <strong>Retirement Corpus:</strong> ₹${balance.toFixed(2)}
  `;

  // Table: Year-wise breakdown
  const tableHTML = `
    <div class="table-wrapper">
      <table id="npsTable">
        <thead>
          <tr>
            <th>Year</th>
            <th>Annual Contribution</th>
            <th>Interest Earned</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${tableData.map(row => `
            <tr>
              <td>${row.year}</td>
              <td>₹${row.contribution}</td>
              <td>₹${row.interest}</td>
              <td>₹${row.balance}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  result.innerHTML += tableHTML;

  // Chart
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  result.appendChild(canvas);
  drawChart(balanceData);
}

function drawChart(data) {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const maxValue = Math.max(...data);
  const barWidth = width / data.length;

  ctx.clearRect(0, 0, width, height);

  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * (height - 40);
    const x = index * barWidth;
    const y = height - barHeight - 20;

    // Bar
    ctx.fillStyle = index === 0 ? '#e2e8f0' : '#2563eb';
    ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

    // Label
    if (index % 5 === 0 || index === data.length - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(index === 0 ? 'Start' : `Year ${index}`, x + barWidth / 2, height - 5);
    }
  });
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert('Please calculate first.');
    return;
  }
  window.print();
}