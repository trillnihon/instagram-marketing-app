import React, { useState } from 'react';
import FacebookDiagnostics from '../components/FacebookDiagnostics';
import Navigation from '../components/Navigation';

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('diagnostics');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            診断ツール
          </h1>
          <p className="text-gray-600">
            Facebook Graph APIの接続状況と権限を診断します
          </p>
        </div>
        
        <FacebookDiagnostics />
      </div>
    </div>
  );
};

export default Diagnostics; 