document.addEventListener('DOMContentLoaded',async()=>{
 if(!isLoggedIn()){location.href='../index.html';return;}
 try{const user=await getCurrentUser();document.getElementById('userName').textContent=user.name||'User';document.getElementById('userEmail').textContent=user.email||'';document.getElementById('userAvatar').textContent=(user.name||'U').charAt(0).toUpperCase();}catch(e){console.warn(e)}
 const prefs=JSON.parse(localStorage.getItem('jobcocoon_notification_preferences')||'{}');
 document.getElementById('emailAlerts').checked=prefs.emailAlerts!==false;
 document.getElementById('jobAlerts').checked=prefs.jobAlerts!==false;
 document.getElementById('notificationSettingsForm').addEventListener('submit',e=>{
  e.preventDefault();localStorage.setItem('jobcocoon_notification_preferences',JSON.stringify({emailAlerts:document.getElementById('emailAlerts').checked,jobAlerts:document.getElementById('jobAlerts').checked}));
  document.getElementById('settingsStatus').textContent='Preferences saved in this browser.';
 });
 document.getElementById('apiUrlInput').value=localStorage.getItem('jobcocoon_api_url')||'';
 document.getElementById('saveApiUrl').addEventListener('click',()=>{
  try{const url=setApiBaseUrl(document.getElementById('apiUrlInput').value);document.getElementById('apiStatus').textContent='Saved: '+url+' — reload pages to use it.';}
  catch(e){document.getElementById('apiStatus').textContent=e.message;}
 });
 document.getElementById('resetApiUrl').addEventListener('click',()=>{localStorage.removeItem('jobcocoon_api_url');document.getElementById('apiUrlInput').value='';document.getElementById('apiStatus').textContent='Automatic local/production URL will be used after reload.';});
});