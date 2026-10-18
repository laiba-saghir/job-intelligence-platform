// ============================================
// JOBS PAGE - LOGIC
// ============================================

let allJobs = [];
let matchedJobs = [];
let currentFilter = 'all';
let savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }
    
    await loadUserInfo();
    await loadJobs();
    
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('addJobForm').addEventListener('submit', handleAddJob);
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
// LOAD JOBS
// ============================================
async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    
    try {
        const [jobs, matched] = await Promise.all([
            apiCall('/jobs/'),
            apiCall('/jobs/matched/for-me?limit=100').catch(() => ({ jobs: [] }))
        ]);
        
        allJobs = jobs || [];
        matchedJobs = matched.jobs || [];
        
        renderJobs();
        
    } catch (error) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Failed to load jobs</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ============================================
// RENDER JOBS
// ============================================
function renderJobs() {
    const grid = document.getElementById('jobsGrid');
    let jobsToRender = [];
    
    if (currentFilter === 'matched') {
        jobsToRender = matchedJobs.map(m => {
            const job = allJobs.find(j => j.id === m.job_id) || { id: m.job_id, ...m };
            return { ...job, match_score: m.match_score, matched_skills: m.matched_skills, missing_skills: m.missing_skills };
        });
    } else if (currentFilter === 'verified') {
        jobsToRender = allJobs.filter(j => j.is_verified);
    } else {
        jobsToRender = allJobs.map(job => {
            const match = matchedJobs.find(m => m.job_id === job.id);
            return {
                ...job,
                match_score: match ? match.match_score : 0,
                matched_skills: match ? match.matched_skills : [],
                missing_skills: match ? match.missing_skills : []
            };
        });
    }
    
    jobsToRender.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    
    if (jobsToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fa-solid fa-briefcase"></i>
                <h3>No jobs found</h3>
                <p>Click "Add Job" to start tracking</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = jobsToRender.map(job => renderJobCard(job)).join('');
}


// ============================================
// RENDER JOB CARD
// ============================================
function renderJobCard(job) {
    const matchScore = job.match_score || 0;
    const matchClass = matchScore >= 85 ? 'match-high' :
                       matchScore >= 70 ? 'match-medium' : 'match-low';
    
    const isSaved = savedJobIds.includes(job.id);
    
    const matchedChips = (job.matched_skills || []).map(s => 
        `<span class="skill-chip">${s}</span>`
    ).join('');
    const missingChips = (job.missing_skills || []).map(s => 
        `<span class="skill-chip missing">${s}</span>`
    ).join('');
    
    return `
        <div class="job-card">
            <div class="job-card-header">
                <div>
                    <div class="job-card-title">${escapeHtml(job.title)}</div>
                    <div class="job-card-company">
                        <i class="fa-solid fa-building"></i>
                        ${escapeHtml(job.company)}
                    </div>
                </div>
                ${matchScore > 0 ? `<div class="match-badge-lg ${matchClass}">${matchScore}% match</div>` : ''}
            </div>
            
            <div class="job-card-meta">
                ${job.location ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.location)}</span>` : ''}
                ${job.salary_range ? `<span><i class="fa-solid fa-money-bill"></i>${escapeHtml(job.salary_range)}</span>` : ''}
                ${job.source ? `<span><i class="fa-solid fa-link"></i>${escapeHtml(job.source)}</span>` : ''}
            </div>
            
            ${(matchedChips || missingChips) ? `
                <div class="skill-chips">
                    ${matchedChips}
                    ${missingChips}
                </div>
            ` : ''}
            
            <div class="job-card-actions">
                <button class="btn-view" onclick="viewJob(${job.id})">
                    <i class="fa-solid fa-eye"></i>
                    View Details
                </button>
                <button class="btn-icon ${isSaved ? 'bookmarked' : ''}" onclick="toggleSaveJob(${job.id}, this)" title="Save">
                    <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                </button>
                <button class="btn-icon" onclick="reportJob(${job.id})" title="Report">
                    <i class="fa-regular fa-flag"></i>
                </button>
            </div>
        </div>
    `;
}


// ============================================
// SWITCH FILTER TAB
// ============================================
function switchFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    renderJobs();
}


// ============================================
// SEARCH
// ============================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        renderJobs();
        return;
    }
    
    const filtered = allJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query))
    );
    
    const grid = document.getElementById('jobsGrid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>No results found</h3>
                <p>Try different keywords</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(job => {
        const match = matchedJobs.find(m => m.job_id === job.id);
        return renderJobCard({
            ...job,
            match_score: match ? match.match_score : 0,
            matched_skills: match ? match.matched_skills : [],
            missing_skills: match ? match.missing_skills : []
        });
    }).join('');
}


// ============================================
// ADD JOB MODAL
// ============================================
function openAddJobModal() {
    document.getElementById('addJobModal').classList.add('active');
}

function closeAddJobModal() {
    document.getElementById('addJobModal').classList.remove('active');
    document.getElementById('addJobForm').reset();
}


// ============================================
// HANDLE ADD JOB
// ============================================
async function handleAddJob(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.btn-primary-modal');
    const originalText = submitBtn.textContent;
    
    const jobData = {
        title: document.getElementById('jobTitle').value.trim(),
        company: document.getElementById('jobCompany').value.trim(),
        location: document.getElementById('jobLocation').value.trim() || null,
        salary_range: document.getElementById('jobSalary').value.trim() || null,
        source: document.getElementById('jobSource').value.trim() || null,
        url: document.getElementById('jobUrl').value.trim() || null,
        description: document.getElementById('jobDescription').value.trim() || null,
    };
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        const newJob = await apiCall('/jobs/', 'POST', jobData);
        
        const skillsInput = document.getElementById('jobSkills').value.trim();
        if (skillsInput) {
            const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
            if (skills.length > 0) {
                await apiCall(`/jobs/${newJob.id}/skills`, 'POST', { skill_names: skills });
            }
        }
        
        closeAddJobModal();
        await loadJobs();
        showToast('Job added successfully!', 'success');
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}


// ============================================
// VIEW JOB DETAILS
// ============================================
async function viewJob(jobId) {
    const modal = document.getElementById('jobDetailModal');
    const content = document.getElementById('jobDetailContent');
    
    content.innerHTML = `<div style="padding: 60px; text-align: center;"><div class="loading-spinner"></div></div>`;
    modal.classList.add('active');
    
    try {
        const [job, matched] = await Promise.all([
            apiCall(`/jobs/${jobId}`),
            apiCall('/jobs/matched/for-me?limit=100').catch(() => ({ jobs: [] }))
        ]);
        
        const matchInfo = matched.jobs.find(m => m.job_id === jobId);
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>${escapeHtml(job.title)}</h2>
                <button class="modal-close" onclick="closeJobDetail()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px;">
                    <div class="job-card-company" style="margin-bottom: 12px;">
                        <i class="fa-solid fa-building"></i>
                        ${escapeHtml(job.company)}
                    </div>
                    ${matchInfo ? `<div class="match-badge-lg ${matchInfo.match_score >= 85 ? 'match-high' : matchInfo.match_score >= 70 ? 'match-medium' : 'match-low'}" style="display: inline-block;">${matchInfo.match_score}% match</div>` : ''}
                </div>
                
                <div class="job-card-meta" style="margin-bottom: 20px;">
                    ${job.location ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.location)}</span>` : ''}
                    ${job.salary_range ? `<span><i class="fa-solid fa-money-bill"></i>${escapeHtml(job.salary_range)}</span>` : ''}
                </div>
                
                ${job.description ? `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 14px; color: var(--heading); margin-bottom: 8px;">Description</h3>
                        <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6;">${escapeHtml(job.description)}</p>
                    </div>
                ` : ''}
                
                ${matchInfo && matchInfo.matched_skills.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <h3 style="font-size: 14px; color: var(--heading); margin-bottom: 8px;">✅ Matched Skills</h3>
                        <div class="skill-chips">${matchInfo.matched_skills.map(s => `<span class="skill-chip">${s}</span>`).join('')}</div>
                    </div>
                ` : ''}
                
                ${matchInfo && matchInfo.missing_skills.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 14px; color: var(--heading); margin-bottom: 8px;">⚠️ Missing Skills</h3>
                        <div class="skill-chips">${matchInfo.missing_skills.map(s => `<span class="skill-chip missing">${s}</span>`).join('')}</div>
                    </div>
                ` : ''}
                
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="closeJobDetail()">Close</button>
                    <button type="button" class="btn-primary-modal" onclick="applyToJob(${jobId})">
                        <i class="fa-solid fa-paper-plane"></i>
                        Apply Now
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `<div style="padding: 40px; text-align: center;"><p>${error.message}</p></div>`;
    }
}

function closeJobDetail() {
    document.getElementById('jobDetailModal').classList.remove('active');
}


// ============================================
// APPLY TO JOB
// ============================================
async function applyToJob(jobId) {
    try {
        await apiCall('/applications/', 'POST', { job_id: jobId, notes: '' });
        showToast('Applied successfully! Check Applications page.', 'success');
        closeJobDetail();
    } catch (error) {
        if (error.message.includes('already applied')) {
            showToast('You already applied to this job', 'warning');
        } else {
            showToast(error.message, 'error');
        }
    }
}


// ============================================
// SAVE/BOOKMARK JOB
// ============================================
function toggleSaveJob(jobId, btn) {
    const index = savedJobIds.indexOf(jobId);
    
    if (index > -1) {
        savedJobIds.splice(index, 1);
        btn.classList.remove('bookmarked');
        btn.querySelector('i').className = 'fa-regular fa-bookmark';
        showToast('Removed from saved', 'info');
    } else {
        savedJobIds.push(jobId);
        btn.classList.add('bookmarked');
        btn.querySelector('i').className = 'fa-solid fa-bookmark';
        showToast('Job saved!', 'success');
    }
    
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
}


// ============================================
// REPORT JOB
// ============================================
async function reportJob(jobId) {
    const reason = prompt('Why are you reporting this job? (e.g., fake, spam, expired)');
    if (!reason) return;
    
    try {
        await apiCall(`/jobs/${jobId}/report`, 'POST', { reason });
        showToast('Report submitted. Thank you!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}


// ============================================
// HELPERS
// ============================================
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10b981