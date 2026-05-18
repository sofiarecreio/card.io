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

// ============== Clinical forms (REDCap-style) ==============

export type FormField = { label: string; value: string; flag?: "ok" | "warn" | "alert" };
export type FormSection = { title: string; fields: FormField[] };
export type ClinicalForm = {
  key: string;
  name: string;
  short: string;
  updated: string;
  status: "completo" | "parcial" | "pendente";
  sections: FormSection[];
};

export const patientForms: Record<string, ClinicalForm[]> = {
  "P-1042": [
    {
      key: "identificacao", name: "Identificação", short: "Dados sociodemográficos",
      updated: "12/04/2026", status: "completo",
      sections: [{
        title: "Dados pessoais",
        fields: [
          { label: "Record ID", value: "ICFEp-0042-1204-2026" },
          { label: "Data da avaliação", value: "12/04/2026" },
          { label: "Data de nascimento", value: "03/05/1959 (67 anos)" },
          { label: "Sexo", value: "Feminino" },
          { label: "Etnia", value: "Parda" },
          { label: "Escolaridade", value: "Nível fundamental completo" },
          { label: "Religião", value: "Católica" },
          { label: "Renda familiar", value: "R$ 2.400,00" },
        ],
      }],
    },
    {
      key: "anamnese", name: "Anamnese", short: "HDA, HDP, fatores de risco",
      updated: "12/04/2026", status: "completo",
      sections: [
        { title: "Sintomas", fields: [
          { label: "Dor torácica", value: "Não" },
          { label: "Dispneia", value: "Sim", flag: "alert" },
          { label: "Ortopneia", value: "Sim", flag: "alert" },
          { label: "D.P.N.", value: "Sim", flag: "alert" },
          { label: "Tontura", value: "Não" },
          { label: "Síncope", value: "Não" },
          { label: "Palpitação", value: "Sim", flag: "warn" },
          { label: "Edema", value: "Sim", flag: "alert" },
          { label: "Claudicação", value: "Não" },
        ]},
        { title: "Fatores de risco", fields: [
          { label: "Tabagismo", value: "Ex-fumante (>10 anos)" },
          { label: "Álcool", value: "1 vez por mês" },
        ]},
        { title: "HDP", fields: [
          { label: "Diabetes", value: "Sim", flag: "warn" },
          { label: "Hipertensão", value: "Sim", flag: "warn" },
          { label: "Obesidade", value: "Não" },
          { label: "Dislipidemia", value: "Sim", flag: "warn" },
          { label: "IAM prévio", value: "Sim", flag: "alert" },
          { label: "AVE", value: "Não" },
          { label: "Internação <12m", value: "Sim", flag: "alert" },
          { label: "Medicamentos", value: "Furosemida 40mg, Carvedilol 25mg, Losartana 50mg, Espironolactona 25mg" },
        ]},
      ],
    },
    {
      key: "framingham", name: "Critérios de Framingham", short: "Diagnóstico clínico de IC",
      updated: "12/04/2026", status: "completo",
      sections: [
        { title: "Critérios maiores (5 positivos)", fields: [
          { label: "Estertores pulmonares", value: "Sim", flag: "alert" },
          { label: "Dispneia paroxística noturna", value: "Sim", flag: "alert" },
          { label: "Edema agudo de pulmão", value: "Não" },
          { label: "Turgência jugular patológica", value: "Sim", flag: "alert" },
          { label: "Refluxo hepatojugular", value: "Não" },
          { label: "PVC > 16 cmH₂O", value: "Não" },
          { label: "Cardiomegalia em RX", value: "Sim", flag: "alert" },
          { label: "Terceira bulha", value: "Sim", flag: "alert" },
        ]},
        { title: "Critérios menores (3 positivos)", fields: [
          { label: "Dispneia de esforço", value: "Sim", flag: "warn" },
          { label: "Tosse noturna", value: "Sim", flag: "warn" },
          { label: "Edema maleolar", value: "Sim", flag: "warn" },
          { label: "Taquicardia >120 bpm", value: "Não" },
        ]},
        { title: "Conclusão", fields: [
          { label: "Diagnóstico", value: "IC confirmada (≥2 maiores)", flag: "alert" },
        ]},
      ],
    },
    {
      key: "exame", name: "Exame Físico", short: "Sinais vitais e ectoscopia",
      updated: "10/04/2026", status: "completo",
      sections: [{
        title: "Sinais vitais",
        fields: [
          { label: "FC", value: "88 bpm", flag: "warn" },
          { label: "FR", value: "22 irpm", flag: "warn" },
          { label: "PAS dir / esq", value: "148 / 146 mmHg", flag: "alert" },
          { label: "PAD dir / esq", value: "92 / 90 mmHg", flag: "alert" },
          { label: "SpO₂", value: "93%", flag: "warn" },
          { label: "Turgência de jugulares", value: "Presente +++", flag: "alert" },
          { label: "Aparelho respiratório", value: "Estertores em bases" },
          { label: "Cardiovascular", value: "B3 audível, sopro sistólico mitral 2+/6" },
          { label: "Membros inferiores", value: "Edema 2+/4 bilateral", flag: "alert" },
        ],
      }],
    },
    {
      key: "eco", name: "Ecocardiograma", short: "Função sistólica e diastólica",
      updated: "05/04/2026", status: "completo",
      sections: [
        { title: "Ventrículo esquerdo (2D)", fields: [
          { label: "VED", value: "62 mm" },
          { label: "VES", value: "48 mm" },
          { label: "SIV", value: "12 mm" },
          { label: "PPVE", value: "11 mm" },
          { label: "FEVE (Simpson)", value: "32%", flag: "alert" },
          { label: "GLS-VE", value: "−9,2%", flag: "alert" },
        ]},
        { title: "Função diastólica", fields: [
          { label: "Relação E/A", value: "2,4", flag: "warn" },
          { label: "E/E' média", value: "16", flag: "alert" },
          { label: "Disfunção diastólica", value: "Grau 2", flag: "warn" },
        ]},
        { title: "VD e hemodinâmica pulmonar", fields: [
          { label: "TAPSE", value: "15 mm", flag: "warn" },
          { label: "PSAP", value: "48 mmHg", flag: "alert" },
        ]},
      ],
    },
    {
      key: "funcional", name: "Avaliação Funcional", short: "VFC, Ewing, TD6, VO₂",
      updated: "03/04/2026", status: "parcial",
      sections: [
        { title: "Variabilidade da FC", fields: [
          { label: "RR médio", value: "684 ms" },
          { label: "SDNN", value: "22 ms", flag: "alert" },
          { label: "RMSSD", value: "14 ms", flag: "alert" },
          { label: "Relação LF/HF", value: "3,1", flag: "warn" },
        ]},
        { title: "Teste de Ewing", fields: [
          { label: "CAN", value: "Disfunção severa (3)", flag: "alert" },
          { label: "Bendopneia", value: "Positiva (<30s)", flag: "alert" },
        ]},
        { title: "Teste do Degrau 6min", fields: [
          { label: "Degraus", value: "48" },
          { label: "VO₂ máx predito", value: "12,4 ml/kg/min", flag: "alert" },
          { label: "Δ FC rec 1min", value: "8 bpm", flag: "warn" },
          { label: "Borg final", value: "8/10", flag: "alert" },
          { label: "Índice cronotrópico (ICx)", value: "0,62", flag: "alert" },
        ]},
      ],
    },
    {
      key: "autocuidado", name: "Autocuidado (SCHFI)", short: "Manutenção, percepção e confiança",
      updated: "14/04/2026", status: "completo",
      sections: [
        { title: "Manutenção", fields: [
          { label: "Exercício regular", value: "Raramente", flag: "alert" },
          { label: "Dieta com pouco sal", value: "Às vezes", flag: "warn" },
          { label: "Toma medicação sem esquecer", value: "Frequentemente" },
          { label: "Controla peso diariamente", value: "Raramente", flag: "alert" },
          { label: "Vacina contra gripe", value: "Sempre" },
        ]},
        { title: "Percepção de sintomas", fields: [
          { label: "Observa cansaço incomum", value: "Às vezes", flag: "warn" },
          { label: "Verifica tornozelos inchados", value: "Raramente", flag: "alert" },
          { label: "Anota sintomas", value: "Nunca", flag: "alert" },
        ]},
        { title: "Confiança", fields: [
          { label: "Manter-se livre de sintomas", value: "Um pouco confiante", flag: "warn" },
          { label: "Seguir plano de tratamento", value: "Confiante" },
          { label: "Reconhecer mudanças", value: "Um pouco confiante", flag: "warn" },
        ]},
      ],
    },
  ],
};
