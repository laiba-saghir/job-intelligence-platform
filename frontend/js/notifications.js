// Lightweight notification center UI. Actual server notifications can be connected later.
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[title="Notifications"]').forEach(button=>{
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
  button.addEventListener('click',event=>{
   event.preventDefault();
   let panel=document.getElementById('notificationPanel');
   if(panel){panel.remove();button.setAttribute('aria-expanded','false');return;}
   panel=document.createElement('section');panel.id='notificationPanel';panel.className='notification-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Notifications');
   panel.innerHTML='<div class="notification-panel-head"><strong>Notifications</strong><button type="button" aria-label="Close notifications">×</button></div><div class="notification-empty"><i class="fa-regular fa-bell"></i><h3>You are all caught up</h3><p>New job and application notifications will appear here when notification delivery is connected.</p><a href="settings.html">Manage preferences</a></div>';
   panel.querySelector('button').addEventListener('click',()=>{panel.remove();button.setAttribute('aria-expanded','false')});
   button.insertAdjacentElement('afterend',panel);button.setAttribute('aria-expanded','true');
  });
 });
 document.addEventListener('click',e=>{const panel=document.getElementById('notificationPanel');if(panel&&!panel.contains(e.target)&&!e.target.closest('[title="Notifications"]')){panel.remove();document.querySelectorAll('[title="Notifications"]').forEach(b=>b.setAttribute('aria-expanded','false'));}});
});