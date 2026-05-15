import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BiCard, Kpi } from "@/components/bi/Card";
import { patientTimeSeries, symptomRadar, habitsHeatmap } from "@/lib/mockData";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heart, HeartPulse, Activity, Smile, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/paciente")({
  head: () => ({
    meta: [
      { title: "Minha Evolução · CardioFlow" },
      { name: "description", content: "Acompanhe sua frequência cardíaca, autocuidado, hábitos e percepção de sintomas." },
    ],
  }),
  component: PatientView,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};

function PatientView() {
  const last = patientTimeSeries[patientTimeSeries.length - 1];
  const prev = patientTimeSeries[patientTimeSeries.length - 8];
  const selfCareDelta = last.selfCare - prev.selfCare;
  const alert = selfCareDelta < -10;

  return (
    <AppShell profile="patient">
      {/* Hero greeting */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border p-6 md:flex-row md:items-center md:justify-between md:p-8" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-80">Olá, Maria</p>
          <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Como você está hoje?</h1>
          <p className="mt-2 max-w-lg text-sm opacity-80">
            Veja a sua evolução nas últimas 4 semanas e mantenha seus hábitos diários para um coração mais saudável.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/25">
            Registrar sintomas
          </button>
          <button className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary transition hover:opacity-90">
            Iniciar questionário
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {alert && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Atenção ao autocuidado</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Seu índice de autocuidado caiu {Math.abs(selfCareDelta)} pontos nas últimas semanas. Que tal retomar a pesagem diária e revisar seus medicamentos?
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="FC média" value={last.hr} unit="bpm" delta={`+${last.hr - prev.hr} vs. semana passada`} trend="up" icon={<HeartPulse className="h-4 w-4" />} />
        <Kpi label="VFC" value={last.hrv} unit="ms" delta={`${last.hrv - prev.hrv} ms`} trend={last.hrv >= prev.hrv ? "up" : "down"} tone={last.hrv < 30 ? "warning" : "default"} icon={<Activity className="h-4 w-4" />} />
        <Kpi label="Autocuidado" value={`${last.selfCare}%`} delta={`${selfCareDelta > 0 ? "+" : ""}${selfCareDelta} pts`} trend={selfCareDelta >= 0 ? "up" : "down"} tone={alert ? "warning" : "success"} icon={<Heart className="h-4 w-4" />} />
        <Kpi label="Confiança" value={`${last.confidence}%`} delta="estável" trend="flat" icon={<Smile className="h-4 w-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <BiCard className="lg:col-span-2" title="Frequência cardíaca & Variabilidade (VFC)" subtitle="Últimos 30 dias" action={<TimeRangePill />}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={patientTimeSeries} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--info)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="hr" name="FC (bpm)" stroke="var(--primary)" strokeWidth={2} fill="url(#hrGrad)" />
              <Area type="monotone" dataKey="hrv" name="VFC (ms)" stroke="var(--info)" strokeWidth={2} fill="url(#hrvGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard title="Percepção de sintomas" subtitle="Auto-relato semanal" accent={alert ? "warning" : "default"}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={symptomRadar} outerRadius={88}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="symptom" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Radar name="Intensidade" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard className="lg:col-span-2" title="Autocuidado & Adesão a hábitos" subtitle="Tendência diária" accent={alert ? "warning" : "success"}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={patientTimeSeries} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="selfCare" name="Autocuidado %" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="adherence" name="Adesão %" stroke="var(--success)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="confidence" name="Confiança %" stroke="var(--info)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </BiCard>

        <BiCard title="Hábitos da semana" subtitle="Heatmap diário" >
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_repeat(7,1.6rem)] items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span />
              {["S","T","Q","Q","S","S","D"].map((d, i) => <span key={i} className="text-center">{d}</span>)}
            </div>
            {habitsHeatmap.map((row) => (
              <div key={row.habit} className="grid grid-cols-[1fr_repeat(7,1.6rem)] items-center gap-1.5">
                <span className="truncate text-xs font-medium">{row.habit}</span>
                {row.values.map((v, i) => (
                  <span key={i} className={`h-6 rounded-md ${v ? "bg-success/80" : "bg-muted"} transition`} />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            6 de 7 dias com medicação em dia. Continue assim!
          </div>
        </BiCard>
      </div>

      {/* Bottom: profile evolution */}
      <BiCard className="mt-5" title="Evolução do meu perfil" subtitle="Score combinado de autocuidado, sintomas e hábitos" accent={alert ? "warning" : "success"}>
        <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={patientTimeSeries} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="selfCare" name="Score do perfil" stroke="var(--success)" strokeWidth={2.5} fill="url(#profileGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            <Insight tone={alert ? "warning" : "success"} icon={alert ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} title={alert ? "Risco de piora detectado" : "Perfil estável"} text={alert ? "Indicadores apontam queda no autocuidado. Sua equipe foi notificada." : "Você está mantendo bons hábitos e baixa percepção de sintomas."} />
            <Insight tone="default" icon={<HeartPulse className="h-4 w-4" />} title="Próxima consulta" text="Quinta-feira, 23/04 às 14h30 — Dr. Lima." />
          </div>
        </div>
      </BiCard>
    </AppShell>
  );
}

function Insight({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "default" | "warning" | "success" }) {
  const cls = {
    default: "border-border bg-secondary/50 text-foreground",
    warning: "border-warning/30 bg-warning/10 text-foreground",
    success: "border-success/30 bg-success/10 text-foreground",
  }[tone];
  const iconCls = { default: "text-primary", warning: "text-warning", success: "text-success" }[tone];
  return (
    <div className={`flex gap-3 rounded-2xl border p-3 ${cls}`}>
      <div className={`mt-0.5 ${iconCls}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function TimeRangePill() {
  return (
    <div className="flex rounded-full border border-border bg-secondary/60 p-0.5 text-[11px] font-medium">
      {["7d", "30d", "90d"].map((r, i) => (
        <button key={r} className={`rounded-full px-2.5 py-1 ${i === 1 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{r}</button>
      ))}
    </div>
  );
}
