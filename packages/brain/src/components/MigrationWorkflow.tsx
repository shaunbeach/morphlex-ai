import React, { useState, useEffect, useCallback } from 'react';
import type { ModeConfig, LogMessage, PlanStep, DeprecationInfo } from 'types';
import { MCP_NOTIFICATIONS } from 'types';
import { useMcp } from '../hooks/useMcp';
import { ImageUploader } from './ImageUploader';
import { PlanViewer } from './PlanViewer';
import { LogViewer } from './LogViewer';
import { CodeDisplay } from './CodeDisplay';

interface MigrationWorkflowProps {
  modeConfig: ModeConfig;
}

export function MigrationWorkflow({ modeConfig }: MigrationWorkflowProps) {
  const { connectionStatus, connect, sendMessage, lastMessage } = useMcp();
  const [targetFile, setTargetFile] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [fileCode, setFileCode] = useState<string>('');
  const [deprecations, setDeprecations] = useState<DeprecationInfo[]>([]);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [migrationScript, setMigrationScript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');

  const addLog = useCallback((newLog: Omit<LogMessage, 'timestamp'>) => {
    setLogs((prev) => [...prev, { ...newLog, timestamp: new Date().toISOString() }]);
  }, []);

  // Handle WebSocket messages (Execution Mode)
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.method) {
      case MCP_NOTIFICATIONS.log:
        addLog(lastMessage.params);
        break;
      case MCP_NOTIFICATIONS.filePathFound:
        setTargetFile(lastMessage.params.filePath);
        addLog({ level: 'info', message: `Found component: ${lastMessage.params.filePath}` });
        break;
      case MCP_NOTIFICATIONS.planGenerated:
        setPlan(lastMessage.params.plan);
        addLog({ level: 'success', message: `Plan generated with ${lastMessage.params.plan.length} steps` });
        break;
      case MCP_NOTIFICATIONS.planStepUpdate:
        setPlan((prevPlan) =>
          prevPlan.map((step, index) =>
            index === lastMessage.params.stepIndex ? { ...step, status: lastMessage.params.status } : step
          )
        );
        break;
      case MCP_NOTIFICATIONS.executionSuccess:
        setExecutionResult(`✅ Success: ${lastMessage.params.message}`);
        addLog({ level: 'success', message: lastMessage.params.message });
        break;
      case MCP_NOTIFICATIONS.executionFailed:
        setExecutionResult(`❌ Failed: ${lastMessage.params.error}`);
        addLog({ level: 'error', message: lastMessage.params.error });
        break;
    }
  }, [lastMessage, addLog]);

  const handleImageUpload = async (imageBase64: string) => {
    setIsAnalyzing(true);
    addLog({ level: 'info', message: 'Analyzing screenshot with Gemini Vision...' });

    try {
      if (modeConfig.mode === 'execution' && connectionStatus === 'Connected') {
        // Execution Mode: Use WebSocket
        await sendMessage('mcp:findComponentFromImage', { imageBase64 });
      } else {
        // Preview Mode: Use REST API
        const response = await fetch('http://localhost:3001/api/analyze-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        });
        const data = await response.json();
        addLog({ level: 'success', message: `Detected: ${data.analysis.componentType}` });

        // Search codebase for the component
        const searchQuery = data.analysis.suggestedFileName.replace(/\.(jsx|tsx)$/, '');
        const searchResponse = await fetch('http://localhost:3001/api/search-codebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const searchData = await searchResponse.json();

        if (searchData.results.length > 0) {
          setTargetFile(searchData.results[0].path);
          addLog({ level: 'success', message: `Found file: ${searchData.results[0].path}` });
        } else {
          addLog({ level: 'warning', message: 'No matching files found in codebase' });
        }
      }
    } catch (error: any) {
      addLog({ level: 'error', message: `Error: ${error.message}` });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDetectDeprecations = async () => {
    if (!targetFile) return;

    addLog({ level: 'info', message: 'Detecting deprecated APIs...' });

    try {
      const response = await fetch('http://localhost:3001/api/detect-deprecations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: targetFile }),
      });
      const data = await response.json();

      setFileCode(data.code);
      setDeprecations(data.deprecations);

      if (data.deprecations.length > 0) {
        addLog({ level: 'warning', message: `Found ${data.deprecations.length} deprecated API(s)` });
      } else {
        addLog({ level: 'success', message: 'No deprecations found! ✨' });
      }
    } catch (error: any) {
      addLog({ level: 'error', message: `Error: ${error.message}` });
    }
  };

  const handleGenerateMigrationScript = async () => {
    if (!fileCode || deprecations.length === 0) return;

    setIsGenerating(true);
    addLog({ level: 'info', message: 'Generating migration script with AI...' });

    try {
      const response = await fetch('http://localhost:3001/api/generate-migration-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileCode, deprecation: deprecations[0] }),
      });
      const data = await response.json();

      setMigrationScript(data.script);
      addLog({ level: 'success', message: 'Migration script generated successfully!' });
    } catch (error: any) {
      addLog({ level: 'error', message: `Error: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecutePlan = async () => {
    if (modeConfig.mode === 'preview') {
      addLog({ level: 'warning', message: 'Execution disabled in Preview Mode. Switch to Execution Mode.' });
      return;
    }

    if (!targetFile || !goal) {
      addLog({ level: 'error', message: 'Target file and goal are required' });
      return;
    }

    setLogs([]);
    setPlan([]);
    setExecutionResult('');

    try {
      addLog({ level: 'info', message: 'Generating execution plan...' });
      await sendMessage('mcp:generatePlan', { goal, filePath: targetFile });
    } catch (error: any) {
      addLog({ level: 'error', message: `Error: ${error.message}` });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Input */}
      <div className="space-y-6">
        {/* Step 1: Screenshot Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Step 1: Identify Component</h2>
          <ImageUploader onImageUpload={handleImageUpload} disabled={isAnalyzing} />
          {targetFile && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded">
              <p className="text-sm text-green-300">
                <strong>Target File:</strong> <code className="font-mono">{targetFile}</code>
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Detect Deprecations */}
        {targetFile && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Step 2: Detect Deprecations</h2>
            <button onClick={handleDetectDeprecations} className="btn-primary w-full">
              🔍 Scan for Deprecated APIs
            </button>
            {deprecations.length > 0 && (
              <div className="mt-4 space-y-2">
                {deprecations.map((dep, index) => (
                  <div key={index} className="p-3 bg-orange-900/20 border border-orange-700 rounded">
                    <p className="text-sm text-orange-300 font-mono">{dep.key}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Replace with: <span className="text-green-400">{dep.replacement}</span>
                    </p>
                    <a
                      href={dep.guide}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-morphlex-accent hover:underline"
                    >
                      Migration Guide →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Generate or Execute */}
        {deprecations.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">
              Step 3: {modeConfig.mode === 'preview' ? 'Generate Script' : 'Execute Migration'}
            </h2>

            {modeConfig.mode === 'preview' ? (
              <button
                onClick={handleGenerateMigrationScript}
                disabled={isGenerating}
                className="btn-success w-full"
              >
                {isGenerating ? '⏳ Generating...' : '🤖 Generate Migration Script'}
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Migration goal (e.g., Migrate to new Google Auth SDK)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="input"
                />
                <button onClick={handleExecutePlan} disabled={!goal} className="btn-success w-full">
                  ⚡ Generate & Execute Plan
                </button>
                {connectionStatus !== 'Connected' && (
                  <button onClick={connect} className="btn-secondary w-full">
                    🔌 Connect to VS Code Extension
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Output */}
      <div className="space-y-6">
        {/* Migration Script (Preview Mode) */}
        {modeConfig.mode === 'preview' && migrationScript && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Generated Migration Script</h2>
            <CodeDisplay code={migrationScript} language="javascript" />
            <button
              onClick={() => {
                navigator.clipboard.writeText(migrationScript);
                addLog({ level: 'success', message: 'Copied to clipboard!' });
              }}
              className="btn-secondary w-full mt-4"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}

        {/* Plan Viewer (Execution Mode) */}
        {modeConfig.mode === 'execution' && plan.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Execution Plan</h2>
            <PlanViewer plan={plan} />
            {executionResult && (
              <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded">
                <p className="text-sm">{executionResult}</p>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Agent Logs</h2>
            <LogViewer logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}
