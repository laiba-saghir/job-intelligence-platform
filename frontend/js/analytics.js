// ============================================
// ANALYTICS PAGE - LOGIC
// ============================================

let trendChart, skillsChart, statusChart;

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }
    
    await loadUserInfo();
    await loadAnalytics();
});


// ============================================
// LOAD USER INFO
// ============================================
async function loadUserInfo() {
    try {
        const user = await getCurrentUser();
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    } catch (error) {
        console.error('User load error:', error);
    }
}


// ============================================
// LOAD ALL ANALYTICS
// ============================================
async function loadAnalytics() {
    try {
        const data = await apiCall('/analytics/dashboard');
        
        // Metrics
        document.getElementById('totalJobs').textContent = data.overview.total_jobs;
        document.getElementById('totalApps').textContent = data.overview.total_applications;
        document.getElementById('totalSkills').textContent = data.overview.user_skills;
        document.getElementById('successRate').textContent = `${data.applications.success_rate}%`;
        
        // Charts
        renderTrendChart(data.recent_trends);
        renderSkillsChart(data.top_skills);
        renderStatusChart(data.applications);
        
        // Insights
        renderInsights(data);
        
    } catch (error) {
        console.error('Analytics load error:', error);
        showToast('Failed to load analytics', 'error');
    }
}


// ============================================
// TREND CHART (Line)
// ============================================
function renderTrendChart(trends) {
    if (trendChart) trendChart.destroy();
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    const labels = trends.map(t => {
        const date = new Date(t.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const values = trends.map(t => t.count);
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jobs Posted',
                data: values,
                borderColor: '#66bb6a',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#66bb6a',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1b5e20',
                    padding: 12,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    displayColors: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#689f38', font: { size: 11 }, stepSize: 1 },
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }
                },
                x: {
                    ticks: { color: '#689f38', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}


// ============================================
// SKILLS CHART (Bar - Horizontal)
// ============================================
function renderSkillsChart(skills) {
    if (skillsChart) skillsChart.destroy();
    
    const ctx = document.getElementById('skillsChart').getContext('2d');
    
    if (!skills || skills.length === 0) {
        ctx.canvas.parentNode.innerHTML = `
            <div class="empty-state" style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <i class="fa-solid fa-graduation-cap" style="font-size: 40px; color: #c8e6c9; margin-bottom: 12px;"></i>
                <h3>No skills data</h3>
                <p>Add skills to jobs to see demand</p>
            </div>
        `;
        return;
    }
    
    const labels = skills.slice(0, 6).map(s => s.skill_name);
    const values = skills.slice(0, 6).map(s => s.demand_percentage);
    
    skillsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Demand %',
                data: values,
                backgroundColor: 'rgba(102, 187, 106, 0.7)',
                borderColor: '#66bb6a',
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1b5e20',
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.x}% demand`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#689f38', font: { size: 11 }, callback: (v) => `${v}%` },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    ticks: { color: '#1b5e20', font: { size: 12, weight: '500' } },
                    grid: { display: false }
                }
            }
        }
    });
}


// ============================================
// STATUS CHART (Doughnut)
// ============================================
function renderStatusChart(applications) {
    if (statusChart) statusChart.destroy();
    
    const ctx = document.getElementById('statusChart').getContext('2d');
    const byStatus = applications.by_status;
    
    const labels = ['Applied', 'Interview', 'Offer', 'Accepted', 'Rejected'];
    const values = [
        byStatus.applied || 0,
        byStatus.interview || 0,
        byStatus.offer || 0,
        byStatus.accepted || 0,
        byStatus.rejected || 0,
    ];
    
    const total = values.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        ctx.canvas.parentNode.innerHTML = `
            <div class="empty-state" style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <i class="fa-solid fa-chart-pie" style="font-size: 40px; color: #c8e6c9; margin-bottom: 12px;"></i>
                <h3>No applications</h3>
                <p>Start applying to see stats</p>
            </div>
        `;
        return;
    }
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#a5d6a7',
                    '#fcd34d',
                    '#66bb6a',
                    '#2e7d32',
                    '#ef5350',
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 12,
                        font: { size: 12 },
                        color: '#33691e',
                        usePointStyle: true,
                        pointStyle: 'circle',
                    }
                },
                tooltip: {
                    backgroundColor: '#1b5e20',
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed}`
                    }
                }
            }
        }
    });
}


// ============================================
// RENDER INSIGHTS
// ============================================
function renderInsights(data) {
    const container = document.getElementById('insightsList');
    const insights = [];
    
    // Insight 1: Top skill
    if (data.top_skills && data.top_skills.length > 0) {
        const topSkill = data.top_skills[0];
        insights.push({
            icon: 'fa-fire',
            title: `Most in-demand skill: ${topSkill.skill_name}`,
            text: `${topSkill.demand_percentage}% of jobs require this skill. Consider strengthening it!`
        });
    }
    
    // Insight 2: Application success
    if (data.applications.total > 0) {
        insights.push({
            icon: 'fa-chart-line',
            title: `Success rate: ${data.applications.success_rate}%`,
            text: `You've applied to ${data.applications.total} jobs. ${data.applications.interview} interviews, ${data.applications.offer} offers so far.`
        });
    } else {
        insights.push({
            icon: 'fa-lightbulb',
            title: 'Start applying to jobs',
            text: 'You haven\'t applied to any jobs yet. Browse matches to get started!'
        });
    }
    
    // Insight 3: Job quality
    const verifiedRatio = data.overview.total_jobs > 0 
        ? Math.round((data.overview.verified_jobs / data.overview.total_jobs) * 100)
        : 0;
    insights.push({
        icon: 'fa-shield-halved',
        title: `${verifiedRatio}% of jobs are verified`,
        text: `${data.overview.verified_jobs} of ${data.overview.total_jobs} jobs are from verified companies. ${data.overview.suspicious_jobs} flagged as suspicious.`
    });
    
    // Insight 4: Skill coverage
    if (data.overview.user_skills > 0) {
        insights.push({
            icon: 'fa-graduation-cap',
            title: `You have ${data.overview.user_skills} skills`,
            text: 'Keep adding skills to improve your match scores with top jobs.'
        });
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-icon">
                <i class="fa-solid ${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        </div>
    `).join('');
}


// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}