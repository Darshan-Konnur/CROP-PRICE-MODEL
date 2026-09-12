import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Footer from './components/Footer'
import { TRANSLATIONS } from './utils/translations'

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

  // Language state: defaults to saved language or 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('CROP_LANG') || 'en'
  })

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  const handleSelectLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('CROP_LANG', newLang)
  }

  const [metadata, setMetadata] = useState(null)
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

  // Fetch available commodities & APMC markets from Neon DB on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`${API_BASE}/meta`)
        if (res.ok) {
          const data = await res.json()
          setMetadata(data)
        }
      } catch (err) {
        console.warn('Could not fetch DB metadata, using built-in defaults:', err)
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
      setResult(data)
      setHistory((prev) => [
        data,
        ...prev.filter(
          (h) => !(h.commodity.toLowerCase() === data.commodity.toLowerCase() &&
                   h.market.toLowerCase() === data.market.toLowerCase() &&
                   h.prediction_date === data.prediction_date)
        )
      ].slice(0, 10))
    } catch (err) {
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('failed to fetch')) {
        setError(`Unable to connect to the backend server at ${API_BASE}. Please verify that the API server is active on port 8000.`)
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
