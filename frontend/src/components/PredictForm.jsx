import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  MapPin,
  Layers,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  X,
  Search,
  Check,
  ArrowRight,
  Database
} from 'lucide-react'

export default function PredictForm({
  onPredict,
  loading,
  error,
  metadata,
  t = {}
}) {
  const [commodity, setCommodity] = useState('Onion')
  const [market, setMarket] = useState('Pune')

  // Autocomplete dropdown states
  const [showCropSuggestions, setShowCropSuggestions] = useState(false)
  const [showMarketSuggestions, setShowMarketSuggestions] = useState(false)

  const cropRef = useRef(null)
  const marketRef = useRef(null)

  // Calculate today's date in local time YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayStr = getTodayStr()

  // Default target date to 7 days ahead
  const getDefaultDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [date, setDate] = useState(getDefaultDate)
  const [dateError, setDateError] = useState(null)

  // Known database commodities
  const defaultCommodities = [
    'Tomato',
    'Onion',
    'Potato',
    'Wheat',
    'Maize',
    'Rice',
    'Green Chilli',
    'Garlic',
    'Ginger',
    'Soybean',
    'Cotton'
  ]

  const dbCommodities = metadata?.commodities?.length > 0
    ? metadata.commodities
    : defaultCommodities

  // Available pairs with count for the current commodity from DB
  const dbPairsForCrop = metadata?.pairs?.length > 0
    ? metadata.pairs.filter((p) => p.commodity.toLowerCase() === commodity.trim().toLowerCase())
    : []

  const dbMarketsForCrop = dbPairsForCrop.map((p) => p.market)

  // All known markets from DB
  const allDbMarkets = metadata?.markets?.length > 0
    ? metadata.markets
    : ['Pune', 'Lasalgaon', 'Nashik', 'Solapur', 'Davangere', 'Kolar', 'Bengaluru', 'Indore', 'Agra', 'Bhopal', 'Guntur']

  // Candidate markets for current crop
  const candidateMarkets = dbMarketsForCrop.length > 0 ? dbMarketsForCrop : allDbMarkets

  // Filtered commodity suggestions based on user input
  const isExactCropMatch = dbCommodities.some(
    (c) => c.toLowerCase() === commodity.trim().toLowerCase()
  )
  const filteredCrops = isExactCropMatch || !commodity.trim()
    ? dbCommodities
    : dbCommodities.filter((c) => {
        const query = commodity.trim().toLowerCase()
        const localized = (t.crops?.[c] || '').toLowerCase()
        return c.toLowerCase().includes(query) || localized.includes(query)
      })

  // Filtered market suggestions: show all if exact match or blank, else filter by query
  const isExactMarketMatch = candidateMarkets.some(
    (m) => m.toLowerCase() === market.trim().toLowerCase()
  )
  const filteredMarkets = isExactMarketMatch || !market.trim()
    ? candidateMarkets
    : candidateMarkets.filter((m) => m.toLowerCase().includes(market.trim().toLowerCase()))

  // Check if current pair has verified data in DB
  const currentPair = dbPairsForCrop.find(
    (p) => p.market.toLowerCase() === market.trim().toLowerCase()
  )
  const hasVerifiedData = Boolean(currentPair && currentPair.count >= 4)
  const dataRecordCount = currentPair ? currentPair.count : 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropRef.current && !cropRef.current.contains(e.target)) {
        setShowCropSuggestions(false)
      }
      if (marketRef.current && !marketRef.current.contains(e.target)) {
        setShowMarketSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Crop selection handler: preserve market if valid, else pick first available market
  const handleSelectCrop = (newCrop) => {
    setCommodity(newCrop)
    setShowCropSuggestions(false)

    const available = metadata?.pairs
      ?.filter((p) => p.commodity.toLowerCase() === newCrop.toLowerCase())
      ?.map((p) => p.market) || []

    if (available.length > 0) {
      const stillValid = available.some((m) => m.toLowerCase() === market.trim().toLowerCase())
      if (!stillValid) {
        setMarket(available[0])
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!commodity.trim() || !market.trim() || !date) return

    // Prevent predicting yesterday or past dates
    if (date < todayStr) {
      setDateError(t.pastDateError || 'Yesterday and past dates cannot be predicted as they have already passed. Please select today or a future date.')
      return
    }
    setDateError(null)

    // Data verification check before submission
    if (!hasVerifiedData) {
      return
    }

    setShowCropSuggestions(false)
    setShowMarketSuggestions(false)
    onPredict({
      commodity: commodity.trim(),
      market: market.trim(),
      prediction_date: date
    })
  }

  // Check if current input exists in DB
  const isCropInDb = dbCommodities.some((c) => c.toLowerCase() === commodity.trim().toLowerCase())
  const isMarketInDb = candidateMarkets.some((m) => m.toLowerCase() === market.trim().toLowerCase())

  // Detect "no historical data" error
  const isNoDataError = error && (
    error.includes('No historical') ||
    error.includes('No data found') ||
    error.includes('Not enough historical') ||
    error.includes('not found') ||
    error.includes('Data check failed')
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.predictHeading || 'APMC Crop Price Prediction'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.predictDesc || 'Verified AI price forecasts powered by real APMC mandi arrival records and historical modal rates.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold w-fit">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Market Intelligence</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Commodity Input with Search & Suggestions */}
          <div className="relative" ref={cropRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.commodityLabel || 'Commodity / Crop'}</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                {dbMarketsForCrop.length} Mandis Available
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={commodity}
                onChange={(e) => {
                  setCommodity(e.target.value)
                  setShowCropSuggestions(true)
                }}
                onFocus={() => setShowCropSuggestions(true)}
                placeholder="Type or select crop..."
                className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
              <div className="absolute right-2 top-2.5 flex items-center gap-1 text-slate-400">
                {commodity && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCommodity('')
                      setShowCropSuggestions(true)
                    }}
                    className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    title="Clear crop"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCropSuggestions(!showCropSuggestions)}
                  className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCropSuggestions ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showCropSuggestions && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 text-xs">
                <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>Available Crops:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                    {dbCommodities.length} Total
                  </span>
                </div>

                {filteredCrops.map((c) => {
                  const isSelected = commodity.trim().toLowerCase() === c.toLowerCase()
                  const cropPairs = metadata?.pairs?.filter((p) => p.commodity.toLowerCase() === c.toLowerCase()) || []
                  return (
                    <div
                      key={c}
                      onClick={() => handleSelectCrop(c)}
                      className={`p-2.5 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer flex items-center justify-between font-medium transition ${
                        isSelected ? 'bg-emerald-50/70 text-emerald-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.crops?.[c] ? `${t.crops[c]} (${c})` : c}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cropPairs.length} Mandis
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick preset chips for all database crops */}
            <div className="flex flex-wrap gap-1 mt-2">
              {dbCommodities.map((c) => {
                const isSelected = commodity.toLowerCase() === c.toLowerCase()
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCrop(c)}
                    className={`text-[10px] px-2 py-0.5 rounded-md transition font-medium ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.crops?.[c] || c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* APMC Market Input with Search & Suggestions */}
          <div className="relative" ref={marketRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.marketLabel || 'APMC Market / Mandi'}</span>
              </label>
              {hasVerifiedData ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ {dataRecordCount} Verified Records
                </span>
              ) : (
                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                  ⚠️ No Market Records
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value)
                  setShowMarketSuggestions(true)
                }}
                onFocus={() => setShowMarketSuggestions(true)}
                placeholder="Select or type APMC Mandi..."
                className={`w-full pl-3.5 pr-14 py-2.5 rounded-xl border ${
                  !hasVerifiedData && market.trim()
                    ? 'border-amber-400 bg-amber-50/20'
                    : 'border-slate-300 bg-white'
                } text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition`}
                required
              />
              <div className="absolute right-2 top-2.5 flex items-center gap-1 text-slate-400">
                {market && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMarket('')
                      setShowMarketSuggestions(true)
                    }}
                    className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    title="Clear market"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMarketSuggestions(!showMarketSuggestions)}
                  className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMarketSuggestions ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown: Displays all DB markets for the selected commodity */}
            {showMarketSuggestions && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 text-xs">
                <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>Available Mandis for {commodity}:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                    {candidateMarkets.length} Available
                  </span>
                </div>

                {filteredMarkets.length === 0 && (
                  <div className="p-3 text-slate-400 text-center">
                    No matching mandi for "{market}". Please choose from the available mandis below.
                  </div>
                )}

                {filteredMarkets.map((m) => {
                  const isSelected = market.trim().toLowerCase() === m.toLowerCase()
                  const pairInfo = dbPairsForCrop.find((p) => p.market.toLowerCase() === m.toLowerCase())
                  const count = pairInfo ? pairInfo.count : null

                  return (
                    <div
                      key={m}
                      onClick={() => {
                        setMarket(m)
                        setShowMarketSuggestions(false)
                      }}
                      className={`p-2.5 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer flex items-center justify-between font-medium transition ${
                        isSelected ? 'bg-emerald-50/70 text-emerald-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{m} APMC</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        {count ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                            {count} records
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick preset chips: Show ALL mandis for this crop with their record counts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidateMarkets.map((m) => {
                const isSelected = market.trim().toLowerCase() === m.toLowerCase()
                const pairInfo = dbPairsForCrop.find((p) => p.market.toLowerCase() === m.toLowerCase())
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarket(m)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{m}</span>
                    {pairInfo && (
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        ({pairInfo.count})
                      </span>
                    )}
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Forecast Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.dateLabel}</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                Today & Future Only
              </span>
            </div>

            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => {
                  const val = e.target.value
                  setDate(val)
                  if (val && val < todayStr) {
                    setDateError(t.pastDateError || 'Yesterday and past dates cannot be predicted as they have already passed. Please select today or a future date.')
                  } else {
                    setDateError(null)
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  dateError
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-2 ring-rose-300'
                    : 'border-slate-300 bg-white text-slate-800'
                } text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition`}
                required
              />
            </div>

            {/* Past date warning */}
            {dateError ? (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{dateError}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                {t.dateHelp || 'Select today or future dates (yesterday & past dates are disabled)'}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  setDate(todayStr)
                  setDateError(null)
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  date === todayStr
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.today || 'Today'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 1)
                  const yr = d.getFullYear()
                  const mo = String(d.getMonth() + 1).padStart(2, '0')
                  const da = String(d.getDate()).padStart(2, '0')
                  setDate(`${yr}-${mo}-${da}`)
                  setDateError(null)
                }}
                className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {t.tomorrow}
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 7)
                  const yr = d.getFullYear()
                  const mo = String(d.getMonth() + 1).padStart(2, '0')
                  const da = String(d.getDate()).padStart(2, '0')
                  setDate(`${yr}-${mo}-${da}`)
                  setDateError(null)
                }}
                className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {t.oneWeek}
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 30)
                  const yr = d.getFullYear()
                  const mo = String(d.getMonth() + 1).padStart(2, '0')
                  const da = String(d.getDate()).padStart(2, '0')
                  setDate(`${yr}-${mo}-${da}`)
                  setDateError(null)
                }}
                className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {t.oneMonth}
              </button>
            </div>
          </div>
        </div>

        {/* Database Data Check Banner: Tells the user whether data exists in DB */}
        {hasVerifiedData ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold">Market Data Verified:</span> Found <strong>{dataRecordCount} historical records</strong> for <strong>{t.crops?.[commodity] || commodity}</strong> in <strong>{market} APMC</strong>. Ready for AI price prediction.
              </div>
            </div>
            <span className="text-[11px] bg-emerald-200/80 text-emerald-950 font-bold px-2 py-0.5 rounded flex-shrink-0">
              Verified Data
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>No Market Records Found: No historical price records found for {t.crops?.[commodity] || commodity} in "{market}" APMC.</span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              The AI model generates forecasts based on verified historical APMC mandi records. Please select an available market below:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {candidateMarkets.map((m) => {
                const pairInfo = dbPairsForCrop.find((p) => p.market.toLowerCase() === m.toLowerCase())
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarket(m)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-950 text-xs font-bold hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-900 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{m} APMC</span>
                    {pairInfo && <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">{pairInfo.count} rows</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Backend errors */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Error</div>
              <div className="mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Submit button: ONLY enabled when verified DB data exists */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={loading || !!dateError || (date && date < todayStr) || !hasVerifiedData}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.predicting || 'Analyzing Mandi Records & Predicting...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.predictBtn || 'Predict Price for'} {t.crops?.[commodity] || commodity} @ {market} APMC</span>
              </>
            )}
          </button>

          {!hasVerifiedData && (
            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Select an available APMC mandi above to predict</span>
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
