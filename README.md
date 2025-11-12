# Morphlex AI

> **The AI Migration Engineer** - Autonomous codebase migrations with semantic understanding and deterministic execution

Morphlex AI is the ultimate AI-powered platform for automating tedious code migrations and cloud provisioning. It fuses the semantic understanding of Google Gemini with the deterministic power of metaprogramming to deliver safe, tested, and complete migrations.

![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Built%20at-Vibe%20Code%20SF-FF6B35?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🎯 Origin

Built at the [Vibe Code: Gemini SF](https://cerebralvalley.ai/e/vibe-code-gemini-sf) hackathon. Originally prototyped in AI Studio following hackathon guidelines, then evolved into a complete platform combining autonomous execution with semantic code understanding.

---

## 🚀 Features

### 🔄 SDK Migration Workflow

#### **Preview Mode** (No VS Code Extension Required)
- 📸 **Screenshot → Code Detection**: Upload a UI screenshot, AI finds the exact source file
- 🔍 **Smart Deprecation Scanning**: Detects deprecated Google SDKs automatically
- 🤖 **AI-Generated Migration Scripts**: Creates safe jscodeshift transformations
- 📋 **Copy & Review**: Download scripts for manual execution

#### **Execution Mode** (VS Code Extension Required)
- ⚡ **Autonomous Execution**: AI plans and executes entire migrations
- 🧪 **Test-Driven Self-Correction**: Automatically fixes failed migrations
- 🌿 **Git Integration**: Creates branches, commits changes
- 📊 **Live Progress Tracking**: Real-time logs streamed to web UI

### ☁️ Cloud Provisioning

- 🔐 **Secure gcloud Scripts**: API keys with domain restrictions built-in
- 📝 **Best Practices Included**: Billing alerts, quotas, security defaults
- 🎯 **Multiple Services**: Google Maps, Auth, Storage, Vision, Firebase

---

## 🎬 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org))
- **pnpm** v8+ (Install: `npm install -g pnpm`)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))
- **VS Code** (Optional, for Execution Mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/morphlex-ai.git
cd morphlex-ai

# Install all dependencies
pnpm install-all

# Configure API keys
cp packages/server/.env.example packages/server/.env
cp packages/hands/.env.example packages/hands/.env

# Edit .env files and add your GEMINI_API_KEY
```

### Running the Application

#### **Preview Mode Only** (Web UI + Backend)

```bash
pnpm dev:preview
```

- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:3001](http://localhost:3001)

#### **Full Execution Mode** (Web UI + Backend + VS Code Extension)

1. **Terminal 1**: Start backend and web UI
   ```bash
   pnpm dev:full
   ```

2. **VS Code**: Open the `morphlex-ai` folder and press `F5` to launch the extension in debug mode

3. **Web UI**: Open [http://localhost:5173](http://localhost:5173)

The UI will automatically detect the VS Code extension and enable Execution Mode.

---

## 📖 Usage Guide

### Mode 1: Preview Mode

**Perfect for: Exploring, learning, generating scripts without execution**

1. **Upload Screenshot**
   - Take a screenshot of any UI component using deprecated SDKs
   - Upload to the Web UI

2. **AI Analyzes & Finds Code**
   - Gemini Vision identifies the component type
   - Searches your codebase for matching files

3. **Detect Deprecations**
   - Click "Scan for Deprecated APIs"
   - View all deprecated SDKs with migration guides

4. **Generate Migration Script**
   - Click "Generate Migration Script"
   - AI creates a safe jscodeshift transformation
   - Copy script and run manually

### Mode 2: Execution Mode

**Perfect for: Production migrations, large codebases, autonomous workflows**

1. **Prerequisites**
   - VS Code extension running (press F5)
   - WebSocket connection established (green indicator)

2. **Upload Screenshot**
   - Same as Preview Mode
   - AI finds exact file in your workspace

3. **Define Migration Goal**
   - Enter natural language goal: *"Migrate to new Google Auth SDK"*
   - AI generates step-by-step execution plan

4. **Execute & Monitor**
   - Click "Generate & Execute Plan"
   - Watch real-time logs as AI:
     - Creates git branch
     - Generates codemod
     - Runs transformations
     - Executes tests
     - **Self-corrects if tests fail** 🔥
     - Commits changes

5. **Result**
   - All tests passing ✅
   - Code migrated successfully
   - Ready to push

---

## 🏗️ Architecture

### Monorepo Structure

```
morphlex-ai/
├── packages/
│   ├── types/          # Shared TypeScript types
│   ├── server/         # Express API server
│   ├── brain/          # React web UI
│   └── hands/          # VS Code extension
├── docs/               # Documentation
├── examples/           # Example projects
└── pnpm-workspace.yaml # Monorepo config
```

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **AI** | Google Gemini (Vision & Text models) |
| **Extension** | VS Code Extension API, WebSocket |
| **Code Transform** | jscodeshift |
| **Monorepo** | pnpm workspaces |

### Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│  Web UI     │◄───────►│ API Server   │◄───────►│ Gemini AI  │
│  (Brain)    │         │ (Express)    │         │            │
└─────┬───────┘         └──────────────┘         └────────────┘
      │
      │ WebSocket (Execution Mode)
      │
      ▼
┌─────────────┐         ┌──────────────┐
│ VS Code Ext │────────►│  Local Code  │
│  (Hands)    │         │  Workspace   │
└─────────────┘         └──────────────┘
```

---

## 🔑 Configuration

### Server Configuration (packages/server/.env)

```bash
# API Settings
GEMINI_API_KEY=your_key_here
PORT=3001
HOST=localhost

# Codebase Scanning
CODEBASE_PATH=../../../
EXCLUDE_PATHS=node_modules,.git,dist,build,coverage

# Feature Flags
ENABLE_LOCAL_EXECUTION=false
ENABLE_GIT_INTEGRATION=false

# CORS
CORS_ORIGIN=http://localhost:5173
```

### VS Code Extension (packages/hands/.env)

```bash
GEMINI_API_KEY=your_key_here
WS_PORT=3030
WS_HOST=localhost
```

---

## 🧪 Development

### Build All Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Lint Code

```bash
pnpm lint
```

### Clean Build Artifacts

```bash
pnpm clean
```

---

## 🎯 Use Cases

### Enterprise Teams

**Problem**: Legacy codebase using deprecated `react-google-login`
**Solution**: Upload login component screenshot → AI generates migration to `@react-oauth/google` → Execute with tests → Ship

**Time Saved**: 3 days → 30 minutes

### Cloud Provisioning

**Problem**: Need secure Google Maps API setup
**Solution**: Select "Google Maps" → AI generates gcloud script with domain restrictions → Copy & run

**Mistakes Prevented**: Unrestricted API keys, billing surprises, security vulnerabilities

### Learning & Exploration

**Problem**: New to AI-powered development tools
**Solution**: Use Preview Mode to see how Gemini Vision finds code, generates codemods, and plans migrations

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check if port is in use
lsof -i :3001
kill -9 <PID>

# Verify .env file exists
ls packages/server/.env
```

### VS Code extension not detected

1. Ensure VS Code is open in the `morphlex-ai` folder
2. Press `F5` to launch extension dev host
3. Check WebSocket server started: `ws://localhost:3030`
4. Refresh web UI

### Gemini API errors

1. Verify API key in `.env` files
2. Check quota at [AI Studio](https://aistudio.google.com)
3. Ensure internet connection is active

---

## 🔒 Security Best Practices

### ✅ What We Got Right

- **Server-side API Keys**: Never exposed to browser
- **Git-ignored Secrets**: `.env` files never committed
- **Path Traversal Protection**: Codebase scanning restricted
- **Domain-Restricted Cloud Keys**: Generated scripts include restrictions
- **OS Keychain Integration**: Optional secret storage via `ferri` CLI

### ⚠️ Production Checklist

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Use environment-specific API keys
- [ ] Add request validation
- [ ] Configure CORS for specific domains
- [ ] Add logging and monitoring
- [ ] Sandbox jscodeshift execution
- [ ] Review generated scripts before running

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

**Built at:** [Vibe Code: Gemini SF Hackathon](https://cerebralvalley.ai/e/vibe-code-gemini-sf) by Cerebral Valley

**Powered by:**
- Google Gemini AI for vision and text generation
- React & Vite for modern frontend development
- jscodeshift for safe code transformations
- VS Code Extension API for extensibility

---

## 🌟 What's Next?

### Roadmap

- [ ] Support for AWS SDK migrations
- [ ] Azure API migrations
- [ ] Multi-file migrations (entire repo)
- [ ] PR generation with GitHub integration
- [ ] CI/CD integration
- [ ] Browser extension for instant detection
- [ ] Migration history and rollback

---

<div align="center">

**Built with ❤️ at [Your Company]**

[Website](https://morphlex.ai) • [Documentation](https://docs.morphlex.ai) • [Discord](https://discord.gg/morphlex)

</div>
