class ContributorsWall {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.contributors = [];
    }

    async loadContributors() {
        try {
            const response = await fetch('data/contributors.json');
            this.contributors = await response.json();
            this.render();
        } catch (error) {
            console.error('Failed to load contributors:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="contributors-wall">
                <h3><i class="fas fa-users"></i> 贡献者荣誉墙</h3>
                <div class="contributors-grid">
                    ${this.contributors.map(contributor => this.renderContributor(contributor)).join('')}
                </div>
            </div>
        `;
    }

    renderContributor(contributor) {
        return `
            <div class="contributor-card">
                <img src="${contributor.avatar}" alt="${contributor.name}" class="contributor-avatar">
                <div class="contributor-info">
                    <h4>${contributor.name}</h4>
                    <p class="contributor-role">${contributor.role}</p>
                    <p class="contributor-bio">${contributor.bio}</p>
                    <div class="contributor-stats">
                        <span>贡献: ${contributor.contributions} 次</span>
                        ${contributor.github ? 
                            `<a href="https://github.com/${contributor.github}" target="_blank">
                                <i class="fab fa-github"></i> GitHub
                            </a>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

// 初始化贡献者墙
document.addEventListener('DOMContentLoaded', () => {
    const cw = new ContributorsWall('contributors-container');
    cw.loadContributors();
});
