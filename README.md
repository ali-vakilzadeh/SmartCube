
# 🧠 Smart Cubes

**Smart Cubes** is a **natural-language programming IDE** that allows anyone — even with zero coding knowledge — to build functional programs and AI-powered workflows through plain English and a visual flowchart interface.

Users create **“cubes”** (logic blocks) that represent actions such as loading data, analyzing text, performing math, or generating images.  
Each cube executes through an AI engine, and outputs are piped between cubes to form complete workflows — all without writing a single line of code.

---

## 🚀 Project Vision

> “If you can describe it, you can build it.”

Smart Cubes bridges human thought and machine execution.  
It transforms natural-language prompts into structured, executable workflows — democratizing AI automation.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18, React Flow, TailwindCSS |
| **Backend** | Node.js 18+, Express, MongoDB |
| **AI Layer** | External APIs (OpenRouter / Azure / Google AI) → Local LLM (Ollama / GPT4All) in production |
| **Utilities** | JWT Auth, bcrypt, math.js, S3 SDK, WebSocket/SSE |
| **Language** | JavaScript (ES6+) / TypeScript-ready |
| **Infra** | Docker, dotenv, GitHub Actions, optional Sentry monitoring |

---

## 🧩 System Overview

```

User → Frontend Workflow Editor
│
▼
Execution Manager
│
┌────┴───────────┐
│   Scheduler    │──→ Cube Executor → Cube Handlers
│ (in-memory)    │       │
│                │       ├─ AI Cubes (Text/Image)
│                │       ├─ Loader / Saver Cubes
│                │       └─ Math / Decider Cubes
└────┬───────────┘
▼
Analytics & Logs

```

Workflows run entirely in-memory for MVP (single-process scheduler).  
Each cube = one AI call → output piped to next cube.  
No data is persisted unless a *Saver Cube* is used.

---

## 🧱 Core Modules

| Category | Module | Purpose |
|-----------|---------|---------|
| **Core Utilities** | `data_type_validator`, `output_formatter`, `loop_controller` | Foundational helpers for data and flow control |
| **Infrastructure** | `auth_module`, `ai_adapter`, `analytics_logger`, `error_handler` | Authentication, AI I/O, and system logging |
| **Cube Library** | Loader / Saver / Text / Image / Math / Decider / Recognition | Executable logic nodes |
| **Runtime** | `cube_executor`, `scheduler`, `execution_manager` | Workflow orchestration engine |
| **Frontend** | Workflow Editor, Terminal Streamer, Analytics Dashboard | User-facing IDE and feedback layer |

---

## ⚙️ Key Features (MVP)

- 🧩 **Drag-and-Drop Workflow Canvas** — visually connect logic blocks  
- 💬 **Natural-Language Cube Prompts** — no coding required  
- 🪄 **AI Integration Layer** — pluggable OpenRouter / Google / Azure APIs  
- 🔁 **Loop & Flow Control** — limited loop iteration for safety  
- 🧠 **Anonymization Middleware** — cleans data before AI requests  
- 💾 **Explicit Saving** — data saved only through Saver Cubes  
- 📊 **Analytics Logging** — captures user behavior & execution metrics  
- 🔒 **Secure & GDPR-Compliant** — tokenized data, admin-only RBAC  

---

## 🗂 Repository Structure

```

smart-cubes/
│
├── backend/
│   ├── modules/
│   │   ├── auth.js
│   │   ├── aiAdapter.js
│   │   ├── scheduler.js
│   │   ├── cubeExecutor.js
│   │   ├── executionManager.js
│   │   └── ...
│   ├── cubes/
│   │   ├── loaderCubes.js
│   │   ├── textCube.js
│   │   ├── saverCubes.js
│   │   └── ...
│   ├── middleware/
│   ├── utils/
│   └── routes/
│
├── frontend/
│   ├── pages/
│   │   ├── workflowEditor.jsx
│   │   └── ...
│   ├── modules/
│   │   └── analyticsDashboard.js
│   └── styles/
│
├── config/
│   ├── .env.example
│   ├── docker-compose.yml
│   └── package.json
│
└── README.md

````

---

## 🧩 Execution Flow Summary

1. **User builds workflow** on the visual editor.  
2. **Frontend sends workflow JSON** to backend.  
3. **Execution Manager** initializes run.  
4. **Scheduler** executes cubes sequentially (loop max = 2).  
5. Each cube’s **AI Adapter** performs its task.  
6. **Outputs** stream live to the **terminal viewer**.  
7. **Analytics Logger** saves event metadata to MongoDB.  

---

## 🧠 Cube Types (MVP)

| Type | Description | Example Output |
|-------|--------------|----------------|
| **Loader Cube** | Loads text/image/json into workflow | JSON / Text blob |
| **Text Cube** | AI text generator | “Generated summary…” |
| **Image Cube** | AI image generator | Image URL / Blob |
| **Math Cube** | Local math operations | `42` |
| **Decider Cube** | Branching logic based on condition | `true` / `false` |
| **Recognition Cube** | Image/audio recognition | Structured text |
| **Saver Cube** | Writes output to disk/S3 | File path |

---

## 🧩 Security & Compliance

- HTTPS-only API  
- JWT authentication (stateless)  
- Role-based admin access  
- Data anonymization before AI calls  
- GDPR-compliant data deletion endpoints  

---

## 📈 Analytics & Logging

- **Event Logging**: workflow start/stop, node execution  
- **Error Tracking**: runtime exceptions, AI timeouts  
- **Usage Metrics**: cube frequency, execution times  
- **Optional Integration**: Sentry / Grafana  

---

## 🔧 Setup & Run

### 1️⃣ Clone
```bash
git clone https://github.com/<your-org>/smart-cubes.git
cd smart-cubes
````

### 2️⃣ Configure

```bash
cp config/.env.example .env
# Fill in AI keys, Mongo URI, etc.
```

### 3️⃣ Install

```bash
npm install
```

### 4️⃣ Run Development Servers

```bash
npm run dev          # frontend + backend (concurrently)
```

### 5️⃣ Access

Visit: `http://localhost:3000` → Open **Smart Cubes IDE**

---

## 🧪 Testing

```bash
npm test             # unit tests
npm run lint         # lint and style checks
```

---

## 📜 Roadmap

* ✅ MVP with natural-language cube workflows
* 🔄 Local LLM integration (Ollama/GPT4All)
* 🌐 Multi-user sharing and collaboration
* 🖼️ Multimedia cube expansion (voice/video editing)
* 🧩 Plugin SDK for third-party cubes
* 🧠 RAG-based learning memory

---

## 👥 Contributing

Contributions are welcome!
Please:

1. Fork the repository
2. Create a feature branch (`feature/my-enhancement`)
3. Submit a PR with clear description

Use our [extended JSON spec](./docs/dependency_map.json) to follow module dependencies.

---

## 🧾 License

**MIT License** — free to use, modify, and distribute.
See [LICENSE](./LICENSE) for details.

---

## 🧭 Author & Maintainers

**Smart Cubes Core Team**
📧 [info@smartcubes.ai](mailto:info@smartcubes.ai)
🌐 [https://smartcubes.ai](https://smartcubes.ai)

---

### 💡 “Programming should feel like thinking — Smart Cubes makes it that simple.”

```
