-- ============================================================
-- École Connectée — Schéma de base de données Supabase
-- À copier-coller EN ENTIER dans un nouvel onglet SQL vide
-- (Supabase > SQL Editor > "+" pour un nouvel onglet > coller > Run)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Table : schools (chaque école) ----------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  currency text not null default 'GNF',
  created_at timestamptz default now()
);

-- ---------- Table : profiles (identité + rôle + école de chaque utilisateur) ----------
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  role text not null check (role in ('fondateur', 'comptable', 'enseignant', 'parent')),
  full_name text not null,
  created_at timestamptz default now()
);

-- ---------- Fonctions utilitaires (évitent les blocages de sécurité récursifs) ----------
create or replace function my_school_id() returns uuid
language sql security definer stable
as $$
  select school_id from profiles where user_id = auth.uid()
$$;

create or replace function my_role() returns text
language sql security definer stable
as $$
  select role from profiles where user_id = auth.uid()
$$;

-- ---------- Sécurité : schools ----------
alter table schools enable row level security;

create policy schools_select_all on schools
  for select using (auth.role() = 'authenticated');

create policy schools_insert_authenticated on schools
  for insert with check (auth.role() = 'authenticated');

-- ---------- Sécurité : profiles ----------
alter table profiles enable row level security;

create policy profiles_select_own_or_school on profiles
  for select using (user_id = auth.uid() or school_id = my_school_id());

create policy profiles_insert_own on profiles
  for insert with check (user_id = auth.uid());

create policy profiles_update_own on profiles
  for update using (user_id = auth.uid());

-- ---------- Table : students (registre des élèves) ----------
create table students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  full_name text not null,
  class_name text not null,
  parent_id uuid references profiles(user_id) on delete set null,
  total_due numeric not null default 0,
  created_at timestamptz default now()
);

alter table students enable row level security;

create policy students_select_school on students
  for select using (school_id = my_school_id());

create policy students_write_staff on students
  for all using (school_id = my_school_id() and my_role() in ('comptable', 'fondateur'))
  with check (school_id = my_school_id() and my_role() in ('comptable', 'fondateur'));

-- ---------- Table : payments (paiements des élèves) ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  amount numeric not null,
  date date not null,
  note text,
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy payments_select_school on payments
  for select using (school_id = my_school_id());

create policy payments_write_staff on payments
  for all using (school_id = my_school_id() and my_role() in ('comptable', 'fondateur'))
  with check (school_id = my_school_id() and my_role() in ('comptable', 'fondateur'));

-- ---------- Table : lessons (devoirs/leçons publiés par les enseignants) ----------
create table lessons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid not null references profiles(user_id) on delete cascade,
  class_name text not null,
  title text not null,
  description text,
  due_date date,
  created_at timestamptz default now()
);

alter table lessons enable row level security;

create policy lessons_select_school on lessons
  for select using (school_id = my_school_id());

create policy lessons_write_staff on lessons
  for all using (school_id = my_school_id() and my_role() in ('enseignant', 'fondateur'))
  with check (school_id = my_school_id() and my_role() in ('enseignant', 'fondateur'));

-- ---------- Table : homework_status (suivi "fait / pas fait" par élève) ----------
create table homework_status (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  done boolean not null default false,
  done_at timestamptz,
  unique (lesson_id, student_id)
);

alter table homework_status enable row level security;

create policy homework_select_school on homework_status
  for select using (school_id = my_school_id());

create policy homework_write_school on homework_status
  for all using (school_id = my_school_id())
  with check (school_id = my_school_id());

-- ---------- Table : announcements (annonces du directeur aux parents) ----------
create table announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  author_id uuid not null references profiles(user_id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table announcements enable row level security;

create policy announcements_select_school on announcements
  for select using (school_id = my_school_id());

create policy announcements_write_fondateur on announcements
  for all using (school_id = my_school_id() and my_role() = 'fondateur')
  with check (school_id = my_school_id() and my_role() = 'fondateur');
