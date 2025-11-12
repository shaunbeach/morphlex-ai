import React, { useState, useCallback } from 'react';
import type { ModeConfig, CloudService, LogMessage } from 'types';
import { CodeDisplay } from './CodeDisplay';
import { LogViewer } from './LogViewer';

interface ProvisioningWorkflowProps {
  modeConfig: ModeConfig;
}

const CLOUD_SERVICES: CloudService[] = [
  'Google Maps',
  'Google Auth',
  'Google Storage',
  'Google Vision',
  'Firebase Auth',
  'Firebase Storage',
];

export function ProvisioningWorkflow({ modeConfig }: ProvisioningWorkflowProps) {
  const [selectedService, setSelectedService] = useState<CloudService>('Google Maps');
  const [provisioningScript, setProvisioningScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  const addLog = useCallback((newLog: Omit<LogMessage, 'timestamp'>) => {
    setLogs((prev) => [...prev, { ...newLog, timestamp: new Date().toISOString() }]);
  }, []);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setProvisioningScript('');
    addLog({ level: 'info', message: `Generating provisioning script for ${selectedService}...` });

    try {
      const response = await fetch('http://localhost:3001/api/generate-provisioning-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService }),
      });

      const data = await response.json();
      setProvisioningScript(data.script);
      addLog({ level: 'success', message: 'Provisioning script generated successfully!' });
      addLog({ level: 'info', message: `Security features: ${data.provisioning.securityFeatures.join(', ')}` });
    } catch (error: any) {
      addLog({ level: 'error', message: `Error: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(provisioningScript);
    addLog({ level: 'success', message: 'Script copied to clipboard!' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Service Selection */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Select Google Cloud Service</h2>
          <p className="text-sm text-gray-400 mb-4">
            Generate secure provisioning scripts with API key restrictions and best practices built-in.
          </p>

          <div className="space-y-3">
            {CLOUD_SERVICES.map((service) => (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedService === service
                    ? 'border-morphlex-accent bg-morphlex-accent/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{service}</span>
                  {selectedService === service && <span className="text-morphlex-accent">✓</span>}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className="btn-primary w-full mt-6"
          >
            {isGenerating ? '⏳ Generating...' : '🚀 Generate Provisioning Script'}
          </button>
        </div>

        {/* Security Features Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Security Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>API keys restricted to specific domains</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Proper project permissions and quotas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Billing alerts and cost controls</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Commented scripts explaining each step</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column - Script Output */}
      <div className="space-y-6">
        {provisioningScript && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-morphlex-accent">
                Provisioning Script: {selectedService}
              </h2>
              <button onClick={handleCopyScript} className="btn-secondary">
                📋 Copy
              </button>
            </div>
            <CodeDisplay code={provisioningScript} language="bash" />
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded">
              <p className="text-sm text-blue-300">
                <strong>Next Steps:</strong>
              </p>
              <ol className="text-xs text-gray-300 mt-2 space-y-1 list-decimal list-inside">
                <li>Ensure you're authenticated with gcloud CLI</li>
                <li>Review the script for your specific needs</li>
                <li>Run the script in your terminal</li>
                <li>Save the generated API key securely</li>
              </ol>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-morphlex-accent mb-4">Generation Logs</h2>
            <LogViewer logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}
