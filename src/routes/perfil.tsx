import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  HeartPulse,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BiCard } from "@/components/bi/Card";

type ProfileType = "paciente" | "equipe";

export const Route = createFileRoute("/perfil")({
  validateSearch: (search: Record<string, unknown>): { tipo: ProfileType } => ({
    tipo: search.tipo === "equipe" ? "equipe" : "paciente",
  }),
  head: () => ({
    meta: [
      { title: "Detalhes do perfil · Card.io" },
      { name: "description", content: "Dados do usuário, configurações da conta e preferências." },
    ],
  }),
  component: ProfileDetails,
});

const patientProfile = {
  name: "Maria S. Oliveira",
  role: "Paciente",
  id: "P-1042",
  email: "maria.oliveira@email.com",
  phone: "(11) 99999-1204",
  birth: "03/05/1959",
  carePlan: "Monitoramento de insuficiência cardíaca",
  contact: "Dra. Lima e Enf. Carla",
  account: ["Senha atualizada há 42 dias", "Autenticação por SMS ativa", "Contato familiar autorizado"],
  preferences: ["Botões grandes", "Linguagem simples", "Lembretes às 8h, 12h e 20h"],
};

const teamProfile = {
  name: "Dr. Henrique Lima",
  role: "Médico cardiologista",
  id: "CRM-SP 123456",
  email: "henrique.lima@hospital.edu",
  phone: "(11) 3000-0000",
  birth: "Perfil profissional",
  carePlan: "Equipe de insuficiência cardíaca",
  contact: "Hospital Universitário · Cardiologia",
  account: ["MFA institucional ativo", "Sessão clínica expira em 8h", "Permissão para prontuários e alertas"],
  preferences: ["Alertas críticos primeiro", "Dashboard compacto", "Notificações por e-mail institucional"],
};

function ProfileDetails() {
  const { tipo } = Route.useSearch();
  const isPatient = tipo === "paciente";
  const profile = isPatient ? patientProfile : teamProfile;

  return (
    <AppShell profile={isPatient ? "patient" : "team"}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            to={isPatient ? "/paciente" : "/equipe"}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Perfil</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Detalhes do perfil</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Dados do usuário, configurações da conta e preferências reunidos em uma única página.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <BiCard className="lg:col-span-4" title="Dados principais">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-xl font-semibold text-primary">
              {isPatient ? "MO" : "HL"}
            </div>
            <div>
              <div className="text-xl font-semibold">{profile.name}</div>
              <div className="text-sm text-muted-foreground">{profile.role}</div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <DetailLine icon={<UserRound className="h-4 w-4" />} label="Identificação" value={profile.id} />
            <DetailLine icon={<Mail className="h-4 w-4" />} label="E-mail" value={profile.email} />
            <DetailLine icon={<Phone className="h-4 w-4" />} label="Telefone" value={profile.phone} />
            <DetailLine icon={<HeartPulse className="h-4 w-4" />} label={isPatient ? "Data de nascimento" : "Registro"} value={profile.birth} />
          </div>
        </BiCard>

        <BiCard className="lg:col-span-8" title="Detalhes do perfil">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock label={isPatient ? "Plano de cuidado" : "Área assistencial"} value={profile.carePlan} />
            <InfoBlock label={isPatient ? "Equipe responsável" : "Instituição"} value={profile.contact} />
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-secondary/35 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Privacidade e segurança
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              As informações exibidas são sintéticas para demonstração científica. O fluxo organiza os dados do usuário
              em uma página própria, reduzindo opções no menu suspenso.
            </p>
          </div>
        </BiCard>

        <BiCard className="lg:col-span-6" title="Configurações da conta">
          <div className="space-y-3">
            {profile.account.map((item) => (
              <DetailLine key={item} icon={<Lock className="h-4 w-4" />} label="Conta" value={item} />
            ))}
          </div>
        </BiCard>

        <BiCard className="lg:col-span-6" title="Preferências">
          <div className="space-y-3">
            {profile.preferences.map((item) => (
              <DetailLine key={item} icon={<SlidersHorizontal className="h-4 w-4" />} label="Preferência" value={item} />
            ))}
            <DetailLine icon={<Bell className="h-4 w-4" />} label="Notificações" value={isPatient ? "Lembretes amigáveis no celular" : "Resumo operacional diário"} />
          </div>
        </BiCard>
      </div>
    </AppShell>
  );
}

function DetailLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background p-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-semibold">{value}</div>
    </div>
  );
}
