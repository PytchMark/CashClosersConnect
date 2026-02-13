require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_TTL = '24h';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '', { auth: { persistSession: false } });

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

function sendError(res, status, error, code = 'BAD_REQUEST') {
  return res.status(status).json({ ok: false, error, code });
}

function hasEnv() {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function makeToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return sendError(res, 401, 'Missing auth token.', 'AUTH_REQUIRED');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return sendError(res, 401, 'Invalid or expired auth token.', 'INVALID_TOKEN');
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return sendError(res, 403, 'Forbidden.', 'FORBIDDEN');
    next();
  };
}

const toLeadRow = (lead, stageMap) => ({
  id: lead.contact_id,
  contact_id: lead.contact_id,
  first_name: lead.crm_contacts.first_name,
  last_name: lead.crm_contacts.last_name,
  phone: lead.crm_contacts.phone,
  email: lead.crm_contacts.email,
  company: lead.crm_contacts.company,
  tags: lead.crm_contacts.tags || [],
  stage_id: lead.stage_id,
  stage_name: stageMap.get(lead.stage_id) || 'Unknown',
  status: lead.status,
  next_follow_up_at: lead.next_follow_up_at,
  last_activity_at: lead.last_activity_at
});

app.get('/health', (_req, res) => res.json({ ok: true, app: process.env.CRM_APP_NAME || 'CRM' }));

app.get('/crm/login', (_req, res) => res.sendFile(path.join(__dirname, 'public/crm/login.html')));
app.get('/crm/agent', (_req, res) => res.sendFile(path.join(__dirname, 'public/crm/agent.html')));
app.get('/crm/manager', (_req, res) => res.sendFile(path.join(__dirname, 'public/crm/manager.html')));

app.post('/api/crm/login', async (req, res) => {
  if (!hasEnv()) return sendError(res, 500, 'Missing Supabase env vars.', 'MISSING_ENV');
  const { identifier, passcode } = req.body || {};
  if (!identifier || !passcode) return sendError(res, 400, 'identifier and passcode are required.');

  const q = supabase.from('crm_users').select('*').eq('active', true).or(`username.eq.${identifier},email.eq.${identifier}`).limit(1);
  const { data, error } = await q;
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  if (!data?.length) return sendError(res, 401, 'Invalid credentials.', 'INVALID_CREDENTIALS');

  const user = data[0];
  const ok = await bcrypt.compare(String(passcode), user.passcode_hash);
  if (!ok) return sendError(res, 401, 'Invalid credentials.', 'INVALID_CREDENTIALS');

  return res.json({ ok: true, token: makeToken(user), user: { id: user.id, role: user.role, email: user.email, username: user.username } });
});

app.get('/api/crm/me', auth, async (req, res) => {
  const { data, error } = await supabase.from('crm_users').select('id, role, email, username, active, created_at').eq('id', req.user.sub).single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, user: data });
});

app.get('/api/crm/users', auth, requireRole('manager'), async (_req, res) => {
  const { data, error } = await supabase.from('crm_users').select('id, role, email, username, active, created_at').order('created_at', { ascending: false });
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, users: data });
});

app.post('/api/crm/users', auth, requireRole('manager'), async (req, res) => {
  const { email, username, passcode, role = 'agent', active = true } = req.body || {};
  if (!email || !username || !passcode) return sendError(res, 400, 'email, username, passcode required.');
  if (!['manager', 'agent'].includes(role)) return sendError(res, 400, 'Invalid role.');
  const hash = await bcrypt.hash(String(passcode), 10);
  const { data, error } = await supabase.from('crm_users').insert({ email, username, passcode_hash: hash, role, active }).select('id, role, email, username, active, created_at').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, user: data });
});

app.post('/api/crm/users/:id/reset-passcode', auth, requireRole('manager'), async (req, res) => {
  const { passcode } = req.body || {};
  if (!passcode || String(passcode).length < 4) return sendError(res, 400, 'passcode must be at least 4 chars.');
  const passcode_hash = await bcrypt.hash(String(passcode), 10);
  const { error } = await supabase.from('crm_users').update({ passcode_hash }).eq('id', req.params.id);
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true });
});

app.get('/api/crm/accounts', auth, async (_req, res) => {
  const { data, error } = await supabase.from('crm_accounts').select('*').order('created_at', { ascending: false });
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, accounts: data });
});

app.post('/api/crm/accounts', auth, requireRole('manager'), async (req, res) => {
  const { id, name, industry, status = 'active' } = req.body || {};
  if (!name) return sendError(res, 400, 'name required.');
  const payload = { name, industry: industry || null, status };
  let query = id ? supabase.from('crm_accounts').update(payload).eq('id', id) : supabase.from('crm_accounts').insert(payload);
  const { data, error } = await query.select('*').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, account: data });
});

app.get('/api/crm/pipelines', auth, async (_req, res) => {
  const { data, error } = await supabase.from('crm_pipelines').select('*, crm_pipeline_stages(*)').order('created_at', { ascending: true });
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, pipelines: data });
});

app.post('/api/crm/pipelines', auth, requireRole('manager'), async (req, res) => {
  const { id, name, account_id = null } = req.body || {};
  if (!name) return sendError(res, 400, 'name required.');
  let query = id ? supabase.from('crm_pipelines').update({ name, account_id }).eq('id', id) : supabase.from('crm_pipelines').insert({ name, account_id });
  const { data, error } = await query.select('*').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, pipeline: data });
});

app.get('/api/crm/pipelines/:id/stages', auth, async (req, res) => {
  const { data, error } = await supabase.from('crm_pipeline_stages').select('*').eq('pipeline_id', req.params.id).order('sort_order', { ascending: true });
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, stages: data });
});

app.post('/api/crm/pipelines/:id/stages', auth, requireRole('manager'), async (req, res) => {
  const { id, name, sort_order = 0 } = req.body || {};
  if (!name) return sendError(res, 400, 'name required.');
  const payload = { name, sort_order, pipeline_id: req.params.id };
  let query = id ? supabase.from('crm_pipeline_stages').update(payload).eq('id', id) : supabase.from('crm_pipeline_stages').insert(payload);
  const { data, error } = await query.select('*').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, stage: data });
});

app.get('/api/crm/contacts', auth, async (req, res) => {
  const { q, account_id, owner_user_id, tag } = req.query;
  let query = supabase.from('crm_contacts').select('*').order('created_at', { ascending: false }).limit(200);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,company.ilike.%${q}%`);
  if (account_id) query = query.eq('account_id', account_id);
  if (owner_user_id) query = query.eq('owner_user_id', owner_user_id);
  if (tag) query = query.contains('tags', [tag]);
  if (req.user.role === 'agent') query = query.or(`owner_user_id.eq.${req.user.sub},owner_user_id.is.null`);
  const { data, error } = await query;
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, contacts: data });
});

app.post('/api/crm/contacts', auth, async (req, res) => {
  const isAgent = req.user.role === 'agent';
  const { id, first_name, last_name, phone, email, company, parish, country = 'Jamaica', source, tags = [], account_id, owner_user_id } = req.body || {};
  if (!first_name && !last_name) return sendError(res, 400, 'first_name or last_name required.');
  const payload = { first_name: first_name || '', last_name: last_name || '', phone: phone || null, email: email || null, company: company || null, parish: parish || null, country, source: source || null, tags, account_id: account_id || null, owner_user_id: isAgent ? req.user.sub : owner_user_id || null };
  let query = id ? supabase.from('crm_contacts').update(payload).eq('id', id) : supabase.from('crm_contacts').insert(payload);
  const { data, error } = await query.select('*').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, contact: data });
});

app.post('/api/crm/assign', auth, requireRole('manager'), async (req, res) => {
  const { contact_id, account_id = null, owner_user_id = null, pipeline_id, stage_id } = req.body || {};
  if (!contact_id || !pipeline_id || !stage_id) return sendError(res, 400, 'contact_id, pipeline_id, stage_id required.');

  const { error: cErr } = await supabase.from('crm_contacts').update({ account_id, owner_user_id }).eq('id', contact_id);
  if (cErr) return sendError(res, 500, cErr.message, 'DB_ERROR');

  const { data: current } = await supabase.from('crm_lead_state').select('*').eq('contact_id', contact_id).maybeSingle();
  const payload = { contact_id, pipeline_id, stage_id, updated_at: new Date().toISOString() };
  const q = current ? supabase.from('crm_lead_state').update(payload).eq('contact_id', contact_id) : supabase.from('crm_lead_state').insert(payload);
  const { error } = await q;
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');

  res.json({ ok: true });
});

app.post('/api/crm/import/contacts', auth, requireRole('manager'), upload.single('file'), async (req, res) => {
  if (!req.file) return sendError(res, 400, 'CSV file required.');
  const records = parse(req.file.buffer.toString('utf8'), { columns: true, skip_empty_lines: true, bom: true, trim: true });
  let inserted = 0; let updated = 0; let skipped = 0;

  for (const row of records) {
    const rawName = row.name || '';
    const [first = '', ...rest] = rawName.split(' ');
    const payload = {
      first_name: row.first_name || first,
      last_name: row.last_name || rest.join(' '),
      phone: row.phone || null,
      email: row.email || null,
      company: row.company || null,
      parish: row.parish || null,
      source: 'excel_import',
      tags: (row.tags || '').split(',').map((x) => x.trim()).filter(Boolean)
    };
    if (!payload.phone && !payload.email) { skipped += 1; continue; }

    let account_id = null;
    if (row.account || row.account_name) {
      const name = row.account || row.account_name;
      const { data: existing } = await supabase.from('crm_accounts').select('id').eq('name', name).maybeSingle();
      if (existing) account_id = existing.id;
      else {
        const { data: created } = await supabase.from('crm_accounts').insert({ name }).select('id').single();
        account_id = created.id;
      }
    }
    payload.account_id = account_id;

    const dedupe = payload.phone
      ? await supabase.from('crm_contacts').select('id').eq('phone', payload.phone).maybeSingle()
      : await supabase.from('crm_contacts').select('id').eq('email', payload.email).maybeSingle();

    if (dedupe.data?.id) {
      const { error } = await supabase.from('crm_contacts').update(payload).eq('id', dedupe.data.id);
      if (!error) updated += 1;
      else skipped += 1;
    } else {
      const { error } = await supabase.from('crm_contacts').insert(payload);
      if (!error) inserted += 1;
      else skipped += 1;
    }
  }

  res.json({ ok: true, summary: { inserted, updated, skipped, total: records.length } });
});

app.get('/api/crm/my/board', auth, async (req, res) => {
  const pipeline_id = req.query.p;
  if (!pipeline_id) return sendError(res, 400, 'pipeline id required (?p=).');

  const { data: stages, error: stErr } = await supabase.from('crm_pipeline_stages').select('*').eq('pipeline_id', pipeline_id).order('sort_order', { ascending: true });
  if (stErr) return sendError(res, 500, stErr.message, 'DB_ERROR');
  const stageMap = new Map(stages.map((s) => [s.id, s.name]));

  let query = supabase.from('crm_lead_state').select('contact_id, stage_id, status, next_follow_up_at, last_activity_at, crm_contacts!inner(*)').eq('pipeline_id', pipeline_id);
  if (req.user.role === 'agent') query = query.eq('crm_contacts.owner_user_id', req.user.sub);

  const { data: leads, error } = await query;
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  res.json({ ok: true, stages, leads: (leads || []).map((l) => toLeadRow(l, stageMap)) });
});

app.post('/api/crm/lead/move', auth, async (req, res) => {
  const { contact_id, pipeline_id, stage_id } = req.body || {};
  if (!contact_id || !pipeline_id || !stage_id) return sendError(res, 400, 'contact_id, pipeline_id, stage_id required.');

  const { data: contact } = await supabase.from('crm_contacts').select('owner_user_id').eq('id', contact_id).single();
  if (req.user.role === 'agent' && contact.owner_user_id !== req.user.sub) return sendError(res, 403, 'Cannot move unassigned lead.', 'FORBIDDEN');

  const { error } = await supabase.from('crm_lead_state').update({ stage_id, pipeline_id, updated_at: new Date().toISOString() }).eq('contact_id', contact_id);
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  await supabase.from('crm_activities').insert({ contact_id, created_by: req.user.sub, type: 'status_change', meta: { stage_id, pipeline_id } });
  res.json({ ok: true });
});

app.post('/api/crm/notes', auth, async (req, res) => {
  const { contact_id, note } = req.body || {};
  if (!contact_id || !note) return sendError(res, 400, 'contact_id and note required.');
  const { data, error } = await supabase.from('crm_notes').insert({ contact_id, created_by: req.user.sub, note }).select('*').single();
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  await supabase.from('crm_activities').insert({ contact_id, created_by: req.user.sub, type: 'note', meta: { note_length: note.length } });
  res.json({ ok: true, note: data });
});

app.post('/api/crm/followup', auth, async (req, res) => {
  const { contact_id, next_follow_up_at } = req.body || {};
  if (!contact_id || !next_follow_up_at) return sendError(res, 400, 'contact_id and next_follow_up_at required.');
  const { error } = await supabase.from('crm_lead_state').update({ next_follow_up_at, updated_at: new Date().toISOString() }).eq('contact_id', contact_id);
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  await supabase.from('crm_activities').insert({ contact_id, created_by: req.user.sub, type: 'status_change', meta: { next_follow_up_at } });
  res.json({ ok: true });
});

app.post('/api/crm/lead/status', auth, async (req, res) => {
  const { contact_id, status } = req.body || {};
  if (!contact_id || !['won', 'lost', 'open'].includes(status)) return sendError(res, 400, 'contact_id and valid status required.');
  const { error } = await supabase.from('crm_lead_state').update({ status, updated_at: new Date().toISOString() }).eq('contact_id', contact_id);
  if (error) return sendError(res, 500, error.message, 'DB_ERROR');
  await supabase.from('crm_activities').insert({ contact_id, created_by: req.user.sub, type: 'status_change', meta: { status } });
  res.json({ ok: true });
});

app.get('/api/crm/contact/:id/timeline', auth, async (req, res) => {
  const { data: notes } = await supabase.from('crm_notes').select('*').eq('contact_id', req.params.id).order('created_at', { ascending: false }).limit(50);
  const { data: activities } = await supabase.from('crm_activities').select('*').eq('contact_id', req.params.id).order('created_at', { ascending: false }).limit(100);
  res.json({ ok: true, notes: notes || [], activities: activities || [] });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return sendError(res, 500, 'Internal server error.', 'INTERNAL_ERROR');
});

app.listen(PORT, () => {
  console.log(`CRM server running on :${PORT}`);
});
