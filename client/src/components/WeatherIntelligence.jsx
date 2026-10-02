import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import {
  AlertTriangle,
  CloudSun,
  Compass,
  Eye,
  Gauge,
  MapPin,
  Radio,
  Snowflake,
  Thermometer,
  Wind
} from 'lucide-react';

function getSeverity(weather) {
  const condition = weather.condition?.toLowerCase() || '';
  if (condition.includes('blizzard') || weather.visibilityKm < 3 || weather.windSpeedKnots >= 35) return 'HIGH';
  if (weather.visibilityKm < 8 || weather.windSpeedKnots >= 25 || weather.temperature <= -25) return 'ELEVATED';
  return 'NOMINAL';
}

function severityClasses(severity) {
  if (severity === 'HIGH') return 'text-red-300 bg-red-950/70 border-red-500/40';
  if (severity === 'ELEVATED') return 'text-amber-300 bg-amber-950/70 border-amber-500/40';
  return 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40';
}

export default function WeatherIntelligence({ stations, selectedStation, onSelectStation }) {
  const activeStation = stations.find(station => station.id === selectedStation) || stations[0] || {};
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState('cached');
  const weather = liveWeather || activeStation.weather || {};

  useEffect(() => {
    if (!activeStation.id) return undefined;
    let cancelled = false;
    const loadLiveWeather = async () => {
      setWeatherStatus('loading');
      try {
        const response = await apiFetch(`/api/weather/live/${activeStation.id}`);
        const data = await response.json();
        if (!cancelled && response.ok && data.weather) {
          setLiveWeather(data.weather);
          setWeatherStatus(data.live ? 'live' : 'cached');
        } else if (!cancelled) setWeatherStatus('fallback');
      } catch {
        if (!cancelled) setWeatherStatus('fallback');
      }
    };
    setLiveWeather(null);
    loadLiveWeather();
    const interval = setInterval(loadLiveWeather, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeStation.id]);
  const severity = getSeverity(weather);
  const condition = weather.condition || 'Awaiting station telemetry';

  return (
    <div className="space-y-6">
      <section className="frost-panel p-5 rounded-2xl border-sky-500/30 bg-gradient-to-r from-sky-950/50 via-polar-900 to-polar-900">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sky-300 font-mono text-xs uppercase tracking-wider mb-2">
              <CloudSun className="w-4 h-4" /> Polar weather intelligence / {weatherStatus === 'live' ? 'live provider feed' : weatherStatus === 'loading' ? 'updating feed' : 'station cache'}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Weather & Field Conditions</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">Read the conditions before you move people, fuel, or cargo across the ice.</p>
          </div>
          <div className="flex items-center gap-2 bg-polar-950/70 p-1.5 rounded-xl border border-polar-800 overflow-x-auto">
            {stations.map(station => (
              <button key={station.id} onClick={() => onSelectStation(station.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${station.id === activeStation.id ? 'bg-sky-400 text-polar-950 font-bold' : 'text-slate-400 hover:text-white'}`}>
                {station.name.replace(' Station', '')}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="frost-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-sky-400/10" />
          <div className="absolute right-4 top-4 w-32 h-32 rounded-full border border-sky-400/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase"><MapPin className="w-3.5 h-3.5 text-sky-400" />{activeStation.name}</div>
              <div className="text-6xl font-extrabold text-white font-mono mt-4">{weather.temperature ?? '--'}°</div>
              <div className="text-sm text-slate-400 mt-1">Feels like <span className="text-sky-300 font-mono">{weather.feelsLike ?? '--'}°C</span></div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold ${severityClasses(severity)}`}>
              {severity} WEATHER RISK
            </div>
          </div>
          <div className="relative mt-8 flex items-center gap-2 text-sky-200">
            <Snowflake className="w-5 h-5 text-sky-400" />
            <span className="font-semibold">{condition}</span>
          </div>
          <div className="relative mt-6 pt-4 border-t border-polar-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Source: {weather.dataSource || 'Station AWS'}</span>
            <span>Updated: {weather.lastUpdated ? new Date(weather.lastUpdated).toLocaleTimeString() : 'Awaiting feed'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Wind} label="Wind speed" value={`${weather.windSpeedKnots ?? '--'} kts`} detail={weather.windDirection || 'Direction pending'} color="text-cyan-300" />
          <Metric icon={Eye} label="Visibility" value={`${weather.visibilityKm ?? '--'} km`} detail={weather.visibilityKm < 3 ? 'Travel restricted' : 'Operational range'} color="text-amber-300" />
          <Metric icon={Gauge} label="Pressure" value={`${weather.pressureHpa ?? '--'} hPa`} detail="Surface station reading" color="text-indigo-300" />
          <Metric icon={Thermometer} label="Thermal stress" value={weather.feelsLike ? `${weather.feelsLike}°C` : '--'} detail="Wind-chill index" color="text-red-300" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {stations.map(station => {
          const stationWeather = station.weather || {};
          const stationSeverity = getSeverity(stationWeather);
          return (
            <button key={station.id} onClick={() => onSelectStation(station.id)} className={`text-left frost-panel p-4 rounded-xl border transition ${station.id === activeStation.id ? 'border-sky-400/70 shadow-polar-glow' : 'border-polar-700/60 hover:border-sky-500/40'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">{station.name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${severityClasses(stationSeverity)}`}>{stationSeverity}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{station.location}</div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-polar-800 text-xs font-mono">
                <div><div className="text-[9px] text-slate-500 uppercase">Temp</div><div className="text-white">{stationWeather.temperature}°C</div></div>
                <div><div className="text-[9px] text-slate-500 uppercase">Wind</div><div className="text-cyan-300">{stationWeather.windSpeedKnots} kts</div></div>
                <div><div className="text-[9px] text-slate-500 uppercase">Visibility</div><div className="text-white">{stationWeather.visibilityKm} km</div></div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="frost-panel p-5 rounded-2xl border-amber-500/20 bg-amber-950/10">
        <div className="flex items-start gap-3">
          {severity === 'HIGH' ? <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" /> : <Radio className="w-5 h-5 text-emerald-400 mt-0.5" />}
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Operational recommendation</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {severity === 'HIGH' ? 'Suspend non-essential traverse movements, confirm field team check-ins, and keep emergency fuel and medical response assets staged.' : severity === 'ELEVATED' ? 'Proceed with a weather briefing, buddy verification, and route visibility check before dispatching field personnel or cargo.' : 'Conditions are within the nominal operating envelope. Continue standard monitoring and scheduled station check-ins.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="frost-panel p-4 rounded-xl border-polar-700/60">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="text-[10px] text-slate-400 font-mono uppercase mt-3">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{detail}</div>
    </div>
  );
}