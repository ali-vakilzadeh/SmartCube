┌───────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (P5)                               │
│───────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  [Frontend Workflow Editor]  ─────────────┐                               │
│             │                             │                               │
│             ▼                             ▼                               │
│  [Terminal Log Streamer] ←── [Execution Manager] ───→ [Analytics Dashboard]│
│             ▲                             │                               │
│             │                             │                               │
│             └────────────── [Scheduler] ◄─┘                               │
└───────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │ (depends on)
─────────────────────────────────────────────────────────────────────────────
┌───────────────────────────────────────────────────────────────────────────┐
│                      RUNTIME CONTROL & WORKFLOWS (P4)                     │
│───────────────────────────────────────────────────────────────────────────│
│                                                                           │
│ [Workflow CRUD Module] ─────► [Workflow Validator] ─┐                     │
│                                                     │                     │
│ [Execution Manager] ──► [Scheduler] ──► [Cube Executor] ─┐                │
│                          │              │                │                │
│                          ▼              ▼                ▼                │
│                   [Error Handler]   [Analytics Logger]   │                │
│                                                         │                │
│                       (Executes)                        │                │
│                                                         ▼                │
│             ┌───────────────────────────────────────────────┐            │
│             │                 CUBE LIBRARY (P3)              │            │
│             └───────────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │ (depends on)
─────────────────────────────────────────────────────────────────────────────
┌───────────────────────────────────────────────────────────────────────────┐
│                            CUBE LIBRARY (P3)                              │
│───────────────────────────────────────────────────────────────────────────│
│                                                                           │
│ [Loader Cubes] ───────┐                                                   │
│ [Recognition Cubes] ──┤                                                   │
│ [Math Cube] ──────────┤──► [Cube Executor] (via Scheduler)                │
│ [Decider Cube] ───────┤                                                   │
│ [Text Cube] ──────────┤──► [AI Adapter]                                   │
│ [Image Cube] ─────────┤                                                   │
│ [Saver Cubes] ────────┘                                                   │
│                                                                           │
│ All cubes depend on:                                                      │
│   • Data Type Validator                                                   │
│   • Output Formatter                                                      │
│   • (some) AI Adapter, (some) FS/S3 SDK                                   │
└───────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │ (depends on)
─────────────────────────────────────────────────────────────────────────────
┌───────────────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE & AI LAYER (P2)                           │
│───────────────────────────────────────────────────────────────────────────│
│                                                                           │
│ [Auth Module] ───► [Token Manager]                                        │
│ [Admin Management Module] ───► [Access Control Middleware]                │
│ [AI Adapter] ───► [Anonymization Middleware] + [AI Timeout Watchdog]      │
│ [Error Handler] ───► [Output Formatter]                                   │
│ [Analytics Logger] ───► [MongoDB]                                         │
│                                                                           │
│ Provides base services for Scheduler, Cubes, and Execution Manager.       │
└───────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │ (depends on)
─────────────────────────────────────────────────────────────────────────────
┌───────────────────────────────────────────────────────────────────────────┐
│                    CORE UTILITIES (FOUNDATION, P1)                        │
│───────────────────────────────────────────────────────────────────────────│
│                                                                           │
│ [Data Type Validator]                                                     │
│ [Output Formatter]                                                        │
│ [Loop Controller]                                                         │
│ [Token Manager] (JWT)                                                     │
│ [Anonymization Middleware] (Regex/Tokenizer)                              │
│ [AI Timeout Watchdog] (Node Timers)                                       │
│                                                                           │
│ These are pure functions or stateless helpers used by all upper layers.   │
└───────────────────────────────────────────────────────────────────────────┘
