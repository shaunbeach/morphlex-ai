import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  MorphlexMode,
  HealthCheckResponse,
  AnalyzeScreenshotResponse,
  ScreenshotAnalysis,
  SearchResult,
  DeprecationInfo,
  DeprecationScanResult,
  CodemodScript,
  ProvisioningScript,
  CloudService,
} from 'types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || 'localhost';

// ============================================================================
// GEMINI AI INITIALIZATION
// ============================================================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Smart model selector - tries models in order until one works
let cachedTextModel: string | null = null;
let cachedVisionModel: string | null = null;

const MODEL_PREFERENCES = {
  vision: [
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro-vision',
  ],
  text: [
    'gemini-2.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro',
  ],
};

async function getBestModel(requiresVision = false): Promise<string> {
  if (requiresVision && cachedVisionModel) return cachedVisionModel;
  if (!requiresVision && cachedTextModel) return cachedTextModel;

  const modelsToTry = requiresVision ? MODEL_PREFERENCES.vision : MODEL_PREFERENCES.text;

  for (const modelName of modelsToTry) {
    try {
      const testModel = genAI.getGenerativeModel({ model: modelName });
      console.log(`✨ Selected model: ${modelName} (vision: ${requiresVision})`);

      if (requiresVision) {
        cachedVisionModel = modelName;
      } else {
        cachedTextModel = modelName;
      }

      return modelName;
    } catch (error) {
      console.log(`⚠️  Model ${modelName} not available, trying next...`);
      continue;
    }
  }

  const fallback = modelsToTry[0];
  console.log(`⚠️  Using fallback model: ${fallback}`);
  return fallback;
}

async function getModel(requiresVision = false) {
  const modelName = await getBestModel(requiresVision);
  return genAI.getGenerativeModel({ model: modelName });
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') }, // 10MB default
});

// ============================================================================
// DEPRECATION DATABASE
// ============================================================================

const DEPRECATION_DB: Record<string, Omit<DeprecationInfo, 'key'>> = {
  'gapi.auth': {
    status: 'deprecated',
    replacement: 'google.accounts.id',
    guide: 'https://developers.google.com/identity/gsi/web/guides/migrating-from-gsi-v2',
    severity: 'high',
  },
  'gapi-script': {
    status: 'deprecated',
    replacement: '@react-oauth/google',
    guide: 'https://developers.google.com/identity/gsi/web/guides/migrating-from-gsi-v2',
    severity: 'high',
  },
  'react-google-login': {
    status: 'deprecated',
    replacement: '@react-oauth/google',
    guide: 'https://www.npmjs.com/package/@react-oauth/google',
    severity: 'high',
  },
  'firebase.auth()': {
    status: 'deprecated',
    replacement: 'getAuth() from firebase/auth',
    guide: 'https://firebase.google.com/docs/auth/web/start',
    severity: 'medium',
  },
  '@google-cloud/storage v5': {
    status: 'sunset',
    replacement: '@google-cloud/storage v7',
    guide: 'https://github.com/googleapis/nodejs-storage/blob/main/MIGRATING.md',
    severity: 'medium',
  },
};

// ============================================================================
// API ROUTES
// ============================================================================

// Health Check
app.get('/api/health', async (req, res) => {
  const textModel = await getBestModel(false);
  const visionModel = await getBestModel(true);

  const mode: MorphlexMode = process.env.ENABLE_LOCAL_EXECUTION === 'true'
    ? 'execution' as MorphlexMode
    : 'preview' as MorphlexMode;

  const response: HealthCheckResponse = {
    status: 'ok',
    message: 'Morphlex AI API is running',
    models: {
      text: textModel,
      vision: visionModel,
    },
    mode,
    features: {
      screenshot_analysis: true,
      codebase_scanning: true,
      deprecation_detection: true,
      migration_script_generation: true,
      provisioning_script_generation: true,
      local_execution: process.env.ENABLE_LOCAL_EXECUTION === 'true',
      git_integration: process.env.ENABLE_GIT_INTEGRATION === 'true',
      test_execution: process.env.ENABLE_LOCAL_EXECUTION === 'true',
    },
  };

  res.json(response);
});

// Analyze Screenshot with Gemini Vision
app.post('/api/analyze-screenshot', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const model = await getModel(true);

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `You are an expert UI analyst for code migration. Analyze this screenshot and identify:
1. What type of UI component is shown (e.g., login button, form, navbar, etc.)
2. What technology or framework it appears to be (React, Angular, Vue, etc.)
3. Any Google SDKs or services being used (look for Google branding, "Sign in with Google", Maps, etc.)
4. Suggested file name where this component would likely be defined

Respond in JSON format:
{
  "componentType": "description of component",
  "technology": "detected framework/library",
  "googleServices": ["list", "of", "services"],
  "suggestedFileName": "ComponentName.jsx or .tsx",
  "confidence": 0.95
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    let analysis: ScreenshotAnalysis;
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, '');
      analysis = JSON.parse(cleanText);
    } catch (e) {
      analysis = {
        componentType: 'Unknown',
        technology: 'Unknown',
        googleServices: [],
        suggestedFileName: 'Unknown',
        rawResponse: text,
      };
    }

    const apiResponse: AnalyzeScreenshotResponse = { analysis };
    res.json(apiResponse);
  } catch (error: any) {
    console.error('Error analyzing screenshot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search Codebase
app.post('/api/search-codebase', async (req, res) => {
  try {
    const { query, fileExtensions = ['.js', '.jsx', '.ts', '.tsx'] } = req.body;

    const codebasePath = path.resolve(__dirname, process.env.CODEBASE_PATH || '../../../');
    const excludePaths = (process.env.EXCLUDE_PATHS || 'node_modules,.git,dist,build,coverage').split(',');
    const results: SearchResult[] = [];

    async function searchDirectory(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !excludePaths.includes(entry.name)) {
          await searchDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (fileExtensions.includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf-8');

            if (
              entry.name.toLowerCase().includes(query.toLowerCase()) ||
              content.toLowerCase().includes(query.toLowerCase())
            ) {
              const relativePath = path.relative(codebasePath, fullPath);
              results.push({
                path: relativePath,
                fileName: entry.name,
                matches: content.toLowerCase().includes(query.toLowerCase()),
              });
            }
          }
        }
      }
    }

    await searchDirectory(codebasePath);
    res.json({ results });
  } catch (error: any) {
    console.error('Error searching codebase:', error);
    res.status(500).json({ error: error.message });
  }
});

// Detect Deprecations
app.post('/api/detect-deprecations', async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const codebasePath = path.resolve(__dirname, process.env.CODEBASE_PATH || '../../../');
    const fullPath = path.join(codebasePath, filePath);

    // Security check
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(codebasePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const code = await fs.readFile(fullPath, 'utf-8');

    const foundDeprecations: DeprecationInfo[] = [];
    for (const [key, value] of Object.entries(DEPRECATION_DB)) {
      if (code.includes(key)) {
        foundDeprecations.push({ key, ...value });
      }
    }

    const response: DeprecationScanResult = {
      filePath,
      code,
      deprecations: foundDeprecations,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error detecting deprecations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Migration Script
app.post('/api/generate-migration-script', async (req, res) => {
  try {
    const { code, deprecation, targetFramework = 'jscodeshift' } = req.body;

    if (!code || !deprecation) {
      return res.status(400).json({ error: 'Code and deprecation info required' });
    }

    const model = await getModel();

    const prompt = `You are an expert AI Migration Engineer specializing in ${targetFramework} transformations.

Here is a code component using the deprecated '${deprecation.key}' library:
---
${code}
---

Your task is to generate a '${targetFramework}' transformation script to migrate this code.

The script MUST:
1. Remove the '${deprecation.key}' import/usage
2. Find all calls related to '${deprecation.key}'
3. Replace those calls with the new '${deprecation.replacement}' API
4. Preserve all existing functionality
5. Add a "// MIGRATED: ${deprecation.key} -> ${deprecation.replacement}" comment

Migration guide: ${deprecation.guide}

Output ONLY the JavaScript code for the '${targetFramework}' script.
Start with 'export default function transformer(file, api) {'.
Do NOT include markdown code blocks, just pure JavaScript.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();

    const codemod: CodemodScript = {
      script: script.replace(/```javascript\n?|\n?```/g, ''),
      language: 'javascript',
      framework: targetFramework as 'jscodeshift',
      metadata: {
        generatedBy: await getBestModel(false),
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    res.json({ script: codemod.script, codemod });
  } catch (error: any) {
    console.error('Error generating migration script:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Provisioning Script
app.post('/api/generate-provisioning-script', async (req, res) => {
  try {
    const {
      service,
      domain = 'demo-app.com',
      projectName,
      includeSecurityBestPractices = true,
    } = req.body;

    if (!service) {
      return res.status(400).json({ error: 'Service name required' });
    }

    const model = await getModel();

    const serviceApiMap: Record<CloudService, string> = {
      'Google Maps': 'maps.googleapis.com',
      'Google Auth': 'identitytoolkit.googleapis.com',
      'Google Storage': 'storage.googleapis.com',
      'Google Vision': 'vision.googleapis.com',
      'Firebase Auth': 'identitytoolkit.googleapis.com',
      'Firebase Storage': 'firebasestorage.googleapis.com',
    };

    const serviceApi = serviceApiMap[service as CloudService] || 'maps.googleapis.com';
    const generatedProjectName = projectName || `morphlex-${service.toLowerCase().replace(/\s+/g, '-')}`;

    const prompt = `You are an expert Google Cloud engineer.

Generate a secure bash script using 'gcloud' commands to:
1. Create a new Google Cloud project named '${generatedProjectName}'
2. Enable the '${serviceApi}' API for that project
3. Create a new API key for that project
4. Restrict that API key to only be used on the '${domain}' domain
${includeSecurityBestPractices ? '5. Add security best practices (billing alerts, quotas, etc.)' : ''}

The script MUST:
- Include clear comments explaining each step
- Handle errors gracefully
- Set proper environment variables
- Use secure defaults
- Follow Google Cloud best practices

Output ONLY the bash script. Start with '#!/bin/bash'.
Do NOT include markdown wrappers or explanations outside the script.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text().replace(/```bash\n?|\n?```/g, '');

    const provisioning: ProvisioningScript = {
      service: service as CloudService,
      script,
      language: 'bash',
      securityFeatures: includeSecurityBestPractices
        ? ['domain-restriction', 'api-key-quotas', 'billing-alerts']
        : ['domain-restriction'],
    };

    res.json({ script: provisioning.script, provisioning });
  } catch (error: any) {
    console.error('Error generating provisioning script:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Morphlex AI Server running on http://${HOST}:${PORT}`);
  console.log(`📁 Codebase path: ${path.resolve(__dirname, process.env.CODEBASE_PATH || '../../../')}`);
  console.log(`🔧 Mode: ${process.env.ENABLE_LOCAL_EXECUTION === 'true' ? 'EXECUTION' : 'PREVIEW'}`);
  console.log(`\n✨ Ready to analyze, plan, and migrate!\n`);
});
