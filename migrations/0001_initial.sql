PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS access_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_users (
  id TEXT PRIMARY KEY,
  access_profile_id TEXT NOT NULL REFERENCES access_profiles(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'physician', 'nurse', 'technician')),
  professional_label TEXT NOT NULL,
  credential TEXT,
  phone TEXT,
  care_area TEXT,
  institution TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  birth_date TEXT,
  sex TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  age INTEGER NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('low', 'medium', 'high')),
  self_care INTEGER NOT NULL DEFAULT 0,
  adherence INTEGER NOT NULL DEFAULT 0,
  bp TEXT,
  spo2 INTEGER,
  hr INTEGER,
  fe INTEGER,
  vo2 REAL,
  last_response TEXT,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  responsible_user_id TEXT REFERENCES team_users(id),
  summary TEXT,
  institution TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_form_templates (
  id TEXT PRIMARY KEY,
  form_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  source TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  schema_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_form_responses (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completo', 'parcial', 'pendente')),
  values_json TEXT NOT NULL,
  filled_fields INTEGER NOT NULL DEFAULT 0,
  total_fields INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES team_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (record_id, template_key)
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES team_users(id),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  mode TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by TEXT REFERENCES team_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (professional_id, appointment_date, appointment_time)
);

CREATE TABLE IF NOT EXISTS clinical_evolutions (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES team_users(id),
  evolution_type TEXT NOT NULL DEFAULT 'note',
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heart_measurements (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  measured_at TEXT NOT NULL,
  hr INTEGER,
  weight REAL,
  adherence INTEGER,
  spo2 INTEGER,
  bp TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_alerts (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT REFERENCES team_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id TEXT PRIMARY KEY,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES team_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_json TEXT,
  after_json TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_risk ON patients(risk);
CREATE INDEX IF NOT EXISTS idx_measurements_patient_date ON heart_measurements(patient_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON appointments(professional_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_alerts_patient_status ON clinical_alerts(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_evolutions_record_date ON clinical_evolutions(record_id, created_at);
