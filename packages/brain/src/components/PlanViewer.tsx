import React from 'react';
import type { PlanStep, PlanStepStatus } from 'types';

interface PlanViewerProps {
  plan: PlanStep[];
}

export function PlanViewer({ plan }: PlanViewerProps) {
  const getStatusClass = (status: PlanStepStatus) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Running':
        return 'status-running';
      case 'Success':
        return 'status-success';
      case 'Failed':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status: PlanStepStatus) => {
    switch (status) {
      case 'Pending':
        return '⏳';
      case 'Running':
        return '▶️';
      case 'Success':
        return '✅';
      case 'Failed':
        return '❌';
      default:
        return '•';
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'git':
        return '🌿';
      case 'npm':
        return '📦';
      case 'jscodeshift':
        return '🔧';
      case 'test':
        return '🧪';
      case 'fs':
        return '📁';
      case 'gcloud':
        return '☁️';
      default:
        return '🔨';
    }
  };

  return (
    <div className="space-y-3">
      {plan.map((step, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 transition-all ${
            step.status === 'Running'
              ? 'border-blue-500 bg-blue-900/10'
              : step.status === 'Success'
              ? 'border-green-700 bg-green-900/10'
              : step.status === 'Failed'
              ? 'border-red-700 bg-red-900/10'
              : 'border-gray-700 bg-gray-800/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getToolIcon(step.tool)}</span>
                <span className="font-semibold text-gray-200">
                  Step {index + 1}: {step.tool}
                </span>
                <span className={getStatusClass(step.status)}>
                  {getStatusIcon(step.status)} {step.status}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{step.step}</p>
              {step.description && (
                <p className="text-xs text-gray-500">{step.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
