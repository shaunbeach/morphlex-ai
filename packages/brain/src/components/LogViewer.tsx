import React, { useEffect, useRef } from 'react';
import type { LogMessage } from 'types';

interface LogViewerProps {
  logs: LogMessage[];
  maxHeight?: string;
}

export function LogViewer({ logs, maxHeight = '400px' }: LogViewerProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'log-info';
      case 'success':
        return 'log-success';
      case 'warning':
        return 'log-warning';
      case 'error':
        return 'log-error';
      case 'stdout':
        return 'log-stdout';
      case 'stderr':
        return 'log-stderr';
      default:
        return 'log-info';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'stdout':
        return '▶️';
      case 'stderr':
        return '🔴';
      default:
        return '•';
    }
  };

  return (
    <div
      className="bg-gray-900 rounded-lg p-4 overflow-y-auto font-mono text-sm border border-gray-800"
      style={{ maxHeight }}
    >
      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No logs yet...</p>
      ) : (
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className={getLogClass(log.level)}>
              <span className="mr-2">{getLogIcon(log.level)}</span>
              <span className="text-gray-500 text-xs">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
