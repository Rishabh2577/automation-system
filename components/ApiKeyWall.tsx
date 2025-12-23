
import React from 'react';

interface ApiKeyWallProps {
  onKeySelected: () => void;
}

const ApiKeyWall: React.FC<ApiKeyWallProps> = ({ onKeySelected }) => {
  const handleOpenSelectKey = async () => {
    await window.aistudio.openSelectKey();
    // Proceed assuming selection was successful to avoid race conditions
    onKeySelected();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold gradient-text">Secure Access Required</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          To generate high-fidelity cinematic videos using Veo 3, you must select a valid API key from a paid Google Cloud project.
        </p>
        <div className="space-y-4 pt-4">
          <button
            onClick={handleOpenSelectKey}
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
          >
            Select API Key
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-gray-500 hover:text-white transition-colors underline"
          >
            Learn about API billing & setup
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWall;
