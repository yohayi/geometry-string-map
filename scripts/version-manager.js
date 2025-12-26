/**
 * 版本管理系统
 * 用于管理理论文档的版本历史、对比和更新
 */
class VersionManager {
    constructor() {
        this.versions = [];
        this.currentVersion = '1.0.0';
    }

    async init() {
        await this.loadVersions();
        this.renderVersionHistory();
        this.setupEventListeners();
    }

    async loadVersions() {
        try {
            const response = await fetch('data/versions.json');
            this.versions = await response.json();
            console.log(`加载了 ${this.versions.length} 个版本`);
        } catch (error) {
            console.error('加载版本数据失败:', error);
            this.versions = [];
        }
    }

    renderVersionHistory() {
        const container = document.getElementById('version-history-container');
        if (!container) return;

        container.innerHTML = `
            <div class="version-history">
                <h3><i class="fas fa-history"></i> 版本历史</h3>
                <div class="version-controls">
                    <button class="btn btn-sm btn-outline" onclick="versionManager.compareVersions()">
                        <i class="fas fa-code-compare"></i> 比较版本
                    </button>
                    <select id="version-select" class="form-select">
                        ${this.versions.map(v => `
                            <option value="${v.version}" ${v.version === this.currentVersion ? 'selected' : ''}>
                                v${v.version} - ${v.title}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="timeline">
                    ${this.versions.map(version => this.renderVersionCard(version)).join('')}
                </div>
            </div>
        `;
    }

    renderVersionCard(version) {
        return `
            <div class="version-card ${version.version === this.currentVersion ? 'current' : ''}" 
                 data-version="${version.version}">
                <div class="version-header">
                    <span class="version-badge">v${version.version}</span>
                    <span class="version-date">${version.date}</span>
                </div>
                <h4 class="version-title">${version.title}</h4>
                <p class="version-desc">${version.description}</p>
                
                <div class="version-changes">
                    <h5>主要变更：</h5>
                    <ul>
                        ${version.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="version-footer">
                    <div class="version-stats">
                        <span><i class="fas fa-download"></i> ${version.downloads.toLocaleString()} 次下载</span>
                        <span><i class="fas fa-file"></i> ${version.files?.length || 0} 个文件</span>
                    </div>
                    
                    ${version.version === this.currentVersion ? 
                        '<span class="current-label"><i class="fas fa-star"></i> 当前版本</span>' : 
                        `<button class="btn btn-sm btn-outline" onclick="versionManager.downloadVersion('${version.version}')">
                            <i class="fas fa-download"></i> 下载此版本
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // 版本选择事件
        const versionSelect = document.getElementById('version-select');
        if (versionSelect) {
            versionSelect.addEventListener('change', (e) => {
                this.switchVersion(e.target.value);
            });
        }
    }

    switchVersion(version) {
        this.currentVersion = version;
        console.log(`切换到版本: ${version}`);
        
        // 更新网站状态
        document.getElementById('current-version').textContent = `v${version}`;
        
        // 显示通知
        this.showNotification(`已切换到版本 v${version}`, 'info');
    }

    compareVersions() {
        // 简化的版本对比
        if (this.versions.length < 2) {
            alert('需要至少两个版本来进行比较');
            return;
        }

        const modalContent = `
            <div class="version-comparison">
                <h3><i class="fas fa-code-compare"></i> 版本对比</h3>
                
                <div class="comparison-grid">
                    <div class="from-version">
                        <select id="compare-from" class="form-select">
                            ${this.versions.slice(0, -1).map(v => `
                                <option value="${v.version}">v${v.version} - ${v.title}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="to-version">
                        <select id="compare-to" class="form-select">
                            ${this.versions.slice(1).map(v => `
                                <option value="${v.version}" ${v.version === this.currentVersion ? 'selected' : ''}>
                                    v${v.version} - ${v.title}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div id="comparison-results" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    选择两个版本后点击"比较"按钮
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn" onclick="versionManager.performComparison()">
                        <i class="fas fa-play"></i> 开始比较
                    </button>
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
            alert('无法找到版本数据');
            return;
        }

        const results = document.getElementById('comparison-results');
        results.innerHTML = `
            <h4>版本 ${fromVersion} → ${toVersion} 的变更</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                <div>
                    <h5>v${fromVersion}:</h5>
                    <ul>
                        ${fromData.changes.slice(0, 5).map(c => `<li>${c}</li>`).join('')}
                    </ul>
                    <p><strong>文件:</strong> ${fromData.files?.length || 0} 个</p>
                    <p><strong>下载:</strong> ${fromData.downloads.toLocaleString()} 次</p>
                </div>
                
                <div>
                    <h5>v${toVersion}:</h5>
                    <ul>
                        ${toData.changes.slice(0, 5).map(c => `<li>${c}</li>`).join('')}
                    </ul>
                    <p><strong>文件:</strong> ${toData.files?.length || 0} 个</p>
                    <p><strong>下载:</strong> ${toData.downloads.toLocaleString()} 次</p>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px;">
                <h5><i class="fas fa-lightbulb"></i> 主要改进：</h5>
                <ul>
                    <li>增加了 ${toData.changes.length - fromData.changes.length} 个新特性</li>
                    <li>文档大小增加了约 ${Math.round((toData.files?.length || 0) / (fromData.files?.length || 1) * 100 - 100)}%</li>
                    <li>下载量增长了 ${Math.round((toData.downloads / fromData.downloads - 1) * 100)}%</li>
                </ul>
            </div>
        `;
    }

    async downloadVersion(version) {
        const versionData = this.versions.find(v => v.version === version);
        if (!versionData) {
            alert('版本数据不存在');
            return;
        }

        // 模拟下载过程
        this.showNotification(`开始下载 v${version}...`, 'info');
        
        // 实际实现中，这里应该链接到对应版本的下载地址
        setTimeout(() => {
            this.showNotification(`v${version} 下载完成`, 'success');
            
            // 更新下载统计
            versionData.downloads += 1;
            this.updateDownloadStats();
        }, 1500);
    }

    updateDownloadStats() {
        // 更新全局下载统计
        const totalDownloads = this.versions.reduce((sum, v) => sum + v.downloads, 0);
        const totalEl = document.getElementById('total-downloads');
        if (totalEl) {
            totalEl.textContent = totalDownloads.toLocaleString();
        }
    }

    showNotification(message, type = 'info') {
        // 使用现有的下载指示器
        const indicator = document.getElementById('downloadIndicator');
        const downloadText = document.getElementById('downloadText');
        
        if (indicator && downloadText) {
            const icons = {
                info: 'fa-info-circle',
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle'
            };
            
            downloadText.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
            indicator.classList.add('active');
            
            setTimeout(() => {
                indicator.classList.remove('active');
            }, 3000);
        }
    }

    showModal(title, content) {
        const modalId = 'version-manager-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" onclick="document.getElementById('${modalId}').style.display='none'">&times;</span>
                    <h2>${title}</h2>
                    <div id="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        document.getElementById('modal-body').innerHTML = content;
        modal.style.display = 'flex';
    }
}

// 全局实例
window.versionManager = new VersionManager();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    versionManager.init();
});
