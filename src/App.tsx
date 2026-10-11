/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KaliHeader } from './components/KaliHeader';
import { TerminalView } from './components/TerminalView';
import { PhoneLookupView } from './components/PhoneLookupView';
import { DeviceLocationView } from './components/DeviceLocationView';
import { AiTelecomIntelView } from './components/AiTelecomIntelView';
import { SourceCodeView } from './components/SourceCodeView';
import { TestReportView } from './components/TestReportView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('terminal');
  const [isTesting, setIsTesting] = useState(false);

  const handleRunTestsFromHeader = async () => {
    setActiveTab('tests');
    setIsTesting(true);
    try {
      await fetch('/api/run-tests', { method: 'POST' });
    } catch {
      // Handled in TestReportView
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-900 selection:text-white">
      {/* Top Kali Linux navigation bar */}
      <KaliHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunTests={handleRunTestsFromHeader}
        isTesting={isTesting}
      />

      {/* Main content body */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'terminal' && (
          <div className="h-[760px]">
            <TerminalView onTriggerLocationTab={() => setActiveTab('location')} />
          </div>
        )}

        {activeTab === 'lookup' && <PhoneLookupView />}

        {activeTab === 'location' && <DeviceLocationView />}

        {activeTab === 'ai-intel' && <AiTelecomIntelView />}

        {activeTab === 'source' && <SourceCodeView />}

        {activeTab === 'tests' && <TestReportView />}
      </main>

      {/* System Footer */}
      <footer className="border-t border-slate-900/90 bg-[#060a12] py-3 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>GPS (Geo &amp; Phone Summary) • Kali Linux &amp; WSL 2 Utility</span>
          <span className="text-slate-600">
            Privacy First: No silent tracking • No subscriber identity records • Localhost device consent
          </span>
          <span className="text-cyan-400">v1.0.0 Stable</span>
        </div>
      </footer>
    </div>
  );
}
