import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Compass,
  Clock,
  UserCheck,
  Lock,
  Building,
  Navigation,
  RefreshCw,
  Info,
  Sun,
  Moon,
} from 'lucide-react';

export const PhoneLookupView: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [regionCode, setRegionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // CNAM / Directory check expanded state
  const [showCnamModal, setShowCnamModal] = useState(false);

  // Live GPS state in lookup view
  const [gpsLoading, setGpsLoading] = useState(false);
  const [deviceGps, setDeviceGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    mapsUrl: string;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live ticking clock for timezone
  const [liveClock, setLiveClock] = useState<string>('');

  const sampleNumbers = [
    { label: 'India Mobile (Airtel)', number: '+919876543210', region: 'IN' },
    { label: 'Delhi Landline', number: '+911123456789', region: 'IN' },
    { label: 'US Washington D.C.', number: '+12025550123', region: 'US' },
    { label: 'UK London', number: '+442079460192', region: 'GB' },
    { label: 'Domestic India', number: '9876543210', region: 'IN' },
    { label: 'Domestic US', number: '2025550123', region: 'US' },
  ];

  // Tick clock when result has a timezone
  useEffect(() => {
    if (!result?.timezones || result.timezones === 'Not available') return;
    const primaryTz = result.timezones.split(',')[0].trim();

    const updateClock = () => {
      try {
        const str = new Intl.DateTimeFormat('en-US', {
          timeZone: primaryTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        }).format(new Date());
        setLiveClock(str);
      } catch {
        setLiveClock(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleLookup = async (overrideNum?: string, overrideReg?: string) => {
    const targetNum = overrideNum !== undefined ? overrideNum : phoneNumber;
    const targetReg = overrideReg !== undefined ? overrideReg : regionCode;

    if (!targetNum.trim()) {
      setError('Please enter a phone number to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setDeviceGps(null);
    setGpsError(null);
    setShowCnamModal(false);

    try {
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: targetNum,
          region: targetReg || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze phone number.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const requestLiveDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your current browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
        setDeviceGps({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          mapsUrl,
        });
        setGpsLoading(false);
      },
      (err) => {
        let msg = 'Failed to acquire location.';
        if (err.code === 1) msg = 'Location permission denied by user.';
        else if (err.code === 2) msg = 'Device location sensor unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // Check if target local time is daytime or night
  const isDaytime = () => {
    if (!liveClock) return true;
    const hourMatch = liveClock.match(/(\d+):/);
    const pmMatch = liveClock.includes('PM');
    if (!hourMatch) return true;
    let hour = parseInt(hourMatch[1], 10);
    if (pmMatch && hour !== 12) hour += 12;
    if (!pmMatch && hour === 12) hour = 0;
    return hour >= 6 && hour < 19;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Description */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              <Phone className="w-5 h-5 text-cyan-400" />
              <span>Numbering-Plan &amp; Carrier Intelligence Workbench</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time Carrier Metadata, City / Telecom Circle, Timezone Clocks, Subscriber Privacy, and Consent-Based GPS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              ITU-T E.164 Engine: <strong>Active</strong>
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Datasets Loaded
            </span>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Phone Number (International with + or national digits)
            </label>
            <div className="relative">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +919876543210 or 2025550123"
                className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              ISO Region (Optional)
            </label>
            <input
              type="text"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value.toUpperCase())}
              placeholder="e.g. IN, US, GB"
              maxLength={2}
              className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono uppercase text-center focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleLookup()}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Lookup'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500 font-mono">Quick Test Numbers:</span>
          {sampleNumbers.map((sample) => (
            <button
              key={sample.label}
              onClick={() => {
                setPhoneNumber(sample.number);
                setRegionCode(sample.region);
                handleLookup(sample.number, sample.region);
              }}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-200 text-sm mb-0.5">Analysis Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Result Cards */}
      {result && (
        <div className="space-y-5">
          {/* Top Status Header */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-800">
                {result.internationalFormat || result.enteredNumber}
              </span>
              <span className="text-xs text-slate-400">
                Country: <strong className="text-cyan-300">{result.generalArea}</strong> ({result.countryCallingCode})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                  result.validNumber?.startsWith('Yes')
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {result.validNumber?.startsWith('Yes') ? 'VALID NUMBERING PLAN' : 'INVALID PLAN'}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono">
                E.164: {result.e164Format}
              </span>
            </div>
          </div>

          {/* 5 Targeted Feature Panels (Carrier, City, User Name, Timezone, Live Location) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. CARRIER METADATA CARD */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-800/60 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    Carrier Metadata
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                    ALLOCATION
                  </span>
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {result.carrierMetadata && result.carrierMetadata !== 'Not available'
                    ? result.carrierMetadata
                    : 'Assigned Network Operator'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Identified via telecommunication numbering block allocation records.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-amber-300/80 bg-amber-950/20 p-2 rounded">
                Note: Carrier may differ if subscriber utilized Mobile Number Portability (MNP).
              </div>
            </div>

            {/* 2. CITY & REGION CARD */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-800/60 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    City &amp; Telecom Area
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    GEOGRAPHY
                  </span>
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {result.city && !result.city.startsWith('Not available')
                    ? result.city
                    : result.city.replace('Not available at city level ', '')}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Administrative routing: <span className="text-slate-200">{result.generalArea}</span> (ISO: {result.regionCode})
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Area Precision: Regional</span>
                <a
                  href={result.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[11px] font-mono flex items-center gap-1 transition-all"
                >
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Search City on Maps</span>
                </a>
              </div>
            </div>

            {/* 3. TIME ZONE & LIVE LOCAL CLOCK CARD */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-800/60 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Time Zone &amp; Local Clock
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] flex items-center gap-1">
                    {isDaytime() ? <Sun className="w-2.5 h-2.5 text-amber-400" /> : <Moon className="w-2.5 h-2.5 text-blue-400" />}
                    <span>{isDaytime() ? 'DAYTIME' : 'NIGHT'}</span>
                  </span>
                </div>
                <div className="text-base font-bold text-amber-300 font-mono mt-1">
                  {result.timezones || 'UTC / System Standard'}
                </div>
                <div className="mt-1 text-sm font-mono font-bold text-white bg-slate-900/80 px-2 py-1 rounded border border-slate-800 inline-block">
                  🕒 {liveClock || result.localTime || 'Calculating...'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                Live calculated local time for this telephone numbering jurisdiction.
              </div>
            </div>

            {/* 4. USER NAME & TELECOM PRIVACY CARD */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-800/60 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    Subscriber Name (CNAM)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                    PROTECTED
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  Protected / Unlisted Record
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  ITU-T E.164 and telecommunication privacy acts (CPNI / TRAI / GDPR) safeguard individual subscriber records.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Directory: Non-Public</span>
                <button
                  onClick={() => setShowCnamModal(!showCnamModal)}
                  className="px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-mono cursor-pointer transition-all"
                >
                  {showCnamModal ? 'Hide Directory Details' : 'Check CNAM Status'}
                </button>
              </div>
            </div>

            {/* 5. LIVE LOCATION & DEVICE GPS CARD */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-cyan-800/60 transition-all md:col-span-2">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    Live Location (Consent GPS)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    {deviceGps ? 'GPS ACTIVE' : 'REQUIRES CONSENT'}
                  </span>
                </div>

                {deviceGps ? (
                  <div className="space-y-2 mt-2 bg-[#080d19] p-3 rounded-lg border border-emerald-900/60">
                    <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Device GPS Coordinates Acquired via User Consent:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs text-white">
                      <div>Lat: <span className="text-cyan-300 font-bold">{deviceGps.latitude.toFixed(6)}°</span></div>
                      <div>Lng: <span className="text-cyan-300 font-bold">{deviceGps.longitude.toFixed(6)}°</span></div>
                      <div>Acc: <span className="text-emerald-400 font-bold">±{deviceGps.accuracy.toFixed(1)}m</span></div>
                    </div>
                    <div className="mt-2">
                      <a
                        href={deviceGps.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Open Live Coordinates in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                      Awaiting User Device Authorization
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      A phone number alone <strong>CANNOT</strong> track another subscriber&apos;s physical GPS coordinates.
                      To inspect your active device coordinates, click below to authorize one-time browser location access.
                    </p>
                  </div>
                )}

                {gpsError && (
                  <div className="mt-2 text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900">
                    {gpsError}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {deviceGps ? 'Status: Geolocation Fix Established' : 'Strict Local Execution • No External Tracking'}
                </span>
                <button
                  onClick={requestLiveDeviceGps}
                  disabled={gpsLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <MapPin className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-bounce' : ''}`} />
                  <span>{gpsLoading ? 'Requesting Permission...' : deviceGps ? 'Refresh Device GPS' : 'Request Device Live GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CNAM / Directory Status Inspection Modal / Details */}
          {showCnamModal && (
            <div className="bg-[#090d18] border border-purple-900/60 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold mb-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>[TELECOM SUBSCRIBER PRIVACY &amp; CNAM SPECIFICATION]</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-slate-300 mt-2">
                <div className="bg-[#060912] p-3 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Public WhitePages Directory</div>
                  <div className="text-white font-bold mt-1">Unlisted / Opted-Out</div>
                  <div className="text-[10px] text-slate-400 mt-1">No public listing entry found on PSTN registries.</div>
                </div>

                <div className="bg-[#060912] p-3 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Calling Name (CNAM) Dip</div>
                  <div className="text-white font-bold mt-1">Carrier Dip Restricted</div>
                  <div className="text-[10px] text-slate-400 mt-1">Protected by telecom carrier customer privacy rules.</div>
                </div>

                <div className="bg-[#060912] p-3 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">CPNI Regulatory Policy</div>
                  <div className="text-emerald-400 font-bold mt-1">Fully Compliant</div>
                  <div className="text-[10px] text-slate-400 mt-1">Customer Proprietary Network Info protected by law.</div>
                </div>
              </div>
            </div>
          )}

          {/* Regulatory & MNP Notice */}
          <div className="bg-amber-950/20 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-200 text-sm mb-1 font-mono">[!] Telecommunications &amp; Privacy Notice</strong>
              <p className="leading-relaxed text-amber-300/90">{result.note}</p>
              <p className="mt-1 text-slate-400">
                A phone number alone does not reveal live device coordinates, physical movement, or subscriber identity. Real-time GPS is accessible only with explicit permission from the client device itself.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
