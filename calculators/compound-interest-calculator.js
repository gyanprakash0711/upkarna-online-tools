function allowOnlyNumbers(event) {
  const char = event.key;
  if (!/[0-9.]/.test(char) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(char)) {
    event.preventDefault();
  }
  if (char === "." && event.target.value.includes(".")) event.preventDefault();
}

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("keypress", allowOnlyNumbers);
});

function calculateCI() {
  // Clear previous results
  result.innerHTML = '';

  // Validation
  let errors = [];
  let P, r, t, n;

  if (!principal.value.trim()) {
    errors.push("Initial Investment is required. Please enter a value like 100000.");
  } else {
    P = parseFloat(principal.value);
    if (isNaN(P) || P <= 0) {
      errors.push("Initial Investment must be a positive number greater than 0.");
    }
  }

  if (!rate.value.trim()) {
    errors.push("Annual Interest Rate (%) is required. Please enter a value like 10.");
  } else {
    r = parseFloat(rate.value);
    if (isNaN(r) || r < 0) {
      errors.push("Annual Interest Rate (%) must be a non-negative number (e.g., 10 for 10%).");
    }
  }

  if (!time.value.trim()) {
    errors.push("Time Period (Years) is required. Please enter a value like 5.");
  } else {
    t = parseInt(time.value);
    if (isNaN(t) || t <= 0 || t > 100) {
      errors.push("Time Period (Years) must be a positive integer between 1 and 100.");
    }
  }

  n = parseInt(frequency.value);
  if (isNaN(n) || n <= 0) {
    errors.push("Invalid compounding frequency selected.");
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Proceed with calculation
  const tableBody = document.querySelector("#growthTable tbody");
  tableBody.innerHTML = "";

  let values = [];

  for (let year = 1; year <= t; year++) {
    const amount = P * Math.pow(1 + r / 100 / n, n * year);
    values.push(amount);

    const row = document.createElement("tr");
    row.innerHTML = `<td>${year}</td><td>₹${amount.toFixed(2)}</td>`;
    tableBody.appendChild(row);
  }

  const finalAmount = values[values.length - 1];
  const interest = finalAmount - P;

  result.innerHTML = `
    <strong>Final Amount:</strong> ₹${finalAmount.toFixed(2)}<br>
    <strong>Total Interest Earned:</strong> ₹${interest.toFixed(2)}
  `;

  drawChart(values);
}

function drawChart(data) {
  const canvas = document.getElementById("growthChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (canvas.width - padding * 2) / data.length - 6;

  data.forEach((val, i) => {
    const h = (val / max) * (canvas.height - padding * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(padding + i * (barWidth + 6), canvas.height - padding - h, barWidth, h);
  });
}

function downloadPDF() {
  if (!document.getElementById("result").innerHTML.trim()) {
    alert("Calculate first.");
    return;
  }
  window.print();
}