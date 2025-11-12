// ============================================================================
// MORPHLEX PRO - UNIFIED TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// Mode System
// ----------------------------------------------------------------------------

export enum MorphlexMode {
  Preview = 'preview',    // Web-only mode (no VS Code extension needed)
  Execution = 'execution' // Full power mode (VS Code extension required)
}

export interface ModeConfig {
  mode: MorphlexMode;
  hasVSCodeExtension: boolean;
  canExecuteLocally: boolean;
}

// ----------------------------------------------------------------------------
// Communication Protocols
// ----------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
}

// ----------------------------------------------------------------------------
// Logging System
// ----------------------------------------------------------------------------

export interface LogMessage {
  level: 'stdout' | 'stderr' | 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source?: 'server' | 'extension' | 'gemini';
}

// ----------------------------------------------------------------------------
// Migration Plan System
// ----------------------------------------------------------------------------

export enum PlanStepStatus {
  Pending = 'Pending',
  Running = 'Running',
  Success = 'Success',
  Failed = 'Failed',
  Skipped = 'Skipped'
}

export type PlanStepTool = 'git' | 'npm' | 'jscodeshift' | 'test' | 'fs' | 'gcloud';

export interface PlanStep {
  step: string;
  tool: PlanStepTool;
  params: any[];
  status: PlanStepStatus;
  description?: string;
  estimatedTime?: string;
}

export interface MigrationPlan {
  id: string;
  goal: string;
  targetFile: string;
  steps: PlanStep[];
  createdAt: string;
  mode: MorphlexMode;
}

// ----------------------------------------------------------------------------
// Screenshot Analysis (Vision AI)
// ----------------------------------------------------------------------------

export interface ScreenshotAnalysis {
  componentType: string;
  technology: string;
  googleServices: string[];
  suggestedFileName: string;
  confidence?: number;
  rawResponse?: string;
}

// ----------------------------------------------------------------------------
// Codebase Scanning
// ----------------------------------------------------------------------------

export interface SearchResult {
  path: string;
  fileName: string;
  matches: boolean;
  lineNumber?: number;
  snippet?: string;
}

export interface CodebaseSearchRequest {
  query: string;
  fileExtensions?: string[];
  maxResults?: number;
}

// ----------------------------------------------------------------------------
// Deprecation Detection
// ----------------------------------------------------------------------------

export interface DeprecationInfo {
  key: string;
  status: 'deprecated' | 'sunset' | 'removed';
  replacement: string;
  guide: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}

export interface DeprecationScanResult {
  filePath: string;
  code: string;
  deprecations: DeprecationInfo[];
}

// ----------------------------------------------------------------------------
// Code Transformation
// ----------------------------------------------------------------------------

export interface CodemodScript {
  script: string;
  language: 'javascript' | 'typescript';
  framework?: 'jscodeshift' | 'ts-morph';
  metadata?: {
    generatedBy: 'gemini-2.5-pro' | 'gemini-2.5-flash' | string;
    generatedAt: string;
    version: string;
  };
}

export interface CodemodExecutionResult {
  success: boolean;
  transformedCode?: string;
  error?: string;
  filesChanged?: number;
}

// ----------------------------------------------------------------------------
// Cloud Provisioning
// ----------------------------------------------------------------------------

export type CloudService =
  | 'Google Maps'
  | 'Google Auth'
  | 'Google Storage'
  | 'Google Vision'
  | 'Firebase Auth'
  | 'Firebase Storage';

export interface ProvisioningScript {
  service: CloudService;
  script: string;
  language: 'bash' | 'terraform' | 'pulumi';
  securityFeatures: string[];
}

// ----------------------------------------------------------------------------
// Secret Management
// ----------------------------------------------------------------------------

export interface SecretStoreRequest {
  key: string;
  value: string;
  service?: string;
}

export interface SecretStoreResponse {
  success: boolean;
  message: string;
}

// ----------------------------------------------------------------------------
// MCP Protocol Methods & Notifications
// ----------------------------------------------------------------------------

export const MCP_METHODS = {
  // Screenshot & Detection
  findComponent: 'mcp:findComponentFromImage',

  // Planning & Execution
  generatePlan: 'mcp:generatePlan',
  executePlan: 'mcp:executePlan',

  // Secret Management
  storeSecret: 'mcp:storeSecret',
  retrieveSecret: 'mcp:retrieveSecret',

  // Codebase Operations
  searchCodebase: 'mcp:searchCodebase',
  detectDeprecations: 'mcp:detectDeprecations',

  // Code Generation
  generateMigrationScript: 'mcp:generateMigrationScript',
  generateProvisioningScript: 'mcp:generateProvisioningScript',
} as const;

export const MCP_NOTIFICATIONS = {
  // Logging
  log: 'mcp:log',

  // Execution Status
  executionSuccess: 'mcp:executionSuccess',
  executionFailed: 'mcp:executionFailed',
  executionProgress: 'mcp:executionProgress',

  // Plan Events
  planGenerated: 'mcp:planGenerated',
  planStepUpdate: 'mcp:planStepUpdate',

  // File Discovery
  filePathFound: 'mcp:filePathFound',

  // Secret Management
  secretStored: 'mcp:secretStored',

  // Error Handling
  error: 'mcp:error',
  warning: 'mcp:warning',
} as const;

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  message: string;
  models: {
    text: string;
    vision: string;
  };
  mode: MorphlexMode;
  features: {
    screenshot_analysis: boolean;
    codebase_scanning: boolean;
    deprecation_detection: boolean;
    migration_script_generation: boolean;
    provisioning_script_generation: boolean;
    local_execution: boolean;
    git_integration: boolean;
    test_execution: boolean;
  };
}

export interface AnalyzeScreenshotRequest {
  imageBase64?: string;
  imageUrl?: string;
}

export interface AnalyzeScreenshotResponse {
  analysis: ScreenshotAnalysis;
}

export interface GenerateMigrationScriptRequest {
  code: string;
  deprecation: DeprecationInfo;
  targetFramework?: string;
}

export interface GenerateMigrationScriptResponse {
  script: string;
  codemod: CodemodScript;
}

export interface GenerateProvisioningScriptRequest {
  service: CloudService;
  domain?: string;
  projectName?: string;
  includeSecurityBestPractices?: boolean;
}

export interface GenerateProvisioningScriptResponse {
  script: string;
  provisioning: ProvisioningScript;
}

// ----------------------------------------------------------------------------
// Execution Events
// ----------------------------------------------------------------------------

export interface ExecutionStartEvent {
  planId: string;
  timestamp: string;
  mode: MorphlexMode;
}

export interface ExecutionCompleteEvent {
  planId: string;
  success: boolean;
  timestamp: string;
  duration: number;
  stepsCompleted: number;
  stepsFailed: number;
  summary: string;
}

export interface ExecutionProgressEvent {
  planId: string;
  currentStep: number;
  totalSteps: number;
  percentage: number;
  message: string;
}

// ----------------------------------------------------------------------------
// Error Types
// ----------------------------------------------------------------------------

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface MorphlexError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

export interface MorphlexConfig {
  mode: MorphlexMode;
  server: {
    port: number;
    host: string;
  };
  websocket?: {
    port: number;
    host: string;
  };
  gemini: {
    apiKey?: string;
    models: {
      vision: string[];
      text: string[];
    };
  };
  codebase: {
    path: string;
    excludePaths: string[];
    fileExtensions: string[];
  };
  execution?: {
    maxRetries: number;
    timeout: number;
    autoCommit: boolean;
    createBranch: boolean;
  };
}
