(async () => {
  await import('/static/crm/common.js');
  crm.ensure('agent'); crm.bindTabs();
  document.getElementById('logout').onclick = () => crm.logout();

  let currentPipeline = null;

  async function loadPipelines() {
    const { pipelines } = await crm.api('/api/crm/pipelines');
    pipelineSelect.innerHTML = pipelines.map((p) => `<option value='${p.id}'>${p.name}</option>`).join('');
    currentPipeline = currentPipeline || pipelines[0]?.id;
    if (currentPipeline) pipelineSelect.value = currentPipeline;
  }

  function leadCard(lead) {
    return `<div class='lead' draggable='true' data-id='${lead.contact_id}'>
      <b>${lead.first_name} ${lead.last_name}</b><div class='small'>${lead.phone || ''} • ${lead.company || ''}</div>
      <div class='small'>${lead.status.toUpperCase()}</div>
      <button data-note='${lead.contact_id}'>Add Note</button><button data-follow='${lead.contact_id}'>Set Follow-up</button>
    </div>`;
  }

  async function loadBoard() {
    if (!currentPipeline) return;
    const { stages, leads } = await crm.api(`/api/crm/my/board?p=${currentPipeline}`);
    kanban.innerHTML = stages.map((s) => `<div class='stage' data-stage='${s.id}'><h4>${s.name}</h4>${leads.filter((l) => l.stage_id === s.id).map(leadCard).join('')}</div>`).join('');
    bindDnD(); bindActions();
    myLeadsTable.innerHTML = '<tr><th>Name</th><th>Stage</th><th>Status</th></tr>' + leads.map((l) => `<tr><td>${l.first_name} ${l.last_name}</td><td>${l.stage_name}</td><td>${l.status}</td></tr>`).join('');
    contactsTable.innerHTML = '<tr><th>Name</th><th>Phone</th><th>Email</th></tr>' + leads.map((l) => `<tr><td>${l.first_name} ${l.last_name}</td><td>${l.phone || ''}</td><td>${l.email || ''}</td></tr>`).join('');
    const now = new Date();
    followList.innerHTML = leads.filter((l) => l.next_follow_up_at && new Date(l.next_follow_up_at) <= now).map((l) => `<li>${l.first_name} ${l.last_name} - ${l.next_follow_up_at}</li>`).join('') || '<li>No due follow-ups</li>';
  }

  function bindDnD() {
    document.querySelectorAll('.lead').forEach((lead) => {
      lead.ondragstart = (e) => e.dataTransfer.setData('text/plain', lead.dataset.id);
    });
    document.querySelectorAll('.stage').forEach((stage) => {
      stage.ondragover = (e) => { e.preventDefault(); stage.classList.add('drag-over'); };
      stage.ondragleave = () => stage.classList.remove('drag-over');
      stage.ondrop = async (e) => {
        e.preventDefault(); stage.classList.remove('drag-over');
        const contact_id = e.dataTransfer.getData('text/plain');
        await crm.api('/api/crm/lead/move', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_id, pipeline_id: currentPipeline, stage_id: stage.dataset.stage }) });
        loadBoard();
      };
    });
  }

  function bindActions() {
    document.querySelectorAll('button[data-note]').forEach((b) => b.onclick = async () => {
      const note = prompt('Add note'); if (!note) return;
      await crm.api('/api/crm/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_id: b.dataset.note, note }) });
      alert('Note saved');
    });
    document.querySelectorAll('button[data-follow]').forEach((b) => b.onclick = async () => {
      const dt = prompt('Follow-up datetime ISO (YYYY-MM-DDTHH:mm)'); if (!dt) return;
      await crm.api('/api/crm/followup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_id: b.dataset.follow, next_follow_up_at: new Date(dt).toISOString() }) });
      loadBoard();
    });
  }

  pipelineSelect.onchange = () => { currentPipeline = pipelineSelect.value; loadBoard(); };
  reloadBoard.onclick = loadBoard;
  search.oninput = async () => {
    const q = search.value;
    const { contacts } = await crm.api(`/api/crm/contacts?q=${encodeURIComponent(q)}&owner_user_id=${crm.user.id}`);
    contactsTable.innerHTML = '<tr><th>Name</th><th>Phone</th><th>Email</th></tr>' + contacts.map((c) => `<tr><td>${c.first_name} ${c.last_name}</td><td>${c.phone || ''}</td><td>${c.email || ''}</td></tr>`).join('');
  };

  await loadPipelines();
  await loadBoard();
})();
