| Dependency             | Purpose                        | Used In                                  |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| **Node.js**            | Main backend runtime           | All backend modules                      |
| **Express.js**         | API framework                  | Workflow CRUD, Auth, Execution endpoints |
| **MongoDB (Mongoose)** | Database                       | Users, Workflows, Executions, Analytics  |
| **JWT**                | Authentication tokens          | Auth, Admin                              |
| **bcrypt**             | Password hashing               | User Authentication                      |
| **axios/fetch**        | API requests to AI providers   | AI Adapter                               |
| **React Flow**         | Visual graph editor            | Frontend UI                              |
| **Tailwind**           | Styling                        | Frontend                                 |
| **math.js**            | Safe math expression evaluator | Math Cube                                |
| **S3 SDK / fs**        | File saving                    | Saver Cubes                              |
| **WebSocket / SSE**    | Real-time terminal updates     | Terminal Log Streamer                    |
| **dotenv**             | Config management              | API keys                                 |
| **Sentry (optional)**  | Error monitoring               | Error Handler                            |
