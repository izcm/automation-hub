# Automation Hub

A demonstration of automated workflows across business systems — covering things like automated notifications/messaging and employee onboarding/offboarding.

The first showcased workflow is vehicle EU-kontroll inspections: tracking upcoming deadlines, assigning responsible employees and notifying them when action is needed.

The demo intentionally contains no live third-party business integrations. In a real deployment these modules would connect to existing fleet, ERP or accounting systems.

<!-- TODO: screenshot -->

**Contents** — [Setup](#setup) · [Features](#features) · [Backend](#backend) · [Components](#components)

---

## Setup

### Dependencies

| Tool   | Version | Notes                     |
| ------ | ------- | ------------------------- |
| Node   | ≥ 22    |                           |
| Docker |         | Postgres runs via compose |

### Environment variables

Read from `.env.local`.

| VAR                       | Description                                      | Required |
| ------------------------- | ------------------------------------------------ | -------- |
| `POSTGRES_CONNECTION_STR` | Postgres connection string                       | Yes      |
| `OIDC_REDIRECT_URI`       | the app's OIDC callback route                    | Yes      |
| `MSFT_OIDC_ISSUER`        | Microsoft OIDC issuer URL                        | Yes      |
| `MSFT_CLIENT_ID`          | Microsoft app client id                          | Yes      |
| `MSFT_CLIENT_SECRET`      | Microsoft app client secret                      | Yes      |
| `EMAIL_HOST`              | SMTP host for outgoing notifications             | No       |
| `SMTP_USER`               | SMTP user                                        | No       |
| `SMTP_PASSWORD`           | SMTP password                                    | No       |
| `VEGVESEN_API_KEY`        | Statens vegvesen API key, used by vehicle lookup | No       |
| `POWER_OFFICE_*`          | PowerOffice API credentials                      | No       |
| `IS_DEMO`                 | `true` enables demo-only behaviour               | No       |

If the SMTP variables are missing, sends fail and the notification is marked `failed`. The app still runs.

### Run

```bash
npm install
npm run start:postgres   # compose up → db:push → seed all tables
npm run dev              # http://localhost:3000
```

---

## Features

Features live in `features/`. Each one holds its UI, hooks, labels and server actions.

| Feature        | Description                                                                          | Lives in                  |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| EU Inspections | dashboard + workspace for upcoming inspections; notify, change status/responsible    | `features/eu-inspections` |
| Notifications  | lists sent notifications, polls status while any are still `queued`                  | `features/notifications`  |
| Filtering      | search-bar syntax (`key=v1,v2`) + predicate filters (AND across, OR within a filter) | `features/filtering`      |
| Vehicle lookup | look up a plate number against Statens vegvesen                                      | `features/vehicle-lookup` |

---

## Backend

The backend is designed to be framework-agnostic. Next.js only reaches it through server actions and API routes, and those go through `boundry`.

```txt
server/
  boundry   -> validation schemas + entry points called by server actions / routes
  domain    -> ports + actions
  read      -> read layer
  db        -> drizzle schemas + repos
  di        -> startup wiring
  auth      -> oidc + sessions
  external  -> third-party clients (email, vegvesen, power-office)
```

### Domain

Each domain model lives in `server/domain/<x>/`. Entity types are shared with the client, so they live in `types/`.

| File         | Description                                              |
| ------------ | -------------------------------------------------------- |
| `port.ts`    | interface for persistence — what the repo must implement |
| `actions.ts` | what happens when something occurs — orchestrates ports  |

**Actions**

Actions are built by factories (`makeXActions(deps)`). They depend on ports, never on concrete repos.

For example, `notifyAboutInspection` looks up the inspection and asks `notify` for a reminder. It then links the new notification to the inspection through the bridge table. The eu-inspections domain never knows how messages are built or sent.

Notifications are saved as `queued`, and emails are sent after the response via Next's `after()`. Each notification then flips to `sent` or `failed`.

### Read

The read layer sits between the entry points and the repos. It depends only on the read interfaces (`ByKey`, `Pageable`, `Countable`) and not on full repos.

| Function                                   | Description                                         |
| ------------------------------------------ | --------------------------------------------------- |
| `readByKey` / `readByKeys`                 | one or many records by key                          |
| `readPage`                                 | a cursor-paginated page                             |
| `readCount`                                | count matching filters                              |
| `readPageRelational` / `readOneRelational` | same, with related resources attached via `include` |

### Repos

Repos are the only layer that talks to the database. They're composed from generic builders in `server/db/postgres/core`:

| Builder                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `makeReadRepo`            | `findByKey`, `findByKeys`, `findPage`, `count` |
| `relational.makeReadRepo` | same reads, resolving drizzle relations        |
| `makeEnsure`              | upsert on a unique target                      |
| `makeUpdate`              | partial update by key                          |

Domain ids are app-generated (`generateId`) before insert. Matching rows back never depends on the order the DB returns them in.

### Drizzle

Schemas live next to their repo (`server/db/postgres/<x>/schema.ts`). Relations are defined in one place, `server/db/postgres/relations.ts`, using drizzle's `defineRelations`, and are passed to the client in `pool.ts`.

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run db:push`   | push schemas to the database          |
| `npm run seed:pg:*` | seed a table (see `seed-db-scripts/`) |

### Auth

Login uses Microsoft OIDC with PKCE. After the callback a server-side session is created, stored in Postgres and referenced by a `session` cookie. Sessions expire after 1 hour.

| Part     | Lives in               | Description                                                            |
| -------- | ---------------------- | ---------------------------------------------------------------------- |
| OIDC     | `server/auth/oidc`     | builds the auth request, stores state + verifier, handles callback     |
| Sessions | `server/auth/sessions` | create / get / destroy                                                 |
| Proxy    | `proxy.ts`             | redirects to `/login` or returns 401 for `/api/*` when unauthenticated |

### Dependency Injection

`server/di` is the only place that imports concrete repos and external clients.

| File                   | Wires                                                 |
| ---------------------- | ----------------------------------------------------- |
| `server/di/read.ts`    | repos → read functions                                |
| `server/di/actions.ts` | repos + email / vegvesen / `after()` → domain actions |
| `server/di/auth.ts`    | auth repos → `oidcLogin`, `sessionStore`              |

```ts
export const euInspectionActions = makeEuInspectionActions({
  euInspections: euInspectionRepo,
  notify: notifyForEuInspectionReminder,
  bridge: euInspectionNotificationsRepo,
  generateId,
});
```

---

## Components

Shared UI in `components/`, built on `@a2zb/react` and `@a2zb/styles`. Feature-specific UI lives in `features/<x>/ui`.

| Folder                 | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `components/atoms`     | smallest building blocks                                         |
| `components/molecules` | badges, dropdowns, pagination, date stamps …                     |
| `components/organisms` | batch select, editable rows, nav, login modal, toaster           |
| `components/analytics` | KPIs, bar chart, table                                           |
| `components/filtering` | filter bar + groups                                              |
| `components/workspace` | list/side-panel layout and `ResourceListView` for resource pages |
