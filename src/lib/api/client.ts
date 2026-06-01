import type {
  Appointment,
  ClinicalAlert,
  ClinicalEvolution,
  ClinicalRecord,
  DashboardKpis,
  HeartMeasurement,
  Patient,
  TeamUser,
} from "./types";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

type JsonBody = Record<string, unknown>;

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = (await response.json()) as T & {
    error?: { code?: string; message?: string; details?: unknown };
  };

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      payload.error?.code ?? "request_error",
      payload.error?.message ?? "Nao foi possivel concluir a requisicao.",
      payload.error?.details,
    );
  }

  return payload;
}

function post<T>(path: string, body?: JsonBody) {
  return requestJson<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

function patch<T>(path: string, body: JsonBody) {
  return requestJson<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export const apiClient = {
  login: (email: string, password: string) =>
    post<{ user: TeamUser }>("/api/auth/login", { email, password }),
  logout: () => post<{ ok: true }>("/api/auth/logout"),
  me: () => requestJson<{ user: TeamUser | null }>("/api/auth/me"),
  listTeam: () => requestJson<{ team: TeamUser[] }>("/api/team"),
  getProfile: () =>
    requestJson<{ user: TeamUser; profile: TeamUser["accessProfile"] }>("/api/profile"),
  listPatients: () => requestJson<{ patients: Patient[] }>("/api/patients"),
  getPatient: (patientId: string) =>
    requestJson<{ patient: Patient }>(`/api/patients/${encodeURIComponent(patientId)}`),
  createPatient: (patient: JsonBody) => post<{ patient: Patient }>("/api/patients", patient),
  updatePatient: (patientId: string, patient: JsonBody) =>
    patch<{ patient: Patient }>(`/api/patients/${encodeURIComponent(patientId)}`, patient),
  getRecord: (patientId: string) =>
    requestJson<{ patient: Patient; record: ClinicalRecord }>(
      `/api/records/${encodeURIComponent(patientId)}`,
    ),
  updateClinicalSummary: (patientId: string, summary: string) =>
    patch<{ record: ClinicalRecord }>(`/api/records/${encodeURIComponent(patientId)}`, {
      summary,
    }),
  addEvolution: (patientId: string, evolutionType: string, note: string) =>
    post<{ evolution: ClinicalEvolution }>(
      `/api/records/${encodeURIComponent(patientId)}/evolutions`,
      { evolutionType, note },
    ),
  listAppointments: (
    query: {
      professionalId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) => {
    const search = new URLSearchParams(
      Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    const suffix = search.size ? `?${search}` : "";
    return requestJson<{ appointments: Appointment[] }>(`/api/appointments${suffix}`);
  },
  createAppointment: (appointment: JsonBody) =>
    post<{ appointment: Appointment }>("/api/appointments", appointment),
  recordMeasurement: (measurement: JsonBody) =>
    post<{ measurement: HeartMeasurement }>("/api/measurements", measurement),
  getMeasurements: (patientId: string) =>
    requestJson<{ measurements: HeartMeasurement[] }>(
      `/api/measurements/${encodeURIComponent(patientId)}`,
    ),
  getKpis: () => requestJson<DashboardKpis>("/api/kpis"),
  listAlerts: (status = "open") =>
    requestJson<{ alerts: ClinicalAlert[] }>(`/api/alerts?status=${encodeURIComponent(status)}`),
  createAlert: (alert: JsonBody) => post<{ alert: ClinicalAlert }>("/api/alerts", alert),
};
