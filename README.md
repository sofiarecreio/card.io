# FC Cardio

Aplicacao clinica em TypeScript com React 19, TanStack Start, TanStack Router, Vite, Tailwind CSS 4 e Cloudflare.

## Back-end

O back-end usa rotas server-side do TanStack Start e Cloudflare D1. A escolha por D1 mantem o deploy simples no Cloudflare e evita uma camada externa para o MVP. O acesso ao banco fica isolado em repositorios TypeScript, com validacao Zod e sessao assinada por cookie HTTP-only.

Durante o desenvolvimento sem binding `DB`, os repositorios usam os mocks existentes como fallback de leitura. Escritas continuam disponiveis quando o D1 local ou remoto estiver configurado.

## Estrutura

```text
migrations/0001_initial.sql       schema D1
/scripts/seed.sql                 dados iniciais
/src/server/db                    cliente e tipos D1
/src/server/auth                  sessao assinada
/src/server/validators            schemas Zod
/src/server/repositories          acesso a dados
/src/server/services              regras de aplicacao
/src/server/middlewares           auditoria basica
/src/routes/api.*                 endpoints TanStack Start
/src/lib/api                      tipos compartilhados e client do front-end
```

O schema contempla equipe, perfis de acesso, pacientes, prontuarios, formularios clinicos, respostas, consultas, evolucoes, medicoes cardiacas, alertas, snapshots de KPIs e auditoria.

## Instalar e rodar

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate
npm run db:seed
npm run dev
```

No PowerShell, use:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Credenciais demonstrativas:

```text
admin@cardio.local       / admin123
medico@cardio.local      / cardio123
enfermeira@cardio.local  / cardio123
tecnico@cardio.local     / cardio123
```

As senhas do seed usam `plain:` apenas para demonstracao local. Em producao, substitua por hashes gerados por um provedor de identidade ou fluxo de cadastro seguro.

## Endpoints

```text
POST  /api/auth/login
POST  /api/auth/logout
GET   /api/auth/me
GET   /api/team
GET   /api/profile
GET   /api/patients
POST  /api/patients
GET   /api/patients/:patientId
PATCH /api/patients/:patientId
GET   /api/records/:patientId
PATCH /api/records/:patientId
POST  /api/records/:patientId/evolutions
GET   /api/appointments
POST  /api/appointments
POST  /api/measurements
GET   /api/measurements/:patientId
GET   /api/kpis
GET   /api/alerts
POST  /api/alerts
```

## Deploy Cloudflare

1. Autentique o Wrangler:

```bash
npx wrangler login
```

2. Crie o banco D1:

```bash
npx wrangler d1 create fc-cardio
```

3. Copie o `database_id` retornado para `wrangler.jsonc`.

4. Configure o segredo de sessao:

```bash
npx wrangler secret put SESSION_SECRET
```

5. Aplique schema e seed remotos:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

6. Gere o build e publique conforme o fluxo Cloudflare do projeto:

```bash
npm run build
npx wrangler deploy
```
