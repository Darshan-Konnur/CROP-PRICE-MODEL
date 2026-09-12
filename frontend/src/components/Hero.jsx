import React from 'react'
import { TrendingUp, ShieldCheck, Database, Cpu } from 'lucide-react'

export default function Hero({ onScrollToPredict, onOpenDeployGuide }) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200/60 no-print">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-300/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-4 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>High Precision Agricultural Forecasting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Predict APMC Crop Prices <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              With Machine Learning
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Empowering farmers, traders, and agronomists with data-driven modal price predictions. Analyze seasonal volatility, historical trends, and maximize harvest profitability.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onScrollToPredict}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Price Prediction
            </button>
            <button
              onClick={onOpenDeployGuide}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition"
            >
              How to Deploy & Connect
            </button>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Model</div>
              <div className="text-sm font-bold text-slate-800">Scikit-Learn ML</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Data Source</div>
              <div className="text-sm font-bold text-slate-800">Agmarknet / IDP</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Metrics</div>
              <div className="text-sm font-bold text-slate-800">Modal Price (₹/Q)</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Deployment</div>
              <div className="text-sm font-bold text-slate-800">Vercel & Netlify Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
