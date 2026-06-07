import { state, playSfx, speakText } from './state.js';

export function handleInputNode(val, el, updateUI) {
    if (state.result === 'Error' || state.result === 'Infinity') {
        state.expression = ''; state.result = '0';
    }
    if (state.currentMode === 'programmer') {
        if (state.programmerBase === 2 && !/[0-1]/.test(val)) return;
        if (state.programmerBase === 8 && !/[0-7]/.test(val)) return;
        if (state.programmerBase === 10 && !/[0-9]/.test(val)) return;
    }
    if (state.expression === '' && state.result !== '0' && !isNaN(state.result)) {
        state.expression = '';
    }
    state.expression += val;
    updateUI();
}

export function handleOperatorNode(op, updateUI) {
    if (state.expression === '' && state.result !== '0') {
        state.expression = state.result + ' ' + op + ' ';
    } else {
        state.expression += ' ' + op + ' ';
    }
    updateUI();
}

export function handleMathFunctionNode(fn, updateUI) {
    if (fn === 'pi') state.expression += 'Math.PI';
    else if (fn === 'e') state.expression += 'Math.E';
    else if (fn === 'percent') state.expression += ' * 0.01';
    else if (fn === 'square') state.expression += '**2';
    else state.expression += `Math.${fn}(`;
    updateUI();
}

export function executeCalculation(el, updateUI, pushLedgerHistoryNode) {
    if (!state.expression) return;
    let dynamicSanitizedExpression = state.expression;
    let ledgerLabel = state.expression;
    try {
        if (state.currentMode === 'scientific') {
            if (state.isDegrees) {
                dynamicSanitizedExpression = dynamicSanitizedExpression
                    .replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
                    .replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
                    .replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
            }
            dynamicSanitizedExpression = dynamicSanitizedExpression.replace(/Math\.ln\(/g, 'Math.log(');
            dynamicSanitizedExpression = dynamicSanitizedExpression.replace(/Math\.log\(([^)]+)\)/g, 'Math.log10($1)');
            const openingBrackets = (dynamicSanitizedExpression.match(/\(/g) || []).length;
            const closingBrackets = (dynamicSanitizedExpression.match(/\)/g) || []).length;
            if (openingBrackets > closingBrackets) {
                dynamicSanitizedExpression += ')'.repeat(openingBrackets - closingBrackets);
            }
            const mathEvaluationResult = new Function(`return (${dynamicSanitizedExpression})`)();
            if (isNaN(mathEvaluationResult) || !isFinite(mathEvaluationResult)) throw new Error("Invalid Output");
            state.result = Number(mathEvaluationResult.toFixed(10)).toString();
        } else if (state.currentMode === 'programmer') {
            const baseProgResultVal = new Function(`return (${dynamicSanitizedExpression})`)();
            state.result = parseInt(baseProgResultVal).toString();
        }
        playSfx('success', el);
        pushLedgerHistoryNode(ledgerLabel, state.result);
        speakText(state.result);
        state.expression = '';
    } catch (error) {
        state.result = 'Error';
        playSfx('error', el);
        speakText("Error");
    }
    updateUI();
}
