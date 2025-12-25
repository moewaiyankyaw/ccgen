
// script.js - M.H.M Pro V1.1.0 (Preserve Original UI)
function luhnValidate(number) {
    const digits = number.toString().split('').reverse().map(d => parseInt(d));
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let digit = digits[i];
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

function generateTestCard(bin, length = 16) {
    let num = bin;
    while (num.length < length - 1) {
        num += Math.floor(Math.random() * 10);
    }

    for (let d = 0; d <= 9; d++) {
        const candidate = num + d;
        if (luhnValidate(candidate)) {
            return candidate;
        }
    }
    return num + '0';
}

function generateFutureDate() {
    const now = new Date();
    now.setMonth(now.getMonth() + 6);
    return {
        month: String(now.getMonth() + 1).padStart(2, '0'),
        year: String(now.getFullYear())
    };
}

function generateCVV() {
    return Math.floor(Math.random() * 900) + 100;
}

function formatCard(cc, mm, yyyy, cvv) {
    return `${cc}|${mm}|${yyyy}|${cvv}`;
}

// Toggle BIN input mode
document.getElementById('binMode').addEventListener('change', function () {
    const singleGroup = document.getElementById('singleBinGroup');
    const multipleGroup = document.getElementById('multipleBinGroup');
    if (this.value === 'multiple') {
        singleGroup.style.display = 'none';
        multipleGroup.style.display = 'block';
    } else {
        singleGroup.style.display = 'block';
        multipleGroup.style.display = 'none';
    }
});

// Form submission — only generate on "Generate" button click
document.getElementById('generatorForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const cardList = document.getElementById('cardList');
    cardList.innerHTML = ''; // Clear previous results

    const binMode = document.getElementById('binMode').value;
    let bins = [];

    if (binMode === 'single') {
        const bin = document.getElementById('bin').value.trim();
        if (!/^\d{6,15}$/.test(bin)) {
            alert("❌ BIN must be between 6 and 15 digits.");
            return;
        }
        bins = [bin];
    } else {
        const textarea = document.getElementById('bins').value.trim();
        if (!textarea) {
            alert("❌ Please enter at least one BIN.");
            return;
        }
        bins = textarea.split('\n')
                       .map(line => line.trim())
                       .filter(line => line.length >= 6 && /^\d+$/.test(line));
        if (bins.length === 0) {
            alert("❌ No valid BINs found.");
            return;
        }
    }

    // Get user inputs
    const expMonth = document.getElementById('exp_month').value.trim();
    const expYear = document.getElementById('exp_year').value.trim();
    const fixedCVVInput = document.getElementById('cvv').value;
    const countInput = document.getElementById('count').value;

    const fixedCVV = fixedCVVInput ? parseInt(fixedCVVInput, 10) : null;
    const count = countInput ? parseInt(countInput, 10) : 1;

    if (count < 1 || count > 50) {
        alert("❌ Number of cards must be between 1 and 50.");
        return;
    }

    // Handle expiration date
    let month, year;
    if (expMonth && expYear && !isNaN(expMonth) && !isNaN(expYear)) {
        month = expMonth.padStart(2, '0');
        year = '20' + expYear.toString().padStart(2, '0');
    } else {
        const date = generateFutureDate();
        month = date.month;
        year = date.year;
    }

    const allCards = [];

    // Generate cards
    bins.forEach(bin => {
        for (let i = 0; i < count; i++) {
            const cardNumber = generateTestCard(bin, 16);
            const cvv = fixedCVV || generateCVV();
            const cardText = formatCard(cardNumber, month, year, cvv);
            allCards.push(cardText);

            // Create card item
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            cardElement.innerHTML = `
                <span class="card-text">${cardText}</span>
                <button class="copy-btn"><i class="fas fa-copy"></i> Copy</button>
            `;

            // Copy single card
            cardElement.querySelector('.copy-btn').addEventListener('click', function () {
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

    // Add "Copy All" button
    if (allCards.length > 0) {
        const copyAllBtn = document.createElement('div');
        copyAllBtn.className = 'card-item';
        copyAllBtn.style.marginTop = '15px';
        copyAllBtn.style.fontWeight = 'bold';
        copyAllBtn.innerHTML = `
            <span class="card-text">Total: ${allCards.length} cards</span>
            <button id="copyAllBtn" class="copy-btn"><i class="fas fa-copy"></i> Copy All</button>
        `;
        cardList.appendChild(copyAllBtn);

        document.getElementById('copyAllBtn').addEventListener('click', function () {
            navigator.clipboard.writeText(allCards.join('\n')).then(() => {
                const icon = this.querySelector('.fa-copy');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');
                this.textContent = 'All Copied!';
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                    this.textContent = 'Copy All';
                }, 2000);
            }).catch(err => {
                alert('📋 Copy failed: ' + err);
            });
        });
    }
});
