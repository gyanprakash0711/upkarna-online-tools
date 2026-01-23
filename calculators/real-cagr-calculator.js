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

function calculateCAGR() {
  // Clear previous results
  result.innerHTML = '';

  // Validation
  let errors = [];
  let initial, final, yearsNum;

  if (!initialInvestment.value.trim()) {
    errors.push("Initial Investment is required. Please enter a value like 10000.");
  } else {
    initial = parseFloat(initialInvestment.value);
    if (isNaN(initial) || initial <= 0) {
      errors.push("Initial Investment must be a positive number greater than 0.");
    }
  }

  if (!finalValue.value.trim()) {
    errors.push("Final Value is required. Please enter a value like 20000.");
  } else {
    final = parseFloat(finalValue.value);
    if (isNaN(final) || final <= 0) {
      errors.push("Final Value must be a positive number greater than 0.");
    }
  }

  if (!years.value.trim()) {
    errors.push("Investment Period (Years) is required. Please enter a value like 5.");
  } else {
    yearsNum = parseInt(years.value);
    if (isNaN(yearsNum) || yearsNum <= 0 || yearsNum > 100) {
      errors.push("Investment Period (Years) must be a positive integer between 1 and 100.");
    }
  }

  if (errors.length > 0) {
    result.innerHTML = '<div style="color: red;">' + errors.join('<br>') + '</div>';
    return;
  }

  // Check if final > initial
  if (final <= initial) {
    result.innerHTML = '<div style="color: red;">Final Value must be greater than Initial Investment.</div>';
    return;
  }

  // Calculate CAGR
  const cagr = Math.pow(final / initial, 1 / yearsNum) - 1;
  const cagrPercent = (cagr * 100).toFixed(2);

  // Display result
  result.innerHTML = `
    <strong>CAGR:</strong> ${cagrPercent}%<br>
    <strong>Initial Investment:</strong> ₹${initial.toFixed(0)}<br>
    <strong>Final Value:</strong> ₹${final.toFixed(0)}<br>
    <strong>Investment Period:</strong> ${yearsNum} years
  `;

  // Generate table and chart
  const tbody = document.querySelector("#growthTable tbody");
  tbody.innerHTML = "";

  let values = [];
  let currentValue = initial;

  for (let y = 0; y <= yearsNum; y++) {
    values.push(currentValue);

    tbody.innerHTML += `
      <tr>
        <td>${y}</td>
        <td>₹${currentValue.toFixed(0)}</td>
      </tr>
    `;

    if (y < yearsNum) {
      currentValue *= (1 + cagr);
    }
  }

  drawChart(values);
}

function drawChart(data) {
  const ctx = growthChart.getContext("2d");
  ctx.clearRect(0, 0, growthChart.width, growthChart.height);

  const padding = 40;
  const max = Math.max(...data);
  const barWidth = (growthChart.width - padding * 2) / data.length - 6;

  data.forEach((v, i) => {
    const h = (v / max) * (growthChart.height - padding * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(
      padding + i * (barWidth + 6),
      growthChart.height - padding - h,
      barWidth,
      h
    );
  });
}

function downloadPDF() {
  if (!result.innerHTML.trim()) {
    alert("Please calculate first.");
    return;
  }
  window.print();
}