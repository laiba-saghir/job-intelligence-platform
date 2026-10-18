// ============================================
// JOBCOCOON DASHBOARD - LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // ========================================
    // AUTH CHECK
    // ========================================
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }
    
    // ========================================
    // LOAD USER INFO
    // ========================================
    await loadUserInfo();
    
    // ========================================
    // LOAD DASHBOARD DATA
    // ========================================
    await loadDashboard();
    
});


// ============================================
// LOAD USER INFO
// ============================================
async function loadUserInfo() {
    try {
        const user = await getCurrentUser();
        
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('welcomeName').textContent = user.name.split(' ')[0];
        
        // Avatar initial
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
        
    } catch (error) {
        console.error('Failed to load user:', error);
    }
}


// ============================================
// LOAD DASHBOARD DATA
// ============================================
async function loadDashboard() {
    try {
        const data = await apiCall('/analytics/dashboard');
        
        // ========================================
        // METRICS
        // ========================================
        updateMetric('metricJobs', data.overview.total_jobs, `${data.overview.verified_jobs} verified`);
        updateMetric('metricApps', data.overview.total_applications, `${data.applications.interview} interviews`);
        updateMetric('metricSkills', data.overview.user_skills, `${data.overview.total_skills} total skills`);
        updateMetric('metricSuccess', `${data.applications.success_rate}%`, `Interview rate: ${data.applications.interview_rate}%`);
        
        // ========================================
        // TREND CHART
        // ========================================
        renderTrendChart(data.recent_trends);
        
        // ========================================
        // SKILLS LIST
        // ========================================
        renderSkills(data.top_skills);
        
        // ========================================
        // JOBS (Best Matches)
        // ========================================
        await loadBestMatches();
        
        // ========================================
        // COMPANIES + SALARY
        // ========================================
        await loadJobsData();
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        showError(error.message);
    }
}


// ============================================
// UPDATE METRIC CARD
// ============================================
function updateMetric(elementId, value, changeText) {
    const valueEl = document.getElementById(elementId);
    const changeEl = document.getElementById(elementId + 'Change');
    
    // Animate count
    if (typeof value === 'number') {
        animateCount(valueEl, value);
    } else {
        valueEl.textContent = value;
    }
    
    changeEl.textContent = changeText;
    changeEl.className = 'metric-change';
}


// ============================================
// ANIMATE NUMBER
// ============================================
function animateCount(element, target) {
    const duration = 800;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}


// ============================================
// RENDER TREND CHART
// ============================================
function renderTrendChart(trends) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Labels (dates)
    const labels = trends.map(t => {
        const date = new Date(t.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const values = trends.map(t => t.count);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jobs',
                data: values,
                borderColor: '#66bb6a',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#66bb6a',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                    callbacks: {
                        label: (context) => `${context.parsed.y} jobs`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#689f38',
                        font: { size: 11 },
                        stepSize: 1,
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)',
                        drawBorder: false,
                    }
                },
                x: {
                    ticks: {
                        color: '#689f38',
                        font: { size: 11 },
                    },
                    grid: { display: false }
                }
            }
        }
    });
}


// ============================================
// RENDER SKILLS
// ============================================
function renderSkills(skills) {
    const container = document.getElementById('skillsList');
    
    if (!skills || skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-graduation-cap"></i>
                <h3>No skills data</h3>
                <p>Add skills to jobs to see demand</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = skills.slice(0, 5).map(skill => `
        <div class="skill-item" onclick="filterBySkill('${skill.skill_name}')">
            <div class="skill-header">
                <span class="skill-name">${skill.skill_name}</span>
                <span class="skill-percent">${skill.demand_percentage}%</span>
            </div>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" style="width: ${skill.demand_percentage}%"></div>
            </div>
        </div>
    `).join('');
}


// ============================================
// FILTER BY SKILL
// ============================================
function filterBySkill(skillName) {
    window.location.href = `jobs.html?skill=${encodeURIComponent(skillName)}`;
}


// ============================================
// LOAD BEST MATCHES
// ============================================
async function loadBestMatches() {
    const container = document.getElementById('jobsList');
    
    try {
        const data = await apiCall('/jobs/matched/for-me?limit=5');
        
        if (!data.jobs || data.jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-briefcase"></i>
                    <h3>No matched jobs yet</h3>
                    <p>Add skills to your profile to see matches</p>
                    <button onclick="window.location.href='skills.html'">
                        Add Skills
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = data.jobs.map(job => {
            const matchClass = job.match_score >= 85 ? 'match-high' :
                              job.match_score >= 70 ? 'match-medium' : 'match-low';
            
            return `
                <div class="job-row">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company} • ${job.location || 'Remote'}</div>
                    </div>
                    <div class="job-salary">${job.salary_range || 'Not specified'}</div>
                    <div class="match-badge ${matchClass}">
                        ${job.match_score}% match
                    </div>
                    <button class="bookmark-btn" onclick="toggleBookmark(this, ${job.job_id})">
                        <i class="fa-regular fa-bookmark"></i>
                    </button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Failed to load jobs</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ============================================
// LOAD JOBS DATA (Companies + Salary)
// ============================================
async function loadJobsData() {
    try {
        const jobs = await apiCall('/jobs/');
        
        if (!jobs || jobs.length === 0) {
            renderEmptyCompanies();
            renderEmptySalary();
            return;
        }
        
        // Top Companies
        const companyCount = {};
        jobs.forEach(job => {
            companyCount[job.company] = (companyCount[job.company] || 0) + 1;
        });
        
        const topCompanies = Object.entries(companyCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
        
        renderCompanies(topCompanies);
        
        // Salary Range
        const salaryJobs = jobs
            .filter(j => j.salary_range && j.salary_range.match(/\d/))
            .slice(0, 4);
        
        renderSalary(salaryJobs);
        
    } catch (error) {
        console.error('Jobs data error:', error);
    }
}


// ============================================
// RENDER COMPANIES
// ============================================
function renderCompanies(companies) {
    const container = document.getElementById('companiesList');
    
    const colors = ['#66bb6a', '#81c784', '#a5d6a7', '#4caf50'];
    
    container.innerHTML = companies.map((company, index) => {
        const initials = company.name.split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        
        return `
            <div class="company-item">
                <div class="company-logo" style="background: ${colors[index % colors.length]}">
                    ${initials}
                </div>
                <div class="company-info">
                    <div class="company-name">${company.name}</div>
                    <div class="company-jobs">${company.count} jobs</div>
                </div>
            </div>
        `;
    }).join('');
}


// ============================================
// RENDER SALARY
// ============================================
function renderSalary(jobs) {
    const container = document.getElementById('salaryList');
    
    container.innerHTML = jobs.map(job => {
        // Parse salary range (basic)
        const numbers = job.salary_range.match(/\d[\d,]*/g) || [];
        const max = numbers.length > 0 ? parseInt(numbers[numbers.length - 1].replace(/,/g, '')) : 100000;
        const percentage = Math.min((max / 400000) * 100, 100);
        
        return `
            <div class="salary-item">
                <div class="salary-header">
                    <span class="salary-role">${job.title}</span>
                    <span class="salary-range-text">${job.salary_range}</span>
                </div>
                <div class="salary-bar-bg">
                    <div class="salary-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// ============================================
// EMPTY STATES
// ============================================
function renderEmptyCompanies() {
    document.getElementById('companiesList').innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-building"></i>
            <h3>No companies yet</h3>
            <p>Add jobs to see top companies</p>
        </div>
    `;
}

function renderEmptySalary() {
    document.getElementById('salaryList').innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-dollar-sign"></i>
            <h3>No salary data</h3>
            <p>Add jobs with salary info</p>
        </div>
    `;
}


// ============================================
// BOOKMARK TOGGLE
// ============================================
function toggleBookmark(btn, jobId) {
    btn.classList.toggle('bookmarked');
    const icon = btn.querySelector('i');
    
    if (btn.classList.contains('bookmarked')) {
        icon.className = 'fa-solid fa-bookmark';
        console.log('Bookmarked job:', jobId);
    } else {
        icon.className = 'fa-regular fa-bookmark';
        console.log('Removed bookmark:', jobId);
    }
}


// ============================================
// SHOW ERROR
// ============================================
function showError(message) {
    console.error('Dashboard error:', message);
}