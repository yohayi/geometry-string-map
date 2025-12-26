/**
 * 学术版本控制系统
 * 用于管理理论文档的版本历史、对比和更新
 */

class AcademicVersionSystem {
    constructor() {
        this.versions = [];
        this.currentVersion = '1.0.0';
    }

    async init() {
        await this.loadVersions();
        this.renderVersionSystem();
        this.setupEventListeners();
    }

    async loadVersions() {
        try {
            const response = await fetch('data/versions.json');
            const data = await response.json();
            this.versions = data.versions || [];
            console.log(`加载了 ${this.versions.length} 个学术版本`);
        } catch (error) {
            console.error('加载版本数据失败:', error);
            this.versions = [];
        }
    }

    renderVersionSystem() {
        const container = document.getElementById('versions-container');
        if (!container) return;

        const majorVersions = this.versions.filter(v => v.type === 'major');
        const minorVersions = this.versions.filter(v => v.type === 'minor');

        container.innerHTML = `
            <div class="version-system">
                <div class="version-control-panel">
                    <div class="current-version-display">
                        <h3>当前正式版本</h3>
                        <div class="version-badge large">
                            v${this.currentVersion}
                        </div>
                        <p>发布于 ${this.getCurrentVersion().date}</p>
                    </div>
                    
                    <div class="version-controls">
                        <button class="academic-btn" onclick="versionSystem.showVersionComparison()">
                            <i class="fas fa-code-compare"></i> 版本对比
                        </button>
                        <button class="academic-btn secondary" onclick="versionSystem.exportVersionHistory()">
                            <i class="fas fa-download"></i> 导出历史
                        </button>
                        <select id="version-selector" class="version-selector">
                            <option value="">选择版本查看...</option>
                            ${this.versions.map(v => `
                                <option value="${v.version}">
                                    v${v.version} - ${v.title} (${v.date})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="version-timeline">
                    <h3><i class="fas fa-timeline"></i> 版本演进时间线</h3>
                    
                    <div class="major-versions">
                        <h4>主要版本</h4>
                        ${majorVersions.map(v => this.renderVersionTimelineItem(v, true)).join('')}
                    </div>
                    
                    <div class="minor-versions">
                        <h4>修订版本</h4>
                        ${minorVersions.map(v => this.renderVersionTimelineItem(v, false)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderVersionTimelineItem(version, isMajor = false) {
        return `
            <div class="version-timeline-item ${isMajor ? 'major' : 'minor'}" 
                 onclick="versionSystem.showVersionDetails('${version.version}')">
                <div class="version-content ${isMajor ? 'major' : ''}">
                    <div class="version-header">
                        <span class="version-badge ${isMajor ? 'major-badge' : ''}">
                            v${version.version}
                        </span>
                        <span class="version-date">${version.date}</span>
                    </div>
                    
                    <h4 class="version-title">${version.title}</h4>
                    <p class="version-description">${version.description}</p>
                    
                    <div class="version-changes">
                        <strong>主要变更：</strong>
                        <ul>
                            ${version.changes.slice(0, 3).map(change => `<li>${change}</li>`).join('')}
                            ${version.changes.length > 3 ? '<li>... 查看更多</li>' : ''}
                        </ul>
                    </div>
                    
                    <div class="version-metrics">
                        <span><i class="fas fa-download"></i> ${version.downloads || 0}</span>
                        <span><i class="fas fa-file"></i> ${version.files?.length || 0}</span>
                        <span><i class="fas fa-comment"></i> ${version.reviews || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentVersion() {
        return this.versions.find(v => v.version === this.currentVersion) || {};
    }

    setupEventListeners() {
        const selector = document.getElementById('version-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.switchToVersion(e.target.value);
                }
            });
        }
    }

    switchToVersion(version) {
        this.currentVersion = version;
        console.log(`切换到学术版本: ${version}`);
        
        // 更新页面状态
        document.querySelectorAll('.current-version-display .version-badge').forEach(el => {
            el.textContent = `v${version}`;
        });
        
        this.showNotification(`已切换到版本 v${version}`, 'info');
    }

    showVersionDetails(version) {
        const versionData = this.versions.find(v => v.version === version);
        if (!versionData) return;

        const modalContent = `
            <div class="version-details-modal">
                <h3><i class="fas fa-info-circle"></i> 版本详情 - v${versionData.version}</h3>
                
                <div class="version-details">
                    <div class="detail-row">
                        <strong>发布日期：</strong> ${versionData.date}
                    </div>
                    <div class="detail-row">
                        <strong>版本类型：</strong> ${versionData.type === 'major' ? '主要版本' : '修订版本'}
                    </div>
                    <div class="detail-row">
                        <strong>状态：</strong> ${versionData.status || '正式发布'}
                    </div>
                    
                    <h4>详细变更记录</h4>
                    <ul class="detailed-changes">
                        ${versionData.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                    
                    ${versionData.files ? `
                        <h4>包含文件</h4>
                        <ul class="file-list">
                            ${versionData.files.map(file => `<li><i class="fas fa-file"></i> ${file}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${versionData.notes ? `
                        <div class="version-notes">
                            <h4>发布说明</h4>
                            <p>${versionData.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="modal-actions">
                    <button class="academic-btn" onclick="versionSystem.downloadVersion('${version}')">
                        <i class="fas fa-download"></i> 下载此版本
                    </button>
                    <button class="academic-btn outline" onclick="this.closest('.modal').remove()">
                        关闭
                    </button>
                </div>
            </div>
        `;

        this.showModal('版本详情', modalContent);
    }

    showVersionComparison() {
        if (this.versions.length < 2) {
            this.showNotification('需要至少两个版本来进行比较', 'warning');
            return;
        }

        const modalContent = `
            <div class="version-comparison-modal">
                <h3><i class="fas fa-code-compare"></i> 版本对比分析</h3>
                
                <div class="comparison-selectors">
                    <div class="comparison-group">
                        <label>从版本：</label>
                        <select id="compare-from" class="version-select">
                            ${this.versions.slice(0, -1).map(v => `
                                <option value="${v.version}">v${v.version} - ${v.title}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="comparison-group">
                        <label>到版本：</label>
                        <select id="compare-to" class="version-select">
                            ${this.versions.slice(1).map(v => `
                                <option value="${v.version}" ${v.version === this.currentVersion ? 'selected' : ''}>
                                    v${v.version} - ${v.title}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <button class="academic-btn" onclick="versionSystem.performComparison()" 
                        style="margin: 20px auto; display: block;">
                    <i class="fas fa-play"></i> 执行对比
                </button>
                
                <div id="comparison-results" class="comparison-results">
                    请选择要对比的版本
                </div>
            </div>
        `;

        this.showModal('版本对比', modalContent);
    }

    performComparison() {
        const fromVersion = document.getElementById('compare-from').value;
        const toVersion = document.getElementById('compare-to').value;
        
        const fromData = this.versions.find(v => v.version === fromVersion);
        const toData = this.versions.find(v => v.version === toVersion);
        
        if (!fromData || !toData) {
            this.showNotification('无法找到版本数据', 'error');
            return;
        }

        const results = document.getElementById('comparison-results');
        results.innerHTML = `
            <div class="comparison-summary">
                <h4>版本对比结果: v${fromVersion} → v${toVersion}</h4>
                
                <div class="comparison-stats">
                    <div class="stat">
                        <div class="stat-value">${toData.changes.length - fromData.changes.length}</div>
                        <div class="stat-label">新增变更项</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${Math.round((toData.downloads / fromData.downloads - 1) * 100)}%</div>
                        <div class="stat-label">下载增长</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${toData.files?.length - fromData.files?.length || 0}</div>
                        <div class="stat-label">新增文件</div>
                    </div>
                </div>
                
                <div class="comparison-details">
                    <h5>主要改进：</h5>
                    <ul>
                        ${this.getDifferences(fromData, toData).map(diff => `<li>${diff}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="comparison-chart">
                    <canvas id="comparison-chart" width="400" height="200"></canvas>
                </div>
            </div>
        `;

        // 绘制对比图表
        this.drawComparisonChart(fromData, toData);
    }

    getDifferences(from, to) {
        const differences = [];
        
        // 这里可以添加具体的对比逻辑
        if (to.changes.length > from.changes.length) {
            differences.push(`新增了 ${to.changes.length - from.changes.length} 项理论改进`);
        }
        
        if (to.files && from.files && to.files.length > from.files.length) {
            differences.push(`增加了 ${to.files.length - from.files.length} 个文档文件`);
        }
        
        if (to.downloads > from.downloads) {
            differences.push(`下载量增加了 ${Math.round((to.downloads / from.downloads - 1) * 100)}%`);
        }
        
        return differences;
    }

    drawComparisonChart(fromData, toData) {
        const canvas = document.getElementById('comparison-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 简单的柱状图
        const data = [
            fromData.downloads,
            toData.downloads,
            fromData.changes.length,
            toData.changes.length,
            fromData.files?.length || 0,
            toData.files?.length || 0
        ];
        
        const labels = ['v' + fromData.version, 'v' + toData.version];
        
        ctx.fillStyle = '#3f51b5';
        ctx.fillRect(50, 200 - (fromData.downloads / 1000 * 100), 40, (fromData.downloads / 1000 * 100));
        ctx.fillRect(150, 200 - (toData.downloads / 1000 * 100), 40, (toData.downloads / 1000 * 100));
        
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(50, 200 - (fromData.changes.length * 10), 40, fromData.changes.length * 10);
        ctx.fillRect(150, 200 - (toData.changes.length * 10), 40, toData.changes.length * 10);
        
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(250, 200 - ((fromData.files?.length || 0) * 30), 40, (fromData.files?.length || 0) * 30);
        ctx.fillRect(350, 200 - ((toData.files?.length || 0) * 30), 40, (toData.files?.length || 0) * 30);
    }

    async downloadVersion(version) {
        const versionData = this.versions.find(v => v.version === version);
        if (!versionData) {
            this.showNotification('版本数据不存在', 'error');
            return;
        }

        this.showNotification(`开始下载 v${version}...`, 'info');
        
        // 模拟下载过程
        setTimeout(() => {
            this.showNotification(`v${version} 下载完成`, 'success');
            
            // 更新下载统计
            versionData.downloads = (versionData.downloads || 0) + 1;
            
            // 更新全局统计
            this.updateGlobalStats();
        }, 1500);
    }

    exportVersionHistory() {
        const history = {
            system: "几何弦理论学术版本系统",
            currentVersion: this.currentVersion,
            totalVersions: this.versions.length,
            versions: this.versions,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `几何弦理论版本历史_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('版本历史已导出为JSON文件', 'success');
    }

    updateGlobalStats() {
        // 更新全局下载统计
        const totalDownloads = this.versions.reduce((sum, v) => sum + (v.downloads || 0), 0);
        const totalEl = document.getElementById('total-downloads');
        if (totalEl) {
            totalEl.textContent = totalDownloads.toLocaleString();
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `academic-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                type === 'error' ? 'exclamation-circle' : 
                                type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showModal(title, content) {
        // 移除现有模态框
        const existingModal = document.querySelector('.academic-modal');
        if (existingModal) existingModal.remove();
        
        // 创建新模态框
        const modal = document.createElement('div');
        modal.className = 'academic-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.academic-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

// 全局实例
const versionSystem = new AcademicVersionSystem();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('versions-container')) {
        versionSystem.init();
    }
});
