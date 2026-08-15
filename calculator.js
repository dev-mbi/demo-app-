const DISPLAY = document.getElementById('display');
const BUTTONS = document.getElementById('buttons');
const HISTORY_LIST = document.getElementById('history-list');

let current = '';
let previous = '';
let operator = null;
let history = loadHistory();

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem('calcHistory') || '[]');
    } catch {
        return [];
    }
}

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function renderHistory() {
    HISTORY_LIST.innerHTML = '';
    history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.expression} = ${entry.result}`;
        HISTORY_LIST.appendChild(li);
    });
}

function render() {
    DISPLAY.textContent = current || previous || '0';
}

function pressDigit(d) {
    if (current === '' && d === '0') return;
    current += d;
    render();
}

function pressDot() {
    if (current.includes('.')) return;
    current = current === '' ? '0.' : current + '.';
    render();
}

function pressOperator(op) {
    if (current === '' && previous === '') return;
    if (current !== '' && previous !== '' && operator) {
        compute();
    }
    operator = op;
    previous = current || previous;
    current = '';
    render();
}

function compute() {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;
    const result = {
        '+': a + b,
        '-': a - b,
        '*': a * b,
        '/': b === 0 ? 'Error' : a / b
    }[operator];
    history.unshift({ expression: `${previous} ${operator} ${current}`, result: result });
    history = history.slice(0, 10);
    saveHistory();
    renderHistory();
    current = String(result);
    previous = '';
    operator = null;
}

function pressEquals() {
    if (operator && current !== '' && previous !== '') {
        compute();
    }
    render();
}

function clearAll() {
    current = '';
    previous = '';
    operator = null;
    render();
}

function clearHistory() {
    history = [];
    saveHistory();
    renderHistory();
}

function buildButtons() {
    fetch('config.json').then(r => r.json()).then(config => {
        config.buttons.forEach(btn => {
            const b = document.createElement('button');
            b.textContent = btn.label;
            b.addEventListener('click', () => {
                if (btn.type === 'digit') pressDigit(btn.label);
                else if (btn.type === 'dot') pressDot();
                else if (btn.type === 'equals') pressEquals();
                else if (btn.type === 'clear') clearAll();
                else if (btn.type === 'operator') pressOperator(btn.label);
            });
            BUTTONS.appendChild(b);
        });
    });
}

document.getElementById('clear-history').addEventListener('click', clearHistory);

buildButtons();
renderHistory();