class VersionManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.versions = [];
    }

    async loadVersions() {
        try {
            const response = await fetch('data/versions.json');
            this.versions = await response.json();
            this.render();
        } catch (error) {
            console.error('Failed to load versions:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="version-history">
                <h3><i class="fas fa-history"></i> 版本历史</h3>
                <div class="timeline">
                    ${this.versions.map(version => this.renderVersion(version)).join('')}
                </div>
            </div>
        `;
    }

    renderVersion(version) {
        return `
            <div class="version-item">
                <div class="version-header">
                    <span class="version-number">${version.version}</span>
                    <span class="version-date">${version.date}</span>
                </div>
                <div class="version-title">${version.title}</div>
                <div class="version-description">${version.description}</div>
                <div class="version-changes">
                    <h4>主要变更：</h4>
                    <ul>
                        ${version.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                </div>
                <div class="version-footer">
                    <span>下载次数: ${version.downloads}</span>
                    ${version.doi ? `<span>DOI: ${version.doi}</span>` : ''}
                </div>
            </div>
        `;
    }
}

// 初始化版本管理器
document.addEventListener('DOMContentLoaded', () => {
    const vm = new VersionManager('version-history-container');
    vm.loadVersions();
});
