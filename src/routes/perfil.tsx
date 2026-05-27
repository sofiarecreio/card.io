import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Edit3,
  HeartPulse,
  LogOut,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BiCard } from "@/components/bi/Card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditableProfile = {
  name: string;
  role: string;
  id: string;
  email: string;
  phone: string;
  credential: string;
  careArea: string;
  institution: string;
  photo: string | null;
};

type TeamMember = {
  name: string;
  role: "Médico" | "Enfermeiro" | "Técnico de enfermagem";
  email: string;
  credential: string;
  phone: string;
};

export const Route = createFileRoute("/perfil")({
  validateSearch: (): { tipo: "equipe" } => ({
    tipo: "equipe",
  }),
  head: () => ({
    meta: [
      { title: "Detalhes do perfil - Card.io" },
      {
        name: "description",
        content: "Pagina de detalhes, edicao e segurança do perfil da equipe.",
      },
    ],
  }),
  component: ProfileDetails,
});

const initialProfile: EditableProfile = {
  name: "Dr. Henrique Lima",
  role: "Médico cardiologista",
  id: "CRM-SP 123456",
  email: "henrique.lima@hospital.edu",
  phone: "(11) 3000-0000",
  credential: "CRM-SP 123456",
  careArea: "Equipe de insuficiencia cardiaca",
  institution: "Hospital Universitario - Cardiologia",
  photo: null,
};

const initialTeamMembers: TeamMember[] = [
  {
    name: "Dra. Paula Nunes",
    role: "Médico",
    email: "paula.nunes@hospital.edu",
    credential: "CRM-SP 456789",
    phone: "(11) 3000-1001",
  },
  {
    name: "Carla Martins",
    role: "Enfermeiro",
    email: "carla.martins@hospital.edu",
    credential: "COREN-SP 889900",
    phone: "(11) 3000-1002",
  },
];

const credentialByRole: Record<TeamMember["role"], string> = {
  Médico: "CRM",
  Enfermeiro: "COREN",
  "Técnico de enfermagem": "",
};

const emptyTeamMember: TeamMember = {
  name: "",
  role: "Médico",
  email: "",
  credential: credentialByRole.Médico,
  phone: "",
};

function ProfileDetails() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState<EditableProfile>(initialProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmPhotoRemoval, setConfirmPhotoRemoval] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [newMember, setNewMember] = useState<TeamMember>(emptyTeamMember);
  const [newMemberOpen, setNewMemberOpen] = useState(false);
  const [confirmMemberOpen, setConfirmMemberOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState<TeamMember | null>(null);
  const [memberEditIndex, setMemberEditIndex] = useState<number | null>(null);
  const [confirmMemberSaveOpen, setConfirmMemberSaveOpen] = useState(false);
  const [memberPendingDelete, setMemberPendingDelete] = useState<number | null>(null);
  const [confirmMemberDeleteOpen, setConfirmMemberDeleteOpen] = useState(false);
  const [confirmProfileDeleteOpen, setConfirmProfileDeleteOpen] = useState(false);
  const [profileDeleted, setProfileDeleted] = useState(false);

  const initials = getInitials(profile.name);

  function openEditDialog() {
    setDraft(profile);
    setEditOpen(true);
  }

  function confirmProfileSave() {
    setProfile(draft);
    setFeedback("Dados do perfil atualizados com sucesso.");
    setConfirmEditOpen(false);
    setEditOpen(false);
  }

  function updateDraft(field: keyof EditableProfile, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updatePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfile((current) => ({ ...current, photo: URL.createObjectURL(file) }));
    setFeedback("Foto do perfil atualizada.");
  }

  function removePhoto() {
    setProfile((current) => ({ ...current, photo: null }));
    setFeedback("Foto do perfil removida.");
    setConfirmPhotoRemoval(false);
  }

  function updateNewMember(field: keyof TeamMember, value: string) {
    setNewMember((current) => {
      if (field === "role") {
        const role = value as TeamMember["role"];
        return { ...current, role, credential: credentialByRole[role] };
      }

      return { ...current, [field]: value } as TeamMember;
    });
  }

  function createTeamMember() {
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    setTeamMembers((current) => [...current, newMember]);
    setNewMember(emptyTeamMember);
    setFeedback("Novo perfil da equipe criado.");
    setConfirmMemberOpen(false);
    setNewMemberOpen(false);
  }

  function openMemberEdit(member: TeamMember, index: number) {
    setMemberDraft(member);
    setMemberEditIndex(index);
  }

  function updateMemberDraft(field: keyof TeamMember, value: string) {
    setMemberDraft((current) =>
      current ? ({ ...current, [field]: value } as TeamMember) : current,
    );
  }

  function saveMemberDraft() {
    if (!memberDraft || memberEditIndex === null) return;

    setTeamMembers((current) =>
      current.map((member, index) => (index === memberEditIndex ? memberDraft : member)),
    );
    setFeedback("Perfil da equipe atualizado.");
    setMemberDraft(null);
    setMemberEditIndex(null);
    setConfirmMemberSaveOpen(false);
  }

  function deleteMember() {
    if (memberPendingDelete === null) return;

    setTeamMembers((current) => current.filter((_, index) => index !== memberPendingDelete));
    setFeedback("Perfil da equipe removido.");
    setMemberPendingDelete(null);
    setConfirmMemberDeleteOpen(false);
  }

  function deleteCurrentProfile() {
    setProfileDeleted(true);
    setFeedback(null);
    setConfirmProfileDeleteOpen(false);
  }

  if (profileDeleted) {
    return (
      <AppShell profile="team">
        <div className="rounded-3xl border border-danger/25 bg-danger/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">
            Perfil excluido
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{profile.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A exclusao foi aplicada nesta sessao apos confirmacao.
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
            Perfil da equipe
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">
            Detalhes do perfil
          </h1>
          <p className="mt-2 max-w-3xl text-base text-muted-foreground">
            Visualize e atualize dados profissionais, foto, sessao de acesso e membros da equipe.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmProfileDeleteOpen(true)}
            className="rounded-full text-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
            Excluir perfil
          </Button>
          <Button
            variant="outline"
            onClick={() => setLogoutOpen(true)}
            className="rounded-full text-danger hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-success/25 bg-success/10 p-4 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 text-success" />
          {feedback}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] lg:col-span-12">
          <div className="h-24 bg-gradient-to-r from-secondary via-background to-warning/20" />
          <div className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="-mt-11 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar className="h-24 w-24 border-4 border-card shadow-[var(--shadow-card)]">
                  {profile.photo && <AvatarImage src={profile.photo} alt={profile.name} />}
                  <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <div className="h-12 text-2xl font-semibold tracking-tight">{profile.name}</div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    {profile.role}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    {profile.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground">
                  <Camera className="h-4 w-4" />
                  {profile.photo ? "Editar foto" : "Adicionar foto"}
                  <input type="file" accept="image/*" className="sr-only" onChange={updatePhoto} />
                </label>
                {profile.photo && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setConfirmPhotoRemoval(true)}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                )}
                <Button onClick={openEditDialog} size="default">
                  <Edit3 className="h-4 w-4" />
                  Editar dados
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ProfileField
                icon={<UserRound className="h-4 w-4" />}
                label="Identificação"
                value={profile.id}
              />
              <ProfileField
                icon={<HeartPulse className="h-4 w-4" />}
                label="Registro profissional"
                value={profile.credential}
              />
              <ProfileField
                icon={<Phone className="h-4 w-4" />}
                label="Telefone"
                value={profile.phone}
              />
              <ProfileField
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Áreaassistencial"
                value={profile.careArea}
              />
              <ProfileField
                icon={<UsersRound className="h-4 w-4" />}
                label="Instituição"
                value={profile.institution}
              />
              <ProfileField
                icon={<Mail className="h-4 w-4" />}
                label="E-mail"
                value={profile.email}
              />
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Segurança do perfil
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Dados exibidos sao sinteticos para demonstracao. Alteracoes feitas aqui
                    atualizam a experiencia da sessao atual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BiCard
          className="lg:col-span-12 [&_h3]:text-xl"
          title="Perfis da equipe"
          action={
            <Button
              onClick={() => {
                setNewMember(emptyTeamMember);
                setNewMemberOpen(true);
              }}
              size="default"
              className="rounded-full"
            >
              <Plus className="h-4 w-4" />
              Novo perfil
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={`${member.email}-${member.credential}`}
                member={member}
                onEdit={() => openMemberEdit(member, index)}
                onDelete={() => {
                  setMemberPendingDelete(index);
                  setConfirmMemberDeleteOpen(true);
                }}
              />
            ))}
          </div>
        </BiCard>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar detalhes do perfil</DialogTitle>
            <DialogDescription>Revise os dados antes de confirmar a alteracao.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <ProfileInput
              label="Nome completo"
              value={draft.name}
              onChange={(value) => updateDraft("name", value)}
            />
            <ProfileInput
              label="Função"
              value={draft.role}
              onChange={(value) => updateDraft("role", value)}
            />
            <ProfileInput
              label="E-mail"
              value={draft.email}
              onChange={(value) => updateDraft("email", value)}
            />
            <ProfileInput
              label="Telefone"
              value={draft.phone}
              onChange={(value) => updateDraft("phone", value)}
            />
            <ProfileInput
              label="CRM ou equivalente"
              value={draft.credential}
              onChange={(value) => updateDraft("credential", value)}
            />
            <ProfileInput
              label="Identificação"
              value={draft.id}
              onChange={(value) => updateDraft("id", value)}
            />
            <ProfileInput
              label="Áreaassistencial"
              value={draft.careArea}
              onChange={(value) => updateDraft("careArea", value)}
            />
            <ProfileInput
              label="Instituição"
              value={draft.institution}
              onChange={(value) => updateDraft("institution", value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmEditOpen(true)}>Salvar alteracoes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newMemberOpen} onOpenChange={setNewMemberOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Criar perfil da equipe</DialogTitle>
            <DialogDescription>
              Informe função, identificação profissional e contato do novo membro.
            </DialogDescription>
          </DialogHeader>
          <TeamMemberForm member={newMember} onChange={updateNewMember} />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setNewMemberOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmMemberOpen(true)}>Criar perfil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberDraft} onOpenChange={(open) => !open && setMemberDraft(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          {memberDraft && (
            <>
              <DialogHeader>
                <DialogTitle>Editar perfil da equipe</DialogTitle>
                <DialogDescription>
                  Confirme antes de aplicar as alteracoes ao perfil profissional.
                </DialogDescription>
              </DialogHeader>
              <TeamMemberForm member={memberDraft} onChange={updateMemberDraft} />
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setMemberDraft(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => setConfirmMemberSaveOpen(true)}>Salvar alteracoes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmEditOpen} onOpenChange={setConfirmEditOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edicao</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alteracoes feitas nos detalhes do perfil?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProfileSave}>Confirmar e salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmProfileDeleteOpen} onOpenChange={setConfirmProfileDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao removera o perfil da visualizacao ativa desta sessao. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCurrentProfile}>Excluir perfil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMemberSaveOpen} onOpenChange={setConfirmMemberSaveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edicao do perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alteracoes deste membro da equipe?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={saveMemberDraft}>Confirmar edicao</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMemberDeleteOpen} onOpenChange={setConfirmMemberDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              O perfil selecionado sera removido da equipe nesta sessao.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMember}>Excluir perfil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPhotoRemoval} onOpenChange={setConfirmPhotoRemoval}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto</AlertDialogTitle>
            <AlertDialogDescription>
              A foto atual sera removida do perfil desta sessao.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={removePhoto}>Remover foto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMemberOpen} onOpenChange={setConfirmMemberOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar novo perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja criar este perfil para a equipe medica?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={createTeamMember}>Confirmar criacao</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saida</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja sair do perfil e voltar para a tela de login?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/">Sair</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function TeamMemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/25 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
          <UsersRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-lg font-semibold">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.role}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="font-medium">{member.credential}</div>
        <div className="text-muted-foreground">{member.email}</div>
        <div className="text-muted-foreground">{member.phone}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-danger hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

function TeamMemberForm({
  member,
  onChange,
}: {
  member: TeamMember;
  onChange: (field: keyof TeamMember, value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ProfileInput
        label="Nome completo"
        value={member.name}
        onChange={(value) => onChange("name", value)}
      />
      <label className="block text-sm font-medium">
        Função
        <select
          value={member.role}
          onChange={(event) => onChange("role", event.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option>Médico</option>
          <option>Enfermeiro</option>
          <option>Técnico de enfermagem</option>
        </select>
      </label>
      <ProfileInput
        label="E-mail institucional"
        value={member.email}
        onChange={(value) => onChange("email", value)}
      />
      <ProfileInput
        label="CRM, COREN ou equivalente"
        value={member.credential}
        onChange={(value) => onChange("credential", value)}
      />
      <ProfileInput
        label="Telefone"
        value={member.phone}
        onChange={(value) => onChange("phone", value)}
      />
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        <span className="min-w-0 break-words">{value}</span>
      </div>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
