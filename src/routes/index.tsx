import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, LockKeyhole, ShieldCheck, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Card.io BI - Monitoramento de Insuficiencia Cardiaca" },
      {
        name: "description",
        content:
          "Portal de acesso da equipe medica para monitoramento continuo de insuficiencia cardiaca.",
      },
    ],
  }),
  component: LoginPortal,
});

function LoginPortal() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Heart className="h-4.5 w-4.5 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">Card.io</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Insuf. Cardiaca - BI
              </div>
            </div>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            Portal da equipe assistencial
          </span>
        </div>
      </header>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex min-h-40 max-w-7xl items-center px-6 py-8">
          <div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
              Áreaclinica
            </span>
            <div className="mt-4 flex items-center gap-4">
              <ShieldCheck className="h-12 w-12" />
              <div>
                <p className="text-sm font-semibold">Monitoramento de insuficiencia cardiaca</p>
                <h1 className="font-display text-4xl font-semibold leading-none tracking-tight">
                  Card.io
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm font-medium text-primary-foreground/90">
              Acesso da equipe para acompanhar pacientes, alertas, formularios clinicos e
              prontuarios detalhados.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[420px_1fr] lg:items-center lg:py-24">
        <div className="space-y-4">
          <AuthAccessCard />
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] lg:p-10">
          <div className="mx-auto grid aspect-[16/10] max-w-xl place-items-center rounded-2xl bg-secondary/60">
            <div className="w-[78%] rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-elegant)]">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <div>
                  <div className="h-2.5 w-28 rounded-full bg-primary/70" />
                  <div className="mt-2 h-2 w-40 rounded-full bg-muted" />
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Heart className="h-4 w-4" fill="currentColor" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[72, 88, 54].map((height, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-3">
                    <div className="h-2 w-16 rounded-full bg-muted" />
                    <div className="mt-4 flex h-24 items-end gap-1.5">
                      {[height, height - 18, height + 8].map((bar, barIndex) => (
                        <span
                          key={barIndex}
                          className="w-full rounded-t bg-primary/70"
                          style={{ height: `${Math.max(28, bar)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-warning/25 bg-warning/10 p-3">
                <div className="h-2 w-32 rounded-full bg-warning" />
                <div className="mt-2 h-2 w-52 rounded-full bg-warning/30" />
              </div>
            </div>
          </div>
          <h2 className="mt-8 text-center font-display text-3xl font-semibold tracking-tight text-primary">
            Gestao clinica em um unico painel
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
            A equipe medica entra direto no dashboard clinico, no cadastro de pacientes e nos
            prontuarios.
          </p>
        </div>
      </main>
    </div>
  );
}

function AuthAccessCard() {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Entrar como equipe medica
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Acesse pacientes filtrados, alertas criticos e prontuarios.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-3" onSubmit={(event) => event.preventDefault()}>
        <label className="block text-sm font-medium">
          E-mail institucional
          <input
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="nome@hospital.edu"
          />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <div className="relative mt-1">
            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Digite sua senha"
            />
          </div>
        </label>
        <Link
          to="/equipe"
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Entrar no dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </form>
    </section>
  );
}
