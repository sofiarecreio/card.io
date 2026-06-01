export type AccessRole = "admin" | "physician" | "nurse" | "technician";
export type PatientRisk = "low" | "medium" | "high";
export type PatientTrend = "up" | "down" | "stable";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "missed";
export type AlertSeverity = "low" | "medium" | "high";
export type AlertStatus = "open" | "resolved" | "dismissed";

export type AccessProfile = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
};

export type TeamUser = {
  id: string;
  email: string;
  name: string;
  role: AccessRole;
  professionalLabel: string;
  credential: string | null;
  phone: string | null;
  careArea: string | null;
  institution: string | null;
  accessProfile: AccessProfile | null;
  isActive: boolean;
};

export type Patient = {
  id: string;
  name: string;
  cpf?: string | null;
  birthDate?: string | null;
  sex?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  age: number;
  risk: PatientRisk;
  selfCare: number;
  adherence: number;
  bp: string;
  spo2: number;
  hr: number;
  fe: number;
  vo2: number;
  lastResponse: string;
  trend: PatientTrend;
  status?: string;
};

export type ClinicalFormResponse = {
  id: string;
  templateKey: string;
  status: "completo" | "parcial" | "pendente";
  values: Record<string, unknown>;
  filledFields: number;
  totalFields: number;
  updatedAt: string;
};

export type ClinicalEvolution = {
  id: string;
  recordId: string;
  authorId: string | null;
  authorName: string | null;
  evolutionType: string;
  note: string;
  createdAt: string;
};

export type ClinicalRecord = {
  id: string;
  patientId: string;
  responsibleUserId: string | null;
  responsibleName: string | null;
  summary: string | null;
  institution: string | null;
  forms: ClinicalFormResponse[];
  evolutions: ClinicalEvolution[];
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  professionalId: string;
  professionalName: string | null;
  patientId: string;
  patientName: string | null;
  date: string;
  time: string;
  mode: string;
  note: string | null;
  status: AppointmentStatus;
  createdAt: string;
};

export type HeartMeasurement = {
  id: string;
  patientId: string;
  measuredAt: string;
  date: string;
  hr: number | null;
  weight: number | null;
  adherence: number | null;
  spo2: number | null;
  bp: string | null;
  source: string;
};

export type ClinicalAlert = {
  id: string;
  patientId: string;
  patientName: string | null;
  severity: AlertSeverity;
  type: string;
  title: string;
  message: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type ProfessionalFollowUp = {
  professional: string;
  patients: number;
  updated: number;
  alerts: number;
};

export type KpiSummary = {
  totalPatients: number;
  activeMonitoring: number;
  notResponding: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgAdherence: number;
  avgSelfCare: number;
};

export type DashboardKpis = {
  kpis: KpiSummary;
  professionalFollowUp: ProfessionalFollowUp[];
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
