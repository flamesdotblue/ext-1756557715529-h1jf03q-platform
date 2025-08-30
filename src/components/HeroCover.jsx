import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/70 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-300 text-xs tracking-wide uppercase">
            Pediatric Echo Training
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold leading-tight">
            Echocardiogram Simulator
          </h1>
          <p className="mt-3 text-neutral-300 text-sm sm:text-base">
            Practice core pediatric echo views, image optimization, M-mode and Doppler concepts. Measure LV dimensions, HR, and VTI in a realistic, responsive simulator.
          </p>
        </div>
      </div>
    </section>
  );
}
