# SmartCube - Visual AI Workflow Builder

SmartCube is a powerful visual workflow builder that enables users to create AI-powered automation workflows using drag-and-drop "Smart Cubes" (nodes). Build complex workflows with sequential execution, AI integration, and real-time monitoring.

## 🚀 Features

- **Visual Workflow Editor**: Drag-and-drop interface powered by React Flow
- **Smart Cubes**: Pre-built nodes for loading, processing, AI generation, and saving data
- **Sequential Execution**: Strict sequential processing with loop control
- **AI Integration**: Support for OpenRouter, Azure OpenAI, and Google Cloud AI
- **Real-time Monitoring**: Live execution logs via Server-Sent Events
- **Supabase Authentication**: Secure email/password authentication with RLS
- **PostgreSQL Storage**: Scalable Supabase PostgreSQL with Row Level Security

## ✨ Vercel Optimized

This project has been fully migrated to use Supabase PostgreSQL and is optimized for deployment on Vercel with:
- Supabase integration for authentication and database
- Server-side and client-side Supabase clients
- Row Level Security (RLS) for data protection
- Middleware for session management
- Next.js 16 with App Router

## 📦 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run SQL scripts to set up database
# In Vercel v0 UI: Scripts will auto-run when you deploy
# Or run manually in Supabase SQL Editor from /scripts folder

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## 🗄️ Database Setup

The project includes SQL scripts in `/scripts` folder:
1. `001_create_users_table.sql` - Users table with auth integration
2. `002_create_workflows_table.sql` - Workflows table
3. `003_create_executions_table.sql` - Execution tracking
4. `004_create_tasks_table.sql` - Task management
5. `005_create_smart_cubes_table.sql` - Reusable cube configs
6. `006_create_analytics_table.sql` - Analytics tracking
7. `007_create_user_trigger.sql` - Auto-create user profiles

All tables include Row Level Security (RLS) policies for secure data access.

## 📚 Documentation

- **[Installation Guide](INSTALL.md)**: Complete setup instructions
- **[Architecture](docs/SC_module_structure.md)**: System architecture overview
- **[Function List](docs/SC_Function_list.md)**: All available functions
- **[MVP Plan](docs/SC_MVP_plan.md)**: Development roadmap

## 🎯 Available Cube Types

### Loaders
- Text Loader, JSON Loader, Image Loader

### Recognition
- Seeing (OCR/Image Analysis), Hearing (Speech-to-Text)

### Processing
- Math (Expression Evaluation), Decider (Conditional Logic)

### Generation
- Text AI (LLM Text Generation), Image AI (Image Generation)

### Savers
- Text Saver, Image Saver, Table Saver (CSV), JSON Saver

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test -- tests/utils.test.ts
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, React Flow, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (Email/Password)
- **AI**: OpenRouter/Azure/Google Cloud AI
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel

## 📁 Project Structure

\`\`\`
smartcube/
├── app/              # Next.js pages and API routes
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # Dashboard page
│   └── api/         # API routes
├── components/       # React components
├── lib/              # Core libraries
│   ├── supabase/    # Supabase clients
│   ├── services/    # Business logic services
│   ├── types/       # TypeScript types
│   └── utils/       # Utilities
├── scripts/         # SQL migration scripts
├── middleware.ts    # Next.js middleware for auth
└── docs/            # Documentation
\`\`\`

## 🔒 Security

- Row Level Security (RLS) on all tables
- Secure session management via middleware
- Password hashing handled by Supabase Auth
- Admin-only routes protected by access control
- Environment variable validation

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add Supabase integration in Vercel project settings
3. Environment variables are automatically configured
4. Deploy!

### Manual Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (for development)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions, please check:
1. [Installation Guide](INSTALL.md)
2. Documentation in `/docs`
3. GitHub Issues

---

Built with ❤️ using Next.js, Supabase, and React Flow
\`\`\`

```ts file="lib/db/mongodb.ts" isDeleted="true"
...deleted...
