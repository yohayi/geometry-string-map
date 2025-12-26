class TheoryCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.energy = 2500; // GeV
        this.coupling = 0.02;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.calculate();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="calculator">
                <h3><i class="fas fa-calculator"></i> 理论预言计算器</h3>
                
                <div class="input-group">
                    <label for="energy">能量尺度 (GeV)</label>
                    <input type="range" id="energy" min="100" max="10000" step="100" value="${this.energy}">
                    <input type="number" id="energy-number" min="100" max="10000" step="100" value="${this.energy}">
                </div>
                
                <div class="input-group">
                    <label for="coupling">耦合常数 α</label>
                    <input type="range" id="coupling" min="0.001" max="0.1" step="0.001" value="${this.coupling}">
                    <input type="number" id="coupling-number" min="0.001" max="0.1" step="0.001" value="${this.coupling}">
                </div>
                
                <button id="calculate-btn">计算预言</button>
                
                <div class="results">
                    <h4>计算结果</h4>
                    <div id="resonance-mass">共振态质量: <span class="result">--</span></div>
                    <div id="cross-section">散射截面: <span class="result">--</span></div>
                    <div id="decay-width">衰变宽度: <span class="result">--</span></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const energySlider = document.getElementById('energy');
        const energyNumber = document.getElementById('energy-number');
        const couplingSlider = document.getElementById('coupling');
        const couplingNumber = document.getElementById('coupling-number');
        const calculateBtn = document.getElementById('calculate-btn');

        energySlider.addEventListener('input', (e) => {
            energyNumber.value = e.target.value;
            this.energy = parseFloat(e.target.value);
            this.calculate();
        });

        energyNumber.addEventListener('change', (e) => {
            energySlider.value = e.target.value;
            this.energy = parseFloat(e.target.value);
            this.calculate();
        });

        couplingSlider.addEventListener('input', (e) => {
            couplingNumber.value = e.target.value;
            this.coupling = parseFloat(e.target.value);
            this.calculate();
        });

        couplingNumber.addEventListener('change', (e) => {
            couplingSlider.value = e.target.value;
            this.coupling = parseFloat(e.target.value);
            this.calculate();
        });

        calculateBtn.addEventListener('click', () => this.calculate());
    }

    calculate() {
        // 理论计算公式（示例公式，请根据实际理论调整）
        const resonanceMass = this.energy / 1000; // TeV
        const crossSection = 0.01 * Math.pow(this.coupling, 2) * Math.pow(this.energy, -2);
        const decayWidth = 0.5 * this.coupling * this.energy;

        // 更新显示
        document.getElementById('resonance-mass').innerHTML = 
            `共振态质量: <span class="result">${resonanceMass.toFixed(2)} TeV</span>`;
        
        document.getElementById('cross-section').innerHTML = 
            `散射截面: <span class="result">${crossSection.toExponential(2)} pb</span>`;
        
        document.getElementById('decay-width').innerHTML = 
            `衰变宽度: <span class="result">${decayWidth.toFixed(2)} MeV</span>`;
    }
}

// 初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    new TheoryCalculator('calculator-container');
});
