import React from 'react';

interface PawPrintProps {
  className: string;
  isCat?: boolean;
}

const PawPrint: React.FC<PawPrintProps> = ({ className, isCat = false }) => (
  <svg className={className} width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
    {isCat ? (
      <path d="M6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-6 6c-4 0-8 2-8 6h16c0-4-4-6-8-6z"/>
    ) : (
      <path d="M5 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 7c-5 0-9 3-9 6h18c0-3-4-6-9-6z"/>
    )}
  </svg>
);

export default PawPrint;
