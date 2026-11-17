// OTP API contract: POST /auth/verify-otp {email, otp}; POST /auth/resend-otp {email}.
document.addEventListener('DOMContentLoaded',()=>{
 const email=sessionStorage.getItem('jobcocoon_pending_email')||new URLSearchParams(location.search).get('email')||'';
 const form=document.getElementById('otpForm'),input=document.getElementById('otpCode');
 const message=document.getElementById('otpMessage'),verify=document.getElementById('verifyOtpBtn'),resend=document.getElementById('resendOtpBtn');
 if(!email){show('Registration email was not found. Please register again.','error');verify.disabled=true;resend.disabled=true;return;}
 const note=document.createElement('p');note.className='otp-email';note.textContent='Code sent to '+email;form.parentNode.insertBefore(note,form);
 input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,6)});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!/^\d{6}$/.test(input.value)){show('Enter the 6-digit code.','error');return;}
  verify.disabled=true;verify.textContent='Verifying...';
  try{const result=await apiCall('/auth/verify-otp','POST',{email,otp:input.value});if(result.access_token)saveToken(result.access_token);sessionStorage.removeItem('jobcocoon_pending_email');show('Email verified successfully. Redirecting...','success');setTimeout(()=>location.href=result.access_token?'dashboard.html':'../index.html',900);}
  catch(error){show(error.message,'error');}finally{verify.disabled=false;verify.textContent='Verify email';}
 });
 resend.addEventListener('click',async()=>{resend.disabled=true;resend.textContent='Sending...';try{await apiCall('/auth/resend-otp','POST',{email});show('A new code has been sent.','success');}catch(error){show(error.message,'error');}finally{resend.disabled=false;resend.textContent='Resend code';}});
 function show(text,type){message.textContent=text;message.className='otp-message '+type;}
});