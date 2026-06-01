import type { DashboardKpis, Patient, ProfessionalFollowUp } from "@/lib/api/types";
import { professionalFollowUp as mockProfessionalFollowUp } from "@/lib/mockData";
import { getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import { listPatients } from "@/server/repositories/patients";

type ProfessionalFollowUpRow = {
  professional: string | null;
  patients: number;
  updated: number;
  alerts: number;
};

export async function getDashboardKpis(ctx: ApiRouteContext): Promise<DashboardKpis> {
  const patients = await listPatients(ctx);
  const kpis = calculateKpis(patients);
  const professionalFollowUp = await getProfessionalFollowUp(ctx);
  return { kpis, professionalFollowUp };
}

function calculateKpis(patients: Patient[]) {
  const total = patients.length || 1;
  const notResponding = patients.filter(isStale).length;
  const avgAdherence = Math.round(
    patients.reduce((sum, patient) => sum + patient.adherence, 0) / total,
  );
  const avgSelfCare = Math.round(
    patients.reduce((sum, patient) => sum + patient.selfCare, 0) / total,
  );

  return {
    totalPatients: patients.length,
    activeMonitoring: patients.length - notResponding,
    notResponding,
    highRisk: patients.filter((patient) => patient.risk === "high").length,
    mediumRisk: patients.filter((patient) => patient.risk === "medium").length,
    lowRisk: patients.filter((patient) => patient.risk === "low").length,
    avgAdherence: Number.isFinite(avgAdherence) ? avgAdherence : 0,
    avgSelfCare: Number.isFinite(avgSelfCare) ? avgSelfCare : 0,
  };
}

async function getProfessionalFollowUp(ctx: ApiRouteContext): Promise<ProfessionalFollowUp[]> {
  const db = getDb(ctx);
  if (!db) return mockProfessionalFollowUp;

  const result = await db
    .prepare(
      `
      SELECT
        COALESCE(u.professional_label, u.name) AS professional,
        COUNT(DISTINCT r.patient_id) AS patients,
        SUM(CASE WHEN p.last_response NOT LIKE '%1d%' AND p.last_response NOT LIKE '%3d%' THEN 1 ELSE 0 END) AS updated,
        COUNT(DISTINCT a.id) AS alerts
      FROM team_users u
      LEFT JOIN medical_records r ON r.responsible_user_id = u.id
      LEFT JOIN patients p ON p.id = r.patient_id
      LEFT JOIN clinical_alerts a ON a.patient_id = p.id AND a.status = 'open'
      WHERE u.role IN ('physician', 'nurse', 'technician')
      GROUP BY u.id
      ORDER BY u.name
    `,
    )
    .all<ProfessionalFollowUpRow>();

  const rows = result.results ?? [];
  if (!rows.length) return mockProfessionalFollowUp;
  return rows.map((row) => ({
    professional: row.professional ?? "Profissional",
    patients: row.patients,
    updated: row.updated,
    alerts: row.alerts,
  }));
}

function isStale(patient: Patient) {
  return patient.lastResponse.includes("1d") || patient.lastResponse.includes("3d");
}
