function allowOnlyNumbers(e) {
  const c = e.key;
  if (!/[0-9.]/.test(c) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(c)) {
    e.preventDefault();
  }
  if (c === "." && e.target.value.includes(".")) e.preventDefault();
}

document.querySelectorAll("input").forEach(i =>
  i.addEventListener("keypress", allowOnlyNumbers)
);

function calculatePrepayment() {
  // Clear previous results
  result.innerHTML = '';

  // Get form elements
  const loanAmountElement = document.getElementById('loanAmount');
  const interestRateElement = document.getElementById('interestRate');
  const tenureElement = document.getElementById('tenure');
  const prepayMonthsElement = document.getElementById('prepayMonths');
  const prepayAmountElement = document.getElementById('prepayAmount');

  // Validation
  let errors = [];
  let loanAmount, interestRate, tenure, prepayMonths, prepayAmount;

  if (!loanAmountElement.value.trim()) {
    errors.push("Loan Amount is required. Please enter a value like 500000.");
  } else {
    loanAmount = parseFloat(loanAmountElement.value);
    if (isNaN(loanAmount) || loanAmount <= 0) {
      errors.push("Loan Amount must be a positive number.");
    }
  }

  if (!interestRateElement.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 10.");
  } else {
    interestRate = parseFloat(interestRateElement.value) / 100;
    if (isNaN(interestRate) || interestRate <= 0) {
      errors.push("Annual Interest Rate must be a positive number.");
    }
  }

  if (!tenureElement.value.trim()) {
    errors.push("Loan Tenure (Years) is required. Please enter a value like 20.");
  } else {
    tenure = parseFloat(tenureElement.value);
    if (isNaN(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
      errors.push("Loan Tenure must be a positive integer.");
    }
  }

  if (!prepayMonthsElement.value.trim()) {
    errors.push("Months Until Prepayment is required. Please enter a value like 60.");
  } else {
    prepayMonths = parseFloat(prepayMonthsElement.value);
    if (isNaN(prepayMonths) || prepayMonths <= 0 || !Number.isInteger(prepayMonths)) {
      errors.push("Months Until Prepayment must be a positive integer.");
    }
  }

  if (!prepayAmountElement.value.trim()) {
    errors.push("Prepayment Amount is required. Please enter a value like 100000.");
  } else {
    prepayAmount = parseFloat(prepayAmountElement.value);
    if (isNaN(prepayAmount) || prepayAmount <= 0) {
      errors.push("Prepayment Amount must be a positive number.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Check if prepayMonths > total months
  const totalMonths = tenure * 12;
  if (prepayMonths > totalMonths) {
    result.innerHTML = '<div style="color: red;">Months Until Prepayment cannot exceed total loan tenure.</div>';
    return;
  }

  // Calculate original EMI
  const monthlyRate = interestRate / 12;
  const numPayments = totalMonths;
  const originalEMI = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Simulate payments to find outstanding at prepayMonths
  let outstanding = loanAmount;
  let totalInterestOriginal = 0;
  let tableData = [];
  let balanceData = [loanAmount];

  for (let month = 1; month <= Math.min(prepayMonths, 60); month++) { // Limit table to 60 months for display
    const interest = outstanding * monthlyRate;
    const principal = Math.min(originalEMI - interest, outstanding);
    const payment = interest + principal;

    totalInterestOriginal += interest;
    outstanding -= principal;

    if (month <= 60) {
      tableData.push({
        month,
        emi: payment.toFixed(2),
        principal: principal.toFixed(2),
        interest: interest.toFixed(2),
        balance: outstanding.toFixed(2)
      });
    }

    balanceData.push(outstanding);

    if (outstanding <= 0) break;
  }

  // At prepayment
  if (prepayMonths <= 60) {
    tableData.push({
      month: prepayMonths,
      emi: 'Prepayment: ₹' + prepayAmount.toFixed(2),
      principal: prepayAmount.toFixed(2),
      interest: '0.00',
      balance: (outstanding - prepayAmount).toFixed(2)
    });
  }

  outstanding -= prepayAmount;
  if (outstanding < 0) outstanding = 0;

  balanceData.push(outstanding);

  // Recalculate EMI for remaining balance and tenure
  const remainingMonths = totalMonths - prepayMonths;
  let newEMI = 0;
  let totalInterestNew = totalInterestOriginal; // Interest paid so far

  if (outstanding > 0 && remainingMonths > 0) {
    newEMI = outstanding * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);

    // Simulate remaining payments
    for (let month = prepayMonths + 1; month <= totalMonths; month++) {
      const interest = outstanding * monthlyRate;
      const principal = Math.min(newEMI - interest, outstanding);
      const payment = interest + principal;

      totalInterestNew += interest;
      outstanding -= principal;

      if (month <= prepayMonths + 60) { // Continue table for another 60 months
        tableData.push({
          month,
          emi: payment.toFixed(2),
          principal: principal.toFixed(2),
          interest: interest.toFixed(2),
          balance: outstanding.toFixed(2)
        });
      }

      balanceData.push(outstanding);

      if (outstanding <= 0) break;
    }
  }

  const totalPaidOriginal = originalEMI * numPayments;
  const totalPaidNew = (originalEMI * prepayMonths) + prepayAmount + (newEMI * (totalMonths - prepayMonths));
  const interestSaved = totalInterestOriginal - totalInterestNew;

  // Display result
  result.innerHTML = `
    <strong>Original EMI:</strong> ₹${originalEMI.toFixed(2)}<br>
    <strong>Total Amount (Original):</strong> ₹${totalPaidOriginal.toFixed(2)}<br>
    <strong>Total Interest (Original):</strong> ₹${totalInterestOriginal.toFixed(2)}<br>
    <strong>New EMI (After Prepayment):</strong> ₹${newEMI.toFixed(2)}<br>
    <strong>Total Amount (After Prepayment):</strong> ₹${totalPaidNew.toFixed(2)}<br>
    <strong>Total Interest (After Prepayment):</strong> ₹${totalInterestNew.toFixed(2)}<br>
    <strong>Interest Saved:</strong> ₹${interestSaved.toFixed(2)}
  `;

  // Table
  const tbody = document.querySelector("#prepaymentTable tbody");
  tbody.innerHTML = "";
  tableData.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.month}</td>
        <td>${row.emi}</td>
        <td>${row.principal}</td>
        <td>${row.interest}</td>
        <td>${row.balance}</td>
      </tr>
    `;
  });

  // Chart: Outstanding balance over time
  drawChart(balanceData);
}

function drawChart(data) {
  const ctx = prepaymentChart.getContext("2d");
  ctx.clearRect(0, 0, prepaymentChart.width, prepaymentChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (prepaymentChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const height = (v / max) * (prepaymentChart.height - padding * 2);
    const x = padding + i * (barWidth + 6);
    const y = prepaymentChart.height - padding - height;

    ctx.fillStyle = i === 0 ? '#2563eb' : (i === data.length - 1 ? '#10b981' : '#64748b');
    ctx.fillRect(x, y, barWidth, height);

    if (i % 10 === 0 || i === data.length - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '10px Inter';
      ctx.fillText(i.toString(), x + barWidth / 2 - 5, prepaymentChart.height - 10);
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
