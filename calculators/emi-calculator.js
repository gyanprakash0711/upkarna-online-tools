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

// EMI Calculation
function calculateEMI() {
  // Clear previous results
  result.innerHTML = '';

  // Validation
  let errors = [];
  let loan, rate, years;

  if (!loanAmount.value.trim()) {
    errors.push("Loan Amount is required. Please enter a value like 500000.");
  } else {
    loan = parseFloat(loanAmount.value);
    if (isNaN(loan) || loan <= 0) {
      errors.push("Loan Amount must be a positive number greater than 0.");
    }
  }

  if (!interestRate.value.trim()) {
    errors.push("Interest Rate (%) is required. Please enter a value like 8.5.");
  } else {
    rate = parseFloat(interestRate.value);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      errors.push("Interest Rate (%) must be between 0 and 50.");
    }
  }

  if (!loanTenure.value.trim()) {
    errors.push("Loan Tenure (Years) is required. Please enter a value like 20.");
  } else {
    years = parseFloat(loanTenure.value);
    if (isNaN(years) || years <= 0 || years > 40) {
      errors.push("Loan Tenure (Years) must be between 1 and 40.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Proceed with calculation
  let monthlyRate = rate / 12 / 100;
  let months = years * 12;

  let emi =
    (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  let totalPayment = emi * months;
  let totalInterest = totalPayment - loan;

  result.innerHTML = `
    <strong>Monthly EMI:</strong> ₹${emi.toFixed(2)}<br>
    <strong>Total Interest:</strong> ₹${totalInterest.toFixed(2)}<br>
    <strong>Total Payment:</strong> ₹${totalPayment.toFixed(2)}
  `;
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert("Please calculate first.");
    return;
  }
  window.print();
}
