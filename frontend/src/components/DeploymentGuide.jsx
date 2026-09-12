import React, { useState } from 'react'
import {
  Rocket,
  Globe,
  UploadCloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldAlert,
  Server,
  Terminal,
  FileCode
} from 'lucide-react'

export default function DeploymentGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('vercel')
  const [copiedCmd, setCopiedCmd] = useState(null)

  if (!isOpen) return null

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5 h-5" />
            <div>
              <h3 className="text-lg font-bold">Frontend Deployment Guide</h3>
              <p className="text-xs text-emerald-100">
                Deploy your frontend to the web & connect to your deployed ML model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-2.5 px-4 rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deploy to Vercel (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`py-2.5 px-4 rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'netlify'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Deploy to Netlify</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`py-2.5 px-4 rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'backend'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connecting Backend & CORS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* TAB 1: VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Deploy via Git & Vercel Dashboard:</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Free Hosting
                </span>
              </div>

              <ol className="list-decimal pl-5 space-y-3 text-slate-600 text-xs sm:text-sm">
                <li>
                  <strong>Push your repository to GitHub:</strong>
                  <div className="mt-1 bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs font-mono relative flex items-center justify-between">
                    <span>git add . && git commit -m "Add modern frontend" && git push</span>
                    <button
                      onClick={() =>
                        copyToClipboard('git add . && git commit -m "Add modern frontend" && git push', 'git-push')
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCmd === 'git-push' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
                <li>
                  Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">vercel.com/new</a> and select your GitHub repo.
                </li>
                <li>
                  Under <strong>Root Directory</strong>, click <em>Edit</em> and choose <code>frontend</code>.
                </li>
                <li>
                  Under <strong>Environment Variables</strong>, add:
                  <div className="mt-1 bg-slate-100 p-2 rounded-lg text-xs font-mono text-slate-800">
                    <strong>VITE_API_BASE</strong> = <code>https://your-deployed-backend.onrender.com</code>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    (If you haven't deployed backend yet, you can leave it empty and set it directly in the app's UI settings anytime!)
                  </span>
                </li>
                <li>
                  Click <strong>Deploy</strong>! Vercel will build and serve your app globally with SSL (HTTPS) in ~30 seconds.
                </li>
              </ol>

              {/* CLI Alternative */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Alternative: Deploy directly from CLI</span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
                  <span>cd frontend && npx vercel</span>
                  <button
                    onClick={() => copyToClipboard('cd frontend && npx vercel', 'vercel-cli')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'vercel-cli' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NETLIFY */}
          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-900">Deploy via Netlify Drop (No Git required):</span>

              <ol className="list-decimal pl-5 space-y-3 text-slate-600 text-xs sm:text-sm">
                <li>
                  Build the production distribution folder on your machine:
                  <div className="mt-1 bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
                    <span>cd frontend && npm run build</span>
                    <button
                      onClick={() => copyToClipboard('cd frontend && npm run build', 'npm-build')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCmd === 'npm-build' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    This generates the production bundle in <code>frontend/dist</code>.
                  </span>
                </li>
                <li>
                  Open <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">app.netlify.com/drop</a> in your browser.
                </li>
                <li>
                  Drag and drop the <code>frontend/dist</code> folder directly into the Netlify drop zone.
                </li>
                <li>
                  Your site will be immediately live with an instant public URL!
                </li>
              </ol>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <strong>Pre-configured:</strong> We already created <code className="bg-white px-1 py-0.5 rounded">netlify.toml</code> and <code className="bg-white px-1 py-0.5 rounded">_redirects</code> so Single Page Application routing works without 404 errors on refresh!
              </div>
            </div>
          )}

          {/* TAB 3: BACKEND & CORS */}
          {activeTab === 'backend' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-900">How to connect your Deployed ML Backend:</span>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">1. Backend Deployment (Render / Railway / Cloud)</div>
                  <p>
                    Ensure your backend has the following start command:
                  </p>
                  <div className="mt-1.5 bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-xs">
                    uvicorn app:app --host 0.0.0.0 --port $PORT
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">2. CORS Configuration (Already Fixed!)</div>
                  <p>
                    We updated <code className="text-emerald-700 font-semibold">app.py</code> with <code className="text-emerald-700 font-semibold">allow_origins=["*"]</code> so your deployed frontend can call your backend from any domain without being blocked by browser CORS restrictions.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">3. Setting the Deployed URL in Frontend</div>
                  <p>
                    You can either set the <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_API_BASE</code> environment variable when deploying, or open the <strong>"Connect Backend"</strong> button in the top navigation and paste your live URL directly!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
