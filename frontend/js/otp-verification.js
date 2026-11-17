// OTP UI is ready. API route names will be connected after the backend OTP endpoints are finalized.
document.addEventListener('DOMContentLoaded', () => {
  const form=document.getElementById('otpForm');
  const input=document.getElementById('otpCode');
  const message=document.getElementById('otpMessage');
  const verifyButton=document.getElementById('verifyOtpBtn');
  const resendButton=document.getElementById('resendOtpBtn');
  input.addEventListener('input',()=>{ input.value=input.value.replace(/\\D/g,'').slice(0,6); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!/^\\d{6}$/.test(input.value)) { showOtpMessage('Please enter the 6-digit code.','error'); return; }
    showOtpMessage('OTP verification API will be connected after backend implementation.','error');
  });
  resendButton.addEventListener('click',()=>showOtpMessage('OTP resend API will be connected after backend implementation.','error'));
  function showOtpMessage(text,type){ message.textContent=text; message.className='otp-message '+type; }
});