import { useMemo } from 'react';

const PRESETS = [
  { id: 'Apical 4C', label: 'Apical 4C' },
  { id: 'PLAX', label: 'PLAX' },
  { id: 'PSAX', label: 'PSAX' },
  { id: 'Subcostal', label: 'Subcostal' },
];

const MODES = [
  { id: '2D', label: '2D' },
  { id: 'M-mode', label: 'M-mode' },
  { id: 'Doppler', label: 'Doppler' },
];

const MEASURES = [
  { id: 'None', label: 'No Tool' },
  { id: 'Distance', label: '2-Point Distance' },
  { id: 'M-Trace', label: 'M-mode Trace' },
];

export default function ControlPanel({
  preset,
  onPresetChange,
  mode,
  onModeChange,
  gain,
  onGainChange,
  depth,
  onDepthChange,
  heartRate,
  onHeartRateChange,
  frozen,
  onToggleFreeze,
  measurementTool,
  onMeasurementToolChange,
}) {
  const depthMarks = useMemo(() => [4, 6, 8, 10, 12], []);

  return (
    <aside className="rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur p-4 space-y-5">
      <header>
        <h2 className="text-lg font-medium">Controls</h2>
        <p className="text-xs text-neutral-400">Adjust imaging parameters and modes</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-neutral-400 mb-1">Preset View</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => onPresetChange(p.id)}
                className={`px-3 py-2 rounded-md border text-sm transition ${
                  preset === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-neutral-400 mb-1">Mode</label>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`px-3 py-2 rounded-md border text-sm transition ${
                  mode === m.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Gain: {gain}%</label>
            <input
              type="range"
              min={20}
              max={90}
              value={gain}
              onChange={(e) => onGainChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Depth: {depth} cm</label>
            <input
              type="range"
              min={4}
              max={12}
              step={1}
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              {depthMarks.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Heart Rate: {heartRate} bpm</label>
            <input
              type="range"
              min={60}
              max={180}
              step={1}
              value={heartRate}
              onChange={(e) => onHeartRateChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Measurement Tool</label>
            <select
              value={measurementTool}
              onChange={(e) => onMeasurementToolChange(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-2 py-2 text-sm"
            >
              {MEASURES.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between mt-1">
          <button
            onClick={onToggleFreeze}
            className={`px-4 py-2 rounded-md border text-sm transition ${
              frozen
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {frozen ? 'Frozen' : 'Live'}
          </button>
          <span className="text-xs text-neutral-400">Pediatric presets emphasize small hearts and higher HR</span>
        </div>
      </div>
    </aside>
  );
}
