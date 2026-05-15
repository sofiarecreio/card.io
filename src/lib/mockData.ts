// Mock data for heart failure monitoring BI

export const patientTimeSeries = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const baseHr = 72 + Math.sin(i / 4) * 6 + (i > 22 ? 4 : 0);
  return {
    day: `D${day}`,
    date: `2026-04-${String(day).padStart(2, "0")}`,
    hr: Math.round(baseHr + (Math.random() - 0.5) * 4),
    hrv: Math.round(45 - i * 0.4 + (Math.random() - 0.5) * 6),
    selfCare: Math.max(40, Math.round(82 - i * 0.6 + (Math.random() - 0.5) * 8)),
    adherence: Math.max(50, Math.round(90 - i * 0.5 + (Math.random() - 0.5) * 6)),
    confidence: Math.max(45, Math.round(78 - i * 0.3 + (Math.random() - 0.5) * 7)),
    symptoms: Math.min(80, Math.round(20 + i * 0.5 + (Math.random() - 0.5) * 6)),
  };
});

export const symptomRadar = [
  { symptom: "Dispneia", value: 45, fullMark: 100 },
  { symptom: "Fadiga", value: 62, fullMark: 100 },
  { symptom: "Edema", value: 28, fullMark: 100 },
  { symptom: "Tontura", value: 18, fullMark: 100 },
  { symptom: "Palpitação", value: 35, fullMark: 100 },
  { symptom: "Tosse", value: 22, fullMark: 100 },
];

export const habitsHeatmap = [
  { habit: "Medicação", values: [1, 1, 1, 1, 0, 1, 1] },
  { habit: "Pesagem", values: [1, 0, 1, 1, 1, 0, 1] },
  { habit: "Caminhada", values: [1, 1, 0, 1, 1, 1, 0] },
  { habit: "Dieta hipossódica", values: [1, 1, 1, 0, 1, 1, 1] },
  { habit: "Hidratação", values: [1, 1, 1, 1, 1, 1, 1] },
  { habit: "Sono ≥ 7h", values: [0, 1, 1, 0, 1, 0, 1] },
];

export const cohortKpis = {
  totalPatients: 248,
  activeMonitoring: 211,
  notResponding: 37,
  highRisk: 42,
  mediumRisk: 86,
  lowRisk: 120,
  avgAdherence: 78,
  avgSelfCare: 71,
};

export const riskDistribution = [
  { name: "Baixo", value: 120, color: "var(--success)" },
  { name: "Moderado", value: 86, color: "var(--warning)" },
  { name: "Alto", value: 42, color: "var(--danger)" },
];

export const cohortTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i],
  alto: 30 + Math.round(Math.sin(i / 2) * 8 + i * 0.6),
  moderado: 70 + Math.round(Math.cos(i / 3) * 10),
  baixo: 110 + Math.round(Math.sin(i / 4) * 6),
  internacoes: Math.max(2, Math.round(8 - i * 0.3 + Math.random() * 3)),
}));

export type Patient = {
  id: string;
  name: string;
  age: number;
  risk: "low" | "medium" | "high";
  selfCare: number;
  adherence: number;
  bp: string;
  spo2: number;
  hr: number;
  fe: number; // ejection fraction
  vo2: number;
  lastResponse: string;
  trend: "up" | "down" | "stable";
};

export const patients: Patient[] = [
  { id: "P-1042", name: "Maria S. Oliveira", age: 67, risk: "high", selfCare: 48, adherence: 62, bp: "148/92", spo2: 93, hr: 88, fe: 32, vo2: 12.4, lastResponse: "há 2h", trend: "down" },
  { id: "P-1019", name: "João P. Almeida", age: 72, risk: "high", selfCare: 52, adherence: 58, bp: "152/88", spo2: 91, hr: 94, fe: 28, vo2: 10.8, lastResponse: "há 1d", trend: "down" },
  { id: "P-1087", name: "Ana L. Ferreira", age: 58, risk: "medium", selfCare: 71, adherence: 80, bp: "132/82", spo2: 96, hr: 76, fe: 41, vo2: 16.2, lastResponse: "há 3h", trend: "stable" },
  { id: "P-1103", name: "Carlos R. Souza", age: 64, risk: "medium", selfCare: 68, adherence: 74, bp: "138/86", spo2: 95, hr: 80, fe: 38, vo2: 15.1, lastResponse: "há 5h", trend: "down" },
  { id: "P-1055", name: "Beatriz M. Lima", age: 55, risk: "low", selfCare: 88, adherence: 92, bp: "122/78", spo2: 98, hr: 70, fe: 52, vo2: 21.5, lastResponse: "há 1h", trend: "up" },
  { id: "P-1077", name: "Roberto C. Dias", age: 69, risk: "low", selfCare: 85, adherence: 90, bp: "126/80", spo2: 97, hr: 72, fe: 48, vo2: 19.8, lastResponse: "há 4h", trend: "up" },
  { id: "P-1112", name: "Fernanda T. Rocha", age: 61, risk: "high", selfCare: 45, adherence: 55, bp: "156/94", spo2: 90, hr: 96, fe: 26, vo2: 9.6, lastResponse: "há 3d", trend: "down" },
  { id: "P-1098", name: "Luís A. Mendes", age: 70, risk: "medium", selfCare: 66, adherence: 72, bp: "140/85", spo2: 94, hr: 82, fe: 36, vo2: 14.3, lastResponse: "há 6h", trend: "stable" },
];

export const teamComparison = [
  { team: "Cardio A", pacientes: 62, adesao: 82, alertas: 8 },
  { team: "Cardio B", pacientes: 54, adesao: 76, alertas: 12 },
  { team: "Insuf. Card.", pacientes: 48, adesao: 71, alertas: 15 },
  { team: "Reabilitação", pacientes: 44, adesao: 88, alertas: 4 },
  { team: "Telemed.", pacientes: 40, adesao: 79, alertas: 9 },
];

export const examTypes = [
  { type: "Ecocardiograma", count: 142, abnormal: 38 },
  { type: "Teste ergométrico", count: 98, abnormal: 22 },
  { type: "Holter 24h", count: 76, abnormal: 18 },
  { type: "VO2 máx", count: 54, abnormal: 14 },
  { type: "BNP/NT-proBNP", count: 188, abnormal: 56 },
];
