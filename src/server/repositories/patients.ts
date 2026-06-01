import type { Patient, PatientRisk, PatientTrend } from "@/lib/api/types";
import { patients as mockPatients } from "@/lib/mockData";
import { createId, getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import type { PatientInput, PatientUpdateInput } from "@/server/validators/schemas";

type PatientRow = {
  id: string;
  name: string;
  cpf: string | null;
  birth_date: string | null;
  sex: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  age: number;
  risk: PatientRisk;
  self_care: number;
  adherence: number;
  bp: string | null;
  spo2: number | null;
  hr: number | null;
  fe: number | null;
  vo2: number | null;
  last_response: string | null;
  trend: PatientTrend;
  status: string;
};

const patientSelect = `
  SELECT
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
  FROM patients
`;

export function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    birthDate: row.birth_date,
    sex: row.sex,
    email: row.email,
    phone: row.phone,
    address: row.address,
    age: row.age,
    risk: row.risk,
    selfCare: row.self_care,
    adherence: row.adherence,
    bp: row.bp ?? "120/80",
    spo2: row.spo2 ?? 98,
    hr: row.hr ?? 70,
    fe: row.fe ?? 50,
    vo2: row.vo2 ?? 18,
    lastResponse: row.last_response ?? "sem registro",
    trend: row.trend,
    status: row.status,
  };
}

export async function listPatients(ctx: ApiRouteContext): Promise<Patient[]> {
  const db = getDb(ctx);
  if (!db) return mockPatients;

  const result = await db.prepare(`${patientSelect} ORDER BY name`).all<PatientRow>();
  return (result.results ?? []).map(mapPatient);
}

export async function findPatientById(ctx: ApiRouteContext, patientId: string) {
  const db = getDb(ctx);
  if (!db) return mockPatients.find((patient) => patient.id === patientId) ?? null;

  const row = await db
    .prepare(`${patientSelect} WHERE id = ? LIMIT 1`)
    .bind(patientId)
    .first<PatientRow>();
  return row ? mapPatient(row) : null;
}

export async function createPatient(ctx: ApiRouteContext, input: PatientInput) {
  const db = getDb(ctx);
  const patient: Patient = {
    id: input.id ?? createId("P"),
    name: input.name,
    cpf: input.cpf,
    birthDate: input.birthDate,
    sex: input.sex,
    email: input.email,
    phone: input.phone,
    address: input.address,
    age: input.age,
    risk: input.risk,
    selfCare: input.selfCare,
    adherence: input.adherence,
    bp: input.bp,
    spo2: input.spo2,
    hr: input.hr,
    fe: input.fe,
    vo2: input.vo2,
    lastResponse: input.lastResponse,
    trend: input.trend,
    status: input.status,
  };

  if (!db) return patient;

  await db
    .prepare(
      `
      INSERT INTO patients (
        id, name, cpf, birth_date, sex, email, phone, address, age, risk,
        self_care, adherence, bp, spo2, hr, fe, vo2, last_response, trend, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      patient.id,
      patient.name,
      patient.cpf ?? null,
      patient.birthDate ?? null,
      patient.sex ?? null,
      patient.email ?? null,
      patient.phone ?? null,
      patient.address ?? null,
      patient.age,
      patient.risk,
      patient.selfCare,
      patient.adherence,
      patient.bp,
      patient.spo2,
      patient.hr,
      patient.fe,
      patient.vo2,
      patient.lastResponse,
      patient.trend,
      patient.status ?? "active",
    )
    .run();

  await db
    .prepare(
      `
      INSERT OR IGNORE INTO medical_records (id, patient_id, summary, institution)
      VALUES (?, ?, ?, ?)
    `,
    )
    .bind(`record-${patient.id}`, patient.id, "Resumo clinico inicial pendente.", null)
    .run();

  return patient;
}

export async function updatePatient(
  ctx: ApiRouteContext,
  patientId: string,
  input: PatientUpdateInput,
) {
  const current = await findPatientById(ctx, patientId);
  if (!current) return null;

  const next = { ...current, ...input };
  const db = getDb(ctx);
  if (!db) return next;

  const columns: Array<[string, unknown]> = [];
  if (input.name !== undefined) columns.push(["name", input.name]);
  if (input.cpf !== undefined) columns.push(["cpf", input.cpf]);
  if (input.birthDate !== undefined) columns.push(["birth_date", input.birthDate]);
  if (input.sex !== undefined) columns.push(["sex", input.sex]);
  if (input.email !== undefined) columns.push(["email", input.email]);
  if (input.phone !== undefined) columns.push(["phone", input.phone]);
  if (input.address !== undefined) columns.push(["address", input.address]);
  if (input.age !== undefined) columns.push(["age", input.age]);
  if (input.risk !== undefined) columns.push(["risk", input.risk]);
  if (input.selfCare !== undefined) columns.push(["self_care", input.selfCare]);
  if (input.adherence !== undefined) columns.push(["adherence", input.adherence]);
  if (input.bp !== undefined) columns.push(["bp", input.bp]);
  if (input.spo2 !== undefined) columns.push(["spo2", input.spo2]);
  if (input.hr !== undefined) columns.push(["hr", input.hr]);
  if (input.fe !== undefined) columns.push(["fe", input.fe]);
  if (input.vo2 !== undefined) columns.push(["vo2", input.vo2]);
  if (input.lastResponse !== undefined) columns.push(["last_response", input.lastResponse]);
  if (input.trend !== undefined) columns.push(["trend", input.trend]);
  if (input.status !== undefined) columns.push(["status", input.status]);

  columns.push(["updated_at", new Date().toISOString()]);

  const assignments = columns.map(([column]) => `${column} = ?`).join(", ");
  await db
    .prepare(`UPDATE patients SET ${assignments} WHERE id = ?`)
    .bind(...columns.map(([, value]) => value ?? null), patientId)
    .run();

  return next;
}
