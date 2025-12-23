const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
let currentExpression = '';
let lastResult = '';

// Cache constant arrays and regex patterns for performance
const OPERATORS = ['+', '-', '*', '/', '%', '^', '×', '÷'];
const FUNCTIONS = ['sin(', 'cos(', 'tan(', 'log(', 'sqrt('];
const DIGIT_REGEX = /\d/;
const NUMBER_KEY_REGEX = /[0-9]/;

function updateDisplay() {
    display.textContent = currentExpression || '0';
}

function appendNumber(number) {
    if (currentExpression === '0' && number !== '.') {
        currentExpression = number;
    } else {
        currentExpression += number;
    }
    updateDisplay();
}

function appendOperator(operator) {
    // Prevent multiple operators in a row, but allow minus for negative numbers
    const lastChar = currentExpression.slice(-1);
    if (OPERATORS.includes(lastChar) && operator !== '-') {
        currentExpression = currentExpression.slice(0, -1) + operator;
    } else {
        currentExpression += operator;
    }
    updateDisplay();
}

function appendFunction(func) {
    if (currentExpression === '0') {
        currentExpression = func + '(';
    } else {
        // If the last character is a number, add a multiplication sign
        const lastChar = currentExpression.slice(-1);
        if (DIGIT_REGEX.test(lastChar) || lastChar === ')') {
            currentExpression += '*' + func + '(';
        } else {
            currentExpression += func + '(';
        }
    }
    updateDisplay();
}

function clearDisplay() {
    currentExpression = '';
    historyDisplay.textContent = '';
    updateDisplay();
}

function deleteLast() {
    if (currentExpression === 'Error') {
        currentExpression = '';
    } else {
        // Handle deleting functions like 'sin(' - optimized with early exit
        let deleted = false;
        for (let i = 0; i < FUNCTIONS.length; i++) {
            if (currentExpression.endsWith(FUNCTIONS[i])) {
                currentExpression = currentExpression.slice(0, -FUNCTIONS[i].length);
                deleted = true;
                break;
            }
        }
        if (!deleted) {
            currentExpression = currentExpression.slice(0, -1);
        }
    }
    updateDisplay();
}

function calculate() {
    if (!currentExpression) return;

    let expressionToEval = currentExpression;

    // Optimized: Use single pass replacements where possible
    // Replace visual operators with JS operators
    expressionToEval = expressionToEval
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/%/g, '/100')
        // Handle scientific functions - Math.sin etc take radians
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(');

    try {
        // Safe evaluation using Function constructor
        // Note: This is still a security concern for user input, but acceptable for a client-side calculator
        const result = new Function('return ' + expressionToEval)();
        
        // Format result - avoid long decimals
        let formattedResult = parseFloat(result.toFixed(8)).toString();
        
        historyDisplay.textContent = currentExpression + ' =';
        currentExpression = formattedResult;
        lastResult = formattedResult;
        updateDisplay();
    } catch (error) {
        historyDisplay.textContent = currentExpression + ' =';
        currentExpression = 'Error';
        updateDisplay();
        setTimeout(() => {
            if (currentExpression === 'Error') {
                currentExpression = '';
                updateDisplay();
            }
        }, 2000);
    }
}

// Keyboard support - optimized event handler
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (NUMBER_KEY_REGEX.test(key)) {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber(key);
    } else if (key === '+' || key === '-' || key === '%' || key === '(' || key === ')' || key === '^') {
        appendOperator(key);
    } else if (key === '*') {
        appendOperator('×');
    } else if (key === '/') {
        appendOperator('÷');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});
