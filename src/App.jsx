import { useState } from 'react';
import HeroCover from './components/HeroCover';
import ControlPanel from './components/ControlPanel';
import EchoViewport from './components/EchoViewport';
import MeasurementPanel from './components/MeasurementPanel';

export default function App() {
  const [preset, setPreset] = useState('Apical 4C');
  const [mode, setMode] = useState('2D'); // 2D | M-mode | Doppler
  const [gain, setGain] = useState(55);
  const [depth, setDepth] = useState(8); // cm
  const [heartRate, setHeartRate] = useState(120); // bpm typical pediatrics
  const [frozen, setFrozen] = useState(false);
  const [measurementTool, setMeasurementTool] = useState('None'); // None | Distance | M-Trace
  const [measurements, setMeasurements] = useState([]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroCover />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <ControlPanel
              preset={preset}
              onPresetChange={setPreset}
              mode={mode}
              onModeChange={setMode}
              gain={gain}
              onGainChange={setGain}
              depth={depth}
              onDepthChange={setDepth}
              heartRate={heartRate}
              onHeartRateChange={setHeartRate}
              frozen={frozen}
              onToggleFreeze={() => setFrozen(v => !v)}
              measurementTool={measurementTool}
              onMeasurementToolChange={setMeasurementTool}
            />
          </div>

          <div className="lg:col-span-8">
            <EchoViewport
              preset={preset}
              mode={mode}
              gain={gain}
              depth={depth}
              heartRate={heartRate}
              frozen={frozen}
              measurementTool={measurementTool}
              onAddMeasurement={(m) => setMeasurements(prev => [m, ...prev])}
            />
          </div>
        </div>

        <div className="mt-8">
          <MeasurementPanel
            measurements={measurements}
            onClear={() => setMeasurements([])}
          />
        </div>
      </main>
    </div>
  );
}
