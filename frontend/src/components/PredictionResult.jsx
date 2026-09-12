import React, { useState } from 'react'
import {
  Check,
  Copy,
  Printer,
  Calendar,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Sparkles
} from 'lucide-react'

export default function PredictionResult({ result, t = {} }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const {
    commodity,
    market,
    prediction_date,
    predicted_modal_price,
    latest_recorded_price,
    percentage_change,
    history = []
  } = result

  // Price calculations
  const pricePerKg = (predicted_modal_price / 100).toFixed(2)
  const minEstimatedPrice = Math.round(predicted_modal_price * 0.92)
  const maxEstimatedPrice = Math.round(predicted_modal_price * 1.08)

  const isUp = percentage_change > 0.5
  const isDown = percentage_change < -0.5

  const handleCopy = () => {
    const text = `🌾 ${t.appTitle || 'KrishiPrice'} Forecast:
${t.commodityLabel || 'Crop'}: ${commodity}
${t.marketLabel || 'Market'}: ${market} APMC
${t.dateLabel || 'Target Date'}: ${prediction_date}
${t.predictedPrice || 'Predicted Modal Price'}: ₹${predicted_modal_price} / Quintal (₹${pricePerKg} / kg)
${t.tradingBand || 'Expected Range'}: ₹${minEstimatedPrice} - ₹${maxEstimatedPrice} / Quintal
Trend: ${isUp ? '📈 ' + (t.trendRising || 'Rising') : isDown ? '📉 ' + (t.trendFalling || 'Falling') : '⚖️ ' + (t.trendStable || 'Stable')}`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  // Build chart coordinates
  const allPoints = [
    ...history,
    { date: prediction_date, modal_price: predicted_modal_price, isPrediction: true }
  ]

  const prices = allPoints.map((p) => p.modal_price)
  const minPrice = Math.min(...prices) * 0.95
  const maxPrice = Math.max(...prices) * 1.05
  const priceRange = maxPrice - minPrice || 1

  const chartWidth = 500
  const chartHeight = 160
  const paddingX = 40
  const paddingY = 20

  const getCoordinates = (index, price) => {
    const x = paddingX + (index / (allPoints.length - 1 || 1)) * (chartWidth - paddingX * 2)
    const y = chartHeight - paddingY - ((price - minPrice) / priceRange) * (chartHeight - paddingY * 2)
    return { x, y }
  }

  const pointsCoords = allPoints.map((p, idx) => getCoordinates(idx, p.modal_price))
  const historicalCoords = pointsCoords.slice(0, pointsCoords.length - 1)
  const lastHistoricalCoord = historicalCoords[historicalCoords.length - 1] || pointsCoords[0]
  const predictedCoord = pointsCoords[pointsCoords.length - 1]

  const historicalPath = historicalCoords.map((c) => `${c.x},${c.y}`).join(' ')

  const localizedCropName = t.crops?.[commodity] ? `${t.crops[commodity]} (${commodity})` : commodity

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>AI Prediction Result</span>
            </span>
          </div>

          <h3 className="text-2xl font-black">
            {localizedCropName} <span className="font-light text-emerald-200">in</span> {market} APMC
          </h3>
          <p className="text-xs text-emerald-100/90 flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {t.dateLabel || 'Forecast Date'}: {prediction_date}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (t.copied || 'Copied!') : (t.copySummary || 'Copy Summary')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>{t.printReport || 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Modal Price Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl p-6 border border-emerald-200/60 relative overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t.predictedPrice || 'Predicted Modal Price'}
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                ₹{predicted_modal_price.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-semibold text-slate-500">
                {t.perQuintal || '/ Quintal (100 kg)'}
              </div>
            </div>

            <div className="mt-2 text-base font-semibold text-emerald-700">
              ≈ ₹{pricePerKg} <span className="text-xs font-normal text-slate-500">{t.perKg || 'per kg'}</span>
            </div>

            {/* Price change badge */}
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-emerald-200/60">
              {isUp && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>+{percentage_change}% {t.trendRising || 'Rising Price Trend'}</span>
                </div>
              )}
              {isDown && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>{percentage_change}% {t.trendFalling || 'Falling Price Trend'}</span>
                </div>
              )}
              {!isUp && !isDown && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.trendStable || 'Stable Market Trend'}</span>
                </div>
              )}

              {latest_recorded_price && (
                <div className="text-xs text-slate-500">
                  {t.latestPrice || 'Last recorded price in DB'}: <strong>₹{latest_recorded_price.toLocaleString('en-IN')}</strong> / Q
                </div>
              )}
            </div>
          </div>

          {/* Expected Trading Range Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.tradingBand || 'Expected Trading Band'}
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs text-slate-500">{t.minPrice || 'Estimated Min Price'}</div>
                  <div className="text-xl font-bold text-slate-700">
                    ₹{minEstimatedPrice.toLocaleString('en-IN')} <span className="text-xs font-normal">/ Q</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="text-xs text-slate-500">{t.maxPrice || 'Estimated Max Price'}</div>
                  <div className="text-xl font-bold text-emerald-700">
                    ₹{maxEstimatedPrice.toLocaleString('en-IN')} <span className="text-xs font-normal">/ Q</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
              Confidence Band: ±8% based on APMC market variance
            </div>
          </div>
        </div>

        {/* Visual Trend Chart */}
        {allPoints.length > 1 && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>{t.priceChart || 'Price Progression & Forecast Curve'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.chartSub || 'Historical weekly records transition into target forecast'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>{t.historical || 'Historical'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{t.forecast || 'Forecast'}</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="w-full overflow-x-auto py-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 overflow-visible"
              >
                {[0.25, 0.5, 0.75].map((ratio, i) => {
                  const y = paddingY + ratio * (chartHeight - paddingY * 2)
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  )
                })}

                {historicalCoords.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={historicalPath}
                  />
                )}

                {lastHistoricalCoord && predictedCoord && (
                  <line
                    x1={lastHistoricalCoord.x}
                    y1={lastHistoricalCoord.y}
                    x2={predictedCoord.x}
                    y2={predictedCoord.y}
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                )}

                {historicalCoords.map((c, i) => (
                  <g key={i}>
                    <circle cx={c.x} cy={c.y} r="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
                    <text
                      x={c.x}
                      y={c.y - 10}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      ₹{allPoints[i].modal_price}
                    </text>
                  </g>
                ))}

                {predictedCoord && (
                  <g>
                    <circle
                      cx={predictedCoord.x}
                      cy={predictedCoord.y}
                      r="9"
                      fill="#10b981"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                    <circle
                      cx={predictedCoord.x}
                      cy={predictedCoord.y}
                      r="6"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={predictedCoord.x}
                      y={predictedCoord.y - 12}
                      fill="#34d399"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ₹{predicted_modal_price}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}

        {/* Agricultural Advisory Note */}
        <div className="bg-emerald-50/80 rounded-xl p-5 border border-emerald-200 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-emerald-600 text-white flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              {t.advisoryTitle || 'Krishi Market Advisory'}
            </h4>
            <p className="text-xs sm:text-sm text-emerald-800/90 mt-1 leading-relaxed">
              {isUp
                ? `${commodity} ${t.advisoryRising?.replace('{date}', prediction_date) || 'shows upward trend.'}`
                : isDown
                ? `${commodity} ${t.advisoryFalling?.replace('{date}', prediction_date) || 'shows downward trend.'}`
                : `${commodity} ${t.advisoryStable || 'market remains steady.'}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
