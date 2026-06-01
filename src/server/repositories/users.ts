import type { AccessProfile, AccessRole, TeamUser } from "@/lib/api/types";
import { getDb, jsonParse } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";

type UserRow = {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: AccessRole;
  professional_label: string;
  credential: string | null;
  phone: string | null;
  care_area: string | null;
  institution: string | null;
  is_active: number;
  profile_id: string | null;
  profile_name: string | null;
  profile_description: string | null;
  permissions_json: string | null;
};

export type UserWithPassword = TeamUser & {
  passwordHash: string;
};

const fallbackProfiles: AccessProfile[] = [
  {
    id: "profile-admin",
    name: "Administrador",
    description: "Acesso total.",
    permissions: [
      "team:read",
      "team:write",
      "patients:read",
      "patients:write",
      "records:read",
      "records:write",
      "appointments:write",
      "alerts:write",
    ],
  },
  {
    id: "profile-physician",
    name: "Medico(a)",
    description: "Acesso clinico completo.",
    permissions: [
      "team:read",
      "patients:read",
      "patients:write",
      "records:read",
      "records:write",
      "appointments:write",
      "alerts:write",
    ],
  },
  {
    id: "profile-nurse",
    name: "Enfermeiro(a)",
    description: "Acompanhamento assistencial.",
    permissions: [
      "team:read",
      "patients:read",
      "records:read",
      "records:write",
      "appointments:write",
      "alerts:write",
    ],
  },
  {
    id: "profile-technician",
    name: "Tecnico(a) de enfermagem",
    description: "Registro de sinais vitais e apoio.",
    permissions: ["team:read", "patients:read", "records:read", "appointments:write"],
  },
];

const fallbackUsers: UserWithPassword[] = [
  {
    id: "user-admin",
    email: "admin@cardio.local",
    passwordHash: "plain:admin123",
    name: "Amanda Rocha",
    role: "admin",
    professionalLabel: "Administradora",
    credential: "MATRICULA-0001",
    phone: "+55 11 90000-0001",
    careArea: "Gestao clinica",
    institution: "Hospital Universitario - Cardiologia",
    accessProfile: fallbackProfiles[0] ?? null,
    isActive: true,
  },
  {
    id: "user-physician",
    email: "medico@cardio.local",
    passwordHash: "plain:cardio123",
    name: "Dr. Henrique Lima",
    role: "physician",
    professionalLabel: "Dr. Lima",
    credential: "CRM-SP 123456",
    phone: "+55 11 90000-0002",
    careArea: "Insuficiencia cardiaca",
    institution: "Hospital Universitario - Cardiologia",
    accessProfile: fallbackProfiles[1] ?? null,
    isActive: true,
  },
  {
    id: "user-nurse",
    email: "enfermeira@cardio.local",
    passwordHash: "plain:cardio123",
    name: "Carla Martins",
    role: "nurse",
    professionalLabel: "Enf. Carla",
    credential: "COREN-SP 654321",
    phone: "+55 11 90000-0003",
    careArea: "Monitoramento remoto",
    institution: "Hospital Universitario - Cardiologia",
    accessProfile: fallbackProfiles[2] ?? null,
    isActive: true,
  },
  {
    id: "user-technician",
    email: "tecnico@cardio.local",
    passwordHash: "plain:cardio123",
    name: "Bruno Tavares",
    role: "technician",
    professionalLabel: "Tec. Bruno",
    credential: "MATRICULA-0248",
    phone: "+55 11 90000-0004",
    careArea: "Sinais vitais",
    institution: "Hospital Universitario - Cardiologia",
    accessProfile: fallbackProfiles[3] ?? null,
    isActive: true,
  },
];

const userSelect = `
  SELECT
    u.id,
    u.email,
    u.password_hash,
    u.name,
    u.role,
    u.professional_label,
    u.credential,
    u.phone,
    u.care_area,
    u.institution,
    u.is_active,
    p.id AS profile_id,
    p.name AS profile_name,
    p.description AS profile_description,
    p.permissions_json
  FROM team_users u
  LEFT JOIN access_profiles p ON p.id = u.access_profile_id
`;

function mapUser(row: UserRow): UserWithPassword {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? "",
    name: row.name,
    role: row.role,
    professionalLabel: row.professional_label,
    credential: row.credential,
    phone: row.phone,
    careArea: row.care_area,
    institution: row.institution,
    isActive: Boolean(row.is_active),
    accessProfile: row.profile_id
      ? {
          id: row.profile_id,
          name: row.profile_name ?? "Perfil",
          description: row.profile_description,
          permissions: jsonParse<string[]>(row.permissions_json, []),
        }
      : null,
  };
}

export async function listTeamUsers(ctx: ApiRouteContext): Promise<TeamUser[]> {
  const db = getDb(ctx);
  if (!db) return fallbackUsers.map(stripPassword);

  const result = await db.prepare(`${userSelect} ORDER BY u.name`).all<UserRow>();
  return (result.results ?? []).map(mapUser).map(stripPassword);
}

export async function findUserById(ctx: ApiRouteContext, id: string): Promise<TeamUser | null> {
  const db = getDb(ctx);
  if (!db) return stripPassword(fallbackUsers.find((user) => user.id === id) ?? null);

  const row = await db.prepare(`${userSelect} WHERE u.id = ?`).bind(id).first<UserRow>();
  return row ? stripPassword(mapUser(row)) : null;
}

export async function findUserByEmail(
  ctx: ApiRouteContext,
  email: string,
): Promise<UserWithPassword | null> {
  const normalized = email.trim().toLowerCase();
  const db = getDb(ctx);
  if (!db) {
    return fallbackUsers.find((user) => user.email.toLowerCase() === normalized) ?? null;
  }

  const row = await db
    .prepare(`${userSelect} WHERE lower(u.email) = ? AND u.is_active = 1`)
    .bind(normalized)
    .first<UserRow>();
  return row ? mapUser(row) : null;
}

function stripPassword(user: UserWithPassword | null): TeamUser | null;
function stripPassword(user: UserWithPassword): TeamUser;
function stripPassword(user: UserWithPassword | null): TeamUser | null {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
