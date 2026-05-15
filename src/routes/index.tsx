import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Heart, Stethoscope, ShieldAlert, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Card.io BI · Monitoramento de Insuficiência Cardíaca" },
      { name: "description", content: "Plataforma de Business Intelligence para monitoramento contínuo de pacientes com insuficiência cardíaca." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
              <Heart className="h-4.5 w-4.5 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">Card.io</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Insuf. Cardíaca · BI</div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Mockup demonstrativo</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Plataforma BI · Cardiologia preventiva
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Monitoramento contínuo de <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>insuficiência cardíaca</span>, do paciente ao cardiologista.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Visualize evolução clínica, autocuidado e risco de descompensação em tempo real. Selecione o perfil para explorar a interface.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Link
            to="/paciente"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/40 blur-3xl transition group-hover:bg-accent/60" />
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">Sou Paciente</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Acompanhe sua evolução: frequência cardíaca, variabilidade (VFC), autocuidado, hábitos e percepção de sintomas.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                Abrir interface do paciente <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          <Link
            to="/equipe"
            className="group relative overflow-hidden rounded-3xl border border-border p-8 text-primary-foreground transition hover:shadow-[var(--shadow-elegant)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">Sou da Equipe Médica</h2>
              <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
                Dashboard de KPIs, coortes, sinais vitais, exames, função cardíaca e alertas de risco de piora por paciente e por equipe.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                Abrir dashboard clínico <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: LineChart, title: "Séries temporais", desc: "Evolução de FC, VFC, PA, SpO₂ e adesão." },
            { icon: ShieldAlert, title: "Alertas de risco", desc: "Sinalização visual quando o autocuidado cai." },
            { icon: Activity, title: "Avaliação funcional", desc: "VO₂, índice cronotrópico e testes autonômicos." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
