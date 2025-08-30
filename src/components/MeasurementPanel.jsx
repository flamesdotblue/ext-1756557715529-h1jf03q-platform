export default function MeasurementPanel({ measurements, onClear }) {
  const formatValue = (m) => {
    if (m.type === 'Distance') return `${m.value.toFixed(2)} ${m.unit}`;
    return `${m.value} ${m.unit || ''}`;
  };

  const derived = (() => {
    // Example derived metrics from last distance and HR
    const lastDistance = measurements.find((m) => m.type === 'Distance');
    const hr = measurements.find((m) => m.meta)?.meta?.heartRate || 120;
    let fs = null; // fractional shortening mock
    if (lastDistance) {
      const lvedd = lastDistance.value; // pretend measured in diastole
      const lvesd = Math.max(0.1, lvedd * 0.7); // mock systolic dimension
      fs = ((lvedd - lvesd) / lvedd) * 100;
    }
    return { hr, fs };
  })();

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-medium">Measurements</h3>
          <p className="text-xs text-neutral-400">Distances and derived pediatric parameters</p>
        </div>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 text-sm"
        >
          Clear
        </button>
      </div>

      {measurements.length === 0 ? (
        <p className="text-sm text-neutral-400">No measurements yet. Use the 2-point tool in the viewport.</p>
      ) : (
        <ul className="space-y-2">
          {measurements.map((m, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm">
              <div className="text-neutral-300">
                {m.type}
                <span className="text-neutral-500"> · {new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-cyan-300">{formatValue(m)}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-neutral-400">Heart Rate</div>
          <div className="text-xl font-semibold">{derived.hr} bpm</div>
          <div className="text-[11px] text-neutral-500 mt-1">Typical pediatric range depends on age</div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-neutral-400">Fractional Shortening</div>
          <div className="text-xl font-semibold">{derived.fs ? derived.fs.toFixed(1) + ' %' : '—'}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Estimated from last dimension</div>
        </div>
      </div>
    </section>
  );
}
