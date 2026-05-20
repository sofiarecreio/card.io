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
  Save,
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

type ProfileType = "paciente" | "equipe";
type EditableProfile = {
  name: string;
  role: string;
  id: string;
  email: string;
  phone: string;
  birth: string;
  carePlan: string;
  contact: string;
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
  validateSearch: (search: Record<string, unknown>): { tipo: ProfileType } => ({
    tipo: search.tipo === "equipe" ? "equipe" : "paciente",
  }),
  head: () => ({
    meta: [
      { title: "Detalhes do perfil · Card.io" },
      {
        name: "description",
        content: "Página de detalhes, edição e segurança do perfil do usuário.",
      },
    ],
  }),
  component: ProfileDetails,
});

const initialProfiles: Record<ProfileType, EditableProfile> = {
  paciente: {
    name: "Maria S. Oliveira",
    role: "Paciente",
    id: "P-1042",
    email: "maria.oliveira@email.com",
    phone: "(11) 99999-1204",
    birth: "03/05/1959",
    carePlan: "Monitoramento de insuficiência cardíaca",
    contact: "Dr. Henrique Lima e Enf. Carla",
    photo: null,
  },
  equipe: {
    name: "Dr. Henrique Lima",
    role: "Médico cardiologista",
    id: "CRM-SP 123456",
    email: "henrique.lima@hospital.edu",
    phone: "(11) 3000-0000",
    birth: "CRM-SP 123456",
    carePlan: "Equipe de insuficiência cardíaca",
    contact: "Hospital Universitário · Cardiologia",
    photo: null,
  },
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

const emptyTeamMember: TeamMember = {
  name: "",
  role: "Médico",
  email: "",
  credential: "",
  phone: "",
};

function ProfileDetails() {
  const { tipo } = Route.useSearch();
  const isPatient = tipo === "paciente";
  const [profiles, setProfiles] = useState(initialProfiles);
  const [draft, setDraft] = useState<EditableProfile>(initialProfiles[tipo]);
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

  const profile = profiles[tipo];
  const initials = getInitials(profile.name);
  const largeText = !isPatient;

  function openEditDialog() {
    setDraft(profile);
    setEditOpen(true);
  }

  function confirmProfileSave() {
    setProfiles((current) => ({ ...current, [tipo]: draft }));
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

    const photo = URL.createObjectURL(file);
    setProfiles((current) => ({
      ...current,
      [tipo]: { ...current[tipo], photo },
    }));
    setFeedback("Foto do perfil atualizada.");
  }

  function removePhoto() {
    setProfiles((current) => ({
      ...current,
      [tipo]: { ...current[tipo], photo: null },
    }));
    setFeedback("Foto do perfil removida.");
    setConfirmPhotoRemoval(false);
  }

  function updateNewMember(field: keyof TeamMember, value: string) {
    setNewMember((current) => ({ ...current, [field]: value }) as TeamMember);
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
      <AppShell profile={isPatient ? "patient" : "team"}>
        <div className="rounded-3xl border border-danger/25 bg-danger/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">
            Perfil excluído
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{profile.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A exclusão foi aplicada nesta sessão após confirmação.
          </p>
          <Link
            to={isPatient ? "/paciente" : "/equipe"}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Voltar
          </Link>
        </div>
      </AppShell>
    );
  }

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
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Perfil
          </p>
          <h1
            className={`mt-1 font-display font-semibold tracking-tight ${largeText ? "text-4xl" : "text-3xl"}`}
          >
            Detalhes do perfil
          </h1>
          <p
            className={`mt-2 max-w-3xl text-muted-foreground ${largeText ? "text-base" : "text-sm"}`}
          >
            Visualize e atualize dados do perfil, foto e sessão de acesso em uma página dedicada.
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
        <BiCard className="lg:col-span-4" title="Dados principais">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-28 w-28 border border-border">
              {profile.photo && <AvatarImage src={profile.photo} alt={profile.name} />}
              <AvatarFallback className="bg-primary/15 text-3xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={`mt-4 font-semibold ${largeText ? "text-2xl" : "text-xl"}`}>
              {profile.name}
            </div>
            <div className={`${largeText ? "text-base" : "text-sm"} text-muted-foreground`}>
              {profile.role}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground">
                <Camera className="h-4 w-4" />
                {profile.photo ? "Editar foto" : "Adicionar foto"}
                <input type="file" accept="image/*" className="sr-only" onChange={updatePhoto} />
              </label>
              {profile.photo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmPhotoRemoval(true)}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <DetailLine
              large={largeText}
              icon={<UserRound className="h-4 w-4" />}
              label="Identificação"
              value={profile.id}
            />
            <DetailLine
              large={largeText}
              icon={<Mail className="h-4 w-4" />}
              label="E-mail"
              value={profile.email}
            />
            <DetailLine
              large={largeText}
              icon={<Phone className="h-4 w-4" />}
              label="Telefone"
              value={profile.phone}
            />
            <DetailLine
              large={largeText}
              icon={<HeartPulse className="h-4 w-4" />}
              label={isPatient ? "Data de nascimento" : "Registro profissional"}
              value={profile.birth}
            />
          </div>
        </BiCard>

        <BiCard
          className="lg:col-span-8"
          title="Detalhes do perfil"
          action={
            <Button onClick={openEditDialog} size="sm" className="rounded-full">
              <Save className="h-4 w-4" />
              Editar dados
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock
              large={largeText}
              label={isPatient ? "Plano de cuidado" : "Área assistencial"}
              value={profile.carePlan}
            />
            <InfoBlock
              large={largeText}
              label={isPatient ? "Equipe responsável" : "Instituição"}
              value={profile.contact}
            />
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-secondary/35 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Segurança do perfil
            </div>
            <p
              className={`leading-relaxed text-muted-foreground ${largeText ? "text-base" : "text-sm"}`}
            >
              Dados exibidos são sintéticos para demonstração. Alterações feitas aqui atualizam a
              experiência da sessão atual.
            </p>
          </div>
        </BiCard>

        {!isPatient && (
          <BiCard
            className="lg:col-span-12"
            title="Perfis da equipe"
            subtitle="Disponível para médico ou enfermeiro chefe criar acessos assistenciais"
            action={
              <Button
                onClick={() => {
                  setNewMember(emptyTeamMember);
                  setNewMemberOpen(true);
                }}
                size="sm"
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
                Novo perfil
              </Button>
            }
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {teamMembers.map((member, index) => (
                <div
                  key={`${member.email}-${member.credential}`}
                  className="rounded-2xl border border-border bg-secondary/25 p-4"
                >
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMemberEdit(member, index)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMemberPendingDelete(index);
                        setConfirmMemberDeleteOpen(true);
                      }}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </BiCard>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar detalhes do perfil</DialogTitle>
            <DialogDescription>Revise os dados antes de confirmar a alteração.</DialogDescription>
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
              label={isPatient ? "Data de nascimento" : "CRM ou equivalente"}
              value={draft.birth}
              onChange={(value) => updateDraft("birth", value)}
            />
            <ProfileInput
              label="Identificação"
              value={draft.id}
              onChange={(value) => updateDraft("id", value)}
            />
            <ProfileInput
              label={isPatient ? "Plano de cuidado" : "Área assistencial"}
              value={draft.carePlan}
              onChange={(value) => updateDraft("carePlan", value)}
            />
            <ProfileInput
              label={isPatient ? "Equipe responsável" : "Instituição"}
              value={draft.contact}
              onChange={(value) => updateDraft("contact", value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmEditOpen(true)}>Salvar alterações</Button>
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
          <div className="grid gap-3 md:grid-cols-2">
            <ProfileInput
              label="Nome completo"
              value={newMember.name}
              onChange={(value) => updateNewMember("name", value)}
            />
            <label className="block text-sm font-medium">
              Função
              <select
                value={newMember.role}
                onChange={(event) => updateNewMember("role", event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Médico</option>
                <option>Enfermeiro</option>
                <option>Técnico de enfermagem</option>
              </select>
            </label>
            <ProfileInput
              label="E-mail institucional"
              value={newMember.email}
              onChange={(value) => updateNewMember("email", value)}
            />
            <ProfileInput
              label="CRM, COREN ou equivalente"
              value={newMember.credential}
              onChange={(value) => updateNewMember("credential", value)}
            />
            <ProfileInput
              label="Telefone"
              value={newMember.phone}
              onChange={(value) => updateNewMember("phone", value)}
            />
          </div>
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
                  Confirme antes de aplicar as alterações ao perfil profissional.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <ProfileInput
                  label="Nome completo"
                  value={memberDraft.name}
                  onChange={(value) => updateMemberDraft("name", value)}
                />
                <label className="block text-sm font-medium">
                  Função
                  <select
                    value={memberDraft.role}
                    onChange={(event) => updateMemberDraft("role", event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Médico</option>
                    <option>Enfermeiro</option>
                    <option>Técnico de enfermagem</option>
                  </select>
                </label>
                <ProfileInput
                  label="E-mail institucional"
                  value={memberDraft.email}
                  onChange={(value) => updateMemberDraft("email", value)}
                />
                <ProfileInput
                  label="CRM, COREN ou equivalente"
                  value={memberDraft.credential}
                  onChange={(value) => updateMemberDraft("credential", value)}
                />
                <ProfileInput
                  label="Telefone"
                  value={memberDraft.phone}
                  onChange={(value) => updateMemberDraft("phone", value)}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setMemberDraft(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => setConfirmMemberSaveOpen(true)}>Salvar alterações</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmEditOpen} onOpenChange={setConfirmEditOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edição</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alterações feitas nos detalhes do perfil?
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
              Esta ação removerá o perfil da visualização ativa desta sessão. Deseja continuar?
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
            <AlertDialogTitle>Confirmar edição do perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alterações deste membro da equipe?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={saveMemberDraft}>Confirmar edição</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMemberDeleteOpen} onOpenChange={setConfirmMemberDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              O perfil selecionado será removido da equipe nesta sessão.
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
              A foto atual será removida do perfil desta sessão.
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
              Deseja criar este perfil para a equipe médica?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={createTeamMember}>Confirmar criação</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
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

function DetailLine({
  icon,
  label,
  value,
  large,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background p-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`mt-0.5 font-medium ${large ? "text-base" : "text-sm"}`}>{value}</div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-2 font-semibold ${large ? "text-xl" : "text-base"}`}>{value}</div>
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
