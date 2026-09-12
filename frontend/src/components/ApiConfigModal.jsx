import React, { useState } from 'react'
import { Server, CheckCircle2, XCircle, Loader2, Link2, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react'

export default function ApiConfigModal({
  isOpen,
  onClose,
  apiUrl,
  onSaveUrl,
  isDemoMode,
  onToggleDemoMode
}) {
  const [inputUrl, setInputUrl] = useState(apiUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  if (!isOpen) return null

  const handleTest = async (urlToTest = inputUrl) => {
    setTesting(true)
    setTestResult(null)
    const cleanUrl = urlToTest.trim().replace(/\/+$/, '')
    const startTime = performance.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(`${cleanUrl}/`, {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const duration = Math.round(performance.now() - startTime)
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        setTestResult({
          success: true,
          message: data.message || 'API responded successfully!',
          latency: duration
        })
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
          latency: duration
        })
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime)
      let msg = err.message
      if (err.name === 'AbortError') {
        msg = 'Connection timed out after 8 seconds. If hosted on Render/free tier, the service might be waking up (cold start).'
      } else if (msg.includes('Failed to fetch')) {
        msg = 'Failed to connect. Check if the URL is correct and ensure the backend allows CORS.'
      }
      setTestResult({
        success: false,
        message: msg,
        latency: duration
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    const clean = inputUrl.trim().replace(/\/+$/, '')
    onSaveUrl(clean)
    onClose()
  }

  const handleResetDefault = () => {
    const defaultUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
    setInputUrl(defaultUrl)
    handleTest(defaultUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <h3 className="text-lg font-bold">Connect ML Backend API</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Backend API URL
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Enter the base URL of your deployed FastAPI server (e.g., on Render, Railway, EC2) or local server.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://crop-price-api.onrender.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleTest(inputUrl)}
                disabled={testing || !inputUrl}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Ping'}
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-semibold">
                  {testResult.success ? 'Backend Connected' : 'Connection Failed'}
                  {testResult.latency ? ` (${testResult.latency}ms)` : ''}
                </div>
                <div className="mt-0.5">{testResult.message}</div>
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Presets:</span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => {
                  setInputUrl('http://localhost:8000')
                  handleTest('http://localhost:8000')
                }}
                className="underline hover:text-emerald-600"
              >
                Local (localhost:8000)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="underline hover:text-emerald-600"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Offline / Demo Mode Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-xs font-semibold text-amber-900">Demo Simulation Mode</div>
                <div className="text-[11px] text-amber-700">
                  Generate realistic AI predictions even when backend is offline
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                isDemoMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {isDemoMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Help box */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Deployment Tip:</strong> When you deploy this frontend on Vercel or Netlify, you can either configure the <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_API_BASE</code> environment variable, or simply paste your backend URL here. Your settings are saved securely in your browser.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Save Connection
          </button>
        </div>
      </div>
    </div>
  )
}
