# 🧩 Smart Cubes — MVP Dependency & Priority Map

### 📘 Priority Convention

| Priority | Meaning                                                                   |
| -------- | ------------------------------------------------------------------------- |
| **1**    | Independent utility — no internal dependencies. Generate first.           |
| **2**    | Basic modules depending only on Priority 1 utilities.                     |
| **3**    | Mid-level managers using Priorities 1–2 (e.g., scheduler, cube executor). |
| **4**    | High-level orchestrators / workflow-level logic.                          |
| **5**    | Frontend, analytics, and streaming interfaces.                            |

---

## 🧱 Hierarchical Dependency Tree

---

### 🟩 **Priority 1 – Core Utilities (no internal dependencies)**

| # | Module                       | Depends On      | Description                                                     |
| - | ---------------------------- | --------------- | --------------------------------------------------------------- |
| 1 | **Data Type Validator**      | none            | Validates data type compatibility between cubes.                |
| 2 | **Output Formatter**         | none            | Converts raw cube/AI outputs into standardized internal format. |
| 3 | **Loop Controller**          | none            | Enforces loop iteration limits.                                 |
| 4 | **Token Manager**            | JWT             | Handles JWT generation and verification.                        |
| 5 | **Anonymization Middleware** | regex/tokenizer | Sanitizes inputs before AI calls.                               |
| 6 | **AI Timeout Watchdog**      | Node timer      | Aborts AI requests exceeding timeout threshold.                 |

---

### 🟨 **Priority 2 – Low-level Operational Modules**

| #  | Module                        | Depends On                                           | Description                                   |
| -- | ----------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| 7  | **Error Handler**             | MongoDB, Output Formatter                            | Centralized error logging + workflow halting. |
| 8  | **Analytics Logger**          | MongoDB                                              | Records workflow events and system usage.     |
| 9  | **Access Control Middleware** | Token Manager                                        | Authorizes admin/user access by JWT role.     |
| 10 | **Auth Module**               | Token Manager, bcrypt, MongoDB                       | Handles registration/login, returns JWT.      |
| 11 | **Admin Management Module**   | Auth Module, Access Control, MongoDB                 | Performs password reset or user deletion.     |
| 12 | **AI Adapter**                | Anonymization Middleware, AI Timeout Watchdog, axios | Sends prompt to AI provider, handles errors.  |

---

### 🟦 **Priority 3 – Cube Handlers (Core Runtime Components)**

| #  | Module                | Depends On                                         | Description                        |
| -- | --------------------- | -------------------------------------------------- | ---------------------------------- |
| 13 | **Loader Cubes**      | Data Type Validator, Output Formatter              | Input sources (text/json/image).   |
| 14 | **Recognition Cubes** | AI Adapter, Output Formatter                       | Image and audio recognition cubes. |
| 15 | **Math Cube**         | math.js                                            | Local math evaluation.             |
| 16 | **Decider Cube**      | Data Type Validator, Output Formatter              | Conditional branching cube.        |
| 17 | **Text Cube**         | AI Adapter, Output Formatter                       | AI text generation.                |
| 18 | **Image Cube**        | AI Adapter, Output Formatter                       | AI image generation.               |
| 19 | **Saver Cubes**       | fs / S3 SDK, Data Type Validator, Output Formatter | Persist outputs to disk/storage.   |

---

### 🟧 **Priority 4 – Runtime Orchestration & Workflow Logic**

| #  | Module                   | Depends On                                                       | Description                                                              |
| -- | ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 20 | **Cube Executor**        | All Cube Handlers (13–19), Data Type Validator, Output Formatter | Routes execution to correct cube type, handles I/O flow.                 |
| 21 | **Scheduler**            | Cube Executor, Loop Controller, Error Handler, Analytics Logger  | Executes cubes sequentially, handles loop iterations and halts on error. |
| 22 | **Execution Manager**    | Scheduler, MongoDB, Analytics Logger                             | Starts, tracks, and finalizes workflow execution.                        |
| 23 | **Workflow Validator**   | Data Type Validator, Loop Controller                             | Checks workflow correctness before execution.                            |
| 24 | **Workflow CRUD Module** | MongoDB, Workflow Validator                                      | Create/read/update/delete workflow records.                              |

---

### 🟥 **Priority 5 – System Integration & Interface Modules**

| #  | Module                               | Depends On                                        | Description                                                  |
| -- | ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| 25 | **Terminal Log Streamer**            | Execution Manager, Scheduler                      | Streams real-time logs to frontend terminal (WebSocket/SSE). |
| 26 | **Analytics Dashboard (Frontend)**   | Analytics Logger API                              | Displays user/system metrics (optional MVP+).                |
| 27 | **Frontend Workflow Editor (React)** | Workflow CRUD API, Execution API, Terminal Stream | User-facing drag-and-drop builder.                           |

---

## 🧩 Summary — Priority Order for Generation

| Priority | Module Name               | Depends On                                                      |
| -------- | ------------------------- | --------------------------------------------------------------- |
| **1**    | Data Type Validator       | —                                                               |
| **1**    | Output Formatter          | —                                                               |
| **1**    | Loop Controller           | —                                                               |
| **1**    | Token Manager             | JWT                                                             |
| **1**    | Anonymization Middleware  | regex/tokenizer                                                 |
| **1**    | AI Timeout Watchdog       | Node Timer                                                      |
| **2**    | Error Handler             | Output Formatter, MongoDB                                       |
| **2**    | Analytics Logger          | MongoDB                                                         |
| **2**    | Access Control Middleware | Token Manager                                                   |
| **2**    | Auth Module               | Token Manager, MongoDB                                          |
| **2**    | Admin Management Module   | Auth Module, Access Control                                     |
| **2**    | AI Adapter                | Anonymization Middleware, AI Timeout Watchdog                   |
| **3**    | Loader Cubes              | Data Type Validator, Output Formatter                           |
| **3**    | Recognition Cubes         | AI Adapter, Output Formatter                                    |
| **3**    | Math Cube                 | math.js                                                         |
| **3**    | Decider Cube              | Data Type Validator, Output Formatter                           |
| **3**    | Text Cube                 | AI Adapter, Output Formatter                                    |
| **3**    | Image Cube                | AI Adapter, Output Formatter                                    |
| **3**    | Saver Cubes               | fs/S3, Data Type Validator, Output Formatter                    |
| **4**    | Cube Executor             | All Cubes (13–19)                                               |
| **4**    | Scheduler                 | Cube Executor, Loop Controller, Error Handler, Analytics Logger |
| **4**    | Execution Manager         | Scheduler, Analytics Logger                                     |
| **4**    | Workflow Validator        | Data Type Validator, Loop Controller                            |
| **4**    | Workflow CRUD Module      | Workflow Validator, MongoDB                                     |
| **5**    | Terminal Log Streamer     | Scheduler, Execution Manager                                    |
| **5**    | Analytics Dashboard       | Analytics Logger                                                |
| **5**    | Frontend Workflow Editor  | Workflow CRUD, Execution Manager, Terminal Stream               |
