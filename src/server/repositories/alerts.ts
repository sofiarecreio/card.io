import type { AlertSeverity, AlertStatus, ClinicalAlert } from "@/lib/api/types";
import { patients as mockPatients } from "@/lib/mockData";
import { createId, getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import type { AlertInput } from "@/server/validators/schemas";

type AlertRow = {
  id: string;
  patient_id: string;
  patient_name: string | null;
  severity: AlertSeverity;
  alert_type: string;
  title: string;
  message: string;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
};

export async function listAlerts(ctx: ApiRouteContext, status = "open") {
  const db = getDb(ctx);
  if (!db) return fallbackAlerts().filter((alert) => alert.status === status);

  const result = await db
    .prepare(
      `
      SELECT
        a.id,
        a.patient_id,
        p.name AS patient_name,
        a.severity,
        a.alert_type,
        a.title,
        a.message,
        a.status,
        a.created_at,
        a.resolved_at
      FROM clinical_alerts a
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.status = ?
      ORDER BY
        CASE a.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        a.created_at DESC
    `,
    )
    .bind(status)
    .all<AlertRow>();

  return (result.results ?? []).map(mapAlert);
}

export async function createAlert(
  ctx: ApiRouteContext,
  input: AlertInput,
  createdBy: string | null,
) {
  const db = getDb(ctx);
  const id = createId("alert");
  if (!db) {
    const patient = mockPatients.find((item) => item.id === input.patientId);
    return {
      id,
      patientId: input.patientId,
      patientName: patient?.name ?? null,
      severity: input.severity,
      type: input.type,
      title: input.title,
      message: input.message,
      status: input.status,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    } satisfies ClinicalAlert;
  }

  await db
    .prepare(
      `
      INSERT INTO clinical_alerts (
        id, patient_id, severity, alert_type, title, message, status, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      id,
      input.patientId,
      input.severity,
      input.type,
      input.title,
      input.message,
      input.status,
      createdBy,
    )
    .run();

  const created = await db
    .prepare(
      `
      SELECT
        a.id,
        a.patient_id,
        p.name AS patient_name,
        a.severity,
        a.alert_type,
        a.title,
        a.message,
        a.status,
        a.created_at,
        a.resolved_at
      FROM clinical_alerts a
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.id = ?
    `,
    )
    .bind(id)
    .first<AlertRow>();

  return created ? mapAlert(created) : null;
}

function fallbackAlerts(): ClinicalAlert[] {
  return mockPatients
    .filter((patient) => patient.risk === "high" || patient.trend === "down")
    .map((patient) => ({
      id: `alert-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      severity: patient.risk === "high" ? "high" : "medium",
      type: patient.trend === "down" ? "worsening" : "risk",
      title: patient.risk === "high" ? "Risco alto" : "Monitorar tendencia",
      message: `${patient.name} precisa de revisao clinica pelo painel de monitoramento.`,
      status: "open",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    }));
}

function mapAlert(row: AlertRow): ClinicalAlert {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    severity: row.severity,
    type: row.alert_type,
    title: row.title,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}
