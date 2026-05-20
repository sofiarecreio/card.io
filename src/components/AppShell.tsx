import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { ReactNode, useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: "patient" | "team";
}) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isPatient = profile === "patient";
  const user = isPatient
    ? {
        initials: "MO",
        name: "Maria S. Oliveira",
        shortName: "Maria O.",
        role: "Paciente",
        detail: "Plano de cuidado IC",
        id: "P-1042",
        email: "maria.oliveira@email.com",
        preference: "Lembretes grandes e linguagem simples",
      }
    : {
        initials: "HL",
        name: "Dr. Henrique Lima",
        shortName: "Dr. Lima",
        role: "Médico cardiologista",
        detail: "Equipe de insuficiência cardíaca",
        id: "CRM-SP 123456",
        email: "henrique.lima@hospital.edu",
        preference: "Alertas críticos primeiro",
      };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Heart className="h-4.5 w-4.5 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">Card.io</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Insuf. Cardíaca · BI
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">Live</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 pr-3 transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden leading-tight sm:block">
                    <div className="text-xs font-semibold">{user.shortName}</div>
                    <div className="text-[10px] text-muted-foreground">{user.role}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{user.name}</div>
                      <div className="truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <Link to="/perfil" search={{ tipo: isPatient ? "paciente" : "equipe" }}>
                    <ShieldCheck className="h-4 w-4" />
                    Detalhes do perfil
                  </Link>
                </DropdownMenuItem>
                <div className="px-3 pb-2 text-xs text-muted-foreground">{user.detail}</div>
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 text-danger focus:text-danger"
                  onSelect={(event) => {
                    event.preventDefault();
                    setLogoutOpen(true);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">{children}</main>

      <footer className="border-t border-border bg-card/40 py-6">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Card.io BI · Mockup demonstrativo · Dados sintéticos
          </div>
          <div>v1.0 · {new Date().getFullYear()}</div>
        </div>
      </footer>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
            <AlertDialogDescription>
              Você será levado de volta para a tela de login. Deseja encerrar esta sessão?
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
    </div>
  );
}
