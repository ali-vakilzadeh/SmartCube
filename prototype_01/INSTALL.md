# SmartCube Installation Guide

## Overview
SmartCube is a visual workflow builder for creating AI-powered automation workflows using drag-and-drop "Smart Cubes" (nodes).

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (local or cloud instance)
- **npm** or **yarn**: Latest version
- **AI Provider API Keys**: At least one of:
  - OpenRouter API Key
  - Azure OpenAI credentials
  - Google Cloud AI credentials

## Installation Steps

### 1. Clone or Extract the Project

```bash
# If from ZIP
unzip SmartCubemain.zip
cd SmartCubemain

# If from Git
git clone <repository-url>
cd smartcube
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16 (React 19)
- MongoDB driver & Mongoose
- React Flow (workflow editor)
- Authentication libraries (JWT, bcryptjs)
- AI SDK dependencies
- UI components (shadcn/ui)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smartcube
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcube

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AI Provider Configuration (choose at least one)

# Option 1: OpenRouter (recommended for multiple models)
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-api-key

# Option 2: Azure OpenAI
# AI_PROVIDER=azure
# AZURE_OPENAI_API_KEY=your-azure-key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
# AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Option 3: Google Cloud AI
# AI_PROVIDER=google
# GOOGLE_AI_API_KEY=your-google-api-key

# Storage Configuration (for Saver Cubes)
STORAGE_PATH=./storage
# Or use S3-compatible storage:
# S3_BUCKET=your-bucket-name
# S3_REGION=us-east-1
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env.local`

### 5. Create Storage Directory

```bash
mkdir -p storage
```

This directory will store outputs from Saver Cubes (text files, images, CSVs, JSON).

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Create Your First User

1. Navigate to `http://localhost:3000/register`
2. Create an account with email and password
3. Login at `http://localhost:3000/login`
4. You'll be redirected to the dashboard

## Project Structure

```
smartcube/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── workflows/       # Workflow CRUD
│   │   ├── executions/      # Execution management
│   │   └── admin/           # Admin endpoints
│   ├── editor/              # Workflow editor page
│   ├── dashboard/           # User dashboard
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── workflow/            # Workflow-specific components
├── lib/                     # Core libraries
│   ├── cubes/              # Cube implementations
│   ├── engine/             # Workflow execution engine
│   ├── models/             # MongoDB models
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   ├── hooks/              # React hooks
│   └── types/              # TypeScript types
├── tests/                   # Test files
├── docs/                    # Documentation
└── storage/                 # Output storage
```

## Usage Guide

### Creating a Workflow

1. **Go to Dashboard**: Navigate to `/dashboard`
2. **Create New Workflow**: Click "New Workflow"
3. **Drag Cubes**: Drag cubes from the left palette to the canvas
4. **Connect Cubes**: Click and drag from one cube's output to another's input
5. **Configure Cubes**: Click a cube to configure its properties
6. **Save**: Click "Save" in the toolbar
7. **Execute**: Click "Play" to run the workflow

### Available Cube Types

#### Loaders
- **Text Loader**: Initialize with text data
- **JSON Loader**: Initialize with JSON data
- **Image Loader**: Initialize with image URL/path

#### Recognition
- **Seeing**: OCR and image analysis using AI
- **Hearing**: Speech-to-text conversion

#### Processing
- **Math**: Evaluate mathematical expressions
- **Decider**: Conditional branching (if/else logic)

#### Generation
- **Text AI**: Generate text using AI models
- **Image AI**: Generate images using AI models

#### Savers
- **Text Saver**: Save text to file
- **Image Saver**: Save image to file
- **Table Saver**: Save table data as CSV
- **JSON Saver**: Save JSON to file

### Workflow Execution

Workflows execute **sequentially** with these rules:
- Cubes run one at a time in order
- Maximum 2 loop iterations enforced
- Real-time logs stream to terminal
- Execution can be stopped at any time

## Testing

Run the test suite:

```bash
npm test
```

Run specific test files:

```bash
npm test -- tests/utils.test.ts
npm test -- tests/cubes.test.ts
npm test -- tests/engine.test.ts
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Check connection string format
# Should be: mongodb://localhost:27017/smartcube
# Or: mongodb+srv://user:pass@cluster.mongodb.net/smartcube
```

### AI Provider Errors

- Verify API keys are correct in `.env.local`
- Check API key has sufficient credits/quota
- Ensure `AI_PROVIDER` matches your configured provider

### Port Already in Use

```bash
# Change port in .env.local
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Storage Permission Issues

```bash
# Ensure storage directory has write permissions
chmod 755 storage
```

## Production Deployment

### Environment Variables

Set all production environment variables:
- Use strong `JWT_SECRET` (32+ characters)
- Use MongoDB Atlas or managed MongoDB
- Set `NODE_ENV=production`
- Configure proper CORS settings
- Use HTTPS for all endpoints

### Build for Production

```bash
npm run build
npm start
```

### Recommended Hosting

- **Vercel**: Automatic Next.js deployment
- **AWS**: EC2 + MongoDB Atlas
- **DigitalOcean**: App Platform + Managed MongoDB
- **Railway**: Full-stack deployment

## Security Considerations

1. **Never commit `.env.local`** to version control
2. **Use strong JWT secrets** (32+ random characters)
3. **Enable MongoDB authentication** in production
4. **Implement rate limiting** for API endpoints
5. **Validate all user inputs** (already implemented)
6. **Use HTTPS** in production
7. **Regularly update dependencies**

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review error logs in the terminal
3. Check MongoDB logs for database issues
4. Verify environment variables are set correctly

## License

[Your License Here]
