const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Signing in...';
  const body = Object.fromEntries(new FormData(form).entries());
  const r = await fetch('/api/crm/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) return (msg.textContent = j.error || 'Login failed');
  localStorage.setItem('crm_token', j.token);
  localStorage.setItem('crm_user', JSON.stringify(j.user));
  location.href = j.user.role === 'manager' ? '/crm/manager' : '/crm/agent';
});
