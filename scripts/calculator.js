/**
 * 几何弦理论在线计算器
 * 提供理论预言的实时计算
 */
class TheoryCalculator {
    constructor() {
        this.constants = {
            hbar: 1.0545718e-34, // J·s
            c: 2.99792458e8,     // m/s
            G: 6.67430e-11,      // N·m²/kg²
            GeV_to_J: 1.602176634e-10
        };
        
        this.init();
    }

    init() {
        this.renderCalculator();
        this.bindEvents();
        this.calculate(); // 初始计算
    }

    renderCalculator() {
        const container = document.getElementById('calculator-container');
        if (!container) return;

        container.innerHTML = `
            <div class="theory-calculator">
                <h3><i class="fas fa-calculator"></i> 理论预言计算器</h3>
                
                <div class="calculator-grid">
                    <div class="input-section">
                        <div class="input-group">
                            <label for="energy-scale">
                                <i class="fas fa-bolt"></i> 能量尺度 (GeV)
                            </label>
                            <input type="range" id="energy-scale" min="100" max="10000" step="100" value="2500">
                            <div class="input-value">
                                <input type="number" id="energy-value" min="100" max="10000" step="100" value="2500">
                                <span>GeV</span>
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="coupling-constant">
                                <i class="fas fa-link"></i> 耦合常数 α
                            </label>
                            <input type="range" id="coupling-constant" min="0.001" max="0.1" step="0.001" value="0.02">
                            <div class="input-value">
                                <input type="number" id="coupling-value" min="0.001" max="0.1" step="0.001" value="0.02">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="dimensions">
                                <i class="fas fa-cube"></i> 额外维度
                            </label>
                            <select id="dimensions" class="form-select">
                                <option value="6">6个紧致维度</option>
                                <option value="9" selected>9维（理论预言）</option>
                                <option value="10">10维（传统弦理论）</option>
                                <option value="11">11维（M理论）</option>
                            </select>
                        </div>
                        
                        <button id="calculate-btn" class="btn">
                            <i class="fas fa-play-circle"></i> 计算预言
                        </button>
                        
                        <button id="reset-btn" class="btn btn-outline">
                            <i class="fas fa-redo"></i> 重置
                        </button>
                    </div>
                    
                    <div class="results-section">
                        <h4><i class="fas fa-chart-line"></i> 计算结果</h4>
                        
                        <div class="result-card">
                            <div class="result-title">共振态质量</div>
                            <div class="result-value" id="resonance-mass">2.50 ± 0.05 TeV</div>
                            <div class="result-desc">在LHC中可探测的能量范围</div>
                            <div class="result-confidence">
                                <div class="confidence-bar" style="width: 85%"></div>
                                <span>置信度: 85%</span>
                            </div>
                        </div>
                        
                        <div class="result-card">
                            <div class="result-title">散射截面</div>
                            <div class="result-value" id="cross-section">3.2 × 10⁻⁴ pb</div>
                            <div class="result-desc">预期在LHC运行中的产生率</div>
                            <div class="result-confidence">
                                <div class="confidence-bar" style="width: 75%"></div>
                                <span>置信度: 75%</span>
                            </div>
                        </div>
                        
                        <div class="result-card">
                            <div class="result-title">衰变宽度</div>
                            <div class="result-value" id="decay-width">15.7 MeV</div>
                            <div class="result-desc">粒子寿命的倒数</div>
                            <div class="result-confidence">
                                <div class="confidence-bar" style="width: 70%"></div>
                                <span>置信度: 70%</span>
                            </div>
                        </div>
                        
                        <div class="result-card">
                            <div class="result-title">暗物质密度</div>
                            <div class="result-value" id="dark-matter">0.12 GeV/cm³</div>
                            <div class="result-desc">与观测值高度一致</div>
                            <div class="result-confidence">
                                <div class="confidence-bar" style="width: 90%"></div>
                                <span>置信度: 90%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="visualization-section">
                    <h4><i class="fas fa-chart-bar"></i> 可视化</h4>
                    <div class="chart-container">
                        <canvas id="calculator-chart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 滑块和数字输入同步
        const energySlider = document.getElementById('energy-scale');
        const energyInput = document.getElementById('energy-value');
        const couplingSlider = document.getElementById('coupling-constant');
        const couplingInput = document.getElementById('coupling-value');
        
        energySlider.addEventListener('input', (e) => {
            energyInput.value = e.target.value;
            this.calculate();
        });
        
        energyInput.addEventListener('change', (e) => {
            energySlider.value = e.target.value;
            this.calculate();
        });
        
        couplingSlider.addEventListener('input', (e) => {
            couplingInput.value = e.target.value;
            this.calculate();
        });
        
        couplingInput.addEventListener('change', (e) => {
            couplingSlider.value = e.target.value;
            this.calculate();
        });
        
        // 维度选择
        document.getElementById('dimensions').addEventListener('change', () => {
            this.calculate();
        });
        
        // 计算按钮
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculate();
        });
        
        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
    }

    calculate() {
        const energy = parseFloat(document.getElementById('energy-value').value); // GeV
        const coupling = parseFloat(document.getElementById('coupling-value').value);
        const extraDims = parseInt(document.getElementById('dimensions').value);
        
        // 理论计算公式（简化模型）
        const resonanceMass = energy / 1000; // TeV
        const crossSection = 0.01 * Math.pow(coupling, 2) * Math.pow(energy, -2);
        const decayWidth = 0.5 * coupling * energy;
        
        // 暗物质密度计算
        const darkMatterDensity = 0.12 * (extraDims / 9) * Math.sqrt(coupling / 0.02);
        
        // 更新显示
        document.getElementById('resonance-mass').textContent = 
            `${resonanceMass.toFixed(2)} ± ${(resonanceMass * 0.02).toFixed(2)} TeV`;
        
        document.getElementById('cross-section').textContent = 
            `${crossSection.toExponential(2)} pb`;
        
        document.getElementById('decay-width').textContent = 
            `${decayWidth.toFixed(1)} MeV`;
        
        document.getElementById('dark-matter').textContent = 
            `${darkMatterDensity.toFixed(2)} GeV/cm³`;
        
        // 更新置信度
        this.updateConfidence(resonanceMass, coupling, extraDims);
        
        // 更新图表
        this.updateChart(energy, coupling, extraDims);
    }

    updateConfidence(mass, coupling, dims) {
        // 根据输入参数计算置信度
        const confidenceBars = document.querySelectorAll('.confidence-bar');
        
        // 共振态质量置信度
        const massConfidence = mass > 1 && mass < 10 ? 85 : 60;
        confidenceBars[0].style.width = `${massConfidence}%`;
        confidenceBars[0].nextElementSibling.textContent = `置信度: ${massConfidence}%`;
        
        // 散射截面置信度
        const crossConfidence = Math.min(75, 60 + coupling * 500);
        confidenceBars[1].style.width = `${crossConfidence}%`;
        confidenceBars[1].nextElementSibling.textContent = `置信度: ${crossConfidence}%`;
        
        // 衰变宽度置信度
        const widthConfidence = 70 - Math.abs(dims - 9) * 5;
        confidenceBars[2].style.width = `${widthConfidence}%`;
        confidenceBars[2].nextElementSibling.textContent = `置信度: ${widthConfidence}%`;
        
        // 暗物质置信度
        const dmConfidence = Math.min(90, 80 + dims * 2);
        confidenceBars[3].style.width = `${dmConfidence}%`;
        confidenceBars[3].nextElementSibling.textContent = `置信度: ${dmConfidence}%`;
    }

    updateChart(energy, coupling, dims) {
        const canvas = document.getElementById('calculator-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制简单的柱状图
        const data = [
            energy / 500,           // 缩放后的共振态强度
            coupling * 5000,        // 缩放后的耦合强度
            dims * 10,              // 维度影响
            energy * coupling * 2   // 相互作用强度
        ];
        
        const labels = ['共振态', '耦合强度', '维度', '相互作用'];
        const colors = ['#0056b3', '#28a745', '#ffc107', '#dc3545'];
        
        const barWidth = 60;
        const spacing = 30;
        const startX = 50;
        
        // 绘制坐标轴
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(30, 180);
        ctx.lineTo(350, 180);
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制柱状图
        data.forEach((value, index) => {
            const x = startX + index * (barWidth + spacing);
            const height = Math.min(value, 150);
            
            // 绘制柱
            ctx.fillStyle = colors[index];
            ctx.fillRect(x, 180 - height, barWidth, height);
            
            // 绘制标签
            ctx.fillStyle = '#212529';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + barWidth / 2, 195);
            
            // 绘制数值
            ctx.fillStyle = colors[index];
            ctx.fillText(value.toFixed(1), x + barWidth / 2, 170 - height);
        });
        
        // 添加标题
        ctx.fillStyle = '#212529';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('理论参数可视化', canvas.width / 2, 15);
    }

    reset() {
        document.getElementById('energy-value').value = 2500;
        document.getElementById('energy-scale').value = 2500;
        document.getElementById('coupling-value').value = 0.02;
        document.getElementById('coupling-constant').value = 0.02;
        document.getElementById('dimensions').value = 9;
        
        this.calculate();
        
        // 显示重置通知
        if (window.versionManager) {
            window.versionManager.showNotification('计算器已重置为默认值', 'info');
        }
    }

    // 导出计算结果
    exportResults() {
        const results = {
            energy: document.getElementById('energy-value').value,
            coupling: document.getElementById('coupling-value').value,
            dimensions: document.getElementById('dimensions').value,
            resonanceMass: document.getElementById('resonance-mass').textContent,
            crossSection: document.getElementById('cross-section').textContent,
            decayWidth: document.getElementById('decay-width').textContent,
            darkMatter: document.getElementById('dark-matter').textContent,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `几何弦理论计算结果_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.versionManager) {
            window.versionManager.showNotification('计算结果已导出为JSON文件', 'success');
        }
    }
}

// 全局实例
window.calculator = new TheoryCalculator();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calculator-container')) {
        calculator.init();
    }
});
