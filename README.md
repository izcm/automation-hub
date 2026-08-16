# Resource Maintenance Modules

A minimal demonstration of how a vehicle maintenance workflow can be simplified and automated.

This example focuses on EU inspections: keeping track of upcoming deadlines and notifying the right people when action is needed.

The demo intentionally contains no third-party integrations. In a real implementation, modules like these can connect to existing fleet, ERP, accounting, or other business systems — using the data and workflows your company already has rather than replacing them.

<!-- TODO: one screenshot -->

## Getting started

```bash
npm install

# .env.local
#   MONGODB_URI=...           (required)
#   DB_NAME=miniapp_db        (optional, defaults to miniapp_db)
#   SEED_EMAIL=you@example.com (for seed:users)

npm run seed            # seed vehicles
npm run seed:users -- you@example.com   # seed 4 users (all → this inbox)

npm run dev             # http://localhost:3000
```

## Tech stack

- **Next.js** (app router) — note: a customized build, see `AGENTS.md`
- **MongoDB** (`@a2zb/mongo` helpers)
- **React Query** for client mutations/queries
- **Tailwind v4** + `@a2zb/styles` design system
- **Zod** for request validation

## Project structure

```
app/            routes + API route handlers
components/      UI — atoms / molecules / organisms (+ barrels)
features/        feature-scoped UI + hooks (VehiclesView, notifications, …)
server/          backend
  <domain>/       port.ts (interface) + actions.ts (business logic)
  mongo/<domain>/ repository.ts (adapter) + *-doc.ts (persistence shape)
  di/             wires repos + adapters into actions
lib/            shared client/server utils (http, cn, toast)
types/          domain entities — the shared contract
scripts/        seeds
notes/          working design notes (not the source of truth)
```

## Architecture

### Ports & adapters (hexagonal)

Each domain model is the same five shapes:

| shape            | lives in                         | knows about               |
| ---------------- | -------------------------------- | ------------------------- |
| entity           | `types/<x>.ts`                   | nothing (shared contract) |
| port (interface) | `server/<x>/port.ts`             | the entity                |
| actions (logic)  | `server/<x>/actions.ts`          | the port, other ports     |
| repo (adapter)   | `server/mongo/<x>/repository.ts` | Mongo + the port          |
| doc (row shape)  | `server/mongo/<x>/*-doc.ts`      | Mongo                     |

Actions depend on **ports**, never on repos. `server/di` is the only place
ports meet concrete Mongo adapters — swap the DB by changing DI, nothing else.

### Adding a new domain model

1. `types/<x>.ts` — the entity
2. `server/<x>/port.ts` — the interface
3. `server/mongo/<x>/{repository,*-doc}.ts` — the Mongo adapter
4. add the collection in `server/mongo/collections.ts`
5. wire it in `server/di`

<!-- TODO: link a real example commit -->

## Data model

- `vehicles` — the fleet; `maintenanceResponsibleId` references a user
- `users` — `{ id, email }`
- `notifications` — one per recipient per send; `queued → sent | failed`
- `controlNotifications` — junction: `{ vehicleId, controlDate, notificationId }`
  (report "how many notified per vehicle per control")

## Architecture decisions

Running log — append as we decide things. Format: decision + why.

### 1. Client sends identifiers; the server resolves authoritative data

The client posts `{ vehicleIds }` only — never `userId`, `email`, or `euDate`.
The server looks those up from the vehicle row.
**Why:** trust boundary (client input is attacker-controllable — letting it pick
recipients is a hole), freshness (server value can't be stale), and single
source of truth (derived data stays consistent with the vehicle record).

### 2. Notifications are decoupled from vehicles

`ingestNotificationRequests` takes `userIds`, not `vehicleIds`. Vehicles are the
_incidental_ reason; the recipient (a user) is _intrinsic_.
**Why:** coupling to the reason (vehicle) would re-tie the domain every time a new
trigger appears. Coupling to the recipient (user) is honest and reusable. The
vehicle↔notification link lives in the `controlNotifications` junction instead.

### 3. `Result` at the core, `throw` at the React-Query boundary

Helpers/actions return `Result` (explicit, typed). The one place that throws is
inside a `mutationFn`, because React Query signals failure by throwing.
**Why:** libraries return values; the app decides where to throw. Keeps the core
explicit while giving React Query the error contract it expects.

### 4. Domain types live in neutral `types/`, not `server/`

`Vehicle`, `User`, `Notification` are a contract shared by client and server.
**Why:** they're not server code. A neutral location removes the "client imports
from server" hazard without a re-export layer. Persistence-only shapes (`*Doc`,
`WithTimestamps`) stay in `server/mongo`.

### 5. Junction/link data gets a repo, not an actions layer

`controlNotifications` is glue, not behavior.
**Why:** the port/actions ceremony is for models that _do_ things. A pure link
just needs write + read. The write folds into the orchestrator that already has
both vehicle and notification context.

### 6. Domain ids are app-generated UUIDs, not DB-assigned keys

Every domain object gets a UUID generated **before** it's written, used as the
document's `_id`:

```ts
const queued: NewNotification[] = requests.map((req) => ({
  id: crypto.randomUUID(), // assigned here, before saveBatch — not by Mongo
  to: req.to,
  channel: req.channel,
}));

await notifications.saveBatch(queued);
// each request already carries its own id — no need to zip on ids[i]
```

**Why:** correlating a saved row back to its request must not depend on the
database returning rows _in input order_. Mongo's `insertMany` happens to
guarantee that (`insertedIds` is index-keyed), but Postgres `RETURNING`,
MySQL `LAST_INSERT_ID`, and most ORMs give weaker or no such promise. Generating
the id app-side removes the dependency entirely: the id is known up front, travels
_with_ each record, and the `NotificationActions` layer works identically on any
database — no positional `ids[i]` zipping, no ordering assumption to break later.

## Notes

Design scratch lives in `notes/` (e.g. `NOTIF_BACKEND.md`,
`NOTIFICATION_IMPORTANT.md`). These are thinking-in-progress, not authoritative —
promote settled decisions up into "Architecture decisions" above.
