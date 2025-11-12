import React, { useState, useEffect } from 'react';
import type { MorphlexMode, ModeConfig } from 'types';
import { MigrationWorkflow } from './components/MigrationWorkflow';
import { ProvisioningWorkflow } from './components/ProvisioningWorkflow';
import { ModeSelector } from './components/ModeSelector';
import { Header } from './components/Header';

type Tab = 'migration' | 'provisioning';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('migration');
  const [modeConfig, setModeConfig] = useState<ModeConfig>({
    mode: 'preview' as MorphlexMode,
    hasVSCodeExtension: false,
    canExecuteLocally: false,
  });

  // Check for VS Code extension availability
  useEffect(() => {
    checkVSCodeConnection();
  }, []);

  const checkVSCodeConnection = async () => {
    try {
      const ws = new WebSocket('ws://localhost:3030');

      ws.onopen = () => {
        setModeConfig({
          mode: 'execution' as MorphlexMode,
          hasVSCodeExtension: true,
          canExecuteLocally: true,
        });
        ws.close();
      };

      ws.onerror = () => {
        setModeConfig({
          mode: 'preview' as MorphlexMode,
          hasVSCodeExtension: false,
          canExecuteLocally: false,
        });
      };
    } catch (error) {
      setModeConfig({
        mode: 'preview' as MorphlexMode,
        hasVSCodeExtension: false,
        canExecuteLocally: false,
      });
    }
  };

  const handleModeChange = (mode: MorphlexMode) => {
    if (mode === 'execution' && !modeConfig.hasVSCodeExtension) {
      alert('VS Code extension not detected. Please install and activate the Morphlex AI extension for execution mode.');
      return;
    }
    setModeConfig({ ...modeConfig, mode });
  };

  return (
    <div className="min-h-screen bg-morphlex-darker">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selector */}
        <ModeSelector
          currentMode={modeConfig.mode}
          onModeChange={handleModeChange}
          hasVSCodeExtension={modeConfig.hasVSCodeExtension}
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mt-8 mb-8">
          <button
            onClick={() => setCurrentTab('migration')}
            className={currentTab === 'migration' ? 'tab-active' : 'tab-inactive'}
          >
            🔄 SDK Migration
          </button>
          <button
            onClick={() => setCurrentTab('provisioning')}
            className={currentTab === 'provisioning' ? 'tab-active' : 'tab-inactive'}
          >
            ☁️ Cloud Provisioning
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-slide-in">
          {currentTab === 'migration' ? (
            <MigrationWorkflow modeConfig={modeConfig} />
          ) : (
            <ProvisioningWorkflow modeConfig={modeConfig} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Morphlex AI - The AI Migration Engineer</p>
          <p className="mt-1">
            Powered by Google Gemini • Built with React & TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
