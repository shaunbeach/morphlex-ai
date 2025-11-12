import React from 'react';
import type { MorphlexMode } from 'types';

interface ModeSelectorProps {
  currentMode: MorphlexMode;
  onModeChange: (mode: MorphlexMode) => void;
  hasVSCodeExtension: boolean;
}

export function ModeSelector({ currentMode, onModeChange, hasVSCodeExtension }: ModeSelectorProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-morphlex-accent mb-2">Operation Mode</h2>
          <p className="text-sm text-gray-400">
            {currentMode === 'preview'
              ? '📋 Preview Mode - Generate migration scripts without execution'
              : '⚡ Execution Mode - Full autonomous migration with test validation'}
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onModeChange('preview' as MorphlexMode)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentMode === 'preview'
                ? 'bg-morphlex-accent text-white shadow-lg scale-105'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📋 Preview
          </button>
          <button
            onClick={() => onModeChange('execution' as MorphlexMode)}
            disabled={!hasVSCodeExtension}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              currentMode === 'execution'
                ? 'bg-morphlex-accent text-white shadow-lg scale-105'
                : hasVSCodeExtension
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            ⚡ Execution
            {!hasVSCodeExtension && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                VS Code Required
              </span>
            )}
          </button>
        </div>
      </div>

      {!hasVSCodeExtension && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-300">
            ⚠️ <strong>VS Code Extension Not Detected</strong>
          </p>
          <p className="text-xs text-yellow-200 mt-1">
            Install the Morphlex AI VS Code extension and press F5 to enable execution mode with autonomous
            migrations and test validation.
          </p>
        </div>
      )}
    </div>
  );
}
