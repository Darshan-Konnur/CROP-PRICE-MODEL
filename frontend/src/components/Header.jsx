import React from 'react'
import { Sprout, Globe } from 'lucide-react'
import { LANGUAGES } from '../utils/translations'

export default function Header({ lang, onSelectLang, t }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {t.appBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Indian Languages Selector */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 shadow-xs transition">
            <Globe className="w-4 h-4 text-emerald-600" />
            <select
              value={lang}
              onChange={(e) => onSelectLang(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
