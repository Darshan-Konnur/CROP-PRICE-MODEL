import React, { useState, useEffect } from 'react'
import { Database, RefreshCw } from 'lucide-react'

export default function DbViewer({ t = {}, metadata = null }) {
  const [records, setRecords] = useState([])
  const [totalInDb, setTotalInDb] = useState(0)
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

  const fetchRecords = async (crop, mkt) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (crop && crop !== 'all') params.set('commodity', crop)
      if (mkt && mkt !== 'all') params.set('market', mkt)
      params.set('limit', '25')

      const res = await fetch(`${API_BASE}/records?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
        setTotalInDb(data.total_in_db || 0)
      }
    } catch (err) {
      console.warn('Could not load DB viewer:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(selectedCrop, selectedMarket)
  }, [selectedCrop, selectedMarket])

  // Get available markets for selected crop or top markets
  const availableMarkets = selectedCrop !== 'all' && metadata?.pairs?.length > 0
    ? ['all', ...metadata.pairs.filter((p) => p.commodity.toLowerCase() === selectedCrop.toLowerCase()).map((p) => p.market)]
    : ['all', 'Pune', 'Lasalgaon', 'Solapur', 'Nashik', 'Davangere', 'Kolar', 'Indore', 'Agra', 'Bengaluru']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.liveDbInspector || 'Live Neon Database Records'}
            </h3>
            <p className="text-xs text-slate-500">
              {t.liveDbInspectorDesc || 'Directly querying market_prices table in Neon PostgreSQL'} ({totalInDb.toLocaleString()} {t.dbRecordsDesc || 'records'})
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Crop filter chips */}
          <div className="flex items-center gap-1 flex-wrap">
            {['all', 'Tomato', 'Onion', 'Potato', 'Wheat', 'Maize', 'Rice'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedCrop(c)
                  setSelectedMarket('all')
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedCrop.toLowerCase() === c.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {c === 'all' ? (t.all || 'All Crops') : (t.crops?.[c] || c)}
              </button>
            ))}
          </div>

          {/* Market selector dropdown */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-slate-500 font-medium">Mandi:</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableMarkets.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All Mandis' : `${m} APMC`}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchRecords(selectedCrop, selectedMarket)}
            className="p-1 text-slate-400 hover:text-emerald-700 ml-1 rounded hover:bg-slate-100"
            title="Refresh DB view"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-2 px-3">{t.rowId || 'Row ID'}</th>
              <th className="py-2 px-3">{t.date || 'Date'}</th>
              <th className="py-2 px-3">{t.commodityLabel || 'Commodity'}</th>
              <th className="py-2 px-3">{t.marketLabel || 'APMC Mandi'}</th>
              <th className="py-2 px-3">{t.state || 'State'}</th>
              <th className="py-2 px-3 text-right">{t.modalPrice || 'Modal Price (₹/Q)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition">
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                  #{r.id}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  {r.date}
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-700">
                  {t.crops?.[r.commodity] || r.commodity}
                </td>
                <td className="py-2.5 px-3 font-medium">
                  {r.market}
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  {r.state}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  ₹{r.modal_price?.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && !loading && (
          <div className="text-center py-6 text-xs text-slate-400">
            No records found for this crop filter.
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>{t.showingRows || 'Showing latest 15 records sorted by ID DESC.'}</span>
        <span>Neon DB: <strong className="text-slate-600">ep-square-wind-b3y52i8i</strong></span>
      </div>
    </div>
  )
}
