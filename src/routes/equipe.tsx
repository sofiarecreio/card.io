import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BiCard, Kpi, RiskBadge } from "@/components/bi/Card";
import { patients, patientLongitudinal, professionalFollowUp, type Patient } from "@/lib/mockData";
import {
  Bar,
  BarChart,
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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Clock,
  Filter,
  FolderOpen,
  HeartPulse,
  Minus,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Dashboard Clínico · Card.io" },
      {
        name: "description",
        content: "KPIs e monitoramento da População de estudo com insuficiência cardíaca.",
      },
    ],
  }),
  component: TeamDashboard,
});

type RiskFilter = "all" | Patient["risk"];
type PeriodFilter = "7" | "30" | "90";
type ResponseFilter = "all" | "recent" | "stale";

type DashboardFilters = {
  period: PeriodFilter;
  risk: RiskFilter;
  response: ResponseFilter;
  professional: string;
  search: string;
};

type IndicatorKey = "filtered" | "critical" | "stale" | "delayed" | "adherence" | "selfCare";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 14,
  boxShadow: "var(--shadow-card)",
};

const riskOrder: Patient["risk"][] = ["high", "medium", "low"];
const riskLabels = {
  high: "Alto",
  medium: "Moderado",
  low: "Baixo",
};
const riskDescriptions = {
  high: "Piora clínica, baixa adesão, sinais vitais fora do alvo ou ausência recente de resposta.",
  medium: "Indicadores parcialmente controlados, mas com necessidade de acompanhamento próximo.",
  low: "Indicadores estáveis e rotina de autocuidado preservada.",
};

function TeamDashboard() {
  const [activePatient, setActivePatient] = useState<string>("P-1042");
  const [indicatorSearch, setIndicatorSearch] = useState("");
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>("critical");
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30",
    risk: "all",
    response: "all",
    professional: "all",
    search: "",
  });

  const filteredPatients = useMemo(() => {
    const query = normalize(filters.search);
    return patients.filter((patient) => {
      const matchesSearch = !query || normalize(`${patient.name} ${patient.id}`).includes(query);
      const matchesRisk = filters.risk === "all" || patient.risk === filters.risk;
      const matchesResponse =
        filters.response === "all" ||
        (filters.response === "stale" ? isStale(patient) : !isStale(patient));
      const matchesProfessional =
        filters.professional === "all" || getProfessional(patient.id) === filters.professional;

      return matchesSearch && matchesRisk && matchesResponse && matchesProfessional;
    });
  }, [filters]);

  const selectedPatient = patients.find((p) => p.id === activePatient) ?? patients[0];
  const searchPool = filteredPatients.length ? filteredPatients : patients;
  const indicatorMatch = indicatorSearch.trim()
    ? findBestPatient(indicatorSearch, searchPool)
    : selectedPatient;
  const patient = indicatorMatch ?? selectedPatient;
  const timeline = getTimeline(patient.id, filters.period);
  const attentionPatients = filteredPatients
    .filter((p) => p.risk === "high" || p.trend === "down" || p.selfCare < 60 || isStale(p))
    .sort((a, b) => priorityScore(b) - priorityScore(a));
  const criticalAlerts = filteredPatients.filter((p) => p.risk === "high");
  const stalePatients = filteredPatients.filter(isStale);
  const riskCounts = riskOrder.map((risk) => ({
    risk,
    label: riskLabels[risk],
    value: filteredPatients.filter((p) => p.risk === risk).length,
  }));
  const totalFiltered = filteredPatients.length || 1;
  const avgAdherence =
    Math.round(filteredPatients.reduce((sum, p) => sum + p.adherence, 0) / totalFiltered) || 0;
  const avgSelfCare =
    Math.round(filteredPatients.reduce((sum, p) => sum + p.selfCare, 0) / totalFiltered) || 0;
  const delayedPatients = filteredPatients.filter(isDelayedResponse);
  const lowAdherencePatients = filteredPatients
    .filter((p) => p.adherence < Math.max(70, avgAdherence))
    .sort((a, b) => a.adherence - b.adherence);
  const lowSelfCarePatients = filteredPatients
    .filter((p) => p.selfCare < Math.max(70, avgSelfCare))
    .sort((a, b) => a.selfCare - b.selfCare);
  const indicatorDetails = {
    filtered: {
      title: "Pacientes filtrados",
      subtitle: "Todos os pacientes que correspondem aos filtros ativos.",
      patients: filteredPatients,
      empty: "Nenhum paciente encontrado com os filtros atuais.",
    },
    critical: {
      title: "Alertas críticos",
      subtitle: "Pacientes em risco alto que exigem revisão prioritária.",
      patients: criticalAlerts,
      empty: "Nenhum alerta crítico para os filtros atuais.",
    },
    stale: {
      title: "Sem atualização",
      subtitle: "Pacientes sem atualização recente no monitoramento remoto.",
      patients: stalePatients,
      empty: "Todos os pacientes filtrados atualizaram recentemente.",
    },
    delayed: {
      title: "Resposta atrasada",
      subtitle: "Pacientes com última resposta atrasada ou ausência de retorno no dia.",
      patients: delayedPatients,
      empty: "Nenhuma resposta atrasada nos filtros atuais.",
    },
    adherence: {
      title: "Adesão abaixo do alvo",
      subtitle: "Pacientes que puxam a adesão média para baixo.",
      patients: lowAdherencePatients,
      empty: "Nenhum paciente abaixo do alvo de adesão.",
    },
    selfCare: {
      title: "Autocuidado abaixo do alvo",
      subtitle: "Pacientes com sinais de dificuldade na rotina de autocuidado.",
      patients: lowSelfCarePatients,
      empty: "Nenhum paciente abaixo do alvo de autocuidado.",
    },
  } satisfies Record<
    IndicatorKey,
    { title: string; subtitle: string; patients: Patient[]; empty: string }
  >;
  const worseningData = buildWorseningData(filteredPatients);
  const actionQueueData = buildActionQueueData(filteredPatients);
  const updateCoverageData = buildUpdateCoverageData(filteredPatients);

  function updateFilter<Key extends keyof DashboardFilters>(
    key: Key,
    value: DashboardFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateIndicatorSearch(value: string) {
    setIndicatorSearch(value);
    const match = findBestPatient(value, searchPool);
    if (match) setActivePatient(match.id);
  }

  return (
    <AppShell profile="team">
      <div className="large-route-type">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Cardiologia · Insuficiência Cardíaca
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              Dashboard Clínico
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Visão da População de estudo com foco em prioridade clínica, evolução longitudinal e
              alertas acionáveis.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:items-end">
            <Link
              to="/cadastro-paciente"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar paciente
            </Link>
            <FilterBar
              filters={filters}
              onChange={updateFilter}
              onClear={() =>
                setFilters({
                  period: "30",
                  risk: "all",
                  response: "all",
                  professional: "all",
                  search: "",
                })
              }
            />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Kpi
            label="Pacientes filtrados"
            value={filteredPatients.length}
            delta={`${patients.length} na base`}
            trend="flat"
            icon={<Users className="h-4 w-4" />}
            active={activeIndicator === "filtered"}
            onClick={() => setActiveIndicator("filtered")}
          />
          <Kpi
            label="Alertas críticos"
            value={criticalAlerts.length}
            delta="prioridade de hoje"
            trend="down"
            tone="danger"
            icon={<AlertTriangle className="h-4 w-4" />}
            active={activeIndicator === "critical"}
            onClick={() => setActiveIndicator("critical")}
          />
          <Kpi
            label="Sem atualização"
            value={stalePatients.length}
            delta="busca ativa"
            trend="down"
            tone="warning"
            icon={<ClipboardList className="h-4 w-4" />}
            active={activeIndicator === "stale"}
            onClick={() => setActiveIndicator("stale")}
          />
          <Kpi
            label="Resposta atrasada"
            value={delayedPatients.length}
            delta="último contato"
            trend="down"
            tone="warning"
            icon={<Clock className="h-4 w-4" />}
            active={activeIndicator === "delayed"}
            onClick={() => setActiveIndicator("delayed")}
          />
          <Kpi
            label="Adesão média"
            value={`${avgAdherence}%`}
            delta={`${lowAdherencePatients.length} abaixo do alvo`}
            trend="up"
            tone="success"
            icon={<HeartPulse className="h-4 w-4" />}
            active={activeIndicator === "adherence"}
            onClick={() => setActiveIndicator("adherence")}
          />
          <Kpi
            label="Autocuidado"
            value={`${avgSelfCare}%`}
            delta={`${lowSelfCarePatients.length} abaixo do alvo`}
            trend="up"
            tone="success"
            icon={<Activity className="h-4 w-4" />}
            active={activeIndicator === "selfCare"}
            onClick={() => setActiveIndicator("selfCare")}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <IndicatorPatientDetails details={indicatorDetails[activeIndicator]} />

          <StalePatientsSection patients={stalePatients} />

          <BiCard
            className="lg:col-span-5"
            title="Alertas críticos"
            subtitle="Pacientes com maior risco de piora nas últimas 24h"
            accent="danger"
          >
            <div className="space-y-3">
              {criticalAlerts.length === 0 && (
                <EmptyState text="Nenhum alerta crítico para os filtros atuais." />
              )}
              {criticalAlerts.map((p) => (
                <div key={p.id} className="rounded-2xl border border-danger/25 bg-danger/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.id} · {p.lastResponse} · {getProfessional(p.id)}
                      </div>
                    </div>
                    <RiskBadge risk={p.risk} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <Mini label="Autocuidado" value={`${p.selfCare}%`} bad={p.selfCare < 55} />
                    <Mini label="FE" value={`${p.fe}%`} bad={p.fe < 35} />
                    <Mini label="SpO₂" value={`${p.spo2}%`} bad={p.spo2 < 93} />
                  </div>
                  <Link
                    to="/prontuario/$patientId"
                    params={{ patientId: p.id }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-danger-foreground transition hover:opacity-90"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Abrir prontuário
                  </Link>
                </div>
              ))}
            </div>
          </BiCard>

          <BiCard
            className="lg:col-span-7"
            title="Pacientes que precisam de atenção"
            subtitle="Ordenado por risco, tendência de piora e atraso de resposta"
          >
            <div className="space-y-2">
              {attentionPatients.length === 0 && (
                <EmptyState text="Nenhum paciente prioritário nos filtros atuais." />
              )}
              {attentionPatients.slice(0, 5).map((p) => (
                <AttentionRow key={p.id} patient={p} />
              ))}
            </div>
          </BiCard>

          <BiCard
            className="lg:col-span-8"
            title="Pacientes monitorados"
            subtitle="Lista filtrada por busca, risco, período e profissional"
            action={
              <SearchField
                value={filters.search}
                onChange={(value) => updateFilter("search", value)}
                placeholder="Buscar paciente"
              />
            }
          >
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Paciente</th>
                    <th className="px-2 py-2 font-medium">Risco</th>
                    <th className="px-2 py-2 font-medium">Autocuidado</th>
                    <th className="px-2 py-2 font-medium">Adesão</th>
                    <th className="px-2 py-2 font-medium">FC</th>
                    <th className="px-2 py-2 font-medium">SpO₂</th>
                    <th className="px-2 py-2 font-medium">Resp.</th>
                    <th className="px-2 py-2 font-medium">Profissional</th>
                    <th className="px-2 py-2 font-medium">Tend.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-border transition hover:bg-secondary/40"
                    >
                      <td className="px-2 py-2.5">
                        <button onClick={() => setActivePatient(p.id)} className="text-left">
                          <div className="font-medium leading-tight text-foreground">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.id} · {p.age} anos
                          </div>
                        </button>
                      </td>
                      <td className="px-2 py-2.5">
                        <RiskBadge risk={p.risk} />
                      </td>
                      <td className="px-2 py-2.5">
                        <ProgressCell value={p.selfCare} />
                      </td>
                      <td className="px-2 py-2.5">
                        <ProgressCell value={p.adherence} />
                      </td>
                      <td className="px-2 py-2.5 text-xs">{p.hr} bpm</td>
                      <td className="px-2 py-2.5 text-xs">
                        <span className={p.spo2 < 93 ? "font-semibold text-danger" : ""}>
                          {p.spo2}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-[11px] text-muted-foreground">
                        {p.lastResponse}
                      </td>
                      <td className="px-2 py-2.5 text-[11px] text-muted-foreground">
                        {getProfessional(p.id)}
                      </td>
                      <td className="px-2 py-2.5">
                        {p.trend === "up" ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : p.trend === "down" ? (
                          <ArrowDownRight className="h-4 w-4 text-danger" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <EmptyState text="Nenhum paciente encontrado com os filtros atuais." />
              )}
            </div>
          </BiCard>

          <BiCard
            className="lg:col-span-4"
            title="Distribuição por risco clínico"
            subtitle="Classificação da População de estudo filtrada"
          >
            <div className="space-y-4">
              {riskCounts.map((item) => {
                const pct = Math.round((item.value / totalFiltered) * 100);
                const barColor =
                  item.risk === "high"
                    ? "bg-danger"
                    : item.risk === "medium"
                      ? "bg-warning"
                      : "bg-success";
                return (
                  <div key={item.risk}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.value} pacientes · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                      {riskDescriptions[item.risk]}
                    </p>
                  </div>
                );
              })}
            </div>
          </BiCard>

          <BiCard
            className="lg:col-span-7"
            title="Evolução de frequência cardíaca e peso"
            subtitle={`${patient.name} · série longitudinal do paciente selecionado`}
            action={
              <SearchField
                value={indicatorSearch}
                onChange={updateIndicatorSearch}
                placeholder="Buscar por nome, ex.: naria"
              />
            }
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Busca tolerante a pequenos erros de grafia. Mostra tendência de FC e peso para
              detectar ganho ponderal e taquicardia persistente.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
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
              </ComposedChart>
            </ResponsiveContainer>
          </BiCard>

          <BiCard
            className="lg:col-span-5"
            title="Indicadores de piora recente"
            subtitle="Quantidade de pacientes por sinal clínico prioritário"
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Resume quais alterações estão mais presentes na população filtrada e orienta o tipo de
              intervenção.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={worseningData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 32, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="indicator"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={88}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="patients"
                  name="Pacientes"
                  fill="var(--danger)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </BiCard>

          <BiCard
            className="lg:col-span-6"
            title="Fila de ação clínica"
            subtitle="Prioridade prática para contato e revisão"
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Organiza a carga assistencial em grupos acionáveis, evitando mistura de métricas
              clínicas e operacionais.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={actionQueueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="queue"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="patients"
                  name="Pacientes"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </BiCard>

          <BiCard
            className="lg:col-span-6"
            title="Atualização remota por risco"
            subtitle="Quem respondeu recentemente e quem exige busca ativa"
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Mostra a cobertura de atualização por nível de risco clínico para priorizar pacientes
              silenciosos.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={updateCoverageData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="risk"
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar
                  dataKey="recentes"
                  name="Atualização recente"
                  fill="var(--success)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="atrasados"
                  name="Sem atualização"
                  fill="var(--warning)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </BiCard>
        </div>
      </div>
    </AppShell>
  );
}

function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: DashboardFilters;
  onChange: <Key extends keyof DashboardFilters>(key: Key, value: DashboardFilters[Key]) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Filtros
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <select
          value={filters.period}
          onChange={(event) => onChange("period", event.target.value as PeriodFilter)}
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
        <select
          value={filters.risk}
          onChange={(event) => onChange("risk", event.target.value as RiskFilter)}
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Risco: todos</option>
          <option value="high">Risco alto</option>
          <option value="medium">Risco moderado</option>
          <option value="low">Risco baixo</option>
        </select>
        <select
          value={filters.response}
          onChange={(event) => onChange("response", event.target.value as ResponseFilter)}
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Resposta: todas</option>
          <option value="recent">Atualização recente</option>
          <option value="stale">Sem atualização</option>
        </select>
        <select
          value={filters.professional}
          onChange={(event) => onChange("professional", event.target.value)}
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Profissional: todos</option>
          {professionalFollowUp.map((item) => (
            <option key={item.professional} value={item.professional}>
              {item.professional}
            </option>
          ))}
        </select>
        <button
          onClick={onClear}
          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>
    </div>
  );
}

function IndicatorPatientDetails({
  details,
}: {
  details: { title: string; subtitle: string; patients: Patient[]; empty: string };
}) {
  return (
    <BiCard className="lg:col-span-12" title={details.title} subtitle={details.subtitle}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {details.patients.map((patient) => (
          <Link
            key={patient.id}
            to="/prontuario/$patientId"
            params={{ patientId: patient.id }}
            className="rounded-2xl border border-border bg-secondary/25 p-4 transition hover:border-primary/45 hover:bg-secondary/45"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{patient.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {patient.id} · {patient.lastResponse} · {getProfessional(patient.id)}
                </div>
              </div>
              <RiskBadge risk={patient.risk} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Mini label="Adesão" value={`${patient.adherence}%`} bad={patient.adherence < 70} />
              <Mini
                label="Autocuidado"
                value={`${patient.selfCare}%`}
                bad={patient.selfCare < 60}
              />
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <FolderOpen className="h-4 w-4" />
              Abrir prontuário
            </div>
          </Link>
        ))}
        {details.patients.length === 0 && <EmptyState text={details.empty} />}
      </div>
    </BiCard>
  );
}

function StalePatientsSection({ patients: stalePatients }: { patients: Patient[] }) {
  return (
    <BiCard
      className="lg:col-span-12"
      title="Pacientes sem resposta ou sem atualização recente"
      subtitle="Acompanhamento ativo recomendado antes da análise dos gráficos"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stalePatients.map((patient) => (
          <Link
            key={patient.id}
            to="/prontuario/$patientId"
            params={{ patientId: patient.id }}
            className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-left transition hover:border-warning"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{patient.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {patient.id} · {patient.lastResponse}
                </div>
              </div>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div className="mt-3 text-xs font-semibold text-warning">
              Abrir prontuário e revisar evolução
            </div>
          </Link>
        ))}
        {stalePatients.length === 0 && (
          <EmptyState text="Todos os pacientes filtrados atualizaram recentemente." />
        )}
      </div>
    </BiCard>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-56 rounded-full border border-border bg-secondary/60 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function AttentionRow({ patient }: { patient: Patient }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/25 p-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{patient.name}</span>
          <RiskBadge risk={patient.risk} />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {patient.id} · {patient.lastResponse} · autocuidado {patient.selfCare}% · adesão{" "}
          {patient.adherence}%
        </div>
      </div>
      <Link
        to="/prontuario/$patientId"
        params={{ patientId: patient.id }}
        className="rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold transition hover:bg-accent"
      >
        Abrir prontuário
      </Link>
    </div>
  );
}

function Mini({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="rounded-xl bg-card p-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${bad ? "text-danger" : ""}`}>{value}</div>
    </div>
  );
}

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${value < 60 ? "bg-danger" : value < 75 ? "bg-warning" : "bg-success"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium">{value}%</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function getTimeline(patientId: string, period: PeriodFilter) {
  const series = patientLongitudinal[patientId] ?? patientLongitudinal["P-1042"];
  if (period === "7") return series.slice(-3);
  return series;
}

function isStale(patient: Patient) {
  return patient.lastResponse.includes("d");
}

function isDelayedResponse(patient: Patient) {
  return isStale(patient) || responseAgeHours(patient.lastResponse) >= 6;
}

function responseAgeHours(lastResponse: string) {
  const value = Number(lastResponse.match(/\d+/)?.[0] ?? 0);
  if (lastResponse.includes("d")) return value * 24;
  return value;
}

function priorityScore(patient: Patient) {
  return (
    (patient.risk === "high" ? 40 : patient.risk === "medium" ? 20 : 0) +
    (patient.trend === "down" ? 20 : 0) +
    (patient.selfCare < 60 ? 15 : 0) +
    (isStale(patient) ? 15 : 0)
  );
}

function getProfessional(patientId: string) {
  const index = patients.findIndex((patient) => patient.id === patientId);
  return professionalFollowUp[Math.max(0, index) % professionalFollowUp.length].professional;
}

function buildWorseningData(list: Patient[]) {
  return [
    { indicator: "Baixa adesão", patients: list.filter((p) => p.adherence < 70).length },
    { indicator: "Autocuidado", patients: list.filter((p) => p.selfCare < 60).length },
    { indicator: "SpO₂ baixa", patients: list.filter((p) => p.spo2 < 93).length },
    { indicator: "FC elevada", patients: list.filter((p) => p.hr >= 90).length },
    { indicator: "Sem resposta", patients: list.filter(isStale).length },
  ];
}

function buildActionQueueData(list: Patient[]) {
  return [
    {
      queue: "Contato hoje",
      patients: list.filter((p) => p.risk === "high" && (p.trend === "down" || isStale(p))).length,
    },
    {
      queue: "Revisar 24h",
      patients: list.filter((p) => p.risk === "high" && p.trend !== "down" && !isStale(p)).length,
    },
    {
      queue: "Acompanhar 48h",
      patients: list.filter((p) => p.risk === "medium" || p.selfCare < 70).length,
    },
    { queue: "Rotina", patients: list.filter((p) => p.risk === "low" && p.selfCare >= 70).length },
  ];
}

function buildUpdateCoverageData(list: Patient[]) {
  return riskOrder.map((risk) => {
    const patientsByRisk = list.filter((p) => p.risk === risk);
    return {
      risk: riskLabels[risk],
      recentes: patientsByRisk.filter((p) => !isStale(p)).length,
      atrasados: patientsByRisk.filter(isStale).length,
    };
  });
}

function findBestPatient(query: string, list: Patient[]) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  return list.find((patient) => patientMatches(patient, normalizedQuery)) ?? null;
}

function patientMatches(patient: Patient, normalizedQuery: string) {
  const normalizedName = normalize(`${patient.name} ${patient.id}`);
  if (normalizedName.includes(normalizedQuery)) return true;

  return normalizedName
    .split(/\s+/)
    .some(
      (token) =>
        levenshtein(token, normalizedQuery) <= Math.max(1, Math.floor(normalizedQuery.length / 3)),
    );
}

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
