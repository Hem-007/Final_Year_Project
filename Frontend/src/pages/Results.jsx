import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Results.css'

const API_BASE = 'http://localhost:8000'

// ─── Data mapper: raw API → component state ────────────────────────────────
function mapAnalysisResult(result, requestData = {}) {
  const label = result.label || result.prediction || 'Unknown'
  const probability = result.probability ?? result.fraud_probability ?? 0
  const riskScore = Math.round(probability * 100)
  const trustScore = Math.max(0, 100 - riskScore)
  const source = result.input_source || 'text'
  const isFake = label === 'Fake Job'

  // Legacy fields (keep working)
  const textIssues = [
    `Prediction: ${label}`,
    `Confidence: ${result.confidence}`,
    `Processed ${result.extracted_text_length} characters from ${source} input.`
  ]
  if (result.risk_level === 'High') textIssues.push('Multiple scam indicators were detected in the posting content.')
  else if (result.risk_level === 'Medium') textIssues.push('Some caution signals were detected and should be reviewed manually.')

  return {
    // summary
    prediction: label,
    isFake,
    riskScore,
    riskLevel: result.risk_level,
    // XAI fields
    confidencePct: result.confidence_pct ?? (Math.abs(probability - 0.5) * 200),
    confidenceLabel: result.confidence || 'Medium',
    riskFactors: result.risk_factors || [],
    positiveIndicators: result.positive_indicators || [],
    modelContribution: result.model_contribution || { text: 65, metadata: 35 },
    scamType: result.scam_type || ['None detected'],
    missingFields: result.missing_fields || [],
    riskBreakdown: result.risk_breakdown || { text_risk: riskScore, metadata_risk: 0, total_risk: riskScore },
    finalVerdict: result.final_verdict || result.recommendation || '',
    // legacy (for backward compat)
    textAnalysis: { score: trustScore, issues: textIssues },
    imageAnalysis: {
      score: source === 'image' ? trustScore : (requestData.imageCount > 0 ? 50 : 0),
      images: requestData.imageCount || 0,
      status: source === 'image' ? 'OCR completed' : ((requestData.imageCount || 0) > 0 ? 'Provided but not primary source' : 'No images')
    },
    linkAnalysis: {
      score: source === 'url' ? trustScore : (requestData.jobLink ? 50 : 0),
      url: requestData.jobLink || 'Not provided',
      status: source === 'url' ? 'Scraped and analyzed' : (requestData.jobLink ? 'Provided but not primary source' : 'Not analyzed')
    },
    recommendations: [
      result.recommendation,
      'Research the company on official channels before responding.',
      'Do not share banking details, ID scans, or passwords during early screening.',
      'Verify recruiter email domains and cross-check the job on the employer website.'
    ]
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SummaryCard({ data }) {
  const riskColor = data.riskLevel === 'High' ? '#ef4444' : data.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'
  const bgClass = data.isFake ? 'summary-card summary-fake' : 'summary-card summary-real'

  return (
    <div className={bgClass}>
      <div className="summary-verdict">
        <div className="verdict-icon">{data.isFake ? '⚠️' : '✅'}</div>
        <div className="verdict-text">
          <div className="verdict-label">Verdict</div>
          <div className="verdict-value">{data.prediction}</div>
        </div>
        <div className="verdict-badge" style={{ background: riskColor }}>
          {data.riskLevel} Risk
        </div>
      </div>

      <div className="summary-metrics">
        <div className="metric-block">
          <div className="metric-number" style={{ color: riskColor }}>{data.riskScore}%</div>
          <div className="metric-label">Risk Score</div>
          <div className="metric-bar-wrap">
            <div className="metric-bar" style={{ width: `${data.riskScore}%`, background: riskColor }} />
          </div>
        </div>

        <div className="metric-divider" />

        <div className="metric-block">
          <div className="metric-number" style={{ color: '#6366f1' }}>{Math.round(data.confidencePct)}%</div>
          <div className="metric-label">Confidence</div>
          <div className="metric-bar-wrap">
            <div className="metric-bar" style={{ width: `${data.confidencePct}%`, background: '#6366f1' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskFactorsCard({ factors }) {
  return (
    <div className="xai-card">
      <div className="xai-card-header risk-header">
        <span className="header-icon">⚠️</span>
        <h3>Risk Factors</h3>
        <span className="count-badge risk-count">{factors.length}</span>
      </div>
      <div className="xai-card-body">
        {factors.length === 0 ? (
          <p className="empty-state">No significant risk factors detected.</p>
        ) : (
          <ul className="factor-list">
            {factors.map((f, i) => (
              <li key={i} className="factor-item">
                <span className="factor-label">{f.factor}</span>
                <div className="factor-weight-wrap">
                  <div className="factor-bar-bg">
                    <div className="factor-bar risk-bar" style={{ width: `${Math.round(f.weight * 100)}%` }} />
                  </div>
                  <span className="factor-pct">{Math.round(f.weight * 100)}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function PositiveIndicatorsCard({ indicators }) {
  return (
    <div className="xai-card">
      <div className="xai-card-header positive-header">
        <span className="header-icon">✅</span>
        <h3>Positive Indicators</h3>
        <span className="count-badge positive-count">{indicators.length}</span>
      </div>
      <div className="xai-card-body">
        {indicators.length === 0 ? (
          <p className="empty-state">No positive indicators found.</p>
        ) : (
          <ul className="indicator-list">
            {indicators.map((ind, i) => (
              <li key={i} className="indicator-item">
                <span className="indicator-dot" />
                {ind}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ModelInsightsCard({ contribution, breakdown }) {
  return (
    <div className="xai-card full-width-card">
      <div className="xai-card-header insights-header">
        <span className="header-icon">🧠</span>
        <h3>Model Insights</h3>
      </div>
      <div className="insights-body">
        <div className="contribution-section">
          <div className="contribution-title">📊 Model Contribution</div>
          <div className="contribution-bars">
            <div className="contrib-row">
              <span className="contrib-label">BiLSTM (Text)</span>
              <div className="contrib-bar-wrap">
                <div className="contrib-bar text-bar" style={{ width: `${contribution.text}%` }} />
              </div>
              <span className="contrib-pct">{contribution.text}%</span>
            </div>
            <div className="contrib-row">
              <span className="contrib-label">MLP (Metadata)</span>
              <div className="contrib-bar-wrap">
                <div className="contrib-bar meta-bar" style={{ width: `${contribution.metadata}%` }} />
              </div>
              <span className="contrib-pct">{contribution.metadata}%</span>
            </div>
          </div>
        </div>

        <div className="breakdown-section">
          <div className="contribution-title">🔍 Risk Breakdown</div>
          <div className="breakdown-pills">
            <div className="breakdown-pill">
              <div className="pill-value text-risk">{breakdown.text_risk}%</div>
              <div className="pill-label">Text Risk</div>
            </div>
            <div className="breakdown-arrow">+</div>
            <div className="breakdown-pill">
              <div className="pill-value meta-risk">{breakdown.metadata_risk}%</div>
              <div className="pill-label">Metadata Risk</div>
            </div>
            <div className="breakdown-arrow">=</div>
            <div className="breakdown-pill highlight-pill">
              <div className="pill-value total-risk">{breakdown.total_risk}%</div>
              <div className="pill-label">Total Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdditionalAnalysisCard({ scamTypes, missingFields }) {
  const hasScam = scamTypes.length > 0 && scamTypes[0] !== 'None detected'
  return (
    <div className="xai-card full-width-card">
      <div className="xai-card-header additional-header">
        <span className="header-icon">📋</span>
        <h3>Additional Analysis</h3>
      </div>
      <div className="additional-body">
        <div className="additional-col">
          <div className="additional-subtitle">🎯 Scam Type Detection</div>
          {hasScam ? (
            <div className="scam-tags">
              {scamTypes.map((s, i) => (
                <span key={i} className="scam-tag">{s}</span>
              ))}
            </div>
          ) : (
            <p className="no-scam-text">✅ No known scam patterns detected</p>
          )}
        </div>
        <div className="additional-divider" />
        <div className="additional-col">
          <div className="additional-subtitle">❌ Missing Fields</div>
          {missingFields.length === 0 ? (
            <p className="no-missing-text">✅ All key fields are present</p>
          ) : (
            <ul className="missing-list">
              {missingFields.map((f, i) => (
                <li key={i} className="missing-item">{f}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function FinalVerdictCard({ verdict, isFake }) {
  return (
    <div className={`verdict-card ${isFake ? 'verdict-fake' : 'verdict-real'}`}>
      <div className="verdict-card-header">
        <span className="header-icon">🔎</span>
        <h3>Final Verdict</h3>
      </div>
      <div className="verdict-card-body">
        <p className="verdict-text-block">{verdict}</p>
      </div>
    </div>
  )
}

// ─── Main Results Component ───────────────────────────────────────────────

function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const runImageAnalysis = useCallback(async (primaryImage, requestData) => {
    try {
      const fd = new FormData()
      fd.append('image', primaryImage)
      const response = await fetch(`${API_BASE}/analyze/image`, { method: 'POST', body: fd })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Image analysis failed')
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      setAnalysisResults(mapAnalysisResult(data, requestData))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to complete analysis.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const cachedResult = sessionStorage.getItem('analysisResult')
    const sessionAnalysisData = sessionStorage.getItem('analysisData')
    const requestData = sessionAnalysisData ? JSON.parse(sessionAnalysisData) : {}

    if (cachedResult) {
      setAnalysisResults(mapAnalysisResult(JSON.parse(cachedResult), requestData))
      setIsLoading(false)
      return
    }

    const stateInput = location.state?.analysisInput
    const primaryImage = stateInput?.primaryImage
    if (!primaryImage) {
      if (!stateInput && !sessionAnalysisData) { navigate('/dashboard'); return }
      setErrorMessage('No analysis result found. Please try again.')
      setIsLoading(false)
      return
    }
    runImageAnalysis(primaryImage, requestData)
  }, [location.state, navigate, runImageAnalysis])

  if (isLoading) {
    return (
      <main className="results-container">
        <div className="loading-section">
          <div className="loading-spinner"><div className="spinner" /></div>
          <h2>Analyzing Job Posting</h2>
          <p>Our AI is scanning the job description for risk signals...</p>
        </div>
      </main>
    )
  }

  if (!analysisResults) {
    return (
      <main className="results-container">
        <div className="container">
          <div className="error-section">
            <h2>Something went wrong</h2>
            <p>{errorMessage || 'Please try again with a new job posting'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Analyze Another Job</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="results-container">
      <div className="results-header">
        <div className="container">
          <h1>AI Analysis Complete</h1>
          <p>Explainable breakdown of the job posting analysis</p>
        </div>
      </div>

      <div className="container xai-dashboard">

        {/* 1 — Top Summary */}
        <SummaryCard data={analysisResults} />

        {/* 2 — Risk vs Positive side-by-side */}
        <div className="two-col-grid">
          <RiskFactorsCard factors={analysisResults.riskFactors} />
          <PositiveIndicatorsCard indicators={analysisResults.positiveIndicators} />
        </div>

        {/* 3 — Model Insights */}
        <ModelInsightsCard
          contribution={analysisResults.modelContribution}
          breakdown={analysisResults.riskBreakdown}
        />

        {/* 4 — Additional Analysis */}
        <AdditionalAnalysisCard
          scamTypes={analysisResults.scamType}
          missingFields={analysisResults.missingFields}
        />

        {/* 5 — Final Verdict */}
        <FinalVerdictCard verdict={analysisResults.finalVerdict} isFake={analysisResults.isFake} />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => {
              sessionStorage.removeItem('analysisResult')
              sessionStorage.removeItem('analysisData')
              navigate('/dashboard')
            }}
          >
            Analyze Another Job
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </main>
  )
}

export default Results
