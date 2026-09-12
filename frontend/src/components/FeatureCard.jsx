import React from 'react'

export default function FeatureCard({ icon: Icon, title, desc, tag }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {tag && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition">
            {tag}
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}
