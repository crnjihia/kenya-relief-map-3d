
export interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

export default function LoadingScreen({
  progress = 50,
  message = 'Loading 47 County Boundaries & Extruding 3D Meshes...',
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none">
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated 3D Isometric Cube / Radar Icon */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-400 animate-pulse opacity-75 blur-md" />
          <div className="relative w-full h-full rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xl">
            <svg
              className="w-8 h-8 text-sky-400 animate-spin"
              style={{ animationDuration: '4s' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0v-8m0 0l4-4m-4 4L8 9"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Kenya Relief Map 3D
        </h1>
        <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-6">
          Kenya County Development Indicators
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60 mb-3 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 animate-pulse font-medium">
          {message}
        </p>

        <div className="mt-8 flex items-center gap-4 text-[11px] text-slate-400">
          <span>KNBS 2019</span>
          <span>•</span>
          <span>47 Counties</span>
          <span>•</span>
          <span>WebGL / Three.js</span>
        </div>
      </div>
    </div>
  );
}
