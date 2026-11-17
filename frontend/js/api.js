// Shared API configuration and authenticated request helpers.
const DEFAULT_PRODUCTION_API_URL = 'https://job-intelligence-platform-production-af45.up.railway.app';
function getApiBaseUrl() {
  const configured = window.JOBCOCOON_CONFIG?.API_URL || localStorage.getItem('jobcocoon_api_url');
  if (configured) return String(configured).replace(/\/+$/, '');
  const localHost = ['localhost','127.0.0.1'].includes(window.location.hostname);
  return localHost ? 'http://127.0.0.1:8000' : DEFAULT_PRODUCTION_API_URL;
}
let API_URL = getApiBaseUrl();
function setApiBaseUrl(url) {
  const value = String(url || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(value)) throw new Error('API URL must start with http:// or https://');
  localStorage.setItem('jobcocoon_api_url', value); API_URL = value; return API_URL;
}
function saveToken(token){localStorage.setItem('jobcocoon_token',token)}
function getToken(){return localStorage.getItem('jobcocoon_token')}
function removeToken(){localStorage.removeItem('jobcocoon_token')}
function isLoggedIn(){return !!getToken()}
async function apiCall(endpoint, method='GET', body=null, extraOptions={}) {
  const headers={Accept:'application/json',...(extraOptions.headers||{})};
  if(body!==null) headers['Content-Type']='application/json';
  const token=getToken(); if(token) headers.Authorization='Bearer '+token;
  const options={...extraOptions,method,headers}; delete options.signal;
  if(extraOptions.signal) options.signal=extraOptions.signal;
  if(body!==null) options.body=JSON.stringify(body);
  let response;
  try { response=await fetch(API_URL+endpoint,options); }
  catch(error) { if(error.name==='AbortError') throw error; throw new Error('Cannot connect to server. Check your internet connection or API URL.'); }
  if(response.status===401){removeToken();throw new Error('Session expired. Please login again.')}
  if(response.status===204)return null;
  const raw=await response.text(); let data={};
  try{data=raw?JSON.parse(raw):{}}catch(_){data={detail:raw||'Unexpected server response'}}
  if(!response.ok){const detail=data.detail;throw new Error(Array.isArray(detail)?detail.map(x=>x.msg).join(', '):(detail||data.message||'Request failed ('+response.status+')'))}
  return data;
}
async function login(email,password) {
  const formData=new URLSearchParams({grant_type:'password',username:email,password,scope:'',client_id:'',client_secret:''});
  const response=await fetch(API_URL+'/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:formData});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){if(response.status===401)throw new Error('Invalid email or password');if(response.status===403)throw new Error(data.detail||'Please verify your email first');throw new Error(data.detail||'Login failed')}
  saveToken(data.access_token);return data;
}
async function register(name,email,password){return apiCall('/auth/register','POST',{name,email,password})}
async function getCurrentUser(){return apiCall('/auth/me')}
async function resendVerification(email){return apiCall('/auth/resend-verification','POST',{email})}
function logout(){removeToken();window.location.href=window.location.pathname.includes('/pages/')?'../index.html':'index.html'}
