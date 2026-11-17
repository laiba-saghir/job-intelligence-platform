// JobCocoon Jobs: one matching request, server search, pagination, filters and application tracking.
const JOBS_PAGE_SIZE = 20;
let allJobs = [], matchedJobs = [], appliedJobIds = new Set(), savedJobIds = new Set();
let currentFilter = 'all', currentSkip = 0, hasMoreJobs = false, totalJobs = null;
let activeSkillFilter = '', currentUser = null, loadingJobs = false, searchTimer = null;
let currentSearchController = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) { location.href = '../index.html'; return; }
  const search = document.getElementById('searchInput');
  search?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadJobs(true), 350);
  });
  document.getElementById('addJobForm')?.addEventListener('submit', handleAddJob);
  document.getElementById('loadMoreBtn')?.addEventListener('click', () => loadJobs(false));
  document.getElementById('clearSkillFilter')?.addEventListener('click', () => {
    const url = new URL(location.href); url.searchParams.delete('skill'); location.href = url.pathname;
  });
  const params = new URLSearchParams(location.search);
  activeSkillFilter = params.get('skill') || '';
  if (activeSkillFilter) {
    document.getElementById('activeSkillFilter').hidden = false;
    document.getElementById('activeSkillName').textContent = activeSkillFilter;
  }
  await loadUserInfo();
  // These are fetched once per page visit; pagination never repeats them.
  await Promise.all([loadAppliedIds(), loadSavedIds(), loadMatchedJobs()]);
  await loadJobs(true);
});

async function loadUserInfo() {
  try {
    currentUser = await getCurrentUser();
    document.getElementById('userName').textContent = currentUser.name || 'User';
    document.getElementById('userEmail').textContent = currentUser.email || '';
    document.getElementById('userAvatar').textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
    const admin = currentUser.role === 'admin' || currentUser.is_admin === true;
    const add = document.getElementById('addJobBtn');
    if (add) add.hidden = !admin;
  } catch (e) { console.warn('User info unavailable:', e.message); }
}
async function loadAppliedIds() {
  try { const apps = await apiCall('/applications/'); (apps || []).forEach(a => appliedJobIds.add(Number(a.job_id))); }
  catch (e) { console.warn('Applied-job exclusion needs backend support:', e.message); }
}
async function loadSavedIds() {
  try {
    const data = await apiCall('/saved-jobs/');
    (Array.isArray(data) ? data : (data.jobs || [])).forEach(x => savedJobIds.add(Number(x.job_id || (x.job || x).id)));
  } catch (_) {
    try { JSON.parse(localStorage.getItem('savedJobs') || '[]').forEach(id => savedJobIds.add(Number(id))); } catch (_) {}
  }
}
async function loadMatchedJobs() {
  try {
    const data = await apiCall('/jobs/matched/for-me?skip=0&limit=100');
    matchedJobs = Array.isArray(data) ? data : (data.jobs || []);
  } catch (e) { matchedJobs = []; console.warn('Matching data unavailable:', e.message); }
}
async function loadJobs(reset = false) {
  if (loadingJobs) return;
  loadingJobs = true;
  const grid = document.getElementById('jobsGrid'), more = document.getElementById('loadMoreBtn');
  if (reset) {
    currentSearchController?.abort();
    currentSkip = 0; allJobs = []; totalJobs = null;
    grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';
  }
  if (more) { more.disabled = true; more.textContent = 'Loading...'; }
  const controller = new AbortController(); currentSearchController = controller;
  try {
    const params = new URLSearchParams({skip: String(currentSkip), limit: String(JOBS_PAGE_SIZE)});
    const q = document.getElementById('searchInput')?.value.trim();
    if (q) params.set('search', q);
    if (activeSkillFilter) params.set('skill', activeSkillFilter);
    const page = await apiCall('/jobs/?' + params.toString(), 'GET', null, {signal: controller.signal});
    const batch = Array.isArray(page) ? page : (page.jobs || page.items || []);
    totalJobs = Number.isFinite(Number(page.total_count ?? page.total ?? page.count)) ? Number(page.total_count ?? page.total ?? page.count) : null;
    const existing = new Set(allJobs.map(j => Number(j.id)));
    batch.forEach(job => { if (!existing.has(Number(job.id))) allJobs.push(job); });
    currentSkip += batch.length;
    hasMoreJobs = totalJobs !== null ? currentSkip < totalJobs : batch.length === JOBS_PAGE_SIZE;
    renderJobs();
  } catch (e) {
    if (e.name !== 'AbortError') {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><h3>Could not load jobs</h3><p>' + escapeHtml(e.message) + '</p></div>';
    }
  } finally {
    loadingJobs = false;
    if (more) { more.hidden = !hasMoreJobs; more.disabled = false; more.textContent = 'Load More Jobs'; }
  }
}
function decorateJob(job) {
  const match = matchedJobs.find(m => Number(m.job_id || m.id) === Number(job.id));
  return {...job, match_score: match?.match_score ?? job.match_score ?? 0,
    matched_skills: match?.matched_skills || job.matched_skills || [],
    missing_skills: match?.missing_skills || job.missing_skills || []};
}
function renderJobs() {
  const grid = document.getElementById('jobsGrid');
  let jobs = allJobs.map(decorateJob).filter(j => !appliedJobIds.has(Number(j.id)));
  if (currentFilter === 'matched') jobs = jobs.filter(j => Number(j.match_score) > 0);
  if (currentFilter === 'verified') jobs = jobs.filter(j => j.is_verified === true);
  if (activeSkillFilter) jobs = jobs.filter(j =>
    (j.matched_skills || []).some(s => String(s).toLowerCase() === activeSkillFilter.toLowerCase()) ||
    (j.skills || []).some(s => String(s.name || s).toLowerCase() === activeSkillFilter.toLowerCase()));
  jobs.sort((a,b) => Number(b.match_score || 0) - Number(a.match_score || 0));
  const count = totalJobs === null ? jobs.length : totalJobs;
  document.getElementById('jobsCount').textContent = jobs.length + ' shown' + (totalJobs !== null ? ' · ' + count + ' total' : '');
  if (!jobs.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-briefcase"></i><h3>No jobs found</h3><p>Try another search or update your skills.</p><a href="skills.html">Update skills</a></div>';
    return;
  }
  grid.innerHTML = jobs.map(renderJobCard).join('');
}
function renderJobCard(job) {
  const score = Number(job.match_score) || 0, matchClass = score >= 85 ? 'match-high' : score >= 70 ? 'match-medium' : 'match-low';
  const saved = savedJobIds.has(Number(job.id)), admin = currentUser?.role === 'admin' || currentUser?.is_admin === true;
  const chips = [...(job.matched_skills || []).map(s => '<span class="skill-chip">' + escapeHtml(s) + '</span>'),
    ...(job.missing_skills || []).map(s => '<span class="skill-chip missing">' + escapeHtml(s) + '</span>')].join('');
  return '<article class="job-card"><div class="job-card-header"><div><div class="job-card-title">' + escapeHtml(job.title) + '</div><div class="job-card-company"><i class="fa-solid fa-building"></i> ' + escapeHtml(job.company) + '</div></div>' +
    (score ? '<div class="match-badge-lg ' + matchClass + '">' + score + '% match</div>' : '') + '</div><div class="job-card-meta">' +
    (job.location ? '<span><i class="fa-solid fa-location-dot"></i> ' + escapeHtml(job.location) + '</span>' : '') +
    (job.salary_range ? '<span><i class="fa-solid fa-money-bill"></i> ' + escapeHtml(job.salary_range) + '</span>' : '') +
    (job.source ? '<span><i class="fa-solid fa-link"></i> ' + escapeHtml(job.source) + '</span>' : '') +
    '</div>' + (chips ? '<div class="skill-chips">' + chips + '</div>' : '') +
    '<div class="job-card-actions"><button class="btn-view" onclick="viewJob(' + Number(job.id) + ')"><i class="fa-solid fa-eye"></i> View Details</button>' +
    '<button class="btn-icon ' + (saved ? 'bookmarked' : '') + '" onclick="toggleSaveJob(' + Number(job.id) + ',this)" title="Save job"><i class="' + (saved ? 'fa-solid' : 'fa-regular') + ' fa-bookmark"></i></button>' +
    '<button class="btn-icon" onclick="reportJob(' + Number(job.id) + ')" title="Report"><i class="fa-regular fa-flag"></i></button>' +
    (admin ? '<button class="btn-icon" onclick="editJob(' + Number(job.id) + ')" title="Edit job"><i class="fa-solid fa-pen"></i></button><button class="btn-icon" onclick="deleteJob(' + Number(job.id) + ')" title="Delete job"><i class="fa-solid fa-trash"></i></button>' : '') +
    '</div></article>';
}
function switchFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
  renderJobs();
}
async function viewJob(id) {
  const modal = document.getElementById('jobDetailModal'), content = document.getElementById('jobDetailContent');
  modal.classList.add('active'); content.innerHTML = '<div style="padding:40px;text-align:center">Loading...</div>';
  try {
    const job = await apiCall('/jobs/' + id), decorated = decorateJob(job), url = safeExternalUrl(job.url);
    const admin = currentUser?.role === 'admin' || currentUser?.is_admin === true;
    content.innerHTML = '<div class="modal-header"><h2>' + escapeHtml(job.title) + '</h2><button class="modal-close" onclick="closeJobDetail()"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-body"><p><strong>' + escapeHtml(job.company) + '</strong> · ' + escapeHtml(job.location || 'Remote') + '</p>' +
      (job.salary_range ? '<p>' + escapeHtml(job.salary_range) + '</p>' : '') + (job.description ? '<h3>Description</h3><p>' + escapeHtml(job.description) + '</p>' : '') +
      (decorated.matched_skills.length ? '<h3>Matched skills</h3><div class="skill-chips">' + decorated.matched_skills.map(s => '<span class="skill-chip">' + escapeHtml(s) + '</span>').join('') + '</div>' : '') +
      '<div class="modal-footer"><button class="btn-cancel" onclick="closeJobDetail()">Close</button>' +
      (admin ? '<button class="btn-cancel" onclick="editJob(' + id + ')">Edit</button>' : '') +
      '<button class="btn-primary-modal" onclick="applyToJob(' + id + ')"><i class="fa-solid fa-arrow-up-right-from-square"></i> ' + (url ? 'Track & Open Original Posting' : 'Track Application') + '</button></div></div>';
  } catch (e) { content.innerHTML = '<div class="modal-body"><p>' + escapeHtml(e.message) + '</p></div>'; }
}
function closeJobDetail() { document.getElementById('jobDetailModal').classList.remove('active'); }
async function applyToJob(id) {
  const job = allJobs.find(j => Number(j.id) === Number(id));
  const url = safeExternalUrl(job?.url);
  // Hide immediately for a responsive UI; restore if the API rejects the application.
  appliedJobIds.add(Number(id)); renderJobs(); closeJobDetail();
  try {
    await apiCall('/applications/', 'POST', {job_id:id, notes:'Applied from JobCocoon. Original posting: ' + (url || 'not provided')});
    showToast('Application tracked. Opening original posting if available.', 'success');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    if (!/already applied/i.test(e.message)) {
      appliedJobIds.delete(Number(id)); renderJobs(); showToast(e.message, 'error'); return;
    }
    showToast('This job is already in your applications.', 'info');
  }
}
async function toggleSaveJob(id, btn) {
  try {
    if (savedJobIds.has(Number(id))) {
      await apiCall('/saved-jobs/' + id, 'DELETE'); savedJobIds.delete(Number(id));
      btn?.classList.remove('bookmarked'); if (btn) btn.querySelector('i').className = 'fa-regular fa-bookmark';
      showToast('Removed from Saved Jobs', 'info');
    } else {
      await apiCall('/saved-jobs/', 'POST', {job_id:id}); savedJobIds.add(Number(id));
      btn?.classList.add('bookmarked'); if (btn) btn.querySelector('i').className = 'fa-solid fa-bookmark';
      showToast('Job saved', 'success');
    }
  } catch (e) { showToast('Saved Jobs API needs backend Day 12: ' + e.message, 'warning'); }
}
async function handleAddJob(e) {
  e.preventDefault();
  const admin = currentUser?.role === 'admin' || currentUser?.is_admin === true;
  if (!admin) { showToast('Only admins can manage jobs.', 'error'); return; }
  const form = e.target, btn = form.querySelector('[type=submit]');
  const editingId = form.dataset.editingId;
  const payload = {
    title: document.getElementById('jobTitle').value.trim(), company: document.getElementById('jobCompany').value.trim(),
    location: document.getElementById('jobLocation').value.trim() || null, salary_range: document.getElementById('jobSalary').value.trim() || null,
    source: document.getElementById('jobSource').value.trim() || null, url: document.getElementById('jobUrl').value.trim() || null,
    description: document.getElementById('jobDescription').value.trim() || null
  };
  if (!payload.title || !payload.company) { showToast('Title and company are required.', 'error'); return; }
  try {
    btn.disabled = true; btn.textContent = editingId ? 'Updating...' : 'Adding...';
    const result = await apiCall(editingId ? '/jobs/' + editingId : '/jobs/', editingId ? 'PUT' : 'POST', payload);
    const jobId = Number(result.id || editingId);
    const skillNames = document.getElementById('jobSkills').value.split(',').map(x => x.trim()).filter(Boolean);
    if (jobId && skillNames.length) await apiCall('/jobs/' + jobId + '/skills', 'POST', {skill_names:skillNames});
    closeAddJobModal(); await loadJobs(true); showToast(editingId ? 'Job updated.' : 'Job added.', 'success');
  } catch (e) { showToast(e.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save Job'; }
}
async function editJob(id) {
  try {
    const job = await apiCall('/jobs/' + id);
    closeJobDetail();
    document.getElementById('jobTitle').value = job.title || '';
    document.getElementById('jobCompany').value = job.company || '';
    document.getElementById('jobLocation').value = job.location || '';
    document.getElementById('jobSalary').value = job.salary_range || '';
    document.getElementById('jobSource').value = job.source || '';
    document.getElementById('jobUrl').value = job.url || '';
    document.getElementById('jobDescription').value = job.description || '';
    document.getElementById('jobSkills').value = (job.skills || []).map(s => s.name || s).join(', ');
    document.getElementById('addJobForm').dataset.editingId = id;
    document.querySelector('#addJobModal .modal-header h2').textContent = 'Edit Job';
    document.querySelector('#addJobForm [type=submit]').textContent = 'Save Job';
    document.getElementById('addJobModal').classList.add('active');
  } catch (e) { showToast(e.message, 'error'); }
}
async function deleteJob(id) {
  if (!(currentUser?.role === 'admin' || currentUser?.is_admin === true)) return showToast('Admin access required.', 'error');
  if (!confirm('Delete this job? This action cannot be undone.')) return;
  try { await apiCall('/jobs/' + id, 'DELETE'); allJobs = allJobs.filter(j => Number(j.id) !== Number(id)); renderJobs(); showToast('Job deleted.', 'success'); }
  catch (e) { showToast(e.message, 'error'); }
}
function openAddJobModal() {
  const form = document.getElementById('addJobForm'); form.reset(); delete form.dataset.editingId;
  document.querySelector('#addJobModal .modal-header h2').textContent = 'Add New Job';
  document.querySelector('#addJobForm [type=submit]').textContent = 'Save Job';
  document.getElementById('addJobModal').classList.add('active');
}
function closeAddJobModal() { document.getElementById('addJobModal').classList.remove('active'); openAddJobModalReset(); }
function openAddJobModalReset() {
  const form = document.getElementById('addJobForm'); form.reset(); delete form.dataset.editingId;
  document.querySelector('#addJobModal .modal-header h2').textContent = 'Add New Job';
  document.querySelector('#addJobForm [type=submit]').textContent = 'Save Job';
}
async function reportJob(id) {
  const reason = prompt('Why are you reporting this job?'); if (!reason) return;
  try { await apiCall('/jobs/' + id + '/report', 'POST', {reason}); showToast('Report submitted', 'success'); }
  catch (e) { showToast(e.message, 'error'); }
}
function safeExternalUrl(value) { try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch (_) { return ''; } }
function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function showToast(message, type='info') {
  const el=document.createElement('div'); el.textContent=message;
  el.style.cssText='position:fixed;bottom:24px;right:24px;padding:14px 20px;background:'+(type==='success'?'#10b981':type==='error'?'#ef4444':type==='warning'?'#f59e0b':'#3b82f6')+';color:#fff;border-radius:10px;z-index:9999;max-width:90vw';
  document.body.appendChild(el); setTimeout(()=>el.remove(),3500);
}
document.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });
