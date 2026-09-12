import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Footer from './components/Footer'
import { TRANSLATIONS } from './utils/translations'

const DEFAULT_METADATA = {
  status: 'ok',
  commodities: [
    'Tomato', 'Onion', 'Potato', 'Wheat', 'Maize', 'Rice',
    'Green Chilli', 'Garlic', 'Ginger', 'Soybean', 'Cotton'
  ],
  markets: [
    'Agra', 'Belagavi', 'Bengaluru', 'Bhopal', 'Davangere', 'Guntur',
    'Hassan', 'Haveri', 'Hubballi', 'Indore', 'Jaipur', 'Kolar', 'Kota',
    'Lasalgaon', 'Madanapalle', 'Mandsaur', 'Nagpur', 'Nashik', 'Pune',
    'Raichur', 'Shimoga', 'Solapur'
  ],
  pairs: [
    { commodity: 'Onion', market: 'Pune', count: 193 },
    { commodity: 'Onion', market: 'Lasalgaon', count: 193 },
    { commodity: 'Onion', market: 'Solapur', count: 193 },
    { commodity: 'Onion', market: 'Nashik', count: 167 },
    { commodity: 'Onion', market: 'Hubballi', count: 141 },
    { commodity: 'Onion', market: 'Indore', count: 141 },
    { commodity: 'Tomato', market: 'Pune', count: 193 },
    { commodity: 'Tomato', market: 'Kolar', count: 193 },
    { commodity: 'Tomato', market: 'Nashik', count: 193 },
    { commodity: 'Tomato', market: 'Davangere', count: 167 },
    { commodity: 'Tomato', market: 'Bengaluru', count: 141 },
    { commodity: 'Tomato', market: 'Madanapalle', count: 141 },
    { commodity: 'Potato', market: 'Pune', count: 167 },
    { commodity: 'Potato', market: 'Agra', count: 193 },
    { commodity: 'Potato', market: 'Bengaluru', count: 193 },
    { commodity: 'Potato', market: 'Indore', count: 193 },
    { commodity: 'Potato', market: 'Hassan', count: 141 },
    { commodity: 'Wheat', market: 'Bhopal', count: 193 },
    { commodity: 'Wheat', market: 'Indore', count: 193 },
    { commodity: 'Wheat', market: 'Nashik', count: 167 },
    { commodity: 'Wheat', market: 'Jaipur', count: 141 },
    { commodity: 'Wheat', market: 'Kota', count: 141 },
    { commodity: 'Maize', market: 'Belagavi', count: 193 },
    { commodity: 'Maize', market: 'Haveri', count: 193 },
    { commodity: 'Maize', market: 'Davangere', count: 167 },
    { commodity: 'Rice', market: 'Bengaluru', count: 167 },
    { commodity: 'Rice', market: 'Raichur', count: 141 },
    { commodity: 'Rice', market: 'Shimoga', count: 141 },
    { commodity: 'Green Chilli', market: 'Davangere', count: 193 },
    { commodity: 'Green Chilli', market: 'Guntur', count: 193 },
    { commodity: 'Green Chilli', market: 'Nagpur', count: 141 },
    { commodity: 'Garlic', market: 'Mandsaur', count: 141 },
    { commodity: 'Garlic', market: 'Nashik', count: 141 },
    { commodity: 'Ginger', market: 'Pune', count: 141 },
    { commodity: 'Ginger', market: 'Shimoga', count: 141 },
    { commodity: 'Cotton', market: 'Nagpur', count: 26 },
    { commodity: 'Soybean', market: 'Indore', count: 26 }
  ]
}

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://crop-price-api-3m77.onrender.com'

  // Language state: defaults to saved language or 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('CROP_LANG') || 'en'
  })

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  const handleSelectLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('CROP_LANG', newLang)
  }

  // Initialize with DEFAULT_METADATA so UI never renders 0 mandis
  const [metadata, setMetadata] = useState(DEFAULT_METADATA)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Prediction History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('CROP_PREDICT_HISTORY')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('CROP_PREDICT_HISTORY', JSON.stringify(history))
    } catch {
      // ignore
    }
  }, [history])

  // Fetch available commodities & APMC markets from Neon DB on mount if /meta is available
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`${API_BASE}/meta`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.pairs && data.pairs.length > 0) {
            setMetadata(data)
          }
        }
      } catch (err) {
        console.warn('Backend does not expose /meta or connection failed, using full built-in DB metadata:', err)
      }
    }

    fetchMetadata()
  }, [API_BASE])

  // Run prediction against Neon DB
  const handlePredict = async (payload) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const msg = errorData.detail || `Server error: HTTP ${res.status}`
        throw new Error(msg)
      }

      const data = await res.json()
      // Normalize response so it works with both complete backend and minimal backend
      const normalizedData = {
        commodity: payload.commodity,
        market: payload.market,
        prediction_date: payload.prediction_date,
        predicted_modal_price: data.predicted_modal_price,
        latest_recorded_price: data.latest_recorded_price || data.predicted_modal_price,
        percentage_change: data.percentage_change ?? 0.0,
        price_difference: data.price_difference ?? 0.0,
        history: data.history || []
      }

      setResult(normalizedData)
      setHistory((prev) => [
        normalizedData,
        ...prev.filter(
          (h) => !(h.commodity.toLowerCase() === normalizedData.commodity.toLowerCase() &&
                   h.market.toLowerCase() === normalizedData.market.toLowerCase() &&
                   h.prediction_date === normalizedData.prediction_date)
        )
      ].slice(0, 10))
    } catch (err) {
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('failed to fetch')) {
        setError(`Unable to connect to backend at ${API_BASE}. Free Render instances may take ~30 seconds to wake up from idle.`)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHistory = (item) => {
    setResult(item)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('CROP_PREDICT_HISTORY')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header lang={lang} onSelectLang={handleSelectLang} t={t} />

      <main className="flex-1">
        <Home
          onPredict={handlePredict}
          loading={loading}
          error={error}
          result={result}
          history={history}
          onSelectHistory={handleSelectHistory}
          onClearHistory={handleClearHistory}
          metadata={metadata}
          t={t}
        />
      </main>

      <Footer />
    </div>
  )
}
