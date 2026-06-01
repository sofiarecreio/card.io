PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO access_profiles (id, name, description, permissions_json)
VALUES
  (
    'profile-admin',
    'Administrador',
    'Acesso total a equipe, pacientes, prontuarios e configuracoes.',
    '["team:read","team:write","patients:read","patients:write","records:read","records:write","appointments:write","alerts:write","audit:read"]'
  ),
  (
    'profile-physician',
    'Medico(a)',
    'Acesso clinico completo aos pacientes acompanhados.',
    '["team:read","patients:read","patients:write","records:read","records:write","appointments:write","alerts:write"]'
  ),
  (
    'profile-nurse',
    'Enfermeiro(a)',
    'Acompanhamento assistencial, alertas, formularios e agenda.',
    '["team:read","patients:read","patients:write","records:read","records:write","appointments:write","alerts:write"]'
  ),
  (
    'profile-technician',
    'Tecnico(a) de enfermagem',
    'Registro de medidas, respostas de monitoramento e apoio a agenda.',
    '["team:read","patients:read","records:read","appointments:write","alerts:write"]'
  );

INSERT OR REPLACE INTO team_users (
  id,
  access_profile_id,
  email,
  password_hash,
  name,
  role,
  professional_label,
  credential,
  phone,
  care_area,
  institution
)
VALUES
  (
    'user-admin',
    'profile-admin',
    'admin@cardio.local',
    'plain:admin123',
    'Amanda Rocha',
    'admin',
    'Administradora',
    'MATRICULA-0001',
    '+55 11 90000-0001',
    'Gestao clinica',
    'Hospital Universitario - Cardiologia'
  ),
  (
    'user-physician',
    'profile-physician',
    'medico@cardio.local',
    'plain:cardio123',
    'Dr. Henrique Lima',
    'physician',
    'Dr. Lima',
    'CRM-SP 123456',
    '+55 11 90000-0002',
    'Insuficiencia cardiaca',
    'Hospital Universitario - Cardiologia'
  ),
  (
    'user-nurse',
    'profile-nurse',
    'enfermeira@cardio.local',
    'plain:cardio123',
    'Carla Martins',
    'nurse',
    'Enf. Carla',
    'COREN-SP 654321',
    '+55 11 90000-0003',
    'Monitoramento remoto',
    'Hospital Universitario - Cardiologia'
  ),
  (
    'user-technician',
    'profile-technician',
    'tecnico@cardio.local',
    'plain:cardio123',
    'Bruno Tavares',
    'technician',
    'Tec. Bruno',
    'MATRICULA-0248',
    '+55 11 90000-0004',
    'Sinais vitais',
    'Hospital Universitario - Cardiologia'
  );

INSERT OR REPLACE INTO patients (
  id,
  name,
  cpf,
  birth_date,
  sex,
  email,
  phone,
  address,
  age,
  risk,
  self_care,
  adherence,
  bp,
  spo2,
  hr,
  fe,
  vo2,
  last_response,
  trend,
  status
)
VALUES
  ('P-1042','Maria S. Oliveira','10420000001','1959-05-03','Feminino','maria.oliveira@example.com','+55 11 91111-1042','Rua das Palmeiras, 1042',67,'high',48,62,'148/92',93,88,32,12.4,'ha 2h','down','active'),
  ('P-1019','Joao P. Almeida','10190000001','1954-08-11','Masculino','joao.almeida@example.com','+55 11 91111-1019','Av. Central, 1019',72,'high',52,58,'152/88',91,94,28,10.8,'ha 1d','down','active'),
  ('P-1087','Ana L. Ferreira','10870000001','1968-02-21','Feminino','ana.ferreira@example.com','+55 11 91111-1087','Rua Cardeal, 1087',58,'medium',71,80,'132/82',96,76,41,16.2,'ha 3h','stable','active'),
  ('P-1103','Carlos R. Souza','11030000001','1962-12-09','Masculino','carlos.souza@example.com','+55 11 91111-1103','Rua das Flores, 1103',64,'medium',68,74,'138/86',95,80,38,15.1,'ha 5h','down','active'),
  ('P-1055','Beatriz M. Lima','10550000001','1971-03-14','Feminino','beatriz.lima@example.com','+55 11 91111-1055','Alameda Sul, 1055',55,'low',88,92,'122/78',98,70,52,21.5,'ha 1h','up','active'),
  ('P-1077','Roberto C. Dias','10770000001','1957-07-19','Masculino','roberto.dias@example.com','+55 11 91111-1077','Rua Norte, 1077',69,'low',85,90,'126/80',97,72,48,19.8,'ha 4h','up','active'),
  ('P-1112','Fernanda T. Rocha','11120000001','1965-10-30','Feminino','fernanda.rocha@example.com','+55 11 91111-1112','Travessa Azul, 1112',61,'high',45,55,'156/94',90,96,26,9.6,'ha 3d','down','active'),
  ('P-1098','Luis A. Mendes','10980000001','1956-01-28','Masculino','luis.mendes@example.com','+55 11 91111-1098','Av. Rio Branco, 1098',70,'medium',66,72,'140/85',94,82,36,14.3,'ha 6h','stable','active');

INSERT OR REPLACE INTO medical_records (id, patient_id, responsible_user_id, summary, institution)
VALUES
  ('record-P-1042','P-1042','user-physician','Insuficiencia cardiaca em acompanhamento remoto, com dispneia aos esforcos e oscilacao de peso recente.','Hospital Universitario - Cardiologia'),
  ('record-P-1019','P-1019','user-physician','Risco alto por baixa adesao, FC elevada e ausencia de resposta no dia anterior.','Hospital Universitario - Cardiologia'),
  ('record-P-1087','P-1087','user-nurse','Paciente estavel, em acompanhamento por autocuidado e adesao medicamentosa.','Hospital Universitario - Cardiologia'),
  ('record-P-1103','P-1103','user-nurse','Risco moderado com tendencia de piora; revisar pressao arterial e sintomas.','Hospital Universitario - Cardiologia'),
  ('record-P-1055','P-1055','user-physician','Paciente com boa adesao, sem sinais recentes de descompensacao.','Hospital Universitario - Cardiologia'),
  ('record-P-1077','P-1077','user-technician','Acompanhamento de sinais vitais com boa estabilidade.','Hospital Universitario - Cardiologia'),
  ('record-P-1112','P-1112','user-physician','Risco alto com baixa saturacao, FC elevada e tres dias sem retorno.','Hospital Universitario - Cardiologia'),
  ('record-P-1098','P-1098','user-nurse','Risco moderado, manter vigilancia de peso e sintomas respiratorios.','Hospital Universitario - Cardiologia');

INSERT OR REPLACE INTO clinical_form_templates (id, form_key, name, short_description, source, version, schema_json)
VALUES
  ('template-identificacao','identificacao','Identificacao Universal','Dados sociodemograficos e resumo clinico','Identificacao_UniversalCardIO20.pdf',1,'{"sections":[]}'),
  ('template-anamnese','anamnese','Anamnese','HDA, sintomas e fatores de risco','Anamnese_UniversalCardIO20.pdf',1,'{"sections":[]}'),
  ('template-framingham','framingham','Criterios de Framingham','Diagnostico clinico de IC','CriteriosDeFramingham_Universal.pdf',1,'{"sections":[]}'),
  ('template-ecocardiograma','ecocardiograma','Ecocardiograma','Funcao sistolica e diastolica','Ecocardiograma_UniversalCardIO.pdf',1,'{"sections":[]}');

INSERT OR REPLACE INTO clinical_form_responses (
  id,
  record_id,
  template_key,
  status,
  values_json,
  filled_fields,
  total_fields,
  created_by
)
VALUES
  ('form-P-1042-identificacao','record-P-1042','identificacao','parcial','{"recordId":"P-1042","nomeCompleto":"Maria S. Oliveira","resumoClinico":"Dispneia aos esforcos e oscilacao de peso recente."}',12,38,'user-physician'),
  ('form-P-1042-anamnese','record-P-1042','anamnese','completo','{"dispneia":"Sim","ortopneia":"Sim","edema":"Sim","hipertensao":"Sim"}',28,32,'user-physician'),
  ('form-P-1019-identificacao','record-P-1019','identificacao','parcial','{"recordId":"P-1019","nomeCompleto":"Joao P. Almeida"}',10,38,'user-nurse');

INSERT OR REPLACE INTO clinical_evolutions (id, record_id, author_id, evolution_type, note, created_at)
VALUES
  ('evo-1042-1','record-P-1042','user-physician','clinical','Paciente relata dispneia em pequenas atividades. Orientado contato se ganho ponderal persistir.','2026-05-26 09:20:00'),
  ('evo-1019-1','record-P-1019','user-nurse','nursing','Contato telefonico sem sucesso. Manter alerta ativo para nova tentativa.','2026-05-26 11:15:00'),
  ('evo-1112-1','record-P-1112','user-physician','clinical','Saturacao baixa e FC elevada. Priorizar avaliacao clinica.','2026-05-26 14:40:00');

INSERT OR REPLACE INTO appointments (
  id,
  professional_id,
  patient_id,
  appointment_date,
  appointment_time,
  mode,
  note,
  status,
  created_by
)
VALUES
  ('appt-1042-1','user-physician','P-1042','2026-05-30','09:30','teleconsulta','Revisar sintomas e ajuste de diuretico.','scheduled','user-nurse'),
  ('appt-1019-1','user-nurse','P-1019','2026-05-30','11:00','telefone','Busca ativa por resposta atrasada.','scheduled','user-nurse'),
  ('appt-1112-1','user-physician','P-1112','2026-05-31','08:30','presencial','Avaliacao prioritaria por alerta alto.','scheduled','user-physician');

INSERT OR REPLACE INTO heart_measurements (id, patient_id, measured_at, hr, weight, adherence, spo2, bp, source)
VALUES
  ('measure-1042-1','P-1042','2026-05-23 08:00:00',84,72.1,70,94,'144/90','remote'),
  ('measure-1042-2','P-1042','2026-05-25 08:00:00',87,72.6,66,93,'146/92','remote'),
  ('measure-1042-3','P-1042','2026-05-27 08:00:00',88,73.1,62,93,'148/92','remote'),
  ('measure-1019-1','P-1019','2026-05-24 08:00:00',92,76.4,61,92,'150/86','remote'),
  ('measure-1019-2','P-1019','2026-05-27 08:00:00',94,76.9,58,91,'152/88','remote'),
  ('measure-1087-1','P-1087','2026-05-27 08:00:00',76,69.4,80,96,'132/82','remote'),
  ('measure-1112-1','P-1112','2026-05-26 08:00:00',96,74.2,55,90,'156/94','remote');

INSERT OR REPLACE INTO clinical_alerts (
  id,
  patient_id,
  severity,
  alert_type,
  title,
  message,
  status,
  created_by,
  created_at
)
VALUES
  ('alert-1042-1','P-1042','high','worsening','Risco alto com tendencia de piora','Dispneia, baixa adesao e piora longitudinal de FC.','open','user-physician','2026-05-27 09:00:00'),
  ('alert-1019-1','P-1019','high','no-response','Resposta atrasada','Paciente sem retorno ha 1 dia e sinais fora do alvo.','open','user-nurse','2026-05-27 10:15:00'),
  ('alert-1112-1','P-1112','high','critical-vitals','FC elevada e SpO2 baixa','Tres dias sem resposta, FC 96 bpm e SpO2 90%.','open','user-physician','2026-05-27 12:45:00'),
  ('alert-1103-1','P-1103','medium','follow-up','Monitorar tendencia','Tendencia de piora em paciente moderado.','open','user-nurse','2026-05-27 13:20:00');

INSERT OR REPLACE INTO kpi_snapshots (id, period_start, period_end, metrics_json)
VALUES
  (
    'kpi-2026-05',
    '2026-05-01',
    '2026-05-31',
    '{"totalPatients":248,"activeMonitoring":211,"notResponding":37,"highRisk":42,"mediumRisk":86,"lowRisk":120,"avgAdherence":78,"avgSelfCare":71}'
  );

INSERT OR REPLACE INTO audit_logs (id, actor_id, action, entity_type, entity_id, after_json)
VALUES
  ('audit-seed-1','user-admin','seed','database','initial','{"status":"created"}');
