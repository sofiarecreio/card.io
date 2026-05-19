import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heart, HeartPulse, Pill, CalendarDays, Phone, Scale, CheckCircle2,
  AlertTriangle, Smile, Frown, Meh, Wind, Footprints, Droplets,
} from "lucide-react";

export const Route = createFileRoute("/paciente")({
  head: () => ({
    meta: [
      { title: "Meu dia · Card.io" },
      { name: "description", content: "Como você está hoje, seus remédios e sua próxima consulta." },
    ],
  }),
  component: PatientView,
});

type Symptom = { key: string; label: string; icon: React.ReactNode };
const SYMPTOMS: Symptom[] = [
  { key: "falta_ar",  label: "Falta de ar",       icon: <Wind className="h-5 w-5" /> },
  { key: "cansaco",   label: "Cansaço",           icon: <Footprints className="h-5 w-5" /> },
  { key: "incha",     label: "Pernas inchadas",   icon: <Droplets className="h-5 w-5" /> },
  { key: "tosse",     label: "Tosse à noite",     icon: <Wind className="h-5 w-5" /> },
  { key: "palpita",   label: "Coração acelerado", icon: <HeartPulse className="h-5 w-5" /> },
  { key: "tontura",   label: "Tontura",           icon: <AlertTriangle className="h-5 w-5" /> },
];

type MedicationStatus = "taken" | "missed" | "pending";
type Medication = {
  id: string;
  name: string;
  time: string;
  status: MedicationStatus;
};

const INITIAL_MEDICATIONS: Medication[] = [
  { id: "furosemida", name: "Furosemida 40 mg", time: "Manhã, ao acordar, 8h da manhã", status: "taken" },
  { id: "carvedilol", name: "Carvedilol 25 mg", time: "Manhã, após o café, 9h da manhã", status: "taken" },
  { id: "losartana", name: "Losartana 50 mg", time: "Almoço, 12h30", status: "pending" },
  { id: "espironolactona", name: "Espironolactona 25 mg", time: "Noite, no jantar, 20h", status: "pending" },
];

function PatientView() {
  // Today's overall status — single, clear semaphore
  const [mood, setMood] = useState<"bem" | "mais_ou_menos" | "mal" | null>(null);
  const [openSymptoms, setOpenSymptoms] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [pendingMedication, setPendingMedication] = useState<{ id: string; status: MedicationStatus } | null>(null);
  const [weight, setWeight] = useState("74,2");
  const [draftWeight, setDraftWeight] = useState(weight);
  const [openWeight, setOpenWeight] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const status =
    mood === "mal" ? { tone: "alert" as const, label: "Atenção", text: "Avisamos sua equipe. Eles vão entrar em contato." }
    : mood === "mais_ou_menos" ? { tone: "warn" as const, label: "Fique atento", text: "Descanse, beba água e siga seus remédios." }
    : { tone: "ok" as const, label: "Tudo bem", text: "Continue cuidando de você. Você está indo muito bem!" };

  const semaphore = {
    ok:    { bg: "bg-success",  ring: "ring-success/30",  Icon: Smile,         emoji: "😊" },
    warn:  { bg: "bg-warning",  ring: "ring-warning/30",  Icon: Meh,           emoji: "😐" },
    alert: { bg: "bg-danger",   ring: "ring-danger/30",   Icon: Frown,         emoji: "😟" },
  }[status.tone];
  const SIcon = semaphore.Icon;

  function toggleSymptom(k: string) {
    setPicked((p) => ({ ...p, [k]: !p[k] }));
  }
  function submitSymptoms() {
    setSent(true);
    // simple visual feedback then close
    setTimeout(() => {
      setOpenSymptoms(false);
      setSent(false);
      setPicked({});
      setMood("mais_ou_menos");
    }, 1200);
  }
  function confirmMedication() {
    if (!pendingMedication) return;
    const medication = meds.find((m) => m.id === pendingMedication.id);
    setMeds((current) =>
      current.map((m) => (m.id === pendingMedication.id ? { ...m, status: pendingMedication.status } : m)),
    );
    setFeedback(
      `${medication?.name ?? "Remédio"} marcado como ${
        pendingMedication.status === "taken" ? "tomado" : "não tomado"
      }.`,
    );
    setPendingMedication(null);
  }
  function saveWeight() {
    const normalized = draftWeight.trim().replace(".", ",");
    if (!normalized) return;
    setWeight(normalized);
    setOpenWeight(false);
    setFeedback(`Peso atualizado para ${normalized} kg.`);
  }

  return (
    <AppShell profile="patient">
      {/* Greeting */}
      <div className="mb-6 rounded-3xl border border-border p-6 md:p-8" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/80">Olá, Dona Maria</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-primary-foreground md:text-4xl">
          Bom dia! Como você está hoje?
        </h1>
        <p className="mt-2 text-base text-primary-foreground/90">
          Toque em uma das carinhas abaixo para nos contar.
        </p>
      </div>

      {/* Mood picker — large, single decision */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {([
          { key: "bem",            label: "Estou bem",        bg: "bg-success",  Icon: Smile },
          { key: "mais_ou_menos",  label: "Mais ou menos",    bg: "bg-warning",  Icon: Meh },
          { key: "mal",            label: "Não estou bem",    bg: "bg-danger",   Icon: Frown },
        ] as const).map((o) => {
          const active = mood === o.key;
          const Icon = o.Icon;
          return (
            <button
              key={o.key}
              onClick={() => setMood(o.key)}
              className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition ${
                active ? "border-foreground bg-card shadow-lg" : "border-border bg-card hover:border-foreground/40"
              }`}
            >
              <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${o.bg} text-white`}>
                <Icon className="h-9 w-9" strokeWidth={2.2} />
              </span>
              <span className="text-xl font-semibold">{o.label}</span>
            </button>
          );
        })}
      </section>

      {/* Status banner */}
      {mood && (
        <div className={`mb-6 flex items-center gap-4 rounded-3xl border-2 p-5 ${
          status.tone === "alert" ? "border-danger/40 bg-danger/10"
          : status.tone === "warn" ? "border-warning/40 bg-warning/10"
          : "border-success/40 bg-success/10"
        }`}>
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${semaphore.bg} text-white ring-8 ${semaphore.ring}`}>
            <SIcon className="h-7 w-7" />
          </span>
          <div>
            <div className="text-lg font-semibold">{status.label}</div>
            <div className="text-base text-foreground/80">{status.text}</div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="mb-6 flex items-center gap-3 rounded-3xl border-2 border-success/30 bg-success/10 p-4 text-base font-medium text-foreground">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          {feedback}
        </div>
      )}

      {/* Big actions */}
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Registrar sintomas */}
        <Dialog open={openSymptoms} onOpenChange={setOpenSymptoms}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-4 rounded-3xl bg-primary p-6 text-left text-primary-foreground shadow-lg transition hover:opacity-95">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20">
                <HeartPulse className="h-7 w-7" />
              </span>
              <div>
                <div className="text-xl font-semibold">Registrar sintomas</div>
                <div className="text-sm opacity-90">Toque aqui para avisar como você está</div>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Como você está se sentindo?</DialogTitle>
              <DialogDescription className="text-base">
                Toque em tudo o que você está sentindo agora. Sua equipe será avisada.
              </DialogDescription>
            </DialogHeader>

            {sent ? (
              <div className="my-6 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <div className="text-xl font-semibold">Obrigado, Dona Maria!</div>
                <div className="text-base text-muted-foreground">Sua equipe foi avisada.</div>
              </div>
            ) : (
              <div className="my-2 grid grid-cols-2 gap-3">
                {SYMPTOMS.map((s) => {
                  const on = !!picked[s.key];
                  return (
                    <button
                      key={s.key}
                      onClick={() => toggleSymptom(s.key)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                        on ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {s.icon}
                      </span>
                      <span className="text-base font-medium">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {!sent && (
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" size="lg" onClick={() => setOpenSymptoms(false)} className="text-base">
                  Cancelar
                </Button>
                <Button size="lg" onClick={submitSymptoms} className="text-base font-semibold">
                  Enviar para a equipe
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Próxima consulta */}
        <div className="rounded-3xl border-2 border-border bg-card p-6">
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="h-5 w-5" /> Próxima consulta
          </div>
          <div className="mt-2 text-2xl font-semibold leading-tight">Quinta-feira, 23 de abril</div>
          <div className="mt-1 text-lg">às <span className="font-semibold">14h30</span> com <span className="font-semibold">Dr. Lima</span></div>
          <div className="mt-1 text-base text-muted-foreground">Hospital Universitário — sala 3</div>
          <a href="tel:+551130000000" className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <Phone className="h-4 w-4" /> Ligar para a clínica
          </a>
        </div>
      </section>

      {/* Remédios + peso */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border-2 border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Pill className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Meus remédios de hoje</h2>
              <p className="text-base text-muted-foreground">Marque quando tomar</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {meds.map((m) => (
              <li
                key={m.id}
                className={`flex flex-col gap-4 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
                  m.status === "taken"
                    ? "border-success/30 bg-success/5"
                    : m.status === "missed"
                      ? "border-danger/30 bg-danger/5"
                      : "border-border bg-background"
                }`}
              >
                <div>
                  <div className="text-lg font-semibold">{m.name}</div>
                  <div className="mt-1 text-xl font-semibold text-foreground/85">{m.time}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:w-64">
                  <button
                    onClick={() => setPendingMedication({ id: m.id, status: "taken" })}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      m.status === "taken"
                        ? "bg-success text-success-foreground"
                        : "border-2 border-success/35 bg-card text-success hover:bg-success/10"
                    }`}
                  >
                    Tomado
                  </button>
                  <button
                    onClick={() => setPendingMedication({ id: m.id, status: "missed" })}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      m.status === "missed"
                        ? "bg-danger text-danger-foreground"
                        : "border-2 border-danger/35 bg-card text-danger hover:bg-danger/10"
                    }`}
                  >
                    Não tomei
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border-2 border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-info/15 text-info">
              <Scale className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-semibold">Meu peso hoje</h2>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4 text-center">
            <div className="font-display text-5xl font-semibold">{weight} <span className="text-2xl text-muted-foreground">kg</span></div>
            <div className="mt-1 text-sm text-success font-medium">Atualizado hoje</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Se subir <span className="font-semibold text-foreground">mais de 2 kg em 3 dias</span>, ligue para sua equipe.
          </p>
          <button
            onClick={() => {
              setDraftWeight(weight);
              setOpenWeight(true);
            }}
            className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            Registrar peso de hoje
          </button>
        </div>

        {/* Recados da equipe */}
        <div className="rounded-3xl border-2 border-border bg-card p-6 lg:col-span-3">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-semibold">Recados da sua equipe</h2>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-base leading-relaxed">
              <span className="font-semibold">Enf. Carla:</span> Dona Maria, lembre-se de tomar a Losartana no almoço.
              Estamos acompanhando você. Qualquer coisa, pode chamar a gente! 💚
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Hoje, 09h12</p>
          </div>
        </div>
      </section>

      <Dialog open={!!pendingMedication} onOpenChange={(open) => !open && setPendingMedication(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirmar remédio</DialogTitle>
            <DialogDescription className="text-base">
              {pendingMedication
                ? `Você quer marcar ${
                    meds.find((m) => m.id === pendingMedication.id)?.name ?? "este remédio"
                  } como ${pendingMedication.status === "taken" ? "tomado" : "não tomado"}?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="lg" onClick={() => setPendingMedication(null)} className="text-base">
              Voltar
            </Button>
            <Button size="lg" onClick={confirmMedication} className="text-base font-semibold">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openWeight} onOpenChange={setOpenWeight}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirmar peso</DialogTitle>
            <DialogDescription className="text-base">
              Digite o peso de hoje e confirme antes de salvar.
            </DialogDescription>
          </DialogHeader>
          <label className="text-base font-semibold">
            Peso atual em kg
            <input
              value={draftWeight}
              onChange={(event) => setDraftWeight(event.target.value)}
              inputMode="decimal"
              className="mt-2 h-14 w-full rounded-2xl border-2 border-border bg-background px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex.: 74,2"
            />
          </label>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="lg" onClick={() => setOpenWeight(false)} className="text-base">
              Cancelar
            </Button>
            <Button size="lg" onClick={saveWeight} className="text-base font-semibold">
              Confirmar e salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
