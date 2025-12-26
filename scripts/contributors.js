/**
 * 贡献者荣誉墙系统
 * 显示项目贡献者和他们的贡献
 */
class ContributorsWall {
    constructor() {
        this.contributors = [];
        this.init();
    }

    async init() {
        await this.loadContributors();
        this.render();
        this.setupEventListeners();
    }

    async loadContributors() {
        try {
            const response = await fetch('data/contributors.json');
            this.contributors = await response.json();
            console.log(`加载了 ${this.contributors.length} 位贡献者`);
        } catch (error) {
            console.error('加载贡献者数据失败:', error);
            this.contributors = [];
        }
    }

    render() {
        const container = document.getElementById('contributors-container');
        if (!container) return;

        // 按贡献数排序
        const sortedContributors = [...this.contributors].sort((a, b) => 
            b.contributions - a.contributions
        );

        container.innerHTML = `
            <div class="contributors-wall">
                <h3><i class="fas fa-users"></i> 贡献者荣誉墙</h3>
                
                <div class="contributors-stats">
                    <div class="stat-card">
                        <div class="stat-value">${this.contributors.length}</div>
                        <div class="stat-label">总贡献者</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getTotalContributions()}</div>
                        <div class="stat-label">总贡献次数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getAvgContributions()}</div>
                        <div class="stat-label">平均贡献</div>
                    </div>
                </div>
                
                <div class="contributors-filter">
                    <button class="btn btn-sm active" data-filter="all">全部</button>
                    <button class="btn btn-sm btn-outline" data-filter="core">核心团队</button>
                    <button class="btn btn-sm btn-outline" data-filter="advisor">顾问</button>
                    <button class="btn btn-sm btn-outline" data-filter="community">社区</button>
                </div>
                
                <div class="contributors-grid" id="contributors-grid">
                    ${sortedContributors.map(contributor => this.renderContributor(contributor)).join('')}
                </div>
                
                <div class="become-contributor">
                    <h4><i class="fas fa-hand-paper"></i> 成为贡献者</h4>
                    <p>无论您是物理学家、数学家、程序员还是热心学习者，都可以为这个项目做出贡献。</p>
                    <a href="https://github.com/yuanzhichun/geometry-string-map/blob/main/CONTRIBUTING.md" 
                       target="_blank" class="btn">
                        <i class="fas fa-external-link-alt"></i> 查看贡献指南
                    </a>
                </div>
            </div>
        `;
    }

    renderContributor(contributor) {
        const expertiseHTML = contributor.expertise ? 
            contributor.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('') : '';
        
        const githubHTML = contributor.github ? `
            <a href="https://github.com/${contributor.github}" 
               target="_blank" 
               class="contributor-link github-link">
                <i class="fab fa-github"></i> GitHub
            </a>
        ` : '';
        
        const joinedDate = contributor.joined ? 
            new Date(contributor.joined).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : 
            '近期加入';
        
        return `
            <div class="contributor-card" data-role="${contributor.role.toLowerCase()}">
                <div class="contributor-avatar">
                    <img src="${contributor.avatar}" alt="${contributor.name}" 
                         onerror="this.src='https://via.placeholder.com/150?text=${contributor.name.charAt(0)}'">
                    ${contributor.role.includes('核心') || contributor.role.includes('创始人') ? 
                        '<span class="badge-core">核心</span>' : ''}
                </div>
                
                <div class="contributor-info">
                    <h4 class="contributor-name">${contributor.name}</h4>
                    <div class="contributor-role">${contributor.role}</div>
                    
                    <div class="contributor-bio">${contributor.bio}</div>
                    
                    ${expertiseHTML ? `
                        <div class="contributor-expertise">
                            <strong>专长:</strong> ${expertiseHTML}
                        </div>
                    ` : ''}
                    
                    <div class="contributor-meta">
                        <div class="meta-item">
                            <i class="fas fa-code-branch"></i>
                            <span>${contributor.contributions} 次贡献</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${joinedDate} 加入</span>
                        </div>
                    </div>
                    
                    <div class="contributor-links">
                        ${githubHTML}
                        <button class="contributor-link contact-link" onclick="contributorsWall.contactContributor('${contributor.name}')">
                            <i class="fas fa-envelope"></i> 联系
                        </button>
                    </div>
                </div>
                
                <div class="contributor-contributions">
                    <div class="progress-wrapper">
                        <div class="progress-label">
                            <span>贡献度</span>
                            <span>${this.getContributionPercentage(contributor.contributions)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" 
                                 style="width: ${this.getContributionPercentage(contributor.contributions)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTotalContributions() {
        return this.contributors.reduce((sum, c) => sum + c.contributions, 0);
    }

    getAvgContributions() {
        return this.contributors.length > 0 ? 
            Math.round(this.getTotalContributions() / this.contributors.length) : 0;
    }

    getContributionPercentage(contributions) {
        const total = this.getTotalContributions();
        return total > 0 ? Math.round((contributions / total) * 100) : 0;
    }

    setupEventListeners() {
        // 筛选按钮
        document.addEventListener('click', (e) => {
            if (e.target.matches('.contributors-filter .btn')) {
                // 更新按钮状态
                document.querySelectorAll('.contributors-filter .btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.add('btn-outline');
                });
                
                e.target.classList.add('active');
                e.target.classList.remove('btn-outline');
                
                // 筛选贡献者
                const filter = e.target.dataset.filter;
                this.filterContributors(filter);
            }
        });
    }

    filterContributors(filter) {
        const cards = document.querySelectorAll('.contributor-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'flex';
            } else {
                const role = card.dataset.role.toLowerCase();
                const shouldShow = 
                    (filter === 'core' && role.includes('核心')) ||
                    (filter === 'advisor' && role.includes('顾问')) ||
                    (filter === 'community' && !role.includes('核心') && !role.includes('顾问'));
                
                card.style.display = shouldShow ? 'flex' : 'none';
            }
        });
    }

    contactContributor(name) {
        const modalContent = `
            <div class="contact-contributor">
                <h4><i class="fas fa-envelope"></i> 联系 ${name}</h4>
                <p>请通过以下方式联系这位贡献者：</p>
                
                <div class="contact-options">
                    <div class="contact-option">
                        <i class="fab fa-github"></i>
                        <div>
                            <strong>GitHub Issues</strong>
                            <p>在相关项目仓库中创建issue</p>
                        </div>
                    </div>
                    
                    <div class="contact-option">
                        <i class="fas fa-comments"></i>
                        <div>
                            <strong>社区讨论</strong>
                            <p>加入我们的Gitter讨论室</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>注意：</strong> 为了保护隐私，我们不直接公开贡献者的个人联系方式。建议通过公开渠道进行学术交流。</p>
                </div>
            </div>
        `;

        if (window.versionManager) {
            window.versionManager.showModal('联系贡献者', modalContent);
        }
    }

    // 从GitHub API实时更新贡献者
    async updateFromGitHub() {
        try {
            const response = await fetch('https://api.github.com/repos/yuanzhichun/geometry-string-map/contributors');
            const githubContributors = await response.json();
            
            // 合并数据
            githubContributors.forEach(gc => {
                const existing = this.contributors.find(c => c.github === gc.login);
                if (existing) {
                    existing.contributions = gc.contributions;
                } else {
                    this.contributors.push({
                        name: gc.login,
                        role: '代码贡献者',
                        avatar: gc.avatar_url,
                        github: gc.login,
                        contributions: gc.contributions,
                        bio: '通过GitHub为项目贡献代码',
                        joined: new Date().toISOString().split('T')[0],
                        expertise: ['编程', '开源协作']
                    });
                }
            });
            
            this.render();
            
            if (window.versionManager) {
                window.versionManager.showNotification('贡献者数据已从GitHub更新', 'success');
            }
        } catch (error) {
            console.error('GitHub API调用失败:', error);
        }
    }
}

// 全局实例
window.contributorsWall = new ContributorsWall();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contributors-container')) {
        contributorsWall.init();
    }
});
