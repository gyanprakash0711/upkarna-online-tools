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
  }
  
  if (char === "." && event.target.value.includes(".")) {
    event.preventDefault();
  }
}

// Attach validation to inputs
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keypress', allowOnlyNumbers);
  });
});

function calculateCapitalGainsTax() {
  // Get values
  const purchasePriceInput = document.getElementById('purchasePrice');
  const salePriceInput = document.getElementById('salePrice');
  const holdingPeriodInput = document.getElementById('holdingPeriod');
  const assetTypeInput = document.getElementById('assetType');
  
  const purchasePrice = parseFloat(purchasePriceInput.value.trim());
  const salePrice = parseFloat(salePriceInput.value.trim());
  const holdingPeriod = parseFloat(holdingPeriodInput.value.trim());
  const assetType = assetTypeInput.value;
  
  const resultDiv = document.getElementById('result');
  const errorMsg = document.getElementById('errorMsg');
  
  // Clear previous results and errors
  resultDiv.innerHTML = '';
  errorMsg.innerHTML = '';
  
  // Clear all error states
  purchasePriceInput.classList.remove('error');
  salePriceInput.classList.remove('error');
  holdingPeriodInput.classList.remove('error');

  // Validation
  const errors = [];
  
  if (!purchasePriceInput.value.trim()) {
    errors.push('Please enter purchase price');
    purchasePriceInput.classList.add('error');
  } else if (isNaN(purchasePrice) || purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
    purchasePriceInput.classList.add('error');
  }

  if (!salePriceInput.value.trim()) {
    errors.push('Please enter sale price');
    salePriceInput.classList.add('error');
  } else if (isNaN(salePrice) || salePrice <= 0) {
    errors.push('Sale price must be greater than 0');
    salePriceInput.classList.add('error');
  }

  if (!holdingPeriodInput.value.trim()) {
    errors.push('Please enter holding period');
    holdingPeriodInput.classList.add('error');
  } else if (isNaN(holdingPeriod) || holdingPeriod < 0) {
    errors.push('Holding period cannot be negative');
    holdingPeriodInput.classList.add('error');
  }

  if (errors.length > 0) {
    errorMsg.innerHTML = `<div class="error-box">${errors.join('<br>')}</div>`;
    return;
  }

  // Calculate capital gain
  let capitalGain = salePrice - purchasePrice;
  let isLongTerm = false;
  let taxRate = 0;
  let taxAmount = 0;
  let indexedPurchasePrice = purchasePrice;

  // Determine if long-term capital gain
  if (assetType === 'equity') {
    isLongTerm = holdingPeriod > 1;
  } else if (assetType === 'debt') {
    isLongTerm = holdingPeriod > 3;
  } else if (assetType === 'property') {
    isLongTerm = holdingPeriod > 2;
  }

  // Calculate indexed purchase price for long-term debt and property
  if (isLongTerm && (assetType === 'debt' || assetType === 'property')) {
    // Using CII for FY 2023-24 (base year 2001-02 = 100, 2023-24 = 348)
    // For simplicity, using a multiplier. In real app, use actual CII values
    const ciiMultiplier = 3.48; // Approximate multiplier from 2001-02 to 2023-24
    indexedPurchasePrice = purchasePrice * ciiMultiplier;
    capitalGain = salePrice - indexedPurchasePrice;
  }

  // Calculate tax based on asset type and holding period
  if (capitalGain > 0) {
    if (assetType === 'equity') {
      if (isLongTerm) {
        // LTCG on equity: 10% above ₹1 lakh
        if (capitalGain > 100000) {
          taxRate = 10;
          taxAmount = (capitalGain - 100000) * 0.10;
        }
      } else {
        // STCG on equity: 15%
        taxRate = 15;
        taxAmount = capitalGain * 0.15;
      }
    } else if (assetType === 'debt') {
      if (isLongTerm) {
        // LTCG on debt: 20% with indexation
        taxRate = 20;
        taxAmount = capitalGain * 0.20;
      } else {
        // STCG on debt: As per slab rates
        taxRate = 'Slab Rate';
        // For simplicity, assuming highest slab. In real app, use income slab
        taxAmount = capitalGain * 0.30;
      }
    } else if (assetType === 'property') {
      if (isLongTerm) {
        // LTCG on property: 20% with indexation
        taxRate = 20;
        taxAmount = capitalGain * 0.20;
      } else {
        // STCG on property: As per slab rates
        taxRate = 'Slab Rate';
        taxAmount = capitalGain * 0.30;
      }
    }
  }

  // Display results
  let resultHTML = `
    <h3>Capital Gains Tax Calculation</h3>
    <p><strong>Capital Gain:</strong> ₹${capitalGain.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    <p><strong>Holding Period:</strong> ${isLongTerm ? 'Long-term' : 'Short-term'}</p>
    <p><strong>Asset Type:</strong> ${assetType.charAt(0).toUpperCase() + assetType.slice(1)}</p>
  `;

  if (capitalGain > 0) {
    resultHTML += `
      <p><strong>Tax Rate:</strong> ${taxRate}${typeof taxRate === 'number' ? '%' : ''}</p>
      <p><strong>Tax Amount:</strong> ₹${taxAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
      <p><strong>Net Proceeds:</strong> ₹${(salePrice - taxAmount).toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
    `;
  } else {
    resultHTML += `<p><strong>No Tax Due</strong> (Capital Loss)</p>`;
  }

  if (isLongTerm && (assetType === 'debt' || assetType === 'property')) {
    resultHTML += `<p><strong>Indexed Purchase Price:</strong> ₹${indexedPurchasePrice.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>`;
  }

  resultDiv.innerHTML = resultHTML;

  // Generate table
  generateTaxBreakdownTable(capitalGain, taxAmount, assetType, isLongTerm);

  // Draw chart
  drawChart(capitalGain, taxAmount, salePrice - taxAmount);
}

function generateTaxBreakdownTable(capitalGain, taxAmount, assetType, isLongTerm) {
  const tableHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Capital Gain</td>
            <td>${capitalGain.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Tax Amount</td>
            <td>${taxAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Net Amount</td>
            <td>${(capitalGain - taxAmount).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('result').insertAdjacentHTML('beforeend', tableHTML);
}

function drawChart(capitalGain, taxAmount, netAmount) {
  const canvas = document.getElementById('taxChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Handle high DPI displays for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set actual canvas size (accounting for device pixel ratio)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale context to match
  ctx.scale(dpr, dpr);
  
  // Use logical dimensions for drawing
  const width = rect.width;
  const height = rect.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (capitalGain <= 0) return;

  // Data
  const data = [capitalGain, taxAmount, netAmount];
  const labels = ['Capital Gain', 'Tax Amount', 'Net Amount'];
  const colors = ['#2563eb', '#ef4444', '#10b981'];

  // Calculate total for percentages
  const total = data.reduce((sum, value) => sum + value, 0);

  // Draw bars
  const barWidth = 60;
  const spacing = 80;
  const startX = 50;

  data.forEach((value, index) => {
    const x = startX + index * spacing;
    const barHeight = (value / Math.max(...data)) * (height - 100);
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
    ctx.fillText('₹' + value.toLocaleString('en-IN', {maximumFractionDigits: 0}), x + barWidth / 2, y - 10);
  });

  // Draw title
  ctx.fillStyle = '#0f172a';
  ctx.font = '16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Capital Gains Breakdown', width / 2, 20);
}

function downloadPDF() {
  window.print();
}

function resetForm() {
  document.getElementById('purchasePrice').value = '';
  document.getElementById('salePrice').value = '';
  document.getElementById('holdingPeriod').value = '';
  document.getElementById('assetType').value = 'equity';
  document.getElementById('result').innerHTML = '';
  document.getElementById('errorMsg').innerHTML = '';

  // Clear error classes
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => input.classList.remove('error'));
}