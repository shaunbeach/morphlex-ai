import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  language: string;
  maxHeight?: string;
}

export function CodeDisplay({ code, language, maxHeight = '500px' }: CodeDisplayProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-800">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          maxHeight,
          fontSize: '0.875rem',
        }}
        showLineNumbers
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
