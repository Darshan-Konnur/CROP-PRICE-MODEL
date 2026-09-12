import React from 'react'
import { Sprout, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">KrishiPrice AI</span>
          <span>— Agricultural Price Intelligence Engine</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official APMC Mandi market forecasts & price trends</span>
        </div>
      </div>
    </footer>
  )
}
