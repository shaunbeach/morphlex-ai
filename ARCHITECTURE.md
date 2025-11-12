# Morphlex AI - Architecture Documentation

## Overview

Morphlex AI is a monorepo application that combines the best features of two hackathon projects into a unified, complete AI migration platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MORPHLEX PRO                             │
│                   AI Migration Engineer                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Web UI (Brain) │◄───────►│  VS Code Extension│
│   Port: 5173     │         │    (Hands)        │
│                  │         │  WebSocket: 3030  │
│  - Screenshot    │         │                   │
│  - Plan review   │         │  - Local execution│
│  - Log streaming │         │  - Git operations │
│  - Mode selector │         │  - Test running   │
└────────┬─────────┘         └────────┬──────────┘
         │                            │
         │    ┌───────────────────────┘
         │    │
         ▼    ▼
    ┌────────────────┐
    │  Express Server│
    │   Port: 3001   │
    │                │
    │  - API Gateway │
    │  - Deprecation │
    │    Detection   │
    │  - Codebase    │
    │    Scanning    │
    └────────┬───────┘
             │
             ▼
      ┌─────────────┐
      │ Gemini API  │
      │             │
      │ - Vision    │
      │ - Planning  │
      │ - Codemod   │
      │   Generation│
      └─────────────┘
```

## Package Structure

### packages/types

**Purpose**: Shared TypeScript type definitions

**Exports**:
- Mode system (`MorphlexMode`, `ModeConfig`)
- Communication protocols (`JsonRpcRequest`, `JsonRpcResponse`)
- Logging (`LogMessage`)
- Migration plans (`PlanStep`, `PlanStepStatus`)
- API types (`HealthCheckResponse`, etc.)
- MCP protocol constants

**Dependencies**: None (pure types)

### packages/server

**Purpose**: Express API server providing REST endpoints

**Responsibilities**:
- Screenshot analysis via Gemini Vision
- Codebase file system scanning
- Deprecation pattern detection
- Migration script generation
- Cloud provisioning script generation

**Key Files**:
- `src/index.ts` - Main Express app with all routes
- `src/.env` - Configuration (API keys, paths)

**API Endpoints**:
- `GET /api/health` - Server status
- `POST /api/analyze-screenshot` - Gemini Vision analysis
- `POST /api/search-codebase` - File search
- `POST /api/detect-deprecations` - Deprecation scanning
- `POST /api/generate-migration-script` - Codemod generation
- `POST /api/generate-provisioning-script` - Cloud scripts

**Dependencies**: Express, Gemini SDK, multer, types

### packages/brain

**Purpose**: React web UI (control panel)

**Responsibilities**:
- Mode selection (Preview vs Execution)
- Screenshot upload and preview
- Migration workflow UI
- Cloud provisioning UI
- Real-time log display
- Plan visualization

**Key Components**:
- `App.tsx` - Main app with mode switching
- `MigrationWorkflow.tsx` - SDK migration flow
- `ProvisioningWorkflow.tsx` - Cloud provisioning flow
- `ModeSelector.tsx` - Mode toggle UI
- `PlanViewer.tsx` - Execution plan display
- `LogViewer.tsx` - Live log streaming
- `CodeDisplay.tsx` - Syntax-highlighted code

**Hooks**:
- `useMcp.ts` - WebSocket client for VS Code extension

**Dependencies**: React, TypeScript, Tailwind, types

### packages/hands

**Purpose**: VS Code extension (local execution engine)

**Responsibilities**:
- WebSocket server for Brain communication
- Component detection from screenshots
- Execution plan generation
- Plan execution with self-correction
- Git operations
- Test running

**Key Files**:
- `src/extension.ts` - VS Code lifecycle
- `src/mcpServer.ts` - WebSocket server & protocol handler
- `src/planExecutor.ts` - Plan execution engine
- `src/services/geminiService.ts` - Gemini API integration

**MCP Protocol**:
- Methods: `findComponent`, `generatePlan`, `storeSecret`
- Notifications: `log`, `planGenerated`, `planStepUpdate`, `executionSuccess/Failed`

**Dependencies**: VS Code API, WebSocket, Gemini SDK, types

## Data Flow

### Preview Mode Flow

```
User uploads screenshot
    ↓
Brain → Server (POST /api/analyze-screenshot)
    ↓
Server → Gemini Vision API
    ↓
Gemini returns component analysis
    ↓
Server → Brain (component info)
    ↓
Brain → Server (POST /api/search-codebase)
    ↓
Server scans file system
    ↓
Server → Brain (matching files)
    ↓
User clicks "Detect Deprecations"
    ↓
Brain → Server (POST /api/detect-deprecations)
    ↓
Server → Brain (deprecations found)
    ↓
User clicks "Generate Script"
    ↓
Brain → Server (POST /api/generate-migration-script)
    ↓
Server → Gemini (generate codemod)
    ↓
Gemini → Server (jscodeshift script)
    ↓
Server → Brain (script)
    ↓
User copies and runs manually
```

### Execution Mode Flow

```
User uploads screenshot
    ↓
Brain → Hands (WebSocket: mcp:findComponentFromImage)
    ↓
Hands searches VS Code workspace
    ↓
Hands → Gemini Vision (find matching file)
    ↓
Gemini → Hands (file path)
    ↓
Hands → Brain (notification: filePathFound)
    ↓
User enters goal and clicks "Execute"
    ↓
Brain → Hands (WebSocket: mcp:generatePlan)
    ↓
Hands → Gemini (generate execution plan)
    ↓
Gemini → Hands (JSON plan)
    ↓
Hands → Brain (notification: planGenerated)
    ↓
Hands begins execution:
  For each step:
    ├─ Hands → Brain (notification: planStepUpdate - Running)
    ├─ If jscodeshift:
    │   ├─ Hands → Gemini (generate codemod)
    │   ├─ Gemini → Hands (codemod script)
    │   ├─ Hands runs: npx jscodeshift -t script.js file.js
    │   └─ Hands → Brain (log output)
    ├─ If test:
    │   ├─ Hands runs: npm test
    │   ├─ If fails:
    │   │   ├─ Hands → Gemini (generate corrected codemod with error)
    │   │   ├─ Gemini → Hands (corrected script)
    │   │   ├─ Hands reverts file
    │   │   ├─ Hands re-runs jscodeshift
    │   │   └─ Hands re-runs tests
    │   └─ Hands → Brain (log: self-correction successful)
    └─ Hands → Brain (notification: planStepUpdate - Success)
    ↓
Hands → Brain (notification: executionSuccess)
    ↓
User sees: "All tests passed! 🎉"
```

## Mode System

### Preview Mode

**When**: No VS Code extension needed
**Use Case**: Exploring, learning, generating scripts
**Features**:
- Screenshot analysis
- Codebase scanning
- Deprecation detection
- Script generation
- Manual execution required

**Limitations**:
- No automatic execution
- No test running
- No git integration
- No self-correction

### Execution Mode

**When**: VS Code extension running
**Use Case**: Production migrations, autonomous workflows
**Features**:
- All Preview Mode features
- Automatic plan execution
- Test-driven self-correction
- Git workflow automation
- Real-time progress tracking

**Requirements**:
- VS Code extension installed
- WebSocket connection active
- Workspace with git repo

## Security Model

### API Key Management

```
Server (.env)
├─ GEMINI_API_KEY (server-side only, never exposed)
└─ Used for: REST API endpoints

Hands (.env)
├─ GEMINI_API_KEY (local VS Code only)
└─ Used for: Local workspace operations
```

### Secret Storage (Optional)

- Uses `ferri` CLI for OS keychain integration
- Master password cached in memory only
- Never committed to git

### Path Traversal Protection

```typescript
const codebasePath = path.resolve(__dirname, process.env.CODEBASE_PATH);
const fullPath = path.join(codebasePath, filePath);
const resolvedPath = path.resolve(fullPath);

if (!resolvedPath.startsWith(codebasePath)) {
  throw new Error('Access denied');
}
```

## Self-Correction Algorithm

```typescript
// In planExecutor.ts
if (testStepFailed) {
  // 1. Capture test error output
  const testError = result.stderr;

  // 2. Generate corrected codemod
  const correctedCodemod = await gemini.generateCorrectedCodemod(
    originalCode,
    failedCodemod,
    testError
  );

  // 3. Restore original file
  await fs.writeFile(targetFile, originalCode);

  // 4. Re-run jscodeshift with corrected script
  await runCommand('npx', ['jscodeshift', '-t', correctedScript, targetFile]);

  // 5. Re-run tests
  const retestResult = await runCommand('npm', ['test']);

  // 6. If still fails, mark as failed
  // 7. If passes, mark as success and continue
}
```

## Deprecation Database

Located in `packages/server/src/index.ts`:

```typescript
const DEPRECATION_DB = {
  'gapi.auth': {
    status: 'deprecated',
    replacement: 'google.accounts.id',
    guide: 'https://...',
    severity: 'high',
  },
  // ... more patterns
};
```

To add new deprecations:
1. Add entry to `DEPRECATION_DB`
2. Include: `key`, `status`, `replacement`, `guide`, `severity`
3. Restart server

## WebSocket Protocol (MCP)

### Methods (Client → Server)

```typescript
// Find component from screenshot
{
  method: 'mcp:findComponentFromImage',
  params: { imageBase64: string }
}

// Generate execution plan
{
  method: 'mcp:generatePlan',
  params: { goal: string, filePath: string }
}

// Store secret
{
  method: 'mcp:storeSecret',
  params: { key: string, value: string }
}
```

### Notifications (Server → Client)

```typescript
// Log message
{
  method: 'mcp:log',
  params: { level: 'info', message: 'text' }
}

// Plan generated
{
  method: 'mcp:planGenerated',
  params: { plan: PlanStep[] }
}

// Step status update
{
  method: 'mcp:planStepUpdate',
  params: { stepIndex: number, status: 'Running' | 'Success' | 'Failed' }
}

// Execution complete
{
  method: 'mcp:executionSuccess',
  params: { message: string }
}
```

## Build & Deployment

### Development

```bash
pnpm dev:preview  # Web UI + Server only
pnpm dev:full     # Web UI + Server + Extension watcher
```

### Production Build

```bash
pnpm build        # Builds all packages
pnpm start        # Starts production server
```

### Package Output

```
packages/types/dist/       # Compiled types
packages/server/dist/      # Compiled server
packages/brain/dist/       # Built static files (Vite)
packages/hands/out/        # Compiled VS Code extension
```

## Performance Considerations

### Codebase Scanning

- Limits file search to 20 files for performance
- Excludes: node_modules, .git, dist, build, coverage
- Configurable via `EXCLUDE_PATHS` env var

### Gemini API

- Uses model caching to avoid re-selection
- Tries newest models first with fallback
- Vision model: gemini-2.5-flash (fast)
- Text model: gemini-2.5-pro (powerful)

### WebSocket

- Single persistent connection
- JSON-RPC 2.0 protocol
- 30-second request timeout

## Error Handling

### Server

```typescript
try {
  // API operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
}
```

### Extension

```typescript
try {
  // Extension operation
} catch (error) {
  this.notify(ws, MCP_NOTIFICATIONS.error, {
    message: error.message
  });
}
```

### Brain

```typescript
try {
  // UI operation
} catch (error) {
  addLog({ level: 'error', message: error.message });
}
```

## Future Enhancements

1. **Multi-file migrations**: Apply transformations to entire repo
2. **PR generation**: Auto-create GitHub pull requests
3. **Migration history**: Track and rollback migrations
4. **AWS/Azure support**: Extend beyond Google SDKs
5. **CI/CD integration**: Run in GitHub Actions
6. **Browser extension**: Instant detection from any webpage
