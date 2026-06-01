import type { HeartMeasurement } from "@/lib/api/types";
import { patientLongitudinal } from "@/lib/mockData";
import { createId, getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import type { MeasurementInput } from "@/server/validators/schemas";

type MeasurementRow = {
  id: string;
  patient_id: string;
  measured_at: string;
  hr: number | null;
  weight: number | null;
  adherence: number | null;
  spo2: number | null;
  bp: string | null;
  source: string;
};

export async function listMeasurementsByPatient(ctx: ApiRouteContext, patientId: string) {
  const db = getDb(ctx);
  if (!db) {
    return (patientLongitudinal[patientId] ?? patientLongitudinal["P-1042"] ?? []).map(
      (point, index) =>
        ({
          id: `measure-${patientId}-${index}`,
          patientId,
          measuredAt: point.date,
          date: point.date,
          hr: point.hr,
          weight: point.weight,
          adherence: point.adherence,
          spo2: null,
          bp: null,
          source: "mock",
        }) satisfies HeartMeasurement,
    );
  }

  const result = await db
    .prepare(
      `
      SELECT id, patient_id, measured_at, hr, weight, adherence, spo2, bp, source
      FROM heart_measurements
      WHERE patient_id = ?
      ORDER BY measured_at
    `,
    )
    .bind(patientId)
    .all<MeasurementRow>();

  return (result.results ?? []).map(mapMeasurement);
}

export async function createMeasurement(ctx: ApiRouteContext, input: MeasurementInput) {
  const db = getDb(ctx);
  const id = createId("measure");
  const measuredAt = input.measuredAt ?? new Date().toISOString();
  if (!db) {
    return {
      id,
      patientId: input.patientId,
      measuredAt,
      date: formatMeasurementDate(measuredAt),
      hr: input.hr ?? null,
      weight: input.weight ?? null,
      adherence: input.adherence ?? null,
      spo2: input.spo2 ?? null,
      bp: input.bp ?? null,
      source: input.source,
    } satisfies HeartMeasurement;
  }

  await db
    .prepare(
      `
      INSERT INTO heart_measurements (id, patient_id, measured_at, hr, weight, adherence, spo2, bp, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      id,
      input.patientId,
      measuredAt,
      input.hr ?? null,
      input.weight ?? null,
      input.adherence ?? null,
      input.spo2 ?? null,
      input.bp ?? null,
      input.source,
    )
    .run();

  await db
    .prepare(
      `
      UPDATE patients
      SET
        hr = COALESCE(?, hr),
        adherence = COALESCE(?, adherence),
        spo2 = COALESCE(?, spo2),
        bp = COALESCE(?, bp),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .bind(
      input.hr ?? null,
      input.adherence ?? null,
      input.spo2 ?? null,
      input.bp ?? null,
      input.patientId,
    )
    .run();

  return {
    id,
    patientId: input.patientId,
    measuredAt,
    date: formatMeasurementDate(measuredAt),
    hr: input.hr ?? null,
    weight: input.weight ?? null,
    adherence: input.adherence ?? null,
    spo2: input.spo2 ?? null,
    bp: input.bp ?? null,
    source: input.source,
  } satisfies HeartMeasurement;
}

function mapMeasurement(row: MeasurementRow): HeartMeasurement {
  return {
    id: row.id,
    patientId: row.patient_id,
    measuredAt: row.measured_at,
    date: formatMeasurementDate(row.measured_at),
    hr: row.hr,
    weight: row.weight,
    adherence: row.adherence,
    spo2: row.spo2,
    bp: row.bp,
    source: row.source,
  };
}

function formatMeasurementDate(value: string) {
  if (/^\d{2}\/\d{2}$/.test(value)) return value;
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value;
  const [, month, day] = datePart.split("-");
  return `${day}/${month}`;
}
