import React, { useState } from 'react';
import { Sparkles, Brain, ShieldAlert, Radio, Send, RefreshCw, Cpu, Terminal } from 'lucide-react';

export const AiTelecomIntelView: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [regionCode, setRegionCode] = useState('IN');
  const [carrier, setCarrier] = useState('Airtel / Telecom Allocation');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHighThinkingAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setEngine(null);
    setNotice(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          regionCode,
          carrier,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate threat intelligence.');
      }
      setAnalysis(data.analysis);
      setEngine(data.engine || 'AI Engine');
      setNotice(data.notice || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
                <Brain className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>AI Telecom &amp; Privacy Threat Intelligence</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 text-[10px] font-mono uppercase tracking-wider">
                  AI REASONING ENGINE (Active)
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Leverages high-order cognitive reasoning to evaluate telecom numbering architectures, SS7/Diameter threat models,
              caller-ID spoofing surfaces, SIM-swap vulnerabilities, and why live GPS tracking cannot be derived from a phone number alone.
            </p>
          </div>
        </div>

        {/* Configuration inputs */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              placeholder="+919876543210"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">ISO Country Region</label>
            <input
              type="text"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value.toUpperCase())}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500 uppercase"
              placeholder="IN"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Carrier Metadata</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              placeholder="Airtel / Verizon"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Thinking Budget: High • System Instruction: Senior OSINT Telecom Analyst</span>
          </div>

          <button
            onClick={runHighThinkingAnalysis}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-950"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deep Reasoning in Progress...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>Execute High Thinking Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong className="block text-rose-200 text-sm mb-1">Intelligence Generation Error</strong>
          <p>{error}</p>
        </div>
      )}

      {/* Result Display */}
      {analysis && (
        <div className="bg-[#0b101e] border border-purple-900/60 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-purple-950/40 border-b border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>[TELECOM SECURITY &amp; PRIVACY THREAT INTELLIGENCE DOSSIER]</span>
            </div>
            {engine && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 border border-purple-700 w-fit">
                {engine}
              </span>
            )}
          </div>

          {notice && (
            <div className="px-5 py-2 bg-amber-950/30 border-b border-amber-900/40 text-[11px] text-amber-300 font-mono flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <div className="p-6 font-mono text-xs sm:text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap select-text bg-[#070b14]">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};
