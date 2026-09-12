import React from 'react'
import PredictForm from '../components/PredictForm'
import PredictionResult from '../components/PredictionResult'
import PredictionHistory from '../components/PredictionHistory'

export default function Home({
  onPredict,
  loading,
  error,
  result,
  history,
  onSelectHistory,
  onClearHistory,
  metadata,
  t
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Main Predict Form with Autocomplete & Translations */}
      <PredictForm
        onPredict={onPredict}
        loading={loading}
        error={error}
        metadata={metadata}
        t={t}
      />

      {/* Prediction Result */}
      {result && <PredictionResult result={result} t={t} />}

      {/* Recent Lookups History */}
      <PredictionHistory
        history={history}
        onSelect={onSelectHistory}
        onClear={onClearHistory}
        t={t}
      />
    </div>
  )
}
