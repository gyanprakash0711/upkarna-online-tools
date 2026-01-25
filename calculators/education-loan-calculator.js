// Education Loan Calculator JavaScript

function allowOnlyNumbers(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        event.preventDefault();
        return false;
    }
    return true;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateEMI(principal, annualRate, tenureYears) {
    const monthlyRate = annualRate / (12 * 100);
    const tenureMonths = tenureYears * 12;
    
    if (monthlyRate === 0) {
        return principal / tenureMonths;
    }
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return emi;
}

function calculateEducationLoan() {
    // Clear previous error messages
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '';
    errorDiv.className = 'error-message'; // Reset class
    
    // Hide result initially
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('show');

    // Get input values
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const loanTenure = parseFloat(document.getElementById('loanTenure').value);
    const moratoriumPeriod = parseFloat(document.getElementById('moratoriumPeriod').value);
    const processingFee = parseFloat(document.getElementById('processingFee').value) || 0;

    // Validation
    if (!loanAmount || loanAmount <= 0) {
        showError('Please enter a valid loan amount');
        return;
    }

    if (!interestRate || interestRate <= 0 || interestRate > 30) {
        showError('Please enter a valid interest rate (0-30%)');
        return;
    }

    if (!loanTenure || loanTenure <= 0 || loanTenure > 25) {
        showError('Please enter a valid loan tenure (1-25 years)');
        return;
    }

    if (moratoriumPeriod < 0 || moratoriumPeriod > 10) {
        showError('Please enter a valid moratorium period (0-10 years)');
        return;
    }

    if (processingFee < 0 || processingFee > 10) {
        showError('Please enter a valid processing fee (0-10%)');
        return;
    }

    // Calculate processing fee amount
    const processingFeeAmount = (loanAmount * processingFee) / 100;

    // Calculate interest during moratorium period (simple interest)
    const interestDuringMoratorium = loanAmount * (interestRate / 100) * moratoriumPeriod;

    // Updated loan amount after moratorium
    const updatedLoanAmount = loanAmount + interestDuringMoratorium;

    // Calculate EMI on updated loan amount
    const emi = calculateEMI(updatedLoanAmount, interestRate, loanTenure);

    // Calculate total amounts
    const totalEMIPayments = emi * loanTenure * 12;
    const totalInterest = interestDuringMoratorium + (totalEMIPayments - updatedLoanAmount);
    const totalAmountPayable = loanAmount + totalInterest + processingFeeAmount;

    // Interest breakdown
    const interestDuringRepayment = totalEMIPayments - updatedLoanAmount;

    // If no moratorium scenario
    const emiWithoutMoratorium = calculateEMI(loanAmount, interestRate, loanTenure);
    const totalWithoutMoratorium = emiWithoutMoratorium * loanTenure * 12;
    const interestWithoutMoratorium = totalWithoutMoratorium - loanAmount;

    // Savings if interest is paid during moratorium
    const monthlySavingsAmount = interestDuringMoratorium / (moratoriumPeriod * 12);
    
    // Display results
    displayResults({
        loanAmount,
        interestRate,
        loanTenure,
        moratoriumPeriod,
        processingFee,
        processingFeeAmount,
        interestDuringMoratorium,
        updatedLoanAmount,
        emi,
        totalEMIPayments,
        totalInterest,
        totalAmountPayable,
        interestDuringRepayment,
        emiWithoutMoratorium,
        totalWithoutMoratorium,
        interestWithoutMoratorium,
        monthlySavingsAmount
    });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.className = 'error-box show';
}

function displayResults(data) {
    const resultDiv = document.getElementById('result');
    
    let moratoriumImpactHTML = '';
    if (data.moratoriumPeriod > 0) {
        const extraCost = data.totalAmountPayable - (data.loanAmount + data.interestWithoutMoratorium + data.processingFeeAmount);
        moratoriumImpactHTML = `
            <div class="moratorium-info">
                <h4>⚠️ Impact of ${data.moratoriumPeriod}-Year Moratorium Period</h4>
                <p><strong>Interest accrued during moratorium:</strong> ${formatCurrency(data.interestDuringMoratorium)}</p>
                <p><strong>Updated loan amount after moratorium:</strong> ${formatCurrency(data.updatedLoanAmount)}</p>
                <p><strong>Extra cost due to moratorium:</strong> ${formatCurrency(extraCost)}</p>
            </div>

            <div class="savings-highlight">
                💡 <strong>Smart Tip:</strong> If you pay simple interest of ${formatCurrency(data.monthlySavingsAmount)}/month during the moratorium period, 
                you can save approximately ${formatCurrency(extraCost)} in total interest!
            </div>
        `;
    }

    resultDiv.innerHTML = `
        <h2>Monthly EMI</h2>
        
        <div class="highlight-amount">
            <span class="amount-label">Monthly Payment</span>
            <span class="amount-value">${formatCurrency(data.emi)}</span>
            <div style="font-size: 0.9rem; color: #64748b; margin-top: 8px;">
                For ${data.loanTenure} years after ${data.moratoriumPeriod > 0 ? data.moratoriumPeriod + '-year moratorium' : 'no moratorium'}
            </div>
        </div>

        ${moratoriumImpactHTML}

        <div class="result-grid">
            <div class="result-item">
                <label>Original Loan Amount</label>
                <div class="value">${formatCurrency(data.loanAmount)}</div>
            </div>
            <div class="result-item">
                <label>Processing Fee (${data.processingFee}%)</label>
                <div class="value">${formatCurrency(data.processingFeeAmount)}</div>
            </div>
            <div class="result-item">
                <label>Interest During Moratorium</label>
                <div class="value">${formatCurrency(data.interestDuringMoratorium)}</div>
            </div>
            <div class="result-item">
                <label>Interest During Repayment</label>
                <div class="value">${formatCurrency(data.interestDuringRepayment)}</div>
            </div>
            <div class="result-item">
                <label>Total Interest Payable</label>
                <div class="value">${formatCurrency(data.totalInterest)}</div>
            </div>
            <div class="result-item">
                <label>Total Amount Payable</label>
                <div class="value">${formatCurrency(data.totalAmountPayable)}</div>
            </div>
        </div>

        <h3 style="margin-top: 30px; color: #2d3748;">Detailed Breakdown</h3>
        <table class="breakdown-table">
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Original Loan Amount</td>
                    <td>${formatCurrency(data.loanAmount)}</td>
                </tr>
                <tr>
                    <td>Processing Fee (${data.processingFee}%)</td>
                    <td>${formatCurrency(data.processingFeeAmount)}</td>
                </tr>
                ${data.moratoriumPeriod > 0 ? `
                <tr>
                    <td>Interest During ${data.moratoriumPeriod}-Year Moratorium (Simple)</td>
                    <td>${formatCurrency(data.interestDuringMoratorium)}</td>
                </tr>
                <tr>
                    <td><strong>Updated Loan After Moratorium</strong></td>
                    <td><strong>${formatCurrency(data.updatedLoanAmount)}</strong></td>
                </tr>
                ` : ''}
                <tr>
                    <td>Monthly EMI</td>
                    <td>${formatCurrency(data.emi)}</td>
                </tr>
                <tr>
                    <td>Loan Tenure</td>
                    <td>${data.loanTenure} years (${data.loanTenure * 12} months)</td>
                </tr>
                <tr>
                    <td>Total EMI Payments (${data.loanTenure * 12} × ${formatCurrency(data.emi)})</td>
                    <td>${formatCurrency(data.totalEMIPayments)}</td>
                </tr>
                <tr>
                    <td>Interest During Repayment Period</td>
                    <td>${formatCurrency(data.interestDuringRepayment)}</td>
                </tr>
                <tr style="background: #edf2f7;">
                    <td><strong>Total Interest Payable</strong></td>
                    <td><strong>${formatCurrency(data.totalInterest)}</strong></td>
                </tr>
                <tr style="background: #e6fffa;">
                    <td><strong>Total Amount Payable</strong></td>
                    <td><strong>${formatCurrency(data.totalAmountPayable)}</strong></td>
                </tr>
            </tbody>
        </table>

        ${data.moratoriumPeriod > 0 ? `
        <h3 style="margin-top: 30px; color: #2d3748;">Comparison: With vs Without Moratorium</h3>
        <table class="breakdown-table">
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>EMI</th>
                    <th>Total Interest</th>
                    <th>Total Payable</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Without Moratorium (Start EMI Immediately)</td>
                    <td>${formatCurrency(data.emiWithoutMoratorium)}</td>
                    <td>${formatCurrency(data.interestWithoutMoratorium)}</td>
                    <td>${formatCurrency(data.totalWithoutMoratorium + data.processingFeeAmount)}</td>
                </tr>
                <tr>
                    <td>With ${data.moratoriumPeriod}-Year Moratorium (Current Scenario)</td>
                    <td>${formatCurrency(data.emi)}</td>
                    <td>${formatCurrency(data.totalInterest)}</td>
                    <td>${formatCurrency(data.totalAmountPayable)}</td>
                </tr>
                <tr style="background: #fff5f5;">
                    <td><strong>Extra Cost Due to Moratorium</strong></td>
                    <td>${formatCurrency(data.emi - data.emiWithoutMoratorium)}</td>
                    <td>${formatCurrency(data.totalInterest - data.interestWithoutMoratorium)}</td>
                    <td>${formatCurrency(data.totalAmountPayable - (data.totalWithoutMoratorium + data.processingFeeAmount))}</td>
                </tr>
            </tbody>
        </table>

        <div class="info-box" style="margin-top: 20px;">
            <h4>💡 How to Reduce Your Education Loan Burden</h4>
            <ul>
                <li><strong>Pay Interest During Moratorium:</strong> Monthly payment of ${formatCurrency(data.monthlySavingsAmount)} during your course period will prevent interest capitalization</li>
                <li><strong>Make Prepayments:</strong> Use internship earnings, bonuses, or parental support to make prepayments</li>
                <li><strong>Start Early:</strong> Don't wait for the full grace period; start EMI as soon as you get a job</li>
                <li><strong>Tax Benefits:</strong> Claim Section 80E deduction on interest paid (no upper limit for 8 years)</li>
            </ul>
        </div>
        ` : ''}

        <div class="info-box" style="margin-top: 20px;">
            <h4>📋 Important Notes:</h4>
            <ul>
                <li>During moratorium period, simple interest accrues and gets added to principal</li>
                <li>EMI calculation is based on the updated loan amount after moratorium</li>
                <li>Processing fee is a one-time upfront cost</li>
                <li>Interest paid on education loan is tax-deductible under Section 80E (up to 8 years)</li>
                <li>Most banks allow prepayment without penalty on education loans</li>
                <li>This is an indicative calculation; actual EMI may vary based on bank's terms</li>
            </ul>
        </div>
    `;

    resultDiv.className = 'result show';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function downloadPDF() {
    window.print();
}
