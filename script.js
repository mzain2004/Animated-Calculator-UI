function calculate(operator) {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  const resultDisplay = document.getElementById('result');
  if (isNaN(num1) || isNaN(num2)) {
    resultDisplay.textContent = "Enter both numbers";
    return;
  }
  let result;
  switch (operator) {
    case '+':
      result = num1 + num2;
      break;
    case '-':
      result = num1 - num2;
      break;
    case '*':
      result = num1 * num2;
      break;
    case '/':
      if (num2 === 0) {
        resultDisplay.textContent = "Cannot divide by zero";
        return;
      }
      result = num1 / num2;
      break;
  }
 resultDisplay.textContent = result;
}
function clearCalculator() {
  document.getElementById('num1').value = '';
  document.getElementById('num2').value = '';
  document.getElementById('result').textContent = '0';
}