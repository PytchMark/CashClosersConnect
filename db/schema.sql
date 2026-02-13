create extension if not exists "pgcrypto";

create table if not exists crm_users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('manager','agent')),
  email text not null unique,
  username text not null unique,
  passcode_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists crm_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  industry text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists crm_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  email text,
  company text,
  parish text,
  country text not null default 'Jamaica',
  source text,
  tags text[] not null default '{}',
  account_id uuid references crm_accounts(id) on delete set null,
  owner_user_id uuid references crm_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists crm_pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_id uuid references crm_accounts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists crm_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references crm_pipelines(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists crm_lead_state (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references crm_contacts(id) on delete cascade,
  pipeline_id uuid not null references crm_pipelines(id) on delete cascade,
  stage_id uuid not null references crm_pipeline_stages(id) on delete restrict,
  status text not null default 'open' check (status in ('open','won','lost')),
  last_activity_at timestamptz,
  next_follow_up_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists crm_notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references crm_contacts(id) on delete cascade,
  created_by uuid not null references crm_users(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists crm_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references crm_contacts(id) on delete cascade,
  created_by uuid not null references crm_users(id) on delete restrict,
  type text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_contacts_phone on crm_contacts(phone);
create index if not exists idx_crm_contacts_email on crm_contacts(email);
create index if not exists idx_crm_contacts_account_id on crm_contacts(account_id);
create index if not exists idx_crm_contacts_owner_user_id on crm_contacts(owner_user_id);
create index if not exists idx_crm_contacts_tags on crm_contacts using gin(tags);

create index if not exists idx_crm_lead_state_pipeline_id on crm_lead_state(pipeline_id);
create index if not exists idx_crm_lead_state_stage_id on crm_lead_state(stage_id);
create index if not exists idx_crm_lead_state_follow_up on crm_lead_state(next_follow_up_at);

create index if not exists idx_crm_notes_contact_created on crm_notes(contact_id, created_at desc);
create index if not exists idx_crm_activities_contact_created on crm_activities(contact_id, created_at desc);
