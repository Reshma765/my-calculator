/**
 * Module 3 of 4: tools.js
 * Handles live currency conversions, unit data metrics, and 2D charting configurations
 */

import { state, playSfx } from './state.js';

export const unitMap = {
    length: { meters: 1, kilometers: 0.001, miles: 0.000621371, feet: 3.28084 },
    mass: { kilograms: 1, grams: 1000, pounds: 2.20462, ounces: 35.274 },
    currency: { USD: 1, EUR: 0.92, INR: 87.50, GBP: 0.78, JPY: 155.20 }
};

export async function setupConverter(type, el, runConversion) {
    state.converterData.type = type;
    el.convertFromSelect.innerHTML = '';
    el.convertToSelect.innerHTML = '';
    
    let units = Object.keys(unitMap[type] || {});
    
    if (type === 'currency') {
        try {
            const response = await fetch('https://er-api.com');
            if (response.ok) {
                const data = await response.json();
                unitMap.currency = data.rates;
                units = Object.keys(data.rates);
            }
        } catch(e) { console.warn("Live currency fetching offline, using static fallbacks:", e); }
    }

    units.forEach(unit => {
        el.convertFromSelect.add(new Option(unit.toUpperCase(), unit));
        el.convertToSelect.add(new Option(unit.toUpperCase(), unit));
    });

    if (el.convertFromSelect.options.length) el.convertFromSelect.selectedIndex = 0;
    if (el.convertToSelect.options.length) el.convertToSelect.selectedIndex = 1;
    
    runConversion();
}

export function runConversionCalculation(el) {
    const type = state.converterData.type;
    const from = el.convertFromSelect.value;
    const to = el.convertToSelect.value;
    const inputVal = parseFloat(el.convertFromInput.value) || 0;

    if (!from || !to) return;

    const matrix = unitMap[type];
    const valInBase = inputVal / matrix[from];
    const output = valInBase * matrix[to];

    el.convertToInput.value = Number(output.toFixed(5)).toString();
}

export function initializeGraphEngine(el) {
    const canvasCtxNode = el.graphingEngineCanvas.getContext('2d');
    const userExpressionInput = el.graphExpressionInput.value;
    
    const xValues = [];
    const yValues = [];
    
    for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        try {
            let parserMathCodeString = userExpressionInput.replace(/\bx\b/g, `(${x})`);
            const calculatedPointY = new Function(`return (${parserMathCodeString})`)();
            yValues.push(calculatedPointY);
        } catch (err) {
            yValues.push(null);
        }
    }

    if (state.graphChartInstance) { state.graphChartInstance.destroy(); }

    state.graphChartInstance = new Chart(canvasCtxNode, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: `f(x) = ${userExpressionInput}`,
                data: yValues,
                borderColor: '#ff9f0a',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0b1' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0b1' } }
            }
        }
    });
}
