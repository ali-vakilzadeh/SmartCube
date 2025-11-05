# Smart Cubes — MVP Technical Specification

---

# 1 — High-level summary (MVP behavior)

* Users build **flowcharts** of **Smart Cubes** (visual nodes).
* Execution model: **queued, in-memory sequential scheduler**. Cubes run in strict order (1→2→3...). Loops allowed but **max 2 loop iterations** (hard limit in MVP).
* Each cube execution = **one AI API call** (single prompt → single response) except loader/recognizer/math cubes which are local operations.
* **Data lives in memory only** across cubes. Only explicit *Saver Cubes* write data (to persistent storage).
* **Ambiguity/error/AI timeout** halts the workflow with an error message; **no retries** in MVP.
* Admin RBAC limited to system admin operations.
* AI for MVP uses external providers (keys in `.env`). Production plan: local LLM (Ollama/GPT4All) later.
* Analytics & logs collected (user behavior + system errors + timestamps).
* Starter template: **Input → AI → Output**; no wizard for MVP.

---

# 2 — Tech stack (recommended, minimal coding effort)

**Frontend**

* React 18 (TypeScript recommended)
* React Flow (or similar) for node-editor/graph UI (gives Blueprint-style experience)
* Tailwind (or plain CSS) for styling

**Backend**

* Node.js (v18+) + Express (or Fastify)
* In-memory scheduler (custom, within Node process)
* MongoDB for persistence (user/workflow/analytics). **Reason:** schema-flexible, minimal setup and minimal coding to store JSON-like cube configs and logs.

  * Use a managed MongoDB (Mongo Atlas) for convenience.
* Optional: Redis not required because you want in-memory single-process queue in MVP.

**AI connectors**

* Abstraction layer that can call OpenRouter / Google Cloud AI / Azure; selected via `.env` keys.
* Middleware for anonymization/tokenization per cube before outbound call.

**Storage (savers)**

* For saved files: S3-compatible storage (AWS S3 / DigitalOcean Spaces) or local filesystem for initial prototyping.

**Monitoring & Analytics**

* Simple ELK-like: logs to Mongo + optional integration to Sentry for errors.
* Basic dashboards (Grafana or simple front-end pages querying Mongo).

**Dev / Infra**

* Docker for local dev images
* Deploy to a single Node instance for MVP (Heroku, Render, or a small AWS EC2).
* CI: GitHub Actions

---

# 3 — Core components & responsibilities

## Frontend

* Graph canvas using React Flow:

  * Node types for each cube (loader, AI, decider, saver, etc.)
  * Connectors and labels for inputs/outputs
  * Play / Stop controls
  * Terminal window showing live logs + AI outputs

* Editor panels:

  * Cube property editor (task prompt, input mapping, limits)
  * Workflow settings (max loops, account tier limits visible)

## Backend

* **Auth & User management**

  * Basic username/password login (JWT), admin user role for system actions.
* **Workflow API**

  * CRUD endpoints for workflows (save, load, delete)
  * Start/stop execution endpoint
* **Execution Engine (in-memory scheduler)**

  * Accept workflow run request, create in-memory run instance
  * Sequentially execute nodes, honoring loop limits and per-account cube limits
  * Halt on any cube error or AI timeout, return error to frontend
* **AI Adapter**

  * Per-cube anonymize/tokenize middleware
  * Provider switcher (reads `.env` keys)
* **Savers**

  * Handlers to write outputs to storage if Saver Cube encountered
* **Analytics & Logs**

  * Insert execution events and user-behavior events to Mongo

---

# 4 — MVP cube types (data + behavior)

Each cube has:

* `id`, `type`, `inputs[]`, `outputs[]`, `taskPrompt` (for AI cubes), `config`, `limit` (optional)

**Loader cubes**

* `json_loader`, `text_loader`, `image_loader` — take user input (or upload) and push into pipeline.

**Recognition / Transform**

* `seeing_cube` — image recognition; returns structured description/text.
* `hearing_cube` — voice→text transcription.
* `math_cube` — accepts numeric inputs / expressions, returns numeric output.

**AI generation**

* `text_cube` — sends `taskPrompt` + mapped inputs to AI provider; returns text.
* `image_cube` — sends prompt to image-generation model; returns image object (blocked until response).

**Control**

* `decider_cube` — inspects input and returns a branch decision (can be implemented as a simple evaluator or an AI call; in MVP treat it as a lightweight local rule or AI call).

**Saver**

* `text_saver`, `image_saver`, `table_saver`, `json_saver` — persist outputs to storage (S3 or local FS). If incompatible type provided, **purge** and error.

---

# 5 — Data model examples (Mongo collections)

**users**

```json
{
  "_id": "...",
  "email": "...",
  "passwordHash": "...",
  "tier": "basic|pro|max",
  "createdAt": "...",
  "settings": {}
}
```

**workflows**

```json
{
  "_id": "...",
  "ownerUserId": "...",
  "name": "My workflow",
  "nodes": [ /* node objects with id/type/config */ ],
  "connections": [ /* fromNodeId.output -> toNodeId.input */ ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

**executions**

```json
{
  "_id":"...",
  "workflowId":"...",
  "ownerUserId":"...",
  "status":"running|failed|completed",
  "startTime":"...",
  "endTime":"...",
  "events":[
     {"time":"...","nodeId":"...","type":"input|output|system","payload":{...}}
  ]
}
```

**analytics**

```json
{
  "_id":"...",
  "userId":"...",
  "eventType":"workflow_started|node_executed|error",
  "meta": {...},
  "timestamp":"..."
}
```

---

# 6 — Execution flow (detailed)

1. Frontend: user presses **Play** on a workflow.
2. Backend: create `execution` document (status `running`), instantiate in-memory run object. Validate user tier limits (max nodes, loops permitted).
3. Scheduler picks first node and executes:

   * For **loader / local** cubes: run local handler and produce output.
   * For **AI cubes**:

     * Anonymize/tokenize inputs (per-cube middleware).
     * Format request: `{ prompt: taskPrompt, inputs: mappedInputs }`.
     * Send to configured provider (one API call).
     * On response, return output to in-memory runtime.
4. Log all events to `executions.events` and `analytics`.
5. If node produces output, pass to connected nodes. If incompatible type is passed to saver, purge and generate an error.
6. If any node returns an **error** (including AI timeout), set `execution.status = failed`, log error, stop run, notify frontend.
7. If execution completes all nodes, set `execution.status = completed`, store final outputs if saver nodes used.

**Loop handling:** when connection forms a loop, scheduler decrements allowed loop counter on enter; stop scheduling loop once limit reached.

---

# 7 — Security & Privacy

* Store AI provider keys in server `.env` (not in DB). Each environment (dev/prod) has own keys.
* Per-cube anonymization middleware strips PII/tokenizes data before outbound call.
* HTTPS-only; secure cookies/JWT.
* GDPR: data subject deletion — implement endpoint to delete user data + workflows + logs.
* Admin role limited to password reset and account deletion.
* Saver cubes: explicit user action to persist data (opt-in).

---

# 8 — Analytics, logging and retention

* Log every node execution event (timestamp, nodeId, duration, status, anonymized input summary, output summary) into `executions.events`.
* Keep detailed logs for N days (configurable; e.g., 90 days) then aggregate/trim.
* Track user behavior: workflow creation, node types used, run frequency. Use for product decisions.
* Errors: send critical errors to Sentry (optional) and store stack/metadata in Mongo.

---

# 9 — Limits & operational constraints (MVP)

* Max nodes/workflow = **20** for all accounts in MVP (even pro/max are limited to 20 now).
* Max loop iterations per run = **2**.
* No retries on failure; workflow halts on first error.
* Execution is single-process; concurrent runs from many users may be queued—expect long waits; recommend workers scaling later.
* No versioning, no sharing, no plugins, no templates beyond starter template.

---

# 10 — Suggested MVP milestones (implementation roadmap)

**Sprint 1 (2–3 weeks)**

* Project scaffolding (repo, docker, CI)
* Auth + user model + admin console (basic)
* Mongo integration + schema
* Simple frontend shell with React Flow canvas skeleton

**Sprint 2 (3–4 weeks)**

* Implement node types: text_loader, text_cube (AI stub), text_saver
* In-memory scheduler & execution flow for linear pipelines (no loops)
* Terminal logs streaming to frontend
* Basic analytics logging

**Sprint 3 (3–4 weeks)**

* Add remaining cube types (json, image loader, decider, math, seeing/hearing stubs)
* Loop support & loop limit enforcement
* Anonymize/tokenize middleware and AI provider adapter
* S3/local saver implementation

**Sprint 4 (2–3 weeks)**

* QA, integrations with one AI provider, admin functions, GDPR delete flow
* Basic monitoring + Sentry + dashboard
* Documentation + starter workflow template

---

# 11 — Acceptance criteria (MVP)

* Users can create and save a workflow (with up to 20 nodes).
* Users can start a run and see live logs and AI outputs in the terminal.
* Any node error halts the run and is visible in the terminal.
* Saver cubes correctly persist outputs (to storage).
* Analytics events recorded for all runs and major user actions.
* Admin can reset password and delete accounts.
* Data sent to AI providers is anonymized/tokenized.

---

# 12 — Minimal remaining decisions (please confirm)

1. **Authentication method** — implement simple email/password + JWT. Confirm?
2. **Hosting for MVP** — prefer Render / Heroku / DigitalOcean App Platform (one instance) or do you want AWS EC2? (I recommend Render/Render-like for speed).
3. **Saved file store** — local filesystem for dev, S3-compatible for prod? (Recommend S3).
4. **Log retention** — keep detailed logs for **90 days** then aggregate; OK?
5. **Sentry** — do you want Sentry (or similar) hooked for error tracking in MVP? (recommended)
6. **Acceptable wait times** — users may wait for minutes/hours. Do we want to show queue position to users in MVP (simple ordinal position) or not?

If you confirm these, I’ll produce:

* a single-page **technical spec** ready for engineers (detailed endpoints, DB schema sample, run lifecycle pseudocode), and
* a **task breakdown** with estimates per sprint (developer-days) suitable for planning.

Would you like me to produce that now?
