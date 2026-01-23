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

function calculateEPF() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const monthlyContributionElement = document.getElementById('monthlyContribution');
  const rateElement = document.getElementById('rate');
  const tenureElement = document.getElementById('tenure');

  // Validation
  let errors = [];
  let monthlyContribution, rate, tenure;

  if (!monthlyContributionElement.value.trim()) {
    errors.push('Please enter monthly contribution.');
    monthlyContributionElement.classList.add('error');
  } else {
    monthlyContribution = parseFloat(monthlyContributionElement.value);
    if (monthlyContribution <= 0) {
      errors.push('Monthly contribution must be greater than 0.');
      monthlyContributionElement.classList.add('error');
    } else {
      monthlyContributionElement.classList.remove('error');
    }
  }

  if (!rateElement.value.trim()) {
    errors.push('Please enter annual interest rate.');
    rateElement.classList.add('error');
  } else {
    rate = parseFloat(rateElement.value);
    if (rate <= 0 || rate > 20) {
      errors.push('Interest rate must be between 0.01% and 20%.');
      rateElement.classList.add('error');
    } else {
      rateElement.classList.remove('error');
    }
  }

  if (!tenureElement.value.trim()) {
    errors.push('Please enter tenure.');
    tenureElement.classList.add('error');
  } else {
    tenure = parseInt(tenureElement.value);
    if (tenure < 1 || tenure > 50) {
      errors.push('Tenure must be between 1 and 50 years.');
      tenureElement.classList.add('error');
    } else {
      tenureElement.classList.remove('error');
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div class="error-msg">' + errors.join('<br>') + '</div>';
    return;
  }

  // Calculations: Simulate year by year
  let balance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  let tableData = [];
  let balanceData = [0];

  for (let year = 1; year <= tenure; year++) {
    let annualDeposit = monthlyContribution * 12;
    totalDeposits += annualDeposit;
    balance += annualDeposit;
    let interest = balance * (rate / 100);
    totalInterest += interest;
    balance += interest;
    tableData.push({
      year,
      deposit: annualDeposit.toFixed(2),
      interest: interest.toFixed(2),
      balance: balance.toFixed(2)
    });
    balanceData.push(balance);
  }

  // Display result
  result.innerHTML = `
    <strong>Total Deposits:</strong> ₹${totalDeposits.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${totalInterest.toFixed(2)}<br>
    <strong>Maturity Amount:</strong> ₹${balance.toFixed(2)}
  `;

  // Table: Year-wise breakdown
  const tableHTML = `
    <div class="table-wrapper">
      <table id="epfTable">
        <thead>
          <tr>
            <th>Year</th>
            <th>Annual Deposit</th>
            <th>Interest Earned</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${tableData.map(row => `
            <tr>
              <td>${row.year}</td>
              <td>₹${row.deposit}</td>
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