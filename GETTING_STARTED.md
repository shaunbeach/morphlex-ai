# Getting Started with Morphlex AI

Welcome! This guide will help you get Morphlex AI up and running in minutes.

## What You're Building

Morphlex AI combines two powerful modes:

1. **Preview Mode**: Generate migration scripts without execution
2. **Execution Mode**: Autonomous migrations with test-driven self-correction

## Prerequisites Checklist

- [ ] Node.js v18+ installed ([Download](https://nodejs.org))
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Google Gemini API key ([Get one](https://aistudio.google.com/apikey))
- [ ] VS Code (optional, for Execution Mode)

## Quick Start (5 Minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
cd /Users/sbeach/Documents/gemini-morph-demo/morphlex-ai

# Install dependencies
pnpm install
```

### Step 2: Configure API Keys

```bash
# Create server config
cp packages/server/.env.example packages/server/.env

# Edit and add your API key
nano packages/server/.env  # or use any editor
```

Add your Gemini API key:
```
GEMINI_API_KEY=YOUR_KEY_HERE
```

### Step 3: Start the Application

```bash
# Use the quick start script
./start.sh

# Or manually start Preview Mode
pnpm dev:preview
```

### Step 4: Open the Web UI

Open your browser to: [http://localhost:5173](http://localhost:5173)

You should see the Morphlex AI interface with "Preview Mode" active.

## Your First Migration (Preview Mode)

### 1. Upload a Screenshot

- Click the screenshot upload area
- Upload any image showing a UI component (or use the mock example button)
- AI will analyze the image

### 2. Detect Deprecations

- Click "Scan for Deprecated APIs"
- View deprecated SDKs with migration guides

### 3. Generate Migration Script

- Click "Generate Migration Script"
- Review the AI-generated jscodeshift transformation
- Copy and run manually

## Enabling Execution Mode

Want the full power? Enable Execution Mode:

### Step 1: Configure Extension

```bash
# Create extension config
cp packages/hands/.env.example packages/hands/.env

# Edit and add your API key
nano packages/hands/.env
```

Add the same Gemini API key:
```
GEMINI_API_KEY=YOUR_KEY_HERE
```

### Step 2: Start Full Mode

```bash
# Terminal 1: Start server and web UI
pnpm dev:full
```

### Step 3: Launch VS Code Extension

1. Open VS Code in the `morphlex-ai` folder
2. Press `F5` to launch the extension development host
3. A new VS Code window will open with the extension active

### Step 4: Verify Connection

- Go back to [http://localhost:5173](http://localhost:5173)
- The mode selector should show "⚡ Execution" available
- Click it to switch modes

## Your First Autonomous Migration

### 1. Upload Screenshot

Same as before - AI finds your component

### 2. Define Goal

In the "Migration Goal" input, type:
```
Migrate to new Google Auth SDK
```

### 3. Execute Plan

- Click "Generate & Execute Plan"
- Watch the AI:
  - Generate execution plan
  - Create git branch
  - Generate codemod
  - Run transformations
  - Execute tests
  - Self-correct if needed
  - Commit changes

### 4. Review Results

- View live logs in the Web UI
- See plan steps turn green
- Check your git history for the commit

## Testing Cloud Provisioning

### Switch to Provisioning Tab

1. Click "☁️ Cloud Provisioning" tab
2. Select a Google Cloud service (e.g., Google Maps)
3. Click "Generate Provisioning Script"
4. Review the secure gcloud script
5. Copy and run in your terminal (with gcloud CLI authenticated)

## Troubleshooting

### "Backend won't start"

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process if needed
kill -9 <PID>

# Restart
pnpm dev:preview
```

### "VS Code extension not detected"

1. Ensure you pressed F5 in VS Code
2. Check the VS Code debug console for errors
3. Verify `.env` file exists in `packages/hands/`
4. Restart the extension (Ctrl+Shift+P → "Reload Window")

### "Gemini API errors"

1. Verify API key is correct in `.env` files
2. Check API key has no extra spaces
3. Ensure you have quota remaining at [AI Studio](https://aistudio.google.com)

## Next Steps

### Explore the Features

- Try different screenshots
- Test multiple migration types
- Generate cloud provisioning scripts
- Experiment with the self-correction loop

### Read the Docs

- [README.md](./README.md) - Full feature overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep dive
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

### Customize

- Add custom deprecation patterns (see `packages/server/src/index.ts`)
- Modify UI styles (Tailwind classes in `packages/brain/src/`)
- Extend with new cloud services

## Common Use Cases

### Migrating React Google Login

1. Upload screenshot of login button
2. AI finds component file
3. Detects `react-google-login` deprecation
4. Generates migration to `@react-oauth/google`
5. Executes and tests (Execution Mode only)

### Setting Up Google Maps Securely

1. Go to Cloud Provisioning tab
2. Select "Google Maps"
3. Generate provisioning script
4. Script includes domain restrictions automatically
5. Run script to create project with secure API key

## Tips for Success

1. **Start with Preview Mode** to understand the flow
2. **Enable Execution Mode** when you're ready for autonomy
3. **Review generated scripts** before running in production
4. **Keep API keys secure** - never commit `.env` files
5. **Use git branches** for safety (Execution Mode does this automatically)

## Support

- GitHub Issues: [Report bugs](https://github.com/your-org/morphlex-ai/issues)
- Discord: [Join community](https://discord.gg/morphlex)
- Email: support@morphlex.ai

---

**Ready to automate your migrations? Let's go! 🚀**
