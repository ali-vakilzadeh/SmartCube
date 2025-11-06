# SmartCube - Visual AI Workflow Builder

SmartCube is a powerful visual workflow builder that enables users to create AI-powered automation workflows using drag-and-drop "Smart Cubes" (nodes). Build complex workflows with sequential execution, AI integration, and real-time monitoring.

## Features

- **Visual Workflow Editor**: Drag-and-drop interface powered by React Flow
- **Smart Cubes**: Pre-built nodes for loading, processing, AI generation, and saving data
- **Sequential Execution**: Strict sequential processing with 2-iteration loop limit
- **AI Integration**: Support for OpenRouter, Azure OpenAI, and Google Cloud AI
- **Real-time Monitoring**: Live execution logs via Server-Sent Events
- **User Authentication**: Secure JWT-based authentication system
- **MongoDB Storage**: Persistent workflow and execution storage

## Quick Start

\`\`\`bash
> Install dependencies

npm install

> Configure environment

cp .env.example .env.local

> Edit .env.local with your MongoDB URI and AI provider credentials

> Run development server

npm run dev

> Open http://localhost:3000

\`\`\`

## Documentation

- **[Installation Guide](INSTALL.md)**: Complete setup instructions
- **[Architecture](docs/SC_module_structure.md)**: System architecture overview
- **[Function List](docs/SC_Function_list.md)**: All available functions
- **[MVP Plan](docs/SC_MVP_plan.md)**: Development roadmap

## Available Cube Types

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

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test -- tests/utils.test.ts
\`\`\`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, React Flow, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI**: OpenRouter/Azure/Google Cloud AI
- **Real-time**: Server-Sent Events (SSE)

## Project Structure

\`\`\`
smartcube/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Core libraries
│   ├── cubes/       # Cube implementations
│   ├── engine/      # Workflow execution engine
│   ├── models/      # Database models
│   ├── services/    # Business logic
│   └── utils/       # Utilities
├── tests/           # Test files
└── docs/            # Documentation
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please check:
1. [Installation Guide](INSTALL.md)
2. Documentation in `/docs`
3. GitHub Issues

---

Built with ❤️ using [V0.dev](https://www.V0.dev) Next.js and React Flow
