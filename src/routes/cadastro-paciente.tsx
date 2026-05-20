import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BiCard } from "@/components/bi/Card";
import { ClinicalFormRenderer } from "@/components/clinical/ClinicalFormRenderer";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, FileText, Printer, Send, ShieldCheck } from "lucide-react";
import {
  clinicalFormTemplates,
  cloneClinicalValues,
  countCompletedClinicalForms,
  createEmptyClinicalFormsState,
  type ClinicalFieldValue,
  type ClinicalFormKey,
  type ClinicalFormsState,
} from "@/lib/clinicalForms";

export const Route = createFileRoute("/cadastro-paciente")({
  head: () => ({
    meta: [
      { title: "Cadastro de paciente · Card.io" },
      {
        name: "description",
        content: "Cadastro clínico de paciente com insuficiência cardíaca.",
      },
    ],
  }),
  component: PatientRegistrationPage,
});

type RegistrationDraft = {
  name: string;
  cpf: string;
  birth: string;
  sex: string;
  phone: string;
  email: string;
  address: string;
  evaluationDate: string;
  responsible: string;
  institution: string;
  summaryText: string;
  firstMessage: string;
};

const initialDraft: RegistrationDraft = {
  name: "",
  cpf: "",
  birth: "",
  sex: "Feminino",
  phone: "",
  email: "",
  address: "",
  evaluationDate: "2026-05-20",
  responsible: "Dr. Henrique Lima",
  institution: "Hospital Universitário · Cardiologia",
  summaryText:
    "Resumo inicial editável: registre sinais, sintomas, contexto clínico e pontos que precisam ser acompanhados pela equipe.",
  firstMessage: "",
};

function PatientRegistrationPage() {
  const [draft, setDraft] = useState(initialDraft);
  const [clinicalForms, setClinicalForms] = useState<ClinicalFormsState>(() =>
    createEmptyClinicalFormsState(),
  );
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSummaryOpen, setConfirmSummaryOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [summaryFeedback, setSummaryFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState([
    "Cadastro iniciado pela equipe médica.",
    "Prontuário provisório aguardando confirmação.",
  ]);

  const age = useMemo(() => calculateAge(draft.birth), [draft.birth]);
  const universalRecord = useMemo(() => createUniversalRecord(draft.cpf), [draft.cpf]);

  const syncedClinicalForms = useMemo<ClinicalFormsState>(() => {
    const current = cloneFormsState(clinicalForms);
    current.identificacao = {
      ...current.identificacao,
      recordId: universalRecord,
      cpf: draft.cpf,
      dataAvaliacao: draft.evaluationDate,
      dataNascimento: draft.birth,
      idadeCalculada: age ? `${age} anos` : "",
      nomeCompleto: draft.name,
      sexo: draft.sex,
      telefone: draft.phone,
      email: draft.email,
      endereco: draft.address,
      responsavel: draft.responsible,
      instituicao: draft.institution,
      resumoClinico: draft.summaryText,
    };
    return current;
  }, [age, clinicalForms, draft, universalRecord]);

  const formCompleteness = countCompletedClinicalForms(syncedClinicalForms);

  function updateField<Key extends keyof RegistrationDraft>(
    key: Key,
    value: RegistrationDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateClinicalField(
    formKey: ClinicalFormKey,
    fieldId: string,
    value: ClinicalFieldValue,
  ) {
    setClinicalForms((current) => ({
      ...current,
      [formKey]: {
        ...current[formKey],
        [fieldId]: value,
      },
    }));

    if (formKey !== "identificacao" || typeof value !== "string") return;
    const syncedFields: Partial<Record<string, keyof RegistrationDraft>> = {
      cpf: "cpf",
      dataAvaliacao: "evaluationDate",
      dataNascimento: "birth",
      nomeCompleto: "name",
      sexo: "sex",
      telefone: "phone",
      email: "email",
      endereco: "address",
      responsavel: "responsible",
      instituicao: "institution",
      resumoClinico: "summaryText",
    };
    const draftKey = syncedFields[fieldId];
    if (draftKey) setDraft((current) => ({ ...current, [draftKey]: value }));
  }

  function confirmSummaryEdit() {
    setSummaryFeedback("Resumo clínico salvo na Identificação Universal.");
    setHistory((current) => ["Resumo clínico salvo no formulário de identificação.", ...current]);
    setConfirmSummaryOpen(false);
  }

  function createPatient() {
    const login = onlyDigits(draft.cpf);
    if (login.length < 11) {
      setFeedback("Informe um CPF completo na Identificação Universal para gerar o acesso.");
      setConfirmOpen(false);
      return;
    }

    const password = generatePassword();
    setCredentials({ login, password });
    setCredentialsOpen(true);
    setConfirmOpen(false);
    setHistory((current) => [
      `Paciente cadastrado. Login gerado pelo CPF ${login} e Registro Universal ${universalRecord}.`,
      ...current,
    ]);
  }

  function printCredentials() {
    window.print();
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
            Cadastro clínico
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Novo paciente</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Preencha a Identificação Universal e os formulários clínicos completos. O acesso do
            paciente será gerado com CPF e senha automática.
          </p>
        </div>
        <Button onClick={() => setConfirmOpen(true)} className="rounded-full">
          <CheckCircle2 className="h-4 w-4" />
          Confirmar cadastro
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <BiCard
          className="lg:col-span-12"
          title="Formulários clínicos detalhados"
          subtitle={`${formCompleteness} de ${clinicalFormTemplates.length} formulários com dados preenchidos`}
        >
          <div className="space-y-4">
            {clinicalFormTemplates.map((template, index) => (
              <details
                key={template.key}
                open={index === 0}
                className="rounded-2xl border border-border bg-secondary/20 p-4"
              >
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{template.name}</span>
                    <span className="block text-xs text-muted-foreground">{template.short}</span>
                  </span>
                </summary>
                <div className="mt-4">
                  <ClinicalFormRenderer
                    template={template}
                    values={syncedClinicalForms[template.key]}
                    onChange={(fieldId, value) => updateClinicalField(template.key, fieldId, value)}
                  />
                  {template.key === "identificacao" && (
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Registro Universal atual
                        </div>
                        <div className="mt-1 font-display text-2xl font-semibold">
                          {universalRecord}
                        </div>
                        {summaryFeedback && (
                          <div className="mt-2 text-xs font-semibold text-success">
                            {summaryFeedback}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setConfirmSummaryOpen(true)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Salvar resumo clínico
                      </Button>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-7"
          title="Histórico inicial"
          subtitle="Eventos do cadastro e formulários clínicos"
        >
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl border border-border bg-background p-3 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-5"
          title="Primeiro recado"
          subtitle="Mensagem opcional para aparecer no painel do paciente"
        >
          <TextArea
            label="Recado da equipe"
            value={draft.firstMessage}
            onChange={(value) => updateField("firstMessage", value)}
            placeholder="Ex.: Seja bem-vindo ao acompanhamento remoto..."
          />
          <Button
            variant="outline"
            className="mt-3 rounded-full"
            onClick={() => {
              setFeedback("Recado inicial preparado para envio após o cadastro.");
              setHistory((current) => ["Recado inicial preparado para o paciente.", ...current]);
            }}
          >
            <Send className="h-4 w-4" />
            Preparar recado
          </Button>
          {feedback && (
            <div className="mt-3 rounded-2xl border border-success/25 bg-success/10 p-3 text-sm font-semibold text-success">
              {feedback}
            </div>
          )}
        </BiCard>
      </div>

      <AlertDialog open={confirmSummaryOpen} onOpenChange={setConfirmSummaryOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar resumo clínico</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar o resumo clínico dentro da Identificação Universal deste paciente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSummaryEdit}>Salvar resumo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cadastro do paciente</AlertDialogTitle>
            <AlertDialogDescription>
              O login será gerado obrigatoriamente pelo CPF informado. A senha será criada
              automaticamente e o Registro Universal será {universalRecord}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={createPatient}>Cadastrar e gerar acesso</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Acesso do paciente gerado</DialogTitle>
          </DialogHeader>
          <div className="print-area rounded-2xl border border-border bg-secondary/25 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-success/15 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-lg font-semibold">{draft.name || "Novo paciente"}</div>
                <div className="text-sm text-muted-foreground">{universalRecord}</div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Credential label="Login" value={credentials?.login ?? onlyDigits(draft.cpf)} />
              <Credential label="Senha provisória" value={credentials?.password ?? ""} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={printCredentials}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={() => setCredentialsOpen(false)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-24 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold">{value || "--"}</div>
    </div>
  );
}

function cloneFormsState(state: ClinicalFormsState): ClinicalFormsState {
  return Object.fromEntries(
    Object.entries(state).map(([key, values]) => [key, cloneClinicalValues(values)]),
  ) as ClinicalFormsState;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function createUniversalRecord(cpf: string) {
  const firstFive = onlyDigits(cpf).slice(0, 5);
  return firstFive.length === 5 ? `p-${firstFive}` : "p-_____";
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 8 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

function calculateAge(value: string) {
  if (!value) return null;
  const parts = value.includes("-")
    ? value.split("-").map(Number).reverse()
    : value.split("/").map(Number);
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  const today = new Date(2026, 4, 20);
  let age = today.getFullYear() - year;
  const birthdayPassed =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayPassed) age -= 1;
  return age;
}
