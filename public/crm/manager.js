(async () => {
  await import('/static/crm/common.js');
  crm.ensure('manager'); crm.bindTabs();
  document.getElementById('logout').onclick = () => crm.logout();

  async function loadContacts() {
    const q = document.getElementById('search').value || '';
    const data = await crm.api(`/api/crm/contacts?q=${encodeURIComponent(q)}`);
    const rows = data.contacts.map((c) => `<tr><td>${c.first_name} ${c.last_name}</td><td>${c.phone || ''}</td><td>${c.email || ''}</td><td>${c.company || ''}</td></tr>`).join('');
    document.getElementById('contactsTable').innerHTML = '<tr><th>Name</th><th>Phone</th><th>Email</th><th>Company</th></tr>' + rows;
    document.getElementById('stats').innerHTML = `<div class="stat">Total Contacts<br><b>${data.contacts.length}</b></div>`;
  }

  async function loadPipelines() {
    const data = await crm.api('/api/crm/pipelines');
    document.getElementById('pipelineList').innerHTML = data.pipelines.map((p) => `<div class='card'><b>${p.name}</b><div class='small'>Stages: ${(p.crm_pipeline_stages || []).map((s) => s.name).join(', ')}</div></div>`).join('');
  }

  async function loadAgents() {
    const data = await crm.api('/api/crm/users');
    document.getElementById('agentList').innerHTML = data.users.map((u) => `<div>${u.username} - ${u.role} - ${u.email}</div>`).join('');
  }

  async function loadAccounts() {
    const data = await crm.api('/api/crm/accounts');
    document.getElementById('accountList').innerHTML = data.accounts.map((a) => `<div>${a.name} (${a.status})</div>`).join('');
  }

  document.getElementById('search').addEventListener('input', loadContacts);
  document.getElementById('createPipeline').onclick = async () => {
    const name = document.getElementById('pipelineName').value;
    await crm.api('/api/crm/pipelines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    document.getElementById('pipelineName').value = ''; loadPipelines();
  };
  document.getElementById('addAgent').onclick = async () => {
    const body = { email: agentEmail.value, username: agentUser.value, passcode: agentPass.value, role: 'agent' };
    await crm.api('/api/crm/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    loadAgents();
  };
  document.getElementById('createAccount').onclick = async () => {
    await crm.api('/api/crm/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: accountName.value, industry: industry.value }) });
    loadAccounts();
  };

  document.getElementById('importBtn').onclick = async () => {
    const file = document.getElementById('csvFile').files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/crm/import/contacts', { method: 'POST', headers: crm.headers(), body: fd });
    const j = await res.json();
    document.getElementById('importMsg').textContent = j.ok ? `Inserted ${j.summary.inserted}, Updated ${j.summary.updated}, Skipped ${j.summary.skipped}` : j.error;
    if (j.ok) loadContacts();
  };

  await Promise.all([loadContacts(), loadPipelines(), loadAgents(), loadAccounts()]);
})();
