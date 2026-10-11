import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Compass,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export const DeviceLocationView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const requestConsentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation API is not supported in this browser or platform.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        let msg = 'An unexpected geolocation error occurred.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Permission Denied: You declined the browser location authorization prompt.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Position Unavailable: Device location sensor is unreachable or GPS fix could not be established.';
            break;
          case err.TIMEOUT:
            msg = 'Request Timeout: Geolocation query timed out before obtaining satellite or network lock.';
            break;
        }
        setError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    const query = encodeURIComponent(`${lat},${lng}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Guarantee Header Card */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-cyan-950/70 border border-cyan-800/80 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Consent-Based Device Geolocation (GPS my-location)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono">
                100% LOCAL ONLY
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              This module operates in strict accordance with client-side privacy standards. It requests coordinates for
              <strong> your active device only</strong>. Phone numbers alone cannot provide real-time physical GPS coordinates.
            </p>
          </div>
        </div>

        {/* Bulleted Privacy Protocol */}
        <div className="mt-4 bg-[#080d19] p-4 rounded-lg border border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Explicit user confirmation required (never runs silently)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Never transmitted to remote tracking servers or data brokers</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>High-accuracy WGS-84 sensor reading with precision metric</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Standard Google Maps coordinate search link generation</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={requestConsentLocation}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Awaiting Browser Authorization...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>{coords ? 'Refresh My Device Location' : 'Share My Device Location'}</span>
              </>
            )}
          </button>

          <span className="text-xs text-slate-500 text-center sm:text-left">
            Clicking prompts your browser to request one-time location permission.
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-200 text-sm mb-1">Authorization or Sensor Failure</strong>
            <p>{error}</p>
            <p className="mt-1 text-slate-400">
              Check browser permissions at top left of your address bar or enable location services in your OS settings.
            </p>
          </div>
        </div>
      )}

      {/* Success coordinate card */}
      {coords && (
        <div className="bg-[#0b101e] border border-emerald-900/60 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-emerald-950/40 border-b border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-emerald-300 font-bold text-xs uppercase tracking-wider">
                [+] DEVICE GPS COORDINATES OBTAINED
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Timestamp: {new Date(coords.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#070b14] p-4 rounded-lg border border-slate-900">
              <span className="text-slate-400 block mb-1">Latitude</span>
              <span className="text-lg font-mono font-bold text-cyan-300">
                {coords.latitude.toFixed(6)}°
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">North/South Geographic Coordinate</span>
            </div>

            <div className="bg-[#070b14] p-4 rounded-lg border border-slate-900">
              <span className="text-slate-400 block mb-1">Longitude</span>
              <span className="text-lg font-mono font-bold text-cyan-300">
                {coords.longitude.toFixed(6)}°
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">East/West Geographic Coordinate</span>
            </div>

            <div className="bg-[#070b14] p-4 rounded-lg border border-slate-900">
              <span className="text-slate-400 block mb-1">Reported Accuracy</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ±{coords.accuracy.toFixed(1)} metres
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Horizontal Uncertainty Radius</span>
            </div>
          </div>

          {/* Official Google Maps Coordinates Link */}
          <div className="px-5 py-4 bg-[#080d19] border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="font-mono text-xs font-bold text-cyan-400 block">
                [OFFICIAL GOOGLE MAPS NAVIGATION LINK]
              </span>
              <p className="text-[11px] font-mono text-slate-300 mt-1 break-all select-all">
                {getGoogleMapsUrl(coords.latitude, coords.longitude)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyUrl(getGoogleMapsUrl(coords.latitude, coords.longitude))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>

              <a
                href={getGoogleMapsUrl(coords.latitude, coords.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Compass className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
