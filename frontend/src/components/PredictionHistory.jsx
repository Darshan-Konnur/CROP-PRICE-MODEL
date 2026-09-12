import React from 'react'
import { History, Trash2, ArrowRight, Calendar, MapPin } from 'lucide-react'

export default function PredictionHistory({ history, onSelect, onClear, t = {} }) {
  if (!history || history.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            {t.recentLookups || 'Recent Predictions'}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clearHistory || 'Clear History'}</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(item)}
            className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-300 transition cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {t.crops?.[item.commodity] || item.commodity}
                </span>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{item.market} APMC</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-800">
                  ₹{item.predicted_modal_price}
                </div>
                <div className="text-[10px] text-slate-400">{t.perQuintal || '/ Q'}</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {item.prediction_date}
              </span>
              <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                {t.view || 'View'} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
