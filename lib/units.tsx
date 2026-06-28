'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type System = 'metric' | 'imperial';

interface UnitsContext {
  system: System;
  setSystem: (s: System) => void;
  /** Format a Celsius value into the active unit, e.g. "21°". */
  temp: (celsius: number) => string;
  /** Numeric value in the active unit (for SVG labels etc.). */
  tempVal: (celsius: number) => number;
  /** Format a km/h wind speed into the active unit. */
  wind: (kmh: number) => string;
  unitSuffix: string; // "C" | "F"
}

const Ctx = createContext<UnitsContext | null>(null);
const KEY = 'weatherscope:units';

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [system, setSystemState] = useState<System>('metric');

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === 'metric' || saved === 'imperial') setSystemState(saved);
  }, []);

  function setSystem(s: System) {
    setSystemState(s);
    try { localStorage.setItem(KEY, s); } catch { /* ignore */ }
  }

  const tempVal = (c: number) => Math.round(system === 'imperial' ? c * 9 / 5 + 32 : c);
  const temp = (c: number) => `${tempVal(c)}°`;
  const wind = (kmh: number) =>
    system === 'imperial' ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
  const unitSuffix = system === 'imperial' ? 'F' : 'C';

  return (
    <Ctx.Provider value={{ system, setSystem, temp, tempVal, wind, unitSuffix }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUnits(): UnitsContext {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback (metric) if used outside a provider — keeps components resilient.
    return {
      system: 'metric',
      setSystem: () => {},
      temp: (c: number) => `${Math.round(c)}°`,
      tempVal: (c: number) => Math.round(c),
      wind: (kmh: number) => `${Math.round(kmh)} km/h`,
      unitSuffix: 'C',
    };
  }
  return ctx;
}

/** Segmented °C / °F toggle for the header. */
export function UnitToggle() {
  const { system, setSystem } = useUnits();
  return (
    <div className="inline-flex items-center rounded-full bg-[var(--surface-2)] p-0.5 text-xs font-semibold">
      <button
        onClick={() => setSystem('metric')}
        className={`px-2.5 py-1 rounded-full transition-colors ${system === 'metric' ? 'text-black' : 'text-dim hover:text-white'}`}
        style={system === 'metric' ? { background: 'var(--accent)' } : undefined}
        aria-pressed={system === 'metric'}
      >
        °C
      </button>
      <button
        onClick={() => setSystem('imperial')}
        className={`px-2.5 py-1 rounded-full transition-colors ${system === 'imperial' ? 'text-black' : 'text-dim hover:text-white'}`}
        style={system === 'imperial' ? { background: 'var(--accent)' } : undefined}
        aria-pressed={system === 'imperial'}
      >
        °F
      </button>
    </div>
  );
}
