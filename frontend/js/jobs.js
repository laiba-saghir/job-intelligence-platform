// Jobs page: server-side search, pagination, filters, applied-job exclusion and matching.
const JOBS_PAGE_SIZE=20;
let allJobs=[],matchedJobs=[],appliedJobIds=new Set(),savedJobIds=new Set();
let currentFilter='all',currentSkip=0,hasMoreJobs=false,searchTimer=null,activeSkillFilter='';
let currentUser=null,loadingJobs=false;
document.addEventListener('DOMContentLoaded',async()=>{
 if(!isLoggedIn()){location.href='../index.html';return}
 document.getElementById('searchInput').addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{currentSkip=0;allJobs=[];loadJobs(true)},350)});
 document.getElementById('addJobForm').addEventListener('submit',handleAddJob);
 const params=new URLSearchParams(location.search);activeSkillFilter=params.get('skill')||'';
 if(activeSkillFilter){document.getElementById('activeSkillFilter').hidden=false;document.getElementById('activeSkillName').textContent=activeSkillFilter}
 document.getElementById('clearSkillFilter').addEventListener('click',()=>{location.href='jobs.html'});
 document.getElementById('loadMoreBtn').addEventListener('click',()=>loadJobs(false));
 document.getElementById('savedJobsLink')?.addEventListener('click',()=>location.href='saved-jobs.html');
 await loadUserInfo();await Promise.all([loadAppliedIds(),loadSavedIds()]);await loadJobs(true);
});
async function loadUserInfo(){try{currentUser=await getCurrentUser();document.getElementById('userName').textContent=currentUser.name||'User';document.getElementById('userEmail').textContent=currentUser.email||'';document.getElementById('userAvatar').textContent=(currentUser.name||'U')[0].toUpperCase();const admin=currentUser.role==='admin'||currentUser.is_admin===true;document.getElementById('addJobBtn').hidden=!admin}catch(e){console.warn(e)}}
async function loadAppliedIds(){try{const apps=await apiCall('/applications/');(apps||[]).forEach(a=>appliedJobIds.add(Number(a.job_id)))}catch(e){console.warn('Applied-job filter unavailable until backend support:',e.message)}}
async function loadSavedIds(){try{const data=await apiCall('/saved-jobs/');(Array.isArray(data)?data:(data.jobs||[])).forEach(x=>savedJobIds.add(Number(x.job_id||(x.job||x).id)))}catch(_){JSON.parse(localStorage.getItem('savedJobs')||'[]').forEach(id=>savedJobIds.add(Number(id)))}}
async function loadJobs(reset=false){
 if(loadingJobs)return;loadingJobs=true;const grid=document.getElementById('jobsGrid'),more=document.getElementById('loadMoreBtn');
 if(reset){currentSkip=0;allJobs=[];grid.innerHTML='<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>'}
 more.disabled=true;more.textContent='Loading...';
 try{
  const q=document.getElementById('searchInput').value.trim();
  const params=new URLSearchParams({skip:String(currentSkip),limit:String(JOBS_PAGE_SIZE)});if(q)params.set('search',q);
  const page=await apiCall('/jobs/?'+params.toString());const batch=Array.isArray(page)?page:(page.jobs||[]);
  hasMoreJobs=batch.length===JOBS_PAGE_SIZE;allJobs.push(...batch);currentSkip+=batch.length;
  try{const matched=await apiCall('/jobs/matched/for-me?limit=100');matchedJobs=matched.jobs||[]}catch(_){matchedJobs=[]}
  renderJobs();
 }catch(e){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><h3>Could not load jobs</h3><p>'+escapeHtml(e.message)+'</p></div>'}
 finally{loadingJobs=false;more.hidden=!hasMoreJobs;more.disabled=false;more.textContent='Load More Jobs'}
}
function decorateJob(job){const match=matchedJobs.find(m=>Number(m.job_id)===Number(job.id));return {...job,match_score:match?.match_score||job.match_score||0,matched_skills:match?.matched_skills||job.matched_skills||[],missing_skills:match?.missing_skills||job.missing_skills||[]}}
function renderJobs(){
 const grid=document.getElementById('jobsGrid');let jobs=allJobs.map(decorateJob).filter(j=>!appliedJobIds.has(Number(j.id)));
 if(currentFilter==='matched')jobs=jobs.filter(j=>j.match_score>0);
 if(currentFilter==='verified')jobs=jobs.filter(j=>j.is_verified);
 if(activeSkillFilter)jobs=jobs.filter(j=>(j.matched_skills||[]).some(s=>s.toLowerCase()===activeSkillFilter.toLowerCase())||(j.skills||[]).some(s=>(s.name||s).toLowerCase()===activeSkillFilter.toLowerCase()));
 jobs.sort((a,b)=>(b.match_score||0)-(a.match_score||0));
 document.getElementById('jobsCount').textContent=jobs.length+' jobs shown'+(hasMoreJobs?' · more available':'');
 if(!jobs.length){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-briefcase"></i><h3>No jobs found</h3><p>Try another search or update your skills.</p></div>';return}
 grid.innerHTML=jobs.map(renderJobCard).join('');
}
function renderJobCard(job){
 const score=Number(job.match_score)||0,matchClass=score>=85?'match-high':score>=70?'match-medium':'match-low',saved=savedJobIds.has(Number(job.id));
 const chips=[...(job.matched_skills||[]).map(s=>'<span class="skill-chip">'+escapeHtml(s)+'</span>'),...(job.missing_skills||[]).map(s=>'<span class="skill-chip missing">'+escapeHtml(s)+'</span>')].join('');
 return '<article class="job-card"><div class="job-card-header"><div><div class="job-card-title">'+escapeHtml(job.title)+'</div><div class="job-card-company"><i class="fa-solid fa-building"></i> '+escapeHtml(job.company)+'</div></div>'+(score?'<div class="match-badge-lg '+matchClass+'">'+score+'% match</div>':'')+'</div><div class="job-card-meta">'+(job.location?'<span><i class="fa-solid fa-location-dot"></i> '+escapeHtml(job.location)+'</span>':'')+(job.salary_range?'<span><i class="fa-solid fa-money-bill"></i> '+escapeHtml(job.salary_range)+'</span>':'')+(job.source?'<span><i class="fa-solid fa-link"></i> '+escapeHtml(job.source)+'</span>':'')+'</div>'+(chips?'<div class="skill-chips">'+chips+'</div>':'')+'<div class="job-card-actions"><button class="btn-view" onclick="viewJob('+Number(job.id)+')"><i class="fa-solid fa-eye"></i> View Details</button><button class="btn-icon '+(saved?'bookmarked':'')+'" onclick="toggleSaveJob('+Number(job.id)+',this)" title="Save job"><i class="'+(saved?'fa-solid':'fa-regular')+' fa-bookmark"></i></button><button class="btn-icon" onclick="reportJob('+Number(job.id)+')" title="Report"><i class="fa-regular fa-flag"></i></button></div></article>';
}
function switchFilter(filter){currentFilter=filter;document.querySelectorAll('.filter-tab').forEach(t=>t.classList.toggle('active',t.dataset.filter===filter));renderJobs()}
async function viewJob(id){
 const modal=document.getElementById('jobDetailModal'),content=document.getElementById('jobDetailContent');modal.classList.add('active');content.innerHTML='<div style="padding:40px;text-align:center">Loading...</div>';
 try{const job=await apiCall('/jobs/'+id);const match=matchedJobs.find(m=>Number(m.job_id)===Number(id));const url=safeExternalUrl(job.url);
 content.innerHTML='<div class="modal-header"><h2>'+escapeHtml(job.title)+'</h2><button class="modal-close" onclick="closeJobDetail()"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-body"><p><strong>'+escapeHtml(job.company)+'</strong> · '+escapeHtml(job.location||'Remote')+'</p>'+(job.salary_range?'<p>'+escapeHtml(job.salary_range)+'</p>':'')+(job.description?'<h3>Description</h3><p>'+escapeHtml(job.description)+'</p>':'')+(match?.matched_skills?.length?'<h3>Matched skills</h3><div class="skill-chips">'+match.matched_skills.map(s=>'<span class="skill-chip">'+escapeHtml(s)+'</span>').join('')+'</div>':'')+'<div class="modal-footer"><button class="btn-cancel" onclick="closeJobDetail()">Close</button><button class="btn-primary-modal" onclick="applyToJob('+Number(id)+')"><i class="fa-solid fa-arrow-up-right-from-square"></i> '+(url?'Track & Open Original Posting':'Track Application')+'</button></div></div>';
 }catch(e){content.innerHTML='<div class="modal-body"><p>'+escapeHtml(e.message)+'</p></div>'}
}
function closeJobDetail(){document.getElementById('jobDetailModal').classList.remove('active')}
async function applyToJob(id){
 const job=allJobs.find(j=>Number(j.id)===Number(id));let url=safeExternalUrl(job?.url);
 try{await apiCall('/applications/','POST',{job_id:id,notes:'Application initiated from JobCocoon. Opened original posting.'});appliedJobIds.add(Number(id));closeJobDetail();renderJobs();showToast('Application added to your tracker. Opening original posting.','success');if(url)window.open(url,'_blank','noopener,noreferrer')}
 catch(e){if(e.message.toLowerCase().includes('already applied')){appliedJobIds.add(Number(id));renderJobs();showToast('This job is already in your applications.','info')}else showToast(e.message,'error')}
}
async function toggleSaveJob(id,btn){
 try{if(savedJobIds.has(Number(id))){await apiCall('/saved-jobs/'+id,'DELETE');savedJobIds.delete(Number(id));btn?.classList.remove('bookmarked');if(btn)btn.querySelector('i').className='fa-regular fa-bookmark';showToast('Removed from Saved Jobs','info')}
 else{await apiCall('/saved-jobs/','POST',{job_id:id});savedJobIds.add(Number(id));btn?.classList.add('bookmarked');if(btn)btn.querySelector('i').className='fa-solid fa-bookmark';showToast('Job saved','success')}}
 catch(e){showToast('Saved Jobs API will work after backend Day 12: '+e.message,'warning')}
}
async function handleAddJob(e){e.preventDefault();const user=currentUser||{};if(!(user.role==='admin'||user.is_admin===true)){showToast('Only admins can add jobs.','error');return}
 const btn=e.target.querySelector('[type=submit]'),payload={title:jobTitle.value.trim(),company:jobCompany.value.trim(),location:jobLocation.value.trim()||null,salary_range:jobSalary.value.trim()||null,source:jobSource.value.trim()||null,url:jobUrl.value.trim()||null,description:jobDescription.value.trim()||null};
 try{btn.disabled=true;await apiCall('/jobs/','POST',payload);const names=jobSkills.value.split(',').map(x=>x.trim()).filter(Boolean);if(names.length)await apiCall('/jobs/'+(await apiCall('/jobs/?skip=0&limit=1&search='+encodeURIComponent(payload.title)))[0].id+'/skills','POST',{skill_names:names});closeAddJobModal();await loadJobs(true);showToast('Job added','success')}catch(e){showToast(e.message,'error')}finally{btn.disabled=false}
}
function openAddJobModal(){document.getElementById('addJobModal').classList.add('active')}
function closeAddJobModal(){document.getElementById('addJobModal').classList.remove('active');document.getElementById('addJobForm').reset()}
async function reportJob(id){const reason=prompt('Why are you reporting this job?');if(!reason)return;try{await apiCall('/jobs/'+id+'/report','POST',{reason});showToast('Report submitted','success')}catch(e){showToast(e.message,'error')}}
function safeExternalUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:''}catch(_){return ''}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showToast(message,type='info'){const el=document.createElement('div');el.className='toast toast-'+type;el.textContent=message;el.style.cssText='position:fixed;bottom:24px;right:24px;padding:14px 20px;background:'+(type==='success'?'#10b981':type==='error'?'#ef4444':type==='warning'?'#f59e0b':'#3b82f6')+';color:#fff;border-radius:10px;z-index:9999';document.body.appendChild(el);setTimeout(()=>el.remove(),3200)}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal'))e.target.classList.remove('active')});
