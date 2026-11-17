// Saved Jobs page. Backend contract: GET /saved-jobs/ and DELETE /saved-jobs/{job_id}.
let savedJobs = [];
document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) { window.location.href = '../index.html'; return; }
  document.getElementById('refreshSaved').addEventListener('click', loadSavedJobs);
  document.getElementById('savedSearch').addEventListener('input', renderSavedJobs);
  await loadSavedUser();
  await loadSavedJobs();
});
async function loadSavedUser() {
  try {
    const user = await getCurrentUser();
    document.getElementById('userName').textContent = user.name || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
    document.getElementById('userAvatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
  } catch (error) { console.error('Could not load user:', error); }
}
async function loadSavedJobs() {
  const grid = document.getElementById('savedJobsGrid');
  grid.innerHTML = '<div class="saved-state">Loading your saved jobs...</div>';
  try {
    const result = await apiCall('/saved-jobs/');
    savedJobs = Array.isArray(result) ? result : (result.jobs || []);
    renderSavedJobs();
  } catch (error) {
    grid.innerHTML = '<div class="saved-state"><i class="fa-regular fa-bookmark"></i><h3>Saved jobs are not available yet</h3><p>The saved-jobs API will be connected when the backend work is completed.</p></div>';
    document.getElementById('savedCount').textContent = 'Saved jobs';
  }
}
function renderSavedJobs() {
  const grid = document.getElementById('savedJobsGrid');
  const query = document.getElementById('savedSearch').value.trim().toLowerCase();
  const filtered = savedJobs.filter(item => {
    const job = item.job || item;
    return [job.title, job.company, job.location].some(value => String(value || '').toLowerCase().includes(query));
  });
  document.getElementById('savedCount').textContent = filtered.length + (filtered.length === 1 ? ' saved job' : ' saved jobs');
  if (!filtered.length) {
    grid.innerHTML = '<div class="saved-state"><i class="fa-regular fa-bookmark"></i><h3>No saved jobs found</h3><p>Save jobs from the Jobs page and they will appear here.</p><a href="jobs.html">Explore jobs</a></div>';
    return;
  }
  grid.innerHTML = filtered.map(item => {
    const job = item.job || item;
    const id = Number(job.id || item.job_id);
    const title = escapeSaved(job.title || 'Untitled role');
    const company = escapeSaved(job.company || 'Company not specified');
    const location = escapeSaved(job.location || 'Location not specified');
    const url = safeJobUrl(job.url);
    return '<article class="saved-job-card"><div class="saved-job-icon"><i class="fa-solid fa-briefcase"></i></div><div class="saved-job-content"><h3>' + title + '</h3><p class="saved-company">' + company + '</p><p class="saved-location"><i class="fa-solid fa-location-dot"></i> ' + location + '</p><div class="saved-job-actions">' + (url ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer">Open posting <i class="fa-solid fa-arrow-up-right-from-square"></i></a>' : '') + '<button onclick="removeSavedJob(' + id + ')"><i class="fa-solid fa-bookmark"></i> Remove</button></div></div></article>';
  }).join('');
}
async function removeSavedJob(jobId) {
  try {
    await apiCall('/saved-jobs/' + jobId, 'DELETE');
    savedJobs = savedJobs.filter(item => Number((item.job || item).id || item.job_id) !== jobId);
    renderSavedJobs();
  } catch (error) { alert(error.message || 'Could not remove this saved job.'); }
}
function escapeSaved(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function safeJobUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch (_) { return ''; }
}