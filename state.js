/**
 * Module 1 of 4: state.js
 * Handles App State Registry, Storage Caching, and Audio Synthesizers
 */

export const state = {
    currentMode: 'scientific', 
    expression: '',
    result: '0',
    memoryValue: 0,
    isDegrees: false,
    voiceOutputActive: false,
    audioFeedbackActive: true,
    programmerBase: 10,
    graphChartInstance: null,
    converterData: {
        type: 'length',
        fromUnit: '',
        toUnit: '',
        rates: {}
    }
};

export function playSfx(type, el) {
    if (!state.audioFeedbackActive) return;
    try {
        el.sfxClick.currentTime = 0;
        el.sfxSuccess.currentTime = 0;
        el.sfxError.currentTime = 0;
        if (type === 'click') el.sfxClick.play();
        if (type === 'success') el.sfxSuccess.play();
        if (type === 'error') el.sfxError.play();
    } catch (e) { console.warn("SFX throttled:", e); }
}

export function speakText(text) {
    if (!state.voiceOutputActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
}

export function saveLocalStorage() {
    localStorage.setItem('auracalc_theme', document.documentElement.getAttribute('data-theme'));
    localStorage.setItem('auracalc_memory', state.memoryValue.toString());
    localStorage.setItem('auracalc_voice', state.voiceOutputActive);
    localStorage.setItem('auracalc_audio', state.audioFeedbackActive);
}

export function loadLocalStorage(el) {
    const cachedTheme = localStorage.getItem('auracalc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', cachedTheme);
    state.memoryValue = parseFloat(localStorage.getItem('auracalc_memory')) || 0;
    state.voiceOutputActive = localStorage.getItem('auracalc_voice') === 'true';
    state.audioFeedbackActive = localStorage.getItem('auracalc_audio') !== 'false';
    
    if(state.voiceOutputActive) el.voiceToggle.classList.add('active');
    if(!state.audioFeedbackActive) el.audioFeedbackToggle.classList.add('muted');
}
