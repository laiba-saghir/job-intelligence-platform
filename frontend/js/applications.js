// ============================================
// APPLICATIONS PAGE - LOGIC
// ============================================

let allApplications = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }
    
    await loadUserInfo();
    await loadApplications();
    await loadStats();
    
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('updateForm').addEventListener('submit', handleUpdate);
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
// LOAD APPLICATIONS
// ============================================
async function loadApplications() {
    const container = document.getElementById('applicationsList');
    
    try {
        allApplications = await apiCall('/applications/') || [];
        renderApplications();
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Failed to load applications</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ============================================
// LOAD STATS
// ============================================
async function loadStats() {
    try {
        const stats = await apiCall('/applications/stats/me');
        document.getElementById('statTotal').textContent = stats.total_applications;
        document.getElementById('statApplied').textContent = stats.applied;
        document.getElementById('statInterview').textContent = stats.interview;
        document.getElementById('statOffer').textContent = stats.offer + stats.accepted;
    } catch (error) {
        console.error('Stats error:', error);
    }
}


// ============================================
// RENDER APPLICATIONS
// ============================================
function renderApplications() {
    const container = document.getElementById('applicationsList');
    
    let filtered = allApplications;
    
    if (currentFilter !== 'all') {
        filtered = allApplications.filter(app => app.status === currentFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-file-lines"></i>
                <h3>No applications ${currentFilter !== 'all' ? `with status "${currentFilter}"` : 'yet'}</h3>
                <p>Apply to jobs from the Jobs page</p>
                <button onclick="window.location.href='jobs.html'">Browse Jobs</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(app => renderAppCard(app)).join('');
}


// ============================================
// RENDER APP CARD
// ============================================
function renderAppCard(app) {
    const statusColors = {
        'applied': 'status-applied',
        'interview': 'status-interview',
        'offer': 'status-offer',
        'accepted': 'status-accepted',
        'rejected': 'status-rejected',
    };
    
    const statusClass = statusColors[app.status] || 'status-applied';
    const appliedDate = new Date(app.applied_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    
    return `
        <div class="app-card">
            <div class="app-info">
                <div class="app-header">
                    <div class="app-title">${escapeHtml(app.job_title)}</div>
                    <span class="status-badge ${statusClass}">${app.status}</span>
                </div>
                <div class="app-company">
                    <i class="fa-solid fa-building"></i>
                    ${escapeHtml(app.company)}
                    ${app.location ? ` • ${escapeHtml(app.location)}` : ''}
                </div>
                <div class="app-meta">
                    <span><i class="fa-solid fa-calendar"></i> Applied: ${appliedDate}</span>
                </div>
                ${app.notes ? `<div class="app-notes">"${escapeHtml(app.notes)}"</div>` : ''}
            </div>
            <div class="app-actions">
                <button class="btn-status" onclick="openUpdateModal(${app.id}, '${app.status}', '${escapeHtml(app.notes || '').replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-pen"></i>
                    Update
                </button>
                <button class="btn-delete-sm" onclick="deleteApplication(${app.id})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}


// ============================================
// SWITCH FILTER
// ============================================
function switchFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    renderApplications();
}


// ============================================
// SEARCH
// ============================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const container = document.getElementById('applicationsList');
    
    if (!query) {
        renderApplications();
        return;
    }
    
    const filtered = allApplications.filter(app => 
        app.job_title.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>No results found</h3>
                <p>Try different keywords</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(app => renderAppCard(app)).join('');
}


// ============================================
// UPDATE MODAL
// ============================================
function openUpdateModal(appId, currentStatus, currentNotes) {
    document.getElementById('updateAppId').value = appId;
    document.getElementById('updateStatus').value = currentStatus;
    document.getElementById('updateNotes').value = currentNotes;
    document.getElementById('updateModal').classList.add('active');
}

function closeUpdateModal() {
    document.getElementById('updateModal').classList.remove('active');
}


// ============================================
// HANDLE UPDATE
// ============================================
async function handleUpdate(e) {
    e.preventDefault();
    
    const appId = document.getElementById('updateAppId').value;
    const status = document.getElementById('updateStatus').value;
    const notes = document.getElementById('updateNotes').value.trim();
    const submitBtn = e.target.querySelector('.btn-primary-modal');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        await apiCall(`/applications/${appId}`, 'PUT', {
            status: status,
            notes: notes || null,
        });
        
        closeUpdateModal();
        await loadApplications();
        await loadStats();
        showToast('Application updated!', 'success');
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}


// ============================================
// DELETE APPLICATION
// ============================================
async function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
        await apiCall(`/applications/${appId}`, 'DELETE');
        await loadApplications();
        await loadStats();
        showToast('Application deleted', 'info');
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
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
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

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});