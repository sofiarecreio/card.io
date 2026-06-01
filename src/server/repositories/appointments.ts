import type { Appointment, AppointmentStatus } from "@/lib/api/types";
import { createId, getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import type { AppointmentInput } from "@/server/validators/schemas";

type AppointmentRow = {
  id: string;
  professional_id: string;
  professional_name: string | null;
  patient_id: string;
  patient_name: string | null;
  appointment_date: string;
  appointment_time: string;
  mode: string;
  note: string | null;
  status: AppointmentStatus;
  created_at: string;
};

export type AppointmentFilters = {
  professionalId?: string;
  dateFrom?: string;
  dateTo?: string;
};

const fallbackAppointments: Appointment[] = [
  {
    id: "appt-1042-1",
    professionalId: "user-physician",
    professionalName: "Dr. Henrique Lima",
    patientId: "P-1042",
    patientName: "Maria S. Oliveira",
    date: "2026-05-30",
    time: "09:30",
    mode: "teleconsulta",
    note: "Revisar sintomas e ajuste de diuretico.",
    status: "scheduled",
    createdAt: "2026-05-27 09:00:00",
  },
  {
    id: "appt-1019-1",
    professionalId: "user-nurse",
    professionalName: "Carla Martins",
    patientId: "P-1019",
    patientName: "Joao P. Almeida",
    date: "2026-05-30",
    time: "11:00",
    mode: "telefone",
    note: "Busca ativa por resposta atrasada.",
    status: "scheduled",
    createdAt: "2026-05-27 10:00:00",
  },
];

export async function listAppointments(
  ctx: ApiRouteContext,
  filters: AppointmentFilters = {},
): Promise<Appointment[]> {
  const db = getDb(ctx);
  if (!db) return filterFallbackAppointments(filters);

  const where: string[] = [];
  const values: unknown[] = [];
  if (filters.professionalId) {
    where.push("a.professional_id = ?");
    values.push(filters.professionalId);
  }
  if (filters.dateFrom) {
    where.push("a.appointment_date >= ?");
    values.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    where.push("a.appointment_date <= ?");
    values.push(filters.dateTo);
  }

  const result = await db
    .prepare(
      `
      SELECT
        a.id,
        a.professional_id,
        u.name AS professional_name,
        a.patient_id,
        p.name AS patient_name,
        a.appointment_date,
        a.appointment_time,
        a.mode,
        a.note,
        a.status,
        a.created_at
      FROM appointments a
      LEFT JOIN team_users u ON u.id = a.professional_id
      LEFT JOIN patients p ON p.id = a.patient_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY a.appointment_date, a.appointment_time
    `,
    )
    .bind(...values)
    .all<AppointmentRow>();

  return (result.results ?? []).map(mapAppointment);
}

export async function createAppointment(
  ctx: ApiRouteContext,
  input: AppointmentInput,
  createdBy: string | null,
) {
  const db = getDb(ctx);
  const id = createId("appt");
  if (!db) {
    return {
      id,
      professionalId: input.professionalId,
      professionalName: null,
      patientId: input.patientId,
      patientName: null,
      date: input.date,
      time: input.time,
      mode: input.mode,
      note: input.note ?? null,
      status: input.status,
      createdAt: new Date().toISOString(),
    } satisfies Appointment;
  }

  await db
    .prepare(
      `
      INSERT INTO appointments (
        id, professional_id, patient_id, appointment_date, appointment_time, mode, note, status, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      id,
      input.professionalId,
      input.patientId,
      input.date,
      input.time,
      input.mode,
      input.note ?? null,
      input.status,
      createdBy,
    )
    .run();

  const row = await db
    .prepare(
      `
      SELECT
        a.id,
        a.professional_id,
        u.name AS professional_name,
        a.patient_id,
        p.name AS patient_name,
        a.appointment_date,
        a.appointment_time,
        a.mode,
        a.note,
        a.status,
        a.created_at
      FROM appointments a
      LEFT JOIN team_users u ON u.id = a.professional_id
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.id = ?
    `,
    )
    .bind(id)
    .first<AppointmentRow>();

  return row ? mapAppointment(row) : null;
}

function filterFallbackAppointments(filters: AppointmentFilters) {
  return fallbackAppointments.filter((appointment) => {
    const matchesProfessional =
      !filters.professionalId || appointment.professionalId === filters.professionalId;
    const matchesStart = !filters.dateFrom || appointment.date >= filters.dateFrom;
    const matchesEnd = !filters.dateTo || appointment.date <= filters.dateTo;
    return matchesProfessional && matchesStart && matchesEnd;
  });
}

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    professionalId: row.professional_id,
    professionalName: row.professional_name,
    patientId: row.patient_id,
    patientName: row.patient_name,
    date: row.appointment_date,
    time: row.appointment_time,
    mode: row.mode,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  };
}
