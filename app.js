/**
 * Module 4 (Part 1 of 2): app.js
 * Main UI Orchestrator and Global Event Mappings
 */

import { state, playSfx, speakText, saveLocalStorage, loadLocalStorage } from './state.js';
import { handleInputNode, handleOperatorNode, handleMathFunctionNode, executeCalculation } from './engine.js';
import { setupConverter, runConversionCalculation, initializeGraphEngine } from './tools.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Complete UI Reference Map Cache ---
    const el = {
        appWorkspace: document.querySelector('.app-workspace'),
        navTabs: document.querySelectorAll('.nav-tab'),
        padViews: document.querySelectorAll('.pad-view'),
        modeLabel: document.getElementById('modeLabel'),
        angleUnit: document.getElementById('angleUnit'),
        expressionViewport: document.getElementById('expressionViewport'),
        mainOutputDisplay: document.getElementById('mainOutputDisplay'),
        themeToggle: document.getElementById('themeToggle'),
        voiceToggle: document.getElementById('voiceToggle'),
        audioFeedbackToggle: document.getElementById('audioFeedbackToggle'),
        toggleAngleBtn: document.getElementById('toggleAngleBtn'),
        copyResultBtn: document.getElementById('copyResultBtn'),
        voiceInputBtn: document.getElementById('voiceInputBtn'),
        executeCalcBtn: document.getElementById('executeCalcBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        historyStreamContainer: document.getElementById('historyStreamContainer'),
        exportPdfBtn: document.getElementById('exportPdfBtn'),
        sidebarMemoryValue: document.getElementById('sidebarMemoryValue'),
        programmerBases: document.querySelectorAll('.base'),
        converterTypeSelect: document.getElementById('converterTypeSelect'),
        convertFromSelect: document.getElementById('convertFromSelect'),
        convertToSelect: document.getElementById('convertToSelect'),
        convertFromInput: document.getElementById('convertFromInput'),
        convertToInput: document.getElementById('convertToInput'),
        graphExpressionInput: document.getElementById('graphExpressionInput'),
        plotGraphBtn: document.getElementById('plotGraphBtn'),
        graphingEngineCanvas: document.getElementById('graphingEngineCanvas'),
        sideTabs: document.querySelectorAll('.stab'),
        panes: document.querySelectorAll('.pane'),
        sfxClick: document.getElementById('audioHapticClick'),
        sfxSuccess: document.getElementById('audioHapticSuccess'),
        sfxError: document.getElementById('audioHapticError')
    };

    // --- Launch Sequence ---
    function init() {
        lucide.createIcons();
        loadLocalStorage(el);
        bindGlobalEvents();
        setupConverter('currency', el, () => runConversionCalculation(el));
        renderHistory();
        updateUI();
    }

    // --- Sync State Framework Window ---
    function updateUI() {
        el.expressionViewport.textContent = state.expression || '';
        el.mainOutputDisplay.textContent = state.result;
        el.sidebarMemoryValue.textContent = state.memoryValue;
        
        if (state.currentMode === 'programmer') {
            const valueAsInt = parseInt(state.result) || 0;
            document.querySelector('#readoutHex span').textContent = valueAsInt.toString(16).toUpperCase();
            document.querySelector('#readoutDec span').textContent = valueAsInt.toString(10);
            document.querySelector('#readoutBin span').textContent = valueAsInt.toString(2).padStart(4, '0');
        }
    }

    // --- Interactive Systems Event Map Routing ---
    function bindGlobalEvents() {
        // Mode Subsystem Tabs Switching Engine logic
        el.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                playSfx('click', el);
                el.navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.currentMode = tab.getAttribute('data-mode');
                
                el.padViews.forEach(view => view.classList.remove('active'));
                document.getElementById(`view${state.currentMode.charAt(0).toUpperCase() + state.currentMode.slice(1)}`).classList.add('active');
                
                el.modeLabel.textContent = `${state.currentMode.toUpperCase()}`;
                if (state.currentMode === 'graphing') { setTimeout(() => initializeGraphEngine(el), 100); }
                updateUI();
            });
        });

        // Numerical Keys Click Interface Interceptor mapping layers
        document.querySelectorAll('.scientific-grid .btn, .programmer-grid .btn').forEach(button => {
            button.addEventListener('click', () => {
                playSfx('click', el);
                const val = button.getAttribute('data-val');
                const op = button.getAttribute('data-op');
                const math = button.getAttribute('data-math');
                const action = button.getAttribute('data-action');

                if (val) handleInputNode(val, el, updateUI);
                if (op) handleOperatorNode(op, updateUI);
                if (math) handleMathFunctionNode(math, updateUI);
                if (action) handleActionNode(action);
            });
        });

        // App System Controls Bindings
        el.themeToggle.addEventListener('click', () => {
            playSfx('click', el);
            const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            saveLocalStorage();
        });

        el.voiceToggle.addEventListener('click', () => {
            state.voiceOutputActive = !state.voiceOutputActive;
            el.voiceToggle.classList.toggle('active', state.voiceOutputActive);
            playSfx('click', el);
            saveLocalStorage();
            speakText(state.voiceOutputActive ? "Voice feedback active" : "");
        });

        el.audioFeedbackToggle.addEventListener('click', () => {
            state.audioFeedbackActive = !state.audioFeedbackActive;
            el.audioFeedbackToggle.classList.toggle('muted', !state.audioFeedbackActive);
            playSfx('click', el);
            saveLocalStorage();
        });

        el.toggleAngleBtn.addEventListener('click', () => {
            playSfx('click', el);
            state.isDegrees = !state.isDegrees;
            el.angleUnit.textContent = state.isDegrees ? 'DEG' : 'RAD';
        });

        el.copyResultBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(state.result);
            playSfx('success', el);
            speakText("Copied");
        });

        el.sideTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                el.sideTabs.forEach(t => t.classList.remove('active'));
                el.panes.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-target')).classList.add('active');
            });
        });

        el.programmerBases.forEach(baseNode => {
            baseNode.addEventListener('click', () => {
                playSfx('click', el);
                el.programmerBases.forEach(b => b.classList.remove('active'));
                baseNode.classList.add('active');
                state.programmerBase = parseInt(baseNode.getAttribute('data-base'));
                document.documentElement.setAttribute('data-base', state.programmerBase);
                updateUI();
            });
        });

        el.converterTypeSelect.addEventListener('change', (e) => setupConverter(e.target.value, el, () => runConversionCalculation(el)));
        el.convertFromSelect.addEventListener('change', () => runConversionCalculation(el));
        el.convertToSelect.addEventListener('change', () => runConversionCalculation(el));
        el.convertFromInput.addEventListener('input', () => runConversionCalculation(el));
        el.plotGraphBtn.addEventListener('click', () => { playSfx('success', el); initializeGraphEngine(el); });

        el.clearHistoryBtn.addEventListener('click', () => {
            localStorage.setItem('auracalc_ledger', '[]');
            renderHistory();
            playSfx('click', el);
        });

        el.exportPdfBtn.addEventListener('click', exportLedgerToPDF);
        if (el.executeCalcBtn) el.executeCalcBtn.addEventListener('click', runExecutionWrapper);
        document.querySelectorAll('.programmer-equal').forEach(b => b.addEventListener('click', runExecutionWrapper));
        
        setupVoiceDictationEngine();
    }

    function runExecutionWrapper() {
        executeCalculation(el, updateUI, pushLedgerHistoryNode);
    }
    // --- Action Processing Logic Matrix Subsystem ---
    function handleActionNode(action) {
        switch (action) {
            case 'clear': state.expression = ''; state.result = '0'; break;
            case 'backspace': 
                state.expression = state.expression.endsWith(' ') ? state.expression.slice(0, -3) : state.expression.slice(0, -1);
                break;
            case 'mc': state.memoryValue = 0; playSfx('success', el); break;
            case 'mr': state.expression += state.memoryValue; break;
            case 'mplus': state.memoryValue += parseFloat(state.result) || 0; playSfx('success', el); break;
            case 'mminus': state.memoryValue -= parseFloat(state.result) || 0; playSfx('success', el); break;
        }
        updateUI();
    }

    // --- Audit Trail & Ledgers Processing Stack Modules ---
    function pushLedgerHistoryNode(exp, res) {
        let items = JSON.parse(localStorage.getItem('auracalc_ledger') || '[]');
        items.unshift({ expression: exp, result: res });
        if (items.length > 20) items.pop();
        localStorage.setItem('auracalc_ledger', JSON.stringify(items));
        renderHistory();
    }

    function renderHistory() {
        el.historyStreamContainer.innerHTML = '';
        let items = JSON.parse(localStorage.getItem('auracalc_ledger') || '[]');
        if (items.length === 0) {
            el.historyStreamContainer.innerHTML = '<div class="log-node">Ledger Empty</div>';
            return;
        }
        items.forEach(item => {
            const node = document.createElement('div');
            node.className = 'log-node';
            node.innerHTML = `<div class="log-exp">${item.expression}</div><div class="log-res">${item.result}</div>`;
            node.querySelector('.log-res').addEventListener('click', () => {
                playSfx('click', el);
                state.result = item.result;
                state.expression = '';
                updateUI();
            });
            el.historyStreamContainer.appendChild(node);
        });
    }

    // --- Document PDF Compilation Generation Subsystem ---
    function exportLedgerToPDF() {
        playSfx('success', el);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont("Helvetica", "bold");
        doc.text("AURACALC ELITE LEDGER EXPORT STATEMENT", 14, 20);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        
        let items = JSON.parse(localStorage.getItem('auracalc_ledger') || '[]');
        let cursorY = 40;
        
        items.forEach((item, idx) => {
            if (cursorY > 260) { doc.addPage(); cursorY = 20; }
            doc.text(`[RECORD #${idx + 1}] Input: ${item.expression}  -> Result: = ${item.result}`, 14, cursorY);
            cursorY += 10;
        });
        doc.save('auracalc_ledger_statement.pdf');
    }

    // --- Speech Synthesis Capture Processing Engine Subsystem Module ---
    function setupVoiceDictationEngine() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { el.voiceInputBtn.style.display = 'none'; return; }

        const recognitionEngine = new SpeechRecognition();
        recognitionEngine.lang = 'en-US';

        el.voiceInputBtn.addEventListener('click', () => {
            playSfx('click', el);
            try { recognitionEngine.start(); } catch(e) { recognitionEngine.stop(); }
        });

        recognitionEngine.onresult = (event) => {
            let spokenBlock = event.results[event.results.length - 1][0].transcript.toLowerCase();
            let parsed = spokenBlock.replace(/times|x/g, '*').replace(/plus/g, '+').replace(/minus/g, '-').replace(/equals/g, '=');
            
            if (parsed.includes('=')) {
                state.expression += parsed.replace('=', '');
                runExecutionWrapper();
            } else {
                state.expression += parsed;
                updateUI();
            }
        };
        recognitionEngine.onerror = () => playSfx('error', el);
    }

    init();
});
