import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BiCard, RiskBadge } from "@/components/bi/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  patients,
  patientForms,
  patientLongitudinal,
  professionalFollowUp,
  type ClinicalForm,
  type Patient,
} from "@/lib/mockData";
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
  FileText,
  HeartPulse,
  Pill,
  Scale,
  Stethoscope,
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

function PatientRecordPage() {
  const { patientId } = Route.useParams();
  const [activeForm, setActiveForm] = useState<ClinicalForm | null>(null);
  const patient = patients.find((p) => p.id === patientId) ?? patients[0];
  const forms = patientForms[patient.id] ?? patientForms["P-1042"];
  const timeline = patientLongitudinal[patient.id] ?? patientLongitudinal["P-1042"];

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
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{patient.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.id} · {patient.age} anos · responsável: {getProfessional(patient.id)}
          </p>
        </div>
        <RiskBadge risk={patient.risk} />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <BiCard
          className="lg:col-span-12"
          title="Resumo do prontuário"
          subtitle="Dados clínicos mais relevantes para decisão rápida"
          accent={patient.risk === "high" ? "danger" : patient.risk === "medium" ? "warning" : "success"}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RecordMetric icon={<HeartPulse className="h-4 w-4" />} label="FC atual" value={`${patient.hr} bpm`} />
            <RecordMetric icon={<Scale className="h-4 w-4" />} label="Peso" value={`${getLatestWeight(patient.id)} kg`} />
            <RecordMetric icon={<Activity className="h-4 w-4" />} label="Autocuidado" value={`${patient.selfCare}%`} />
            <RecordMetric icon={<Pill className="h-4 w-4" />} label="Adesão" value={`${patient.adherence}%`} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoPanel title="Resumo clínico">
              Paciente com risco {riskLabels[patient.risk].toLowerCase()}, FE {patient.fe}%, SpO₂ {patient.spo2}% e última resposta {patient.lastResponse}.
              Priorizar revisão de adesão, sintomas e ganho ponderal recente.
            </InfoPanel>
            <InfoPanel title="Responsável">
              <span className="inline-flex items-center gap-2 font-semibold">
                <UserCheck className="h-4 w-4 text-primary" />
                {getProfessional(patient.id)}
              </span>
            </InfoPanel>
            <InfoPanel title="Ações sugeridas">
              <div className="flex flex-wrap gap-2">
                <ActionPill icon={<CalendarDays className="h-3.5 w-3.5" />} label="Agendar contato" />
                <ActionPill icon={<Stethoscope className="h-3.5 w-3.5" />} label="Revisar evolução" />
                <ActionPill icon={<TrendingDown className="h-3.5 w-3.5" />} label="Checar piora" />
              </div>
            </InfoPanel>
          </div>
        </BiCard>

        <BiCard className="lg:col-span-12" title="Evolução de indicadores" subtitle="Frequência cardíaca, peso e adesão no acompanhamento longitudinal">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="hr" name="FC bpm" stroke="var(--danger)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="weight" name="Peso kg" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="adherence" name="Adesão %" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard
          className="lg:col-span-12"
          title="Formulários clínicos & anamneses"
          subtitle={`Universal CardIO 2.0 · ${patient.name} (${patient.id}, ${patient.age} anos)`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {forms.map((form) => (
              <ClinicalFormCard key={form.key} form={form} onOpen={() => setActiveForm(form)} />
            ))}
          </div>
        </BiCard>
      </div>

      <Dialog open={!!activeForm} onOpenChange={(open) => !open && setActiveForm(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {activeForm && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{activeForm.name}</DialogTitle>
                <DialogDescription>
                  {patient.name} · {patient.id} · atualizado em {activeForm.updated}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-5">
                {activeForm.sections.map((section) => (
                  <section key={section.title}>
                    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h4>
                    <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                      {section.fields.map((field, index) => {
                        const flagCls =
                          field.flag === "alert" ? "border-l-2 border-danger bg-danger/10"
                            : field.flag === "warn" ? "border-l-2 border-warning bg-warning/10"
                              : "";
                        const valCls =
                          field.flag === "alert" ? "font-semibold text-danger"
                            : field.flag === "warn" ? "font-semibold text-warning"
                              : "text-foreground";
                        return (
                          <div key={index} className={`flex items-start justify-between gap-3 px-3 py-2 text-sm ${flagCls}`}>
                            <dt className="text-muted-foreground">{field.label}</dt>
                            <dd className={`text-right ${valCls}`}>{field.value}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </section>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ClinicalFormCard({ form, onOpen }: { form: ClinicalForm; onOpen: () => void }) {
  const alerts = form.sections.flatMap((section) => section.fields).filter((field) => field.flag === "alert").length;
  const warns = form.sections.flatMap((section) => section.fields).filter((field) => field.flag === "warn").length;
  const StatusIcon = form.status === "completo" ? CheckCircle2 : form.status === "parcial" ? Clock : CircleDashed;
  const statusCls = form.status === "completo" ? "text-success" : form.status === "parcial" ? "text-warning" : "text-muted-foreground";

  return (
    <button
      onClick={onOpen}
      className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </span>
        <span className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${statusCls}`}>
          <StatusIcon className="h-3 w-3" /> {form.status}
        </span>
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight">{form.name}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{form.short}</div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 text-[10px]">
        <span className="text-muted-foreground">Atualizado {form.updated}</span>
        <span className="flex items-center gap-1.5">
          {alerts > 0 && <span className="rounded-full bg-danger/15 px-1.5 py-0.5 font-semibold text-danger">{alerts} alerta</span>}
          {warns > 0 && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 font-semibold text-warning">{warns} atenção</span>}
        </span>
      </div>
    </button>
  );
}

function RecordMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ActionPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}

function getLatestWeight(patientId: string) {
  const series = patientLongitudinal[patientId] ?? patientLongitudinal["P-1042"];
  return series[series.length - 1]?.weight ?? 0;
}

function getProfessional(patientId: string) {
  const index = patients.findIndex((patient: Patient) => patient.id === patientId);
  return professionalFollowUp[Math.max(0, index) % professionalFollowUp.length].professional;
}
