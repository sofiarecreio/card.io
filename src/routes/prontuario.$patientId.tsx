import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { BiCard, RiskBadge } from "@/components/bi/Card";
import { ClinicalFormRenderer } from "@/components/clinical/ClinicalFormRenderer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { patients, patientLongitudinal, professionalFollowUp, type Patient } from "@/lib/mockData";
import {
  clinicalFormTemplates,
  cloneClinicalValues,
  countFilledFields,
  countTotalEditableFields,
  createClinicalFormMetaDefaults,
  createPrefilledClinicalFormsState,
  getClinicalTemplate,
  type ClinicalFieldValue,
  type ClinicalFormKey,
  type ClinicalFormMeta,
  type ClinicalFormValues,
  type ClinicalFormsState,
} from "@/lib/clinicalForms";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock,
  Edit3,
  FileText,
  HeartPulse,
  MessageSquare,
  Pill,
  Scale,
  Send,
  Stethoscope,
  Trash2,
  TrendingDown,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/prontuario/$patientId")({
  head: () => ({
    meta: [
      { title: "Prontuário detalhado · Card.io" },
      { name: "description", content: "Prontuário detalhado do paciente monitorado." },
    ],
  }),
  component: PatientRecordPage,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};

const riskLabels = {
  high: "Alto",
  medium: "Moderado",
  low: "Baixo",
};

type SuggestedAction = "appointment" | "review" | "worsening";

type PatientProfileDraft = {
  name: string;
  age: string;
  risk: Patient["risk"];
  hr: string;
  weight: string;
  selfCare: string;
  adherence: string;
  bp: string;
  spo2: string;
  fe: string;
  vo2: string;
  responsible: string;
};

type FormDraft = {
  key: ClinicalFormKey;
  values: ClinicalFormValues;
};

type CalendarAppointment = {
  id: string;
  professional: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  mode: string;
  note: string;
  createdAt: string;
};

const actionCopy = {
  appointment: {
    title: "Agendar consulta",
    description:
      "Abra a agenda do profissional que está visualizando o prontuário e selecione um horário disponível.",
    placeholder: "Ex.: consulta em 48h com cardiologia, confirmar transporte familiar.",
  },
  review: {
    title: "Revisar evolução",
    description: "Abra a revisão longitudinal para consolidar sinais, sintomas e formulários.",
    placeholder: "Ex.: revisar ganho ponderal, medicamentos e sintomas noturnos.",
  },
  worsening: {
    title: "Checar piora",
    description: "Abra o checklist de piora clínica para orientar a intervenção.",
    placeholder: "Ex.: se SpO2 persistir abaixo de 92%, orientar atendimento presencial.",
  },
} satisfies Record<SuggestedAction, { title: string; description: string; placeholder: string }>;

const reviewItems = [
  "Sinais vitais",
  "Peso",
  "Medicamentos",
  "Sintomas",
  "Ecocardiograma",
  "Autocuidado",
];

const worseningItems = [
  "Dispneia",
  "Ortopneia/DPN",
  "Edema",
  "Ganho de peso",
  "SpO2 baixa",
  "PA fora do alvo",
];

const viewerProfessional = "Dr. Henrique Lima";

const appointmentMonths = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const appointmentWeekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const appointmentHours = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

function PatientRecordPage() {
  const { patientId } = Route.useParams();
  const sourcePatient = patients.find((p) => p.id === patientId) ?? patients[0];
  const responsible = getProfessional(sourcePatient.id);
  const latestWeight = getLatestWeight(sourcePatient.id);
  const [clinicalForms, setClinicalForms] = useState<ClinicalFormsState>(() =>
    createPrefilledClinicalFormsState({
      ...sourcePatient,
      weight: latestWeight,
      responsible,
    }),
  );
  const [formMeta, setFormMeta] = useState<Record<ClinicalFormKey, ClinicalFormMeta>>(() => ({
    ...createClinicalFormMetaDefaults(),
    identificacao: { updated: "12/04/2026", status: "completo" },
    anamnese: { updated: "12/04/2026", status: "completo" },
    framingham: { updated: "12/04/2026", status: "completo" },
    ecocardiograma: { updated: "05/04/2026", status: "completo" },
    exameFisico: { updated: "10/04/2026", status: "completo" },
    avaliacaoFuncional: { updated: "03/04/2026", status: "parcial" },
    autocuidado: { updated: "14/04/2026", status: "completo" },
    qualidadeVida: { updated: "14/04/2026", status: "parcial" },
  }));
  const [activeFormKey, setActiveFormKey] = useState<ClinicalFormKey | null>(null);
  const [formDraft, setFormDraft] = useState<FormDraft | null>(null);
  const [formPendingDelete, setFormPendingDelete] = useState<ClinicalFormKey | null>(null);
  const [deletedForms, setDeletedForms] = useState<ClinicalFormKey[]>([]);
  const [confirmFormSaveOpen, setConfirmFormSaveOpen] = useState(false);
  const [confirmFormDeleteOpen, setConfirmFormDeleteOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<SuggestedAction | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(() => getTodayIsoDate());
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [appointmentCursor, setAppointmentCursor] = useState(() => getMonthKey(getTodayIsoDate()));
  const [appointmentMode, setAppointmentMode] = useState("Teleconsulta");
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarAppointments, setCalendarAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedReviewItems, setSelectedReviewItems] = useState<string[]>([
    "Sinais vitais",
    "Peso",
    "Medicamentos",
  ]);
  const [selectedWorseningItems, setSelectedWorseningItems] = useState<string[]>([
    "Dispneia",
    "Edema",
  ]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [clinicalHistory, setClinicalHistory] = useState([
    "Prontuário revisado pela equipe de insuficiência cardíaca.",
    "Última evolução remota incorporada à série longitudinal.",
  ]);
  const [recordDeleted, setRecordDeleted] = useState(false);
  const [profileDraft, setProfileDraft] = useState<PatientProfileDraft>({
    name: sourcePatient.name,
    age: String(sourcePatient.age),
    risk: sourcePatient.risk,
    hr: String(sourcePatient.hr),
    weight: String(latestWeight),
    selfCare: String(sourcePatient.selfCare),
    adherence: String(sourcePatient.adherence),
    bp: sourcePatient.bp,
    spo2: String(sourcePatient.spo2),
    fe: String(sourcePatient.fe),
    vo2: String(sourcePatient.vo2),
    responsible,
  });
  const [profileWorkingDraft, setProfileWorkingDraft] = useState(profileDraft);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [confirmProfileSaveOpen, setConfirmProfileSaveOpen] = useState(false);
  const [confirmRecordDeleteOpen, setConfirmRecordDeleteOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      author: "Enf. Carla",
      text: "Dona Maria, lembre-se de tomar a Losartana no almoço e registrar o peso hoje.",
      time: "Hoje, 09h12",
    },
    {
      author: "Dr. Henrique Lima",
      text: "Vamos revisar sua pressão na próxima consulta. Mantenha os registros diários.",
      time: "Ontem, 17h40",
    },
  ]);

  const calendarStorageKey = `cardio-calendar:${viewerProfessional}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(calendarStorageKey);
      if (stored) setCalendarAppointments(JSON.parse(stored) as CalendarAppointment[]);
    } catch {
      setCalendarAppointments([]);
    } finally {
      setCalendarLoaded(true);
    }
  }, [calendarStorageKey]);

  useEffect(() => {
    if (!calendarLoaded) return;
    window.localStorage.setItem(calendarStorageKey, JSON.stringify(calendarAppointments));
  }, [calendarAppointments, calendarLoaded, calendarStorageKey]);

  const patient = {
    ...sourcePatient,
    name: profileDraft.name,
    age: Number(profileDraft.age) || sourcePatient.age,
    risk: profileDraft.risk,
    selfCare: Number(profileDraft.selfCare) || sourcePatient.selfCare,
    adherence: Number(profileDraft.adherence) || sourcePatient.adherence,
    bp: profileDraft.bp,
    spo2: Number(profileDraft.spo2) || sourcePatient.spo2,
    hr: Number(profileDraft.hr) || sourcePatient.hr,
    fe: Number(profileDraft.fe) || sourcePatient.fe,
    vo2: Number(profileDraft.vo2) || sourcePatient.vo2,
  };
  const timeline = patientLongitudinal[sourcePatient.id] ?? patientLongitudinal["P-1042"];
  const availableForms = clinicalFormTemplates.filter(
    (template) => !deletedForms.includes(template.key),
  );
  const activeTemplate = activeFormKey ? getClinicalTemplate(activeFormKey) : undefined;
  const activeMeta = activeFormKey ? formMeta[activeFormKey] : undefined;

  const syncedClinicalForms = useMemo<ClinicalFormsState>(() => {
    const current = cloneFormsState(clinicalForms);
    current.identificacao = {
      ...current.identificacao,
      recordId: sourcePatient.id,
      nomeCompleto: patient.name,
      idadeCalculada: `${patient.age} anos`,
      responsavel: profileDraft.responsible,
    };
    current.exameFisico = {
      ...current.exameFisico,
      fc: profileDraft.hr,
      spo2: profileDraft.spo2,
      pasD: profileDraft.bp.split("/")[0] ?? "",
      padD: profileDraft.bp.split("/")[1] ?? "",
    };
    current.ecocardiograma = {
      ...current.ecocardiograma,
      feveSimpson: profileDraft.fe,
    };
    current.avaliacaoFuncional = {
      ...current.avaliacaoFuncional,
      td6Vo2Max: profileDraft.vo2,
    };
    return current;
  }, [clinicalForms, patient.age, patient.name, profileDraft, sourcePatient.id]);

  function sendMessage() {
    const text = messageDraft.trim();
    if (!text) return;

    setMessages((current) => [
      {
        author: profileDraft.responsible,
        text,
        time: "Agora",
      },
      ...current,
    ]);
    setMessageDraft("");
    setMessageFeedback("Recado enviado para o paciente.");
  }

  function openProfileEdit() {
    setProfileWorkingDraft(profileDraft);
    setProfileEditOpen(true);
  }

  function updateProfileDraft<Key extends keyof PatientProfileDraft>(
    key: Key,
    value: PatientProfileDraft[Key],
  ) {
    setProfileWorkingDraft((current) => ({ ...current, [key]: value }));
  }

  function saveProfileDraft() {
    setProfileDraft(profileWorkingDraft);
    setClinicalHistory((current) => ["Perfil e resumo do prontuário atualizados.", ...current]);
    setActionFeedback("Dados do prontuário atualizados.");
    setConfirmProfileSaveOpen(false);
    setProfileEditOpen(false);
  }

  function deleteRecord() {
    setRecordDeleted(true);
    setClinicalHistory((current) => ["Prontuário excluído da visualização ativa.", ...current]);
    setConfirmRecordDeleteOpen(false);
  }

  function openFormEdit(key: ClinicalFormKey) {
    setFormDraft({ key, values: cloneClinicalValues(syncedClinicalForms[key]) });
  }

  function updateFormDraftField(fieldId: string, value: ClinicalFieldValue) {
    setFormDraft((current) =>
      current
        ? {
            ...current,
            values: {
              ...current.values,
              [fieldId]: value,
            },
          }
        : current,
    );
  }

  function saveFormDraft() {
    if (!formDraft) return;
    const template = getClinicalTemplate(formDraft.key);
    if (!template) return;
    const filled = countFilledFields(template, formDraft.values);
    const total = countTotalEditableFields(template);
    const status = filled === 0 ? "pendente" : filled < total ? "parcial" : "completo";

    setClinicalForms((current) => ({
      ...current,
      [formDraft.key]: cloneClinicalValues(formDraft.values),
    }));
    setFormMeta((current) => ({
      ...current,
      [formDraft.key]: { updated: "20/05/2026", status },
    }));
    setActiveFormKey(formDraft.key);
    setClinicalHistory((current) => [`Formulário ${template.name} editado.`, ...current]);
    setFormDraft(null);
    setConfirmFormSaveOpen(false);
  }

  function deleteForm() {
    if (!formPendingDelete) return;
    const template = getClinicalTemplate(formPendingDelete);
    setDeletedForms((current) =>
      current.includes(formPendingDelete) ? current : [...current, formPendingDelete],
    );
    setClinicalHistory((current) => [
      `Formulário ${template?.name ?? formPendingDelete} excluído.`,
      ...current,
    ]);
    setActiveFormKey(null);
    setFormPendingDelete(null);
    setConfirmFormDeleteOpen(false);
  }

  function completeSuggestedAction() {
    if (!activeAction) return;
    const note = actionNote.trim();
    let feedback = "";

    if (activeAction === "appointment") {
      const conflict = getBookedAppointment(
        calendarAppointments,
        viewerProfessional,
        appointmentDate,
        appointmentTime,
      );

      if (conflict) {
        setActionFeedback(
          `Horário indisponível: ${formatBrazilianDate(appointmentDate)} às ${appointmentTime} já está ocupado por ${conflict.patientName}.`,
        );
        return;
      }

      const appointment: CalendarAppointment = {
        id: `${viewerProfessional}-${patient.id}-${appointmentDate}-${appointmentTime}-${Date.now()}`,
        professional: viewerProfessional,
        patientId: patient.id,
        patientName: patient.name,
        date: appointmentDate,
        time: appointmentTime,
        mode: appointmentMode,
        note,
        createdAt: new Date().toISOString(),
      };

      setCalendarAppointments((current) => [...current, appointment]);
      feedback = `Agenda de ${viewerProfessional}: ${appointmentMode.toLowerCase()} para ${
        patient.name
      } em ${formatBrazilianDate(appointmentDate)} às ${appointmentTime}. ${
        note || "Paciente será avisado pelo recado da equipe."
      }`;
    } else if (activeAction === "review") {
      feedback = `Revisão de evolução aberta para ${profileDraft.responsible}: ${selectedReviewItems.join(
        ", ",
      )}. ${note || "Sem observações adicionais."}`;
    } else {
      feedback = `Checagem de piora aberta para ${profileDraft.responsible}: ${selectedWorseningItems.join(
        ", ",
      )}. ${note || "Priorizar contato ativo se houver piora."}`;
    }

    setActionFeedback(feedback);
    setClinicalHistory((current) => [feedback, ...current]);
    setActionNote("");
    setActiveAction(null);
  }

  if (recordDeleted) {
    return (
      <AppShell profile="team">
        <div className="rounded-3xl border border-danger/25 bg-danger/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">
            Prontuário excluído
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{profileDraft.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A exclusão foi aplicada nesta sessão após confirmação. Volte ao dashboard para seguir
            com outros pacientes.
          </p>
          <Link
            to="/equipe"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile="team">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to="/equipe"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao dashboard
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Prontuário detalhado
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {patient.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.id} · {patient.age} anos · responsável: {profileDraft.responsible}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge risk={patient.risk} />
          <Button variant="outline" size="sm" onClick={openProfileEdit} className="rounded-full">
            <Edit3 className="h-4 w-4" />
            Editar perfil
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmRecordDeleteOpen(true)}
            className="rounded-full text-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
            Excluir prontuário
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <BiCard
          className="lg:col-span-12"
          title="Resumo do prontuário"
          subtitle="Dados clínicos mais relevantes para decisão rápida"
          accent={
            patient.risk === "high" ? "danger" : patient.risk === "medium" ? "warning" : "success"
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RecordMetric
              icon={<HeartPulse className="h-4 w-4" />}
              label="FC atual"
              value={`${patient.hr} bpm`}
            />
            <RecordMetric
              icon={<Scale className="h-4 w-4" />}
              label="Peso"
              value={`${profileDraft.weight} kg`}
            />
            <RecordMetric
              icon={<Activity className="h-4 w-4" />}
              label="Autocuidado"
              value={`${patient.selfCare}%`}
            />
            <RecordMetric
              icon={<Pill className="h-4 w-4" />}
              label="Adesão"
              value={`${patient.adherence}%`}
            />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoPanel title="Resumo clínico">
              Paciente com risco {riskLabels[patient.risk].toLowerCase()}, FE {patient.fe}%, SpO2{" "}
              {patient.spo2}% e última resposta {patient.lastResponse}. Priorizar revisão de
              sintomas e ganho ponderal recente.
            </InfoPanel>
            <InfoPanel title="Responsável">
              <span className="inline-flex items-center gap-2 font-semibold">
                <UserCheck className="h-4 w-4 text-primary" />
                {profileDraft.responsible}
              </span>
            </InfoPanel>
            <InfoPanel title="Ações sugeridas">
              <div className="flex flex-wrap gap-2">
                <ActionPill
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="Agendar consulta"
                  onClick={() => setActiveAction("appointment")}
                />
                <ActionPill
                  icon={<Stethoscope className="h-3.5 w-3.5" />}
                  label="Revisar evolução"
                  onClick={() => setActiveAction("review")}
                />
                <ActionPill
                  icon={<TrendingDown className="h-3.5 w-3.5" />}
                  label="Checar piora"
                  onClick={() => setActiveAction("worsening")}
                />
              </div>
              {actionFeedback && (
                <div className="mt-3 text-xs font-semibold text-success">{actionFeedback}</div>
              )}
            </InfoPanel>
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-12"
          title="Recados para o paciente"
          subtitle="Mensagens enviadas pela equipe assistencial"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-2xl border border-border bg-secondary/25 p-4">
              <label className="text-sm font-semibold">
                Novo recado
                <textarea
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={`Mensagem para ${patient.name}`}
                />
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {messageFeedback && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-success">
                    <MessageSquare className="h-4 w-4" />
                    {messageFeedback}
                  </div>
                )}
                <Button onClick={sendMessage} className="rounded-full sm:ml-auto">
                  <Send className="h-4 w-4" />
                  Enviar recado
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.author}-${message.time}-${index}`}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold">{message.author}</div>
                    <div className="text-xs text-muted-foreground">{message.time}</div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-12"
          title="Histórico e ações clínicas"
          subtitle="Registro das ações executadas neste prontuário"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {clinicalHistory.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl border border-border bg-secondary/25 p-4 text-sm"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Evento {clinicalHistory.length - index}
                </div>
                {item}
              </div>
            ))}
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-12"
          title="Evolução de indicadores"
          subtitle="Frequência cardíaca, peso e adesão no acompanhamento longitudinal"
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hr"
                name="FC bpm"
                stroke="var(--danger)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="weight"
                name="Peso kg"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="adherence"
                name="Adesão %"
                stroke="var(--success)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard
          className="lg:col-span-12"
          title="Formulários clínicos & anamneses"
          subtitle={`Universal CardIO 2.0 · ${patient.name} (${patient.id}, ${patient.age} anos)`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {availableForms.map((template) => (
              <ClinicalFormCard
                key={template.key}
                template={template}
                values={syncedClinicalForms[template.key]}
                meta={formMeta[template.key]}
                onOpen={() => setActiveFormKey(template.key)}
              />
            ))}
          </div>
        </BiCard>
      </div>

      <Dialog open={!!activeFormKey} onOpenChange={(open) => !open && setActiveFormKey(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          {activeTemplate && activeFormKey && activeMeta && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{activeTemplate.name}</DialogTitle>
                <DialogDescription>
                  {patient.name} · {patient.id} · atualizado em {activeMeta.updated} ·{" "}
                  {activeTemplate.source}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openFormEdit(activeFormKey)}>
                  <Edit3 className="h-4 w-4" />
                  Editar formulário
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormPendingDelete(activeFormKey);
                    setConfirmFormDeleteOpen(true);
                  }}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir formulário
                </Button>
              </div>
              <ClinicalFormRenderer
                template={activeTemplate}
                values={syncedClinicalForms[activeFormKey]}
                readOnly
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar perfil e prontuário</DialogTitle>
            <DialogDescription>
              Atualize dados do paciente e confirme antes de aplicar ao prontuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <ProfileField
              label="Nome"
              value={profileWorkingDraft.name}
              onChange={(value) => updateProfileDraft("name", value)}
            />
            <ProfileField
              label="Idade"
              value={profileWorkingDraft.age}
              onChange={(value) => updateProfileDraft("age", value)}
            />
            <label className="block text-sm font-medium">
              Risco
              <select
                value={profileWorkingDraft.risk}
                onChange={(event) =>
                  updateProfileDraft("risk", event.target.value as Patient["risk"])
                }
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Baixo</option>
                <option value="medium">Moderado</option>
                <option value="high">Alto</option>
              </select>
            </label>
            <ProfileField
              label="Responsável"
              value={profileWorkingDraft.responsible}
              onChange={(value) => updateProfileDraft("responsible", value)}
            />
            <ProfileField
              label="FC"
              value={profileWorkingDraft.hr}
              onChange={(value) => updateProfileDraft("hr", value)}
            />
            <ProfileField
              label="Peso"
              value={profileWorkingDraft.weight}
              onChange={(value) => updateProfileDraft("weight", value)}
            />
            <ProfileField
              label="Autocuidado"
              value={profileWorkingDraft.selfCare}
              onChange={(value) => updateProfileDraft("selfCare", value)}
            />
            <ProfileField
              label="Adesão"
              value={profileWorkingDraft.adherence}
              onChange={(value) => updateProfileDraft("adherence", value)}
            />
            <ProfileField
              label="PA"
              value={profileWorkingDraft.bp}
              onChange={(value) => updateProfileDraft("bp", value)}
            />
            <ProfileField
              label="SpO2"
              value={profileWorkingDraft.spo2}
              onChange={(value) => updateProfileDraft("spo2", value)}
            />
            <ProfileField
              label="FEVE"
              value={profileWorkingDraft.fe}
              onChange={(value) => updateProfileDraft("fe", value)}
            />
            <ProfileField
              label="VO2"
              value={profileWorkingDraft.vo2}
              onChange={(value) => updateProfileDraft("vo2", value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setProfileEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmProfileSaveOpen(true)}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!formDraft} onOpenChange={(open) => !open && setFormDraft(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto rounded-2xl">
          {formDraft && getClinicalTemplate(formDraft.key) && (
            <>
              <DialogHeader>
                <DialogTitle>Editar formulário clínico</DialogTitle>
                <DialogDescription>
                  Ajuste as perguntas e confirme antes de atualizar o prontuário.
                </DialogDescription>
              </DialogHeader>
              <ClinicalFormRenderer
                template={getClinicalTemplate(formDraft.key)!}
                values={formDraft.values}
                onChange={updateFormDraftField}
              />
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setFormDraft(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => setConfirmFormSaveOpen(true)}>Salvar formulário</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeAction} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto rounded-2xl">
          {activeAction && (
            <>
              <DialogHeader>
                <DialogTitle>{actionCopy[activeAction].title}</DialogTitle>
                <DialogDescription>{actionCopy[activeAction].description}</DialogDescription>
              </DialogHeader>

              {activeAction === "appointment" && (
                <div className="space-y-4">
                  <AppointmentCalendar
                    professional={viewerProfessional}
                    appointments={calendarAppointments}
                    cursorMonth={appointmentCursor}
                    onCursorMonthChange={setAppointmentCursor}
                    selectedDate={appointmentDate}
                    selectedTime={appointmentTime}
                    onSelect={(date, time) => {
                      setAppointmentCursor(getMonthKey(date));
                      setAppointmentDate(date);
                      setAppointmentTime(time);
                    }}
                  />
                  <label className="block text-sm font-medium">
                    Tipo
                    <select
                      value={appointmentMode}
                      onChange={(event) => setAppointmentMode(event.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Teleconsulta</option>
                      <option>Presencial</option>
                      <option>Retorno de enfermagem</option>
                    </select>
                  </label>
                </div>
              )}

              {activeAction === "review" && (
                <Checklist
                  title="Itens da revisão"
                  options={reviewItems}
                  selected={selectedReviewItems}
                  onToggle={(item) => toggleItem(item, selectedReviewItems, setSelectedReviewItems)}
                />
              )}

              {activeAction === "worsening" && (
                <Checklist
                  title="Sinais de piora"
                  options={worseningItems}
                  selected={selectedWorseningItems}
                  onToggle={(item) =>
                    toggleItem(item, selectedWorseningItems, setSelectedWorseningItems)
                  }
                />
              )}

              <label className="text-sm font-semibold">
                Observação da ação
                <textarea
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  placeholder={actionCopy[activeAction].placeholder}
                  className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Cancelar
                </Button>
                <Button onClick={completeSuggestedAction}>Registrar ação</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmProfileSaveOpen} onOpenChange={setConfirmProfileSaveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edição do prontuário</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja aplicar as alterações no perfil e resumo clínico deste paciente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={saveProfileDraft}>Confirmar edição</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRecordDeleteOpen} onOpenChange={setConfirmRecordDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir prontuário</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o prontuário da visualização ativa desta sessão. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRecord}>Excluir prontuário</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFormSaveOpen} onOpenChange={setConfirmFormSaveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edição do formulário</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alterações neste formulário clínico?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={saveFormDraft}>Salvar formulário</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFormDeleteOpen} onOpenChange={setConfirmFormDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulário</AlertDialogTitle>
            <AlertDialogDescription>
              O formulário será removido deste prontuário na sessão atual. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteForm}>Excluir formulário</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function ClinicalFormCard({
  template,
  values,
  meta,
  onOpen,
}: {
  template: (typeof clinicalFormTemplates)[number];
  values: ClinicalFormValues;
  meta: ClinicalFormMeta;
  onOpen: () => void;
}) {
  const filled = countFilledFields(template, values);
  const total = countTotalEditableFields(template);
  const StatusIcon =
    meta.status === "completo" ? CheckCircle2 : meta.status === "parcial" ? Clock : CircleDashed;
  const statusCls =
    meta.status === "completo"
      ? "text-success"
      : meta.status === "parcial"
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <button
      onClick={onOpen}
      className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </span>
        <span
          className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${statusCls}`}
        >
          <StatusIcon className="h-3 w-3" /> {meta.status}
        </span>
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight">{template.name}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{template.short}</div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[10px]">
        <span className="text-muted-foreground">Atualizado {meta.updated}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">
          {filled}/{total}
        </span>
      </div>
    </button>
  );
}

function RecordMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ActionPill({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium transition hover:bg-accent"
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "time";
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function AppointmentCalendar({
  professional,
  appointments,
  cursorMonth,
  onCursorMonthChange,
  selectedDate,
  selectedTime,
  onSelect,
}: {
  professional: string;
  appointments: CalendarAppointment[];
  cursorMonth: string;
  onCursorMonthChange: (month: string) => void;
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
}) {
  const cursor = parseMonthKey(cursorMonth);
  const today = getTodayIsoDate();
  const monthCells = buildMonthCells(cursor.year, cursor.monthIndex);
  const selectedDaySlots = appointmentHours.map((hour) => ({
    hour,
    appointment: getBookedAppointment(appointments, professional, selectedDate, hour),
    unavailable: !isWorkingDay(selectedDate),
  }));
  const selectedDayAppointments = getDayAppointments(appointments, professional, selectedDate);

  return (
    <div className="rounded-2xl border border-border bg-secondary/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold">Agenda de {professional}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Navegue por qualquer mês e ano, escolha um dia com expediente e selecione um horário.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Disponível
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Ocupado
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Selecionado
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navegação
            </div>
            <div className="mt-1 font-display text-xl font-semibold">
              {appointmentMonths[cursor.monthIndex]} {cursor.year}
            </div>
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-semibold text-muted-foreground">
              Mês
              <select
                value={cursor.monthIndex}
                onChange={(event) =>
                  onCursorMonthChange(toMonthKey(cursor.year, Number(event.target.value)))
                }
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {appointmentMonths.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Ano
              <input
                type="number"
                value={cursor.year}
                min={1900}
                max={2200}
                onChange={(event) =>
                  onCursorMonthChange(toMonthKey(Number(event.target.value), cursor.monthIndex))
                }
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <button
              type="button"
              onClick={() => onCursorMonthChange(getMonthKey(today))}
              className="h-10 rounded-full border border-border bg-background px-3 text-xs font-semibold transition hover:bg-accent"
            >
              Hoje
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {appointmentMonths.map((month, index) => (
              <button
                key={month}
                type="button"
                onClick={() => onCursorMonthChange(toMonthKey(cursor.year, index))}
                className={`min-h-9 rounded-xl border px-2 text-xs font-semibold transition ${
                  cursor.monthIndex === index
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onCursorMonthChange(shiftMonthKey(cursorMonth, -1))}
              className="h-9 rounded-full border border-border px-3 text-xs font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <div className="text-center">
              <div className="font-display text-2xl font-semibold">
                {appointmentMonths[cursor.monthIndex]}
              </div>
              <div className="text-xs text-muted-foreground">{cursor.year}</div>
            </div>
            <button
              type="button"
              onClick={() => onCursorMonthChange(shiftMonthKey(cursorMonth, 1))}
              className="h-9 rounded-full border border-border px-3 text-xs font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próximo
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {appointmentWeekdays.map((weekday) => (
              <div
                key={weekday}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {weekday}
              </div>
            ))}

            {monthCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="min-h-14 rounded-xl" />;
              }

              const slots = getAvailableAppointmentSlots(cell.date, appointments, professional);
              const dayAppointments = getDayAppointments(appointments, professional, cell.date);
              const closed = !isWorkingDay(cell.date);
              const unavailable = slots.length === 0;
              const selected = selectedDate === cell.date;
              const partial = dayAppointments.length > 0 && slots.length > 0;
              const isToday = cell.date === today;

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={closed || unavailable}
                  aria-pressed={selected}
                  onClick={() =>
                    onSelect(cell.date, slots.includes(selectedTime) ? selectedTime : slots[0])
                  }
                  className={`min-h-14 rounded-xl border p-2 text-left transition ${
                    closed || unavailable
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-70"
                      : selected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : partial
                          ? "border-warning/40 bg-warning/10 text-warning hover:border-warning"
                          : "border-success/30 bg-success/10 text-success hover:border-success"
                  }`}
                >
                  <span className="flex items-center justify-between gap-1 text-sm font-semibold">
                    {cell.day}
                    {isToday && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium">
                    {closed
                      ? "Sem expediente"
                      : unavailable
                        ? "Ocupado"
                        : `${slots.length} horário${slots.length > 1 ? "s" : ""}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dia selecionado
          </div>
          <div className="mt-1 font-display text-xl font-semibold">
            {formatBrazilianDate(selectedDate)}
          </div>
          {selectedDayAppointments.length > 0 && (
            <div className="mt-2 rounded-xl border border-border bg-secondary/45 p-2 text-[11px] text-muted-foreground">
              {selectedDayAppointments.length} consulta
              {selectedDayAppointments.length > 1 ? "s" : ""} marcada
              {selectedDayAppointments.length > 1 ? "s" : ""}.
            </div>
          )}
          <div className="mt-3 grid gap-2">
            {selectedDaySlots.map((slot) => {
              const unavailable = slot.unavailable || Boolean(slot.appointment);
              const selected = selectedTime === slot.hour;
              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selected}
                  onClick={() => onSelect(selectedDate, slot.hour)}
                  className={`min-h-10 rounded-xl border px-3 text-left text-xs font-semibold transition ${
                    unavailable
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-70"
                      : selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-success/30 bg-success/10 text-success hover:border-success"
                  }`}
                >
                  {slot.hour} ·{" "}
                  {slot.appointment
                    ? slot.appointment.patientName
                    : unavailable
                      ? "ocupado"
                      : "livre"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toggleItem(
  item: string,
  selected: string[],
  setter: React.Dispatch<React.SetStateAction<string[]>>,
) {
  setter(
    selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item],
  );
}

function cloneFormsState(state: ClinicalFormsState): ClinicalFormsState {
  return Object.fromEntries(
    Object.entries(state).map(([key, values]) => [key, cloneClinicalValues(values)]),
  ) as ClinicalFormsState;
}

function getLatestWeight(patientId: string) {
  const series = patientLongitudinal[patientId] ?? patientLongitudinal["P-1042"];
  return series[series.length - 1]?.weight ?? 0;
}

function getProfessional(patientId: string) {
  const index = patients.findIndex((patient: Patient) => patient.id === patientId);
  return professionalFollowUp[Math.max(0, index) % professionalFollowUp.length].professional;
}

function buildMonthCells(year: number, monthIndex: number) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        day,
        date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      };
    }),
  ];
}

function getAvailableAppointmentSlots(
  date: string,
  appointments: CalendarAppointment[],
  professional: string,
) {
  if (!isWorkingDay(date)) return [];
  return appointmentHours.filter(
    (hour) => !getBookedAppointment(appointments, professional, date, hour),
  );
}

function getBookedAppointment(
  appointments: CalendarAppointment[],
  professional: string,
  date: string,
  time: string,
) {
  return appointments.find(
    (appointment) =>
      appointment.professional === professional &&
      appointment.date === date &&
      appointment.time === time,
  );
}

function getDayAppointments(
  appointments: CalendarAppointment[],
  professional: string,
  date: string,
) {
  return appointments
    .filter((appointment) => appointment.professional === professional && appointment.date === date)
    .sort((first, second) => first.time.localeCompare(second.time));
}

function isWorkingDay(date: string) {
  const parsed = parseIsoDate(date);
  if (!parsed) return false;

  const weekday = new Date(parsed.year, parsed.month - 1, parsed.day).getDay();
  return weekday !== 0 && weekday !== 6;
}

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return {
    year: year || new Date().getFullYear(),
    monthIndex: month ? month - 1 : new Date().getMonth(),
  };
}

function toMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function shiftMonthKey(monthKey: string, offset: number) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const date = new Date(year, monthIndex + offset, 1);
  return toMonthKey(date.getFullYear(), date.getMonth());
}

function getMonthKey(date: string) {
  const parsed = parseIsoDate(date);
  if (!parsed) return toMonthKey(new Date().getFullYear(), new Date().getMonth());
  return toMonthKey(parsed.year, parsed.month - 1);
}

function parseIsoDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function getTodayIsoDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

function formatBrazilianDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
