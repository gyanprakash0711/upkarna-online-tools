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

// Calculate in-hand salary
function calculateSalary() {
  // Get input values
  const annualCTCInput = document.getElementById('annualCTC');
  const basicPercentInput = document.getElementById('basicPercent');
  const hraPercentInput = document.getElementById('hraPercent');
  const monthlyRentInput = document.getElementById('monthlyRent');
  const metroInput = document.getElementById('metro');
  const specialAllowanceInput = document.getElementById('specialAllowance');
  const bonusInput = document.getElementById('bonus');
  const professionalTaxInput = document.getElementById('professionalTax');
  const taxRegimeInput = document.getElementById('taxRegime');
  const section80CInput = document.getElementById('section80C');
  const section80DInput = document.getElementById('section80D');
  
  const errorMsg = document.getElementById('errorMsg');
  const result = document.getElementById('result');

  // Clear previous errors and results
  errorMsg.textContent = '';
  errorMsg.classList.remove('show');
  result.classList.remove('show');

  // Validation
  const annualCTC = parseFloat(annualCTCInput.value.trim());
  const basicPercent = parseFloat(basicPercentInput.value.trim());
  const hraPercent = parseFloat(hraPercentInput.value.trim());
  const monthlyRent = parseFloat(monthlyRentInput.value.trim()) || 0;
  const specialAllowance = parseFloat(specialAllowanceInput.value.trim()) || 0;
  const bonus = parseFloat(bonusInput.value.trim()) || 0;
  const professionalTax = parseFloat(professionalTaxInput.value.trim()) || 200;
  const taxRegime = taxRegimeInput.value;
  const section80C = parseFloat(section80CInput.value.trim()) || 0;
  const section80D = parseFloat(section80DInput.value.trim()) || 0;
  const isMetro = metroInput.value === 'yes';

  // Validate inputs
  if (!annualCTC || annualCTC <= 0) {
    errorMsg.textContent = 'Please enter a valid Annual CTC';
    errorMsg.classList.add('show');
    annualCTCInput.classList.add('error');
    return;
  } else {
    annualCTCInput.classList.remove('error');
  }

  if (!basicPercent || basicPercent <= 0 || basicPercent > 100) {
    errorMsg.textContent = 'Basic salary percentage must be between 1 and 100';
    errorMsg.classList.add('show');
    basicPercentInput.classList.add('error');
    return;
  } else {
    basicPercentInput.classList.remove('error');
  }

  if (!hraPercent || hraPercent < 0 || hraPercent > 100) {
    errorMsg.textContent = 'HRA percentage must be between 0 and 100';
    errorMsg.classList.add('show');
    hraPercentInput.classList.add('error');
    return;
  } else {
    hraPercentInput.classList.remove('error');
  }

  if (specialAllowance < 0 || specialAllowance > 100) {
    errorMsg.textContent = 'Special allowance percentage must be between 0 and 100';
    errorMsg.classList.add('show');
    specialAllowanceInput.classList.add('error');
    return;
  } else {
    specialAllowanceInput.classList.remove('error');
  }

  // Calculate salary components
  const annualBasic = annualCTC * (basicPercent / 100);
  const monthlyBasic = annualBasic / 12;
  
  const annualHRA = annualBasic * (hraPercent / 100);
  const monthlyHRA = annualHRA / 12;
  
  const annualSpecial = annualCTC * (specialAllowance / 100);
  const monthlySpecial = annualSpecial / 12;
  
  // EPF calculation (12% of basic, capped at ₹1,800/month = ₹21,600/year for basic > ₹15,000/month)
  const monthlyEPF = Math.min(monthlyBasic * 0.12, 1800);
  const annualEPF = monthlyEPF * 12;
  
  // Calculate HRA exemption (only for old regime)
  let hraExemption = 0;
  if (taxRegime === 'old' && monthlyRent > 0) {
    const metroPercent = isMetro ? 0.5 : 0.4;
    const exemption1 = annualHRA;
    const exemption2 = annualBasic * metroPercent;
    const exemption3 = (monthlyRent * 12) - (annualBasic * 0.1);
    hraExemption = Math.max(0, Math.min(exemption1, exemption2, exemption3));
  }
  
  // Gross annual salary (without employer contributions)
  const grossAnnualSalary = annualBasic + annualHRA + annualSpecial + bonus;
  const monthlyGrossSalary = grossAnnualSalary / 12;
  
  // Calculate taxable income
  let taxableIncome = grossAnnualSalary - annualEPF;
  
  // Standard deduction (₹50,000 available in both regimes from FY 2023-24)
  const standardDeduction = 50000;
  taxableIncome -= standardDeduction;
  
  // Apply deductions for old regime
  if (taxRegime === 'old') {
    taxableIncome -= hraExemption;
    
    // Section 80C (max ₹1,50,000) - EPF already deducted from gross
    const additional80C = Math.min(section80C, 150000);
    taxableIncome -= additional80C;
    
    // Section 80D (max ₹25,000 for self, ₹50,000 for parents above 60)
    const deduction80D = Math.min(section80D, 75000); // Max combined
    taxableIncome -= deduction80D;
  }
  
  taxableIncome = Math.max(0, taxableIncome);
  
  // Calculate income tax based on regime
  let annualTax = 0;
  
  if (taxRegime === 'new') {
    // New Tax Regime (FY 2025-26)
    if (taxableIncome > 1500000) {
      annualTax += (taxableIncome - 1500000) * 0.30;
      annualTax += (1200000 - 1000000) * 0.15;
      annualTax += (1000000 - 700000) * 0.10;
      annualTax += (700000 - 300000) * 0.05;
    } else if (taxableIncome > 1200000) {
      annualTax += (taxableIncome - 1200000) * 0.20;
      annualTax += (1200000 - 1000000) * 0.15;
      annualTax += (1000000 - 700000) * 0.10;
      annualTax += (700000 - 300000) * 0.05;
    } else if (taxableIncome > 1000000) {
      annualTax += (taxableIncome - 1000000) * 0.15;
      annualTax += (1000000 - 700000) * 0.10;
      annualTax += (700000 - 300000) * 0.05;
    } else if (taxableIncome > 700000) {
      annualTax += (taxableIncome - 700000) * 0.10;
      annualTax += (700000 - 300000) * 0.05;
    } else if (taxableIncome > 300000) {
      annualTax += (taxableIncome - 300000) * 0.05;
    }
    
    // Rebate under Section 87A (nil tax up to ₹7 lakh)
    if (taxableIncome <= 700000) {
      annualTax = 0;
    }
  } else {
    // Old Tax Regime
    if (taxableIncome > 1000000) {
      annualTax += (taxableIncome - 1000000) * 0.30;
      annualTax += (500000 - 250000) * 0.05;
      annualTax += (1000000 - 500000) * 0.20;
    } else if (taxableIncome > 500000) {
      annualTax += (taxableIncome - 500000) * 0.20;
      annualTax += (500000 - 250000) * 0.05;
    } else if (taxableIncome > 250000) {
      annualTax += (taxableIncome - 250000) * 0.05;
    }
    
    // Rebate under Section 87A (up to ₹12,500 if income < ₹5 lakh)
    if (taxableIncome <= 500000) {
      annualTax = Math.max(0, annualTax - 12500);
    }
  }
  
  // Add 4% cess
  annualTax = annualTax * 1.04;
  const monthlyTax = annualTax / 12;
  
  // Calculate monthly deductions
  const monthlyDeductions = monthlyEPF + professionalTax + monthlyTax;
  
  // Calculate monthly in-hand salary (excluding bonus)
  const monthlyInHand = monthlyBasic + monthlyHRA + monthlySpecial - monthlyDeductions;
  
  // Calculate annual in-hand salary
  const annualInHand = monthlyInHand * 12;
  
  // Annual deductions
  const annualProfessionalTax = professionalTax * 12;
  const totalAnnualDeductions = annualEPF + annualProfessionalTax + annualTax;
  
  // Take-home percentage
  const takeHomePercent = (monthlyInHand / monthlyGrossSalary) * 100;
  
  // Display results
  let html = `
    <h2>Your Salary Breakdown</h2>
    
    <div class="highlight-amount">
      <p>Monthly In-Hand Salary</p>
      <p><strong>${formatCurrency(monthlyInHand)}</strong></p>
    </div>
    
    <div class="highlight-amount">
      <p>Annual In-Hand Salary (excluding bonus)</p>
      <p><strong>${formatCurrency(annualInHand)}</strong></p>
    </div>
    
    <h3>Monthly Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td>${formatCurrency(monthlyBasic)}</td>
        </tr>
        <tr>
          <td>HRA</td>
          <td>${formatCurrency(monthlyHRA)}</td>
        </tr>
        <tr>
          <td>Special Allowance</td>
          <td>${formatCurrency(monthlySpecial)}</td>
        </tr>
        <tr style="border-top: 2px solid var(--primary);">
          <td><strong>Gross Monthly Salary</strong></td>
          <td><strong>${formatCurrency(monthlyGrossSalary)}</strong></td>
        </tr>
        <tr style="background: #fef2f2;">
          <td>EPF (12% of Basic)</td>
          <td>-${formatCurrency(monthlyEPF)}</td>
        </tr>
        <tr style="background: #fef2f2;">
          <td>Professional Tax</td>
          <td>-${formatCurrency(professionalTax)}</td>
        </tr>
        <tr style="background: #fef2f2;">
          <td>Income Tax (${taxRegime === 'new' ? 'New Regime' : 'Old Regime'})</td>
          <td>-${formatCurrency(monthlyTax)}</td>
        </tr>
        <tr style="border-top: 2px solid var(--primary); background: #f0fdf4;">
          <td><strong>Net In-Hand Salary</strong></td>
          <td><strong>${formatCurrency(monthlyInHand)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <h3>Annual Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Annual CTC</td>
          <td>${formatCurrency(annualCTC)}</td>
        </tr>
        <tr>
          <td>Gross Annual Salary (Cash)</td>
          <td>${formatCurrency(grossAnnualSalary)}</td>
        </tr>
        <tr>
          <td>Total Deductions</td>
          <td>${formatCurrency(totalAnnualDeductions)}</td>
        </tr>
        <tr>
          <td style="padding-left: 24px; font-size: 0.9rem;">- EPF Contribution</td>
          <td style="font-size: 0.9rem;">${formatCurrency(annualEPF)}</td>
        </tr>
        <tr>
          <td style="padding-left: 24px; font-size: 0.9rem;">- Professional Tax</td>
          <td style="font-size: 0.9rem;">${formatCurrency(annualProfessionalTax)}</td>
        </tr>
        <tr>
          <td style="padding-left: 24px; font-size: 0.9rem;">- Income Tax</td>
          <td style="font-size: 0.9rem;">${formatCurrency(annualTax)}</td>
        </tr>
        <tr style="background: #f0fdf4; border-top: 2px solid var(--primary);">
          <td><strong>Annual In-Hand Salary</strong></td>
          <td><strong>${formatCurrency(annualInHand)}</strong></td>
        </tr>
        <tr style="background: #fef9c3;">
          <td><strong>Take-Home Percentage</strong></td>
          <td><strong>${takeHomePercent.toFixed(1)}%</strong></td>
        </tr>
      </tbody>
    </table>
  `;
  
  if (taxRegime === 'old') {
    html += `
      <h3>Tax Deductions Applied (Old Regime)</h3>
      <table>
        <thead>
          <tr>
            <th>Deduction</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Standard Deduction</td>
            <td>${formatCurrency(standardDeduction)}</td>
          </tr>
          <tr>
            <td>HRA Exemption</td>
            <td>${formatCurrency(hraExemption)}</td>
          </tr>
          <tr>
            <td>Section 80C Investments</td>
            <td>${formatCurrency(Math.min(section80C, 150000))}</td>
          </tr>
          <tr>
            <td>Section 80D (Medical Insurance)</td>
            <td>${formatCurrency(Math.min(section80D, 75000))}</td>
          </tr>
          <tr style="border-top: 2px solid var(--primary);">
            <td><strong>Total Deductions</strong></td>
            <td><strong>${formatCurrency(standardDeduction + hraExemption + Math.min(section80C, 150000) + Math.min(section80D, 75000))}</strong></td>
          </tr>
          <tr>
            <td><strong>Taxable Income</strong></td>
            <td><strong>${formatCurrency(taxableIncome)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }
  
  if (bonus > 0) {
    // Bonus is taxed at 30% + 4% cess for simplicity
    const bonusTax = bonus * 0.30 * 1.04;
    const postTaxBonus = bonus - bonusTax;
    
    html += `
      <h3>Bonus & Total Annual Income</h3>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Annual Bonus (Gross)</td>
            <td>${formatCurrency(bonus)}</td>
          </tr>
          <tr>
            <td>Tax on Bonus (~30%)</td>
            <td>-${formatCurrency(bonusTax)}</td>
          </tr>
          <tr>
            <td>Post-Tax Bonus</td>
            <td>${formatCurrency(postTaxBonus)}</td>
          </tr>
          <tr style="border-top: 2px solid var(--primary); background: #f0fdf4;">
            <td><strong>Total Annual In-Hand (with Bonus)</strong></td>
            <td><strong>${formatCurrency(annualInHand + postTaxBonus)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }
  
  // Draw chart
  drawSalaryChart(monthlyBasic, monthlyHRA, monthlySpecial, monthlyEPF, professionalTax, monthlyTax, monthlyInHand);
  
  result.innerHTML = html;
  result.classList.add('show');
}

// Draw salary breakdown chart
function drawSalaryChart(basic, hra, special, epf, pt, tax, inhand) {
  // Remove existing canvas if any
  const existingCanvas = document.getElementById('salaryChart');
  if (existingCanvas) {
    existingCanvas.remove();
  }
  
  // Create new canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'salaryChart';
  canvas.width = 400;
  canvas.height = 300;
  
  const result = document.getElementById('result');
  result.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Data
  const components = ['Basic', 'HRA', 'Special', 'EPF', 'PT', 'Tax', 'In-Hand'];
  const values = [basic, hra, special, epf, pt, tax, inhand];
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dc2626', '#ef4444', '#f87171', '#10b981'];
  
  // Chart dimensions
  const padding = 40;
  const chartWidth = canvas.width - (padding * 2);
  const chartHeight = canvas.height - (padding * 2);
  const barWidth = chartWidth / components.length - 10;
  const maxValue = Math.max(...values);
  
  // Draw bars
  components.forEach((component, index) => {
    const barHeight = (values[index] / maxValue) * chartHeight;
    const x = padding + (index * (barWidth + 10));
    const y = padding + chartHeight - barHeight;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, colors[index]);
    gradient.addColorStop(1, colors[index] + 'CC');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw value on top of bar
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    const valueText = '₹' + (values[index] / 1000).toFixed(0) + 'k';
    ctx.fillText(valueText, x + barWidth / 2, y - 5);
    
    // Draw label below bar
    ctx.font = '11px Inter';
    ctx.fillText(component, x + barWidth / 2, canvas.height - padding + 15);
  });
  
  // Draw title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Monthly Salary Breakdown', canvas.width / 2, 25);
}

// Download PDF
function downloadPDF() {
  window.print();
}
