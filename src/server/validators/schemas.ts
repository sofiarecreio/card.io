import { z } from "zod";

export const roleSchema = z.enum(["admin", "physician", "nurse", "technician"]);
export const riskSchema = z.enum(["low", "medium", "high"]);
export const trendSchema = z.enum(["up", "down", "stable"]);
export const appointmentStatusSchema = z.enum(["scheduled", "completed", "cancelled", "missed"]);
export const alertSeveritySchema = z.enum(["low", "medium", "high"]);
export const alertStatusSchema = z.enum(["open", "resolved", "dismissed"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patientInputSchema = z.object({
  id: z.string().min(2).optional(),
  name: z.string().min(2),
  cpf: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  age: z.number().int().min(0).max(130),
  risk: riskSchema.default("medium"),
  selfCare: z.number().int().min(0).max(100).default(0),
  adherence: z.number().int().min(0).max(100).default(0),
  bp: z.string().default("120/80"),
  spo2: z.number().int().min(0).max(100).default(98),
  hr: z.number().int().min(0).max(240).default(70),
  fe: z.number().int().min(0).max(100).default(50),
  vo2: z.number().min(0).default(18),
  lastResponse: z.string().default("ha 1h"),
  trend: trendSchema.default("stable"),
  status: z.string().default("active"),
});

export const patientUpdateSchema = patientInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo para atualizar.");

export const clinicalSummarySchema = z.object({
  summary: z.string().min(1),
});

export const evolutionInputSchema = z.object({
  evolutionType: z.string().min(1).default("note"),
  note: z.string().min(1),
});

export const appointmentInputSchema = z.object({
  professionalId: z.string().min(1),
  patientId: z.string().min(1),
  date: z.string().min(8),
  time: z.string().min(4),
  mode: z.string().min(1),
  note: z.string().optional().nullable(),
  status: appointmentStatusSchema.default("scheduled"),
});

export const measurementInputSchema = z.object({
  patientId: z.string().min(1),
  measuredAt: z.string().optional(),
  hr: z.number().int().min(0).max(240).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  adherence: z.number().int().min(0).max(100).optional().nullable(),
  spo2: z.number().int().min(0).max(100).optional().nullable(),
  bp: z.string().optional().nullable(),
  source: z.string().min(1).default("manual"),
});

export const alertInputSchema = z.object({
  patientId: z.string().min(1),
  severity: alertSeveritySchema,
  type: z.string().min(1),
  title: z.string().min(2),
  message: z.string().min(2),
  status: alertStatusSchema.default("open"),
});

export const agendaQuerySchema = z.object({
  professionalId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientInput = z.infer<typeof patientInputSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
export type ClinicalSummaryInput = z.infer<typeof clinicalSummarySchema>;
export type EvolutionInput = z.infer<typeof evolutionInputSchema>;
export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
export type MeasurementInput = z.infer<typeof measurementInputSchema>;
export type AlertInput = z.infer<typeof alertInputSchema>;
