import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BiCard, Kpi, RiskBadge } from "@/components/bi/Card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  cohortKpis,
  cohortTrend,
  examTypes,
  patients,
  patientForms,
  riskDistribution,
  teamComparison,
  type ClinicalForm,
} from "@/lib/mockData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  HeartPulse,
  Minus,
  Search,
  Stethoscope,
  Users,
  ClipboardList,
  Droplet,
  Wind,
  FileText,
  CheckCircle2,
  CircleDashed,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Dashboard Clínico · Card.io" },
      { name: "description", content: "KPIs e monitoramento de coortes de pacientes com insuficiência cardíaca." },
    ],
  }),
  component: TeamDashboard,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};

function TeamDashboard() {
  const [activeForm, setActiveForm] = useState<ClinicalForm | null>(null);
  const [activePatient, setActivePatient] = useState<string>("P-1042");
  const forms = patientForms[activePatient] ?? patientForms["P-1042"];
  const patient = patients.find((p) => p.id === activePatient) ?? patients[0];

  return (
    <AppShell profile="team">
      {/* Title + filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Cardiologia · Insuficiência Cardíaca</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Dashboard Clínico</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visão consolidada da coorte, evolução por perfis de risco e alertas de descompensação.</p>
        </div>
        <FilterBar />
      </div>

      {/* KPI grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Kpi label="Pacientes monitorados" value={cohortKpis.totalPatients} delta={`${cohortKpis.activeMonitoring} ativos`} trend="up" icon={<Users className="h-4 w-4" />} />
        <Kpi label="Sem resposta" value={cohortKpis.notResponding} delta="≥ 48h sem questionário" trend="down" tone="warning" icon={<ClipboardList className="h-4 w-4" />} />
        <Kpi label="Risco alto" value={cohortKpis.highRisk} delta="+5 esta semana" trend="down" tone="danger" icon={<AlertTriangle className="h-4 w-4" />} />
        <Kpi label="Adesão média" value={`${cohortKpis.avgAdherence}%`} delta="+2 pts vs. mês" trend="up" tone="success" icon={<HeartPulse className="h-4 w-4" />} />
        <Kpi label="Autocuidado" value={`${cohortKpis.avgSelfCare}%`} delta="-3 pts" trend="down" tone="warning" icon={<Activity className="h-4 w-4" />} />
        <Kpi label="SpO₂ médio" value="95%" delta="estável" trend="flat" icon={<Wind className="h-4 w-4" />} />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <BiCard className="lg:col-span-8" title="Evolução da coorte por perfil de risco" subtitle="Últimos 12 meses · Internações sobrepostas">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={cohortTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="baixo" stackId="a" name="Baixo" fill="var(--success)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="moderado" stackId="a" name="Moderado" fill="var(--warning)" />
              <Bar dataKey="alto" stackId="a" name="Alto" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="internacoes" name="Internações" stroke="var(--info)" strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard className="lg:col-span-4" title="Distribuição de risco" subtitle="Coorte ativa">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3} stroke="none">
                {riskDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="-mt-4 space-y-1.5">
            {riskDistribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value} pacientes</span>
              </div>
            ))}
          </div>
        </BiCard>

        {/* Patient table */}
        <BiCard
          className="lg:col-span-8"
          title="Pacientes monitorados"
          subtitle="Ordenado por risco de descompensação"
          action={
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Buscar paciente…" className="h-8 w-56 rounded-full border border-border bg-secondary/60 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          }
        >
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Paciente</th>
                  <th className="px-2 py-2 font-medium">Risco</th>
                  <th className="px-2 py-2 font-medium">Autocuidado</th>
                  <th className="px-2 py-2 font-medium">PA</th>
                  <th className="px-2 py-2 font-medium">SpO₂</th>
                  <th className="px-2 py-2 font-medium">FE</th>
                  <th className="px-2 py-2 font-medium">VO₂</th>
                  <th className="px-2 py-2 font-medium">Resp.</th>
                  <th className="px-2 py-2 font-medium">Tend.</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-t border-border transition hover:bg-secondary/40">
                    <td className="px-2 py-2.5">
                      <div className="font-medium leading-tight">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.id} · {p.age} anos</div>
                    </td>
                    <td className="px-2 py-2.5"><RiskBadge risk={p.risk} /></td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${p.selfCare < 60 ? "bg-danger" : p.selfCare < 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${p.selfCare}%` }} />
                        </div>
                        <span className="text-xs font-medium">{p.selfCare}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-xs">{p.bp}</td>
                    <td className="px-2 py-2.5 text-xs">
                      <span className={p.spo2 < 93 ? "text-danger font-semibold" : ""}>{p.spo2}%</span>
                    </td>
                    <td className="px-2 py-2.5 text-xs"><span className={p.fe < 35 ? "text-danger font-semibold" : ""}>{p.fe}%</span></td>
                    <td className="px-2 py-2.5 text-xs">{p.vo2} <span className="text-muted-foreground">ml/kg/min</span></td>
                    <td className="px-2 py-2.5 text-[11px] text-muted-foreground">{p.lastResponse}</td>
                    <td className="px-2 py-2.5">
                      {p.trend === "up" ? <ArrowUpRight className="h-4 w-4 text-success" /> : p.trend === "down" ? <ArrowDownRight className="h-4 w-4 text-danger" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BiCard>

        {/* Critical alerts panel */}
        <BiCard className="lg:col-span-4" title="Alertas críticos" subtitle="Risco de piora · últimas 24h" accent="danger">
          <div className="space-y-2.5">
            {patients.filter(p => p.risk === "high").map((p) => (
              <div key={p.id} className="rounded-2xl border border-danger/25 bg-danger/5 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.id} · {p.lastResponse}</div>
                  </div>
                  <RiskBadge risk={p.risk} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <Mini label="Autocuidado" value={`${p.selfCare}%`} bad={p.selfCare < 55} />
                  <Mini label="FE" value={`${p.fe}%`} bad={p.fe < 35} />
                  <Mini label="SpO₂" value={`${p.spo2}%`} bad={p.spo2 < 93} />
                </div>
                <button className="mt-3 w-full rounded-lg bg-danger px-3 py-1.5 text-[11px] font-semibold text-danger-foreground transition hover:opacity-90">
                  Abrir prontuário
                </button>
              </div>
            ))}
          </div>
        </BiCard>

        {/* Team comparison */}
        <BiCard className="lg:col-span-7" title="Comparativo entre equipes" subtitle="Pacientes vs. adesão vs. alertas">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={teamComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="team" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pacientes" name="Pacientes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="adesao" name="Adesão %" fill="var(--success)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="alertas" name="Alertas" fill="var(--danger)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </BiCard>

        {/* Exams */}
        <BiCard className="lg:col-span-5" title="Exames realizados" subtitle="Últimos 30 dias · % alterados">
          <div className="space-y-3">
            {examTypes.map((e) => {
              const pct = Math.round((e.abnormal / e.count) * 100);
              return (
                <div key={e.type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{e.type}</span>
                    <span className="text-muted-foreground">{e.count} exames · <span className={pct > 30 ? "text-danger font-semibold" : "text-foreground"}>{pct}% alterados</span></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${pct > 30 ? "bg-danger" : pct > 20 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct * 2}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </BiCard>

        {/* Functional assessment */}
        <BiCard className="lg:col-span-12" title="Avaliação funcional & cardíaca" subtitle="Distribuição da coorte ativa">
          <div className="grid gap-4 md:grid-cols-4">
            <FunctionalCard icon={<Activity className="h-4 w-4" />} label="VO₂ máx" value="16.4" unit="ml/kg/min" range="Alvo > 14" tone="success" />
            <FunctionalCard icon={<HeartPulse className="h-4 w-4" />} label="Índice cronotrópico" value="0.72" range="Alvo > 0.80" tone="warning" />
            <FunctionalCard icon={<Stethoscope className="h-4 w-4" />} label="Fração de Ejeção (FE)" value="38" unit="%" range="Reduzida < 40%" tone="danger" />
            <FunctionalCard icon={<Droplet className="h-4 w-4" />} label="NT-proBNP médio" value="1.842" unit="pg/mL" range="Elevado > 900" tone="danger" />
          </div>
        </BiCard>
      </div>
    </AppShell>
  );
}

function Mini({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="rounded-lg bg-card p-1.5 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${bad ? "text-danger" : ""}`}>{value}</div>
    </div>
  );
}

function FunctionalCard({ icon, label, value, unit, range, tone }: { icon: React.ReactNode; label: string; value: string; unit?: string; range: string; tone: "success" | "warning" | "danger" }) {
  const toneCls = { success: "border-success/30 bg-success/5", warning: "border-warning/30 bg-warning/5", danger: "border-danger/30 bg-danger/5" }[tone];
  const dotCls = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" }[tone];
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border p-4 ${toneCls}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="text-[10px] text-muted-foreground">{range}</div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip label="Período: 30 dias" />
      <FilterChip label="Equipe: Todas" />
      <FilterChip label="Risco: Todos" />
      <FilterChip label="Exame: Todos" />
      <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">
        <Filter className="h-3.5 w-3.5" /> Mais filtros
      </button>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent">
      {label}
    </button>
  );
}
