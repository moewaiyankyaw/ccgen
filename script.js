// script.js
// Luhn Algorithm Validator - Returns true if the number passes Luhn check
function luhnValidate(number) {
    const digits = number.toString().split('').reverse().map(d => parseInt(d));
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let digit = digits[i];
        // Double every second digit from the right (i = 1, 3, 5, ...)
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9; // Equivalent to summing digits (e.g., 16 → 1+6=7)
            }
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

// Generate a valid test card number with correct Luhn check digit
function generateTestCard(bin, length = 16) {
    let num = bin;
    // Generate random digits until we have (length - 1) digits
    while (num.length < length - 1) {
        num += Math.floor(Math.random() * 10);
    }

    // Try each digit 0–9 as the last digit
    for (let d = 0; d <= 9; d++) {
        const candidate = num + d;
        if (luhnValidate(candidate)) {
            return candidate;
        }
    }

    // Fallback (should never reach here)
    return num + '0';
}

// Generate future expiration date (6 months from now)
function generateFutureDate() {
    const now = new Date();
    now.setMonth(now.getMonth() + 6);
    return {
        month: String(now.getMonth() + 1).padStart(2, '0'),
        year: String(now.getFullYear()).slice(-2)
    };
}

// Generate random CVV (3-digit)
function generateCVV() {
    return Math.floor(Math.random() * 900) + 100;
}

// Format card output
function formatCard(cc, mm, yy, cvv) {
    return `${cc}|${mm}|${yy}|${cvv}`;
}

// Handle form submission
document.getElementById('generatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cardList = document.getElementById('cardList');
    cardList.innerHTML = ''; // Clear previous results

    const bin = document.getElementById('bin').value.trim();
    const expMonth = document.getElementById('exp_month').value;
    const expYear = document.getElementById('exp_year').value;
    const fixedCVVInput = document.getElementById('cvv').value;
    const fixedCVV = fixedCVVInput ? parseInt(fixedCVVInput, 10) : null;
    const count = parseInt(document.getElementById('count').value) || 10;

    // Validation
    if (!/^\d{6,15}$/.test(bin)) {
        alert("❌ BIN must be between 6 and 15 digits.");
        return;
    }
    if (count < 1 || count > 50) {
        alert("❌ Please generate between 1 and 50 cards.");
        return;
    }

    // Set expiration date
    let month, year;
    if (expMonth && expYear && !isNaN(expMonth) && !isNaN(expYear)) {
        month = expMonth.padStart(2, '0');
        year = expYear.slice(-2); // Ensure 2-digit year
    } else {
        const date = generateFutureDate();
        month = date.month;
        year = date.year;
    }

    // Generate cards
    for (let i = 0; i < count; i++) {
        const cardNumber = generateTestCard(bin, 16);
        const cvv = fixedCVV || generateCVV();
        const cardText = formatCard(cardNumber, month, year, cvv);

        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <span class="card-text">${cardText}</span>
            <button class="copy-btn"><i class="fas fa-copy"></i> Copy</button>
        `;

        // Copy to clipboard
        cardElement.querySelector('.copy-btn').addEventListener('click', function() {
            navigator.clipboard.writeText(cardText).then(() => {
                const icon = this.querySelector('.fa-copy');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');
                this.textContent = 'Copied!';

                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                    this.textContent = 'Copy';
                }, 2000);
            }).catch(err => {
                alert('📋 Copy failed: ' + err);
            });
        });

        cardList.appendChild(cardElement);
    }
});