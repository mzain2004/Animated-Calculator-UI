const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
let currentExpression = '';
let lastResult = '';

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
    const operators = ['+', '-', '*', '/', '%', '^', '×', '÷'];
    if (operators.includes(lastChar) && operator !== '-') {
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
        if (/\d/.test(lastChar) || lastChar === ')') {
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
        // Handle deleting functions like 'sin('
        const functions = ['sin(', 'cos(', 'tan(', 'log(', 'sqrt('];
        let deleted = false;
        for (let func of functions) {
            if (currentExpression.endsWith(func)) {
                currentExpression = currentExpression.slice(0, -func.length);
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

    // Replace visual operators with JS operators
    expressionToEval = expressionToEval.replace(/×/g, '*')
                                       .replace(/÷/g, '/')
                                       .replace(/\^/g, '**')
                                       .replace(/%/g, '/100');

    // Handle scientific functions
    // Note: Math.sin etc take radians.
    expressionToEval = expressionToEval.replace(/sin\(/g, 'Math.sin(')
                                       .replace(/cos\(/g, 'Math.cos(')
                                       .replace(/tan\(/g, 'Math.tan(')
                                       .replace(/log\(/g, 'Math.log10(')
                                       .replace(/sqrt\(/g, 'Math.sqrt(');

    try {
        // Safe evaluation using Function constructor
        const result = new Function('return ' + expressionToEval)();
        
        // Format result
        let formattedResult = parseFloat(result.toFixed(8)).toString(); // Avoid long decimals
        
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

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        appendNumber(key);
    } else if (['+', '-', '*', '/', '%', '(', ')', '^', '.'].includes(key)) {
        let op = key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        appendOperator(op);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});
