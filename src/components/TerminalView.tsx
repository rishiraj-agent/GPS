import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Play, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface TerminalViewProps {
  onTriggerLocationTab?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = () => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<Array<{ id: string; command: string; output: string; time: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    const startupBanner = `\x1b[96m
██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝
██║  ███╗██████╔╝███████╗
██║   ██║██╔═══╝ ╚════██║
╚██████╔╝██║     ███████║
 ╚═════╝ ╚═╝     ╚══════╝\x1b[0m

\x1b[1m\x1b[97m         GPS TOOL
   GEO & PHONE SUMMARY\x1b[0m

\x1b[90m[*] Platform: Kali Linux (WSL 2 Ready)
[*] Mode: Privacy-first analysis
[*] Version: 1.0.0
----------------------------------------------------\x1b[0m

Type \x1b[96mGPS --help\x1b[0m to list available commands or click quick actions below.`;

    setLogs([
      {
        id: 'init-1',
        command: 'GPS',
        output: startupBanner,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Color parser helper for ANSI escape sequences
  const renderAnsi = (text: string) => {
    const cleanLines = text.split('\n');
    return cleanLines.map((line, idx) => {
      // Basic ANSI conversion
      let formatted = line
        .replace(/\x1b\[96m/g, '<span class="text-cyan-400 font-semibold">')
        .replace(/\x1b\[92m/g, '<span class="text-emerald-400 font-medium">')
        .replace(/\x1b\[93m/g, '<span class="text-amber-400">')
        .replace(/\x1b\[91m/g, '<span class="text-rose-400">')
        .replace(/\x1b\[97m/g, '<span class="text-slate-100">')
        .replace(/\x1b\[90m/g, '<span class="text-slate-500">')
        .replace(/\x1b\[1m/g, '<span class="font-bold">')
        .replace(/\x1b\[0m/g, '</span>');

      return (
        <div
          key={idx}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  const executeCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputVal('');

    if (trimmed.toLowerCase() === 'clear') {
      setLogs([]);
      return;
    }

    setIsRunning(true);
    const timestamp = new Date().toLocaleTimeString();

    // Check if client-side special command
    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0];

    // Handle `GPS my-location` directly in browser if possible
    if ((mainCmd === 'GPS' || mainCmd === 'gps') && parts[1] === 'my-location') {
      if (navigator.geolocation) {
        setLogs((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            command: trimmed,
            output: `\x1b[96m[*] Requesting permission-approved device GPS coordinates...\x1b[0m\nAwaiting user authorization in browser prompt...`,
            time: timestamp,
          },
        ]);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;

            const geoOutput = `\x1b[92m[+] User location retrieved successfully with explicit consent.\x1b[0m

\x1b[96m[CURRENT DEVICE GPS METADATA]\x1b[0m
Consent Status        : \x1b[92mGranted explicitly by device user\x1b[0m
Latitude              : ${lat.toFixed(6)}
Longitude             : ${lng.toFixed(6)}
Reported Accuracy     : ±${acc.toFixed(1)} metres

\x1b[96m[GOOGLE MAPS NAVIGATION]\x1b[0m
Coordinates Link      : \x1b[96m${mapsUrl}\x1b[0m

\x1b[90m[*] Note: Coordinates reflect your client device location, NOT any phone subscriber.\x1b[0m`;

            setLogs((prev) => [
              ...prev.slice(0, -1),
              {
                id: String(Date.now()),
                command: trimmed,
                output: geoOutput,
                time: timestamp,
              },
            ]);
            setIsRunning(false);
          },
          (err) => {
            let msg = 'Unknown geolocation error';
            if (err.code === 1) msg = 'Permission denied: User declined geolocation request.';
            if (err.code === 2) msg = 'Position unavailable: Device sensor offline.';
            if (err.code === 3) msg = 'Request timed out.';

            setLogs((prev) => [
              ...prev.slice(0, -1),
              {
                id: String(Date.now()),
                command: trimmed,
                output: `\x1b[91m[-] Geolocation Error: ${msg}\x1b[0m\n\x1b[93m[!] Browser permission must be explicitly granted for GPS my-location.\x1b[0m`,
                time: timestamp,
              },
            ]);
            setIsRunning(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
        return;
      }
    }

    // Pass to backend subprocess runner
    try {
      const response = await fetch('/api/run-cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandArgs: parts.slice(1), // passes arguments to python GPS CLI
        }),
      });

      const data = await response.json();
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: trimmed,
          output: data.output || 'No output returned.',
          time: timestamp,
        },
      ]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: trimmed,
          output: `\x1b[91m[-] Execution failed: ${err.message}\x1b[0m`,
          time: timestamp,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= history.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx] || '');
        }
      }
    }
  };

  const quickCommands = [
    { label: 'GPS', cmd: 'GPS' },
    { label: 'GPS --help', cmd: 'GPS --help' },
    { label: 'Lookup (+91 India)', cmd: 'GPS lookup +919876543210' },
    { label: 'Lookup (+1 US)', cmd: 'GPS lookup 2025550123 --region US' },
    { label: 'Lookup (+44 UK)', cmd: 'GPS lookup 02079460192 --region GB' },
    { label: 'Device GPS (Consent)', cmd: 'GPS my-location' },
    { label: 'Version', cmd: 'GPS --version' },
    { label: 'Clear', cmd: 'clear' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#070b14] rounded-lg border border-slate-800 shadow-2xl overflow-hidden">
      {/* Terminal window title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1627] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-slate-400 font-mono ml-2">kali@kali: ~/GPS</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 hidden sm:inline">bash (xterm-256color)</span>
          <button
            onClick={() => setLogs([])}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick command buttons toolbar */}
      <div className="bg-[#0b101c] px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">
          Quick Commands:
        </span>
        {quickCommands.map((q) => (
          <button
            key={q.cmd}
            onClick={() => executeCommand(q.cmd)}
            disabled={isRunning}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-800/60 transition-all font-mono whitespace-nowrap text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-2.5 h-2.5 text-cyan-400" />
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal log window */}
      <div
        className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-[13px] text-slate-200 select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((log) => (
          <div key={log.id} className="mb-4">
            <div className="text-slate-400 flex items-center gap-1 mb-1 select-none">
              <span className="text-cyan-400 font-bold">┌──(kali㉿kali)</span>
              <span className="text-slate-500">-[~/GPS]</span>
            </div>
            <div className="flex items-center gap-2 mb-2 text-slate-100">
              <span className="text-cyan-400 font-bold select-none">└─$</span>
              <span className="font-semibold text-white">{log.command}</span>
              <span className="text-[10px] text-slate-600 ml-auto select-none">{log.time}</span>
            </div>
            <div className="bg-[#050810]/60 p-3 rounded border border-slate-900/60 font-mono overflow-x-auto whitespace-pre-wrap">
              {renderAnsi(log.output)}
            </div>
          </div>
        ))}

        {/* Current active prompt */}
        <div className="mt-2">
          <div className="text-slate-400 flex items-center gap-1 select-none">
            <span className="text-cyan-400 font-bold">┌──(kali㉿kali)</span>
            <span className="text-slate-500">-[~/GPS]</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-cyan-400 font-bold select-none">└─$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              placeholder={isRunning ? 'Executing command...' : 'Type GPS lookup +919876543210 or GPS --help...'}
              className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder-slate-600 text-xs sm:text-[13px]"
              autoFocus
            />
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
        </div>

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal footer status & privacy reminder */}
      <div className="px-4 py-2 bg-[#0a0f1d] border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Strict Privacy Engine: No external tracking servers • No subscriber snooping</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">Use &apos;clear&apos; to wipe terminal</span>
      </div>
    </div>
  );
};
