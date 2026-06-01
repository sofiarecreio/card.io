import type {
  ClinicalEvolution,
  ClinicalFormResponse,
  ClinicalRecord,
  Patient,
} from "@/lib/api/types";
import {
  clinicalFormTemplates,
  countFilledFields,
  countTotalEditableFields,
  createPrefilledClinicalFormsState,
} from "@/lib/clinicalForms";
import { createId, getDb, jsonParse } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import type { EvolutionInput } from "@/server/validators/schemas";
import { findPatientById } from "./patients";

type RecordRow = {
  id: string;
  patient_id: string;
  responsible_user_id: string | null;
  responsible_name: string | null;
  summary: string | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
};

type FormRow = {
  id: string;
  template_key: string;
  status: "completo" | "parcial" | "pendente";
  values_json: string;
  filled_fields: number;
  total_fields: number;
  updated_at: string;
};

type EvolutionRow = {
  id: string;
  record_id: string;
  author_id: string | null;
  author_name: string | null;
  evolution_type: string;
  note: string;
  created_at: string;
};

const recordSelect = `
  SELECT
    r.id,
    r.patient_id,
    r.responsible_user_id,
    u.name AS responsible_name,
    r.summary,
    r.institution,
    r.created_at,
    r.updated_at
  FROM medical_records r
  LEFT JOIN team_users u ON u.id = r.responsible_user_id
`;

export async function getRecordByPatientId(ctx: ApiRouteContext, patientId: string) {
  const db = getDb(ctx);
  if (!db) {
    const patient = await findPatientById(ctx, patientId);
    return patient ? fallbackRecord(patient) : null;
  }

  const row = await db
    .prepare(`${recordSelect} WHERE r.patient_id = ? LIMIT 1`)
    .bind(patientId)
    .first<RecordRow>();

  if (!row) return null;

  const [forms, evolutions] = await Promise.all([
    listFormsForRecord(ctx, row.id),
    listEvolutionsForRecord(ctx, row.id),
  ]);

  return mapRecord(row, forms, evolutions);
}

export async function updateClinicalSummary(
  ctx: ApiRouteContext,
  patientId: string,
  summary: string,
) {
  const db = getDb(ctx);
  if (!db) {
    const patient = await findPatientById(ctx, patientId);
    return patient ? { ...fallbackRecord(patient), summary } : null;
  }

  const existing = await getRecordByPatientId(ctx, patientId);
  if (!existing) {
    await db
      .prepare(
        `
        INSERT INTO medical_records (id, patient_id, summary)
        VALUES (?, ?, ?)
      `,
      )
      .bind(`record-${patientId}`, patientId, summary)
      .run();
  } else {
    await db
      .prepare(
        "UPDATE medical_records SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .bind(summary, existing.id)
      .run();
  }

  return getRecordByPatientId(ctx, patientId);
}

export async function addClinicalEvolution(
  ctx: ApiRouteContext,
  patientId: string,
  input: EvolutionInput,
  authorId: string | null,
) {
  const db = getDb(ctx);
  if (!db) {
    const patient = await findPatientById(ctx, patientId);
    if (!patient) return null;
    const record = fallbackRecord(patient);
    return {
      id: createId("evo"),
      recordId: record.id,
      authorId,
      authorName: null,
      evolutionType: input.evolutionType,
      note: input.note,
      createdAt: new Date().toISOString(),
    } satisfies ClinicalEvolution;
  }

  const record = await getRecordByPatientId(ctx, patientId);
  if (!record) return null;

  const evolutionId = createId("evo");
  await db
    .prepare(
      `
      INSERT INTO clinical_evolutions (id, record_id, author_id, evolution_type, note)
      VALUES (?, ?, ?, ?, ?)
    `,
    )
    .bind(evolutionId, record.id, authorId, input.evolutionType, input.note)
    .run();

  const row = await db
    .prepare(
      `
      SELECT
        e.id,
        e.record_id,
        e.author_id,
        u.name AS author_name,
        e.evolution_type,
        e.note,
        e.created_at
      FROM clinical_evolutions e
      LEFT JOIN team_users u ON u.id = e.author_id
      WHERE e.id = ?
    `,
    )
    .bind(evolutionId)
    .first<EvolutionRow>();

  return row ? mapEvolution(row) : null;
}

async function listFormsForRecord(ctx: ApiRouteContext, recordId: string) {
  const db = getDb(ctx);
  if (!db) return [];

  const result = await db
    .prepare(
      `
      SELECT id, template_key, status, values_json, filled_fields, total_fields, updated_at
      FROM clinical_form_responses
      WHERE record_id = ?
      ORDER BY template_key
    `,
    )
    .bind(recordId)
    .all<FormRow>();

  return (result.results ?? []).map(mapForm);
}

async function listEvolutionsForRecord(ctx: ApiRouteContext, recordId: string) {
  const db = getDb(ctx);
  if (!db) return [];

  const result = await db
    .prepare(
      `
      SELECT
        e.id,
        e.record_id,
        e.author_id,
        u.name AS author_name,
        e.evolution_type,
        e.note,
        e.created_at
      FROM clinical_evolutions e
      LEFT JOIN team_users u ON u.id = e.author_id
      WHERE e.record_id = ?
      ORDER BY e.created_at DESC
    `,
    )
    .bind(recordId)
    .all<EvolutionRow>();

  return (result.results ?? []).map(mapEvolution);
}

function mapRecord(
  row: RecordRow,
  forms: ClinicalFormResponse[],
  evolutions: ClinicalEvolution[],
): ClinicalRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    responsibleUserId: row.responsible_user_id,
    responsibleName: row.responsible_name,
    summary: row.summary,
    institution: row.institution,
    forms,
    evolutions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapForm(row: FormRow): ClinicalFormResponse {
  return {
    id: row.id,
    templateKey: row.template_key,
    status: row.status,
    values: jsonParse<Record<string, unknown>>(row.values_json, {}),
    filledFields: row.filled_fields,
    totalFields: row.total_fields,
    updatedAt: row.updated_at,
  };
}

function mapEvolution(row: EvolutionRow): ClinicalEvolution {
  return {
    id: row.id,
    recordId: row.record_id,
    authorId: row.author_id,
    authorName: row.author_name,
    evolutionType: row.evolution_type,
    note: row.note,
    createdAt: row.created_at,
  };
}

function fallbackRecord(patient: Patient): ClinicalRecord {
  const formsState = createPrefilledClinicalFormsState(patient);
  const forms = clinicalFormTemplates.map((template) => ({
    id: `form-${patient.id}-${template.key}`,
    templateKey: template.key,
    status:
      countFilledFields(template, formsState[template.key]) > 0
        ? ("parcial" as const)
        : ("pendente" as const),
    values: formsState[template.key],
    filledFields: countFilledFields(template, formsState[template.key]),
    totalFields: countTotalEditableFields(template),
    updatedAt: new Date().toISOString(),
  }));

  return {
    id: `record-${patient.id}`,
    patientId: patient.id,
    responsibleUserId: "user-physician",
    responsibleName: "Dr. Henrique Lima",
    summary:
      "Insuficiencia cardiaca em acompanhamento remoto, com sinais vitais e autocuidado monitorados pela equipe.",
    institution: "Hospital Universitario - Cardiologia",
    forms,
    evolutions: [
      {
        id: `evo-${patient.id}-mock`,
        recordId: `record-${patient.id}`,
        authorId: "user-physician",
        authorName: "Dr. Henrique Lima",
        evolutionType: "clinical",
        note: "Revisao de monitoramento remoto registrada nos dados demonstrativos.",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
