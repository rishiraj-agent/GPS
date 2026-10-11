import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, ShieldCheck, Play } from 'lucide-react';

interface KaliHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunTests: () => void;
  isTesting: boolean;
}

export const KaliHeader: React.FC<KaliHeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunTests,
  isTesting,
}) => {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(
      'unzip GPS.zip && cd GPS && chmod +x install.sh && ./install.sh && source ~/.bashrc && GPS --help'
    );
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const navItems = [
    { id: 'terminal', label: 'Kali Terminal', icon: '💻' },
    { id: 'lookup', label: 'Phone Lookup', icon: '📞' },
    { id: 'location', label: 'Consent GPS', icon: '📍' },
    { id: 'ai-intel', label: 'AI Telecom Intel', icon: '🧠' },
    { id: 'source', label: 'Source Explorer', icon: '📂' },
    { id: 'tests', label: 'Test Suite (16/16)', icon: '🧪' },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0d1322] sticky top-0 z-40 shadow-xl">
      {/* Top system status bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 text-xs border-b border-slate-800/80 bg-[#080d1a] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>KALI LINUX 2024.x [WSL 2 COMPATIBLE]</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Tool: <strong className="text-white">GPS (Geo &amp; Phone Summary)</strong> v1.0.0</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy-First Mode Active
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <button
            onClick={copyInstallCommand}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
            title="Copy one-line Kali Linux installation script"
          >
            {copiedInstall ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Install Command!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-cyan-400" />
                <span>Copy Kali Install Command</span>
              </>
            )}
          </button>

          <a
            href="/api/download-zip"
            download="GPS.zip"
            className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5 transition-all text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span>Download GPS.zip</span>
          </a>

          <button
            onClick={onRunTests}
            disabled={isTesting}
            className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 flex items-center gap-1 transition-all text-[11px] cursor-pointer"
          >
            <Play className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="flex items-center overflow-x-auto px-4 py-1.5 gap-1.5 bg-[#0b101c]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-cyan-300 border-cyan-400 shadow-[0_2px_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
